import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { ProveedorSocio } from './contexto/ContextoSocio';
import Encabezado from './componentes/Encabezado';
import Pie from './componentes/Pie';
import Ingreso from './componentes/Ingreso';
import './estilos/App.css';

function App() {
  return (
    <ProveedorSocio>
      <BrowserRouter>
        <div className="aplicacion">
          <Encabezado />
          <main className="aplicacion__contenido">
            <Routes>
              <Route path="/" element={<Ingreso />} />
            </Routes>
          </main>
          <Pie />
        </div>
      </BrowserRouter>
    </ProveedorSocio>
  );
}

export default App;
