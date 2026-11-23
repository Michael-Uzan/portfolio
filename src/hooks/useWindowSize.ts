import { useEffect, useState } from 'react';
import type { WindowSize } from './useWindowSize.types';

function readSize(): WindowSize {
  return { width: window.innerWidth, height: window.innerHeight };
}

export function useWindowSize(): WindowSize {
  const [size, setSize] = useState(readSize);

  useEffect(() => {
    const onResize = () => {
      setSize(readSize());
    };
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return size;
}
