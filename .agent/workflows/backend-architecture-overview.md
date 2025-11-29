# バックエンド完全ガイド

このドキュメントは、Go/Gin バックエンドにおける Clean Architecture の実装ルールとコーディング規約を定義します。

## 目次

1. [Clean Architecture 概要](#clean-architecture-概要)
2. [ディレクトリ構成](#ディレクトリ構成)
3. [各層の責務と実装例](#各層の責務と実装例)
4. [Dependency Injection](#dependency-injection-di)
5. [エラーハンドリング](#エラーハンドリング)
6. [コーディング規約](#コーディング規約)
7. [禁止事項](#禁止事項)

---

## Clean Architecture 概要

### アーキテクチャ図

```
┌─────────────────────────────────────────────────────────────┐
│                     Presentation Layer                       │
│  (handlers, requests, responses)                             │
│  - HTTPリクエスト/レスポンス処理                                │
│  - DTOへの変換                                                │
└────────────────────────┬────────────────────────────────────┘
                         │ 依存
                         ↓
┌─────────────────────────────────────────────────────────────┐
│                      UseCase Layer                           │
│  (usecases)                                                  │
│  - ビジネスロジック                                            │
│  - トランザクション制御                                         │
└────────────────────────┬────────────────────────────────────┘
                         │ 依存
                         ↓
┌─────────────────────────────────────────────────────────────┐
│                   Repository Interface                       │
│  (repositories)                                              │
│  - データアクセスの抽象化                                       │
│  - インターフェース定義のみ                                     │
└────────────────────────┬────────────────────────────────────┘
                         │ 依存
                         ↓
┌─────────────────────────────────────────────────────────────┐
│                      Domain Layer                            │
│  (domains/models, domains/errors)                            │
│  - エンティティ                                               │
│  - 値オブジェクト                                             │
│  - ドメインエラー                                             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                  Infrastructure Layer                        │
│  (infrastructures)                                           │
│  - GORM実装                                                  │
│  - 外部API実装                                               │
│  - Repository実装                                            │
└─────────────────────────────────────────────────────────────┘
        ↑
        │ 実装 (Repository Interfaceを実装)
        │
```

### 依存関係ルール

**[OK] 許可される依存関係:**
```
presentation → usecases → repositories (interface) → domains
infrastructures → repositories (interface)
```

**[NG] 禁止される依存関係:**
```
domains → repositories (ドメインはリポジトリに依存しない)
repositories (interface) → infrastructures (インターフェースは実装に依存しない)
usecases → infrastructures (ユースケースはインフラに直接依存しない)
usecases → presentation (ユースケースはプレゼンテーション層に依存しない)
```

---

## ディレクトリ構成

```
apps/api/
├── cmd/
│   └── api/
│       └── main.go                          # エントリーポイント、DI設定
│
├── internal/
│   ├── domains/                             # ドメイン層
│   │   ├── models/                          # エンティティ
│   │   │   ├── user.go
│   │   │   ├── user_test.go                 # ドメインロジックのテスト
│   │   │   ├── post.go
│   │   │   ├── like.go
│   │   │   └── follow.go
│   │   ├── errors/                          # ドメインエラー
│   │   │   └── errors.go
│   │   └── seeds/                           # シードデータ
│   │       └── init.go
│   │
│   ├── repositories/                        # リポジトリインターフェース
│   │   ├── user_repository.go               # interface のみ
│   │   ├── post_repository.go
│   │   ├── like_repository.go
│   │   └── follow_repository.go
│   │
│   ├── usecases/                            # ユースケース層
│   │   ├── user/
│   │   │   ├── create_user.go               # 1ユースケース = 1ファイル
│   │   │   ├── create_user_test.go          # ユースケースの単体テスト
│   │   │   ├── get_user.go
│   │   │   ├── update_user.go
│   │   │   └── delete_user.go
│   │   ├── post/
│   │   │   ├── create_post.go
│   │   │   ├── get_timeline.go
│   │   │   └── delete_post.go
│   │   └── auth/
│   │       ├── login.go
│   │       └── register.go
│   │
│   ├── presentation/                        # プレゼンテーション層
│   │   ├── handlers/
│   │   │   ├── user_handler.go
│   │   │   ├── user_handler_test.go         # ハンドラーのテスト
│   │   │   ├── post_handler.go
│   │   │   └── auth_handler.go
│   │   ├── requests/                        # リクエストDTO
│   │   │   ├── user_request.go
│   │   │   ├── post_request.go
│   │   │   └── auth_request.go
│   │   ├── responses/                       # レスポンスDTO
│   │   │   ├── user_response.go
│   │   │   ├── post_response.go
│   │   │   └── auth_response.go
│   │   └── middleware/
│   │       ├── auth.go
│   │       ├── cors.go
│   │       └── logger.go
│   │
│   ├── infrastructures/                     # インフラ層
│   │   ├── databases/
│   │   │   ├── database.go                  # GORM初期化
│   │   │   └── migrate.go                   # マイグレーション
│   │   └── repositories/                    # Repository実装
│   │       ├── user_repository_impl.go
│   │       ├── user_repository_impl_test.go # リポジトリの統合テスト
│   │       ├── post_repository_impl.go
│   │       ├── like_repository_impl.go
│   │       └── follow_repository_impl.go
│   │
│   ├── routes/
│   │   └── routes.go                        # ルーティング定義
│   │
│   └── testutils/                           # テストユーティリティ
│       ├── mocks/                           # モック
│       │   ├── repository_mocks.go
│       │   └── usecase_mocks.go
│       ├── fixtures/                        # テストデータ
│       │   └── test_data.go
│       └── helpers/                         # テストヘルパー
│           └── db_helper.go
│
├── go.mod
└── go.sum
```

---

## 各層の責務と実装例
