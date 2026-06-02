import { Link } from 'react-router-dom';
import { Icon } from '@iconify/react';

export default function Navbar() {
  return (
    <nav className="navbar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <Link
        to="/"
        aria-label="Back to home"
        title="Back to home"
        className="text-white hover:text-primary transition-colors duration-300"
        style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}
      >
        <Icon icon="mdi:arrow-left" width={30} height={30} />
      </Link>
    </nav>
  );
}
