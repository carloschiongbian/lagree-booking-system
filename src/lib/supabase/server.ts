import { createServerClient } from "@supabase/supabase-js";
import { cookies, headers } from "next/headers";
import { env } from "@/lib/env";

export function supabaseServer() {
  const cookieStore = cookies();
  return createServerClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: any) {
        cookieStore.set(name, value, options);
      },
      remove(name: string, options: any) {
        cookieStore.set(name, "", { ...options, maxAge: 0 });
      },
    },
    global: { headers: Object.fromEntries(headers()) },
  });
}
