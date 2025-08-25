import { useState } from 'react';
import PropTypes from 'prop-types';
import api from '../api';
import '../css/joinbar.css';

export default function JoinBar({ onApplied }) {
  const [joinLink, setJoinLink] = useState('');
  const [busy, setBusy] = useState(false);
  const [okMsg, setOkMsg] = useState('');
  const [errMsg, setErrMsg] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    const value = joinLink.trim();
    if (!value) return;

    setBusy(true);
    setOkMsg('');
    setErrMsg('');

    try {
      await api.post('/projects/join', { joinLink: value });
      setOkMsg('Applied to join successfully. See status in Pending tab.');
      setJoinLink('');
      onApplied?.(); // let parent refresh Pending list/count if desired
    } catch (err) {
      setErrMsg(err?.response?.data?.message || 'Failed to join project');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="joinbar" role="region" aria-label="Join a project">
      <form className="joinbar-form" onSubmit={submit}>
        <input
          className="joinbar-input"
          value={joinLink}
          onChange={(e) => setJoinLink(e.target.value)}
          placeholder="Paste invite UUID…"
          aria-label="Invite UUID"
        />
        <button className="btn btn-primary joinbar-btn" disabled={busy || !joinLink.trim()}>
          {busy ? 'Joining…' : 'Join'}
        </button>
      </form>

      {okMsg && <p className="flash flash-ok">{okMsg}</p>}
      {errMsg && <p className="flash flash-err">{errMsg}</p>}
    </div>
  );
}

JoinBar.propTypes = {
  onApplied: PropTypes.func
};
