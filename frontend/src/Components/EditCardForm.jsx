import PropTypes from 'prop-types';
import { useState } from 'react';
import api from '../api';

const TYPES = ['FEATURE','BUG','IDEA','SKETCH'];

export default function EditCardForm({ card, onSaved, onCancel }) {
  const MAX_DESC = 120;

  const [type, setType] = useState(card.type);
  const [title, setTitle] = useState(card.title);
  const [desc, setDesc] = useState(card.description || '');
  const [descCount, setDescCount] = useState((card.description || '').length);
  const [completed, setCompleted] = useState(!!card.completed);

  const [file, setFile] = useState(null); 
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleDescChange = e => {
    const v = e.target.value;
    setDesc(v);
    setDescCount(v.length);
  };

  const save = async (e) => {
    e?.preventDefault?.();
    setError('');
    if (!TYPES.includes(type)) return setError('Please choose a valid type.');
    if (!title.trim()) return setError('Title is required.');

    setBusy(true);
    try {
      const basePayload = {
        type,
        title: title.trim(),
        description: desc,
        completed,
        imageUrl: imageUrl?.trim() || null
      };
      const { data: patchRes } = await api.patch(`/cards/${card.id}`, basePayload);
      let updated = patchRes.card;

      if (file) {
        setUploading(true);
        const fd = new FormData();
        fd.append('image', file);
        const { data: imgRes } = await api.post(`/cards/${card.id}/image`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        updated = imgRes.card;
      }

      onSaved?.(updated);
    } catch (e2) {
      setError(e2.response?.data?.message || 'Failed to save card');
    } finally {
      setUploading(false);
      setBusy(false);
    }
  };

  return (
    <form className="form-grid" onSubmit={save}>
      {error && <p className="error">{error}</p>}

      <label>
        <span>Type</span>
        <select
          style={{ padding: '5px', border: '1px solid aqua', borderRadius: '5px' }}
          value={type}
          onChange={e => setType(e.target.value)}
        >
          {TYPES.map(t => <option key={t} value={t}>{t[0] + t.slice(1).toLowerCase()}</option>)}
        </select>
      </label>

      <label>
        <span>Title</span>
        <input value={title} onChange={e => setTitle(e.target.value)} />
      </label>

      <label>
        <span>Description</span>
        <textarea
          rows="4"
          value={desc}
          onChange={handleDescChange}
          maxLength={MAX_DESC}
          placeholder={`Details... (${MAX_DESC} characters max)`}
        />
        <div style={{ textAlign: 'right', fontSize: '.85rem', color: '#64748b' }}>
          {descCount}/{MAX_DESC}
        </div>
      </label>

      <label className="inline-check">
        <input type="checkbox" checked={completed} onChange={e => setCompleted(e.target.checked)} />
        Mark completed
      </label>

      <fieldset style={{ border: '1px dashed #e5e7eb', borderRadius: 8, padding: '.6rem' }}>
        <legend style={{ fontSize: '.9rem', color: '#64748b' }}>Image</legend>

        <label style={{ display: 'grid', gap: '.25rem', marginBottom: '.5rem' }}>
          <span>Replace with file (compressed ≤ 400KB by server)</span>
          <input type="file" accept="image/*" onChange={e => setFile(e.target.files?.[0] || null)} />
          {file && (
            <small style={{ color: '#64748b' }}>
              Selected: {file.name} ({Math.ceil(file.size / 1024)} KB before compression)
            </small>
          )}
        </label>

      </fieldset>

      <div style={{ display: 'flex', gap: '.5rem', justifyContent: 'flex-end', marginTop: '.5rem' }}>
        <button type="button" className="btn btn-outline" onClick={onCancel}>Cancel</button>
        <button className="btn btn-primary" disabled={busy || uploading || !title.trim() || !TYPES.includes(type)}>
          {uploading ? 'Saving + Uploading…' : (busy ? 'Saving…' : 'Save')}
        </button>
      </div>
    </form>
  );
}

EditCardForm.propTypes = {
  card: PropTypes.shape({
    id: PropTypes.number.isRequired,
    type: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string,
    imageUrl: PropTypes.string,
    completed: PropTypes.bool.isRequired
  }).isRequired,
  onSaved: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired
};
