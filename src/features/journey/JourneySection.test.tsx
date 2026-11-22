import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { journey } from '@/content/journey';
import { JourneySection } from './JourneySection';

function getStationList() {
  return screen.getByRole('list', { name: 'Career milestones' });
}

describe('JourneySection', () => {
  it('renders the title as the page heading', () => {
    render(<JourneySection />);
    expect(screen.getByRole('heading', { level: 1, name: /evolution of me/i })).toBeInTheDocument();
  });

  it('renders every milestone in order as a list item', () => {
    render(<JourneySection />);
    const items = within(getStationList()).getAllByRole('listitem');
    expect(items).toHaveLength(journey.length);
    journey.forEach((station, index) => {
      expect(items[index]).toHaveTextContent(station.org);
    });
  });

  it('shows the first milestone details by default', () => {
    render(<JourneySection />);
    const [first] = journey;
    if (!first) throw new Error('journey content is empty');
    expect(screen.getByText(first.summary)).toBeInTheDocument();
  });

  it('shows a milestone when it is selected', async () => {
    const user = userEvent.setup();
    render(<JourneySection />);
    const buttons = within(getStationList()).getAllByRole('button');
    const lastButton = buttons[buttons.length - 1];
    const lastStation = journey[journey.length - 1];
    if (!lastButton || !lastStation) throw new Error('journey content is empty');

    await user.click(lastButton);

    expect(lastButton).toHaveAttribute('aria-current', 'step');
    expect(screen.getByText(lastStation.summary)).toBeInTheDocument();
  });

  it('renders the digital-rain background as a decorative canvas', () => {
    const { container } = render(<JourneySection />);
    const canvas = container.querySelector('canvas');
    expect(canvas).toBeInTheDocument();
    expect(canvas?.closest('[aria-hidden="true"]')).not.toBeNull();
    expect(container.querySelector('video')).toBeNull();
  });
});
