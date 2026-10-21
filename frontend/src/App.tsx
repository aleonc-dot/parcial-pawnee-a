import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { ListaCriaturas } from './paginas/ListaCriaturas'; import { ListaAvistamientos } from './paginas/ListaAvistamientos';
import { DetalleCriatura } from './paginas/DetalleCriatura'; import { DetalleAvistamiento } from './paginas/DetalleAvistamiento';
import { FormularioCriatura } from './paginas/FormularioCriatura'; import { FormularioAvistamiento } from './paginas/FormularioAvistamiento';
export default function App() {
    return <BrowserRouter><header><p>Departamento de Parques y Fenómenos Inexplicables de Pawnee</p><nav><Link to="/">Criaturas</Link>{' · '}<Link to="/avistamientos">Avistamientos</Link></nav><hr /></header><main><Routes>
        <Route path="/" element={<ListaCriaturas />} /><Route path="/criaturas/nueva" element={<FormularioCriatura />} />
        <Route path="/criaturas/:id" element={<DetalleCriatura />} /><Route path="/criaturas/:id/editar" element={<FormularioCriatura />} />
        <Route path="/avistamientos" element={<ListaAvistamientos />} /><Route path="/avistamientos/nuevo" element={<FormularioAvistamiento />} />
        <Route path="/avistamientos/:id" element={<DetalleAvistamiento />} /><Route path="/avistamientos/:id/editar" element={<FormularioAvistamiento />} />
        <Route path="*" element={<p>Página no encontrada. <Link to="/">Volver</Link></p>} />
    </Routes></main></BrowserRouter>;
}
