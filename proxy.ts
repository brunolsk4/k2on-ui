import type { NextRequest } from 'next/server'

function isAsset(pathname: string, basePath: string): boolean {
  if (pathname.startsWith(`${basePath}/_next`)) return true
  if (pathname.startsWith(`${basePath}/fonts`)) return true
  if (pathname.startsWith(`${basePath}/icons`)) return true
  if (pathname.startsWith(`${basePath}/logos`)) return true
  if (pathname.startsWith(`${basePath}/project-covers`)) return true
  if (pathname.startsWith(`${basePath}/avatars`)) return true
  // static files at the basePath root
  return /(\.(png|jpg|jpeg|gif|svg|ico|webp|avif|css|js|map|txt|xml|webmanifest))$/i.test(pathname)
}

export const proxy = (request: NextRequest) => {
  const { pathname, basePath } = request.nextUrl
  // Only guard paths under basePath (Next strips basePath when matching config.matcher)
  const bp = basePath || ''
  if (!pathname.startsWith(bp)) return

  const publicRegex = new RegExp(`^${bp}(\/)?(login|signup|forgot-password|reset-password|auth-success|otp)$`)
  const isPublic = publicRegex.test(pathname) || isAsset(pathname, bp)
  void isPublic
  // Não forçar redirect baseado em cookie aqui. Confiamos no guard do cliente (AuthGate/Protected)
  // para evitar loops e lidar com estados de cookie/localStorage diferentes entre navegadores.

  // Importante: não redirecionar forçadamente usuários com cookie para /home.
  // O cookie pode estar expirado/inválido e isso causaria loop entre /home (client
  // detecta inválido e manda para /login) e aqui (que manda de volta para /home).
  // Em vez disso, deixamos /login e /signup acessíveis mesmo com cookie presente.
}

export const config = { matcher: ['/app/:path*'] }
