package user

import (
	"context"
	"errors"
	"regexp"

	domainErrors "github.com/taiji-shibata/antigravity-x-clone/apps/api/domains/errors"
	"github.com/taiji-shibata/antigravity-x-clone/apps/api/domains/models"
	"github.com/taiji-shibata/antigravity-x-clone/apps/api/repositories"
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
	// Validation
	if input.Username == "" || input.Email == "" || input.Password == "" {
		return nil, domainErrors.ErrInvalidInput
	}

	// Password validation: At least 8 characters, alphanumeric + symbols
	// Allowed characters: a-z, A-Z, 0-9, and symbols
	passwordRegex := regexp.MustCompile(`^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{8,}$`)
	if !passwordRegex.MatchString(input.Password) {
		return nil, domainErrors.ErrInvalidInput
	}

	// Check for existing user
	_, err := uc.userRepo.FindByEmail(ctx, input.Email)
	if err == nil {
		return nil, domainErrors.ErrUserAlreadyExists
	}
	if !errors.Is(err, domainErrors.ErrUserNotFound) {
		return nil, err
	}

	// Create user entity
	user := &models.User{
		Username: input.Username,
		Email:    input.Email,
		Password: input.Password,
	}

	// Hash password
	if err := user.HashPassword(); err != nil {
		return nil, err
	}

	// Save to repository
	if err := uc.userRepo.Create(ctx, user); err != nil {
		return nil, err
	}

	return &CreateUserOutput{User: user}, nil
}
