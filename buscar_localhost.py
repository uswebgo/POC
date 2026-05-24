#!/usr/bin/env python3
"""
Script para buscar referencias a localhost en el proyecto POC
"""
import os
import re
from pathlib import Path

def search_localhost():
    """Busca todas las referencias a localhost en archivos del proyecto"""

    # Extensiones de archivo a revisar
    extensions = ['.html', '.js', '.jsx', '.ts', '.tsx', '.css', '.json', '.toml', '.gs', '.py']

    # Patrones a buscar
    patterns = [
        r'localhost',
        r'http://',
        r'redirectTo',
        r'redirect_uri',
        r'3000',
        r'window\.location'
    ]

    # Carpetas a ignorar
    ignore_dirs = {'.git', '.wrangler', 'node_modules', '.claude'}

    results = []

    print("🔍 Buscando referencias a localhost en el proyecto...\n")

    for root, dirs, files in os.walk('.'):
        # Filtrar directorios ignorados
        dirs[:] = [d for d in dirs if d not in ignore_dirs]

        for file in files:
            # Solo revisar archivos con extensiones relevantes
            if not any(file.endswith(ext) for ext in extensions):
                continue

            filepath = os.path.join(root, file)

            try:
                with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
                    content = f.read()
                    lines = content.split('\n')

                    for line_num, line in enumerate(lines, 1):
                        for pattern in patterns:
                            if re.search(pattern, line, re.IGNORECASE):
                                # Si contiene localhost, marcar especialmente
                                if 'localhost' in line.lower() or '3000' in line:
                                    results.append({
                                        'file': filepath,
                                        'line': line_num,
                                        'content': line.strip(),
                                        'important': True
                                    })
            except Exception as e:
                print(f"⚠️ Error leyendo {filepath}: {e}")

    # Mostrar resultados
    if results:
        print("=" * 100)
        print("🚨 REFERENCIAS ENCONTRADAS:\n")

        # Separar resultados importantes
        important = [r for r in results if r['important']]
        other = [r for r in results if not r['important']]

        if important:
            print("⚠️ IMPORTANTES (localhost/3000):\n")
            for result in important:
                print(f"📄 {result['file']}:{result['line']}")
                print(f"   {result['content'][:100]}")
                print()

        if other:
            print("\nℹ️ OTRAS REFERENCIAS:\n")
            for result in other[:20]:  # Mostrar máximo 20
                print(f"📄 {result['file']}:{result['line']}")
                print(f"   {result['content'][:100]}")
    else:
        print("✅ No se encontraron referencias a localhost\n")

    print("=" * 100)

if __name__ == '__main__':
    search_localhost()
