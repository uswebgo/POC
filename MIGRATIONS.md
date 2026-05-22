# 🔄 Migraciones de Base de Datos

Este documento registra todas las migraciones de Supabase aplicadas al proyecto.

---

## 📋 Migraciones

### Migration 001: Agregar duracion_minutos (2026-05-22)

**Archivo:** `migration_add_duracion.sql`

**Propósito:** Agregar soporte para duración de eventos (ej: evento de 8 horas)

**Cambios:**
- Agrega columna `duracion_minutos` a tabla `eventos`
- Tipo: `INTEGER NULL`
- Permite rastrear la duración de eventos en minutos
- Ejemplo: 480 minutos = 8 horas

**Cómo ejecutar:**

#### Opción 1: Dashboard Supabase (Recomendado)
1. Ve a: https://app.supabase.com/project/ufwzavtzbmvieptszehd/sql
2. Haz click en "New Query"
3. Copia y pega el contenido de `migration_add_duracion.sql`
4. Haz click en "Run"
5. Verifica que se ejecutó exitosamente

#### Opción 2: Supabase CLI
```bash
# Si tienes Supabase CLI instalado
supabase db push
```

**Estado:** ⏳ PENDIENTE (aplicar manualmente en Supabase)

---

## ✅ Migraciones Aplicadas

| # | Fecha | Descripción | Estado |
|---|-------|-------------|--------|
| 001 | 2026-05-22 | Agregar `duracion_minutos` a eventos | ⏳ Pendiente |
| - | - | - | - |

---

## 🔍 Verificación

Después de aplicar cada migración, verifica que se ejecutó correctamente:

```sql
-- Verificar estructura de tabla eventos
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'eventos'
ORDER BY ordinal_position;
```

---

## 📌 Notas Importantes

- **Backup:** Siempre haz backup antes de ejecutar migraciones
- **Testing:** Prueba en staging primero si es posible
- **Rollback:** Guarda los scripts SQL para poder deshacer si es necesario
- **Documentación:** Mantén este archivo actualizado con cada migración

---

## 🔗 Recursos

- [Supabase SQL Editor](https://app.supabase.com)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Supabase CLI Docs](https://supabase.com/docs/guides/cli)
