import { TVSeriesDetails } from "@/components/tv-series-details"
import { notFound } from "next/navigation"

interface TVSeriesPageProps {
  params: {
    id: string
  }
}

async function getTVSeries(id: string) {
  try {
    const response = await fetch(`https://databaseuisk-three.vercel.app/api/media/${id}`, {
      cache: "no-store",
    })

    if (!response.ok) {
      return null
    }

    return await response.json()
  } catch (error) {
    console.error("Error fetching TV series:", error)
    return null
  }
}

export default async function TVSeriesPage({ params }: TVSeriesPageProps) {
  const tvSeries = await getTVSeries(params.id)

  if (
    !tvSeries ||
    (tvSeries.type !== "tv" &&
      !tvSeries.genres?.some(
        (genre: string) => genre.toLowerCase().includes("animation") || genre.toLowerCase().includes("anime"),
      ))
  ) {
    notFound()
  }

  return <TVSeriesDetails tvSeries={tvSeries} />
}

export async function generateMetadata({ params }: TVSeriesPageProps) {
  const tvSeries = await getTVSeries(params.id)

  if (!tvSeries) {
    return {
      title: "TV Series Not Found - Filmzi",
    }
  }

  return {
    title: `${tvSeries.title} - Filmzi`,
    description: tvSeries.description,
    openGraph: {
      title: tvSeries.title,
      description: tvSeries.description,
      images: [tvSeries.thumbnail],
    },
  }
}
