import { NextRequest, NextResponse } from "next/server";
import { extractAuthPayload } from "@/lib/auth";
import { getMetaConnectionsByEmpresas, getUserEmpresaIds } from "@/lib/userMeta";

export async function GET(req: NextRequest) {
  try {
    const auth = req.headers.get("authorization") ?? undefined;
    const user = extractAuthPayload(auth);
    const empresaIds = await getUserEmpresaIds(user.usuarioId);
    const connections = await getMetaConnectionsByEmpresas(empresaIds);
    return NextResponse.json({ connections });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "erro desconhecido" },
      { status: 401 }
    );
  }
}
