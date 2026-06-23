## Problem

Login is failing with `TypeError: Failed to fetch` when calling:
`POST https://ai.excelsoftcorp.com/aiapps/AIToolKit/UnitPlanGen/check-user`

This is a **CORS issue**: the Excelsoft API does not return `Access-Control-Allow-Origin` headers for the Lovable preview origin, so the browser blocks the request before a response is received. The credentials themselves are never actually validated — the request never reaches the server successfully from the browser.

This will also affect every other quiz API call (grades, subjects, chapters, ELOs, generate quiz) for the same reason.

## Fix

Route all Excelsoft API calls through server-side edge functions so the browser only talks to our own backend (no CORS issue), and the edge function talks server-to-server to Excelsoft.

### Steps

1. **Enable Lovable Cloud** — required to host edge functions. No database/auth tables needed; we're only using it for serverless functions.

2. **Create edge function `excelsoft-proxy`** that:
   - Accepts `{ endpoint, payload }` from the client
   - Forwards the request to `https://ai.excelsoftcorp.com/aiapps/AIToolKit/UnitPlanGen/<endpoint>`
   - Returns the upstream JSON response
   - Includes proper CORS headers so the browser can call it
   - Made `public` (no JWT verification) since login happens pre-auth

3. **Update `src/hooks/useAuth.ts`** — replace direct `fetch` to Excelsoft with a call to the edge function via the Supabase client (`supabase.functions.invoke('excelsoft-proxy', { body: { endpoint: 'check-user', payload: { username, password } } })`).

4. **Update quiz API calls** in `CreateQuizForm.tsx` (and anywhere else direct Excelsoft `fetch` is used) to go through the same proxy.

5. **Verify** by attempting login with the user's credentials, then confirm cascading dropdowns load.

### What will NOT change

- UI, styling, login form, branding — unchanged.
- Auth state management (Zustand) — unchanged.
- Excelsoft API contract (request/response shapes) — unchanged.

### Note on credentials

I cannot bypass the Excelsoft password check — only the Excelsoft server can validate `anantha.krishna@excelindia.com`'s password. Once the proxy is in place, your real credentials will reach the server and you'll be logged in (assuming they're correct).
