# Multi-Store App Starter

Scalable multi-tenant ecommerce starter built with Next.js App Router, TypeScript, Tailwind CSS, and Supabase-ready utilities.

## Structure

- `app/` - App Router routes (auth, dashboard, admin, public storefront by `storeSlug`)
- `components/` - shared UI and layout components
- `lib/supabase/` - browser/server/middleware Supabase clients
- `types/` - tenant-aware domain and database types

## Quick Start

1. Install dependencies:
   - `npm install`
2. Create env file:
   - copy `.env.example` to `.env.local`
3. Run development server:
   - `npm run dev`

## Multi-Tenant Notes

- Keep `store_id` on all tenant-scoped tables.
- Use Supabase RLS to ensure store owners can only access rows matching their `store_id`.
- Restrict `/admin/*` routes to `super_admin`.
