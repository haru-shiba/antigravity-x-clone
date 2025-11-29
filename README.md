# X Clone - Twitter クローンアプリケーション

Clean Architecture と Features-based 構成を採用した、実務レベルの Twitter クローンアプリケーションです。

## 技術スタック

### フロントエンド
- **Next.js 16** (App Router)
- **TypeScript 5**
- **React 19**
- **Tailwind CSS 4**

### バックエンド
- **Go** (Gin)
- **GORM**
- **PostgreSQL 15**
- **JWT 認証**

### インフラ
- **Docker / Docker Compose**

## プロジェクト構成

```
antigravity-x-clone/
├── .agent/
│   ├── rules.md                            # 常に自動読み込みされるプロジェクトルール
│   └── workflows/
│       ├── backend-architecture-layers.md  # バックエンド Clean Architecture 各層の詳細
│       ├── backend-architecture-overview.md # バックエンドアーキテクチャ概要とディレクトリ構成
│       ├── backend-coding.md               # バックエンドコーディング規約
│       ├── code-review.md                  # 実装前のコードレビューチェックリスト
│       ├── frontend-architecture.md        # フロントエンド Features-based Architecture 詳細
│       ├── frontend-coding.md              # フロントエンドコーディング規約
│       ├── implementation-backend.md       # バックエンド実装ワークフロー (Phase 1-4)
│       ├── implementation-frontend.md      # フロントエンド実装ワークフロー (Phase 5)
│       ├── testing-backend-integration.md  # バックエンド統合テスト戦略
│       ├── testing-backend-unit.md         # バックエンド単体テスト戦略
│       └── testing-frontend.md             # フロントエンドテスト戦略
├── apps/
│   ├── api/                  # Go バックエンド (Clean Architecture)
│   └── web/                  # Next.js フロントエンド (Features-based)
└── README.md                 # このファイル
```

## セットアップ

### 前提条件

- Docker Desktop
- Git

### 環境構築

```bash
# リポジトリをクローン
git clone https://github.com/yourusername/antigravity-x-clone.git
cd antigravity-x-clone

# Docker コンテナを起動
docker-compose up -d

# ログを確認
docker-compose logs -f
```

### アクセス

- **フロントエンド**: http://localhost:3000
- **バックエンドAPI**: http://localhost:8080
- **PostgreSQL**: localhost:5433

## AI を使った開発フロー

このプロジェクトは、AI（Gemini/Antigravity）を活用した段階的な実装を前提としています。

### 1. ドキュメントを読む順番

**初めての方:**

1. このファイル (`README.md`) - プロジェクト概要
2. `.agent/rules.md` - プロジェクト全体のルール（AI が自動で読み込みます）
3. ワークフローを確認:
   - バックエンド: `backend-architecture-overview.md`, `backend-architecture-layers.md`, `backend-coding.md`
   - フロントエンド: `frontend-architecture.md`, `frontend-coding.md`
   - テスト: `testing-backend-unit.md`, `testing-backend-integration.md`, `testing-frontend.md`

**実装前:**

1. `implementation-backend.md`, `implementation-frontend.md` - 段階的実装フロー
2. `code-review.md` - 実装前チェックリスト

### 2. AI への実装依頼方法

#### 基本的なプロンプトの書き方

```
@[.agent/workflows/backend-architecture-overview.md] @[.agent/workflows/backend-coding.md]

[実装したい機能の説明]

以下を実装してください:
- [具体的なファイルとその内容]

実装前に必ず確認を取ってください。
```

**重要なポイント:**
- `@[ファイルパス]` で関連ドキュメントを読み込ませる
- 「実装前に必ず確認を取ってください」を必ず含める
- 段階的に実装（Phase 1 → Phase 5）

### 3. 段階的実装フロー

#### Phase 1: スキーマ設計

```
@[.agent/workflows/backend-architecture-overview.md]

ユーザー登録機能を実装したいです。
まず Phase 1 のスキーマ設計から始めます。

以下の実装計画書を作成してください:
- User エンティティの定義 (domains/models/user.go)
- マイグレーション設定
- シードデータ

実装前に必ず確認を取ってください。
```

#### Phase 2: Repository層

```
@[.agent/workflows/backend-architecture-layers.md]

Phase 1 が完了したので、Phase 2 の Repository 層を実装します。

以下を作成してください:
- UserRepository インターフェース (repositories/user_repository.go)
- UserRepository 実装 (infrastructures/repositories/user_repository_impl.go)
- 統合テスト (user_repository_impl_test.go)

実装前に必ず確認を取ってください。
```

#### Phase 3: UseCase層

```
@[.agent/workflows/backend-architecture-layers.md] @[.agent/workflows/testing-backend-unit.md]

Phase 2 が完了したので、Phase 3 の UseCase 層を実装します。

CreateUser ユースケースを実装してください:
- CreateUserUseCase (usecases/user/create_user.go)
- 単体テスト (create_user_test.go) - モックを使用
- バリデーション: username, email, password は必須
- 既存ユーザーチェック

実装前に必ず確認を取ってください。
```

