import { useEffect, useState } from 'react'; import { Link, useNavigate, useParams } from 'react-router-dom';
import { obtenerAvistamiento, borrarAvistamiento } from '../api/pawneeApi'; import { Avistamiento, nombreCriatura, idCriatura } from '../tipos';
export function DetalleAvistamiento() {
    const { id } = useParams(); const navigate = useNavigate(); const [datos, setDatos] = useState<Avistamiento | null>(null);
    const [cargando, setCargando] = useState(true), [borrando, setBorrando] = useState(false), [error, setError] = useState<string | null>(null);
    useEffect(() => { let vigente = true; setCargando(true); setError(null); if (id) obtenerAvistamiento(id).then(a => { if (vigente) setDatos(a); }).catch((e: unknown) => { if (vigente) setError(e instanceof Error ? e.message : 'Fallo'); }).finally(() => { if (vigente) setCargando(false); }); return () => { vigente = false; }; }, [id]);
    async function eliminar() { if (!id || !confirm('¿Eliminar avistamiento?')) return; setBorrando(true); try { await borrarAvistamiento(id); navigate('/avistamientos'); } catch (e) { setError(e instanceof Error ? e.message : 'Fallo'); } finally { setBorrando(false); } }
    if (cargando) return <p>Cargando...</p>;
    return <section>{error && <p role="alert">{error}</p>}{datos && <><h1>Avistamiento: {datos.testigo}</h1><dl>
        <dt>ID</dt><dd>{datos._id}</dd><dt>Criatura</dt><dd>{nombreCriatura(datos.criatura)}</dd><dt>Ubicación</dt><dd>{datos.ubicacion}</dd><dt>Fecha</dt><dd>{datos.fecha.slice(0, 10)}</dd><dt>Descripción</dt><dd>{datos.descripcion || 'Sin descripción'}</dd>
    </dl>{idCriatura(datos.criatura) && <p><Link to={`/criaturas/${idCriatura(datos.criatura)}`}>Abrir ficha de criatura</Link></p>}
        <Link to={`/avistamientos/${id}/editar`}>Editar avistamiento</Link>{' '}<button disabled={borrando} onClick={eliminar}>Eliminar</button></>}</section>;
}
