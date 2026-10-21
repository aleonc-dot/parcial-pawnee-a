import { Avistamiento } from '../modelos/Avistamiento.model';
import { Criatura } from '../modelos/Criatura.model';
import { ApiError } from '../apiError';
import { cuerpo, idValido } from '../validacion';
const campos = ['criatura','testigo','ubicacion','descripcion','fecha'];
async function comprobarCriatura(id: string) {
  if (!await Criatura.exists({ _id: idValido(id) })) throw new ApiError(404, 'Criatura referenciada no encontrada');
}
export async function listar(criaturaId?: string) {
  if (criaturaId) await comprobarCriatura(criaturaId);
  return Avistamiento.find(criaturaId ? { criatura: criaturaId } : {})
    .populate('criatura')
    .sort({ fecha: -1, _id: -1 }).lean();
}
export async function obtener(id: string) {
  const doc = await Avistamiento.findById(idValido(id)).populate('criatura');
  if (!doc) throw new ApiError(404, 'Avistamiento no encontrado');
  return doc;
}
export async function crear(body: unknown) {
  const datos = cuerpo(body, campos, ['criatura','testigo','ubicacion','fecha']);
  await comprobarCriatura(datos.criatura as string);
  return Avistamiento.create(datos);
}
export async function actualizar(id: string, body: unknown) {
  const cambios = cuerpo(body, campos); await obtener(id);
  if ('criatura' in cambios) await comprobarCriatura(cambios.criatura as string);
  return Avistamiento.findByIdAndUpdate(idValido(id), { $set: cambios }, { new: true, runValidators: true });
}
export async function eliminar(id: string) {
  if (!await Avistamiento.findByIdAndDelete(idValido(id))) throw new ApiError(404, 'Avistamiento no encontrado');
}
