import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./paginas/inicio";
import Login from "./paginas/login";
import Dashboard from "./paginas/dashboard";

import ProtectedRoute from "./routes/rutasprotegidas";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;