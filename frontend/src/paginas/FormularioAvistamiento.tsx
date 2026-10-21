import { FormEvent, useEffect, useState } from 'react'; import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { listarCriaturas, obtenerAvistamiento, guardarAvistamiento } from '../api/pawneeApi'; import { AvistamientoInput, Criatura, idCriatura } from '../tipos';
export function FormularioAvistamiento() {
    const { id } = useParams(); const [query] = useSearchParams(); const preseleccion = query.get('criaturaId') ?? ''; const navigate = useNavigate();
    const [form, setForm] = useState<AvistamientoInput>({ criatura: '', testigo: '', ubicacion: '', descripcion: '', fecha: '' }), [criaturas, setCriaturas] = useState<Criatura[]>([]);
    const [cargando, setCargando] = useState(true), [guardando, setGuardando] = useState(false), [error, setError] = useState<string | null>(null), [fallida, setFallida] = useState(false);
    useEffect(() => {
        let vigente = true; setCargando(true); setError(null); setFallida(false);
        Promise.all([listarCriaturas(), id ? obtenerAvistamiento(id) : Promise.resolve(null)]).then(([lista, a]) => {
            if (!vigente) return; setCriaturas(lista);
            setForm(a ? { criatura: idCriatura(a.criatura), testigo: a.testigo, ubicacion: a.ubicacion, descripcion: a.descripcion ?? '', fecha: a.fecha.slice(0, 10) } : { criatura: lista.some(c => c._id === preseleccion) ? preseleccion : (lista[0]?._id ?? ''), testigo: '', ubicacion: '', descripcion: '', fecha: '' });
        }).catch((e: unknown) => { if (vigente) { setError(e instanceof Error ? e.message : 'No se pudo cargar'); setFallida(true); } }).finally(() => { if (vigente) setCargando(false); });
        return () => { vigente = false; };
    }, [id, preseleccion]);
    async function enviar(e: FormEvent<HTMLFormElement>) {
        e.preventDefault(); setError(null); setGuardando(true);
        // Cuerpo de datos que se entrega al servicio HTTP.
        const datos: Record<string, unknown> = { testigo: form.testigo.trim(), ubicacion: form.ubicacion.trim(), descripcion: form.descripcion, fecha: form.fecha };
        datos.criatura = form.criatura;
        try { const a = await guardarAvistamiento(id, datos); navigate(`/avistamientos/${a._id}`); } catch (e) { setError(e instanceof Error ? e.message : 'No se pudo guardar'); } finally { setGuardando(false); }
    }
    if (cargando) return <p>Cargando formulario...</p>;
    return <section><h1>{id ? 'Editar' : 'Registrar'} avistamiento</h1>{error && <p role="alert">{error}</p>}
        {!fallida && !criaturas.length && <p>Primero registra una criatura.</p>}
        {!fallida && criaturas.length > 0 && <form onSubmit={enviar}><fieldset disabled={guardando}>
            <p><label>Criatura <select required value={form.criatura} onChange={e => setForm({ ...form, criatura: e.target.value })}><option value="">Elegir</option>{criaturas.map(c => <option key={c._id} value={c._id}>{c.nombre}</option>)}</select></label></p>
            <p><label>Testigo <input required value={form.testigo} onChange={e => setForm({ ...form, testigo: e.target.value })} /></label></p>
            <p><label>Ubicación <input required value={form.ubicacion} onChange={e => setForm({ ...form, ubicacion: e.target.value })} /></label></p>
            <p><label>Fecha <input required type="date" value={form.fecha} onChange={e => setForm({ ...form, fecha: e.target.value })} /></label></p>
            <p><label>Descripción <textarea value={form.descripcion} onChange={e => setForm({ ...form, descripcion: e.target.value })} /></label></p>
            <button type="submit">{guardando ? 'Guardando...' : 'Guardar'}</button>
        </fieldset></form>}
    </section>;
}
