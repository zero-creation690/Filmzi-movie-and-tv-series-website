import { WatchPlayer } from "@/components/watch-player"
import type { Metadata } from "next"

interface WatchPageProps {
  params: {
    id: string
  }
  searchParams: {
    quality?: string
    episode?: string
    season?: string
  }
}

export const metadata: Metadata = {
  title: "Watch Movie - Filmzi",
  description: "Stream movies in high quality on Filmzi",
}

export default function WatchPage({ params, searchParams }: WatchPageProps) {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-6xl mx-auto">
        <WatchPlayer
          movieId={params.id}
          preferredQuality={searchParams.quality}
          episode={searchParams.episode}
          season={searchParams.season}
        />
      </div>
    </div>
  )
}
