---
description: 
---

# フロントエンド コーディング規約

このドキュメントは、Next.js + TypeScript フロントエンドにおけるコーディング規約とベストプラクティスを定義します。

> [!NOTE]
> アーキテクチャの詳細は [frontend-architecture.md](.agent/workflows/frontend-architecture.md) を参照してください。

---

});

// リクエストインターセプター（JWT トークン追加）
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// レスポンスインターセプター（エラーハンドリング）
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

```ts
// lib/utils/date.ts
export const formatDate = (date: string): string => {
  const d = new Date(date);
  const now = new Date();
  const diff = now.getTime() - d.getTime();

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return `${seconds}s`;
  if (minutes < 60) return `${minutes}m`;
  if (hours < 24) return `${hours}h`;
  if (days < 7) return `${days}d`;

  return d.toLocaleDateString();
};
```

---

## Server Components vs Client Components

### Server Components (デフォルト)

**使用ケース:**
- データフェッチ
- バックエンドリソースへの直接アクセス
- 機密情報の保持
- 大きな依存関係の使用

**実装例:**

```tsx
// app/(main)/home/page.tsx
import { postsApi } from '@/features/posts/api/postsApi';
import { PostList } from '@/features/posts/components/PostList';

export default async function HomePage() {
  // Server Component でデータフェッチ
  const posts = await postsApi.getAll();

  return (
    <div>
      <h1>Home</h1>
      <PostList posts={posts} />
    </div>
  );
}
```

### Client Components (`'use client'`)

**使用ケース:**
- インタラクティブな UI
- イベントハンドラー
- State, Effect の使用
- ブラウザ API の使用

**実装例:**

```tsx
// features/posts/components/CreatePostForm.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useCreatePost } from '../hooks/useCreatePost';

export const CreatePostForm = () => {
  const [content, setContent] = useState('');
  const { createPost, loading } = useCreatePost();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createPost({ content });
    setContent('');
  };

  return (
    <form onSubmit={handleSubmit}>
      <Input
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="What's happening?"
      />
      <Button type="submit" disabled={loading}>
        Post
      </Button>
    </form>
  );
};
```

---

## 状態管理

### ローカル状態 (useState)

**使用ケース:**
- コンポーネント内のみで使用する状態
- フォーム入力値

```tsx
const [content, setContent] = useState('');
```

### URL 状態 (useSearchParams)

**使用ケース:**
- フィルター、ソート、ページネーション
- 共有可能な状態

```tsx
'use client';

import { useSearchParams, useRouter } from 'next/navigation';

export const PostFilter = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const filter = searchParams.get('filter') || 'all';

  const setFilter = (newFilter: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('filter', newFilter);
    router.push(`?${params.toString()}`);
  };

  return (
    <select value={filter} onChange={(e) => setFilter(e.target.value)}>
      <option value="all">All</option>
      <option value="following">Following</option>
    </select>
  );
};
```

### グローバル状態 (Context API)

**使用ケース:**
- 認証情報
- テーマ設定
- 複数のコンポーネントで共有する状態

```tsx
// features/auth/contexts/AuthContext.tsx
'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import type { User } from '../types/auth';

type AuthContextType = {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = async (email: string, password: string) => {
    // ログイン処理
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

---

## コーディング規約

### ファイル命名規則

- **コンポーネント**: PascalCase + `.tsx` (例: `PostCard.tsx`)
- **フック**: camelCase + `.ts` (例: `usePosts.ts`)
- **ユーティリティ**: camelCase + `.ts` (例: `date.ts`)
- **型定義**: camelCase + `.ts` (例: `post.ts`)
- **API**: camelCase + `Api.ts` (例: `postsApi.ts`)

### 命名規則

#### 変数名
- **camelCase**: `userName`, `postContent`, `isLoading`
- **boolean**: `is`, `has`, `should` で始める
- **配列**: 複数形を使用

```tsx
// [OK] 良い例
const userName = 'John';
const isLoading = true;
const posts = [];

// [NG] 悪い例
const user_name = 'John';  // スネークケース
const loading = true;      // boolean が不明確
```

#### 関数名
- **camelCase**: `handleSubmit`, `fetchPosts`
- **イベントハンドラー**: `handle` で始める
- **boolean を返す**: `is`, `has`, `should` で始める

```tsx
// [OK] 良い例
const handleSubmit = () => {};
const isValid = () => true;

// [NG] 悪い例
const submit = () => {};  // handle がない
```

#### コンポーネント名
- **PascalCase**: `PostCard`, `UserProfile`

```tsx
// [OK] 良い例
export const PostCard = () => {};

// [NG] 悪い例
export const postCard = () => {};  // camelCase
```

#### カスタムフック名
- **camelCase**: `usePosts`, `useAuth`
- **use で始める**: React のルール

```tsx
// [OK] 良い例
export const usePosts = () => {};

// [NG] 悪い例
export const getPosts = () => {};  // use がない
```

### 型定義

#### type vs interface

**ルール: `type` を使用、`interface` は使用しない**

```tsx
// [OK] 良い例: type を使用
type User = {
  id: number;
  username: string;
};

