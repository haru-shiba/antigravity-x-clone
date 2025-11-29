package user

import (
	"context"

	"github.com/taiji-shibata/antigravity-x-clone/apps/api/domains/models"
	"github.com/taiji-shibata/antigravity-x-clone/apps/api/repositories"
)

type GetUserProfileUseCase struct {
	userRepo repositories.UserRepository
}

func NewGetUserProfileUseCase(userRepo repositories.UserRepository) *GetUserProfileUseCase {
	return &GetUserProfileUseCase{userRepo: userRepo}
}

func (uc *GetUserProfileUseCase) Execute(ctx context.Context, username string) (*models.User, error) {
	return uc.userRepo.FindByUsername(ctx, username)
}
