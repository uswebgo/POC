#!/usr/bin/env node
/**
 * Verifica la configuración de OAuth almacenada en localStorage y Supabase
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verificando configuración de OAuth...\n');

// 1. Leer el código HTML para ver qué parámetros se están usando
const indexPath = path.join(__dirname, 'index.html');
const indexContent = fs.readFileSync(indexPath, 'utf-8');

console.log('📄 === BUSCANDO CONFIGURACIÓN EN index.html ===\n');

// Buscar inicialización de Supabase
const supabaseInitMatch = indexContent.match(/createClient\s*\(\s*['"]([^'"]+)['"]\s*,\s*['"]([^'"]+)['"]/);
if (supabaseInitMatch) {
    console.log('✅ Supabase URL encontrada:', supabaseInitMatch[1]);
    console.log('✅ Supabase ANON KEY encontrada: ' + supabaseInitMatch[2].substring(0, 20) + '...');
} else {
    console.log('❌ No se encontró inicialización de Supabase');
}

// Buscar la función loginConGoogle
const loginFunctionMatch = indexContent.match(/loginConGoogle\s*\([^)]*\)\s*{([^}]+?)(?=\n\s{4}\})/s);
if (loginFunctionMatch) {
    console.log('\n📍 Función loginConGoogle encontrada:');
    const funcBody = loginFunctionMatch[1].trim();
    console.log(funcBody.substring(0, 500));

    // Buscar redirectTo
    if (funcBody.includes('redirectTo')) {
        console.log('\n⚠️ ENCONTRADO: redirectTo está siendo usada');
        const redirectMatch = funcBody.match(/redirectTo\s*[:=]\s*['"`]([^'"`]+)['""`]/);
        if (redirectMatch) {
            console.log('   Redirige a:', redirectMatch[1]);
        }
    } else {
        console.log('\n✅ No hay redirectTo explícito (Supabase usará sus settings)');
    }
}

// 2. Buscar referencias a localStorage
console.log('\n\n📄 === BUSCANDO REFERENCIAS A localStorage ===\n');

const localStorageMatches = indexContent.match(/localStorage\.(getItem|setItem|removeItem)\s*\(\s*['"]([^'"]+)['"]/g);
if (localStorageMatches) {
    const keys = new Set();
    localStorageMatches.forEach(match => {
        const keyMatch = match.match(/['"]([^'"]+)['"]/);
        if (keyMatch) keys.add(keyMatch[1]);
    });

    console.log('🔑 Keys almacenadas en localStorage:');
    keys.forEach(key => console.log('   -', key));
} else {
    console.log('✅ No se encontraron uses de localStorage');
}

// 3. Buscar variables de configuración
console.log('\n\n📄 === BUSCANDO CONSTANTES DE CONFIGURACIÓN ===\n');

const configMatches = indexContent.match(/(const|let|var)\s+(SUPABASE|SITE|AUTH|REDIRECT|CLIENT)\w*\s*=\s*['"`]([^'"`]+)['""`]/gi);
if (configMatches) {
    console.log('⚙️ Configuraciones encontradas:');
    configMatches.forEach(match => {
        console.log('   -', match);
    });
} else {
    console.log('✅ No hay constantes de configuración hardcodeadas');
}

// 4. Buscar URL.parse o window.location
console.log('\n\n📄 === BUSCANDO MANIPULACIÓN DE URLs ===\n');

const urlMatches = indexContent.match(/(?:new URL|window\.location|location\.href|location\.hash)\s*[=\(].*?(?:localhost|3000|callback)/gi);
if (urlMatches) {
    console.log('⚠️ Manipulaciones de URL encontradas:');
    urlMatches.forEach(match => {
        console.log('   -', match);
    });
} else {
    console.log('✅ No hay manipulación de URLs hardcodeadas para localhost');
}

console.log('\n\n' + '='.repeat(60));
console.log('📋 VERIFICACIÓN COMPLETADA');
console.log('='.repeat(60));
console.log('\n💡 Próximos pasos:');
console.log('1. Verifica en Supabase Console → Authentication → Settings');
console.log('2. Busca "Site URL" - debe ser tu dominio de Cloudflare');
console.log('3. Busca "Redirect URLs" - deben incluir tu dominio de Cloudflare');
console.log('4. Limpia el browser cache completamente');
console.log('5. Prueba nuevamente el login con Google\n');
