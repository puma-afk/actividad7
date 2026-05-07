import { Link } from "react-router-dom";
import "./inicio.css";

function Home() {
  return (
    <div className="home-container">
      <div className="home-card">

        <div className="home-content">
          <h1 className="home-title">
            Sistemas Colaborativos para Empresas
          </h1>

          <p className="home-subtitle">
            Esta aplicación está diseñada para mejorar la colaboración dentro de
            organizaciones, facilitando la comunicación, la gestión de tareas y
            la productividad de los equipos en un solo lugar.
          </p>

          <p className="home-text">
            Los sistemas colaborativos permiten a las empresas trabajar de forma
            más eficiente, reduciendo tiempos de respuesta, organizando mejor la
            información y fortaleciendo el trabajo en equipo sin importar la
            ubicación de los colaboradores.
          </p>

          <Link to="/login" className="home-button">
            Acceder al sistema
          </Link>
        </div>

        {/* Imagen (desde /public) */}
        <div className="home-image">
          <img src="/colaboracion.jpg" alt="Sistema colaborativo" />
        </div>

      </div>
    </div>
  );
}

export default Home;