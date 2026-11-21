import { describe, expect, it } from 'vitest';
import { buildPath } from './buildPath';

describe('buildPath', () => {
  it('returns empty geometry when there are no stations', () => {
    expect(
      buildPath({ count: 0, viewportWidth: 800, viewportHeight: 600, layout: 'horizontal' }),
    ).toEqual({
      d: '',
      points: [],
      width: 800,
      height: 600,
    });
  });

  it('draws a single station as a lone move command', () => {
    const geometry = buildPath({
      count: 1,
      viewportWidth: 400,
      viewportHeight: 500,
      layout: 'horizontal',
    });
    expect(geometry.d).toBe('M 200 300');
    expect(geometry.points).toEqual([{ x: 200, y: 300 }]);
  });

  it('builds a horizontal serpentine that alternates up and down', () => {
    const geometry = buildPath({
      count: 3,
      viewportWidth: 900,
      viewportHeight: 1000,
      layout: 'horizontal',
    });
    expect(geometry.points).toEqual([
      { x: 150, y: 600 },
      { x: 450, y: 600 },
      { x: 750, y: 600 },
    ]);
    expect(geometry.d).toBe('M 150 600 C 150 320, 450 320, 450 600 C 450 880, 750 880, 750 600');
    expect(geometry.width).toBe(900);
    expect(geometry.height).toBe(1000);
  });

  it('widens the horizontal canvas past the viewport when stations would be cramped', () => {
    const geometry = buildPath({
      count: 8,
      viewportWidth: 1280,
      viewportHeight: 800,
      layout: 'horizontal',
    });
    expect(geometry.width).toBe(8 * 260);
    expect(geometry.points[1]?.x).toBe(390);
  });

  it('builds a vertical serpentine that alternates left and right', () => {
    const geometry = buildPath({
      count: 3,
      viewportWidth: 400,
      viewportHeight: 0,
      layout: 'vertical',
    });
    expect(geometry.points).toEqual([
      { x: 200, y: 120 },
      { x: 200, y: 360 },
      { x: 200, y: 600 },
    ]);
    expect(geometry.d).toBe('M 200 120 C 88 120, 88 360, 200 360 C 312 360, 312 600, 200 600');
    expect(geometry.width).toBe(400);
    expect(geometry.height).toBe(720);
  });

  it('caps the vertical canvas width on wide screens', () => {
    const geometry = buildPath({
      count: 2,
      viewportWidth: 1400,
      viewportHeight: 900,
      layout: 'vertical',
    });
    expect(geometry.width).toBe(560);
    expect(geometry.points[0]?.x).toBe(280);
  });
});