#### Phase 4: Presentation層

```
@[.agent/workflows/backend-architecture-layers.md]

Phase 3 が完了したので、Phase 4 の Presentation 層を実装します。

以下を作成してください:
- CreateUserRequest DTO (presentation/requests/user_request.go)
- UserResponse DTO (presentation/responses/user_response.go)
- UserHandler (presentation/handlers/user_handler.go)
- ルーティング設定 (routes/routes.go に追加)

エンドポイント: POST /api/users

実装前に必ず確認を取ってください。
```

#### Phase 5: フロントエンド

```
@[.agent/workflows/frontend-architecture.md] @[.agent/workflows/frontend-coding.md]

Phase 4 が完了したので、Phase 5 のフロントエンドを実装します。

ユーザー登録フォームを実装してください:
- 型定義 (features/users/types/user.ts)
- API クライアント (features/users/api/usersApi.ts)
- カスタムフック (features/users/hooks/useCreateUser.ts)
- RegisterForm コンポーネント (features/users/components/RegisterForm.tsx)

実装前に必ず確認を取ってください。
```

### 4. 実装のルール

1. **必ず段階的に実装**: Phase 1 → Phase 5 の順序を守る
2. **実装前に確認**: 各フェーズで実装計画書を作成し、承認を得る
3. **ドキュメント参照**: `@[ファイルパス]` で関連ドキュメントを読み込ませる
4. **テストも含める**: 各フェーズでテストコードも実装
5. **コーディング規約遵守**: 統一されたコードスタイルを維持

## アーキテクチャ

### バックエンド: Clean Architecture

```
Presentation (handlers, requests, responses)
    ↓
UseCases (business logic)
    ↓
Repositories (interfaces)
    ↓
Domains (entities, errors)

Infrastructures (GORM) → Repositories (interfaces)
```

詳細: `.agent/workflows/backend-architecture-overview.md`, `.agent/workflows/backend-architecture-layers.md`

### フロントエンド: Features-based

```
app/ (pages, layouts)
    ↓
features/ (feature-specific components, hooks, api)
    ↓
components/ (shared UI components)
    ↓
lib/ (utilities, constants)
```

詳細: `.agent/workflows/frontend-architecture.md`

## テスト戦略

### テストピラミッド

```
    E2E Test (少ない)
        ↑
  Integration Test (中程度)
        ↑
    Unit Test (多い)
```

### カバレッジ目標

- **Unit Test**: 80% 以上
- **Integration Test**: 主要なフロー
- **E2E Test**: クリティカルパス

詳細: `.agent/workflows/testing-backend-unit.md`, `.agent/workflows/testing-frontend.md`

## コーディング規約

### バックエンド (Go)

- 関数定義: `func` キーワードのみ
- 命名規則: PascalCase (exported), camelCase (unexported)
- 構造体タグ: `gorm` → `json` → `validate`
- エラーハンドリング: `fmt.Errorf` with `%w`

詳細: `.agent/workflows/backend-coding.md`

### フロントエンド (TypeScript/React)

- 関数定義: アロー関数 `const fn = () => {}`
- 型定義: `type` のみ（`interface` 使用禁止）
- Export: Named export（Page コンポーネント以外）
- スタイリング: Tailwind CSS のみ

詳細: `.agent/workflows/frontend-coding.md`

## ワークフローコマンド

プロジェクト内で以下のコマンドを使用できます:

すべてのドキュメントは `.agent/workflows/` ディレクトリにあります:

**バックエンド:**
- `backend-architecture-overview.md` - アーキテクチャ概要
- `backend-architecture-layers.md` - 各層の詳細
- `backend-coding.md` - コーディング規約

**フロントエンド:**
- `frontend-architecture.md` - アーキテクチャ
- `frontend-coding.md` - コーディング規約

**テスト:**
- `testing-backend-unit.md` - バックエンド単体テスト
- `testing-backend-integration.md` - バックエンド統合テスト
- `testing-frontend.md` - フロントエンドテスト

**実装:**
- `implementation-backend.md` - バックエンド実装フロー
- `implementation-frontend.md` - フロントエンド実装フロー
- `code-review.md` - コードレビューチェックリスト

## 禁止事項

### バックエンド (Go)

× **絶対にやってはいけないこと:**
1. パニックを使用しない（エラーを返す）
2. グローバル変数を使用しない（DI を使用）
3. `init()` 関数を避ける（明示的な初期化）
4. エラーハンドリングを省略しない
5. SQL インジェクションの脆弱性を残さない

### フロントエンド (TypeScript/React)

× **絶対にやってはいけないこと:**
1. `any` を使用しない
2. 非 null アサーション (`!`) を避ける
3. `useEffect` の依存配列を無視しない
4. `interface` を使用しない（`type` を使用）
5. インラインスタイルを使用しない（Tailwind CSS を使用）
