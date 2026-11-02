import { Link } from 'react-router-dom';
import './Footer.css';

export const Footer = () => {
  return (
    <footer className="lobby-footer">
      <div className="lobby-footer__content">
        <p className="lobby-footer__copyright">©2026 Tower Empire</p>
        <div className="lobby-footer__links">
          <Link to="/personal-data-policy" className="lobby-footer__link">
            Политика обработки персональных данных
          </Link>
          <span className="lobby-footer__separator">|</span>
          <Link to="/privacy-policy" className="lobby-footer__link">
            Privacy Policy
          </Link>
        </div>
      </div>
    </footer>
  );
};
