import { supabase } from '../lib/supabase';
import type { Employee, Departament, Persona } from '../types/Employee';

// ── Utilidad de error ────────────────────────────────────────────────────────

function getErrorMessage(e: unknown): string {
  if (e instanceof Error) return e.message;
  if (
    typeof e === 'object' &&
    e !== null &&
    'message' in e &&
    typeof (e as Record<string, unknown>)['message'] === 'string'
  ) {
    return (e as Record<string, unknown>)['message'] as string;
  }
  return 'Error desconocido.';
}

// ── Tipos de fila DB (snake_case) ────────────────────────────────────────────

interface PersonaRow {
  id: number;
  tipo_documento: string | null;
  numero_documento: string | null;
  nombres: string | null;
  apellido_paterno: string | null;
  apellido_materno: string | null;
  correo: string | null;
  telefono: string | null;
  fecha_nacimiento: string | null;
  direccion: string | null;
}

interface DepartamentoRow {
  id: number;
  nombre: string;
  descripcion: string | null;
}

interface EmpleadoRow {
  id: number;
  id_persona: number;
  departamento_id: number | null;
  puesto: string | null;
  sueldo: number | null;
  fecha_contratacion: string | null;
  foto: string | null;
  cv: string | null;
  estado: string | null;
  persona: PersonaRow;
  departamento: DepartamentoRow | null;
}

// ── Mapeadores ───────────────────────────────────────────────────────────────

function mapPersonaRow(row: PersonaRow): Persona {
  return {
    id: row.id,
    tipoDocumento: row.tipo_documento ?? '',
    numeroDocumento: row.numero_documento ?? '',
    nombres: row.nombres ?? '',
    apellidoPaterno: row.apellido_paterno ?? '',
    apellidoMaterno: row.apellido_materno ?? '',
    correo: row.correo ?? '',
    telefono: row.telefono ?? '',
    fechaNacimiento: row.fecha_nacimiento ?? undefined,
    direccion: row.direccion ?? '',
  };
}

function mapDepartamentoRow(row: DepartamentoRow): Departament {
  return {
    id: row.id,
    nombre: row.nombre,
    descripcion: row.descripcion ?? '',
  };
}

function mapEmpleadoRow(row: EmpleadoRow): Employee {
  return {
    empleadoId: row.id,
    persona: mapPersonaRow(row.persona),
    departamento: row.departamento ? mapDepartamentoRow(row.departamento) : null,
    puesto: row.puesto ?? '',
    sueldo: row.sueldo ?? 0,
    fechaContratacion: row.fecha_contratacion ?? '',
    estado: row.estado ?? 'ACTIVO',
    foto: row.foto ?? '',
    cv: row.cv ?? '',
  };
}

// ── EmployeeService ──────────────────────────────────────────────────────────

