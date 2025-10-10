# 2025-10-03 フロントエンド性能調査レポート
# このドキュメントは古くなっているので参考にしないでください
## 1. 調査方法

- App Router ページ構成と `SWR` 呼び出し箇所を棚卸しし、データ取得の重複・再レンダリング経路を精査。
- ローカル開発サーバーでのブラウザ DevTools ログ（提供ログ: `/api/booking` の `ERR_CONTENT_DECODING_FAILED`、`/api/[[...backend]]` の同期パラメータ警告）を解析。
- `rg 'use client'`・`rg router.refresh` 等でクライアントコンポーネント依存を把握し、再レンダリングが集中している箇所を特定。

## 2. 主なボトルネック

1. **API プロキシのエンコーディング競合**
   - `/api/[[...backend]]/route.ts` が `accept-encoding` を `gzip, deflate, br` に固定しており、バックエンド→フロントエンドで二重圧縮状態となっていた。
   - ブラウザ側では `ERR_CONTENT_DECODING_FAILED` が常に発生し、再試行＆描画ブロックが発生。
2. **ルーティングパラメータの非同期解決漏れ**
   - Next.js 15 では `context.params` が `Promise` を返却するが、同期的に `buildTargetUrl()` に渡していたため `params.backend` の参照で警告 → 502 応答がログに出力されていた。
3. **動画リスト (`VideoListPage`) の二重フェッチ**
   - フィルタ更新のたびに `router.replace()` + `router.refresh()` を同期実行しており、同一検索に対して App Router が 2 度サーバーでレンダリング。他にも 4 回の `useEffect` が props→state の再同期を行っており、描画負荷と GC が増大していた。
4. **予約カレンダーのクエリフォーマット不整合**
   - 週移動時に `end=Wed Oct ...` のようなロケール依存文字列が送信され、バックエンドのキャッシュヒット率が下がっていた。

## 3. 実施した改善

- プロキシヘッダーを整理し、`accept-encoding` / `content-length` / `content-encoding` を除去。Cookies は明示的に転送し、`fetch` 側で `credentials: 'include'` を設定。
- `context.params` を `await` するよう修正し、Next.js の非同期 Dynamic Route ルールに準拠。
- `VideoListPage` を props ドリブンな描画に再設計。`startTransition` でクエリ更新し、`router.refresh()` を廃止。これにより 1 度の遷移で 1 度のレンダリングとなり、`useEffect` の再同期負荷を削除。
- 予約カレンダーの週移動ロジックを ISO 形式の日付文字列に統一し、キー生成も `[start, end]` の文字列配列に変更。

## 4. 残存課題と推奨施策

- **SSR キャッシュ最適化** — `/video` 検索結果は現在 `no-store` で取得している。検索条件が同じ場合に `next: { revalidate: 60, tags: ['video-search-<key>'] }` のようにキャッシュを追加する余地がある。
- **SWR の一元管理** — ユーザーページでは予約ログ・ガチャログがそれぞれ `SWR` を保持している。`SWRConfig` の `fallback` を利用してサーバー取得データを初期値として渡すことで初回ロードのローディング表示を削減できる。
- **計測の導入** — Web Vitals や Flight Profiler を用いた具体的な LCP / TTFB 計測がまだない。Next.js 15 の `routeSegmentConfig` と合わせて計測仕組みを整えると効果検証が容易になる。
- **画像配信の最適化** — R2 署名付き URL は現状プレースホルダーを返すのみ。バックエンドの署名 API を実装し、`next/image` の最適化を有効化することでユーザーページのカルーセル描画を高速化できる。
