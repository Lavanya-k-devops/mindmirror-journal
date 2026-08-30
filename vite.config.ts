import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';

/**
 * Plugin to provide a clean no-op transport for Vite client in containerized preview environments
 * where HMR WebSockets are unsupported or disabled.
 * This prevents the browser client from attempting an unsupported WebSocket connection to non-exposed ports.
 */
function disableClientHmrTransportPlugin(): Plugin {
  return {
    name: 'disable-client-hmr-transport',
    enforce: 'post',
    transform(code: string, id: string) {
      if (id.includes('vite/dist/client/client.mjs') || id.includes('@vite/client')) {
        let transformed = code.replace(
          /const createWebSocketModuleRunnerTransport = \([\s\S]*?disconnect\(\) \{[\s\S]*?\}\s*;\s*\}\s*;/m,
          'const createWebSocketModuleRunnerTransport = () => ({ connect: async () => {}, disconnect: async () => {}, send: async () => {} });'
        );
        transformed = transformed.replace(
          /async function waitForSuccessfulPing\([\s\S]*?\n\}/m,
          'async function waitForSuccessfulPing() { return; }'
        );
        transformed = transformed.replace(
          /console\.debug\("\[vite\] connecting\.\.\."\);/,
          '/* HMR WebSocket disabled */'
        );
        return transformed;
      }
      return null;
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      disableClientHmrTransportPlugin(),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // Disable HMR in preview sandbox environment to prevent WebSocket connection failures
      hmr: false,
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});

