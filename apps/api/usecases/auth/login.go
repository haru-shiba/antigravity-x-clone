package auth

import (
	"context"
	"time"

	"github.com/google/uuid"
	domainErrors "github.com/taiji-shibata/antigravity-x-clone/apps/api/domains/errors"
	"github.com/taiji-shibata/antigravity-x-clone/apps/api/domains/models"
	infraAuth "github.com/taiji-shibata/antigravity-x-clone/apps/api/infrastructures/auth"
	"github.com/taiji-shibata/antigravity-x-clone/apps/api/repositories"
)

type LoginUseCase struct {
	userRepo       repositories.UserRepository
	sessionManager *infraAuth.SessionManager
}

func NewLoginUseCase(userRepo repositories.UserRepository, sessionManager *infraAuth.SessionManager) *LoginUseCase {
	return &LoginUseCase{
		userRepo:       userRepo,
		sessionManager: sessionManager,
	}
}

type LoginInput struct {
	Email    string
	Password string
}

type LoginOutput struct {
	SessionID string
	User      *models.User
}

func (uc *LoginUseCase) Execute(ctx context.Context, input LoginInput) (*LoginOutput, error) {
	// Validation
	if input.Email == "" || input.Password == "" {
		return nil, domainErrors.ErrInvalidInput
	}

	// Find user
	user, err := uc.userRepo.FindByEmail(ctx, input.Email)
	if err != nil {
		return nil, domainErrors.ErrUserNotFound // Or generic invalid credentials
	}

	// Check password
	if !user.CheckPassword(input.Password) {
		return nil, domainErrors.ErrInvalidInput // Invalid credentials
	}

	// Generate Session ID
	sessionID := uuid.New().String()

	// Store session in Redis (e.g., 24 hours)
	err = uc.sessionManager.Set(ctx, "session:"+sessionID, user.ID, 24*time.Hour)
	if err != nil {
		return nil, err
	}

	return &LoginOutput{
		SessionID: sessionID,
		User:      user,
	}, nil
}
