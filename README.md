# Peru Market ERP — Frontend (Supabase)

ERP de Peru Market. **Solo frontend**: React + TypeScript + Vite + Tailwind,
con **Supabase** como backend (base de datos + autenticación). Sin backend Java.

---

## ✅ Estado actual

- Proyecto migrado desde `perumarket-erp-frontend` (axios/Java) a Supabase.
- Autenticación con **Supabase Auth** (email + contraseña).
- Los **servicios** (`src/services/`) consultan Supabase, tipados con `src/types/`.
- `npm run build` compila **sin errores**.
- Credenciales ya configuradas en `.env`.

---

## 🚀 Puesta en marcha (haz esto una vez)

### 1. Crear la base de datos en Supabase

> ⚠️ `supabase/schema.sql` empieza con `drop schema public cascade`. Si ya
> creaste tablas a mano en este proyecto Supabase, **se borrarán** y se
> recrearán desde cero. Úsalo en un proyecto limpio.

En **Supabase → SQL Editor → New query**:

1. Pega y ejecuta **todo** `supabase/schema.sql`  (crea las 33 tablas, FKs,
   índices, triggers, RLS, vistas y el puente con Supabase Auth).
2. Pega y ejecuta **todo** `supabase/seed.sql`  (datos: catálogos,
   productos, clientes, ventas de muestra, etc.).

### 2. Crear tu usuario de acceso

El login usa Supabase Auth. Para entrar con un perfil/rol real:

1. Supabase → **Authentication → Users → Add user**
   - Email: `jean@perumarket.com`  (coincide con el usuario `toribio`,
     rol **Administrador**, ya cargado en el seed)
   - Password: la que quieras (mín. 6 caracteres) → marca *Auto Confirm*.
2. El trigger `link_auth_user()` enlaza automáticamente esa cuenta con la
   fila de `public.usuario` cuyo `persona.correo` coincide. Ese usuario
   tendrá acceso a **todos los módulos** (rol Administrador).

> Si creas un usuario cuyo email NO coincide con ninguna `persona.correo`,
> igual podrás entrar, pero con “acceso total temporal” (sin perfil). Para
> vincularlo manualmente:
> ```sql
> update public.usuario set auth_user_id = 'UUID-DEL-AUTH-USER' where id = 8;
> ```

### 3. Arrancar

```bash
npm install
npm run dev      # desarrollo
npm run build    # build de producción
```

Las credenciales ya están en `.env` (Vite usa el prefijo `VITE_`):

```env
VITE_SUPABASE_URL=https://wxmkveehtwmcfqlnrwep.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_...
```

`.env` está en `.gitignore` (no se sube al repo).

### 4. Probar la conexión

Entra a la ruta `/test-connection` para verificar que el cliente y la base
de datos responden.

---

## 📁 Estructura

```
supabase/
  schema.sql     Esquema completo PostgreSQL (ejecutar 1º)
  seed.sql       Datos iniciales (ejecutar 2º)
src/
  lib/supabase.ts        Cliente central de Supabase
  services/              Capa de datos (Supabase) — tipada con types/
  types/                 Tipos TypeScript
  pages/ components/      Módulos del ERP (mismas pantallas del original)
  context/ hooks/         Tema y estado de UI
  resources/img/          Logo oficial (PeruMarketERPLogo.png)
```

---

## ⚠️ Notas honestas

- Los servicios fueron migrados al esquema de Supabase pero **no se
  probaron contra la base en ejecución** (no tengo acceso a tu proyecto).
  Si alguna pantalla muestra un error de columna/relación, casi siempre es
  un ajuste menor de nombre de campo en el `src/services/*` correspondiente.
- `accesosService.createUsuario` crea la fila en `usuario`/`persona` pero
  **no** crea la cuenta de Supabase Auth (requiere Admin API / Edge
  Function). Marcado con `// TODO` en el código.
- `consultarReniec` y `changePassword` requieren una Edge Function de
  Supabase (marcado con `// TODO`).
- Imágenes de productos: el seed conserva rutas del backend viejo
  (`/api/uploads/...`); súbelas a Supabase Storage y actualiza la columna
  `producto.imagen` cuando quieras imágenes reales.

Detalles de migración y patrón service→Supabase en [`MIGRATION.md`](./MIGRATION.md).
