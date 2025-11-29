# バックエンドテスト - 統合テスト

このドキュメントは、Repository層の統合テスト、モックの共通化、DBヘルパーを説明します。

> [!NOTE]
> ドメインとUseCaseの単体テストは [testing-backend-unit.md](testing-backend-unit.md) を参照してください。

---

### 4. モックの共通化

**ファイル**: `testutils/mocks/repository_mocks.go`

```go
// testutils/mocks/repository_mocks.go
package mocks

import (
    "context"
    "github.com/stretchr/testify/mock"
    "github.com/yourusername/x-clone/internal/domains/models"
)

// MockUserRepository は UserRepository のモック実装
type MockUserRepository struct {
    mock.Mock
}

func (m *MockUserRepository) Create(ctx context.Context, user *models.User) error {
    args := m.Called(ctx, user)
    return args.Error(0)
}

func (m *MockUserRepository) FindByID(ctx context.Context, id uint) (*models.User, error) {
    args := m.Called(ctx, id)
    if args.Get(0) == nil {
        return nil, args.Error(1)
    }
    return args.Get(0).(*models.User), args.Error(1)
}

func (m *MockUserRepository) FindByEmail(ctx context.Context, email string) (*models.User, error) {
    args := m.Called(ctx, email)
    if args.Get(0) == nil {
        return nil, args.Error(1)
    }
    return args.Get(0).(*models.User), args.Error(1)
}

func (m *MockUserRepository) FindByUsername(ctx context.Context, username string) (*models.User, error) {
    args := m.Called(ctx, username)
    if args.Get(0) == nil {
        return nil, args.Error(1)
    }
    return args.Get(0).(*models.User), args.Error(1)
}

func (m *MockUserRepository) Update(ctx context.Context, user *models.User) error {
    args := m.Called(ctx, user)
    return args.Error(0)
}

func (m *MockUserRepository) Delete(ctx context.Context, id uint) error {
    args := m.Called(ctx, id)
    return args.Error(0)
}

func (m *MockUserRepository) List(ctx context.Context, limit, offset int) ([]*models.User, error) {
    args := m.Called(ctx, limit, offset)
    if args.Get(0) == nil {
        return nil, args.Error(1)
    }
    return args.Get(0).([]*models.User), args.Error(1)
}
```

### 5. テストデータの共通化

**ファイル**: `testutils/fixtures/test_data.go`

```go
// testutils/fixtures/test_data.go
package fixtures

import "github.com/yourusername/x-clone/internal/domains/models"

// CreateTestUser はテスト用のユーザーを作成
func CreateTestUser(username, email, password string) *models.User {
    return &models.User{
        Username: username,
        Email:    email,
        Password: password,
    }
}

// CreateTestPost はテスト用の投稿を作成
func CreateTestPost(userID uint, content string) *models.Post {
    return &models.Post{
        UserID:  userID,
        Content: content,
    }
}

// DefaultTestUser はデフォルトのテストユーザーを返す
func DefaultTestUser() *models.User {
    return CreateTestUser("testuser", "test@example.com", "password123")
}
```

### 6. DB接続ヘルパー

**ファイル**: `testutils/helpers/db_helper.go`

```go
// testutils/helpers/db_helper.go
package helpers

import (
    "fmt"
    "testing"
    "gorm.io/driver/postgres"
    "gorm.io/gorm"
    "github.com/yourusername/x-clone/internal/domains/models"
)

// SetupTestDB はテスト用のDB接続を作成
func SetupTestDB(t *testing.T) *gorm.DB {
    dsn := "host=localhost user=test password=test dbname=test_db port=5433 sslmode=disable"
    db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
    if err != nil {
        t.Fatalf("Failed to connect to test database: %v", err)
    }

    // マイグレーション
    db.AutoMigrate(&models.User{}, &models.Post{}, &models.Like{}, &models.Follow{})

    return db
}

// TeardownTestDB はテスト後のクリーンアップ
func TeardownTestDB(t *testing.T, db *gorm.DB) {
    // テーブルをクリア
    db.Exec("TRUNCATE TABLE users, posts, likes, follows RESTART IDENTITY CASCADE")

    sqlDB, err := db.DB()
    if err != nil {
        t.Fatalf("Failed to get database instance: %v", err)
    }
    sqlDB.Close()
}

// SeedTestData はテストデータを投入
func SeedTestData(db *gorm.DB) {
    users := []*models.User{
        {Username: "user1", Email: "user1@example.com", Password: "password"},
        {Username: "user2", Email: "user2@example.com", Password: "password"},
    }

    for _, user := range users {
        db.Create(user)
    }
}
```

### 7. テスト実行

```bash
# すべてのテストを実行
go test ./...

# カバレッジを表示
go test -cover ./...

# カバレッジレポートを生成
go test -coverprofile=coverage.out ./...
go tool cover -html=coverage.out -o coverage.html

# 特定のパッケージのテストを実行
go test ./internal/usecases/user/...

# 詳細な出力
go test -v ./...
```

