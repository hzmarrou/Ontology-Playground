import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { parseHash, routeToHash, navigate, currentRoute, onRouteChange } from './router';

describe('parseHash', () => {
  it('returns home for empty hash', () => {
    expect(parseHash('')).toEqual({ page: 'home' });
  });

  it('returns home for "#/"', () => {
    expect(parseHash('#/')).toEqual({ page: 'home' });
  });

  it('returns home for "#"', () => {
    expect(parseHash('#')).toEqual({ page: 'home' });
  });

  it('returns home for unknown paths', () => {
    expect(parseHash('#/unknown/stuff')).toEqual({ page: 'home' });
  });

  it('parses catalogue route without id', () => {
    expect(parseHash('#/catalogue')).toEqual({ page: 'catalogue', ontologyId: undefined });
  });

  it('parses catalogue route with single-segment id', () => {
    expect(parseHash('#/catalogue/cosmic-coffee')).toEqual({
      page: 'catalogue',
      ontologyId: 'cosmic-coffee',
    });
  });

  it('parses catalogue route with path-based id (official)', () => {
    expect(parseHash('#/catalogue/official/cosmic-coffee')).toEqual({
      page: 'catalogue',
      ontologyId: 'official/cosmic-coffee',
    });
  });

  it('parses catalogue route with path-based id (community)', () => {
    expect(parseHash('#/catalogue/community/alice/my-ontology')).toEqual({
      page: 'catalogue',
      ontologyId: 'community/alice/my-ontology',
    });
  });

  it('parses embed route with path-based id', () => {
    expect(parseHash('#/embed/official/cosmic-coffee')).toEqual({
      page: 'embed',
      ontologyId: 'official/cosmic-coffee',
    });
  });

  it('returns home for embed route without id', () => {
    expect(parseHash('#/embed')).toEqual({ page: 'home' });
  });

  it('handles leading slash variations', () => {
    expect(parseHash('#catalogue/test')).toEqual({ page: 'catalogue', ontologyId: 'test' });
  });
});

describe('parseHash – security', () => {
  it('rejects path traversal with ..', () => {
    expect(parseHash('#/catalogue/../../etc/passwd')).toEqual({
      page: 'catalogue',
      ontologyId: undefined,
    });
  });

  it('rejects encoded path traversal (%2e%2e)', () => {
    expect(parseHash('#/catalogue/%2e%2e/foo')).toEqual({
      page: 'catalogue',
      ontologyId: undefined,
    });
  });

  it('normalizes double slashes to valid path', () => {
    // split('/').filter(Boolean) removes empty segments before sanitization
    expect(parseHash('#/catalogue/official//coffee')).toEqual({
      page: 'catalogue',
      ontologyId: 'official/coffee',
    });
  });

  it('rejects uppercase characters', () => {
    expect(parseHash('#/catalogue/Official/Coffee')).toEqual({
      page: 'catalogue',
      ontologyId: undefined,
    });
  });

  it('rejects IDs starting with a hyphen', () => {
    expect(parseHash('#/catalogue/-bad')).toEqual({
      page: 'catalogue',
      ontologyId: undefined,
    });
  });

  it('rejects IDs ending with a hyphen', () => {
    expect(parseHash('#/catalogue/bad-')).toEqual({
      page: 'catalogue',
      ontologyId: undefined,
    });
  });

  it('rejects IDs with special characters', () => {
    expect(parseHash('#/catalogue/foo<script>bar')).toEqual({
      page: 'catalogue',
      ontologyId: undefined,
    });
  });

  it('rejects embed route with path traversal', () => {
    expect(parseHash('#/embed/../../etc/passwd')).toEqual({ page: 'home' });
  });

  it('rejects embed route with encoded chars', () => {
    expect(parseHash('#/embed/%2e%2e/foo')).toEqual({ page: 'home' });
  });

  it('accepts valid multi-segment IDs', () => {
    expect(parseHash('#/catalogue/community/alice/my-ontology')).toEqual({
      page: 'catalogue',
      ontologyId: 'community/alice/my-ontology',
    });
  });
});

describe('routeToHash', () => {
  it('converts home route', () => {
    expect(routeToHash({ page: 'home' })).toBe('#/');
  });

  it('converts catalogue route without id', () => {
    expect(routeToHash({ page: 'catalogue' })).toBe('#/catalogue');
  });

  it('converts catalogue route with path-based id', () => {
    expect(routeToHash({ page: 'catalogue', ontologyId: 'official/cosmic-coffee' })).toBe(
      '#/catalogue/official/cosmic-coffee',
    );
  });

  it('converts embed route with path-based id', () => {
    expect(routeToHash({ page: 'embed', ontologyId: 'official/cosmic-coffee' })).toBe(
      '#/embed/official/cosmic-coffee',
    );
  });
});

describe('roundtrip', () => {
  const routes = [
    { page: 'home' as const },
    { page: 'catalogue' as const },
    { page: 'catalogue' as const, ontologyId: 'official/healthcare' },
    { page: 'catalogue' as const, ontologyId: 'community/alice/finance-ledger' },
    { page: 'embed' as const, ontologyId: 'official/finance' },
  ];

  for (const route of routes) {
    it(`roundtrips ${JSON.stringify(route)}`, () => {
      expect(parseHash(routeToHash(route))).toEqual(route);
    });
  }
});

describe('navigate + currentRoute', () => {
  let originalHash: string;

  beforeEach(() => {
    originalHash = window.location.hash;
  });

  afterEach(() => {
    window.location.hash = originalHash;
  });

  it('sets the hash via navigate()', () => {
    navigate({ page: 'catalogue', ontologyId: 'official/test' });
    expect(window.location.hash).toBe('#/catalogue/official/test');
    expect(currentRoute()).toEqual({ page: 'catalogue', ontologyId: 'official/test' });
  });
});

describe('onRouteChange', () => {
  let originalHash: string;

  beforeEach(() => {
    originalHash = window.location.hash;
  });

  afterEach(() => {
    window.location.hash = originalHash;
  });

  it('calls listener on hashchange', async () => {
    const listener = vi.fn();
    const unsub = onRouteChange(listener);

    window.location.hash = '#/catalogue';
    // hashchange fires asynchronously
    await new Promise((r) => setTimeout(r, 50));

    expect(listener).toHaveBeenCalledWith({ page: 'catalogue', ontologyId: undefined });

    unsub();
  });

  it('stops calling listener after unsubscribe', async () => {
    const listener = vi.fn();
    const unsub = onRouteChange(listener);
    unsub();

    window.location.hash = '#/embed/test';
    await new Promise((r) => setTimeout(r, 50));

    expect(listener).not.toHaveBeenCalled();
  });
});
