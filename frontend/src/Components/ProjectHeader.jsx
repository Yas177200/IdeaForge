import { useEffect, useState } from "react";
import PropTypes from 'prop-types';
import api from '../api';

export default function ProjectHeader({ projectId, onDelete, onUpdated}) {
    const me = JSON.parse(localStorage.getItem('user'));
    const [project, setProject] = useState(null);
    const [error, setError] = useState('');
    const [editing, setEditing] = useState(false);

    useEffect(() => {
    (async () => {
        try {
            const { data } = await api.get(`/projects/${projectId}`);
            setProject(data.project);
            setError('');
        } catch (e) {
            setError(e.response?.data?.message || 'Failed to load project');
        }
    })();
    }, [projectId]);

    if (error) return <p className="error">{error}</p>
    if (!project) return <p>Loading project...</p>

    const isOwner = me?.id === project.ownerId;

    const handleDelete = async () => {
        if (!confirm('Delete this Project? This cannot be undone!')) return;
        try{
            await api.delete(`projects/${projectId}`);
            onDelete?.()
        }catch (err) {
            alert(e.response?.data?.message || 'Delete Failed.')
        }
    };

    return (
    <div className="project-header">
      <div className="meta">
        <h1>{project.name}</h1>
        <p className="summary">{project.shortSummary}</p>
        {project.tags?.length ? (
          <div className="tags">
            {project.tags.map(t => <span key={t} className="tag">{t}</span>)}
          </div>
        ) : null}
        <p className="muted">Owner: {project.ownerName}</p>
      </div>

      {isOwner && (
        <div className="actions">
          <button className="btn btn-outline" onClick={() => setEditing(true)}>Edit</button>
          <button className="btn btn-primary" onClick={handleDelete}>Delete</button>
        </div>
      )}

      {editing && (
        <EditProjectModal
          project={project}
          onClose={() => setEditing(false)}
          onSaved={(p) => { setProject(p); onUpdated?.(p); setEditing(false); }}
        />
      )}
    </div>
  );
}
ProjectHeader.propTypes = {
  projectId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  onDeleted: PropTypes.func,
  onUpdated: PropTypes.func
};

function EditProjectModal({ project, onClose, onSaved }) {
  const [form, setForm] = useState({
    name: project.name,
    shortSummary: project.shortSummary || '',
    fullDescription: project.fullDescription || '',
    tags: (project.tags || []).join(', ')
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const change = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async e => {
    e.preventDefault();
    setErr('');
    try {
      setSaving(true);
      const payload = {
        name: form.name.trim(),
        shortSummary: form.shortSummary.trim(),
        fullDescription: form.fullDescription.trim(),
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean)
      };
      const { data } = await api.patch(`/projects/${project.id}`, payload);
      onSaved?.(data.project);
    } catch (e) {
      setErr(e.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal">
        <h3>Edit Project</h3>
        {err && <p className="error">{err}</p>}

        <form onSubmit={submit}>
          <label>Name
            <input name="name" value={form.name} onChange={change} required disabled={saving}/>
          </label>
          <label>Short Summary
            <input name="shortSummary" value={form.shortSummary} onChange={change} disabled={saving}/>
          </label>
          <label>Full Description
            <textarea name="fullDescription" value={form.fullDescription} onChange={change} disabled={saving}
              style={{height: '90px'}}/>
          </label>
          <label>Tags (comma-separated)
            <input name="tags" value={form.tags} onChange={change} disabled={saving}/>
          </label>

          <div className="actions">
            <button type="button" className="btn btn-outline" onClick={onClose} disabled={saving}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

EditProjectModal.propTypes = {
  project: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
  onSaved: PropTypes.func.isRequired
};