export const EmployeeService = {
  getAllEmployees: async (): Promise<Employee[]> => {
    try {
      const { data, error } = await supabase
        .from('empleado')
        .select(`
          id,
          id_persona,
          departamento_id,
          puesto,
          sueldo,
          fecha_contratacion,
          foto,
          cv,
          estado,
          persona:persona(*),
          departamento:departamento(*)
        `);

      if (error) throw new Error(error.message);

      return ((data ?? []) as unknown as EmpleadoRow[]).map(mapEmpleadoRow);
    } catch (e) {
      console.error('❌ Error fetching employees:', e);
      throw new Error(getErrorMessage(e));
    }
  },

  saveEmployee: async (emp: Employee): Promise<Employee> => {
    try {
      const personaPayload = {
        tipo_documento: emp.persona.tipoDocumento,
        numero_documento: emp.persona.numeroDocumento,
        nombres: emp.persona.nombres,
        apellido_paterno: emp.persona.apellidoPaterno,
        apellido_materno: emp.persona.apellidoMaterno,
        correo: emp.persona.correo,
        telefono: emp.persona.telefono,
        fecha_nacimiento: emp.persona.fechaNacimiento ?? null,
        direccion: emp.persona.direccion,
      };

      const departamento_id = emp.departamento?.id ?? null;

      if (emp.empleadoId) {
        // ── Actualización ────────────────────────────────────────────────────
        // 1. Obtener id_persona del empleado existente
        const { data: empRow, error: fetchErr } = await supabase
          .from('empleado')
          .select('id_persona')
          .eq('id', emp.empleadoId)
          .single();

        if (fetchErr) throw new Error(fetchErr.message);

        // 2. Actualizar persona
        const { error: personaErr } = await supabase
          .from('persona')
          .update(personaPayload)
          .eq('id', (empRow as { id_persona: number }).id_persona);

        if (personaErr) throw new Error(personaErr.message);

        // 3. Actualizar empleado
        const { error: empErr } = await supabase
          .from('empleado')
          .update({
            departamento_id,
            puesto: emp.puesto,
            sueldo: emp.sueldo,
            fecha_contratacion: emp.fechaContratacion || null,
            foto: emp.foto || null,
            cv: emp.cv || null,
            estado: emp.estado,
          })
          .eq('id', emp.empleadoId);

        if (empErr) throw new Error(empErr.message);
      } else {
        // ── Creación ─────────────────────────────────────────────────────────
        // 1. Insertar persona
        const { data: newPersona, error: personaErr } = await supabase
          .from('persona')
          .insert(personaPayload)
          .select('id')
          .single();

        if (personaErr) throw new Error(personaErr.message);

        const id_persona = (newPersona as { id: number }).id;

        // 2. Insertar empleado
        const { error: empErr } = await supabase
          .from('empleado')
          .insert({
            id_persona,
            departamento_id,
            puesto: emp.puesto,
            sueldo: emp.sueldo,
            fecha_contratacion: emp.fechaContratacion || null,
            foto: emp.foto || null,
            cv: emp.cv || null,
            estado: emp.estado,
          });

        if (empErr) throw new Error(empErr.message);
      }

      // Recargar el empleado completo para devolver la misma forma que getAllEmployees.
      // Para INSERT usamos la fila más reciente (id mayor); para UPDATE usamos el id conocido.
      let reloadQuery = supabase
        .from('empleado')
        .select(`
          id,
          id_persona,
          departamento_id,
          puesto,
          sueldo,
          fecha_contratacion,
          foto,
          cv,
          estado,
          persona:persona(*),
          departamento:departamento(*)
        `);

      if (emp.empleadoId) {
        reloadQuery = reloadQuery.eq('id', emp.empleadoId);
      } else {
        reloadQuery = reloadQuery.order('id', { ascending: false }).limit(1);
      }

      const { data: allRows, error: reloadErr } = await reloadQuery;

      if (reloadErr) throw new Error(reloadErr.message);

      const rows = (allRows ?? []) as unknown as EmpleadoRow[];
      if (rows.length === 0) throw new Error('No se pudo recuperar el empleado guardado.');

      return mapEmpleadoRow(rows[0]);
    } catch (e) {
      console.error('❌ Error saving employee:', e);
      throw new Error(`Error al guardar empleado: ${getErrorMessage(e)}`);
    }
  },

  deleteEmployee: async (empleadoId: number): Promise<void> => {
    try {
      const { error } = await supabase
        .from('empleado')
        .delete()
        .eq('id', empleadoId);

      if (error) throw new Error(error.message);
    } catch (e) {
      console.error('❌ Error deleting employee:', e);
      throw new Error(`Error al eliminar empleado: ${getErrorMessage(e)}`);
    }
  },

  /**
   * Descarga o abre el CV de un empleado.
   * El CV se almacena como URL o nombre de archivo; se abre en nueva pestaña.
   */
  downloadCV: async (empleadoId: number, cv: string): Promise<void> => {
    if (!cv) throw new Error('El empleado no tiene CV registrado.');

    const API_BASE = 'http://localhost:8080/api';
    let cvUrl = cv;
    if (!cv.startsWith('http') && !cv.startsWith('data:')) {
      cvUrl = cv.startsWith('/')
        ? `${API_BASE}${cv}`
        : `${API_BASE}/uploads/cvs/${cv}`;
    }

    window.open(cvUrl, '_blank');
    console.log(`ℹ️ Empleado ${empleadoId}: abriendo CV en ${cvUrl}`);
  },
};

// ── DepartmentService ────────────────────────────────────────────────────────

export const DepartmentService = {
  getAllDepartments: async (): Promise<Departament[]> => {
    try {
      const { data, error } = await supabase
        .from('departamento')
        .select('id, nombre, descripcion')
        .order('id', { ascending: true });

      if (error) throw new Error(error.message);

      return ((data ?? []) as DepartamentoRow[]).map(mapDepartamentoRow);
    } catch (e) {
      console.error('❌ Error fetching departments:', e);
      throw new Error(getErrorMessage(e));
    }
  },

  saveDepartment: async (dep: Departament): Promise<Departament> => {
    try {
      const payload = {
        nombre: dep.nombre,
        descripcion: dep.descripcion,
      };

      if (dep.id) {
        // Edición
        const { data, error } = await supabase
          .from('departamento')
          .update(payload)
          .eq('id', dep.id)
          .select('id, nombre, descripcion')
          .single();

        if (error) throw new Error(error.message);

        return mapDepartamentoRow(data as DepartamentoRow);
      } else {
        // Creación
        const { data, error } = await supabase
          .from('departamento')
          .insert(payload)
          .select('id, nombre, descripcion')
          .single();

        if (error) throw new Error(error.message);

        return mapDepartamentoRow(data as DepartamentoRow);
      }
    } catch (e) {
      console.error('❌ Error saving department:', e);
      throw new Error(`Error al guardar departamento: ${getErrorMessage(e)}`);
    }
  },
};
