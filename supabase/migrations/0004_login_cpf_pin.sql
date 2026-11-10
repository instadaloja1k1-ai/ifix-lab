-- =====================================================================
-- iFix Lab — 0004: login por CPF + PIN de 4 dígitos
-- =====================================================================
-- Como funciona:
--   * Cada usuário tem um CPF em public.profiles.cpf (só números, único).
--   * No Supabase Auth, o e-mail de login vira "<cpf>@cpf.ifixlab.app" e a
--     senha vira "ifix#<PIN>#lab". A tela de login pede só CPF + PIN.
--     (Mesmas regras de src/lib/cpf.ts — se mudar aqui, mude lá.)
--   * Só administradores ativos cadastram usuários, trocam CPF ou redefinem
--     PIN, pelas funções abaixo (chamadas pela aba Configurações > Usuários).
--   * Cada pessoa troca o próprio PIN pelo botão de chave no menu lateral.
--
-- Pode rodar mais de uma vez sem problema (idempotente).
-- =====================================================================

create extension if not exists pgcrypto with schema extensions;

-- 1) Coluna CPF -------------------------------------------------------
alter table public.profiles add column if not exists cpf text;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'profiles_cpf_digits') then
    alter table public.profiles
      add constraint profiles_cpf_digits check (cpf is null or cpf ~ '^[0-9]{11}$');
  end if;
end $$;

create unique index if not exists profiles_cpf_key on public.profiles (cpf) where cpf is not null;

-- 2) Regras de derivação ------------------------------------------------
create or replace function public.cpf_login_email(p_cpf text)
returns text language sql immutable set search_path = '' as $$
  select regexp_replace(p_cpf, '[^0-9]', '', 'g') || '@cpf.ifixlab.app'
$$;

create or replace function public.pin_to_password(p_pin text)
returns text language sql immutable set search_path = '' as $$
  select 'ifix#' || p_pin || '#lab'
$$;

create or replace function public.is_valid_cpf(p_cpf text)
returns boolean language plpgsql immutable set search_path = '' as $$
declare
  d text := regexp_replace(coalesce(p_cpf, ''), '[^0-9]', '', 'g');
  s int; r int; i int;
begin
  if length(d) <> 11 or d ~ '^(.)\1{10}$' then return false; end if;
  for k in 9..10 loop
    s := 0;
    for i in 1..k loop
      s := s + substr(d, i, 1)::int * (k + 2 - i);
    end loop;
    r := (s * 10) % 11;
    if r = 10 then r := 0; end if;
    if r <> substr(d, k + 1, 1)::int then return false; end if;
  end loop;
  return true;
end $$;

-- 3) Trava: só administrador ativo --------------------------------------
create or replace function public.ifix_require_admin()
returns void language plpgsql security definer set search_path = '' as $$
begin
  if not exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role::text = 'administrador' and p.active
  ) then
    raise exception 'Só um administrador pode gerenciar o acesso dos usuários.'
      using errcode = '42501';
  end if;
end $$;

-- Converte o texto do perfil para o tipo real da coluna profiles.role
-- (funciona tanto se a coluna for text quanto se for um enum).
create or replace function public.ifix_set_profile_role(p_user_id uuid, p_role text)
returns void language plpgsql security definer set search_path = '' as $$
declare
  role_type text;
begin
  select format_type(a.atttypid, a.atttypmod) into role_type
  from pg_attribute a
  where a.attrelid = 'public.profiles'::regclass and a.attname = 'role';
  execute format('update public.profiles set role = $1::%s where id = $2', role_type)
    using p_role, p_user_id;
end $$;

-- 4) Cadastrar usuário --------------------------------------------------
create or replace function public.admin_create_user(
  p_full_name text,
  p_cpf text,
  p_pin text,
  p_role text,
  p_phone text default null
) returns uuid
language plpgsql security definer set search_path = '' as $$
declare
  v_cpf text := regexp_replace(coalesce(p_cpf, ''), '[^0-9]', '', 'g');
  v_email text;
  v_id uuid := gen_random_uuid();
