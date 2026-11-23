import { Link } from 'react-router';
import { SOCIAL_LINKS } from '@/consts/links.consts';
import { ROUTES } from '@/routes/routes.consts';
import { profile } from '@/content/profile';

export const Navbar = () => {
  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <nav
        aria-label="Main"
        className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 text-sm text-white"
      >
        <Link to={ROUTES.home} className="font-display text-2xl tracking-wide">
          {profile.name}
        </Link>
        <ul className="flex gap-6">
          {SOCIAL_LINKS.map((link) => (
            <li key={link.label}>
              <a href={link.href} target="_blank" rel="noreferrer" className="hover:text-lime-200">
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
};
