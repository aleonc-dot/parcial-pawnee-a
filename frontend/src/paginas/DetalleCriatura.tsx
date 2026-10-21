import { useEffect, useState } from 'react'; import { Link, useNavigate, useParams } from 'react-router-dom';
import { obtenerCriatura, relacionados, borrarCriatura } from '../api/pawneeApi'; import { Criatura, Avistamiento } from '../tipos';
export function DetalleCriatura() {
    const { id } = useParams(); const navigate = useNavigate(); const [datos, setDatos] = useState<{ criatura: Criatura; avistamientos: Avistamiento[] } | null>(null);
    const [cargando, setCargando] = useState(true), [borrando, setBorrando] = useState(false), [error, setError] = useState<string | null>(null);
    useEffect(() => { let vigente = true; setCargando(true); setError(null); if (id) Promise.all([obtenerCriatura(id), relacionados(id)]).then(([criatura, avistamientos]) => { if (vigente) setDatos({ criatura, avistamientos }); }).catch((e: unknown) => { if (vigente) setError(e instanceof Error ? e.message : 'Fallo'); }).finally(() => { if (vigente) setCargando(false); }); return () => { vigente = false; }; }, [id]);
    async function eliminar() { if (!id || !confirm('¿Eliminar criatura? Si tiene avistamientos se impedirá.')) return; setBorrando(true); try { await borrarCriatura(id); navigate('/'); } catch (e) { setError(e instanceof Error ? e.message : 'Fallo'); } finally { setBorrando(false); } }
    if (cargando) return <p>Cargando...</p>;
    return <section>{error && <p role="alert">{error}</p>}{datos && <><h1>{datos.criatura.nombre}</h1><dl>
        <dt>ID</dt><dd>{datos.criatura._id}</dd><dt>Tipo</dt><dd>{datos.criatura.tipo}</dd><dt>Peligro</dt><dd>{datos.criatura.nivelPeligro}</dd><dt>Estado</dt><dd>{datos.criatura.estado}</dd><dt>Habilidades</dt><dd>{datos.criatura.habilidades.join(', ')}</dd>
    </dl><Link to={`/criaturas/${id}/editar`}>Editar criatura</Link>{' '}<button disabled={borrando} onClick={eliminar}>Eliminar</button>
        <h2>Avistamientos</h2><Link to={`/avistamientos/nuevo?criaturaId=${id}`}>Registrar avistamiento</Link>
        {datos.avistamientos.length ? <ul>{datos.avistamientos.map(a => <li key={a._id}><Link to={`/avistamientos/${a._id}`}>{a.testigo}</Link> · {a.ubicacion}</li>)}</ul> : <p>Sin avistamientos asociados.</p>}</>}</section>;
}
