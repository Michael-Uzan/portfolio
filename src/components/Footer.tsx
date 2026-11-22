import { CONTACT_EMAIL } from '@/consts/links';
import { profile } from '@/content/profile';

export function Footer() {
  return (
    <footer className="border-t border-white/10 px-6 py-8 text-sm text-white/70">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 md:flex-row md:justify-between">
        <p>
          © {new Date().getFullYear()} {profile.name}
        </p>
        <a href={`mailto:${CONTACT_EMAIL}`} className="hover:text-white">
          {CONTACT_EMAIL}
        </a>
      </div>
    </footer>
  );
}
