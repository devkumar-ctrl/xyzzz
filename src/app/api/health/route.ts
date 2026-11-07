import { ensureBaseData } from "@/lib/server/data";

export async function GET() {
  try {
    await ensureBaseData();
    return Response.json({ ok: true });
  } catch (error) {
    console.error("Health check error", error);
    return Response.json({ ok: false }, { status: 503 });
  }
}
