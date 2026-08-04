-- Admin order filter indexes
-- Run this in the Supabase SQL Editor after the orders table exists.
-- These indexes support admin pagination, sorting, status filtering, date
-- filtering, and search by order number, customer name, or customer phone.

create extension if not exists pg_trgm with schema extensions;

create index if not exists orders_created_at_idx
on public.orders (created_at desc);

create index if not exists orders_status_created_at_idx
on public.orders (status, created_at desc);

create index if not exists orders_total_mmk_idx
on public.orders (total_mmk);

create index if not exists orders_order_number_trgm_idx
on public.orders using gin (order_number gin_trgm_ops);

create index if not exists orders_customer_name_trgm_idx
on public.orders using gin (customer_name gin_trgm_ops);

create index if not exists orders_customer_phone_trgm_idx
on public.orders using gin (customer_phone gin_trgm_ops);
