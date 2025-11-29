# フロントエンド テスト戦略

このドキュメントは、Next.js + TypeScript フロントエンドのテスト戦略を定義します。

> [!NOTE]
> バックエンドのテスト戦略は [testing-backend.md](.agent/workflows/testing-backend.md) を参照してください。

---

---

## フロントエンド テスト戦略

### ディレクトリ構成

```
apps/web/
├── features/
│   └── posts/
│       ├── components/
│       │   ├── PostCard.tsx
│       │   └── PostCard.test.tsx         # コンポーネントテスト
│       ├── hooks/
│       │   ├── usePosts.ts
│       │   └── usePosts.test.ts          # フックテスト
│       └── api/
│           ├── postsApi.ts
│           └── postsApi.test.ts          # APIクライアントテスト
│
├── lib/
│   └── utils/
│       ├── date.ts
│       └── date.test.ts                  # ユーティリティテスト
│
└── __tests__/
    ├── setup.ts                          # テストセットアップ
    ├── mocks/
    │   ├── handlers.ts                   # MSW ハンドラー
    │   └── server.ts                     # MSW サーバー
    └── fixtures/
        └── testData.ts                   # テストデータ
```

### 1. コンポーネントテスト

**ライブラリ**: React Testing Library

```tsx
// features/posts/components/PostCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { PostCard } from './PostCard';
import type { Post } from '../types/post';

describe('PostCard', () => {
  const mockPost: Post = {
    id: 1,
    content: 'Hello, World!',
    userId: 1,
    user: {
      id: 1,
      username: 'testuser',
      avatar: 'https://example.com/avatar.jpg',
    },
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z',
  };

  it('should render post content', () => {
    render(<PostCard post={mockPost} />);
    expect(screen.getByText('Hello, World!')).toBeInTheDocument();
  });

  it('should render user information', () => {
    render(<PostCard post={mockPost} />);
    expect(screen.getByText('testuser')).toBeInTheDocument();
  });

  it('should call onDelete when delete button is clicked', () => {
    const onDelete = jest.fn();
    render(<PostCard post={mockPost} onDelete={onDelete} />);

    const deleteButton = screen.getByRole('button', { name: /delete/i });
    fireEvent.click(deleteButton);

    expect(onDelete).toHaveBeenCalledWith(1);
  });

  it('should not render delete button when onDelete is not provided', () => {
    render(<PostCard post={mockPost} />);
    expect(screen.queryByRole('button', { name: /delete/i })).not.toBeInTheDocument();
  });
});
```

### 2. カスタムフックテスト

**ライブラリ**: @testing-library/react-hooks

```tsx
// features/posts/hooks/usePosts.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { usePosts } from './usePosts';
import { postsApi } from '../api/postsApi';

jest.mock('../api/postsApi');

describe('usePosts', () => {
  it('should fetch posts successfully', async () => {
    const mockPosts = [
      { id: 1, content: 'Post 1', userId: 1 },
      { id: 2, content: 'Post 2', userId: 2 },
    ];

    (postsApi.getAll as jest.Mock).mockResolvedValue(mockPosts);

    const { result } = renderHook(() => usePosts());

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.posts).toEqual(mockPosts);
    expect(result.current.error).toBeNull();
  });

  it('should handle error when fetching posts fails', async () => {
    const mockError = new Error('Failed to fetch posts');
    (postsApi.getAll as jest.Mock).mockRejectedValue(mockError);

    const { result } = renderHook(() => usePosts());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.posts).toEqual([]);
    expect(result.current.error).toEqual(mockError);
  });
});
```

### 3. APIクライアントテスト（MSW使用）

**ライブラリ**: MSW (Mock Service Worker)

```tsx
// __tests__/mocks/handlers.ts
import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('/api/posts', () => {
    return HttpResponse.json([
      { id: 1, content: 'Post 1', userId: 1 },
      { id: 2, content: 'Post 2', userId: 2 },
    ]);
  }),

  http.post('/api/posts', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json(
      { id: 3, ...body, userId: 1 },
      { status: 201 }
    );
  }),

  http.delete('/api/posts/:id', ({ params }) => {
    return new HttpResponse(null, { status: 204 });
  }),
];
```

```tsx
// __tests__/mocks/server.ts
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);
```

```tsx
// features/posts/api/postsApi.test.ts
import { postsApi } from './postsApi';
import { server } from '@/__tests__/mocks/server';

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('postsApi', () => {
  it('should fetch all posts', async () => {
    const posts = await postsApi.getAll();
    expect(posts).toHaveLength(2);
    expect(posts[0].content).toBe('Post 1');
  });

  it('should create a post', async () => {
    const input = { content: 'New Post' };
    const post = await postsApi.create(input);
    expect(post.id).toBe(3);
    expect(post.content).toBe('New Post');
  });

  it('should delete a post', async () => {
    await expect(postsApi.delete(1)).resolves.not.toThrow();
  });
});
```

### 4. テストデータの共通化

```tsx
// __tests__/fixtures/testData.ts
import type { Post, User } from '@/features/posts/types/post';

export const createTestUser = (overrides?: Partial<User>): User => ({
  id: 1,
  username: 'testuser',
  avatar: 'https://example.com/avatar.jpg',
  ...overrides,
});

export const createTestPost = (overrides?: Partial<Post>): Post => ({
  id: 1,
  content: 'Test post content',
  userId: 1,
  user: createTestUser(),
  createdAt: '2023-01-01T00:00:00Z',
  updatedAt: '2023-01-01T00:00:00Z',
  ...overrides,
});

export const createTestPosts = (count: number): Post[] => {
  return Array.from({ length: count }, (_, i) =>
    createTestPost({ id: i + 1, content: `Post ${i + 1}` })
  );
};
```

### 5. テストセットアップ

```tsx
// __tests__/setup.ts
import '@testing-library/jest-dom';
import { server } from './mocks/server';

// MSW サーバーのセットアップ
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// localStorage のモック
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock as any;
```

### 6. テスト実行

```bash
# すべてのテストを実行
npm test

# ウォッチモード
npm test -- --watch

# カバレッジ
npm test -- --coverage

# 特定のファイルのテスト
npm test PostCard.test.tsx
```

---

## まとめ

### バックエンド テストチェックリスト

- [ ] ドメインロジックの単体テスト
- [ ] ユースケースの単体テスト（モック使用）
- [ ] リポジトリの統合テスト（実DB接続）
- [ ] モックの共通化
- [ ] テストデータの共通化
- [ ] DB接続ヘルパーの作成

### フロントエンド テストチェックリスト

- [ ] コンポーネントテスト
- [ ] カスタムフックテスト
- [ ] APIクライアントテスト（MSW使用）
- [ ] ユーティリティ関数テスト
- [ ] テストデータの共通化
- [ ] MSW ハンドラーの作成
