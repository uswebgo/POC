// Importar al principio (ES modules best practice)
import { getAssetFromKV } from '@cloudflare/kv-asset-handler';

/**
 * Agenda Inteligente — Cloudflare Worker
 * Sirve PWA estática + maneja rutas críticas
 *
 * Arquitectura:
 * - Frontend SPA servido por este Worker
 * - API calls van directamente a Supabase + Google Apps Script
 * - Este Worker solo maneja archivos estáticos + health check
 */

export default {
  async fetch(request, env, ctx) {
    try {
      const url = new URL(request.url);
      const path = url.pathname;

      // ===== HEALTH CHECK =====
      if (path === '/api/health') {
        return new Response(
          JSON.stringify({
            status: 'ok',
            timestamp: new Date().toISOString(),
            app: 'agenda-inteligente',
            version: '2.0.0'
          }),
          {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
              'Cache-Control': 'no-cache'
            }
          }
        );
      }

      // ===== RUTAS PROTEGIDAS (FUTURO) =====
      if (path.startsWith('/admin/')) {
        return new Response('Acceso denegado', { status: 403 });
      }

      // ===== SERVIR ARCHIVOS ESTÁTICOS =====
      try {
        const asset = await getAssetFromKV(request, {
          ASSET_NAMESPACE: env.ASSETS
        });

        // Agregar headers de seguridad adicionales
        const response = new Response(asset.body, asset);
        response.headers.set('X-Content-Type-Options', 'nosniff');
        response.headers.set('X-Frame-Options', 'SAMEORIGIN');

        return response;
      } catch (assetError) {
        // Si el archivo no existe, intenta servir index.html (SPA routing)
        // Esto permite que rutas sin extensión como /events, /calendar vayan a index.html
        if (!path.includes('.')) {
          try {
            const indexRequest = new Request(new URL('/index.html', request.url), {
              method: 'GET',
              headers: request.headers
            });
            return getAssetFromKV(indexRequest, {
              ASSET_NAMESPACE: env.ASSETS
            });
          } catch (indexError) {
            console.error('Error sirviendo index.html:', indexError);
            return new Response('App no disponible', { status: 500 });
          }
        }

        // Si es un archivo con extensión pero no existe
        console.warn(`Archivo no encontrado: ${path}`);
        return new Response('Archivo no encontrado', { status: 404 });
      }
    } catch (error) {
      console.error('Worker error crítico:', error);
      return new Response(
        JSON.stringify({
          error: 'Error interno del servidor',
          details: error.message
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
  }
};
