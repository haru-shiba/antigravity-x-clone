# バックエンド コーディング規約

このドキュメントは、Go/Gin バックエンドにおけるコーディング規約とベストプラクティスを定義します。

> [!NOTE]
> アーキテクチャの詳細は [backend-architecture.md](.agent/workflows/backend-architecture.md) を参照してください。

---

---

## コーディング規約

### ファイル命名規則

- **小文字 + アンダースコア**: `user_repository.go`, `create_user.go`
- **テストファイル**: `user_repository_test.go`
- **実装ファイル**: `user_repository_impl.go` (インターフェース実装の場合)

### 命名規則

#### パッケージ名
- **小文字のみ**: `user`, `post`, `auth`
- **単数形**: `user` (not `users`)

```go
// [OK] 良い例
package user
package post

// [NG] 悪い例
package users
package userManagement
```

#### 変数名
- **camelCase**: `userID`, `postContent`, `createdAt`
- **略語は大文字**: `userID`, `apiKey`, `httpClient`

```go
// [OK] 良い例
var userID uint
var apiKey string

// [NG] 悪い例
var user_id uint
var userId uint  // ID は大文字
```

#### 関数名
- **PascalCase (exported)**: `CreateUser`, `GetUserByID`
- **camelCase (unexported)**: `validateInput`, `hashPassword`
- **動詞で始める**: `Create`, `Get`, `Update`, `Delete`

```go
// [OK] 良い例
func CreateUser(ctx context.Context, user *models.User) error
func validateInput(input string) error

// [NG] 悪い例
func User(ctx context.Context, user *models.User) error  // 動詞がない
func get_user(ctx context.Context, id uint) (*models.User, error)  // スネークケース
```

### 関数定義

#### 基本形式

```go
// [OK] 良い例: func キーワードを使用
func CreateUser(ctx context.Context, user *models.User) error {
    // 実装
}
```

#### レシーバー名
- **1〜2文字**: `u`, `uc`, `h`, `r`
- **一貫性**: 同じ構造体では同じレシーバー名を使用

```go
// [OK] 良い例
type UserHandler struct {
    createUserUC *user.CreateUserUseCase
}

func (h *UserHandler) CreateUser(c *gin.Context) {
    // 実装
}

func (h *UserHandler) GetUser(c *gin.Context) {
    // 実装
}
```

#### 引数の順序
1. **context.Context**: 常に最初の引数
2. **主要な引数**: ID, エンティティなど
3. **オプション引数**: limit, offset など

```go
// [OK] 良い例
func GetUser(ctx context.Context, id uint) (*models.User, error)
func ListUsers(ctx context.Context, limit, offset int) ([]*models.User, error)
```

#### 戻り値
- **エラーは最後**: `(result, error)` の順序

```go
// [OK] 良い例
func GetUser(ctx context.Context, id uint) (*models.User, error) {
    // 実装
}
```

### 構造体定義

#### タグの順序
1. **gorm**: データベース関連
2. **json**: JSON シリアライズ
3. **validate**: バリデーション

```go
// [OK] 良い例
type User struct {
    ID        uint      `gorm:"primaryKey" json:"id"`
    Username  string    `gorm:"unique;not null" json:"username" validate:"required,min=3,max=50"`
    Email     string    `gorm:"unique;not null" json:"email" validate:"required,email"`
    Password  string    `gorm:"not null" json:"-"`
    CreatedAt time.Time `gorm:"autoCreateTime" json:"created_at"`
}
```

#### フィールドの順序
1. **ID**: 主キー
2. **主要フィールド**: Username, Email など
3. **関連フィールド**: 外部キー
4. **タイムスタンプ**: CreatedAt, UpdatedAt

### エラーハンドリング

