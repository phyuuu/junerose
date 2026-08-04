import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { supabaseEnvironment } from "@/lib/env";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    supabaseEnvironment.url,
    supabaseEnvironment.publishableKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Server Components cannot always modify cookies.
            // A proxy will handle session refreshing later.
          }
        },
      },
    },
  );
}
