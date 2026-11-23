import { describe, expect, it } from 'vitest';
import { journey } from './journey';
import { profile } from './profile';
import { journeySchema } from './journey.schemas';
import { profileSchema } from './profile.schemas';

const station = {
  id: 'sample',
  year: 2020,
  kind: 'role',
  title: 'Developer',
  org: 'Acme',
  summary: 'Built things.',
} as const;

describe('journey content', () => {
  it('passes the journey schema', () => {
    const result = journeySchema.safeParse(journey);
    expect(result.error?.issues).toBeUndefined();
  });

  it('rejects duplicate ids', () => {
    expect(journeySchema.safeParse([station, station]).success).toBe(false);
  });

  it('rejects stations out of chronological order', () => {
    const later = { ...station, id: 'later', year: 2021 };
    expect(journeySchema.safeParse([later, station]).success).toBe(false);
  });

  it('rejects an unknown station kind', () => {
    expect(journeySchema.safeParse([{ ...station, kind: 'hobby' }]).success).toBe(false);
  });

  it.each(['course', 'award'])('rejects the removed station kind %s', (kind) => {
    expect(journeySchema.safeParse([{ ...station, kind }]).success).toBe(false);
  });
});

describe('profile content', () => {
  it('passes the profile schema', () => {
    expect(profileSchema.safeParse(profile).success).toBe(true);
  });
});
