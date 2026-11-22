import { useEffect, useRef } from 'react';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

interface BackgroundVideoProps {
  webm: string;
  mp4: string;
  poster: string;
}

/** Full-bleed muted loop behind a section. Sticks to the viewport while its section scrolls. */
export function BackgroundVideo({ webm, mp4, poster }: BackgroundVideoProps) {
  const reducedMotion = usePrefersReducedMotion();
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const onVisibilityChange = () => {
      const video = videoRef.current;
      if (!video) return;
      if (document.hidden) video.pause();
      else void video.play().catch(() => undefined);
    };
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, []);

  const mediaClass = 'sticky top-0 h-svh w-full object-cover';

  return (
    <div aria-hidden="true" className="absolute inset-0 -z-10">
      {reducedMotion ? (
        <img src={poster} alt="" className={mediaClass} />
      ) : (
        <video
          ref={videoRef}
          className={mediaClass}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster={poster}
        >
          <source src={webm} type="video/webm" />
          <source src={mp4} type="video/mp4" />
        </video>
      )}
      <div className="absolute inset-0 bg-linear-to-b from-black/75 via-black/55 to-black/85" />
    </div>
  );
}
