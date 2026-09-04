import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // 다른 사이트가 이 앱을 iframe으로 감싸는 클릭재킹을 막는다
          { key: "X-Frame-Options", value: "DENY" },
          // 브라우저가 응답 타입을 임의로 추측하지 못하게 막는다
          { key: "X-Content-Type-Options", value: "nosniff" },
        ],
      },
    ];
  },
};

export default nextConfig;
