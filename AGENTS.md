## プロジェクト概要

このプロジェクトは信州大学／長野県立大学の軽音サークル「あしたぼ」の活動をオンラインで支援する Next.js 15 アプリケーションです。

- **主な機能**: 部室予約管理、バンド管理、動画配信、ガチャ演出、スケジュール管理
- **言語**: TypeScript, React 19
- **スタイリング**: Tailwind CSS 4 + DaisyUI
- **状態管理**: SWR + Next.js Server Actions

## 注意事項

- 出力は必ず日本語で行ってください。
- 技術的な内容に集中し、冗長な説明は避けてください。
- コード例を含む場合は、適切なコードブロックで囲んでください。
- タスクを適切に分割し、作業終了後の最終出力に残ったタスクを、その詳細とともにリストアップしてください。
- Context 7などを適切に参照し、最新の情報を反映してください。

## アーキテクチャの原則

### 1. ドメイン駆動設計

```
src/features/<domain>/
├─ actions.ts          # サーバーアクション（API呼び出し・再検証タグ管理）
├─ constants.ts        # ドメイン固有定数
├─ fetcher.ts          # SWR キー生成・フェッチャー
├─ hooks.ts            # クライアント状態管理
├─ schema.ts           # Zod バリデーションスキーマ
├─ service.ts          # DTO → ドメイン型の変換
├─ types.ts            # TypeScript 型定義
└─ components/         # UI コンポーネント
```

**重要**: `/features/booking` は最も規律ある実装例です。新機能追加時は booking の構造を参考にしてください。

### 2. データフロー

**SSR → CSR → 再検証**の一貫したフロー:

1. **サーバーコンポーネント** (`app/` 配下) が初期表示データ・フラッシュメッセージを準備
2. **クライアントコンポーネント** (`use client`) が SWR でデータ取得・表示
3. **サーバーアクション** が API 呼び出し＋`revalidateTag` で再検証
4. **SWR キャッシュ** (`mutate*` 関数) で即座に UI 更新

```
Page (Server) 
  → Component (Client, use client)
    → useBookingCalendarData (SWR)
      → getBookingByDateAction (Server Action)
        → backend API call
        → response + revalidateTag
      → response to domain type (service.ts)
    → display on Calendar
```

### 3. 命名規則

| 対象 | 規則 | 例 |
|------|------|------|
| React コンポーネント | PascalCase | `BookingCalendar.tsx` |
| カスタムフック | `use` + camelCase | `useBookingWeekNavigation` |
| サーバーアクション | 動詞 + `Action` | `createBookingAction`, `getBookingByDateAction` |
| 定数 | SCREAMING_SNAKE_CASE | `BOOKING_VIEW_RANGE_DAYS` |
| Zod スキーマ | `xxxSchema` + `xxxFormValues` | `createBookingSchema`, `createBookingFormValues` |
| SWR フェッチャー | `xxxFetcher` | `bookingRangeFetcher` |
| キー生成関数 | `build` + `xxxKey` | `buildBookingRangeKey` |
| キャッシュ更新関数 | `mutate` + `xxxs` (複数形) | `mutateBookingCalendarsForDate` |

## 開発時のチェックリスト

### 新機能追加

- [ ] `src/features/<domain>/types.ts` に ドメイン型 を定義
- [ ] `src/features/<domain>/schema.ts` に Zod スキーマ を定義
- [ ] `src/features/<domain>/service.ts` に API レスポンス → ドメイン型の変換ロジック を実装
- [ ] `src/features/<domain>/actions.ts` にサーバーアクション を実装（`revalidateTag` を忘れずに）
- [ ] `src/features/<domain>/hooks.ts` に SWR ラッパー を実装
- [ ] `src/features/<domain>/components/` に UI を実装
- [ ] `src/app/<domain>/page.tsx` から上記コンポーネント・アクション を使用

### コンポーネント実装

- **マークアップ**: Tailwind CSS をクラスベースで適用
- **再利用可能な UI**: `components/ui/` に移動（`shared/`, `interactive/` も参照）
- **フォーム**: React Hook Form + Zod の組み合わせ（型安全）
- **通知**: `useFeedback` カスタムフック で ユーザーフィードバック を表示
- **アニメーション**: GSAP (ガチャ) / Tailwind transition
- **アクセシビリティ**: `aria-*`, `role`, `aria-hidden` を適切に配置

### サーバーアクション

```typescript
// 例: createBookingAction
export const createBookingAction = async ({
	userId,
	booking,
	password,
	today,
}: {
	userId: string
	booking: BookingPayload
	password: string
	today: string
}): Promise<ApiResponse<{ id: string }>> => {
	const bookingDateKey = toDateKey(booking.bookingDate)
	const res = await apiPost<{ id: string }>('/booking', {
		body: { ... },
	})

	if (!res.ok) {
		return withFallbackMessage(res, '予約の作成に失敗しました。')
	}

	revalidateTag('booking')
	revalidateTag(`booking-user-${userId}`)
	revalidateBookingCalendarsForDate(bookingDateKey)

	return createdResponse({ id: res.data.id })
}
```

