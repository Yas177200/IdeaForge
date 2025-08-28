import PropTypes from 'prop-types';
import { useState } from 'react';
import api from '../api';

const TYPES = ['FEATURE','BUG','IDEA','SKETCH'];

export default function EditCardForm({ card, onSaved, onCancel }) {
  const MAX_DESC = 120;

  const [type, setType]   = useState(card.type);
  const [title, setTitle] = useState(card.title);
  const [desc, setDesc]   = useState(card.description || '');
  const [descCount, setDescCount] = useState((card.description || '').length);

  // keep current completed value; remove if you control it elsewhere
  const completed = card.completed;

  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleDescChange = (e) => {
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
      };
      const { data: patchRes } = await api.patch(`/cards/${card.id}`, basePayload);
      let updated = patchRes.card;

      if (file) {
        setUploading(true);
        const fd = new FormData();
        fd.append('image', file);
        const { data: imgRes } = await api.post(
          `/cards/${card.id}/image`,
          fd,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        );
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
    <form className="card-edit-form" onSubmit={save}>
      {error && <p className="error">{error}</p>}

      <label className="form-row">
        <span className="form-label">Type</span>
        <select
          className="form-control type-select"
          value={type}
          onChange={e => setType(e.target.value)}
        >
          {TYPES.map(t => (
            <option key={t} value={t}>{t[0] + t.slice(1).toLowerCase()}</option>
          ))}
        </select>
      </label>

      <label className="form-row">
        <span className="form-label">Title</span>
        <input
          className="form-control"
          value={title}
          onChange={e => setTitle(e.target.value)}
        />
      </label>

      <label className="form-row">
        <span className="form-label">Description</span>
        <textarea
          className="form-control"
          rows="4"
          value={desc}
          onChange={handleDescChange}
          maxLength={MAX_DESC}
          placeholder={`Details... (${MAX_DESC} characters max)`}
        />
        <div className="desc-count">
          {descCount}/{MAX_DESC}
        </div>
      </label>

      <fieldset className="image-fieldset" style={{maxWidth: '250px'}}>
        <legend className="image-legend">Image</legend>

        <label className="file-group">
          <span>Replace with file (compressed ≤ 400KB by server)</span>
          <input
            className="form-control"
            type="file"
            accept="image/*"
            style={{width:'250px'}}
            onChange={e => setFile(e.target.files?.[0] || null)}
          />
          {file && (
            <small className="muted">
              Selected: {file.name} ({Math.ceil(file.size / 1024)} KB before compression)
            </small>
          )}
        </label>
      </fieldset>

      <div className="actions">
        <button type="button" className="btn btn-outline" onClick={onCancel}>Cancel</button>
        <button
          className="btn btn-primary"
          disabled={busy || uploading || !title.trim() || !TYPES.includes(type)}
        >
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
