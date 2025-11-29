---
description: 段階的な実装ワークフロー
---

# 段階的実装ワークフロー

このワークフローは、Clean Architecture に基づいた段階的な実装プロセスを定義します。

## 実装の基本原則

### 1. 必ず確認を取る

各フェーズの実装前に、以下を含む **実装計画書** を作成し、ユーザーの承認を得る:

- 実装する機能の概要
- 作成・変更するファイルのリスト
- 主要なコード例
- テスト計画

### 2. 段階的に実装

一度にすべてを実装せず、以下の順序で段階的に進める:

```
Phase 1: スキーマ設計
  ↓
Phase 2: Repository層
  ↓
Phase 3: UseCase層
  ↓
Phase 4: Presentation層
  ↓
Phase 5: フロントエンド
```

### 3. 各フェーズでテスト

実装後、必ずテストを実行して動作を確認:

- Unit Test
- Integration Test
- E2E Test（必要に応じて）

---

## Phase 1: スキーマ設計

### 目的

データベーススキーマとエンティティを定義する。

### 成果物

- [ ] エンティティ定義 (`domains/models/`)
- [ ] マイグレーション設定
- [ ] シードデータ（開発用）

### 実装手順

#### 1.1 エンティティ定義

```go
// internal/domains/models/user.go
package models

import (
    "time"
    "golang.org/x/crypto/bcrypt"
)

type User struct {
    ID        uint      `gorm:"primaryKey" json:"id"`
    Username  string    `gorm:"unique;not null;size:50" json:"username"`
    Email     string    `gorm:"unique;not null;size:255" json:"email"`
    Password  string    `gorm:"not null" json:"-"`
    Bio       string    `gorm:"size:160" json:"bio"`
    Avatar    string    `json:"avatar"`
    CreatedAt time.Time `gorm:"autoCreateTime" json:"created_at"`
    UpdatedAt time.Time `gorm:"autoUpdateTime" json:"updated_at"`
}

// ドメインロジック
func (u *User) HashPassword() error {
    hashedPassword, err := bcrypt.GenerateFromPassword([]byte(u.Password), bcrypt.DefaultCost)
    if err != nil {
        return err
    }
    u.Password = string(hashedPassword)
    return nil
}

func (u *User) CheckPassword(password string) bool {
    err := bcrypt.CompareHashAndPassword([]byte(u.Password), []byte(password))
    return err == nil
}
```

#### 1.2 マイグレーション設定

```go
// internal/infrastructures/databases/migrate.go
package databases

import (
    "gorm.io/gorm"
    "github.com/yourusername/x-clone/internal/domains/models"
)

func Migrate(db *gorm.DB) error {
    return db.AutoMigrate(
        &models.User{},
        &models.Post{},
        &models.Like{},
        &models.Follow{},
    )
}
```

#### 1.3 シードデータ

```go
// internal/domains/seeds/init.go
package seeds

import (
    "gorm.io/gorm"
    "github.com/yourusername/x-clone/internal/domains/models"
)

func SeedUsers(db *gorm.DB) error {
    users := []models.User{
        {Username: "alice", Email: "alice@example.com", Password: "password123"},
        {Username: "bob", Email: "bob@example.com", Password: "password123"},
    }

    for i := range users {
        users[i].HashPassword()
        if err := db.Create(&users[i]).Error; err != nil {
            return err
        }
    }

    return nil
}
```

### 確認事項

- [ ] エンティティの定義は正しいか？
- [ ] リレーションは適切か？
- [ ] インデックスは必要か？
- [ ] ドメインロジックは適切か？

---

## Phase 2: Repository層

### 目的

データアクセス層を実装する。

### 成果物

- [ ] Repositoryインターフェース (`repositories/`)
- [ ] Repository実装 (`infrastructures/repositories/`)
- [ ] Repository統合テスト

### 実装手順

#### 2.1 Repositoryインターフェース

```go
// internal/repositories/user_repository.go
package repositories

import (
    "context"
    "github.com/yourusername/x-clone/internal/domains/models"
)

type UserRepository interface {
    Create(ctx context.Context, user *models.User) error
    FindByID(ctx context.Context, id uint) (*models.User, error)
    FindByEmail(ctx context.Context, email string) (*models.User, error)
    FindByUsername(ctx context.Context, username string) (*models.User, error)
    Update(ctx context.Context, user *models.User) error
    Delete(ctx context.Context, id uint) error
    List(ctx context.Context, limit, offset int) ([]*models.User, error)
}
```

#### 2.2 Repository実装

