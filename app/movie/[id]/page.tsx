import { MovieDetails } from "@/components/movie-details"
import { notFound } from "next/navigation"

interface MoviePageProps {
  params: {
    id: string
  }
}

async function getMovie(id: string) {
  try {
    const response = await fetch(`https://databaseuisk-three.vercel.app/api/media/${id}`, {
      cache: "no-store", // Always fetch fresh data
    })

    if (!response.ok) {
      return null
    }

    return await response.json()
  } catch (error) {
    console.error("Error fetching movie:", error)
    return null
  }
}

export default async function MoviePage({ params }: MoviePageProps) {
  const movie = await getMovie(params.id)

  if (!movie || movie.type !== "movie") {
    notFound()
  }

  return <MovieDetails movie={movie} />
}

export async function generateMetadata({ params }: MoviePageProps) {
  const movie = await getMovie(params.id)

  if (!movie) {
    return {
      title: "Movie Not Found - Filmzi",
    }
  }

  return {
    title: `${movie.title} - Filmzi`,
    description: movie.description,
    openGraph: {
      title: movie.title,
      description: movie.description,
      images: [movie.thumbnail],
    },
  }
}
