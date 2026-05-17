import type { ProductoFormData, Option } from '../../types/inventario/product';
import { supabase } from '../../lib/supabase';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getErrorMessage(e: unknown): string {
  if (e instanceof Error) return e.message;
  if (typeof e === 'object' && e !== null && 'message' in e) {
    return String((e as Record<string, unknown>)['message']);
  }
  return 'Error desconocido';
}

/**
 * Sube un archivo al bucket "productos" de Supabase Storage y retorna la URL
 * pública. Si el bucket no existe o falla la subida, NO rompe el guardado:
 * registra un aviso y el producto se guarda sin imagen.
 */
async function uploadImage(file: File): Promise<string | undefined> {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 8);
  const extension = file.name.split('.').pop() ?? 'jpg';
  const filename = `producto_${timestamp}_${randomString}.${extension}`;

  const { error } = await supabase.storage
    .from('productos')
    .upload(filename, file, { upsert: false, contentType: file.type });

  if (error) {
    console.warn(
      `[productService] No se pudo subir la imagen (${error.message}). ` +
        'El producto se guardará SIN imagen. Solución: en Supabase → Storage ' +
        'crea un bucket PÚBLICO llamado "productos".'
    );
    return undefined;
  }

  const { data: urlData } = supabase.storage
    .from('productos')
    .getPublicUrl(filename);

  return urlData.publicUrl;
}

// ---------------------------------------------------------------------------
// Mappers helpers
// ---------------------------------------------------------------------------

/** Convierte ProductoFormData (camelCase) al row de la tabla `producto` (snake_case). */
function formDataToProductRow(productData: ProductoFormData, imagenUrl?: string) {
  return {
    nombre: productData.nombre,
    descripcion: productData.descripcion || null,
    sku: productData.sku || null,
    precio_venta: productData.precioVenta ?? 0,
    precio_compra: productData.precioCompra ?? 0,
    categoria_id: productData.categoriaId ?? null,
    unidad_medida: productData.unidadMedida.toUpperCase(),
    peso_kg: productData.pesoKg ?? 0,
    stock: productData.stockInicial ?? 0,
    stock_minimo: productData.stockMinimo ?? 0,
    stock_maximo: productData.stockMaximo ?? 1000,
    imagen: imagenUrl ?? productData.imagen ?? null,
    estado: 'ACTIVO',
    requiere_codigo_barras: Boolean(productData.codigoBarras),
  };
}

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

export const productService = {

  /** Obtener categorías, almacenes y proveedores para poblar selects. */
  fetchOptions: async (): Promise<{ categorias: Option[]; almacenes: Option[]; proveedores: Option[] }> => {
    const [catRes, almRes, provRes] = await Promise.all([
      supabase.from('categoria_producto').select('id, nombre').order('nombre'),
      supabase.from('almacen').select('id, nombre').eq('estado', 'ACTIVO').order('nombre'),
      supabase.from('proveedor').select('id, razon_social').eq('estado', 'ACTIVO').order('razon_social'),
    ]);

    if (catRes.error) console.error('[productService.fetchOptions] categorias:', catRes.error.message);
    if (almRes.error) console.error('[productService.fetchOptions] almacenes:', almRes.error.message);
    if (provRes.error) console.error('[productService.fetchOptions] proveedores:', provRes.error.message);

    const categorias: Option[] = (catRes.data ?? []).map((c) => ({ id: Number(c.id), nombre: c.nombre as string }));
    const almacenes: Option[] = (almRes.data ?? []).map((a) => ({ id: Number(a.id), nombre: a.nombre as string }));
    const proveedores: Option[] = (provRes.data ?? []).map((p) => ({
      id: Number(p.id),
      nombre: (p.razon_social as string) ?? 'Sin Nombre',
    }));

    return { categorias, almacenes, proveedores };
  },

  /** Actualiza un producto existente. Si se pasa un File, lo sube al Storage. */
  updateProduct: async (id: number, productData: ProductoFormData, file?: File): Promise<void> => {
    try {
      let imagenUrl: string | undefined;
      if (file) {
        imagenUrl = await uploadImage(file);
      }

      const row = formDataToProductRow(productData, imagenUrl);

      const { error } = await supabase
        .from('producto')
        .update(row)
        .eq('id', id);

      if (error) throw new Error(error.message);

      // Actualizar inventario si se proporcionó almacén con stock y ubicación
      if (productData.almacenId) {
        const invRow: Record<string, unknown> = {
          stock_minimo: productData.stockMinimo ?? 0,
          stock_maximo: productData.stockMaximo ?? 1000,
          ubicacion: productData.ubicacion || null,
        };

        const { data: existing } = await supabase
          .from('inventario')
          .select('id')
          .eq('id_producto', id)
          .eq('id_almacen', productData.almacenId)
          .maybeSingle();

        if (existing) {
          await supabase.from('inventario').update(invRow).eq('id', existing.id);
        }
      }

      // Actualizar/insertar código de barras si se proporcionó
      if (productData.codigoBarras) {
        const { data: existing } = await supabase
          .from('codigo_barras')
          .select('id')
          .eq('id_producto', id)
          .eq('es_principal', true)
          .maybeSingle();

        if (existing) {
          await supabase
            .from('codigo_barras')
            .update({ codigo: productData.codigoBarras })
            .eq('id', existing.id);
        } else {
          await supabase.from('codigo_barras').insert({
            codigo: productData.codigoBarras,
            id_producto: id,
            es_principal: true,
            tipo_codigo: 'EAN13',
          });
        }
      }
    } catch (error: unknown) {
      console.error('[productService.updateProduct]', error);
      throw {
        status: 500,
        body: { message: getErrorMessage(error) },
      };
    }
  },

  /** Crea un nuevo producto. Si se pasa un File, lo sube al Storage. */
  createProduct: async (productData: ProductoFormData, file?: File): Promise<void> => {
    try {
      let imagenUrl: string | undefined;
      if (file) {
        imagenUrl = await uploadImage(file);
      }

      const row = formDataToProductRow(productData, imagenUrl);

      const { data: newProduct, error: prodError } = await supabase
        .from('producto')
        .insert(row)
        .select('id')
        .single();

      if (prodError || !newProduct) throw new Error(prodError?.message ?? 'Error al insertar producto');

      const productId = Number(newProduct.id);

      // Crear registro en inventario si se indicó almacén
      if (productData.almacenId) {
        await supabase.from('inventario').insert({
          id_producto: productId,
          id_almacen: productData.almacenId,
          stock_actual: productData.stockInicial ?? 0,
          stock_minimo: productData.stockMinimo ?? 0,
          stock_maximo: productData.stockMaximo ?? 1000,
          ubicacion: productData.ubicacion || null,
        });
      }

      // Crear código de barras si se proporcionó
      if (productData.codigoBarras) {
        await supabase.from('codigo_barras').insert({
          codigo: productData.codigoBarras,
          id_producto: productId,
          id_proveedor: productData.proveedorId ?? null,
          es_principal: true,
          tipo_codigo: 'EAN13',
        });
      }

      // Asociar proveedor si se indicó
      if (productData.proveedorId) {
        await supabase.from('proveedor_producto').insert({
          id_proveedor: productData.proveedorId,
          id_producto: productId,
          precio_compra: productData.precioCompra ?? 0,
          es_principal: true,
        });
      }
    } catch (error: unknown) {
      console.error('[productService.createProduct]', error);
      throw {
        status: 500,
        body: { message: getErrorMessage(error) },
      };
    }
  },
};
