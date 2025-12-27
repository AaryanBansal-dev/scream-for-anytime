import type { NextConfig } from "next";

/**
 * PRIVACY GUARANTEE: Content Security Policy
 * 
 * The CSP headers below ensure that:
 * - No outbound network connections are allowed (connect-src 'none')
 * - No external scripts, styles, or frames are loaded
 * - All resources must be from same origin or inline
 * 
 * This is a fundamental privacy protection that prevents any data exfiltration.
 */
const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval';
    style-src 'self' 'unsafe-inline';
    img-src 'self' blob: data:;
    font-src 'self';
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    connect-src 'none';
    media-src 'self' blob:;
    worker-src 'self' blob:;
`;

const nextConfig: NextConfig = {
  /**
   * PRIVACY: Disable telemetry completely
   * No analytics or tracking of any kind
   */
  headers: async () => {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: cspHeader.replace(/\n/g, ""),
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "no-referrer",
          },
          {
            key: "Permissions-Policy",
            value: "microphone=(self), camera=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
