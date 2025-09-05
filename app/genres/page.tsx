import { GenreGrid } from "@/components/genre-grid"

export const metadata = {
  title: "Genres - Filmzi",
  description: "Browse movies and TV series by genre",
}

export default function GenresPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">Browse by Genre</h1>
          <p className="text-muted-foreground text-lg">
            Discover movies and TV series organized by your favorite genres.
          </p>
        </div>
        <GenreGrid />
      </div>
    </div>
  )
}
