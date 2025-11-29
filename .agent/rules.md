# X Clone プロジェクトルール

このドキュメントは、X Clone プロジェクトの開発における基本ルールとガイドラインを定義します。

> [!IMPORTANT]
> 詳細なアーキテクチャとコーディング規約は、`.agent/workflows/` ディレクトリ内のドキュメントを参照してください。

---
## ドキュメント構成

### バックエンド
- **[backend-architecture-overview.md](.agent/workflows/backend-architecture-overview.md)** - アーキテクチャ概要
- **[backend-architecture-layers.md](.agent/workflows/backend-architecture-layers.md)** - 各層の詳細
- **[backend-coding.md](.agent/workflows/backend-coding.md)** - コーディング規約

### フロントエンド
- **[frontend-architecture.md](.agent/workflows/frontend-architecture.md)** - アーキテクチャ
- **[frontend-coding.md](.agent/workflows/frontend-coding.md)** - コーディング規約

### テスト戦略
- **[testing-backend-unit.md](.agent/workflows/testing-backend-unit.md)** - バックエンド単体テスト
- **[testing-backend-integration.md](.agent/workflows/testing-backend-integration.md)** - バックエンド統合テスト
- **[testing-frontend.md](.agent/workflows/testing-frontend.md)** - フロントエンドテスト

### 実装ワークフロー
- **[implementation-backend.md](.agent/workflows/implementation-backend.md)** - バックエンド実装フロー
- **[implementation-frontend.md](.agent/workflows/implementation-frontend.md)** - フロントエンド実装フロー
- **[code-review.md](.agent/workflows/code-review.md)** - コードレビューチェックリスト

---

## プロジェクト概要

| 項目 | 内容 |
|------|------|
| **プロジェクト名** | antigravity-x-clone |
| **アーキテクチャ** | Monorepo (Frontend + Backend + DB) |
| **開発環境** | Docker Compose |

## 技術スタック

### フロントエンド
| レイヤ | 技術 |
|--------|------|
| Framework | **Next.js 16** (App Router) |
| Language | **TypeScript 5** |
| UI Library | **React 19** |
| Styling | **Tailwind CSS 4** |
| Icons | **react-icons** |

### バックエンド
| レイヤ | 技術 |
|--------|------|
| Language | **Go** |
| Framework | **Gin** |
| ORM | **GORM** |
| Auth | **JWT** |
| Database | **PostgreSQL 15** |

### インフラ
| 項目 | 設定 |
|------|------|
| Frontend | `localhost:3000` |
| Backend | `localhost:8080` |
| PostgreSQL | `localhost:5433` → `5432` (container) |

---

## アーキテクチャ概要

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

**詳細**: [backend-architecture-overview.md](.agent/workflows/backend-architecture-overview.md), [backend-architecture-layers.md](.agent/workflows/backend-architecture-layers.md)

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

**詳細**: [frontend-architecture.md](.agent/workflows/frontend-architecture.md)

---

## 開発ワークフロー

### 実装の基本原則

1. **必ず確認を取る**: 実装前に計画書を作成し、ユーザーの承認を得る
2. **段階的に実装**: Phase 1 (スキーマ) → Phase 5 (フロントエンド) の順序を守る
3. **各フェーズでテスト**: 実装後は必ずテストを実行

### 段階的実装フロー

```
Phase 1: スキーマ設計 (DB Entity, Migration, Seed)
    ↓
Phase 2: Repository層 (Interface, Implementation, Integration Test)
    ↓
Phase 3: UseCase層 (Business Logic, Unit Test with Mock)
    ↓
Phase 4: Presentation層 (Handler, DTO, Routing)
    ↓
Phase 5: フロントエンド (Types, API Client, Hooks, Components)
```

**詳細**: [implementation-backend.md](.agent/workflows/implementation-backend.md), [implementation-frontend.md](.agent/workflows/implementation-frontend.md)

---

## 実装前チェックリスト

実装を開始する前に、以下を確認:

- [ ] 実装計画書を作成した
- [ ] ユーザーの承認を得た
- [ ] 必要なドキュメントを読んだ
  - [ ] アーキテクチャドキュメント
  - [ ] コーディング規約
  - [ ] テスト戦略
- [ ] 段階的な実装フローを理解した

**詳細**: [code-review.md](.agent/workflows/code-review.md)

---

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

**詳細**: [testing-backend-unit.md](.agent/workflows/testing-backend-unit.md), [testing-backend-integration.md](.agent/workflows/testing-backend-integration.md), [testing-frontend.md](.agent/workflows/testing-frontend.md)

---

## クイックスタート

### 1. ワークフローでルールを確認

すべてのドキュメントは `.agent/workflows/` ディレクトリにあります。詳細は上記のドキュメント構成を参照してください。

### 2. Docker環境の起動

```bash
docker-compose up -d
```

### 3. ログの確認

```bash
docker-compose logs -f backend
docker-compose logs -f frontend
```

---

## 重要な禁止事項

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

---

## 参考リソース

### 公式ドキュメント
- **Next.js**: https://nextjs.org/docs
- **Gin**: https://gin-gonic.com/docs/
- **GORM**: https://gorm.io/docs/
- **React Icons**: https://react-icons.github.io/react-icons/

### プロジェクトドキュメント
- **すべてのドキュメント**: `.agent/workflows/`

---

## 学習パス

### 新規参加者向け

1. **プロジェクト概要を理解**: `README.md` を読む
2. **バックエンドを学ぶ**:
   - [backend-architecture-overview.md](.agent/workflows/backend-architecture-overview.md) - アーキテクチャ概要
   - [backend-architecture-layers.md](.agent/workflows/backend-architecture-layers.md) - 各層の詳細
   - [backend-coding.md](.agent/workflows/backend-coding.md) - コーディング規約
3. **フロントエンドを学ぶ**:
   - [frontend-architecture.md](.agent/workflows/frontend-architecture.md) - アーキテクチャ
   - [frontend-coding.md](.agent/workflows/frontend-coding.md) - コーディング規約
4. **実装フローを理解**:
   - [implementation-backend.md](.agent/workflows/implementation-backend.md) - バックエンド実装
   - [implementation-frontend.md](.agent/workflows/implementation-frontend.md) - フロントエンド実装
5. **テスト戦略を学ぶ**:
   - [testing-backend-unit.md](.agent/workflows/testing-backend-unit.md) - 単体テスト
   - [testing-backend-integration.md](.agent/workflows/testing-backend-integration.md) - 統合テスト
   - [testing-frontend.md](.agent/workflows/testing-frontend.md) - フロントエンドテスト

---

> [!NOTE]
> このプロジェクトは、Clean Architecture と Features-based 構成を採用しています。
> 実装前に必ずドキュメントを確認し、段階的な実装フローに従ってください。
