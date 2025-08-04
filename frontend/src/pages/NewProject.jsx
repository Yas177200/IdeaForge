import { useState } from "react"
import { useNavigate } from 'react-router-dom'
import api from "../Api"
import '../css/newproject.css'

export default function NewProject() {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        name: '',
        shortSummary: '',
        fullDescription: '',
        tags: ''
    });
    const [error, setError] = useState('');

    const handleChange = e => 
        setForm(f => ({...f, [e.target.name]: e.target.value}))

    const handleSubmit = async e => {
        e.preventDefault();
        try{
            const tagsArray = form.tags
                .split(',')
                .map(t => t.trim())
                .filter(t => t);
            
            const payload = {
                name: form.name,
                shortSummary: form.shortSummary,
                fullDescription: form.fullDescription,
                tags: tagsArray
            };

            await api.post('/projects', payload, {
                headers: {Authorization: `Bearer ${localStorage.getItem('token')}`}
            });

            navigate('/');
        }catch (err){
            setError(err.response?.data?.message || 'Login failed');
        }
    };

  return (
    <div className="project-form">
      <h2>Create New Project</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit}>
        <label>
          Name
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          Short Summary
          <input
            name="shortSummary"
            value={form.shortSummary}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          Full Description
          <textarea
            name="fullDescription"
            value={form.fullDescription}
            onChange={handleChange}
          />
        </label>
        <label>
          Tags (comma-separated)
          <input
            name="tags"
            value={form.tags}
            onChange={handleChange}
            placeholder="e.g. Hackathon, Startup"
          />
        </label>
        <button type="submit">Create Project</button>
      </form>
    </div>
  );
}