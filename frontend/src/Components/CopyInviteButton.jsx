import { useState } from 'react';
import PropTypes from 'prop-types';

export default function CopyInviteButton({ joinLink, label = 'Copy Invite' }) {
  const [copied, setCopied] = useState(false);

  async function copy(text) {
    if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    } else {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  }

  return (
    <button className="btn btn-outline" onClick={() => copy(joinLink)}>
      {copied ? 'Copied!' : label}
    </button>
  );
}

CopyInviteButton.propTypes = {
  joinLink: PropTypes.string.isRequired,
  label: PropTypes.string
};
