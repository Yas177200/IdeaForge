import { Routes, Route, Navigate} from 'react-router-dom'
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import JoinProject from './pages/JoinProject';
import NewProject from './pages/NewProject';
import ProjectPage from './pages/ProjectPage';
import Profile from './pages/Profile';
import About from './pages/About';

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
          <Route path="/profile" element={<Profile />} />
          <Route path="/about" element={<About />} />

        </>
      ) : (
        <Route path="*" element={<Navigate to="/login" replace />} />
      )}
    </Routes>
  );
}

export default App
