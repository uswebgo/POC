# 🔧 SETUP: Aplicar Migración en Supabase

## ⚠️ IMPORTANTE - Pasos Requeridos

Después de hacer deploy de los cambios (v2.3), debes ejecutar esta migración en Supabase para que el campo de duración funcione.

---

## 📝 Paso 1: Acceder a Supabase

1. Ve a: **https://app.supabase.com**
2. Inicia sesión con tu cuenta
3. Selecciona el proyecto **"agenda-inteligente"**

---

## 🗂️ Paso 2: Abrir SQL Editor

1. Haz click en **"SQL Editor"** (lado izquierdo)
2. Haz click en **"New Query"** (botón azul)

---

## 📋 Paso 3: Ejecutar la Migración

Copia **TODO** esto en el editor:

```sql
-- Migration: Add duracion_minutos to eventos table
-- Date: 2026-05-22
-- Purpose: Support event duration/end time tracking

-- Add duracion_minutos column to eventos table
ALTER TABLE eventos ADD COLUMN IF NOT EXISTS duracion_minutos INTEGER DEFAULT NULL;

-- Add comment explaining the column
COMMENT ON COLUMN eventos.duracion_minutos IS 'Duración del evento en minutos. Ej: 480 = 8 horas. Nullable.';

-- Create index for performance (optional)
CREATE INDEX IF NOT EXISTS idx_eventos_duracion ON eventos(duracion_minutos);
```

**O mejor aún:** Abre el archivo `migration_add_duracion.sql` y cópialo todo.

---

## ✅ Paso 4: Ejecutar

1. Haz click en el botón **"Run"** (esquina superior derecha)
2. Espera a que se complete (2-3 segundos)
3. Deberías ver: **"Success. No rows returned"**

---

## 🔍 Paso 5: Verificar

Ejecuta esta query para verificar que se agregó la columna:

```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'eventos'
ORDER BY ordinal_position;
```

**Deberías ver una fila con:**
- `column_name`: `duracion_minutos`
- `data_type`: `integer`
- `is_nullable`: `YES`

---

## 🧪 Paso 6: Probar

### En la app:

1. Abre: **https://agenda-inteligente.pages.dev**
2. Haz click en **"Nuevo Evento"**
3. Llena los campos:
   - **Título**: "Jornada Laboral"
   - **Categoría**: "Laboral"
   - **Fecha**: Hoy a las 9:00
   - **Hora fin**: 17:00 (o deja vacío)
   - **Duración**: 480 (para 8 horas)
   - **Detalles**: "Día completo de trabajo"
4. Haz click en **"Guardar Evento"**
5. Haz click en la tarjeta del evento creado para **expandir**

**Deberías ver:**
- ✅ El evento aparece con el título solo
- ✅ Al hacer click, se expande y muestra todos los detalles
- ✅ Muestra la duración: "8h 0m"
- ✅ Muestra hora inicio y fin si está disponible

---

## ❌ Si falla

### Error: "Column already exists"
→ La columna ya existe. **Esto está bien**, continúa.

### Error: "Relation 'eventos' not found"
→ Verifica que estés en el proyecto correcto (agenda-inteligente)

### Error: "Permission denied"
→ Contacta al administrador de la base de datos

### La columna aparece pero los eventos no muestran duración
→ Los eventos antiguos no tienen `duracion_minutos`. Crea uno nuevo.

---

## 📱 Testing Completo

| Feature | Test | Resultado |
|---------|------|-----------|
| **Event colapsado** | Crear evento | Solo muestra título ✅ |
| **Event expandido** | Click en tarjeta | Muestra detalles ✅ |
| **Duración visible** | Crear con duración | Muestra "8h 30m" ✅ |
| **Hora fin** | Agregar duracion | Calcula hora fin correcta ✅ |
| **AI Prompt** | Click "Ver Prompt" | Abre modal con instrucciones ✅ |
| **Google Calendar** | Click botón "Google Cal" | Abre calendar.google.com ✅ |
| **Bottom Nav** | Hover en botones | Transiciones suaves ✅ |

---

## 🎯 Checklist Final

- [ ] Migración ejecutada en Supabase
- [ ] Verificación SQL pasó
- [ ] App actualizada (v2.3)
- [ ] Evento nuevo creado con duración
- [ ] Event cards se colapsan/expanden
- [ ] Prompt IA oculto en modal
- [ ] Botón Google Calendar funciona
- [ ] Bottom nav se ve modernizado

---

## 📞 Soporte

Si hay problemas:

1. **Abre DevTools:** F12 → Console
2. **Busca errores** en la consola
3. **Comparte el error** con el contexto (ej: "Error al guardar evento")

---

## ✨ ¡Listo!

Una vez completados estos pasos, tu Agenda Inteligente v2.3 estará totalmente funcional con:

✅ Eventos con duración/hora fin  
✅ Event cards colapsables  
✅ AI prompt oculto  
✅ Bottom nav modernizado  
✅ Google Calendar integrado  
✅ UI mejorada y responsiva  

**¡Disfruta de tu app mejorada!** 🚀
