import { NavLink, useNavigate } from 'react-router-dom';
import '../css/nav.css';

export default function AuthNavbar() {
    const navigate = useNavigate();
    const isAuthed = !!localStorage.getItem('token');
    const me = JSON.parse(localStorage.getItem('user') || 'null');

    if (!isAuthed) return null;

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login', {replace: true});
    };

    return (
        <header className='nav'>
            <nav className='nav-inner'>
                <div className='nav-left'>
                    <NavLink to='/' className='brand'>IdeaForge</NavLink>
                    <NavLink to="/"        className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>Projects</NavLink>
                    <NavLink to="/about"   className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>About</NavLink>
                </div>
                <div className='nav-right'>
                    <NavLink to='/profile' className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>{me?.name || 'Profile'}</NavLink>
                    <NavLink to='profile'>
                        <div className="nav-avatar" title={me?.name || 'User'}>
                            {me?.avatarUrl ? <img src={me.avatarUrl} alt="" onError={(e)=>{e.currentTarget.style.display='none';}}/> 
                            : (me?.name || 'U').slice(0,1).toUpperCase()}
                        </div>
                    </NavLink>
                    <button className='btn btn-outline' onClick={logout}>Logout</button>
                </div>
            </nav>
        </header>
    )
}