- API 呼び出しは `src/lib/api/crud` のラッパーを使用
- 成功時は `revalidateTag` で Next.js のサーバーレンダリング結果を更新
- クライアント側は `mutate*` で SWR キャッシュを同期

### SWR 活用
クライアント側でのデータ取得は必ず SWR を使用し、キャッシュと UI の一貫性を保つ。

```typescript
// fetcher.ts
export const bookingRangeFetcher = async ([
	cacheKey,
	startDate,
	endDate,
]: BookingRangeKey): Promise<BookingResponse | null> => {
	if (cacheKey !== BOOKING_CALENDAR_SWR_KEY) {
		throw new Error('Invalid cache key for booking calendar fetcher')
	}

	const res = await getBookingByDateAction({ startDate, endDate })
	if (res.ok) {
		return res.data
	}

	throw res
}

// hooks.ts
eexport const useBookingCalendarData = ({
	viewDate,
	viewRangeDays,
	fallbackData,
	config,
}: BookingCalendarDataOptions): SWRResponse<
	BookingResponse | null,
	unknown
> => {
	const key = buildBookingRangeKey(viewDate, viewRangeDays)
	return useSWR<BookingResponse | null>(key, bookingRangeFetcher, {
		fallbackData: fallbackData ?? null,
		revalidateOnFocus: false,
		keepPreviousData: true,
		...config,
	})
}
```

キャッシュ更新時は `constants.ts` と `utils/calendarCache.ts` を確認して、キーが一致しているか確認してください。

### リント・フォーマット

コード変更後に必ず実行:
```bash
npm run ts         # 型チェック
npm run lint:fix   # 自動修正
npm run format:fix # フォーマット自動修正
npm run check      # lint + format チェック
npm run ts         # 型チェック
npm run build      # 本番ビルド試行（型エラーをキャッチ）
```

## よくある実装パターン

### 1. フォーム送信 + キャッシュ更新 + ユーザーフィードバック

```typescript
const onSubmit: SubmitHandler<BookingCreateFormValues> = async (data) => {
  messageFeedback.clearFeedback()
  try {
    const res = await createBookingAction({ /* ... */ })
    
    if (res.ok) {
      await mutateBookingCalendarsForDate(mutate, toDateKey(bookingDate))
      messageFeedback.showSuccess('予約が完了しました。')
      reset()
    } else {
      messageFeedback.showApiError(res)
    }
  } catch (error) {
    messageFeedback.showError('エラーが発生しました。', { details: String(error) })
  }
}
```

### 2. ステート遷移（複数ビューの管理）

```typescript
type State = { mode: 'auth' | 'summary' | 'editing' | 'success'; booking: Booking }
const [state, dispatch] = useReducer(reducer, initialState)

return (
  <>
    {state.mode === 'auth' && <AuthForm onSuccess={() => dispatch({ type: 'AUTH_SUCCESS' })} />}
    {state.mode === 'summary' && <SummaryView />}
    {state.mode === 'editing' && <EditForm onSuccess={handleEditSuccess} />}
  </>
)
```

### 3. フォームフィールド分離

親が `register`, `errors`, コールバック関数を Props で子に渡し、子は UI レンダリング専念:

```typescript
const BookingEditFormFields = ({ register, errors, onSubmit, onCancel }: Props) => (
  <form onSubmit={onSubmit} className="space-y-2">
    <TextInputField register={register('name')} errorMessage={errors.name?.message} />
    <button type="submit">送信</button>
    <button type="button" onClick={onCancel}>キャンセル</button>
  </form>
)
```

### 4. データ取得 + エラーハンドリング + リトライ

```typescript
const { data, isLoading, mutate } = useBookingCalendarData({
  viewDate,
  viewRangeDays,
  config: { onError: (err) => errorFeedback.showApiError(err) },
})

useEffect(() => {
  if (data) errorFeedback.clearFeedback()
}, [data])

// UI
{errorFeedback.feedback && (
  <div>
    <ErrorMessage message={errorFeedback.feedback} />
    <button onClick={() => { errorFeedback.clearFeedback(); mutate() }}>再試行</button>
  </div>
)}
```

### 5. 編集フォーム + ポップアップ連携

```typescript
const { watch, setValue } = useForm()
const bookingDate = watch('bookingDate')

<BookingEditFormFields onOpenCalendar={() => setCalendarOpen(true)} />
<Popup open={calendarOpen}>
  <Calendar value={bookingDate} onChange={(val) => setValue('bookingDate', val)} />
</Popup>
```

## API ラッパーと応答管理

