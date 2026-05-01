import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

// Read version from package.json at build time
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pkg = require("./package.json") as { version?: string };
const appVersion = pkg.version ?? (() => {
  console.warn(
    "[next.config.ts] WARNING: package.json is missing a `version` field. " +
      "Falling back to '0.0.0'. Add `\"version\": \"0.1.0\"` to package.json."
  );
  return "0.0.0";
})();

const buildDate = new Date().toISOString().slice(0, 10);

// Parse Supabase URL so next/image can load avatars from whichever Supabase
// instance is configured (local 127.0.0.1:<port>, or *.supabase.co in prod).
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseRemotePattern = (() => {
  if (!supabaseUrl) return null;
  try {
    const u = new URL(supabaseUrl);
    return {
      protocol: u.protocol.replace(':', '') as 'http' | 'https',
      hostname: u.hostname,
      port: u.port || '',
      pathname: '/storage/v1/object/public/**',
    };
  } catch {
    return null;
  }
})();

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_APP_VERSION: appVersion,
    NEXT_PUBLIC_BUILD_DATE: buildDate,
  },
  experimental: {
    serverActions: {
      // Avatar uploads cap at 5 MB; headroom for FormData multipart overhead.
      bodySizeLimit: '6mb',
    },
  },
  images: {
    remotePatterns: [
      ...(supabaseRemotePattern ? [supabaseRemotePattern] : []),
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
};

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

export default withNextIntl(nextConfig);
