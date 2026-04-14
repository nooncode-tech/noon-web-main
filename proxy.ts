import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

// Routes that should NOT be locale-prefixed
const bypassPatterns = [
  /^\/maxwell(\/.*)?$/,
  /^\/signin(\/.*)?$/,
  /^\/upgrade(\/.*)?$/,
  /^\/api(\/.*)?$/,
  /^\/legal(\/.*)?$/,
  /^\/legal-notice(\/.*)?$/,
  /^\/privacy-policy(\/.*)?$/,
  /^\/terms-and-conditions(\/.*)?$/,
  /^\/cookies-policy(\/.*)?$/,
  /^\/_next(\/.*)?$/,
  /^\/favicon\.ico$/,
  /^\/logo.*$/,
  /^\/.*\.(png|jpg|jpeg|gif|svg|ico|webp|woff|woff2|ttf|eot)$/,
];

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (bypassPatterns.some((pattern) => pattern.test(pathname))) {
    return NextResponse.next();
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
