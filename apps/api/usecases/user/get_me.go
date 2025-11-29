package user

import (
	"context"

	"github.com/taiji-shibata/antigravity-x-clone/apps/api/domains/models"
	"github.com/taiji-shibata/antigravity-x-clone/apps/api/repositories"
)

type GetMeUseCase struct {
	userRepo repositories.UserRepository
}

func NewGetMeUseCase(userRepo repositories.UserRepository) *GetMeUseCase {
	return &GetMeUseCase{
		userRepo: userRepo,
	}
}

func (uc *GetMeUseCase) Execute(ctx context.Context, userID uint) (*models.User, error) {
	return uc.userRepo.FindByID(ctx, userID)
}
