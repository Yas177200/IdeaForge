import { Routes, Route, Navigate} from 'react-router-dom'
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import NewProject from './pages/NewProject';
import ProjectPage from './pages/ProjectPage';
import AuthNavbar from './Components/AuthNavbar';
import Profile from './pages/Profile';
import About from './pages/About';
import NotFound404 from './pages/Notfound404';

function App() {
  const token = localStorage.getItem('token');

  return (
    <>
      {token && <AuthNavbar /> }
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login"    element={<Login />} />
        <Route path="/about"    element={<About />} />
        {token ? (
          <>
            <Route path="/"               element={<Dashboard />} />
            <Route path="/projects/new"   element={<NewProject />} />
            <Route path="/projects/:id"   element={<ProjectPage />} />
            <Route path="/profile"        element={<Profile />} />
            <Route path='*'               element={<NotFound404 />} />
          </>
        ) : (
          <Route path="*" element={<Navigate to="/login" replace />} />
        )}
      </Routes>
    </>
  );
}

export default App
