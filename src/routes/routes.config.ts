import type { RouteObject } from 'react-router';
import { RootLayout } from '@/app/RootLayout';
import { RouteErrorBoundary } from '@/app/RouteErrorBoundary';
import { ROUTES } from './routes.consts';

/** Pages are lazy so each one becomes its own chunk. */
export const routes: RouteObject[] = [
  {
    path: ROUTES.home,
    Component: RootLayout,
    ErrorBoundary: RouteErrorBoundary,
    children: [
      {
        index: true,
        lazy: async () => ({ Component: (await import('@/pages/HomePage')).HomePage }),
      },
      {
        path: '*',
        lazy: async () => ({ Component: (await import('@/pages/NotFoundPage')).NotFoundPage }),
      },
    ],
  },
];
