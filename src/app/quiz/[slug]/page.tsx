"use client";

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { QuizInterface } from '@/components/QuizInterface'
import LoadingSkeleton from '@/components/LoadingSkeleton'
import { ErrorFallback } from '@/components/ErrorFallback'

const VALID_SUBJECTS = [
  'mathematics',
  'advanced-mathematics', 
  'physics',
  'chemistry',
  'biology',
  'computer-science'
]

interface SubjectQuizPageProps {
  params: {
    slug: string
  }
}

export default function SubjectQuizPage({ params }: SubjectQuizPageProps) {
  const { slug: subjectSlug } = params
  const router = useRouter()
  const [subject, setSubject] = useState<any>(null)
  const [questions, setQuestions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Validate subject slug
    if (!VALID_SUBJECTS.includes(subjectSlug)) {
      router.push('/404')
      return
    }

    async function fetchData() {
      try {
        setLoading(true)
        setError(null)

        // Fetch subjects
        const subjectsResponse = await fetch('/api/subjects')
        if (!subjectsResponse.ok) {
          throw new Error('Failed to fetch subjects')
        }
        
        const subjects = await subjectsResponse.json()
        const foundSubject = subjects.find((s: any) => s.slug === subjectSlug)
        
        if (!foundSubject) {
          router.push('/404')
          return
        }
        
        setSubject(foundSubject)

        // Fetch questions for the subject
        const questionsResponse = await fetch(`/api/questions?subject_id=${foundSubject.id}`)
        if (!questionsResponse.ok) {
          throw new Error('Failed to fetch questions')
        }
        
        const questionsData = await questionsResponse.json()
        setQuestions(questionsData || [])
        
      } catch (err) {
        console.error('Error fetching data:', err)
        setError('Failed to load quiz data. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [subjectSlug, router])

  if (loading) {
    return <LoadingSkeleton />
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="container max-w-4xl mx-auto">
          <ErrorFallback 
            title="Something went wrong"
            message={error}
          />
        </div>
      </div>
    )
  }

  if (!subject) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="container max-w-4xl mx-auto">
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-6 text-4xl">❌</div>
            <h1 className="text-2xl font-display font-bold text-foreground mb-4">
              Subject Not Found
            </h1>
            <p className="text-muted-foreground mb-8">
              The requested subject could not be found.
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="container max-w-4xl mx-auto">
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-6 text-4xl">📚</div>
            <h1 className="text-2xl font-display font-bold text-foreground mb-4">
              No Questions Available
            </h1>
            <p className="text-muted-foreground mb-8">
              Questions for {subject.name} are coming soon. Check back later!
            </p>
            <div className="bg-card border border-border rounded-lg p-6">
              <h2 className="font-display font-semibold text-lg mb-2">
                {subject.name}
              </h2>
              <p className="text-muted-foreground text-sm">
                {subject.description}
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <QuizInterface 
        subject={subject}
        questions={questions}
        userSession={null}
      />
    </div>
  )
}