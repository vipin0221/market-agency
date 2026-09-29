import { destroySession } from "@/lib/auth";
import { redirect } from "next/navigation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  await destroySession();
  redirect("/login");
}
