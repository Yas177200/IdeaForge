import { Link } from 'react-router-dom';
import '../css/notfound404.css';

export default function NotFound404() {
  return (
    <div className="nf-wrap">
      <div className="nf-bg" aria-hidden="true" />
      <div className="nf-card">
        <div className="nf-code" aria-label="404">4<span className="glitch">0</span>4</div>
        <h1 className="nf-title">Page not found</h1>
        <p className="nf-sub">The page you’re looking for doesn’t exist or has moved.</p>
        <Link to="/" className="btn btn-primary nf-btn">Go Home</Link>
      </div>
    </div>
  );
}
