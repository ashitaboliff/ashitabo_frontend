# エラーハンドリング実装ガイド

## 概要

このドキュメントでは、バックエンドAPIからのエラーを適切にフォーマットし、ユーザーに分かりやすいメッセージを表示する仕組みについて説明します。

## アーキテクチャ

### データフロー

```
Backend API
    ↓ (エラーレスポンス)
apiRequest (src/shared/lib/api/index.ts)
    ↓ (ApiError)
Actions (src/domains/*/api/*Actions.ts)
    ↓ (ApiResponse<T>)
UI Component
    ↓ (useFeedback.showApiError)
formatErrorMessage (src/shared/lib/error/errorFormatter.ts)
    ↓ (FormattedErrorMessage)
FeedbackMessage (src/shared/ui/molecules/FeedbackMessage.tsx)
    ↓
User (画面表示)
```

## 主要コンポーネント

### 1. errorFormatter.ts

HTTPステータスコードとエラーメッセージの内容に基づいて、ユーザー向けのエラーメッセージを生成します。

```typescript
export interface FormattedErrorMessage {
  title: string        // エラーのタイトル
  message: string      // 具体的なエラー内容
  action?: string      // ユーザーが取るべき行動
  details?: string     // 技術的な詳細情報
}
```

### 2. useFeedback フック

エラーメッセージを管理し、フォーマットされたメッセージを提供します。

```typescript
const messageFeedback = useFeedback()

// API エラーを表示
messageFeedback.showApiError(apiError)

// 成功メッセージを表示
messageFeedback.showSuccess('操作が成功しました')

// カスタムエラーメッセージを表示
messageFeedback.showError('エラーメッセージ', { 
  title: 'カスタムタイトル',
  details: '詳細情報'
})

// フィードバックをクリア
messageFeedback.clearFeedback()
```

### 3. FeedbackMessage コンポーネント

フォーマットされたエラーメッセージを視覚的に表示します。

```tsx
<FeedbackMessage 
  source={messageFeedback.feedback}
  className="mb-4"
/>
```

## エラーメッセージの例

### 400 Bad Request

**従来の表示**:
```
(400) 予約の作成に失敗しました。
```

**改善後の表示**:
```
タイトル: 入力内容に問題があります
メッセージ: 入力された情報に誤りがあります。
アクション: 入力内容を確認して、もう一度お試しください。
```

### 401 Unauthorized (パスワードエラー)

**従来の表示**:
```
(401) 予約の認証に失敗しました。
```

**改善後の表示**:
```
タイトル: 認証が必要です
メッセージ: パスワードが正しくありません。
アクション: 正しいパスワードを入力してください。
```

### 409 Conflict (予約の重複)

**従来の表示**:
```
(409) 予約の作成に失敗しました。
```

**改善後の表示**:
```
タイトル: データの競合が発生しました
メッセージ: この時間帯は既に予約されています。
アクション: 別の時間帯を選択してください。
```

### 404 Not Found

**従来の表示**:
```
(404) データの取得に失敗しました。
```

**改善後の表示**:
```
タイトル: データが見つかりません
メッセージ: 指定されたデータが見つかりませんでした。
アクション: URLやIDが正しいか確認してください。削除された可能性もあります。
```

### 500 Internal Server Error

**従来の表示**:
```
(500) サーバーエラーが発生しました。
```

**改善後の表示**:
```
タイトル: サーバーエラーが発生しました
メッセージ: サーバー側で問題が発生しています。
アクション: 時間をおいて再度お試しください。問題が続く場合は管理者にお問い合わせください。
```

## コンテキスト認識

エラーフォーマッターは、エラーメッセージの内容を解析して、適切なメッセージを自動選択します。

### 認識されるコンテキスト

1. **予約関連** (`booking`, `予約`)
   - 競合: 「この時間帯は既に予約されています」
   - バリデーション: 「日時、バンド名などの入力内容を確認してください」

2. **認証関連** (`password`, `パスワード`)
   - 「パスワードが正しくありません」

3. **バンド関連** (`band`, `バンド`)
   - 競合: 「同じ名前のバンドが既に存在します」

