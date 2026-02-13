/**
 * Lightweight hash-based router for deep linking.
 *
 * Routes:
 *   /#/                                              → home (default ontology)
 *   /#/catalogue                                     → opens gallery modal
 *   /#/catalogue/<source>/<slug>                     → loads a specific ontology
 *   /#/catalogue/community/<user>/<slug>             → community ontology
 *   /#/embed/<source>/<slug>                         → full-page embed view
 */

export type Route =
  | { page: 'home' }
  | { page: 'catalogue'; ontologyId?: string }
  | { page: 'embed'; ontologyId: string };

/** Parse a hash string (e.g. "#/catalogue/official/cosmic-coffee") into a Route. */
export function parseHash(hash: string): Route {
  // Strip leading "#" and optional leading "/"
  const path = hash.replace(/^#\/?/, '');
  const segments = path.split('/').filter(Boolean);

  if (segments[0] === 'catalogue') {
    // Everything after "catalogue/" is the ontologyId (may be multi-segment)
    const rest = segments.slice(1);
    return { page: 'catalogue', ontologyId: rest.length > 0 ? rest.join('/') : undefined };
  }
  if (segments[0] === 'embed' && segments.length > 1) {
    return { page: 'embed', ontologyId: segments.slice(1).join('/') };
  }
  return { page: 'home' };
}

/** Convert a Route back to a hash string. */
export function routeToHash(route: Route): string {
  switch (route.page) {
    case 'catalogue':
      return route.ontologyId
        ? `#/catalogue/${route.ontologyId}`
        : '#/catalogue';
    case 'embed':
      return `#/embed/${route.ontologyId}`;
    case 'home':
    default:
      return '#/';
  }
}

/** Navigate to a route by updating window.location.hash. */
export function navigate(route: Route): void {
  window.location.hash = routeToHash(route);
}

/** Get the current route from the window hash. */
export function currentRoute(): Route {
  return parseHash(window.location.hash);
}

type RouteListener = (route: Route) => void;

const listeners = new Set<RouteListener>();

function onHashChange() {
  const route = currentRoute();
  for (const fn of listeners) {
    fn(route);
  }
}

/** Subscribe to route changes. Returns an unsubscribe function. */
export function onRouteChange(fn: RouteListener): () => void {
  if (listeners.size === 0) {
    window.addEventListener('hashchange', onHashChange);
  }
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
    if (listeners.size === 0) {
      window.removeEventListener('hashchange', onHashChange);
    }
  };
}