begin
  perform public.ifix_require_admin();

  if coalesce(trim(p_full_name), '') = '' then raise exception 'Informe o nome.'; end if;
  if not public.is_valid_cpf(v_cpf) then raise exception 'CPF inválido.'; end if;
  if coalesce(p_pin, '') !~ '^[0-9]{4}$' then raise exception 'O PIN precisa ter 4 números.'; end if;
  if p_role not in ('administrador', 'tecnico', 'atendente', 'financeiro', 'estoquista') then
    raise exception 'Perfil inválido.';
  end if;
  if exists (select 1 from public.profiles where cpf = v_cpf) then
    raise exception 'cpf_ja_cadastrado: já existe um usuário com esse CPF.';
  end if;

  v_email := public.cpf_login_email(v_cpf);

  insert into auth.users (
    instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
    confirmation_token, recovery_token, email_change, email_change_token_new
  ) values (
    '00000000-0000-0000-0000-000000000000', v_id, 'authenticated', 'authenticated', v_email,
    extensions.crypt(public.pin_to_password(p_pin), extensions.gen_salt('bf')), now(),
    jsonb_build_object('provider', 'email', 'providers', jsonb_build_array('email')),
    jsonb_build_object('full_name', trim(p_full_name)),
    now(), now(), '', '', '', ''
  );

  insert into auth.identities (
    id, user_id, provider_id, provider, identity_data, last_sign_in_at, created_at, updated_at
  ) values (
    gen_random_uuid(), v_id, v_id::text, 'email',
    jsonb_build_object('sub', v_id::text, 'email', v_email, 'email_verified', true),
    null, now(), now()
  );

  -- O perfil pode já ter sido criado por um gatilho em auth.users.
  insert into public.profiles (id, full_name) values (v_id, trim(p_full_name))
  on conflict (id) do nothing;

  update public.profiles
     set full_name = trim(p_full_name),
         cpf = v_cpf,
         phone = nullif(trim(coalesce(p_phone, '')), ''),
         active = true
   where id = v_id;

  perform public.ifix_set_profile_role(v_id, p_role);

  return v_id;
end $$;

-- 5) Definir / trocar CPF de um usuário existente -----------------------
create or replace function public.admin_set_user_cpf(p_user_id uuid, p_cpf text)
returns void language plpgsql security definer set search_path = '' as $$
declare
  v_cpf text := regexp_replace(coalesce(p_cpf, ''), '[^0-9]', '', 'g');
  v_email text;
begin
  perform public.ifix_require_admin();
  if not public.is_valid_cpf(v_cpf) then raise exception 'CPF inválido.'; end if;
  if exists (select 1 from public.profiles where cpf = v_cpf and id <> p_user_id) then
    raise exception 'cpf_ja_cadastrado: já existe um usuário com esse CPF.';
  end if;

  v_email := public.cpf_login_email(v_cpf);

  update public.profiles set cpf = v_cpf where id = p_user_id;
  if not found then raise exception 'Usuário não encontrado.'; end if;

  update auth.users
     set email = v_email, email_confirmed_at = coalesce(email_confirmed_at, now()),
         email_change = '', email_change_token_new = '', updated_at = now()
   where id = p_user_id;

  update auth.identities
     set identity_data = identity_data || jsonb_build_object('email', v_email, 'email_verified', true),
         updated_at = now()
   where user_id = p_user_id and provider = 'email';
end $$;

-- 6) Redefinir PIN de um usuário ----------------------------------------
create or replace function public.admin_set_user_pin(p_user_id uuid, p_pin text)
returns void language plpgsql security definer set search_path = '' as $$
begin
  perform public.ifix_require_admin();
  if coalesce(p_pin, '') !~ '^[0-9]{4}$' then raise exception 'O PIN precisa ter 4 números.'; end if;

  update auth.users
     set encrypted_password = extensions.crypt(public.pin_to_password(p_pin), extensions.gen_salt('bf')),
         updated_at = now()
   where id = p_user_id;
  if not found then raise exception 'Usuário não encontrado.'; end if;
end $$;

-- 7) Permissões de execução ---------------------------------------------
revoke all on function public.ifix_require_admin() from public, anon;
revoke all on function public.ifix_set_profile_role(uuid, text) from public, anon, authenticated;
revoke all on function public.admin_create_user(text, text, text, text, text) from public, anon;
revoke all on function public.admin_set_user_cpf(uuid, text) from public, anon;
revoke all on function public.admin_set_user_pin(uuid, text) from public, anon;
grant execute on function public.admin_create_user(text, text, text, text, text) to authenticated;
grant execute on function public.admin_set_user_cpf(uuid, text) to authenticated;
grant execute on function public.admin_set_user_pin(uuid, text) to authenticated;
