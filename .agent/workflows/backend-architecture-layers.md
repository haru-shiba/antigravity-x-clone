---
description: 
---

# バックエンド Clean Architecture - 各層の詳細

このドキュメントは、Clean Architecture の各層の責務と実装例、DI、エラーハンドリングを詳しく説明します。

> [!NOTE]
> アーキテクチャ概要とディレクトリ構成は [backend-architecture-overview.md](backend-architecture-overview.md) を参照してください。

---


### 1. Domain Layer (`domains/`)

**責務:**
- ビジネスルールの定義
- エンティティの定義
- ドメインエラーの定義

**ルール:**
- 他の層に依存しない
- GORMタグは許可（永続化のメタデータ）
- ビジネスロジックはメソッドとして実装

**実装例:**

```go
// domains/models/user.go
package models

import (
    "time"
    "golang.org/x/crypto/bcrypt"
)

type User struct {
    ID        uint      `gorm:"primaryKey" json:"id"`
    Username  string    `gorm:"unique;not null" json:"username"`
    Email     string    `gorm:"unique;not null" json:"email"`
    Password  string    `gorm:"not null" json:"-"`
    Bio       string    `json:"bio"`
    CreatedAt time.Time `json:"created_at"`
    UpdatedAt time.Time `json:"updated_at"`
}

// ドメインロジック: パスワードのハッシュ化
func (u *User) HashPassword() error {
    hashedPassword, err := bcrypt.GenerateFromPassword([]byte(u.Password), bcrypt.DefaultCost)
    if err != nil {
        return err
    }
    u.Password = string(hashedPassword)
    return nil
}

// ドメインロジック: パスワードの検証
func (u *User) CheckPassword(password string) bool {
    err := bcrypt.CompareHashAndPassword([]byte(u.Password), []byte(password))
    return err == nil
}
```

### 2. Repository Interface (`repositories/`)

**責務:**
- データアクセスの抽象化
- インターフェース定義のみ

**ルール:**
- 実装を含まない（インターフェースのみ）
- ドメインモデルを使用
- エラーは標準エラーまたはドメインエラーを返す

**実装例:**

```go
// repositories/user_repository.go
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

### 3. UseCase Layer (`usecases/`)

**責務:**
- アプリケーションのビジネスロジック
- トランザクション制御
- 複数のリポジトリの調整

**ルール:**
- Repositoryインターフェースに依存
- Infrastructureに直接依存しない
- 1ユースケース = 1ファイル
- 構造体でユースケースを定義

**実装例:**

```go
// usecases/user/create_user.go
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

    // パスワードハッシュ化（ドメインロジック）
    if err := user.HashPassword(); err != nil {
        return nil, err
    }

    // 保存
    if err := uc.userRepo.Create(ctx, user); err != nil {
        return nil, err
    }

    return &CreateUserOutput{User: user}, nil
}
```

### 4. Presentation Layer (`presentation/`)

**責務:**
- HTTPリクエスト/レスポンス処理
- DTOへの変換
- バリデーション（形式チェック）

**ルール:**
- UseCaseに依存
- ドメインモデルを直接返さない（DTOに変換）
- HTTPステータスコードの管理

**実装例:**

```go
// presentation/handlers/user_handler.go
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

### 5. Infrastructure Layer (`infrastructures/`)

**責務:**
- Repository実装
- データベース接続
- 外部API実装

**ルール:**
- Repositoryインターフェースを実装
- GORM等の技術詳細を隠蔽
- エラーをドメインエラーに変換

**実装例:**

```go
// infrastructures/repositories/user_repository_impl.go
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

func (r *userRepositoryImpl) FindByEmail(ctx context.Context, email string) (*models.User, error) {
    var user models.User
    err := r.db.WithContext(ctx).Where("email = ?", email).First(&user).Error
    if err != nil {
        return nil, err
    }
    return &user, nil
}

// ... 他のメソッド実装
```

---

## Dependency Injection (DI)

**main.go での DI 設定:**

```go
// cmd/api/main.go
package main

import (
    "log"
    "github.com/gin-gonic/gin"
    "github.com/yourusername/x-clone/internal/infrastructures/databases"
    infraRepos "github.com/yourusername/x-clone/internal/infrastructures/repositories"
    "github.com/yourusername/x-clone/internal/usecases/user"
    "github.com/yourusername/x-clone/internal/presentation/handlers"
    "github.com/yourusername/x-clone/internal/routes"
)

func main() {
    // データベース接続
    db, err := databases.NewDatabase()
    if err != nil {
        log.Fatal("Failed to connect to database:", err)
    }

    // マイグレーション
    if err := databases.Migrate(db); err != nil {
        log.Fatal("Failed to migrate:", err)
    }

    // Repository層の初期化
    userRepo := infraRepos.NewUserRepository(db)
    postRepo := infraRepos.NewPostRepository(db)

    // UseCase層の初期化
    createUserUC := user.NewCreateUserUseCase(userRepo)
    getUserUC := user.NewGetUserUseCase(userRepo)

    // Handler層の初期化
    userHandler := handlers.NewUserHandler(createUserUC, getUserUC)
    
    // ルーター設定
    router := gin.Default()
    routes.SetupRoutes(router, userHandler)

    // サーバー起動
    if err := router.Run(":8080"); err != nil {
        log.Fatal("Failed to start server:", err)
    }
}
```

---

## エラーハンドリング

### ドメインエラーの定義

```go
// domains/errors/errors.go
package errors

import "errors"

var (
    ErrUserNotFound      = errors.New("user not found")
    ErrUserAlreadyExists = errors.New("user already exists")
    ErrInvalidInput      = errors.New("invalid input")
    ErrUnauthorized      = errors.New("unauthorized")
    ErrForbidden         = errors.New("forbidden")
)
```

### エラーのハンドリング

```go
// presentation/handlers/user_handler.go
func (h *UserHandler) GetUser(c *gin.Context) {
    // ...
    output, err := h.getUserUC.Execute(c.Request.Context(), input)
    if err != nil {
        switch err {
        case domainErrors.ErrUserNotFound:
            c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
        case domainErrors.ErrUnauthorized:
            c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
        default:
            c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        }
        return
    }
    // ...
}
```

