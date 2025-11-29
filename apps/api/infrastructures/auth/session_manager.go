package auth

import (
	"context"
	"time"

	"github.com/redis/go-redis/v9"
)

type SessionManager struct {
	client *redis.Client
}

func NewSessionManager(addr string, password string, db int) *SessionManager {
	client := redis.NewClient(&redis.Options{
		Addr:     addr,
		Password: password,
		DB:       db,
	})

	return &SessionManager{
		client: client,
	}
}

func (sm *SessionManager) Set(ctx context.Context, key string, value interface{}, ttl time.Duration) error {
	return sm.client.Set(ctx, key, value, ttl).Err()
}

func (sm *SessionManager) Get(ctx context.Context, key string) (string, error) {
	return sm.client.Get(ctx, key).Result()
}

func (sm *SessionManager) Delete(ctx context.Context, key string) error {
	return sm.client.Del(ctx, key).Err()
}
