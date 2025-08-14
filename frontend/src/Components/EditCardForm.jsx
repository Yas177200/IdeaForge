import { useState } from "react";
import PropTypes, { func } from "prop-types";
import api from "../api";

const TYPE_OPTIONS = ['FEATURE', 'BUG', 'IDEA', 'SKETCH'];

export default function EditCardForm({card, onSaved, onCancel}) {
  const [form, setForm] = useState({
    type: card.type,
    title: card.title,
    description: card.description || '',
    imageUrl: card.imageUrl || '',
    completed: !!card.completed
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setErr('');
    if (!form.title.trim()) return setErr('Title is required.');
    if (!TYPE_OPTIONS.includes(form.type)) return setErr('Invalid type.');
    
    try {
        setSaving(true);
        const { data } = await api.patch(`/cards/${card.id}`, {
            type: form.type,
            title: form.title,
            description: form.description,
            imageUrl: form.imageUrl,
            completed: form.completed
        });
        onSaved?.(data.card);
    } catch (e) {
      setErr(e.response?.data?.message || 'Failed to save changes');
    } finally {
        setSaving(false);
    }
  };

  return (
    <form className="card-edit-form" onSubmit={handleSubmit}>
      {err && <p className="error">{err}</p>}

      <label>
        Type
        <select name="type" value={form.type} onChange={handleChange} disabled={saving}>
          {TYPE_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </label>

      <label>
        Title
        <input name="title" value={form.title} onChange={handleChange} disabled={saving} required />
      </label>

      <label>
        Description
        <textarea name="description" value={form.description} onChange={handleChange} disabled={saving} />
      </label>

      <label>
        Image URL
        <input name="imageUrl" value={form.imageUrl} onChange={handleChange} disabled={saving} />
      </label>

      <label className="inline">
        <input type="checkbox" name="completed" checked={form.completed} onChange={handleChange} disabled={saving} />
        Completed
      </label>

      <div className="actions">
        <button type="button" className="btn btn-outline" onClick={onCancel} disabled={saving}>Cancel</button>
        <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
      </div>
    </form>
  )

}

EditCardForm.propTypes = {
  card: PropTypes.shape({
    id: PropTypes.number.isRequired,
    type: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string,
    imageUrl: PropTypes.string,
    completed: PropTypes.bool
  }).isRequired,
  onSaved: PropTypes.func,
  onCancel: PropTypes.func
};