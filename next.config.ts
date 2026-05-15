import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Phase 5 (admin UI): static export dropped — admin needs server-side
  // mutations (Vercel Blob writes, image processing). Public catalog is now
  // rendered dynamically with revalidation, but stays fast via Vercel's edge
  // cache. See PROJECT.md → Key Decisions (D-08 revisited).
  images: {
    unoptimized: true,
    remotePatterns: [
      // Vercel Blob public URLs — pattern matches any blob.vercel-storage.com
      // subdomain (Vercel allocates a unique one per project).
      { protocol: 'https', hostname: '*.public.blob.vercel-storage.com' },
    ],
  },
};

export default nextConfig;
