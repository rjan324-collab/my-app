// 로그인 쿠키에 비밀번호 원문을 그대로 넣으면 브라우저 개발자도구에서 그대로 보인다.
// 대신 이 해시값을 쿠키에 저장하고 비교해서, 쿠키가 노출돼도 원래 비밀번호는 드러나지 않게 한다.
// Edge(proxy.ts)와 Node(app/api/login) 양쪽에서 다 쓸 수 있게 Web Crypto(SubtleCrypto)를 사용한다
export async function hashSitePassword(password: string): Promise<string> {
  const data = new TextEncoder().encode(password);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}