```go
// [OK] 良い例: 即座にエラーチェック
user, err := uc.userRepo.FindByID(ctx, id)
if err != nil {
    return nil, err
}

// [OK] 良い例: fmt.Errorf with %w
if err := uc.userRepo.Create(ctx, user); err != nil {
    return nil, fmt.Errorf("failed to create user: %w", err)
}

// [NG] 悪い例: エラーを無視
user, _ := uc.userRepo.FindByID(ctx, id)
```

### データベース操作

```go
// [OK] 良い例: プレースホルダーを使用
db.Where("email = ?", email).First(&user)

// [OK] 良い例: トランザクション
err := r.db.Transaction(func(tx *gorm.DB) error {
    if err := tx.Create(&user).Error; err != nil {
        return err
    }
    return nil
})

// [OK] 良い例: Preload で N+1 問題を回避
db.Preload("User").Find(&posts)

// [NG] 悪い例: 文字列連結（SQLインジェクションのリスク）
db.Where("email = '" + email + "'").First(&user)
```

### HTTPハンドラー

```go
// [OK] 良い例: 適切なステータスコードを使用
c.JSON(http.StatusOK, response)           // 200
c.JSON(http.StatusCreated, response)      // 201
c.JSON(http.StatusBadRequest, gin.H{"error": "invalid input"})  // 400
c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"}) // 401
c.JSON(http.StatusNotFound, gin.H{"error": "not found"})        // 404

// [OK] 良い例: ShouldBindJSON を使用
var req requests.CreateUserRequest
if err := c.ShouldBindJSON(&req); err != nil {
    c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
    return
}
```

---

## 禁止事項

### [NG] 絶対にやってはいけないこと

#### 1. パニックを使用しない

```go
// [NG] 悪い例
if err != nil {
    panic(err)
}

// [OK] 良い例
if err != nil {
    return nil, err
}
```

#### 2. グローバル変数を使用しない

```go
// [NG] 悪い例
var db *gorm.DB

func GetUser(id uint) (*User, error) {
    return db.First(&user, id)
}

// [OK] 良い例
type UserRepository struct {
    db *gorm.DB
}

func (r *UserRepository) GetUser(ctx context.Context, id uint) (*User, error) {
    return r.db.WithContext(ctx).First(&user, id)
}
```

#### 3. init() 関数を避ける

```go
// [NG] 悪い例
func init() {
    db = connectDB()
}

// [OK] 良い例
func main() {
    db, err := connectDB()
    if err != nil {
        log.Fatal(err)
    }
}
```

#### 4. エラーハンドリングを省略しない

```go
// [NG] 悪い例
user, _ := uc.userRepo.FindByID(ctx, id)

// [OK] 良い例
user, err := uc.userRepo.FindByID(ctx, id)
if err != nil {
    return nil, err
}
```

#### 5. SQL インジェクションの脆弱性を残さない

```go
// [NG] 悪い例
db.Where("email = '" + email + "'").First(&user)

// [OK] 良い例
db.Where("email = ?", email).First(&user)
```

---

## まとめ

### 重要なポイント

1. **依存関係の方向**: 外側から内側へ（Presentation → UseCase → Repository → Domain）
2. **インターフェース分離**: Repositoryはインターフェースと実装を分離
3. **単一責任**: 各層は明確な責務を持つ
4. **テスタビリティ**: インターフェースを使用してモック可能に
5. **ドメイン駆動**: ビジネスロジックはドメイン層とユースケース層に集中

### チェックリスト

- [ ] ファイル名は小文字 + アンダースコア
- [ ] パッケージ名は小文字のみ
- [ ] 関数名は PascalCase (exported) または camelCase (unexported)
- [ ] 変数名は camelCase
- [ ] 構造体タグの順序: gorm → json → validate
- [ ] エラーは常にチェック
- [ ] context.Context は最初の引数
- [ ] エラーは最後の戻り値
- [ ] GORM クエリはプレースホルダーを使用
- [ ] テスト関数名は Test + 関数名 + 条件 + 期待結果
