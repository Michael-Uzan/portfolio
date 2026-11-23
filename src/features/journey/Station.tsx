import { cn } from '@/lib/utils';
import type { JourneyStation } from '@/types/journey.types';
import type { PathPoint } from './journeyLayout.types';
import { STATION_ICONS } from './stationIcons';

interface StationProps {
  station: JourneyStation;
  point: PathPoint;
  isActive: boolean;
  isReached: boolean;
  onSelect: () => void;
}

export function Station({ station, point, isActive, isReached, onSelect }: StationProps) {
  const Icon = STATION_ICONS[station.kind];
  return (
    <li
      className="absolute -translate-x-1/2 -translate-y-1/2"
      style={{ left: point.x, top: point.y }}
    >
      {/* Claude: wait, so why we did create the Button.tsx component? */}
      <button
        type="button"
        onClick={onSelect}
        onFocus={onSelect}
        aria-current={isActive ? 'step' : undefined}
        className={cn(
          'flex w-44 flex-col items-center gap-1 rounded-xl p-2 text-center transition duration-500 motion-reduce:transition-none',
          'focus-visible:outline-2 focus-visible:outline-lime-200',
          isReached ? 'opacity-100' : 'opacity-60',
          isActive && 'scale-110 motion-reduce:scale-100',
        )}
      >
        <span
          className={cn(
            'grid size-14 place-items-center rounded-full border border-lime-200/60 bg-black/50 backdrop-blur-sm transition-shadow duration-500 motion-reduce:transition-none',
            isActive && 'shadow-[0_0_28px_rgba(217,249,157,0.55)]',
          )}
        >
          <Icon aria-hidden="true" className="size-7 text-lime-100" strokeWidth={1.25} />
        </span>
        <span className="font-display text-3xl leading-none tracking-wide text-white">
          {station.year}
        </span>
        <span className="text-sm leading-tight text-white">{station.title}</span>
        <span className="text-xs text-white/80">{station.org}</span>
      </button>
    </li>
  );
}
