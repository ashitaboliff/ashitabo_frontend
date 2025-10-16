# あしたぼ フロントエンド

信州大学／長野県立大学の軽音サークル「あしたぼ」の活動をオンラインで支援するフロントエンドです。Next.js 15とTypeScriptで構築されています。予約管理、動画配信、ガチャ演出など複数ドメインを一つのアプリケーションで提供します。とくに `/features/booking` はドメイン分離やデータフローが最も整理されているため、本ドキュメントでも重点的に紹介します。

## プロジェクト概要

- **目的**: 音楽スタジオの予約コマ管理を中心に、バンド活動をサポートする情報発信・管理機能を提供します。
- **構成**: Next.js App Router によるページ構成、ドメインごとに切り出された `features` ディレクトリ、再利用可能な UI は `components` へ集約。
- **設計思想**: サーバーアクションによる API 呼び出しと SWR によるクライアントキャッシュを組み合わせ、双方向なデータ更新と UX を両立します。

## 使用技術

- **フレームワーク / 言語**: Next.js 15 (App Router), React 19, TypeScript 5
- **スタイリング**: Tailwind CSS 4, DaisyUI, カスタムコンポーネント
- **フォーム / バリデーション**: React Hook Form, Zod
- **データ取得**: SWR, Next.js Server Actions, fetch API ラッパー (`src/lib/api`)
- **UI 補助**: GSAP（ガチャ演出アニメーション）, react-icons, MDX (ルール/告知表示)
- **ユーティリティ**: date-fns, React YouTube, SWR, 自前の `useFeedback` フラッシュ UI
- **品質管理**: Biome (lint & format), Vitest

## ディレクトリ構造

```text
frontend/
├─ src/
│  ├─ app/                  # App Router のページ・レイアウト（サーバーコンポーネント中心）
│  ├─ components/           # ドメイン横断の UI atoms/molecules/organisms
│  ├─ features/             # ドメイン単位のまとまり（booking, band, video など）
│  ├─ hooks/                # 共通カスタムフック
│  ├─ lib/                  # API ラッパー・フォント・R2 ストレージなどの基盤層
│  ├─ types/                # アプリ共通の型定義
│  └─ utils/                # 日付、キャッシュ制御、ロガー等のユーティリティ
├─ public/                  # 画像・静的アセット
├─ package.json             # スクリプトと依存ライブラリ
├─ biome.json               # Biome 設定
└─ vitest.config.ts        # ユニットテスト設定
```

### `/features/booking` 詳細

```text
src/features/booking/
├─ actions.ts              # サーバーアクション。API 呼び出し＋再検証タグ管理
├─ constants.ts            # ドメイン固有定数（表示範囲・タイムスロット等）
├─ fetcher.ts              # SWR 用のキー生成とフェッチャー
├─ hooks.ts                # 週ナビゲーションや SWR ラッパー
├─ schema.ts               # Zod スキーマ（認証/作成/編集フォーム）
├─ service.ts              # API レスポンスからドメイン型への変換
├─ types.ts                # Booking ドメインの TypeScript 型
├─ components/             # 画面 UI（MainPage, Calendar, Create など）
└─ content/booking-rule.mdx# 使い方モーダルに表示する MDX
```

`booking` が模範的な理由:

- **役割分離**が明確: `actions` でサーバーサイド処理、`hooks` でクライアント状態、`service` で DTO→ドメイン変換。
- **キャッシュ戦略**が一貫: `constants` と `utils/calendarCache.ts` により SWR キャッシュと Next.js のタグ再検証を同期。
- **フォーム UX**: Zod + React Hook Form による型安全な入力と、`useFeedback` によるユーザー通知。
- **コンテンツ管理**: `booking-rule.mdx` を `MDXRemote` で表示し、非同期でもレイアウトを阻害しない設計。

## データフロー（予約ドメイン）

