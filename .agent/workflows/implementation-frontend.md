# 実装ワークフロー - フロントエンド

このドキュメントは、Phase 4 (Presentation層) と Phase 5 (フロントエンド) の実装手順を説明します。

> [!NOTE]
> Phase 1-3 (スキーマ、Repository、UseCase) は [implementation-backend.md](implementation-backend.md) を参照してください。

---


### 成果物

- [ ] Request/Response DTO (`presentation/requests/`, `presentation/responses/`)
- [ ] Handler実装 (`presentation/handlers/`)
- [ ] ルーティング設定 (`routes/`)

### 実装手順

#### 4.1 Request DTO

```go
// internal/presentation/requests/user_request.go
package requests

type CreateUserRequest struct {
    Username string `json:"username" binding:"required,min=3,max=50"`
    Email    string `json:"email" binding:"required,email"`
    Password string `json:"password" binding:"required,min=8"`
}
```

#### 4.2 Response DTO

```go
// internal/presentation/responses/user_response.go
package responses

import (
    "time"
    "github.com/yourusername/x-clone/internal/domains/models"
)

type UserResponse struct {
    ID        uint      `json:"id"`
    Username  string    `json:"username"`
    Email     string    `json:"email"`
    Bio       string    `json:"bio"`
    Avatar    string    `json:"avatar"`
    CreatedAt time.Time `json:"created_at"`
}

func ToUserResponse(user *models.User) *UserResponse {
    return &UserResponse{
        ID:        user.ID,
        Username:  user.Username,
        Email:     user.Email,
        Bio:       user.Bio,
        Avatar:    user.Avatar,
        CreatedAt: user.CreatedAt,
    }
}
```

#### 4.3 Handler実装

```go
// internal/presentation/handlers/user_handler.go
package handlers

import (
    "net/http"
    "github.com/gin-gonic/gin"
    "github.com/yourusername/x-clone/internal/usecases/user"
    "github.com/yourusername/x-clone/internal/presentation/requests"
    "github.com/yourusername/x-clone/internal/presentation/responses"
)

type UserHandler struct {
    createUserUC *user.CreateUserUseCase
}

func NewUserHandler(createUserUC *user.CreateUserUseCase) *UserHandler {
    return &UserHandler{
        createUserUC: createUserUC,
    }
}

func (h *UserHandler) CreateUser(c *gin.Context) {
    var req requests.CreateUserRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    input := user.CreateUserInput{
        Username: req.Username,
        Email:    req.Email,
        Password: req.Password,
    }

    output, err := h.createUserUC.Execute(c.Request.Context(), input)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }

    res := responses.ToUserResponse(output.User)
    c.JSON(http.StatusCreated, res)
}
```

#### 4.4 ルーティング設定

```go
// internal/routes/routes.go
package routes

import (
    "github.com/gin-gonic/gin"
    "github.com/yourusername/x-clone/internal/presentation/handlers"
)

func SetupRoutes(router *gin.Engine, userHandler *handlers.UserHandler) {
    api := router.Group("/api")
    {
        users := api.Group("/users")
        {
            users.POST("", userHandler.CreateUser)
        }
    }
}
```

### 確認事項

- [ ] DTOは適切に定義されているか？
- [ ] バリデーションは適切か？
- [ ] HTTPステータスコードは正しいか？
- [ ] ルーティングは正しいか？

---

## Phase 5: フロントエンド

### 目的

フロントエンドの実装。

### 成果物

- [ ] 型定義 (`features/*/types/`)
- [ ] APIクライアント (`features/*/api/`)
- [ ] カスタムフック (`features/*/hooks/`)
- [ ] コンポーネント (`features/*/components/`)

### 実装手順

#### 5.1 型定義

```tsx
// features/users/types/user.ts
export type User = {
  id: number;
  username: string;
  email: string;
  bio: string;
  avatar: string;
  createdAt: string;
};

export type CreateUserInput = {
  username: string;
  email: string;
  password: string;
};
```

#### 5.2 APIクライアント

