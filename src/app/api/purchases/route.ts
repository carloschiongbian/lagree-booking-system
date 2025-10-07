import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseServer } from "@/lib/supabase/server";

const bodySchema = z.object({ package_id: z.string().uuid(), method: z.enum(["gcash","bank","card"]) });

export async function POST(req: Request) {
  const supabase = supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const json = await req.json();
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "invalid_body" }, { status: 400 });

  const { package_id, method } = parsed.data;

  const { data: pkg, error: err1 } = await supabase.from("packages").select("id, duration_days, credits").eq("id", package_id).single();
  if (err1 || !pkg) return NextResponse.json({ error: err1?.message || "package_not_found" }, { status: 400 });

  const expires_at = pkg.duration_days ? new Date(Date.now() + pkg.duration_days * 86400000).toISOString() : null;

  const { data: up, error: err2 } = await supabase
    .from("user_packages")
    .insert({ user_id: user.id, package_id, status: method === "card" ? "confirmed" : "pending", credits_remaining: method === "card" ? pkg.credits : 0, expires_at })
    .select("id,status")
    .single();
  if (err2) return NextResponse.json({ error: err2.message }, { status: 400 });

  return NextResponse.json({ purchase: up });
}
