---
description: 実装前のコードレビューチェックリスト
---

# コードレビューチェックリスト

このチェックリストは、実装前に確認すべき項目をまとめたものです。

## 全体

### アーキテクチャ

- [ ] Clean Architecture の依存関係ルールを守っているか？
  - Presentation → UseCase → Repository → Domain
  - Infrastructure → Repository (interface)
- [ ] 各層の責務は明確か？
- [ ] 循環依存は発生していないか？

### コーディング規約

- [ ] 命名規則は統一されているか？
- [ ] ファイル構成は規約に従っているか？
- [ ] コメントは適切か？（自明なコメントは避ける）

---

## バックエンド (Go)

### ファイル命名

- [ ] ファイル名は小文字 + アンダースコア (`user_repository.go`)
- [ ] テストファイルは `_test.go` サフィックス
- [ ] 実装ファイルは `_impl.go` サフィックス（インターフェース実装の場合）

### パッケージ

- [ ] パッケージ名は小文字のみ
- [ ] パッケージ名は単数形
- [ ] パッケージコメントがある

### 命名規則

- [ ] 変数名は camelCase
- [ ] エクスポート関数は PascalCase
- [ ] プライベート関数は camelCase
- [ ] 定数は PascalCase または UPPER_SNAKE_CASE
- [ ] boolean 変数は `is`, `has`, `should` で始まる

### 関数定義

- [ ] `func` キーワードを使用
- [ ] `context.Context` は最初の引数
- [ ] エラーは最後の戻り値
- [ ] レシーバー名は1〜2文字で一貫している

### 構造体

- [ ] タグの順序: `gorm` → `json` → `validate`
- [ ] フィールドの順序: ID → 主要フィールド → 関連フィールド → タイムスタンプ

### エラーハンドリング

- [ ] エラーは必ずチェック
- [ ] エラーは `fmt.Errorf` with `%w` でラップ
- [ ] カスタムエラーは `domains/errors/` に定義

### データベース

- [ ] GORM クエリはプレースホルダーを使用
- [ ] N+1 問題を回避（`Preload` を使用）
- [ ] トランザクションは適切に使用

### テスト

- [ ] テスト関数名: `Test + 関数名 + 条件 + 期待結果`
- [ ] Arrange-Act-Assert パターンを使用
- [ ] モックは `testutils/mocks/` に定義
- [ ] テストデータは `testutils/fixtures/` に定義

---

## フロントエンド (TypeScript/React)

### ファイル命名

- [ ] コンポーネント: PascalCase + `.tsx`
- [ ] フック: camelCase + `.ts`
- [ ] ユーティリティ: camelCase + `.ts`
- [ ] 型定義: camelCase + `.ts`
- [ ] API: camelCase + `Api.ts`

### 命名規則

- [ ] 変数名は camelCase
- [ ] boolean 変数は `is`, `has`, `should` で始まる
- [ ] 配列は複数形
- [ ] 関数名は camelCase
- [ ] イベントハンドラーは `handle` で始まる
- [ ] コンポーネント名は PascalCase
- [ ] カスタムフック名は `use` で始まる

### 型定義

- [ ] `type` を使用（`interface` は使用しない）
- [ ] Props は `コンポーネント名 + Props`
- [ ] Input/Output は `関数名 + Input/Output`
- [ ] `any` を使用しない
- [ ] Optional は `?` で明示

### 関数定義

- [ ] アロー関数を使用
- [ ] コンポーネントは Named Export（Page コンポーネント以外）
- [ ] Page コンポーネントは default export

### コンポーネント

- [ ] Props は型を分離して定義
- [ ] Props は分割代入
- [ ] 条件付きレンダリングは `&&` または三項演算子
- [ ] リストレンダリングは `key` を指定（`index` は避ける）

### Hooks

- [ ] `useState` は型を明示
- [ ] `useEffect` は依存配列を明示
- [ ] `useCallback`, `useMemo` は必要な場合のみ使用

### スタイリング

- [ ] Tailwind CSS を使用
- [ ] インラインスタイルは避ける
- [ ] 条件付きクラスは `clsx` または テンプレートリテラル

### API クライアント

- [ ] Axios を使用
- [ ] エラーハンドリングは try-catch
- [ ] 型は明示

### テスト