1. `src/app/booking/page.tsx`（サーバーコンポーネント）が初期表示日とフラッシュメッセージを組み立て、`MainPageLayout` と `MainPage` を描画。
2. `MainPage`（クライアントコンポーネント）は `useBookingWeekNavigation` で週単位の表示制御、`useBookingCalendarData` で期間データを取得。
3. `useBookingCalendarData` → `buildBookingRangeKey` → `bookingRangeFetcher` → `getBookingByDateAction`（サーバーアクション）という流れでバックエンド API を呼び出し、`service.ts` でドメイン型へ整形。
4. 取得した `BookingResponse` は `BookingCalendar` がタイムスロット単位のセルへ描画し、空きコマは新規予約画面へ、既存予約は詳細ページへ誘導。
5. 予約作成 (`Create.tsx`)・更新・削除時には `mutateBookingCalendarsForDate` で SWR キャッシュを更新し、同時に `revalidateTag` で App Router のサーバーレンダリング結果も同期。
6. 手動リフレッシュ (`RefreshButton`) や利用ルールモーダル (`MainPageLayout`) が補助導線を提供。

この一連の流れにより、SSR→CSR→再検証まで一貫した UX とデータ整合性を実現しています。

## 主な機能

- **部室予約管理** (`/booking`): 週間カレンダー表示、予約作成・編集・履歴表示、パスワード認証、再検証タグを活用したリアルタイム更新。
- **バンド管理** (`/features/band`): メンバー追加・編集モーダル、バンド一覧 UI。 **未実装**
- **動画配信** (`/features/video`): 検索フォーム、タグ編集、詳細ページ、YouTube 埋め込み。
- **ガチャ演出** (`/features/gacha`): GSAP を利用したカードアニメーション、レアリティ別エフェクト、プレビュー/本番ポップアップ。
- **スケジュール管理** (`/features/schedule`): スケジュール作成フォーム、サーバーアクションを使った予約連携。
- **ユーザー/認証** (`/features/user`, `/features/auth`): プロフィール表示やログイン周辺 UI。

## 開発環境のセットアップ

1. Node.js 20 以上を推奨（Next.js 15 の LTS サポート範囲）。
2. 依存関係のインストール:
   ```bash
   npm install
   ```
3. 開発サーバー起動:
   ```bash
   npm run dev
   ```
4. 必要に応じて環境変数 `NEXT_PUBLIC_APP_URL` を設定（デフォルトは `http://localhost:3000`）。

### よく使うスクリプト

- `npm run check` : Biome による lint + format チェック
- `npm run lint` / `npm run lint:fix` : lint のみ実行 / 自動修正
- `npm run format` / `npm run format:fix` : フォーマッター
- `npm run test` : Vitest のユニットテスト
- `npm run build` : 本番ビルド

## 開発手法と命名規則

- **ドメイン駆動の配置**: ドメイン特有のロジック・UI は `src/features/<domain>` にまとめ、App Router からは必要なコンポーネントとアクションのみを公開。
- **ファイル命名**:
  - React コンポーネント: `PascalCase.tsx`
  - カスタムフック: `useBookingWeekNavigation` のように `use` 接頭辞 + `camelCase`
  - 定数: `BOOKING_VIEW_RANGE_DAYS` のように `SCREAMING_SNAKE_CASE`
  - サーバーアクション: `createBookingAction` のように動詞 + `Action`
  - Zod スキーマ: `schema.ts` に集約し、`xxxSchema` と `xxxFormValues` を併記
- **スタイリング**: Tailwind クラスを基本とし、共通レイアウトは `components/ui` にある分子・原子コンポーネントで再利用。
- **型安全性**: API レスポンスは `service.ts` でドメイン型へ変換し、生のデータをコンポーネントに渡さない。
- **状態管理**: アプリ全体でグローバルステートは極力避け、SWR とカスタムフックで局所的に管理。モーダルやフィードバックはコンポーネント単位で完結。

## 品質管理の流れ

- **Lint / Format**: 変更前後で `npm run check` を実行し、Biome によるコードスタイルを維持。
- **テスト**: 新規ロジック追加時は `npm run test` を推奨。Vitest の設定は `vitest.config.ts` に集約。
- **サーバーアクションの再検証**: 予約周りの変更では `revalidateTag` と `mutateBookingCalendarsForDate` の呼び出し漏れに注意し、UI とサーバーキャッシュの整合性を確認。
- **アクセシビリティ**: SVG やモーダルなどは aria 属性を明示し、特に `/features/booking` のカレンダーはキーボード操作でも情報が伝わるよう `aria-hidden` やボタン属性を利用。

この README を起点に、まずは `/features/booking` のコードベースを理解すると全体の設計パターンが掴みやすくなります。他ドメインも同じ構造で拡張しやすいよう設計されています。
