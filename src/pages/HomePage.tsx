import { profile } from '@/content/profile';
import { JourneySection } from '@/features/journey/JourneySection';

export const HomePage = () => {
  return (
    <>
      <title>{`${profile.name} · ${profile.headline}`}</title>
      <JourneySection />
    </>
  );
};
