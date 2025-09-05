import { AnimeContent } from "@/components/anime-content"

export const metadata = {
  title: "Anime - Filmzi",
  description: "Browse and download the latest anime series",
}

export default function AnimePage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">Anime</h1>
          <p className="text-muted-foreground text-lg">
            Discover the latest and most popular anime series available for streaming and download.
          </p>
        </div>
        <AnimeContent />
      </div>
    </div>
  )
}
