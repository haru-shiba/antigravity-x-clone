# テスト戦略とモック共通化

このドキュメントは、バックエンド（Go）とフロントエンド（TypeScript）のテスト戦略を定義します。

## テスト方針

### テストピラミッド

```
        ┌─────────────┐
        │   E2E Test  │  少ない（遅い、脆い）
        ├─────────────┤
        │ Integration │  中程度（実DB接続）
        │    Test     │
        ├─────────────┤
        │    Unit     │  多い（速い、安定）
        │    Test     │
        └─────────────┘
```

### テストカバレッジ目標

- **Unit Test**: 80% 以上
- **Integration Test**: 主要なフロー
- **E2E Test**: クリティカルパス

---

## バックエンド テスト戦略

### ディレクトリ構成

```
apps/api/
├── internal/
│   ├── domains/
│   │   └── models/
│   │       ├── user.go
│   │       └── user_test.go              # ドメインロジックのテスト
│   │
│   ├── usecases/
│   │   └── user/
│   │       ├── create_user.go
│   │       └── create_user_test.go       # ユースケースの単体テスト
│   │
│   ├── infrastructures/
│   │   └── repositories/
│   │       ├── user_repository_impl.go
│   │       └── user_repository_impl_test.go  # リポジトリの統合テスト
│   │
│   └── testutils/                        # テストユーティリティ
│       ├── mocks/
│       │   ├── repository_mocks.go       # リポジトリモック
│       │   └── usecase_mocks.go          # ユースケースモック
│       ├── fixtures/
│       │   └── test_data.go              # テストデータ
│       └── helpers/
│           └── db_helper.go              # DB接続ヘルパー
│
└── go.mod
```

### 1. ドメインロジックのテスト

**対象**: `domains/models/`

**テスト内容**: エンティティのメソッド

```go
// domains/models/user_test.go
package models

import (
    "testing"
    "github.com/stretchr/testify/assert"
)

func TestUser_HashPassword(t *testing.T) {
    t.Run("should hash password successfully", func(t *testing.T) {
        // Arrange
        user := &User{
            Username: "testuser",
            Email:    "test@example.com",
            Password: "password123",
        }

        // Act
        err := user.HashPassword()

        // Assert
        assert.NoError(t, err)
        assert.NotEqual(t, "password123", user.Password)
        assert.NotEmpty(t, user.Password)
    })
}

func TestUser_CheckPassword(t *testing.T) {
    t.Run("should return true for correct password", func(t *testing.T) {
        // Arrange
        user := &User{Password: "password123"}
        user.HashPassword()

        // Act
        result := user.CheckPassword("password123")

        // Assert
        assert.True(t, result)
    })

    t.Run("should return false for incorrect password", func(t *testing.T) {
        // Arrange
        user := &User{Password: "password123"}
        user.HashPassword()

        // Act
        result := user.CheckPassword("wrongpassword")

        // Assert
        assert.False(t, result)
    })
}
```

### 2. ユースケースの単体テスト（モック使用）

**対象**: `usecases/`

**テスト内容**: ビジネスロジック

**モック**: リポジトリをモック化