// [NG] 悪い例: interface を使用
interface User {
  id: number;
  username: string;
}
```

#### Props の型定義

```tsx
// [OK] 良い例: 型を分離
type PostCardProps = {
  post: Post;
  onDelete?: (id: number) => void;
};

export const PostCard = ({ post, onDelete }: PostCardProps) => {
  // 実装
};

// [NG] 悪い例: インライン型定義
export const PostCard = ({ post }: { post: Post }) => {
  // 実装
};
```

### 関数定義

**ルール: アロー関数を使用**

```tsx
// [OK] 良い例: アロー関数
const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
};

// [NG] 悪い例: function キーワード
function handleSubmit(e: React.FormEvent) {
  e.preventDefault();
}
```

### コンポーネント定義

**ルール: アロー関数 + Named Export**

```tsx
// [OK] 良い例: アロー関数 + Named Export
type PostCardProps = {
  post: Post;
};

export const PostCard = ({ post }: PostCardProps) => {
  return <div>{post.content}</div>;
};

// 例外: Page コンポーネントは default export
export default function HomePage() {
  return <div>Home</div>;
}
```

### Hooks の使用

#### useState

```tsx
// [OK] 良い例: 型を明示
const [posts, setPosts] = useState<Post[]>([]);
const [user, setUser] = useState<User | null>(null);

// [NG] 悪い例: 型を省略
const [posts, setPosts] = useState([]);  // any[]
```

#### useEffect

```tsx
// [OK] 良い例: 依存配列を明示
useEffect(() => {
  fetchPosts();
}, []);  // 初回のみ実行

useEffect(() => {
  fetchUser(userId);
}, [userId]);  // userId が変更されたら実行

// [NG] 悪い例: 依存配列を省略
useEffect(() => {
  fetchPosts();
});  // 毎回実行される
```

※ useEffectの乱用は避け、なるべく使用せずに実装できるようにすること

### スタイリング

**ルール: Tailwind CSS を使用**

```tsx
// [OK] 良い例: Tailwind CSS
export const Button = ({ children }: { children: React.ReactNode }) => {
  return (
    <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
      {children}
    </button>
  );
};

// [NG] 悪い例: インラインスタイル
export const Button = ({ children }: { children: React.ReactNode }) => {
  return (
    <button style={{ backgroundColor: 'blue', color: 'white' }}>
      {children}
    </button>
  );
};
```

### API クライアント

**ルール: Axios を使用**

```tsx
// [OK] 良い例: Axios
import { apiClient } from '@/lib/api/client';

export const postsApi = {
  getAll: async (): Promise<Post[]> => {
    const response = await apiClient.get('/posts');
    return response.data;
  },
};
```

### エラーハンドリング

```tsx
// [OK] 良い例: try-catch
export const usePosts = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const data = await postsApi.getAll();
        setPosts(data);
      } catch (err) {
        setError(err as Error);
      }
    };

    fetchPosts();
  }, []);

  return { posts, error };
};
```

---

## 禁止事項

### [NG] 絶対にやってはいけないこと

#### 1. any を使用しない

```tsx
// [NG] 悪い例
const handleSubmit = (data: any) => {};

// [OK] 良い例
type FormData = {
  username: string;
  email: string;
};

const handleSubmit = (data: FormData) => {};
```

#### 2. 非 null アサーション (!) を避ける

```tsx
// [NG] 悪い例
const user = users.find((u) => u.id === 1)!;

// [OK] 良い例
const user = users.find((u) => u.id === 1);
if (!user) {
  throw new Error('User not found');
}
```

#### 3. useEffect の依存配列を無視しない

```tsx
// [NG] 悪い例
useEffect(() => {
  fetchUser(userId);
}, []); // userId が依存配列にない

// [OK] 良い例
useEffect(() => {
  fetchUser(userId);
}, [userId]);
```

#### 4. interface を使用しない (type を使用)

```tsx
// [NG] 悪い例
interface User {
  id: number;
  username: string;
}

// [OK] 良い例
type User = {
  id: number;
  username: string;
};
```

#### 5. インラインスタイルを使用しない

```tsx
// [NG] 悪い例
<button style={{ backgroundColor: 'blue' }}>Click</button>

// [OK] 良い例
<button className="bg-blue-500">Click</button>
```

---

## まとめ

### 重要なポイント

1. **Features-based 構成**: 機能ごとにディレクトリを分割
2. **責務の分離**: App, Features, Components, Lib の役割を明確に
3. **Server Components 優先**: 可能な限り Server Components を使用
4. **型安全性**: TypeScript で型を定義
5. **再利用性**: 共通コンポーネントを活用

### チェックリスト

- [ ] ファイル名は PascalCase (コンポーネント) または camelCase (その他)
- [ ] 型定義は `type` を使用 (`interface` は使用しない)
- [ ] 関数定義はアロー関数を使用
- [ ] コンポーネントは Named Export (Page コンポーネント以外)
- [ ] Props は型を分離して定義
- [ ] useState は型を明示
- [ ] useEffect は依存配列を明示
- [ ] スタイリングは Tailwind CSS を使用
- [ ] API クライアントは Axios を使用
- [ ] エラーハンドリングは try-catch を使用
- [ ] `any` を使用しない
- [ ] 非 null アサーション (!) を避ける
