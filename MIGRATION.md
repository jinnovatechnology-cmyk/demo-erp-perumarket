# Guía de migración a Supabase

Este proyecto es un **scaffold listo para Supabase**. La estructura, las
pantallas, la autenticación y el cliente de Supabase ya están listos.
Falta conectar **cada servicio (tabla) uno por uno**.

---

## 1. Esquema de autenticación (roles y módulos)

Mientras no creas estas tablas, la app funciona en **modo scaffold**:
todo usuario autenticado accede a todos los módulos.

Para tener roles reales, crea en Supabase (SQL Editor):

```sql
-- Perfil del usuario, enlazado a Supabase Auth
create table public.usuarios (
  id          bigint generated always as identity primary key,
  auth_id     uuid references auth.users (id) on delete cascade,
  username    text,
  nombres     text,
  apellidos   text,
  rol         text default 'usuario',
  email       text,
  almacen_id  bigint default 1,
  created_at  timestamptz default now()
);

-- Módulos del ERP
create table public.modulos (
  id          bigint generated always as identity primary key,
  nombre      text not null,   -- 'Dashboard', 'Inventario', 'Ventas', ...
  descripcion text,
  ruta        text
);

-- Datos mínimos de módulos
insert into public.modulos (nombre, ruta) values
  ('Dashboard','/dashboard'), ('Accesos','/accesos'),
  ('Proveedores','/proveedores'), ('Clientes','/clientes'),
  ('Empleados','/empleados'), ('Ventas','/ventas'),
  ('Pedidos','/pedidos'), ('Reportes','/reportes'),
  ('Inventario','/inventario'), ('Envíos','/envios'),
  ('Compras','/compras');

-- RLS recomendado
alter table public.usuarios enable row level security;
create policy "usuario lee su perfil" on public.usuarios
  for select using (auth.uid() = auth_id);
alter table public.modulos enable row level security;
create policy "modulos visibles autenticados" on public.modulos
  for select using (auth.role() = 'authenticated');
```

`authService.login()` ya intenta leer `usuarios` (por `auth_id`) y `modulos`
automáticamente: en cuanto existan, deja de usar el modo comodín.

### Crear el primer usuario

1. *Supabase → Authentication → Users → Add user* (email + contraseña).
2. Inserta su perfil:

   ```sql
   insert into public.usuarios (auth_id, username, nombres, apellidos, rol, email)
   values ('UUID-DEL-USUARIO', 'admin', 'Admin', 'Peru Market', 'admin', 'admin@perumarket.com');
   ```

---

## 2. Migrar el esquema de datos

El esquema original está en la raíz del repo:
`perumarket_erp - origin.sql` (MySQL). Hay que portar las tablas a
PostgreSQL/Supabase. Pasos sugeridos:

- Convertir tipos: `INT AUTO_INCREMENT` → `bigint generated always as identity`,
  `DATETIME` → `timestamptz`, `TINYINT(1)` → `boolean`.
- Crear las tablas en el SQL Editor de Supabase.
- Activar **Row Level Security** y políticas por tabla.

---

## 3. Migrar un servicio (patrón)

Cada archivo en `src/services/` usa hoy el patrón axios (`api`).
Reescríbelo a Supabase usando `db()` / `supabase`.

**Antes (axios → backend Java):**

```ts
import { api } from "../api";

export const clienteService = {
  async listar() {
    const res = await api.get("/clientes");
    return res.data;
  },
  async crear(cliente: Cliente) {
    const res = await api.post("/clientes", cliente);
    return res.data;
  },
};
```

**Después (Supabase):**

```ts
import { db } from "../api";

export const clienteService = {
  async listar() {
    const { data, error } = await db("clientes").select("*");
    if (error) throw error;
    return data;
  },
  async crear(cliente: Cliente) {
    const { data, error } = await db("clientes").insert(cliente).select().single();
    if (error) throw error;
    return data;
  },
};
```

Operaciones equivalentes:

| REST (axios)                | Supabase                                            |
|-----------------------------|-----------------------------------------------------|
| `GET /tabla`                | `db("tabla").select("*")`                            |
| `GET /tabla/:id`            | `db("tabla").select("*").eq("id", id).single()`      |
| `POST /tabla`               | `db("tabla").insert(obj).select().single()`          |
| `PUT /tabla/:id`            | `db("tabla").update(obj).eq("id", id)`               |
| `DELETE /tabla/:id`         | `db("tabla").delete().eq("id", id)`                  |

---

## 4. Orden recomendado de migración

1. `clientes/clienteService.ts`
2. `Proveedores/proveedorService.ts`
3. `employeeService.ts`
4. `inventario/*` (productos, almacenes, stock, movimientos)
5. `ventas/ventaService.ts`
6. `dashboardService.ts` (vistas / agregaciones SQL)
7. `accesosService.ts`, `configuracionService.ts`, `reportesService.ts`,
   `envios/envioService.ts`

Cuando ningún servicio use ya `api` (axios), elimina el bloque legacy de
`src/services/api.ts` y la dependencia `axios` del `package.json`.

---

## 5. Archivos para imágenes / uploads

El backend Java usaba `multer` para subir archivos. En Supabase usa
**Storage**:

```ts
await supabase.storage.from("productos").upload(`img/${file.name}`, file);
const { data } = supabase.storage.from("productos").getPublicUrl(`img/${file.name}`);
```
