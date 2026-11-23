import { Link } from 'react-router';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/routes/routes.consts';

export function NotFoundPage() {
  return (
    <section className="grid min-h-svh place-items-center px-6 text-center text-white">
      <title>Page not found · Michael Uzan</title>
      <meta name="robots" content="noindex" />
      <div>
        <h1 className="font-display text-7xl md:text-9xl">404</h1>
        <p className="mt-4 text-lg text-white/80">This stop is not on the route.</p>
        <Button asChild className="mt-8">
          <Link to={ROUTES.home}>Back to the journey</Link>
        </Button>
      </div>
    </section>
  );
}
