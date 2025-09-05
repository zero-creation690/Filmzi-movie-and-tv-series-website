"use client"

import Image from "next/image"
import Link from "next/link"
import { Star, Download, Play, Calendar, Globe, ArrowLeft, Tv } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useState } from "react"

interface CastMember {
  name: string
  character: string
  image: string
}

interface Episode {
  episode_number: number
  episode_name: string
  download_720p?: {
    url: string
    file_type: string
  }
  download_1080p?: {
    url: string
    file_type: string
  }
  video_720p?: string
  video_1080p?: string
}

interface Season {
  season_number: number
  total_episodes: number
  episodes: Episode[]
}

interface TVSeries {
  id: number
  title: string
  description: string
  thumbnail: string
  rating: string
  release_date: string
  genres: string[]
  language: string
  cast_members: CastMember[]
  total_seasons: number
  seasons: {
    [key: string]: Season
  }
}

interface TVSeriesDetailsProps {
  tvSeries: TVSeries
}

export function TVSeriesDetails({ tvSeries }: TVSeriesDetailsProps) {
  const [selectedSeason, setSelectedSeason] = useState("season_1")

  const seasonKeys = Object.keys(tvSeries.seasons || {}).sort()
  const currentSeason = tvSeries.seasons?.[selectedSeason]

  return (
    <div className="min-h-screen bg-background">
      {/* Back Button */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <Button variant="ghost" asChild className="mb-6">
          <Link href="/tv-series">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to TV Series
          </Link>
        </Button>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* TV Series Poster */}
          <div className="lg:col-span-1">
            <Card className="bg-card border-border">
              <CardContent className="p-0">
                <div className="aspect-[2/3] relative overflow-hidden rounded-lg">
                  <Image
                    src={tvSeries.thumbnail || "/placeholder.svg"}
                    alt={tvSeries.title}
                    fill
                    className="object-cover"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* TV Series Info */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <Badge className="bg-primary/20 text-primary">
                  <Tv className="w-3 h-3 mr-1" />
                  TV Series
                </Badge>
              </div>

              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 text-balance">{tvSeries.title}</h1>

              <div className="flex flex-wrap items-center gap-4 mb-6">
                <div className="flex items-center space-x-1">
                  <Star className="w-5 h-5 text-yellow-400 fill-current" />
                  <span className="text-foreground font-medium">{tvSeries.rating}</span>
                </div>

                <div className="flex items-center space-x-1 text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(tvSeries.release_date).getFullYear()}</span>
                </div>

                <div className="flex items-center space-x-1 text-muted-foreground">
                  <Globe className="w-4 h-4" />
                  <span>{tvSeries.language}</span>
                </div>

                <Badge variant="outline" className="border-primary text-primary">
                  {tvSeries.total_seasons} Season{tvSeries.total_seasons !== 1 ? "s" : ""}
                </Badge>
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                {tvSeries.genres.map((genre) => (
                  <Badge key={genre} variant="secondary" className="bg-primary/20 text-primary">
                    {genre}
                  </Badge>
                ))}
              </div>

              <p className="text-lg text-muted-foreground leading-relaxed text-pretty mb-8">{tvSeries.description}</p>
            </div>

            {/* Seasons and Episodes */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-foreground">Seasons & Episodes</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs value={selectedSeason} onValueChange={setSelectedSeason}>
                  <TabsList className="grid w-full grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 bg-muted">
                    {seasonKeys.map((seasonKey) => {
                      const season = tvSeries.seasons[seasonKey]
                      return (
                        <TabsTrigger
                          key={seasonKey}
                          value={seasonKey}
                          className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                        >
                          Season {season.season_number}
                        </TabsTrigger>
                      )
                    })}
                  </TabsList>

                  {seasonKeys.map((seasonKey) => {
                    const season = tvSeries.seasons[seasonKey]
                    return (
                      <TabsContent key={seasonKey} value={seasonKey} className="mt-6">
                        <div className="space-y-4">
                          {season.episodes.map((episode) => (
                            <div key={episode.episode_number} className="p-4 bg-muted rounded-lg">
                              <div className="flex items-center justify-between mb-3">
                                <h4 className="font-medium text-foreground">
                                  Episode {episode.episode_number}: {episode.episode_name}
                                </h4>
                              </div>

                              <div className="flex flex-wrap gap-2">
                                {episode.video_720p && (
                                  <Button asChild size="sm" className="bg-primary hover:bg-primary/90">
                                    <Link
                                      href={`/watch/${tvSeries.id}?episode=${episode.episode_number}&season=${season.season_number}&quality=720p`}
                                    >
                                      <Play className="w-4 h-4 mr-2" />
                                      Watch 720p
                                    </Link>
                                  </Button>
                                )}

                                {episode.video_1080p && (
                                  <Button asChild size="sm" className="bg-primary hover:bg-primary/90">
                                    <Link
                                      href={`/watch/${tvSeries.id}?episode=${episode.episode_number}&season=${season.season_number}&quality=1080p`}
                                    >
                                      <Play className="w-4 h-4 mr-2" />
                                      Watch 1080p
                                    </Link>
                                  </Button>
                                )}

                                {episode.download_720p && (
                                  <Button
                                    asChild
                                    variant="outline"
                                    size="sm"
                                    className="border-primary text-primary hover:bg-primary/10 bg-transparent"
                                  >
                                    <Link href={episode.download_720p.url} target="_blank">
                                      <Download className="w-4 h-4 mr-2" />
                                      Download 720p
                                    </Link>
                                  </Button>
                                )}

                                {episode.download_1080p && (
                                  <Button
                                    asChild
                                    variant="outline"
                                    size="sm"
                                    className="border-primary text-primary hover:bg-primary/10 bg-transparent"
                                  >
                                    <Link href={episode.download_1080p.url} target="_blank">
                                      <Download className="w-4 h-4 mr-2" />
                                      Download 1080p
                                    </Link>
                                  </Button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </TabsContent>
                    )
                  })}
                </Tabs>
              </CardContent>
            </Card>

            {/* Cast */}
            {tvSeries.cast_members && tvSeries.cast_members.length > 0 && (
              <Card className="bg-card border-border">
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold text-foreground mb-4">Cast</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {tvSeries.cast_members.slice(0, 8).map((cast, index) => (
                      <div key={index} className="text-center">
                        <div className="aspect-square relative overflow-hidden rounded-lg mb-2">
                          <Image src={cast.image || "/placeholder.svg"} alt={cast.name} fill className="object-cover" />
                        </div>
                        <h4 className="font-medium text-foreground text-sm mb-1">{cast.name}</h4>
                        {cast.character && <p className="text-muted-foreground text-xs">{cast.character}</p>}
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