```tsx
// features/users/api/usersApi.ts
import { apiClient } from '@/lib/api/client';
import type { User, CreateUserInput } from '../types/user';

export const usersApi = {
  create: async (input: CreateUserInput): Promise<User> => {
    const response = await apiClient.post('/users', input);
    return response.data;
  },

  getById: async (id: number): Promise<User> => {
    const response = await apiClient.get(`/users/${id}`);
    return response.data;
  },
};
```

#### 5.3 カスタムフック

```tsx
// features/users/hooks/useCreateUser.ts
import { useState } from 'react';
import { usersApi } from '../api/usersApi';
import type { CreateUserInput } from '../types/user';

export const useCreateUser = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createUser = async (input: CreateUserInput) => {
    try {
      setLoading(true);
      setError(null);
      const user = await usersApi.create(input);
      return user;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { createUser, loading, error };
};
```

#### 5.4 コンポーネント

```tsx
// features/users/components/RegisterForm.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useCreateUser } from '../hooks/useCreateUser';

export const RegisterForm = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { createUser, loading, error } = useCreateUser();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createUser({ username, email, password });
      // 成功時の処理
    } catch (err) {
      // エラーハンドリング
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Input
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Username"
      />
      <Input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <Input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />
      <Button type="submit" disabled={loading}>
        Register
      </Button>
      {error && <p className="text-red-500">{error.message}</p>}
    </form>
  );
};
```

### 確認事項

- [ ] 型定義は正しいか？
- [ ] APIクライアントは動作するか？
- [ ] カスタムフックは正しく動作するか？
- [ ] コンポーネントは正しく表示されるか？

---

## 実装フロー例

### 例: ユーザー登録機能

#### Step 1: 実装計画書を作成

```markdown
# ユーザー登録機能 実装計画書

## 概要
ユーザーがアカウントを作成できる機能を実装します。

## Phase 1: スキーマ設計
- `internal/domains/models/user.go` - User エンティティ
- `internal/infrastructures/databases/migrate.go` - マイグレーション

## Phase 2: Repository層
- `internal/repositories/user_repository.go` - インターフェース
- `internal/infrastructures/repositories/user_repository_impl.go` - 実装
- `internal/infrastructures/repositories/user_repository_impl_test.go` - テスト

## Phase 3: UseCase層
- `internal/usecases/user/create_user.go` - ユースケース
- `internal/usecases/user/create_user_test.go` - テスト

## Phase 4: Presentation層
- `internal/presentation/requests/user_request.go` - リクエストDTO
- `internal/presentation/responses/user_response.go` - レスポンスDTO
- `internal/presentation/handlers/user_handler.go` - ハンドラー

## Phase 5: フロントエンド
- `features/users/types/user.ts` - 型定義
- `features/users/api/usersApi.ts` - APIクライアント
- `features/users/hooks/useCreateUser.ts` - カスタムフック
- `features/users/components/RegisterForm.tsx` - コンポーネント
```

#### Step 2: ユーザーの承認を待つ

**GOサインが出るまで実装を開始しない**

#### Step 3: Phase 1 から順番に実装

各フェーズごとに:
1. コードを実装
2. テストを実行
3. 結果を報告
4. 次のフェーズへ

---

## テスト実行コマンド

### バックエンド

```bash
// turbo
# すべてのテストを実行
go test ./...

# カバレッジ付き
go test -cover ./...

# 特定のパッケージ
go test ./internal/usecases/user/...
```

### フロントエンド

```bash
// turbo
# すべてのテストを実行
npm test

# ウォッチモード
npm test -- --watch

# カバレッジ
npm test -- --coverage
```

---

## まとめ

### 重要なポイント

1. **必ず確認を取る**: 実装前に計画書を作成し、承認を得る
2. **段階的に実装**: Phase 1 → Phase 5 の順序を守る
3. **各フェーズでテスト**: 実装後は必ずテストを実行
4. **手戻りを防ぐ**: 計画段階で詳細を詰める
5. **統一感を保つ**: コーディング規約を遵守
