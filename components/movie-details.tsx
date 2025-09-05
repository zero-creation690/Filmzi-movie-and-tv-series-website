"use client"

import Image from "next/image"
import Link from "next/link"
import { Star, Download, Play, Calendar, Globe, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"

interface CastMember {
  name: string
  character: string
  image: string
}

interface DownloadLink {
  url: string
  file_type: string
}

interface VideoLink {
  [key: string]: string
}

interface Movie {
  id: number
  title: string
  description: string
  thumbnail: string
  rating: string
  release_date: string
  genres: string[]
  language: string
  cast_members: CastMember[]
  download_links: {
    download_720p?: DownloadLink
    download_1080p?: DownloadLink
    download_2160p?: DownloadLink
  }
  video_links: {
    video_720p?: string
    video_1080p?: string
    video_2160p?: string
  }
}

interface MovieDetailsProps {
  movie: Movie
}

export function MovieDetails({ movie }: MovieDetailsProps) {
  const availableQualities = []

  if (movie.download_links?.download_720p) availableQualities.push("720p")
  if (movie.download_links?.download_1080p) availableQualities.push("1080p")
  if (movie.download_links?.download_2160p) availableQualities.push("2160p")

  return (
    <div className="min-h-screen bg-background">
      {/* Back Button */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <Button variant="ghost" asChild className="mb-6">
          <Link href="/">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
        </Button>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Movie Poster */}
          <div className="lg:col-span-1">
            <Card className="bg-card border-border">
              <CardContent className="p-0">
                <div className="aspect-[2/3] relative overflow-hidden rounded-lg">
                  <Image src={movie.thumbnail || "/placeholder.svg"} alt={movie.title} fill className="object-cover" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Movie Info */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 text-balance">
                {movie.title}
              </h1>

              <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-6">
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 fill-current" />
                  <span className="text-foreground font-medium text-sm sm:text-base">{movie.rating}</span>
                </div>

                <div className="flex items-center space-x-1 text-muted-foreground text-sm sm:text-base">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(movie.release_date).getFullYear()}</span>
                </div>

                <div className="flex items-center space-x-1 text-muted-foreground text-sm sm:text-base">
                  <Globe className="w-4 h-4" />
                  <span>{movie.language}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                {movie.genres.map((genre) => (
                  <Badge key={genre} variant="secondary" className="bg-primary/20 text-primary text-xs sm:text-sm">
                    {genre}
                  </Badge>
                ))}
              </div>

              <p className="text-sm sm:text-base lg:text-lg text-muted-foreground leading-relaxed text-pretty mb-8">
                {movie.description}
              </p>
            </div>

            {/* Quality Options */}
            <Card className="bg-card border-border">
              <CardContent className="p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-4">Available Qualities</h3>
                <div className="space-y-3 sm:space-y-4">
                  {availableQualities.map((quality) => {
                    const downloadLink =
                      movie.download_links[`download_${quality}` as keyof typeof movie.download_links]
                    const videoLink = movie.video_links[`video_${quality}` as keyof typeof movie.video_links]

                    return (
                      <div
                        key={quality}
                        className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 bg-muted rounded-lg gap-3 sm:gap-0"
                      >
                        <div className="flex items-center space-x-3">
                          <Badge className="bg-primary text-primary-foreground text-xs sm:text-sm">
                            {quality.toUpperCase()}
                          </Badge>
                          <span className="text-muted-foreground text-xs sm:text-sm">
                            {downloadLink?.file_type?.toUpperCase() || "WEBRIP"}
                          </span>
                        </div>

                        <div className="flex space-x-2">
                          {videoLink && (
                            <Button asChild size="sm" className="bg-primary hover:bg-primary/90 text-xs sm:text-sm">
                              <Link href={`/watch/${movie.id}?quality=${quality}`}>
                                <Play className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                                Watch
                              </Link>
                            </Button>
                          )}

                          {downloadLink && (
                            <Button
                              asChild
                              variant="outline"
                              size="sm"
                              className="border-primary text-primary hover:bg-primary/10 bg-transparent text-xs sm:text-sm"
                            >
                              <Link href={downloadLink.url} target="_blank">
                                <Download className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                                Download
                              </Link>
                            </Button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Cast */}
            {movie.cast_members && movie.cast_members.length > 0 && (
              <Card className="bg-card border-border">
                <CardContent className="p-4 sm:p-6">
                  <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-4">Cast</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                    {movie.cast_members.slice(0, 8).map((cast, index) => (
                      <div key={index} className="text-center">
                        <div className="aspect-square relative overflow-hidden rounded-lg mb-2">
                          <Image src={cast.image || "/placeholder.svg"} alt={cast.name} fill className="object-cover" />
                        </div>
                        <h4 className="font-medium text-foreground text-xs sm:text-sm mb-1 line-clamp-2">
                          {cast.name}
                        </h4>
                        {cast.character && (
                          <p className="text-muted-foreground text-xs line-clamp-1">{cast.character}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
