# Supabase 設定ガイド（キブンエイガ）

このドキュメントは、ゼロから Supabase をセットアップして本アプリ（Next.js）と連携するための手順をまとめたものです。ローカル検証から運用までをカバーします。

## 前提
- Supabase アカウントがあること
- ローカルで本アプリが起動できること（Node 18+/20+, `npm run dev` など）
- 本リポジトリの `.env.example` を参照できること

## 1. Supabase プロジェクト作成
- Supabase にログイン → New project
- Project name / Database password / Region を設定して作成
- 生成後、左下 Project Settings → API を開き、以下を控える
  - Project URL（例: https://xxxx.supabase.co）
  - anon public key（公開キー）

## 2. 環境変数を設定（ローカル）
- リポジトリ直下の `.env.local` を作成/更新
  - `NEXT_PUBLIC_SUPABASE_URL=（Project URL）`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY=（anon public key）`
  - `NEXT_PUBLIC_SITE_URL=http://localhost:3000`
- 参考: `.env.example`

## 3. 認証設定（Email/OAuth）
- Dashboard → Authentication → Providers
  - Email を「有効化」
  - 任意で Google / X(Twitter) も有効化（各プロバイダの Client ID/Secret を登録）
- Authentication → URL Configuration
  - Site URL: `http://localhost:3000`
  - Redirect URLs: `http://localhost:3000` を追加
- これで `/auth/login` からメール/パスワード、OAuth でログインできます

## 4. スキーマ適用（テーブル/RLS/ポリシー）
- Dashboard → SQL Editor を開く
- リポジトリの `supabase/schema.sql` を開いて内容をコピー
- SQL Editor に貼り付けて Run（複数回実行しても安全な `if not exists` 付き）
- 生成される主なリソース
  - テーブル
    - `public.profiles`（ニックネーム等のプロフィール）
    - `public.favorites`（お気に入り）
    - `public.reviews`（レビュー）
    - `public.watch_history`（視聴履歴）
  - RLS 有効化 + ポリシー
    - 自分のデータのみ読み書き可（favorites/reviews/history）
    - profiles の閲覧は全員可（ニックネーム表示のため）
  - 一意制約
    - `reviews` の `(user_id, movie_id)` に unique index（1ユーザー1映画1レビュー）

### 重複レビューがある場合（エラー時のみ）
- 重複確認
  - `select user_id, movie_id, count(*) from reviews group by 1,2 having count(*) > 1;`
- 重複削除（最新1件だけ残す）
  - `delete from reviews r using reviews r2 where r.user_id=r2.user_id and r.movie_id=r2.movie_id and r.id<r2.id;`
- その後、unique index 作成を再実行

## 5. プロフィール（ニックネーム）準備
- Dashboard → Table editor → `public.profiles`
  - ユーザーごとに `id = auth.users.id` の行があるか確認
  - 無ければ作成し、`nickname` を入力して保存
- SQL で直接作る例（存在すれば更新）
  - `insert into public.profiles (id, nickname) values ('<auth.users.id>', '表示名') on conflict (id) do update set nickname=excluded.nickname;`

### 参考：サインアップ時に自動で profiles を作成する（任意）
- SQL Editor で以下を実行（必要な場合のみ）
```
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public as $$
begin
  insert into public.profiles (id, nickname)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.email))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
```
- 補足: 上記は RLS を迂回して profiles を作るため `security definer` を使用しています

## 6. ローカル起動と動作確認
- 依存関係インストール → `npm install`（または `pnpm install`）
- 起動 → `npm run dev`
- 確認フロー
  - `/auth/login` でアカウント作成 → ログイン
  - ヘッダー右側に「ニックネーム → OAuth名 → メール」の順でユーザー名が表示
  - 任意の映画詳細 → 「お気に入りに追加」→ `/favorites` に表示
  - 同詳細ページのレビュー欄で投稿/更新/削除 → 一覧に反映、平均表示、ニックネーム表示

## 7. よくあるエラーと対処
- ヘッダー名が出ない
  - `.env.local` の URL/Key を設定し、開発サーバを再起動
  - `public.profiles` に該当ユーザーの行があるか、`nickname` が入っているか
- 認証で戻らない/エラー
  - Authentication の Site/Redirect が `http://localhost:3000` になっているか
- お気に入り/レビューで権限エラー（RLS）
  - `supabase/schema.sql` を適用したか
  - ログイン済みか（`auth.uid()` ポリシーに影響）
- unique index でエラー
  - 重複レビューを削除してから再作成（上記の SQL 手順）

## 8. 本番（任意）
- Vercel などにデプロイする場合
  - 環境変数に `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` を設定
  - Supabase 側の Authentication → URL Configuration を本番ドメインに合わせて更新
  - `supabase/schema.sql` を本番環境でも SQL Editor で適用

---
最短の流れは「プロジェクト作成 → `.env.local` 設定 → 認証の URL 設定 → `schema.sql` 実行 → profiles にニックネーム作成 → ローカル起動確認」です。以上で Supabase 側の設定は完了です。
