import { createBrowserClient } from "@supabase/ssr";
import { supabaseEnvironment } from "@/lib/env";

export function createClient() {
  return createBrowserClient(
    supabaseEnvironment.url,
    supabaseEnvironment.publishableKey,
  );
}
