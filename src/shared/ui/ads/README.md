# Google AdSense コンポーネント

Google AdSenseの広告を表示するためのコンポーネント群です。

## 環境変数の設定

`.env.local` ファイルに以下の環境変数を設定してください：

```env
NEXT_PUBLIC_ADS_ID="ca-pub-XXXXXXXXXXXXXXXX"
```

## 開発環境でのモック広告

**開発環境（`NODE_ENV=development`）では自動的にモック広告が表示されます。**

モック広告の特徴：
- クリックで異なるページに遷移する（ホーム、予約、動画、スケジュールなど）
- 広告スロットIDに応じて異なる色とリンク先が表示される
- 実際のAdSense APIを呼び出さないため、動作確認が容易
- 広告のフォーマットや配置をテスト可能

本番環境（`NODE_ENV=production`）では実際のGoogle AdSense広告が表示されます。

## セットアップ（推奨）

アプリケーション全体でAdSenseを使用する場合、レイアウトファイルで一度だけ設定します。

```tsx
// app/layout.tsx
import { AdSenseProvider } from '@/shared/ui/ads'
import PublicEnv from '@/shared/lib/env/public'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <AdSenseProvider clientId={PublicEnv.NEXT_PUBLIC_ADS_ID || ''}>
          {children}
        </AdSenseProvider>
        {/* AdSenseスクリプトは既にlayout.tsxで読み込まれています */}
      </body>
    </html>
  )
}
```

### セットアップの利点

1. **AdSenseProvider**: `clientId`を各コンポーネントで指定する必要がなくなる
2. **スクリプト読み込み**: layout.tsxで一度だけ読み込まれ、重複を防ぐ
3. **開発環境対応**: 自動的にモック広告が表示され、テストが容易

## 基本的な使い方

### 1. 単体広告コンポーネント（AdSense）

個別の広告スロットを直接指定して広告を表示します。

```tsx
import { AdSense } from '@/shared/ui/ads'

// AdSenseProviderを使用している場合（推奨）
function MyPage() {
  return (
    <AdSense
      adSlot="1234567890"
      adFormat="auto"
      placement="article-top"
    />
  )
}

// clientIdを直接指定する場合
function MyPageAlt() {
  return (
    <AdSense
      clientId={process.env.NEXT_PUBLIC_ADS_ID!}
      adSlot="1234567890"
      adFormat="auto"
      placement="article-top"
    />
  )
}
```

#### プロパティ

- `clientId` (オプション): AdSenseクライアントID（例: `ca-pub-XXXXXXXXXXXXXXXX`） - 省略時はAdSenseProviderから取得
- `adSlot` (必須): 広告スロットID
- `adFormat` (オプション): 広告フォーマット（`auto`、`rectangle`、`vertical`、`horizontal`、`fluid`）デフォルト: `auto`
- `adLayout` (オプション): 広告レイアウト（`in-article` または `undefined`）
- `adStyle` (オプション): カスタムスタイル（CSSPropertiesオブジェクト）
- `placement` (オプション): 配置名（イベント識別用）
- `enableClickDetection` (オプション): クリック検知を有効化（デフォルト: `false`）
- `clickThreshold` (オプション): クリック判定の閾値（ミリ秒、デフォルト: `3000`）

### 2. プリセット広告（Ads）

共通の広告配置を `Ads.tsx` にまとめています。ページ側では配置名を指定するだけで広告を表示できます。

```tsx
import { Ads } from '@/shared/ui/ads'

function BookingLayout() {
  return (
    <div>
      <Ads placement="Field" />
      {/* ... */}
    </div>
  )
}
```

#### 既定の配置

| placement | adSlot     | format | layoutKey        | wrapperClass                       |
|-----------|------------|--------|------------------|------------------------------------|
| `Field`   | 2297104274 | fluid  | `-fb+5w+4e-db+86` | `my-4 flex justify-center`         |
| `Menu`    | 1843902033 | fluid  | `-hl+a-w-1e+66`   | `flex justify-center`              |

配置ごとの設定は `Ads.tsx` の `ADS_CONFIG` を編集すれば拡張できます。`className` / `adStyle` / `enableClickDetection` / `clickThreshold` は `Ads` コンポーネントの props で上書きが可能です。

## イベント検知

### 広告表示イベント

広告が表示されたタイミングでイベントが発火されます。

```tsx
import { addAdDisplayedListener } from '@/shared/lib/ads'
import type { AdDisplayEventDetail } from '@/shared/lib/ads'

useEffect(() => {
  const cleanup = addAdDisplayedListener((event: CustomEvent<AdDisplayEventDetail>) => {
    console.log('広告が表示されました:', event.detail)
    // { slot: "1234567890", placement: "article-top" }
  })

  return cleanup
}, [])
```

### 広告クリック可能性イベント

ユーザーが一定時間ページを離れた後に戻ってきた場合、広告がクリックされた可能性があると判定されます。

```tsx
import { addAdPossibleClickListener } from '@/shared/lib/ads'
import type { AdPossibleClickEventDetail } from '@/shared/lib/ads'

useEffect(() => {
  const cleanup = addAdPossibleClickListener((event: CustomEvent<AdPossibleClickEventDetail>) => {
    console.log('広告がクリックされた可能性:', event.detail)
    // { slot: "1234567890", placement: "article-top", awayDuration: 5000 }
  })

  return cleanup
}, [])
```

**注意**: iframe越しの直接的なクリック検知はGoogleのポリシーで禁止されています。この機能は、フォーカス復帰ベースの間接的な検知のみを提供します。

## 実装例

### 記事ページでの使用例

```tsx
'use client'

import { Ads } from '@/shared/ui/ads'

export default function ArticlePage() {
  return (
    <article>
      <h1>記事タイトル</h1>

      <Ads placement="Field" />

      <div>記事コンテンツ...</div>

      {/* 必要に応じてAds.tsxに新しい配置を追加できます */}
      {/* <Ads placement="ArticleMiddle" /> */}

      <div>記事コンテンツ続き...</div>

      <Ads placement="Field" />
    </article>
  )
}
```

任意の配置を追加したい場合は `Ads.tsx` の `ADS_CONFIG` に項目を追記し、`placement` 名を新設してください。

## Googleポリシー遵守のポイント

1. **iframe操作の禁止**: 広告のiframe内のDOM操作は禁止されています
2. **カスタムクリックイベントの禁止**: 不正クリックとみなされる恐れがあります
3. **表示・滞在時間トラッキング**: 広告行動分析として合法的です
4. **GDPR対応**: 欧州ユーザー向けには同意取得後に広告をロードする必要があります

## パフォーマンス最適化

- 広告スクリプトは`afterInteractive`で遅延読み込みされ、LCPへの影響を軽減しています
- SSRでは広告は表示されません（クライアントサイドのみ）
- 検索クローラ向けに広告を除外してもSEOに悪影響はありません
