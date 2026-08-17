import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Public client — safe to use anywhere (browser or server).
// Can only read published posts and read/write likes+comments (see RLS policies).
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Admin client — SERVER-ONLY. Uses the service role key, which bypasses RLS.
// Never import this into a "use client" component or expose it to the browser.
// Used by /app/api/admin/* routes (post create/edit/delete, image upload),
// which are themselves protected by the admin password check in lib/adminAuth.ts.
export function getSupabaseAdmin() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is not set. Add it to .env.local (Supabase → Project Settings → API → service_role key)."
    );
  }
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
