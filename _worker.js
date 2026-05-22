/**
 * Agenda Inteligente Híbrida — Cloudflare Worker
 * Sirve la app estática + maneja rutas
 */

const ASSETS = getAssetFromKV;

export default {
  async fetch(request, env, ctx) {
    try {
      const url = new URL(request.url);
      const path = url.pathname;

      // Health check
      if (path === '/api/health') {
        return new Response(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }), {
          headers: { 'Content-Type': 'application/json' },
        });
      }

      // Rutas protegidas (futuro)
      if (path.startsWith('/admin/')) {
        // TODO: autenticación
      }

      // Servir archivos estáticos
      try {
        // Para cualquier ruta, intenta servir el archivo
        // Si es una ruta SPA (sin extensión), sirve index.html
        let file = path === '/' ? '/index.html' : path;

        const response = await ASSETS(request, [env.ASSETS]);
        if (response.status === 200) {
          return response;
        }

        // Si no existe, intenta servir index.html (SPA)
        if (!file.includes('.')) {
          const indexRequest = new Request(`${url.origin}/index.html`, request);
          return ASSETS(indexRequest, [env.ASSETS]);
        }

        return response;
      } catch (e) {
        // Fallback: servir index.html
        const indexRequest = new Request(`${url.origin}/index.html`, request);
        return ASSETS(indexRequest, [env.ASSETS]);
      }
    } catch (e) {
      console.error('Worker error:', e);
      return new Response('Error', { status: 500 });
    }
  },
};

// Importar getAssetFromKV de @cloudflare/kv-asset-handler
import { getAssetFromKV } from '@cloudflare/kv-asset-handler';
