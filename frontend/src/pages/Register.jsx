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
        <>
            <div className="auth-container">
                <h2>Register</h2>
                {error && <p className="error">{error}</p>}
                <form onSubmit={handleSubmit}>
                    <input name="name"      placeholder="Name"      value={form.name}   onChange={handleChange} required/>
                    <input name="email"     placeholder="Email"     type="email"        value={form.email}      onChange={handleChange} required/>
                    <input name="password"  placeholder="Password"  type="password"     value={form.password}   onChange={handleChange} required/>
                    <button style={{backgroundColor: '#0ea875ff'}} type="submit">Sign Up</button>
                    <p style={{alignSelf: 'center'}}><a href="/login">login?</a></p>
                </form>
            </div>
            <div className="auth-container">
                <h2>Wanna whats IdeaForge? Who is behind it?</h2>
                <p style={{fontSize: 'larger', textAlign: 'center'}}>Read about it <a href="/about">here</a></p>
            </div>
        </>
    );
}