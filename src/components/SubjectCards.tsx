"use client";

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { 
  Play, 
  Trophy, 
  Star, 
  BookOpen, 
  TrendingUp, 
  Clock, 
  Target,
  Wifi,
  WifiOff,
  RefreshCw,
  Award
} from 'lucide-react';

interface Subject {
  id: number;
  name: string;
  slug: string;
  description: string;
  icon: string;
  createdAt: string;
  updatedAt: string;
}

interface SubjectProgress {
  questionsAnswered: number;
  correctAnswers: number;
  bestScore: number;
  xpEarned: number;
  coinsEarned: number;
  completionRate: number;
  lastAttempt?: string;
}

interface SubjectWithProgress extends Subject {
  progress: SubjectProgress;
  isCompleted: boolean;
  questionCount: number;
}

const CACHE_KEY = 'subjects_cache_v2';
const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes

export const SubjectCards = () => {
  const [subjects, setSubjects] = useState<SubjectWithProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [retrying, setRetrying] = useState(false);
  const router = useRouter();

  // Check online status
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Get cached data
  const getCachedData = useCallback(() => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_EXPIRY) {
          return data;
        }
      }
    } catch (error) {
      console.error('Error reading cache:', error);
    }
    return null;
  }, []);

  // Cache data
  const setCachedData = useCallback((data: SubjectWithProgress[]) => {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({
        data,
        timestamp: Date.now()
      }));
    } catch (error) {
      console.error('Error caching data:', error);
    }
  }, []);

  // Fetch subjects from API
  const fetchSubjects = useCallback(async () => {
    try {
      const token = localStorage.getItem('bearer_token');
      
      // Fetch subjects
      const subjectsResponse = await fetch('/api/subjects?limit=6', {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      });

      if (!subjectsResponse.ok) {
        throw new Error('Failed to fetch subjects');
      }

      const subjectsData: Subject[] = await subjectsResponse.json();

      // Fetch progress data for authenticated users
      let progressData: any[] = [];
      if (token) {
        try {
          const progressResponse = await fetch('/api/quiz-attempts?limit=100', {
            headers: { 'Authorization': `Bearer ${token}` },
          });
          
          if (progressResponse.ok) {
            progressData = await progressResponse.json();
          }
        } catch (error) {
          console.warn('Could not fetch progress data:', error);
        }
      }

      // Combine subjects with progress data
      const subjectsWithProgress: SubjectWithProgress[] = await Promise.all(
        subjectsData.map(async (subject) => {
          // Get question count for this subject
          let questionCount = 0;
          try {
            const questionsResponse = await fetch(`/api/questions?subject_id=${subject.id}&limit=1`);
            if (questionsResponse.ok) {
              const questionsData = await questionsResponse.json();
              questionCount = questionsData.length || 12; // Default to 12 if we can't get the exact count
            }
          } catch (error) {
            questionCount = 12; // Default fallback
          }

          // Calculate progress for this subject
          const subjectAttempts = progressData.filter(attempt => attempt.subjectId === subject.id);
          
          const questionsAnswered = subjectAttempts.reduce((sum, attempt) => sum + (attempt.questionsAnswered || 0), 0);
          const correctAnswers = subjectAttempts.reduce((sum, attempt) => sum + (attempt.correctAnswers || 0), 0);
          const xpEarned = subjectAttempts.reduce((sum, attempt) => sum + (attempt.xpEarned || 0), 0);
          const coinsEarned = subjectAttempts.reduce((sum, attempt) => sum + (attempt.coinsEarned || 0), 0);
          const bestScore = subjectAttempts.length > 0 ? Math.max(...subjectAttempts.map(a => a.scorePercentage || 0)) : 0;
          const completionRate = questionsAnswered > 0 ? Math.round((correctAnswers / questionsAnswered) * 100) : 0;
          const lastAttempt = subjectAttempts.length > 0 ? 
            subjectAttempts.sort((a, b) => new Date(b.completedAt || b.createdAt).getTime() - new Date(a.completedAt || a.createdAt).getTime())[0].completedAt : 
            undefined;

          const progress: SubjectProgress = {
            questionsAnswered,
            correctAnswers,
            bestScore,
            xpEarned,
            coinsEarned,
            completionRate,
            lastAttempt,
          };

          return {
            ...subject,
            progress,
            isCompleted: bestScore >= 80 && questionsAnswered >= 5,
            questionCount,
          };
        })
      );

      return subjectsWithProgress;
    } catch (error) {
      console.error('Error fetching subjects:', error);
      throw error;
    }
  }, []);

  // Load subjects data
  const loadSubjects = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Try to use cached data first
      const cachedData = getCachedData();
      if (cachedData && isOffline) {
        setSubjects(cachedData);
        setLoading(false);
        return;
      }

      // Fetch fresh data
      const data = await fetchSubjects();
      setSubjects(data);
      setCachedData(data);
    } catch (error) {
      console.error('Error loading subjects:', error);
      
      // Try to fall back to cached data
      const cachedData = getCachedData();
      if (cachedData) {
        setSubjects(cachedData);
        toast.warning('Using cached data - some information may be outdated');
      } else {
        setError('Failed to load subjects. Please check your connection and try again.');
        toast.error('Failed to load subjects');
      }
    } finally {
      setLoading(false);
    }
  }, [getCachedData, setCachedData, fetchSubjects, isOffline]);

  // Retry loading
  const handleRetry = useCallback(async () => {
    setRetrying(true);
    await loadSubjects();
    setRetrying(false);
  }, [loadSubjects]);

  // Initial load
  useEffect(() => {
    loadSubjects();
  }, [loadSubjects]);

  // Handle subject click
  const handleSubjectClick = useCallback((subject: SubjectWithProgress) => {
    router.push(`/quiz/${subject.slug}`);
  }, [router]);

  // Get difficulty color
  const getDifficultyColor = useCallback((completionRate: number) => {
    if (completionRate >= 80) return 'bg-green-500';
    if (completionRate >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  }, []);

  // Get progress color
  const getProgressColor = useCallback((progress: number) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 50) return 'bg-blue-500';
    return 'bg-gray-400';
  }, []);

  // Format time ago
  const formatTimeAgo = useCallback((dateString?: string) => {
    if (!dateString) return 'Never';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    const diffInWeeks = Math.floor(diffInDays / 7);
    return `${diffInWeeks}w ago`;
  }, []);

  if (loading) {
    return (
      <div className="w-full">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card key={index} className="relative overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-8 w-8 rounded" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-4 w-full" />
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-8" />
                  </div>
                  <Skeleton className="h-2 w-full rounded-full" />
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex gap-4">
                    <div className="text-center">
                      <Skeleton className="h-4 w-8 mx-auto mb-1" />
                      <Skeleton className="h-3 w-6 mx-auto" />
                    </div>
                    <div className="text-center">
                      <Skeleton className="h-4 w-8 mx-auto mb-1" />
                      <Skeleton className="h-3 w-6 mx-auto" />
                    </div>
                  </div>
                  <Skeleton className="h-9 w-20 rounded-md" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full">
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-4 p-3 rounded-full bg-destructive/10">
              <WifiOff className="h-8 w-8 text-destructive" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Unable to Load Subjects</h3>
            <p className="text-muted-foreground mb-6 max-w-md">
              {error}
            </p>
            <Button
              onClick={handleRetry}
              disabled={retrying}
              className="min-w-32"
            >
              {retrying ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Retrying...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Offline indicator */}
      {isOffline && (
        <div className="mb-4 p-3 rounded-lg bg-yellow-50 border border-yellow-200 flex items-center gap-2 text-yellow-800">
          <WifiOff className="h-4 w-4" />
          <span className="text-sm">You're offline. Showing cached data.</span>
        </div>
      )}

      {/* Subjects grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {subjects.map((subject) => (
          <Card 
            key={subject.id}
            className="relative overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group border-0 shadow-md hover:shadow-xl hover:-translate-y-1"
            onClick={() => handleSubjectClick(subject)}
            role="button"
            tabIndex={0}
            aria-label={`Start ${subject.name} quiz`}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleSubjectClick(subject);
              }
            }}
          >
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-background to-muted/50" />
            
            {/* Completed badge */}
            {subject.isCompleted && (
              <div className="absolute top-2 right-2 z-10">
                <Badge variant="default" className="bg-green-500 hover:bg-green-600 text-white">
                  <Trophy className="h-3 w-3 mr-1" />
                  Mastered
                </Badge>
              </div>
            )}

            <CardHeader className="relative pb-3">
              <div className="flex items-center justify-between">
                <div className="text-2xl bg-muted/50 p-2 rounded-lg">
                  {subject.icon}
                </div>
                {!subject.isCompleted && subject.progress.bestScore > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    Best: {subject.progress.bestScore}%
                  </Badge>
                )}
              </div>
              
              <CardTitle className="text-base font-bold leading-tight group-hover:text-primary transition-colors">
                {subject.name}
              </CardTitle>
              
              <CardDescription className="text-xs leading-relaxed line-clamp-2">
                {subject.description}
              </CardDescription>
            </CardHeader>

            <CardContent className="relative space-y-4">
              {/* Progress section */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-medium text-muted-foreground">
                    Progress
                  </span>
                  <span className="text-xs font-bold">
                    {subject.progress.completionRate}%
                  </span>
                </div>
                <Progress 
                  value={subject.progress.completionRate} 
                  className="h-2"
                  aria-label={`${subject.name} progress: ${subject.progress.completionRate}%`}
                />
              </div>

              {/* Stats and action */}
              <div className="flex justify-between items-center">
                <div className="flex gap-4">
                  <div className="text-center">
                    <div className="flex items-center gap-1 text-xs font-bold text-orange-600">
                      <Star className="h-3 w-3" />
                      {subject.progress.xpEarned}
                    </div>
                    <div className="text-xs text-muted-foreground">XP</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center gap-1 text-xs font-bold text-yellow-600">
                      <Award className="h-3 w-3" />
                      {subject.progress.coinsEarned}
                    </div>
                    <div className="text-xs text-muted-foreground">Coins</div>
                  </div>
                </div>

                <Button 
                  size="sm" 
                  className="min-w-20 text-xs font-semibold shadow-sm"
                  aria-label={`Start ${subject.name} quiz`}
                >
                  <Play className="h-3 w-3 mr-1" />
                  {subject.progress.questionsAnswered > 0 ? 'Continue' : 'Start'}
                </Button>
              </div>

              {/* Additional stats */}
              {subject.progress.questionsAnswered > 0 && (
                <div className="pt-2 border-t border-muted/50">
                  <div className="flex justify-between items-center text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <BookOpen className="h-3 w-3" />
                      {subject.progress.questionsAnswered} answered
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatTimeAgo(subject.progress.lastAttempt)}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>

            {/* Hover overlay */}
            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </Card>
        ))}
      </div>

      {/* Empty state */}
      {subjects.length === 0 && !loading && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-4 p-3 rounded-full bg-muted">
              <BookOpen className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No Subjects Available</h3>
            <p className="text-muted-foreground mb-6 max-w-md">
              Subjects will appear here once they're added to the system.
            </p>
            <Button onClick={handleRetry} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Connection status */}
      <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
        {isOffline ? (
          <>
            <WifiOff className="h-3 w-3" />
            Offline Mode
          </>
        ) : (
          <>
            <Wifi className="h-3 w-3" />
            Connected
          </>
        )}
      </div>
    </div>
  );
};