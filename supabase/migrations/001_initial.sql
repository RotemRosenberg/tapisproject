-- Profiles (extends auth.users)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  role text not null default 'user' check (role in ('admin', 'user')),
  approved boolean not null default false,
  renders_remaining integer not null default 0,
  created_at timestamptz not null default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Products
create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null default 'parquet' check (category in ('parquet', 'carpet', 'other')),
  image_url text not null,
  created_at timestamptz not null default now()
);

-- Renders
create table public.renders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  room_image_url text not null,
  result_url text not null,
  created_at timestamptz not null default now()
);

-- RLS
alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.renders enable row level security;

-- profiles: user sees own row; admin sees all
create policy "user_select_own_profile" on public.profiles
  for select using (auth.uid() = id);

create policy "user_update_own_profile" on public.profiles
  for update using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "admin_select_all_profiles" on public.profiles
  for select using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

create policy "admin_update_all_profiles" on public.profiles
  for update using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- products: anyone reads; admin writes
create policy "anyone_read_products" on public.products
  for select using (true);

create policy "admin_insert_products" on public.products
  for insert with check (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

create policy "admin_delete_products" on public.products
  for delete using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- renders: user sees own; admin sees all
create policy "user_select_own_renders" on public.renders
  for select using (auth.uid() = user_id);

create policy "user_insert_own_renders" on public.renders
  for insert with check (auth.uid() = user_id);

create policy "admin_select_all_renders" on public.renders
  for select using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );
