import type { NextConfig } from 'next';

import initializeBundleAnalyzer from '@next/bundle-analyzer';

// https://www.npmjs.com/package/@next/bundle-analyzer
const withBundleAnalyzer = initializeBundleAnalyzer({
    enabled: process.env.BUNDLE_ANALYZER_ENABLED === 'true'
});

// https://nextjs.org/docs/pages/api-reference/next-config-js
const nextConfig: NextConfig = {
    output: 'standalone',
    // Turbopack tries to infer the workspace root by scanning for lockfiles.
    // Because this project lives inside a larger folder with its own package-lock.json,
    // we pin the root to the current directory so `next dev --turbopack` stops walking up.

};

export default withBundleAnalyzer(nextConfig);
