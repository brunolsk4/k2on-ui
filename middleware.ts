import { NextResponse, type NextRequest } from 'next/server'

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

export function middleware(req: NextRequest) {
  const { pathname, origin, basePath } = req.nextUrl
  // Only guard paths under basePath (Next strips basePath when matching config.matcher)
  const bp = basePath || ''
  if (!pathname.startsWith(bp)) return NextResponse.next()

  const publicRegex = new RegExp(`^${bp}(\/)?(login|signup|forgot-password|reset-password|auth-success|otp)$`)
  const isPublic = publicRegex.test(pathname) || isAsset(pathname, bp)
  const token = req.cookies.get('k2on_token')?.value

  if (!token && !isPublic) {
    const url = new URL(`${bp}/login`, origin)
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }

  // If already authenticated and visiting login/signup, send to home
  if (token && (new RegExp(`^${bp}/(login|signup)$`).test(pathname))) {
    return NextResponse.redirect(new URL(`${bp}/home`, origin))
  }

  return NextResponse.next()
}

export const config = { matcher: ['/app/:path*'] }
