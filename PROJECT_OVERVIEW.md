# Ashitabo Frontend Overview

## 1. プロジェクトの目的
信州大学／長野県立大学の軽音サークル「あしたぼ」の活動をオンラインで支援するフロントエンドです。メンバーは練習室の予約、イベントの日程調整、過去ライブ動画の検索、ガチャ機能によるエンゲージメントを一つの UI で完結できます。管理者は同じ UI からユーザー権限や予約禁止日を管理します。

## 2. ランタイム構成
- **Next.js 15 (App Router)** — React サーバーコンポーネントとクライアントコンポーネントを併用しつつ、各ページを機能単位のモジュールに分割しています。
- **BFF プロキシ (`/api/[[...backend]]`)** — すべてのデータ取得は `http://localhost:8787` で稼働する Hono バックエンドへフォワードします。プロキシは cookies / API-Key を引き継ぎつつ、圧縮ヘッダーを取り除いてレスポンスを再エンコードしません。
- **Feature-driven modules** — `src/features/*` に機能ごとの UI ・データ取得・型定義をカプセル化。App Router のページは極力軽量なサーバーコンポーネントとしてこれらを委譲します。

## 3. データフロー / API の呼び出し
- 共通の HTTP クライアントは `src/lib/api/client.ts` に集約。`apiRequest<T>()` が `ApiResponse<T>` を返し、呼び出し側は成功／失敗を分岐しやすくなっています。
- 各機能の `components/actions.ts` が BFF 経由で Hono にアクセスします。
  - **Booking**: `/booking`, `/booking/logs`, `/booking/{id}`, `/booking/{id}/verify` など。
  - **Schedule**: `/schedule`, `/schedule/{id}`, `/schedule/users`。
  - **Video**: `/video/search`, `/video/playlists`, `/video/tags`。
  - **Gacha**: `/gacha/users/{userId}`, `/gacha/users/{userId}/by-src`。
  - **Admin**: `/admin/users`, `/admin/padlocks`, `/admin/booking-bans`。
- データ取得は以下のポリシーを採用しています。
  - 初期表示はサーバーコンポーネント側で `fetch`→BFF→Hono を呼び、静的キャッシュ／ISR タグを柔軟に指定。
  - クライアント側の再取得が必要な場所のみ `SWR` を使用（例: 予約カレンダーの週移動、ユーザーのログ一覧）。

## 4. 機能別ディレクトリ構成
| ディレクトリ | 役割 | 代表的コンポーネント / フロー |
|--------------|------|--------------------------------|
| `src/features/booking` | 予約カレンダーと CRUD | `MainPage` (カレンダー表示), `EditForm`, `actions.ts` (予約作成/更新/削除/検証) |
| `src/features/schedule` | 日程調整 | `CreatePage`, `IdPage`, `actions.ts` (スケジュール作成、詳細取得) |
| `src/features/video` | YouTube アーカイブ検索 | `VideoListPage`, `VideoSearchForm`, `actions.ts` (検索、タグ更新) |
| `src/features/user` | プロフィール・ログ | `UserPageLayout`, `BookingLogs`, `GachaLogs` |
| `src/features/gacha` | ガチャ UI / コンテキスト | `GachaMainPopup`, `useGachaPlayManager`, `actions.ts` |
| `src/features/admin` | 管理者向け設定 | `UserManage`, `PadLockEdit`, `BanBooking` |
| `src/features/auth` | 認証サポート | `UnifiedAuth`, `AuthPage`, `components/actions.ts` (統合セッション取得) |
| `src/lib` | 共通ユーティリティ | `api/`, `auth/`, `r2/`, `fonts/` 等 |

## 5. 認証とセッション管理
- バックエンドは Auth.js を利用したセッション Cookie (`authjs.session-token`) を返却します。
- フロントエンドでは `AuthPage`（サーバーコンポーネント）が `/api/auth/session`→`/users/{userId}/profile` を順に呼び出し、統合状態を `UnifiedAuthResult` として子コンポーネントに渡します。
- クライアント側でセッションが必要な場合は `useSession()`（SWR ベース）を利用して最新の `UnifiedAuthResult` を再取得します。

## 6. ビルド / 開発フロー
- `npm run dev` — Next.js 開発サーバー。
- `npm run build` — 本番ビルド。
- `npm run ts` — TypeScript 型チェック。
- `npm run lint` — ESLint。
- プロキシ先の Hono バックエンドを `http://localhost:8787` で起動してからフロントエンドを立ち上げる必要があります。

## 7. 必須環境変数
| 変数名 | 説明 | 例 |
|--------|------|----|
| `NEXT_PUBLIC_API_BASE_URL` | BFF がフォワードするバックエンドのベース URL。未設定時は `http://localhost:8787`。 | `https://api.example.com` |
| `NEXT_PUBLIC_API_KEY` | バックエンドが要求する API キー。ヘッダ `X-API-Key` として付与。 | `xxxx-xxxx` |
| `NEXT_PUBLIC_R2_PROXY_BASE_URL` | R2 署名付き URL 生成が未実装のときのプレースホルダー。 | `/api/storage` |

## 8. 最近の改善と今後の課題
- `/api/[[...backend]]` のヘッダー調整で `ERR_CONTENT_DECODING_FAILED` を解消。
- 動画リストのフィルター更新は `startTransition` を使用し、不要な `router.refresh()` を廃止してレンダリング負荷を削減。
- Booking カレンダーのクエリパラメータを ISO 形式に統一。
- 今後は
  - SWR と App Router のキャッシュ層を使い分け、リスト表示の SSR → CSR 差分を最小化する。
  - R2 からの画像署名発行 API を実装し、プレースホルダー経由のリダイレクトを廃止する。
  - 主要ページへの計測（Next.js Flight profiler / Web Vitals）を導入し、パフォーマンス改善サイクルを定常化する。
