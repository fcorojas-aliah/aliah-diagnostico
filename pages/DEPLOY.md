ALIAH DEVELOPMENTS — Diagnóstico Organizacional
Guía de Deploy a Producción
Arquitectura
Frontend: Next.js 14 (React) → Vercel (gratis)
Backend: Supabase (PostgreSQL + Realtime) → Plan Free
IA: Anthropic API (Claude Sonnet) → Pay-per-use
Costo total estimado: $0-$15 USD/año
---
PASO 1: Supabase (5 minutos)
Ve a supabase.com → Start your project (gratis)
Crea una organización → Crea un proyecto nuevo
Nombre: `aliah-diagnostico`
Región: East US o la más cercana
Password: genera una segura (guárdala)
Espera ~2 minutos a que el proyecto se provisione
Ve a SQL Editor (menú izquierdo)
Pega TODO el contenido de `supabase-schema.sql` → Click RUN
Deberías ver: `Success. No rows returned`
Ve a Settings → API y copia:
`Project URL` → será tu `NEXT_PUBLIC_SUPABASE_URL`
`anon public` key → será tu `NEXT_PUBLIC_SUPABASE_ANON_KEY`
Verificar que funciona:
Ve a Table Editor → deberías ver la tabla `diagnostico_responses`
Ve a Database → Replication → confirma que `diagnostico_responses` está habilitada
---
PASO 2: GitHub (3 minutos)
Crea un repo nuevo en GitHub (público o privado)
Sube estos archivos con esta estructura:
```
aliah-diagnostico/
├── pages/
│   └── index.js          ← el archivo principal de la app
├── lib/
│   └── supabase.js       ← cliente de Supabase
├── package.json           ← dependencias
├── next.config.js         ← configuración de Next.js
├── .env.example           ← plantilla de variables (NO subir .env.local)
└── supabase-schema.sql    ← referencia del schema
```
IMPORTANTE: NO subas `.env.local` a GitHub (contiene tus API keys).
---
PASO 3: Vercel (5 minutos)
Ve a vercel.com → Sign up con GitHub
Click Add New → Project
Importa tu repo de GitHub
En Environment Variables, agrega:
`NEXT_PUBLIC_SUPABASE_URL` = tu URL de Supabase
`NEXT_PUBLIC_SUPABASE_ANON_KEY` = tu anon key
Click Deploy
En ~90 segundos tendrás tu URL: `https://aliah-diagnostico.vercel.app`
---
PASO 4: Verificar
Abre la URL en tu navegador
Llena un diagnóstico de prueba (nombre: "Test", cualquier área)
Abre la misma URL en otro dispositivo/pestaña
Ve al Dashboard → deberías ver el registro de prueba
Llena otro diagnóstico en el segundo dispositivo
Verifica que el Dashboard del primer dispositivo se actualiza solo (Realtime)
---
Seguridad Post-Launch
Restringir acceso al Dashboard (recomendado)
En Supabase SQL Editor, reemplaza la política de SELECT:
```sql
DROP POLICY IF EXISTS "allow_select" ON diagnostico_responses;
CREATE POLICY "allow_select" ON diagnostico_responses
  FOR SELECT USING (
    auth.jwt() ->> 'email' IN (
      'director@aliah.com',
      'rrhh@aliah.com'
    )
  );
```
Proteger la API key de Anthropic
Para producción real, mover la llamada a IA a un API route:
Crear `pages/api/generate.js`
Mover `ANTHROPIC_API_KEY` a variable de entorno del servidor (sin `NEXT_PUBLIC_`)
Llamar al endpoint `/api/generate` desde el frontend
---
Troubleshooting
Problema	Solución
"Supabase credentials not found"	Verifica las variables de entorno en Vercel
Datos no se guardan	Revisa que la tabla existe en Supabase Table Editor
Realtime no funciona	Ve a Database → Replication → habilita la tabla
Error 500 en deploy	Revisa los logs en Vercel → Functions tab
IA no genera documentos	La API key de Anthropic debe tener saldo
---
Comandos de desarrollo local
```bash
# Instalar dependencias
npm install

# Crear .env.local (copiar de .env.example y llenar con tus keys)
cp .env.example .env.local

# Iniciar en desarrollo
npm run dev

# Build de producción
npm run build
```