```go
// internal/infrastructures/repositories/user_repository_impl.go
package repositories

import (
    "context"
    "gorm.io/gorm"
    "github.com/yourusername/x-clone/internal/domains/models"
    "github.com/yourusername/x-clone/internal/repositories"
)

type userRepositoryImpl struct {
    db *gorm.DB
}

func NewUserRepository(db *gorm.DB) repositories.UserRepository {
    return &userRepositoryImpl{db: db}
}

func (r *userRepositoryImpl) Create(ctx context.Context, user *models.User) error {
    return r.db.WithContext(ctx).Create(user).Error
}

func (r *userRepositoryImpl) FindByID(ctx context.Context, id uint) (*models.User, error) {
    var user models.User
    err := r.db.WithContext(ctx).First(&user, id).Error
    if err != nil {
        return nil, err
    }
    return &user, nil
}

// ... 他のメソッド実装
```

#### 2.3 Repository統合テスト

```go
// internal/infrastructures/repositories/user_repository_impl_test.go
package repositories

import (
    "context"
    "testing"
    "github.com/stretchr/testify/assert"
    "github.com/yourusername/x-clone/internal/domains/models"
    "github.com/yourusername/x-clone/internal/testutils/helpers"
)

func TestUserRepository_Create(t *testing.T) {
    db := helpers.SetupTestDB(t)
    defer helpers.TeardownTestDB(t, db)

    repo := NewUserRepository(db)

    t.Run("should create user successfully", func(t *testing.T) {
        user := &models.User{
            Username: "testuser",
            Email:    "test@example.com",
            Password: "hashedpassword",
        }

        err := repo.Create(context.Background(), user)

        assert.NoError(t, err)
        assert.NotZero(t, user.ID)
    })
}
```

### 確認事項

- [ ] インターフェースは必要なメソッドを含んでいるか？
- [ ] 実装はインターフェースを満たしているか？
- [ ] エラーハンドリングは適切か？
- [ ] テストは実DBで動作するか？

---

## Phase 3: UseCase層

### 目的

ビジネスロジックを実装する。

### 成果物

- [ ] UseCase実装 (`usecases/`)
- [ ] UseCase単体テスト（モック使用）

### 実装手順

#### 3.1 UseCase実装

```go
// internal/usecases/user/create_user.go
package user

import (
    "context"
    "github.com/yourusername/x-clone/internal/domains/models"
    "github.com/yourusername/x-clone/internal/domains/errors"
    "github.com/yourusername/x-clone/internal/repositories"
)

type CreateUserUseCase struct {
    userRepo repositories.UserRepository
}

func NewCreateUserUseCase(userRepo repositories.UserRepository) *CreateUserUseCase {
    return &CreateUserUseCase{
        userRepo: userRepo,
    }
}

type CreateUserInput struct {
    Username string
    Email    string
    Password string
}

type CreateUserOutput struct {
    User *models.User
}

func (uc *CreateUserUseCase) Execute(ctx context.Context, input CreateUserInput) (*CreateUserOutput, error) {
    // バリデーション
    if input.Username == "" || input.Email == "" || input.Password == "" {
        return nil, errors.ErrInvalidInput
    }

    // 既存ユーザーチェック
    existingUser, _ := uc.userRepo.FindByEmail(ctx, input.Email)
    if existingUser != nil {
        return nil, errors.ErrUserAlreadyExists
    }

    // ユーザー作成
    user := &models.User{
        Username: input.Username,
        Email:    input.Email,
        Password: input.Password,
    }

    if err := user.HashPassword(); err != nil {
        return nil, err
    }

    if err := uc.userRepo.Create(ctx, user); err != nil {
        return nil, err
    }

    return &CreateUserOutput{User: user}, nil
}
```

#### 3.2 UseCase単体テスト

```go
// internal/usecases/user/create_user_test.go
package user

import (
    "context"
    "testing"
    "github.com/stretchr/testify/assert"
    "github.com/stretchr/testify/mock"
    "github.com/yourusername/x-clone/internal/testutils/mocks"
)

func TestCreateUserUseCase_Execute(t *testing.T) {
    t.Run("should create user successfully", func(t *testing.T) {
        mockRepo := new(mocks.MockUserRepository)
        useCase := NewCreateUserUseCase(mockRepo)

        input := CreateUserInput{
            Username: "testuser",
            Email:    "test@example.com",
            Password: "password123",
        }

        mockRepo.On("FindByEmail", mock.Anything, input.Email).Return(nil, nil)
        mockRepo.On("Create", mock.Anything, mock.AnythingOfType("*models.User")).Return(nil)

        output, err := useCase.Execute(context.Background(), input)

        assert.NoError(t, err)
        assert.NotNil(t, output)
        mockRepo.AssertExpectations(t)
    })
}
```

### 確認事項

- [ ] ビジネスロジックは正しいか？
- [ ] バリデーションは適切か？
- [ ] エラーハンドリングは適切か？
- [ ] モックを使ったテストは動作するか？

---

## Phase 4: Presentation層

### 目的

HTTPハンドラーとルーティングを実装する。
