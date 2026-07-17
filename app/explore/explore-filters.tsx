"use client"

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search } from 'lucide-react'

interface ExploreFiltersProps {
  search?: string
  sort?: string
  minPrice?: string
  maxPrice?: string
  tags?: string
  my?: string
}

export function ExploreFilters({
  search: initSearch = '',
  sort: initSort = 'new',
  minPrice: initMin = '',
  maxPrice: initMax = '',
  tags,
  my,
}: ExploreFiltersProps) {
  const router = useRouter()
  const [search, setSearch] = useState(initSearch)
  const [sort, setSort] = useState(initSort)
  const [minPrice, setMinPrice] = useState(initMin)
  const [maxPrice, setMaxPrice] = useState(initMax)

  function buildUrl(overrides: Partial<ExploreFiltersProps> = {}) {
    const merged = { search, sort, minPrice, maxPrice, tags, my, ...overrides }
    const sp = new URLSearchParams()
    if (merged.tags) sp.set('tags', merged.tags)
    if (merged.my) sp.set('my', merged.my)
    if (merged.search?.trim()) sp.set('search', merged.search.trim())
    if (merged.sort && merged.sort !== 'new') sp.set('sort', merged.sort)
    if (merged.minPrice) sp.set('minPrice', merged.minPrice)
    if (merged.maxPrice) sp.set('maxPrice', merged.maxPrice)
    const qs = sp.toString()
    return qs ? `/explore?${qs}` : '/explore'
  }

  function applyFilters() {
    router.push(buildUrl())
  }

  function clearAll() {
    setSearch('')
    setSort('new')
    setMinPrice('')
    setMaxPrice('')
    router.push(buildUrl({ search: '', sort: 'new', minPrice: '', maxPrice: '' }))
  }

  const hasActiveFilters = !!(search || sort !== 'new' || minPrice || maxPrice)

  return (
    <div className="flex flex-wrap gap-3 mb-4">
      <div className="relative flex-1 min-w-[200px] max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          className="pl-9"
          placeholder="Search artworks..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
        />
      </div>

      <div className="flex items-center gap-2">
        <Input
          type="number"
          placeholder="Min $"
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
          className="w-[90px]"
          min={0}
        />
        <span className="text-muted-foreground text-sm">–</span>
        <Input
          type="number"
          placeholder="Max $"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          className="w-[90px]"
          min={0}
        />
      </div>

      <Select value={sort} onValueChange={setSort}>
        <SelectTrigger className="w-[180px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="new">Newest first</SelectItem>
          <SelectItem value="priceAsc">Price: Low → High</SelectItem>
          <SelectItem value="priceDesc">Price: High → Low</SelectItem>
        </SelectContent>
      </Select>

      <Button onClick={applyFilters}>Apply</Button>
      {hasActiveFilters && (
        <Button variant="ghost" onClick={clearAll}>Clear</Button>
      )}
    </div>
  )
}
