import { SearchResults } from "@/components/search-results"
import { Suspense } from "react"

export const metadata = {
  title: "Search Results - Filmzi",
  description: "Search results for movies and TV series",
}

interface SearchPageProps {
  searchParams: {
    q?: string
  }
}

export default function SearchPage({ searchParams }: SearchPageProps) {
  const query = searchParams.q || ""

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            {query ? `Search Results for "${query}"` : "Search"}
          </h1>
          {query && (
            <p className="text-muted-foreground text-lg">
              Showing results for movies and TV series matching your search.
            </p>
          )}
        </div>

        <Suspense fallback={<div className="text-center py-8">Loading results...</div>}>
          <SearchResults query={query} />
        </Suspense>
      </div>
    </div>
  )
}
