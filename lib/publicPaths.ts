// Central list of routes that do not require authentication.
// Used by middleware (server) and FooterController (client) to keep behavior consistent.
export const PUBLIC_PATHS: RegExp[] = [
  /^\/$/,
  /^\/login$/,
  /^\/signup$/,
  /^\/explore(\/.*)?$/,
  /^\/artists(\/.*)?$/,
  /^\/commissions(\/.*)?$/,
  /^\/about(\/.*)?$/,
  /^\/privacy$/,
  /^\/terms$/,
  /^\/contact$/,
]

export function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.some((rx) => rx.test(pathname))
}
