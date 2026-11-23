import { cn } from '@/lib/utils';
import type { JourneyStation } from '@/types/journey';
import { formatPeriod } from './formatPeriod';

// CLaude: it is okay to leave it here, as long as it small, and as long as it just the component props, and not like 10 different types for the entire file...
interface StationCardProps {
  station: JourneyStation;
  className?: string;
}

/** Details of the active station. Polite live region so keyboard users hear the change. */
export function StationCard({ station, className }: StationCardProps) {
  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className={cn(
        'z-20 max-w-sm rounded-2xl border border-white/15 bg-black/60 p-5 backdrop-blur-md',
        className,
      )}
    >
      <p className="text-xs tracking-widest text-lime-200 uppercase">
        {formatPeriod(station)} · {station.org}
      </p>
      <h2 className="mt-1 font-display text-3xl tracking-wide text-white">{station.title}</h2>
      <p className="mt-2 text-sm text-white/85">{station.summary}</p>
    </div>
  );
}
