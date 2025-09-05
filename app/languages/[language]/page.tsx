import { LanguageContent } from "@/components/language-content"

interface LanguagePageProps {
  params: {
    language: string
  }
}

export default function LanguagePage({ params }: LanguagePageProps) {
  const decodedLanguage = decodeURIComponent(params.language)

  return <LanguageContent language={decodedLanguage} />
}

export function generateMetadata({ params }: LanguagePageProps) {
  const decodedLanguage = decodeURIComponent(params.language)

  return {
    title: `${decodedLanguage} Content - Filmzi`,
    description: `Browse ${decodedLanguage} movies and TV series`,
  }
}
