import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Film } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-6 max-w-md mx-auto px-4">
        <div className="flex justify-center">
          <Film className="w-16 h-16 text-primary" />
        </div>

        <h1 className="text-4xl font-bold text-foreground">404</h1>

        <h2 className="text-xl font-semibold text-foreground">Movie Not Found</h2>

        <p className="text-muted-foreground">The movie you're looking for doesn't exist or has been removed.</p>

        <Button asChild className="bg-primary hover:bg-primary/90">
          <Link href="/">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
        </Button>
      </div>
    </div>
  )
}