4. **ユーザー関連** (`user`, `ユーザー`)
   - 未発見: 「ユーザーが見つかりません」

5. **ファイル関連** (`file`, `image`, `video`, `ファイル`, `画像`, `動画`)
   - 「ファイル形式またはサイズに問題があります」

6. **レート制限** (`rate limit`, `too many`)
   - 「しばらく時間をおいてから再度お試しください」

## 実装例

### Server Action での使用

```typescript
export const createBookingAction = async (data) => {
  const res = await apiPost('/booking', { body: data })
  
  if (!res.ok) {
    // withFallbackMessage はフォールバック用の汎用メッセージを追加
    // 実際の表示は formatErrorMessage で整形される
    return withFallbackMessage(res, '予約の作成に失敗しました。')
  }
  
  return createdResponse(res.data)
}
```

### Client Component での使用

```tsx
const BookingForm = () => {
  const messageFeedback = useFeedback()
  
  const onSubmit = async (data) => {
    messageFeedback.clearFeedback()
    
    try {
      const res = await createBookingAction(data)
      
      if (res.ok) {
        messageFeedback.showSuccess('予約が完了しました。')
      } else {
        // showApiError が自動的に formatErrorMessage を呼び出す
        messageFeedback.showApiError(res)
      }
    } catch (error) {
      messageFeedback.showError(
        '予約の作成中にエラーが発生しました。',
        { details: error instanceof Error ? error.message : String(error) }
      )
    }
  }
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FeedbackMessage source={messageFeedback.feedback} />
      {/* フォームフィールド */}
    </form>
  )
}
```

## テスト

エラーフォーマッターとuseFeedbackフックには包括的なテストが用意されています。

```bash
npm run test
```

- `src/shared/lib/error/errorFormatter.test.ts` - 17テスト
- `src/shared/hooks/useFeedback.test.ts` - 11テスト

## 拡張方法

### 新しいコンテキストの追加

`errorFormatter.ts` の `customizeMessageByContext` 関数に新しいケースを追加します。

```typescript
// スケジュール関連のエラー
if (lowerMessage.includes('schedule') || lowerMessage.includes('スケジュール')) {
  if (status === StatusCode.CONFLICT) {
    return {
      ...baseMessage,
      message: 'この日時には既にスケジュールが登録されています。',
      action: '別の日時を選択してください。',
    }
  }
}
```

### 新しいステータスコードの追加

`errorFormatter.ts` の `getStatusCodeMessage` 関数に新しいケースを追加します。

```typescript
case StatusCode.TOO_MANY_REQUESTS:
  return {
    title: 'リクエストが多すぎます',
    message: '短時間に多くのリクエストが送信されました。',
    action: 'しばらく時間をおいてから再度お試しください。',
  }
```

## ベストプラクティス

1. **常に `useFeedback` を使用する**: エラー表示には必ず `useFeedback` フックを使用してください。

2. **フォールバックメッセージを提供**: `withFallbackMessage` で汎用的なメッセージを提供しておき、フォーマッターが適切なメッセージに変換します。

3. **詳細情報を保持**: バックエンドから返されるエラー詳細は失わないようにしてください。デバッグに役立ちます。

4. **ユーザーテスト**: 新しいエラーメッセージを追加したら、実際のユーザーに分かりやすいかテストしてください。

5. **一貫性を保つ**: 似たようなエラーには似たようなメッセージ構造を使用してください。

## トラブルシューティング

### エラーメッセージが表示されない

- `FeedbackMessage` コンポーネントが正しくレンダリングされているか確認
- `messageFeedback.feedback` が null でないか確認
- `showApiError` が正しく呼ばれているか確認

### カスタマイズされたメッセージが表示されない

- エラーメッセージの内容に認識されるキーワードが含まれているか確認
- `errorFormatter.test.ts` に新しいテストケースを追加して動作確認

### 型エラーが発生する

- `ApiError` または `FeedbackMessageType` の型が正しく使用されているか確認
- TypeScript のバージョンが互換性があるか確認
