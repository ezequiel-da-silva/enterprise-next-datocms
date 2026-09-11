import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

/**
 * Vercel injects an adapter; Next 16.3 + standalone then fails looking for
 * next-server.js.nft.json. Keep standalone for local/CI Docker-style runs.
 * @see https://github.com/vercel/next.js/issues/96646
 */
const nextConfig: NextConfig = {
  output: process.env.VERCEL ? undefined : "standalone",
  poweredByHeader: false,
  experimental: {
    optimizePackageImports: [
      "@fortawesome/free-solid-svg-icons",
      "@fortawesome/free-regular-svg-icons",
      "@fortawesome/free-brands-svg-icons",
    ],
  },
  images: {
    loader: "custom",
    loaderFile: "./src/lib/datocms-image-loader.ts",
    deviceSizes: [384, 480, 640, 750, 828, 960, 1080],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 320, 384],
    minimumCacheTTL: 86400,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.datocms-assets.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "image.mux.com",
        pathname: "/**",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-DNS-Prefetch-Control", value: "on" },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
        ],
      },
      /*
       * Só em produção: em dev os chunks não têm hash no nome (`webpack.js`,
       * `main-app.js`), pelo que `immutable` faz o browser reutilizar JS antigo
       * indefinidamente e o cliente hidrata código desatualizado contra o HTML novo.
       */
      ...(isProd
        ? [
            {
              source: "/_next/static/:path*",
              headers: [
                {
                  key: "Cache-Control",
                  value: "public, max-age=31536000, immutable",
                },
              ],
            },
          ]
        : []),
    ];
  },
};

export default nextConfig;
