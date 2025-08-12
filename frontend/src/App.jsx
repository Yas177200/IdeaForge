import { Routes, Route, Navigate} from 'react-router-dom'
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import JoinProject from './pages/JoinProject';
import NewProject from './pages/NewProject';
import ProjectPage from './pages/ProjectPage';

function App() {
  const token = localStorage.getItem('token');

  return (
    <Routes>
      <Route path="/register" element={<Register />} />
      <Route path="/login"    element={<Login />} />
      {token ? (
        <>
          <Route path="/"            element={<Dashboard />} />
          <Route path="/projects/new"  element={<NewProject />} />
          <Route path="/projects/join" element={<JoinProject />} />
          <Route path="/projects/:id" element={<ProjectPage />} />

        </>
      ) : (
        <Route path="*" element={<Navigate to="/login" replace />} />
      )}
    </Routes>
  );
}

export default App
