import { NextResponse } from "next/server";
import { hashSitePassword } from "@/lib/site-auth";

export async function POST(request: Request) {
  const formData = await request.formData();
  const password = formData.get("password");
  // from을 검증 없이 리다이렉트에 쓰면 외부 절대 URL로도 리다이렉트되는 오픈 리다이렉트가 된다
  const rawFrom = String(formData.get("from") || "/");
  const from = rawFrom.startsWith("/") && !rawFrom.startsWith("//") ? rawFrom : "/";

  if (password !== process.env.SITE_PASSWORD) {
    // 자동화 도구가 초당 수십~수백 번 시도하는 무차별 대입을 늦추기 위한 고정 지연
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const url = new URL("/login", request.url);
    url.searchParams.set("from", from);
    url.searchParams.set("error", "1");
    return NextResponse.redirect(url, { status: 303 });
  }

  const response = NextResponse.redirect(new URL(from, request.url), { status: 303 });
  // 쿠키에 비밀번호 원문 대신 해시를 넣어서, 개발자도구로 쿠키를 봐도 원래 비밀번호가 드러나지 않게 한다
  response.cookies.set("site_auth", await hashSitePassword(String(password)), {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });
  return response;
}
