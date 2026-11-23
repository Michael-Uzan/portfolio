import { isRouteErrorResponse, Link, useRouteError } from 'react-router';
import { ROUTES } from '@/routes/routes.consts';

export const RouteErrorBoundary = () => {
  const error = useRouteError();
  const message = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : 'Something went wrong.';

  return (
    <main className="grid min-h-svh place-items-center p-6 text-center text-white">
      <title>Error · Michael Uzan</title>
      <div>
        <h1 className="font-display text-6xl">Oops</h1>
        <p className="mt-4 text-white/80">{message}</p>
        <Link to={ROUTES.home} className="mt-6 inline-block underline">
          Back home
        </Link>
      </div>
    </main>
  );
};
