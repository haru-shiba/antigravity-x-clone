# フロントエンド完全ガイド

このドキュメントは、Next.js 16 + TypeScript フロントエンドにおける Features-based Architecture の実装ルールとコーディング規約を定義します。

## 目次

1. [Features-based Architecture 概要](#features-based-architecture-概要)
2. [ディレクトリ構成](#ディレクトリ構成)
3. [各層の責務と実装例](#各層の責務と実装例)
4. [Server Components vs Client Components](#server-components-vs-client-components)
5. [状態管理](#状態管理)
6. [コーディング規約](#コーディング規約)
7. [禁止事項](#禁止事項)

---

## Features-based Architecture 概要

### アーキテクチャ図

```
┌─────────────────────────────────────────────────────────────┐
│                         App Layer                            │
│  (app/)                                                      │
│  - ページコンポーネント                                         │
│  - レイアウト                                                 │
│  - ルーティング                                               │
└────────────────────────┬────────────────────────────────────┘
                         │ 使用
                         ↓
┌─────────────────────────────────────────────────────────────┐
│                      Features Layer                          │
│  (features/)                                                 │
│  - 機能ごとのコンポーネント                                     │
│  - カスタムフック                                              │
│  - API クライアント                                           │
│  - 型定義                                                     │
└────────────────────────┬────────────────────────────────────┘
                         │ 使用
                         ↓
┌─────────────────────────────────────────────────────────────┐
│                    Shared Components                         │
│  (components/)                                               │
│  - 再利用可能なUIコンポーネント                                 │
│  - ボタン、入力フィールド、カードなど                            │
└────────────────────────┬────────────────────────────────────┘
                         │ 使用
                         ↓
┌─────────────────────────────────────────────────────────────┐
│                         Lib Layer                            │
│  (lib/)                                                      │
│  - ユーティリティ関数                                          │
│  - API クライアント設定                                        │
│  - 定数                                                       │
└─────────────────────────────────────────────────────────────┘
```

---

## ディレクトリ構成

```
apps/web/
├── app/                                # Next.js App Router
│   ├── (auth)/                         # ルートグループ（認証）
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── register/
│   │       └── page.tsx
│   ├── (main)/                         # ルートグループ（メイン）
│   │   ├── home/
│   │   │   └── page.tsx
│   │   ├── profile/
│   │   │   └── [username]/
│   │   │       └── page.tsx
│   │   └── layout.tsx                  # メインレイアウト
│   ├── layout.tsx                      # ルートレイアウト
│   ├── globals.css                     # グローバルスタイル
│   └── error.tsx                       # エラーページ
│
├── features/                           # 機能別ディレクトリ
│   ├── auth/
│   │   ├── components/
│   │   │   ├── LoginForm.tsx
│   │   │   └── RegisterForm.tsx
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │   └── useLogin.ts
│   │   ├── api/
│   │   │   └── authApi.ts
│   │   └── types/
│   │       └── auth.ts
│   ├── posts/
│   │   ├── components/
│   │   │   ├── PostCard.tsx
│   │   │   ├── PostList.tsx
│   │   │   └── CreatePostForm.tsx
│   │   ├── hooks/
│   │   │   ├── usePosts.ts
│   │   │   ├── useCreatePost.ts
│   │   │   └── useDeletePost.ts
│   │   ├── api/
│   │   │   └── postsApi.ts
│   │   └── types/
│   │       └── post.ts
│   └── users/
│       ├── components/
│       │   ├── UserProfile.tsx
│       │   └── UserCard.tsx
│       ├── hooks/
│       │   ├── useUser.ts
│       │   └── useUpdateProfile.ts
│       ├── api/
│       │   └── usersApi.ts
│       └── types/
│           └── user.ts
│
├── components/                         # 共通UIコンポーネント
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   ├── Modal.tsx
│   │   └── Avatar.tsx
│   └── layout/
│       ├── Header.tsx
│       ├── Sidebar.tsx
│       └── Footer.tsx
│
├── lib/                                # ユーティリティ
│   ├── api/
│   │   ├── client.ts                   # APIクライアント設定
│   │   └── endpoints.ts                # エンドポイント定義
│   ├── utils/
│   │   ├── date.ts                     # 日付ユーティリティ
│   │   └── validation.ts               # バリデーション
│   └── constants/
│       └── config.ts                   # 定数
│
├── public/                             # 静的ファイル
│   ├── images/
│   └── icons/
│
├── types/                              # グローバル型定義
│   └── global.ts
│
├── package.json
├── tsconfig.json
├── next.config.ts
└── tailwind.config.ts
```

---

## 各層の責務と実装例

### 1. App Layer (`app/`)

**責務:**
- ページコンポーネントの定義
- ルーティング
- レイアウト
- メタデータ

**ルール:**
- ビジネスロジックを含まない
- Features層のコンポーネントを組み合わせる
- Server Component を優先的に使用

**実装例:**

```tsx
// app/(main)/home/page.tsx
import { Timeline } from '@/features/timeline/components/Timeline';
import { CreatePostForm } from '@/features/posts/components/CreatePostForm';

export default function HomePage() {
  return (
    <div className="container mx-auto">
      <CreatePostForm />
      <Timeline />
    </div>
  );
}
```

### 2. Features Layer (`features/`)

**責務:**
- 機能ごとのコンポーネント
- カスタムフック
- API クライアント
- 型定義

**ルール:**
- 機能ごとにディレクトリを分割
- 各機能は独立している
- 他の機能に依存しない（共通コンポーネントは除く）

**構成:**
```
features/[feature-name]/
├── components/     # 機能固有のコンポーネント
├── hooks/          # カスタムフック
├── api/            # API クライアント
└── types/          # 型定義
```

**実装例:**

```tsx
// features/posts/components/PostCard.tsx
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import type { Post } from '../types/post';

type PostCardProps = {
  post: Post;
  onDelete?: (id: number) => void;
};

export const PostCard = ({ post, onDelete }: PostCardProps) => {
  return (
    <div className="border rounded-lg p-4">
      <div className="flex items-center gap-2">
        <Avatar src={post.user.avatar} alt={post.user.username} />
        <span className="font-bold">{post.user.username}</span>
      </div>
      <p className="mt-2">{post.content}</p>
      {onDelete && (
        <Button onClick={() => onDelete(post.id)} variant="danger">
          Delete
        </Button>
      )}
    </div>
  );
};
```

```tsx
// features/posts/hooks/usePosts.ts
import { useState, useEffect } from 'react';
import { postsApi } from '../api/postsApi';
import type { Post } from '../types/post';

export const usePosts = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const data = await postsApi.getAll();
        setPosts(data);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  return { posts, loading, error };
};
```

```ts
// features/posts/api/postsApi.ts
import { apiClient } from '@/lib/api/client';
import type { Post, CreatePostInput } from '../types/post';

export const postsApi = {
  getAll: async (): Promise<Post[]> => {
    const response = await apiClient.get('/posts');
    return response.data;
  },

  getById: async (id: number): Promise<Post> => {
    const response = await apiClient.get(`/posts/${id}`);
    return response.data;
  },

  create: async (input: CreatePostInput): Promise<Post> => {
    const response = await apiClient.post('/posts', input);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/posts/${id}`);
  },
};
```

```ts
// features/posts/types/post.ts
export type Post = {
  id: number;
  content: string;
  userId: number;
  user: {
    id: number;
    username: string;
    avatar: string;
  };
  createdAt: string;
  updatedAt: string;
};

export type CreatePostInput = {
  content: string;
};

export type UpdatePostInput = {
  content: string;
};
```

### 3. Shared Components (`components/`)

**責務:**
- 再利用可能なUIコンポーネント
- レイアウトコンポーネント

**ルール:**
- 機能に依存しない
- プロパティで動作をカスタマイズ
- スタイルは Tailwind CSS で定義

**実装例:**

```tsx
// components/ui/Button.tsx
import { ButtonHTMLAttributes } from 'react';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
};

export const Button = ({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}: ButtonProps) => {
  const baseStyles = 'rounded font-semibold transition-colors';
  
  const variantStyles = {
    primary: 'bg-blue-500 text-white hover:bg-blue-600',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
    danger: 'bg-red-500 text-white hover:bg-red-600',
  };
  
  const sizeStyles = {
    sm: 'px-3 py-1 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
```

### 4. Lib Layer (`lib/`)

**責務:**
- ユーティリティ関数
- API クライアント設定
- 定数

**ルール:**
- 純粋関数を定義
- React に依存しない
- テスト可能

**実装例:**

```ts
// lib/api/client.ts
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
