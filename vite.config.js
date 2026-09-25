import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const buildId = process.env.VERCEL_GIT_COMMIT_SHA || process.env.GITHUB_SHA || Date.now().toString(36);

export default defineConfig({
  define: { __RUMS_BUILD_ID__: JSON.stringify(buildId) },
  plugins: [react(), {
    name: 'rums-build-version',
    apply: 'build',
    generateBundle() {
      this.emitFile({ type: 'asset', fileName: 'version.json', source: JSON.stringify({ version: buildId }) });
    },
  }],
});
