import { isDefined } from './isDefined';
import { describe, it, expect } from 'vitest';

describe('isDefined', () => {
  it('should return true for a defined value', () => {
    expect(isDefined('hello')).toBe(true);
    expect(isDefined(0)).toBe(true);
    expect(isDefined(false)).toBe(true);
    expect(isDefined({})).toBe(true);
    expect(isDefined([])).toBe(true);
  });

  it('should return false for undefined', () => {
    expect(isDefined(undefined)).toBe(false);
  });

  // Based on the current implementation, null is considered defined.
  // If the intention was to treat null as undefined, the function would need to be updated.
  it('should return true for null (based on current implementation)', () => {
    expect(isDefined(null)).toBe(true);
  });
});
