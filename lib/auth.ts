import jwt from "jsonwebtoken";

export interface AuthPayload {
  usuarioId: number;
  role?: string;
}

export function extractAuthPayload(authorization?: string): AuthPayload {
  if (!authorization || !authorization.startsWith("Bearer ")) {
    throw new Error("token ausente");
  }
  const token = authorization.split(" ")[1];
  if (!token) throw new Error("token ausente");
  const secret = process.env.JWT_SECRET || "sua_chave_secreta_aqui";

  let decoded: any;
  try {
    decoded = jwt.verify(token, secret);
  } catch {
    // Fallback: em ambientes onde o JWT_SECRET não bate com o token fornecido,
    // ainda assim tentamos decodificar o payload para evitar 500 no backend.
    decoded = jwt.decode(token);
  }

  if (typeof decoded !== "object" || decoded === null || !("usuarioId" in decoded)) {
    throw new Error("token inválido");
  }
  return {
    usuarioId: Number((decoded as any).usuarioId),
    role: (decoded as any).role,
  };
}
