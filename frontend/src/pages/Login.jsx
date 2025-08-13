import { useState } from "react"
import { useNavigate } from 'react-router-dom'
import '../css/login.css'
import api from "../api"

export default function Login() {
    const [form, setForm] = useState({email: '', password: ''})
    const [error, setError] = useState('')
    const navigate = useNavigate()

    const handleChange = e => 
        setForm(f => ({...f, [e.target.name]: e.target.value}))

    const handleSubmit = async e => {
        e.preventDefault()
        try{
            const {data} = await api.post('/auth/login', form);

            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user)); // <- add this
            window.location = '/';
            // navigate('/')   //strange not working????????
        }catch (err){
            setError(err.response?.data?.message || 'Login failed');
        }
    };

    return (
        <div className="auth-container">
            <h2>Login</h2>
            {error && <p className="error" >{error}</p>}
            <form onSubmit={handleSubmit}>
                <input name="email"     placeholder="Email"     type="email"        value={form.email}      onChange={handleChange} required/>
                <input name="password"  placeholder="Password"  type="password"     value={form.password}   onChange={handleChange} required/>
                <button type="submit">Login</button>
            </form>
        </div>
    );
}