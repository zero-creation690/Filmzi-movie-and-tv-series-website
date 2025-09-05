"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Globe } from "lucide-react"

interface LanguageData {
  name: string
  count: number
}

export function LanguageGrid() {
  const [languages, setLanguages] = useState<LanguageData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        const response = await fetch("https://databaseuisk-three.vercel.app/api/media")
        const data = await response.json()

        // Extract and count languages
        const languageCount: { [key: string]: number } = {}
        data.forEach((item: any) => {
          const lang = item.language || "Unknown"
          languageCount[lang] = (languageCount[lang] || 0) + 1
        })

        // Convert to array and sort by count
        const languageArray = Object.entries(languageCount)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count)

        setLanguages(languageArray)
        setLoading(false)
      } catch (error) {
        console.error("Error fetching languages:", error)
        setLoading(false)
      }
    }

    fetchLanguages()
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="aspect-[3/2] bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {languages.map((language) => (
        <Link key={language.name} href={`/languages/${encodeURIComponent(language.name)}`}>
          <Card className="group bg-card border-border hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-primary/20 rounded-full flex items-center justify-center">
                  <Globe className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">{language.name}</h3>
                <Badge className="bg-primary/90 text-primary-foreground">
                  {language.count} {language.count === 1 ? "Title" : "Titles"}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}
