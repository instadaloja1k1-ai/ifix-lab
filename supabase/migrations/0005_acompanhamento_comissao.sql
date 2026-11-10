-- =====================================================================
-- iFix Lab — 0005: link de acompanhamento da OS, aprovação de orçamento
-- pelo cliente, comissão por técnico e "ping" para o projeto não pausar.
-- Pode rodar mais de uma vez (idempotente).
-- =====================================================================

-- 1) Token público e resposta do cliente na OS --------------------------
alter table public.service_orders add column if not exists public_token uuid not null default gen_random_uuid();
alter table public.service_orders add column if not exists client_response text;          -- 'aprovado' | 'recusado'
alter table public.service_orders add column if not exists client_response_at timestamptz;
alter table public.service_orders add column if not exists client_response_name text;
create unique index if not exists service_orders_public_token_key on public.service_orders (public_token);

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'service_orders_client_response_chk') then
    alter table public.service_orders
      add constraint service_orders_client_response_chk
      check (client_response is null or client_response in ('aprovado', 'recusado'));
  end if;
end $$;

-- 2) Comissão do técnico (% sobre a mão de obra das OS entregues) --------
alter table public.profiles add column if not exists commission_percent numeric not null default 0;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'profiles_commission_percent_chk') then
    alter table public.profiles
      add constraint profiles_commission_percent_chk check (commission_percent between 0 and 100);
  end if;
end $$;

-- 3) Consulta pública da OS (página /acompanhar/<token>) -----------------
-- Devolve só o que o cliente pode ver: nada de custo, margem ou notas internas.
create or replace function public.public_get_order(p_token uuid)
returns jsonb language sql stable security definer set search_path = '' as $$
  select jsonb_build_object(
    'order_number', o.order_number,
    'status', o.status,
    'created_at', o.created_at,
    'due_at', o.due_at,
    'reported_defect', o.reported_defect,
    'diagnosis', o.diagnosis,
    'labor_value', o.labor_value,
    'parts_value', o.parts_value,
    'discount_value', o.discount_value,
    'total_value', o.total_value,
    'client_response', o.client_response,
    'client_response_at', o.client_response_at,
    'client_response_name', o.client_response_name,
    'client_first_name', split_part(coalesce(c.name, ''), ' ', 1),
    'device', case when d.id is null then null else jsonb_build_object(
      'brand', d.brand, 'model', d.model, 'color', d.color, 'storage_capacity', d.storage_capacity,
      'imei_end', right(coalesce(d.imei1, d.serial_number, ''), 4),
      'client_visible_notes', d.client_visible_notes) end,
    'items', coalesce((
      select jsonb_agg(jsonb_build_object(
        'description', i.description, 'item_type', i.item_type,
        'quantity', i.quantity, 'unit_price', i.unit_price) order by i.item_type desc, i.description)
      from public.service_order_items i where i.service_order_id = o.id), '[]'::jsonb),
    'history', coalesce((
      select jsonb_agg(jsonb_build_object('status', h.to_status, 'at', h.changed_at) order by h.changed_at)
      from public.service_status_history h where h.service_order_id = o.id), '[]'::jsonb),
    'photos', coalesce((
      select jsonb_agg(jsonb_build_object('path', p.storage_path, 'stage', p.stage) order by p.created_at)
      from public.device_photos p where p.device_id = o.device_id), '[]'::jsonb),
    'warranty', (
      select jsonb_build_object('starts_at', w.starts_at, 'ends_at', w.ends_at, 'days', w.warranty_days,
                                'covered_service', w.covered_service, 'coverage_terms', w.coverage_terms)
      from public.service_warranties w where w.service_order_id = o.id limit 1)
  )
  from public.service_orders o
  left join public.clients c on c.id = o.client_id
  left join public.devices d on d.id = o.device_id
  where o.public_token = p_token
$$;

-- 4) Cliente aprova ou recusa o orçamento pelo link ----------------------
create or replace function public.public_respond_quote(p_token uuid, p_approve boolean, p_name text)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  o public.service_orders;
  v_name text := left(trim(coalesce(p_name, '')), 120);
  v_new_status text;
begin
  select * into o from public.service_orders where public_token = p_token for update;
  if not found then raise exception 'Ordem de serviço não encontrada.'; end if;
  if o.status <> 'aguardando_aprovacao' then
    raise exception 'Este orçamento não está aguardando aprovação.';
  end if;
  if v_name = '' then raise exception 'Informe seu nome para confirmar.'; end if;

  v_new_status := case when p_approve then 'aprovado_reparo' else 'sem_reparo' end;

  update public.service_orders
     set status = v_new_status,
         client_response = case when p_approve then 'aprovado' else 'recusado' end,
         client_response_at = now(),
         client_response_name = v_name,
         updated_at = now()
   where id = o.id;

  insert into public.service_status_history (service_order_id, from_status, to_status, changed_by, notes)
  values (o.id, o.status, v_new_status, null,
          case when p_approve
               then 'Orçamento APROVADO pelo cliente pelo link de acompanhamento (' || v_name || ').'
               else 'Orçamento RECUSADO pelo cliente pelo link de acompanhamento (' || v_name || '). Aparelho será devolvido sem reparo.'
          end);

  return public.public_get_order(p_token);
end $$;

-- 5) "Ping" diário: mantém o projeto do plano gratuito ativo ------------
create or replace function public.keepalive()
returns timestamptz language sql stable security definer set search_path = '' as $$
  select now()
$$;

-- 6) Permissões ----------------------------------------------------------
revoke all on function public.public_get_order(uuid) from public;
revoke all on function public.public_respond_quote(uuid, boolean, text) from public;
revoke all on function public.keepalive() from public;
grant execute on function public.public_get_order(uuid) to anon, authenticated;
grant execute on function public.public_respond_quote(uuid, boolean, text) to anon, authenticated;
grant execute on function public.keepalive() to anon, authenticated;
