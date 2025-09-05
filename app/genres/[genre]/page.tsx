import { GenreContent } from "@/components/genre-content"

interface GenrePageProps {
  params: {
    genre: string
  }
}

export default function GenrePage({ params }: GenrePageProps) {
  const decodedGenre = decodeURIComponent(params.genre)

  return <GenreContent genre={decodedGenre} />
}

export function generateMetadata({ params }: GenrePageProps) {
  const decodedGenre = decodeURIComponent(params.genre)

  return {
    title: `${decodedGenre} - Filmzi`,
    description: `Browse ${decodedGenre} movies and TV series`,
  }
}
