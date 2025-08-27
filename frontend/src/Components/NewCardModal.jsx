import PropTypes from 'prop-types';
import { useState } from 'react';
import api from '../api';

const TYPES = ['FEATURE','BUG','IDEA','SKETCH'];

export default function NewCardModal({ projectId, onCreated, onClose }) {
  const MAX_DESC = 120;

  const [type, setType] = useState('FEATURE');
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [descCount, setDescCount] = useState(0);
  const [imageFile, setImageFile] = useState(null);

  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleDescChange = e => {
    const v = e.target.value;
    setDesc(v);
    setDescCount(v.length);
  };

  const save = async () => {
    setError('');
    if (!TYPES.includes(type)) return setError('Please choose a valid type.');
    if (!title.trim()) return setError('Title is required.');

    setBusy(true);
    try {
      const payload = {
        type,
        title: title.trim(),
        description: desc,
        imageUrl: imageUrl?.trim() || null,
        completed: false
      };
      const { data } = await api.post(`/projects/${projectId}/cards`, payload);
      const created = data.card;

      if (imageFile && created?.id) {
        setUploading(true);
        const fd = new FormData();
        fd.append('image', imageFile);
        try {
          await api.post(`/cards/${created.id}/image`, fd, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
        } catch (e) {
          console.error('Card image upload failed:', e);
          setError(e?.response?.data?.message || 'Card created, but image upload failed.');
        } finally {
          setUploading(false);
        }
      }

      onCreated?.();
      onClose();
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to create card');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <h3 className="modal-title">Add New Card</h3>
          <button className="btn btn-outline" onClick={onClose}>Close</button>
        </div>

        {error && <p className="error">{error}</p>}

        <div className="form-grid">
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
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Short title" />
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

          <fieldset style={{ border: '1px dashed #e5e7eb', borderRadius: 8, padding: '.6rem' }}>
            <legend style={{ fontSize: '.9rem', color: '#64748b' }}>Image (optional)</legend>

            <label style={{ display: 'grid', gap: '.25rem', marginBottom: '.5rem' }}>
              <span>Upload file (will be resized & compressed ≤ 400KB)</span>
              <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files?.[0] || null)} />
              {imageFile && (
                <small style={{ color: '#64748b' }}>
                  Selected: {imageFile.name} ({Math.ceil(imageFile.size / 1024)} KB before compression)
                </small>
              )}
            </label>



          </fieldset>
        </div>

        <div style={{ display: 'flex', gap: '.5rem', justifyContent: 'flex-end', marginTop: '.5rem' }}>
          <button className="btn btn-outline" onClick={onClose}>Cancel</button>
          <button
            className="btn btn-primary"
            onClick={save}
            disabled={busy || uploading || !title.trim() || !TYPES.includes(type)}
          >
            {uploading ? 'Creating + Uploading…' : (busy ? 'Creating…' : 'Create')}
          </button>
        </div>
      </div>
    </div>
  );
}

NewCardModal.propTypes = {
  projectId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  onCreated: PropTypes.func,
  onClose: PropTypes.func.isRequired,
};
