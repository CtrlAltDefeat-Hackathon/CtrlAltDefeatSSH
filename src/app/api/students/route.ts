import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { user, userProgress, quizAttempts, userBadges, subjects } from '@/db/schema';
import { eq, desc, sql, count, avg, max, sum } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    // Get all users with their progress data
    const usersWithProgress = await db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.image,
        level: userProgress.level,
        xp: userProgress.xp,
        coins: userProgress.coins,
        streak: userProgress.currentStreak,
        lastActive: userProgress.lastActivityDate,
      })
      .from(user)
      .leftJoin(userProgress, eq(user.id, userProgress.userId))
      .orderBy(desc(userProgress.xp));

    // Get all subjects for reference
    const allSubjects = await db.select().from(subjects);

    // Get quiz attempts data for all users
    const quizAttemptsData = await db
      .select({
        userId: quizAttempts.userId,
        subjectId: quizAttempts.subjectId,
        subjectName: subjects.name,
        scorePercentage: quizAttempts.scorePercentage,
        timeTakenSeconds: quizAttempts.timeTakenSeconds,
        completedAt: quizAttempts.completedAt,
      })
      .from(quizAttempts)
      .leftJoin(subjects, eq(quizAttempts.subjectId, subjects.id));

    // Get badge counts for all users
    const badgeCounts = await db
      .select({
        userId: userBadges.userId,
        badgeCount: count(userBadges.id),
      })
      .from(userBadges)
      .groupBy(userBadges.userId);

    // Calculate subject statistics for each user
    const subjectStats = await db
      .select({
        userId: quizAttempts.userId,
        subjectId: quizAttempts.subjectId,
        subjectName: subjects.name,
        averageScore: avg(quizAttempts.scorePercentage),
        totalQuizzes: count(quizAttempts.id),
        bestScore: max(quizAttempts.scorePercentage),
      })
      .from(quizAttempts)
      .leftJoin(subjects, eq(quizAttempts.subjectId, subjects.id))
      .groupBy(quizAttempts.userId, quizAttempts.subjectId);

    // Calculate total time spent for each user
    const timeSpentData = await db
      .select({
        userId: quizAttempts.userId,
        totalTimeSpent: sum(quizAttempts.timeTakenSeconds),
      })
      .from(quizAttempts)
      .groupBy(quizAttempts.userId);

    // Helper function to determine class level
    const getClassLevel = (level: number | null): string => {
      if (!level) return 'Beginner';
      if (level >= 1 && level <= 2) return 'Beginner';
      if (level >= 3 && level <= 5) return 'Intermediate';
      return 'Advanced';
    };

    // Helper function to get recent quiz scores (last 10)
    const getRecentQuizScores = (userId: string) => {
      return quizAttemptsData
        .filter(attempt => attempt.userId === userId)
        .sort((a, b) => new Date(b.completedAt || '').getTime() - new Date(a.completedAt || '').getTime())
        .slice(0, 10)
        .map(attempt => ({
          score: attempt.scorePercentage || 0,
          date: attempt.completedAt || '',
          subject: attempt.subjectName || 'Unknown',
        }));
    };

    // Build the response data
    const studentsData = usersWithProgress.map((student, index) => {
      // Get badge count for this student
      const studentBadges = badgeCounts.find(bc => bc.userId === student.id);
      
      // Get subject statistics for this student
      const studentSubjects = subjectStats
        .filter(stat => stat.userId === student.id)
        .map(stat => ({
          subjectId: stat.subjectId || 0,
          subjectName: stat.subjectName || 'Unknown',
          averageScore: Math.round(Number(stat.averageScore) || 0),
          totalQuizzes: Number(stat.totalQuizzes) || 0,
          bestScore: Number(stat.bestScore) || 0,
        }));

      // Get total time spent for this student
      const studentTimeSpent = timeSpentData.find(ts => ts.userId === student.id);

      // Get recent quiz scores
      const recentScores = getRecentQuizScores(student.id);

      // Calculate leaderboard position (1-based ranking by XP)
      const leaderboardPosition = index + 1;

      return {
        id: student.id,
        name: student.name || 'Unknown Student',
        email: student.email,
        avatar: student.avatar || null,
        class: getClassLevel(student.level),
        level: student.level || 1,
        xp: student.xp || 0,
        coins: student.coins || 0,
        streak: student.streak || 0,
        lastActive: student.lastActive || null,
        subjects: studentSubjects,
        quizScores: recentScores,
        timeSpent: Number(studentTimeSpent?.totalTimeSpent) || 0,
        badges: Number(studentBadges?.badgeCount) || 0,
        leaderboardPosition,
      };
    });

    return NextResponse.json(studentsData, { status: 200 });

  } catch (error) {
    console.error('GET students error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}