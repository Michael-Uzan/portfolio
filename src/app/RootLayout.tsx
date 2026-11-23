import { Outlet, ScrollRestoration } from 'react-router';
import { Footer } from '@/components/Footer';
import { Navbar } from '@/components/Navbar';

export const RootLayout = () => {
  return (
    <>
      <a
        href="#main"
        className="sr-only z-[60] rounded bg-white px-4 py-2 text-black focus:not-sr-only focus:fixed focus:top-4 focus:left-4"
      >
        Skip to content
      </a>
      <Navbar />
      <main id="main">
        <Outlet />
      </main>
      <Footer />
      <ScrollRestoration />
    </>
  );
};
