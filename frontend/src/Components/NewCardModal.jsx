import PropTypes from 'prop-types';
import { useState } from 'react';
import api from '../api';

export default function NewCardModal({ projectId, onCreated, onClose }) {
  const MAX_DESC = 120;

  const [type, setType] = useState('Choose a type');
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [descCount, setDescCount] = useState(0);
  const [imageUrl, setImageUrl] = useState('');
  const [error, setError] = useState('');

  const handleDescChange = (e) => {
    const val = e.target.value;
    setDesc(val);
    setDescCount(val.length);
  };

  const save = async () => {
    try {
      const payload = { type, title, description: desc, imageUrl: imageUrl || null, completed: false };
      await api.post(`/projects/${projectId}/cards`, payload);
      onCreated?.();
      onClose();
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to create card');
    }
  };

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
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
              onChange={(e) => setType(e.target.value)}
            >
              <option value="FEATURE">Feature</option>
              <option value="BUG">Bug</option>
              <option value="IDEA">Idea</option>
              <option value="SKETCH">Sketch</option>
            </select>
          </label>

          <label>
            <span>Title</span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Short title"
            />
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

          <label>
            <span>Image URL (optional)</span>
            <input
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://…"
            />
          </label>
        </div>

        <div style={{ display: 'flex', gap: '.5rem', justifyContent: 'flex-end', marginTop: '.5rem' }}>
          <button className="btn btn-outline" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={save} disabled={!title.trim()}>
            Create
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