```go
// usecases/user/create_user_test.go
package user

import (
    "context"
    "testing"
    "github.com/stretchr/testify/assert"
    "github.com/stretchr/testify/mock"
    "github.com/yourusername/x-clone/internal/domains/models"
    "github.com/yourusername/x-clone/internal/domains/errors"
    "github.com/yourusername/x-clone/internal/testutils/mocks"
)

func TestCreateUserUseCase_Execute(t *testing.T) {
    t.Run("should create user successfully", func(t *testing.T) {
        // Arrange
        mockRepo := new(mocks.MockUserRepository)
        useCase := NewCreateUserUseCase(mockRepo)

        input := CreateUserInput{
            Username: "testuser",
            Email:    "test@example.com",
            Password: "password123",
        }

        // モックの設定: FindByEmail は nil を返す（ユーザーが存在しない）
        mockRepo.On("FindByEmail", mock.Anything, input.Email).Return(nil, nil)

        // モックの設定: Create は成功
        mockRepo.On("Create", mock.Anything, mock.AnythingOfType("*models.User")).Return(nil)

        // Act
        output, err := useCase.Execute(context.Background(), input)

        // Assert
        assert.NoError(t, err)
        assert.NotNil(t, output)
        assert.Equal(t, "testuser", output.User.Username)
        assert.Equal(t, "test@example.com", output.User.Email)
        assert.NotEqual(t, "password123", output.User.Password) // パスワードはハッシュ化されている

        // モックが呼ばれたことを確認
        mockRepo.AssertExpectations(t)
    })

    t.Run("should return error when user already exists", func(t *testing.T) {
        // Arrange
        mockRepo := new(mocks.MockUserRepository)
        useCase := NewCreateUserUseCase(mockRepo)

        input := CreateUserInput{
            Username: "testuser",
            Email:    "test@example.com",
            Password: "password123",
        }

        existingUser := &models.User{
            ID:       1,
            Username: "testuser",
            Email:    "test@example.com",
        }

        // モックの設定: FindByEmail は既存ユーザーを返す
        mockRepo.On("FindByEmail", mock.Anything, input.Email).Return(existingUser, nil)

        // Act
        output, err := useCase.Execute(context.Background(), input)

        // Assert
        assert.Error(t, err)
        assert.Nil(t, output)
        assert.Equal(t, errors.ErrUserAlreadyExists, err)

        mockRepo.AssertExpectations(t)
    })

    t.Run("should return error when input is invalid", func(t *testing.T) {
        // Arrange
        mockRepo := new(mocks.MockUserRepository)
        useCase := NewCreateUserUseCase(mockRepo)

        input := CreateUserInput{
            Username: "",
            Email:    "",
            Password: "",
        }

        // Act
        output, err := useCase.Execute(context.Background(), input)

        // Assert
        assert.Error(t, err)
        assert.Nil(t, output)
        assert.Equal(t, errors.ErrInvalidInput, err)

        // FindByEmail は呼ばれない
        mockRepo.AssertNotCalled(t, "FindByEmail")
    })
}
```

### 3. リポジトリの統合テスト（実DB接続）

**対象**: `infrastructures/repositories/`

**テスト内容**: データベース操作

**DB**: テスト用 PostgreSQL（Docker）

```go
// infrastructures/repositories/user_repository_impl_test.go
package repositories

import (
    "context"
    "testing"
    "github.com/stretchr/testify/assert"
    "github.com/yourusername/x-clone/internal/domains/models"
    "github.com/yourusername/x-clone/internal/testutils/helpers"
)

func TestUserRepository_Create(t *testing.T) {
    // テスト用DB接続
    db := helpers.SetupTestDB(t)
    defer helpers.TeardownTestDB(t, db)

    repo := NewUserRepository(db)

    t.Run("should create user successfully", func(t *testing.T) {
        // Arrange
        user := &models.User{
            Username: "testuser",
            Email:    "test@example.com",
            Password: "hashedpassword",
        }

        // Act
        err := repo.Create(context.Background(), user)

        // Assert
        assert.NoError(t, err)
        assert.NotZero(t, user.ID)
    })

    t.Run("should return error when email is duplicate", func(t *testing.T) {
        // Arrange
        user1 := &models.User{
            Username: "user1",
            Email:    "duplicate@example.com",
            Password: "password",
        }
        repo.Create(context.Background(), user1)

        user2 := &models.User{
            Username: "user2",
            Email:    "duplicate@example.com",
            Password: "password",
        }

        // Act
        err := repo.Create(context.Background(), user2)

        // Assert
        assert.Error(t, err)
    })
}

func TestUserRepository_FindByID(t *testing.T) {
    db := helpers.SetupTestDB(t)
    defer helpers.TeardownTestDB(t, db)

    repo := NewUserRepository(db)

    t.Run("should find user by ID", func(t *testing.T) {
        // Arrange
        user := &models.User{
            Username: "testuser",
            Email:    "test@example.com",
            Password: "password",
        }
        repo.Create(context.Background(), user)

        // Act
        foundUser, err := repo.FindByID(context.Background(), user.ID)

        // Assert
        assert.NoError(t, err)
        assert.NotNil(t, foundUser)
        assert.Equal(t, user.ID, foundUser.ID)
        assert.Equal(t, user.Username, foundUser.Username)
    })

    t.Run("should return error when user not found", func(t *testing.T) {
        // Act
        foundUser, err := repo.FindByID(context.Background(), 9999)

        // Assert
        assert.Error(t, err)
        assert.Nil(t, foundUser)
    })
}
```

