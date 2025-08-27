import Link from 'next/link'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { listArtists } from '@/lib/db/users'

export const dynamic = 'force-dynamic'

type SearchParams = {
  page?: string
  pageSize?: string
}

function parseIntOr<T extends number>(value: string | undefined, fallback: T, min?: number, max?: number): number {
  const n = value ? Number.parseInt(value, 10) : NaN
  if (Number.isNaN(n)) return fallback
  let v = n
  if (min != null) v = Math.max(min, v)
  if (max != null) v = Math.min(max, v)
  return v
}

export default async function ArtistsPage({ searchParams }: { searchParams: SearchParams }) {
  const page = parseIntOr(searchParams.page, 1, 1)
  const pageSize = parseIntOr(searchParams.pageSize, 12, 1, 100)

  const { items, total } = await listArtists(page, pageSize)
  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  const makeHref = (overrides: Partial<SearchParams> = {}) => {
    const sp = new URLSearchParams()
    const next = { page, pageSize, ...overrides }
    if (next.page && next.page !== 1) sp.set('page', String(next.page))
    if (next.pageSize && next.pageSize !== 12) sp.set('pageSize', String(next.pageSize))
    const qs = sp.toString()
    return qs ? `/artists?${qs}` : '/artists'
  }

  const getInitials = (name?: string) => {
    if (!name) return 'A'
    const parts = name.trim().split(/\s+/)
    const first = parts[0]?.[0] ?? ''
    const last = parts.length > 1 ? parts[parts.length - 1][0] : ''
    return (first + last).toUpperCase() || 'A'
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Artists</h1>
      <div className="mb-4 text-sm text-muted-foreground">{total} artists</div>

      {items.length === 0 ? (
        <div className="mt-16 text-center">
          <h2 className="text-xl font-semibold">No artists found</h2>
          <p className="text-sm text-muted-foreground mt-1">Please check back later.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((u) => (
              <Card key={String(u._id)} className="overflow-hidden">
                <CardContent className="p-4 flex items-start gap-4">
                  <Avatar className="h-14 w-14">
                    <AvatarImage src={u.avatarUrl || ''} alt={u.name} />
                    <AvatarFallback>{getInitials(u.name)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-lg leading-tight">{u.name}</h3>
                    <p className="text-xs text-muted-foreground">{u.email}</p>
                    {u.bio ? (
                      <p className="text-sm mt-2 line-clamp-2">{u.bio}</p>
                    ) : null}
                  </div>
                </CardContent>
                <CardFooter className="p-4 pt-0 flex justify-end">
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/artist/${String(u._id)}`}>View profile</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          <div className="flex items-center justify-center gap-2 mt-8">
            <Button asChild variant="outline" disabled={page <= 1}>
              <Link href={makeHref({ page: String(Math.max(1, page - 1)) })}>Previous</Link>
            </Button>
            <span className="text-sm">Page {page} of {totalPages}</span>
            <Button asChild variant="outline" disabled={page >= totalPages}>
              <Link href={makeHref({ page: String(Math.min(totalPages, page + 1)) })}>Next</Link>
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
