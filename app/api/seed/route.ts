import { NextResponse } from "next/server";
import seedEquipments from "@/data/seed-2026.json";

// 장비 심의자료 초기 데이터. public/ 정적 파일로 두면 비밀번호 게이트를 우회해 누구나 내려받을 수 있어
// 이 API 라우트로만 서빙한다 (proxy.ts의 게이트가 /api/login 외 모든 요청에 적용됨)
export async function GET() {
  return NextResponse.json(seedEquipments);
}
