import { NextResponse, type NextRequest } from "next/server";
import { hashSitePassword } from "@/lib/site-auth";

// Vercel Hobby 플랜은 자체 비밀번호 보호를 지원하지 않아, 앱 단에서 간단한 비밀번호 게이트를 둔다
const COOKIE_NAME = "site_auth";

export async function proxy(request: NextRequest) {
  // SITE_PASSWORD가 설정 안 돼 있으면(예: 환경변수 등록 누락) 무조건 막는다 —
  // undefined === undefined로 게이트가 뚫리는 것을 방지
  const expected = process.env.SITE_PASSWORD;
  const cookie = request.cookies.get(COOKIE_NAME)?.value;
  if (expected && cookie === (await hashSitePassword(expected))) {
    return NextResponse.next();
  }

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("from", request.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
}

// _next, /login, /api/login, 로고 이미지·파비콘만 게이트를 건너뛴다.
// 장비 데이터(seed)는 정적 파일이 아니라 /api/seed(게이트 적용 대상)로만 내려준다
export const config = {
  matcher: ["/((?!_next|api/login|login|.*\\.(?:png|jpg|jpeg|svg|ico|webp)$).*)"],
};
