import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseService } from "@/lib/supabase/service";

const bodySchema = z.object({ user_package_id: z.string().uuid() });

export async function POST(req: Request) {
  const svc = supabaseService();
  const json = await req.json();
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "invalid_body" }, { status: 400 });

  const { user_package_id } = parsed.data;

  const { data: up, error: err1 } = await svc
    .from("user_packages")
    .update({ status: "confirmed" })
    .eq("id", user_package_id)
    .select("user_id, package_id")
    .single();
  if (err1 || !up) return NextResponse.json({ error: err1?.message || "not_found" }, { status: 400 });

  const { data: pkg } = await svc.from("packages").select("credits").eq("id", up.package_id).single();
  if (pkg?.credits) {
    await svc.from("user_packages").update({ credits_remaining: pkg.credits }).eq("id", user_package_id);
  }

  return NextResponse.json({ ok: true });
}
