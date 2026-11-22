import { render, screen } from '@testing-library/react';
import { createMemoryRouter } from 'react-router';
import { RouterProvider } from 'react-router/dom';
import { describe, expect, it } from 'vitest';
import { routes } from './router';

function renderAt(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  render(<RouterProvider router={router} />);
}

describe('routes', () => {
  it('renders the journey on the home page', async () => {
    renderAt('/');
    expect(
      await screen.findByRole('heading', { level: 1, name: /evolution of me/i }),
    ).toBeInTheDocument();
  });

  it('renders the not-found page for unknown paths', async () => {
    renderAt('/no-such-page');
    expect(await screen.findByRole('heading', { level: 1, name: '404' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /back to the journey/i })).toHaveAttribute('href', '/');
  });

  it('shows navigation with external profile links', async () => {
    renderAt('/');
    const github = await screen.findByRole('link', { name: 'GitHub' });
    expect(github).toHaveAttribute('href', 'https://github.com/Michael-Uzan');
    expect(github).toHaveAttribute('rel', 'noreferrer');
  });
});
