# Today, Somewhere

A quiet collection of weather and ordinary moments from around the world.

## Local development

```bash
npm install
npm run dev
```

Without database credentials, submitted postcards are stored in
`data/postcards.json`. This is useful for local development only.

## Shared production postcards

1. Create a Supabase project.
2. Run [`supabase/schema.sql`](./supabase/schema.sql) in the Supabase SQL editor.
3. Add the following server environment variables to the deployment:

```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

The service-role key must remain server-only. Never expose it with a
`NEXT_PUBLIC_` prefix.

Published postcards contain only the city, weather, local time, and note.
Precise coordinates are not stored.
