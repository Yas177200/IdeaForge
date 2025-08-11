import { useState } from 'react';
import PropTypes from 'prop-types';
import api from '../api';

const TYPE_OPTIONS = ['FEATURE', 'BUG', 'IDEA', 'SKETCH'];

export default function NewCardForm({ projectId, onCreated }) {
  const [form, setForm] = useState({
    type: 'IDEA',
    title: '',
    description: '',
    imageUrl: '',
    completed: false
  });
  const [error, setError] = useState('');

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    try {
      await api.post(
        `/projects/${projectId}/cards`,
        form,
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setForm({ type: 'IDEA', title: '', description: '', imageUrl: '', completed: false });
      onCreated?.();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create card');
    }
  };

  return (
    <form className="card-form" onSubmit={handleSubmit}>
      <h3>New Card</h3>
      {error && <p className="error">{error}</p>}

      <label>
        Type
        <select name="type" value={form.type} onChange={handleChange}>
          {TYPE_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </label>

      <label>
        Title
        <input name="title" value={form.title} onChange={handleChange} required />
      </label>

      <label>
        Description
        <textarea name="description" value={form.description} onChange={handleChange} />
      </label>

      <label>
        Image URL (optional)
        <input name="imageUrl" value={form.imageUrl} onChange={handleChange} />
      </label>

      <label className="checkbox">
        <input
          type="checkbox"
          name="completed"
          checked={form.completed}
          onChange={handleChange}
        />
        Mark as completed
      </label>

      <button type="submit">Add Card</button>
    </form>
  );
}

NewCardForm.propTypes = {
  projectId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  onCreated: PropTypes.func
};
