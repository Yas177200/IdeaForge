import { useState } from "react"
import { useNavigate } from 'react-router-dom'
import '../css/register.css'
import api from "../api"

export default function Register() {
    const [form, setForm] = useState({email: '', password: '', name: ''})
    const [error, setError] = useState('')
    const navigate = useNavigate()

    const handleChange = e => 
        setForm(f => ({...f, [e.target.name]: e.target.value}))

    const handleSubmit = async e => {
        e.preventDefault()
        try{
            await api.post('/auth/register', form);

            navigate('/');
        }catch (err){
            setError(err.response?.data?.message || 'Registration failed');
        }
    };

    return (
        <div className="auth-container">
            <h2>Register</h2>
            {error && <p className="error">{error}</p>}
            <form onSubmit={handleSubmit}>
                <input name="name"      placeholder="Name"      value={form.name}   onChange={handleChange} required/>
                <input name="email"     placeholder="Email"     type="email"        value={form.email}      onChange={handleChange} required/>
                <input name="password"  placeholder="Password"  type="password"     value={form.password}   onChange={handleChange} required/>
                <button type="submit">Sign Up</button>
            </form>
        </div>
    );
}