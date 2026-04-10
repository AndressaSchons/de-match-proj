import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @returns {import('next/dist/shared/lib/image-config').RemotePattern | null} */
function supabaseStorageRemotePattern() {
  const raw = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!raw) return null;
  try {
    const u = new URL(raw);
    const protocol = u.protocol === "https:" ? "https" : "http";
    return {
      protocol,
      hostname: u.hostname,
      pathname: "/storage/v1/object/public/**",
    };
  } catch {
    return null;
  }
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root: __dirname,
  },
  images: {
    remotePatterns: [supabaseStorageRemotePattern()].filter(Boolean),
  },
};

export default nextConfig;