- [ ] テストファイル名: `ファイル名.test.tsx`
- [ ] `describe` + `it` を使用
- [ ] コンポーネントテストは React Testing Library
- [ ] APIテストは MSW

---

## 依存関係チェック

### バックエンド

```
[OK] 許可される依存関係:
- presentation → usecases
- usecases → repositories (interface)
- repositories (interface) → domains
- infrastructures → repositories (interface)

[NG] 禁止される依存関係:
- domains → repositories
- repositories (interface) → infrastructures
- usecases → infrastructures
- usecases → presentation
```

### フロントエンド

```
[OK] 許可される依存関係:
- app → features
- features → components
- features → lib
- components → lib

[NG] 禁止される依存関係:
- lib → features
- lib → components
- components → features
- features → app
```

---

## セキュリティチェック

### バックエンド

- [ ] パスワードはハッシュ化して保存
- [ ] JWT トークンは適切な有効期限
- [ ] 保護されたエンドポイントは `JWTAuthMiddleware` を適用
- [ ] 入力バリデーションは必ず実施
- [ ] SQL インジェクション対策（プレースホルダー使用）
- [ ] CORS 設定は適切（`*` は使用しない）

### フロントエンド

- [ ] 機密情報をローカルストレージに保存しない
- [ ] JWT トークンは HttpOnly Cookie または適切に保護
- [ ] XSS 対策（React は自動でエスケープ）
- [ ] CSRF 対策（必要に応じて）

---

## パフォーマンスチェック

### バックエンド

- [ ] N+1 問題を回避（`Preload` 使用）
- [ ] インデックスは適切に設定
- [ ] 不要なデータは取得しない

### フロントエンド

- [ ] 不要な再レンダリングを避ける
- [ ] 画像は Next.js の `Image` コンポーネントを使用
- [ ] コード分割は適切に実施
- [ ] Server Components を優先的に使用

---

## テストカバレッジチェック

### バックエンド

- [ ] ドメインロジックの単体テスト
- [ ] ユースケースの単体テスト（モック使用）
- [ ] リポジトリの統合テスト（実DB接続）
- [ ] カバレッジ 80% 以上

### フロントエンド

- [ ] コンポーネントテスト
- [ ] カスタムフックテスト
- [ ] APIクライアントテスト（MSW使用）
- [ ] ユーティリティ関数テスト

---

## ドキュメントチェック

- [ ] README は最新か？
- [ ] API ドキュメントは更新されているか？
- [ ] 複雑なロジックにはコメントがあるか？
- [ ] 環境変数は `.env.example` に記載されているか？

---

## Git チェック

- [ ] コミットメッセージは明確か？
  - `feat:`, `fix:`, `refactor:` などのプレフィックス
- [ ] ブランチ名は適切か？
  - `feature/機能名`, `fix/バグ名`, `refactor/対象`
- [ ] 不要なファイルはコミットしていないか？
- [ ] `.gitignore` は適切に設定されているか？

---

## 実装前チェックリスト

実装を開始する前に、以下を確認:

1. [ ] 実装計画書を作成した
2. [ ] ユーザーの承認を得た
3. [ ] 必要なドキュメントを読んだ
   - [ ] `.agent/workflows/backend-architecture-overview.md`
   - [ ] `.agent/workflows/backend-architecture-layers.md`
   - [ ] `.agent/workflows/backend-coding.md`
   - [ ] `.agent/workflows/frontend-architecture.md`
   - [ ] `.agent/workflows/frontend-coding.md`
   - [ ] `.agent/workflows/testing-backend-unit.md`
   - [ ] `.agent/workflows/testing-backend-integration.md`
   - [ ] `.agent/workflows/testing-frontend.md`
4. [ ] 段階的な実装フローを理解した
5. [ ] テスト戦略を理解した

---

## 実装後チェックリスト

実装完了後、以下を確認:

1. [ ] すべてのテストが通る
2. [ ] カバレッジが目標値を満たす
3. [ ] コーディング規約を遵守している
4. [ ] ドキュメントを更新した
5. [ ] セキュリティチェックを実施した
6. [ ] パフォーマンスチェックを実施した
7. [ ] Git コミットメッセージは適切
8. [ ] ユーザーに実装完了を報告した

---

## まとめ

このチェックリストを使用して、実装前後の品質を保証します。

**重要**: すべての項目をチェックしてから実装を開始・完了してください。
