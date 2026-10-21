import { useEffect, useState } from 'react'; import { Link } from 'react-router-dom';
import { listarCriaturas } from '../api/pawneeApi'; import { Criatura, TIPOS } from '../tipos'; import { EstadoCarga } from '../components/EstadoCarga';
export function ListaCriaturas() {
    const [datos, setDatos] = useState<Criatura[]>([]), [tipo, setTipo] = useState(''), [recarga, setRecarga] = useState(0);
    const [cargando, setCargando] = useState(true), [error, setError] = useState<string | null>(null);
    useEffect(() => {
        let vigente = true; setCargando(true); setError(null);
        listarCriaturas(tipo).then(x => { if (vigente) setDatos(x); }).catch((e: unknown) => { if (vigente) setError(e instanceof Error ? e.message : 'Error de carga'); }).finally(() => { if (vigente) setCargando(false); });
        return () => { vigente = false; };
    }, [tipo, recarga]);
    return <section><h1>Criaturas</h1><p><Link to="/criaturas/nueva">Registrar criatura</Link></p>
        <label htmlFor="tipo-filtro">Tipo </label><select id="tipo-filtro" value={tipo} onChange={e => setTipo(e.target.value)}><option value="">Todos</option>{TIPOS.map(t => <option key={t}>{t}</option>)}</select>
        <button onClick={() => setRecarga(x => x + 1)}>Actualizar lista</button><EstadoCarga cargando={cargando} error={error} vacio={!datos.length} />
        {!cargando && !error && datos.length > 0 && <ul>{datos.map(c => <li key={c._id}><Link to={`/criaturas/${c._id}`}>{c.nombre}</Link> · {c.tipo} · peligro {c.nivelPeligro}</li>)}</ul>}
    </section>;
}