### `@/lib/api/crud` - HTTP メソッドの統一インターフェース

```typescript
// 使用例（actions.ts）
export const getBookingByDateAction = async ({
  startDate,
  endDate,
}: {
  startDate: string
  endDate: string
}): Promise<ApiResponse<BookingResponse>> => {
  const res = await apiGet<RawBookingResponse>('/booking', {
    searchParams: { start: startDate, end: endDate },
    next: { revalidate: 60 * 60, tags: [BOOKING_CALENDAR_TAG] },
  })
  return mapSuccess(res, mapRawBookingResponse, '予約一覧の取得に失敗しました。')
}

export const createBookingAction = async ({ /* ... */ }): Promise<ApiResponse<{ id: string }>> => {
  const res = await apiPost<{ id: string }>('/booking', {
    body: { /* ... */ },
  })
  if (!res.ok) return withFallbackMessage(res, '予約の作成に失敗しました。')
  
  revalidateTag('booking') // ← キャッシュ無効化
  return createdResponse({ id: res.data.id })
}
```

**主要な関数**:
- `apiGet<T>(path, options)` - GET リクエスト（キャッシュ設定可）
- `apiPost<T>(path, { body })` - POST リクエスト
- `apiPut<T>(path, { body })` - PUT リクエスト
- `apiDelete<T>(path, { searchParams })` - DELETE リクエスト

### `@/lib/api/helper` - 応答の標準化と変換

```typescript
// 成功応答の生成
export const okResponse = <T>(data: T): ApiSuccess<T> => 
  success(StatusCode.OK, data)
export const createdResponse = <T>(data: T): ApiSuccess<T> => 
  success(StatusCode.CREATED, data)
export const noContentResponse = (): ApiSuccess<null> => 
  success(StatusCode.NO_CONTENT, null)

// エラーメッセージの補完
export const withFallbackMessage = <T>(
  res: ApiResponse<T>,
  fallback: string
): ApiResponse<T> => {
  if (res.ok) return res
  return { ...res, message: res.message || fallback }
}

// データ変換（DTO → ドメイン型）
export const mapSuccess = <T, U>(
  res: ApiResponse<T>,
  mapper: (data: T) => U,
  fallback: string
): ApiResponse<U> => {
  if (res.ok) {
    return success(res.status, mapper(res.data))
  }
  return ensureMessage(res, fallback)
}
```

**パターン**（actions.ts から):
- API レスポンスを `mapSuccess` でドメイン型へ変換
- エラー時は `withFallbackMessage` で人間向けメッセージを追加
- 成功時は `createdResponse` / `okResponse` で統一形式を返す

### `revalidateTag` による Next.js サーバーキャッシュ無効化

```typescript
// actions.ts での使用例
export const updateBookingAction = async ({ /* ... */ }) => {
  const res = await apiPut('/booking/{id}', { body })
  
  if (!res.ok) return withFallbackMessage(res, '更新に失敗しました。')

  // 複数のタグを無効化することで、関連キャッシュをクリア
  revalidateTag('booking') // 予約全体のキャッシュ
  revalidateTag(`booking-detail-${bookingId}`) // 特定の予約詳細
  revalidateTag(`booking-user-${userId}`) // ユーザー別予約一覧
  revalidateBookingCalendarsForDate(bookingDateKey) // カレンダー周期ごと

  return noContentResponse()
}
```

---

## ファイル編集時の注意

### 既存コードの修正・機能追加

- **必ず README.md で設計パターンを確認**してから修正
- **booking 機能を参考例に** - 他の機能も同じ構造に統一
- `service.ts` でのデータ変換は必須（生の API レスポンスを UI に渡さない）
- `revalidateTag` の呼び出し漏れは UI と サーバーキャッシュの不整合の原因

### 新規ファイル作成

- ファイル名・関数名は命名規則を厳密に守る
- `types.ts`, `schema.ts`, `service.ts`, `actions.ts` は必ず用意する
- `constants.ts` でマジックナンバー・文字列を集約
- JSDoc コメントで関数の目的・引数・戻り値を明記

### テスト・型チェック

```bash
npm run format:fix # フォーマット自動修正
npm run check      # lint + format チェック
npm run ts         # 型チェック
npm run test       # ユニットテスト実行
npm run build      # 本番ビルド試行（型エラーをキャッチ）
```

## 推奨参照順序

1. **README.md** - 全体像・データフロー・ディレクトリ構造
2. **src/features/booking/** - 最良実装例を詳細に確認
3. **src/app/booking/page.tsx** - サーバーコンポーネントからの使用パターン
4. **src/lib/api/** - API ラッパーの設計
5. **src/components/ui/** - 共通 UI コンポーネント

---

**最後に**: 不確かな場合は、/features/booking の実装を「サンプルコード」として参照し、同じ構造で実装してください。
