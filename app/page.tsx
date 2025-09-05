import { HeroSection } from "@/components/hero-section"
import { LatestMovies } from "@/components/latest-movies"
import { LatestTvSeries } from "@/components/latest-tv-series"
import { LatestAnime } from "@/components/latest-anime"
import { Footer } from "@/components/footer"
import { SearchBar } from "@/components/search-bar"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="block md:hidden">
        <SearchBar />
      </div>
      <HeroSection />
      <LatestMovies />
      <LatestTvSeries />
      <LatestAnime />
      <Footer />
    </div>
  )
}
