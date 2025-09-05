import { TVSeriesGrid } from "@/components/tv-series-grid"

export const metadata = {
  title: "TV Series - Filmzi",
  description: "Browse and download the latest TV series in HD quality",
}

export default function TVSeriesPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">TV Series</h1>
          <p className="text-muted-foreground text-lg">
            Discover the latest and most popular TV series available for streaming and download.
          </p>
        </div>
        <TVSeriesGrid />
      </div>
    </div>
  )
}
