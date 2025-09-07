import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { subjects, questions, quizAttempts, userProgress, user } from '@/db/schema';
import { eq, count, avg, sum, desc, sql, and, gte } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    // Get current date for today's activity
    const today = new Date().toISOString().split('T')[0];
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // 1. Total Students Count
    const totalStudentsResult = await db
      .select({ count: count() })
      .from(user);
    const totalStudents = totalStudentsResult[0]?.count || 0;

    // 2. Active Today Count
    const activeTodayResult = await db
      .select({ count: count() })
      .from(userProgress)
      .where(eq(userProgress.lastActivityDate, today));
    const activeToday = activeTodayResult[0]?.count || 0;

    // 3. Completion Rates by Subject
    const completionRatesQuery = await db
      .select({
        subjectId: subjects.id,
        subjectName: subjects.name,
        completedStudents: count(sql`DISTINCT ${quizAttempts.userId}`),
      })
      .from(subjects)
      .leftJoin(quizAttempts, eq(subjects.id, quizAttempts.subjectId))
      .groupBy(subjects.id, subjects.name);

    const completionRates = completionRatesQuery.map(item => ({
      subjectId: item.subjectId,
      subjectName: item.subjectName,
      completedStudents: item.completedStudents || 0,
      totalStudents,
      completionRate: totalStudents > 0 ? Math.round((item.completedStudents / totalStudents) * 100) : 0
    }));

    // 4. Average Scores by Subject
    const averageScoresQuery = await db
      .select({
        subjectId: subjects.id,
        subjectName: subjects.name,
        averageScore: avg(quizAttempts.scorePercentage),
        totalQuizzes: count(quizAttempts.id),
        totalStudents: count(sql`DISTINCT ${quizAttempts.userId}`),
      })
      .from(subjects)
      .leftJoin(quizAttempts, eq(subjects.id, quizAttempts.subjectId))
      .groupBy(subjects.id, subjects.name);

    const averageScores = averageScoresQuery.map(item => ({
      subjectId: item.subjectId,
      subjectName: item.subjectName,
      averageScore: Math.round(Number(item.averageScore) || 0),
      totalQuizzes: item.totalQuizzes || 0,
      totalStudents: item.totalStudents || 0
    }));

    // 5. Top Performers
    const topPerformersQuery = await db
      .select({
        userId: userProgress.userId,
        name: user.name,
        xp: userProgress.xp,
        averageScore: avg(quizAttempts.scorePercentage),
      })
      .from(userProgress)
      .innerJoin(user, eq(userProgress.userId, user.id))
      .leftJoin(quizAttempts, eq(userProgress.userId, quizAttempts.userId))
      .groupBy(userProgress.userId, user.name, userProgress.xp)
      .orderBy(desc(userProgress.xp))
      .limit(10);

    const topPerformers = topPerformersQuery.map(item => ({
      userId: item.userId,
      name: item.name,
      xp: item.xp || 0,
      averageScore: Math.round(Number(item.averageScore) || 0)
    }));

    // 6. Subject Popularity
    const subjectPopularityQuery = await db
      .select({
        subjectId: subjects.id,
        subjectName: subjects.name,
        quizCount: count(quizAttempts.id),
        uniqueStudents: count(sql`DISTINCT ${quizAttempts.userId}`),
      })
      .from(subjects)
      .leftJoin(quizAttempts, eq(subjects.id, quizAttempts.subjectId))
      .groupBy(subjects.id, subjects.name)
      .orderBy(desc(count(quizAttempts.id)));

    const subjectPopularity = subjectPopularityQuery.map(item => ({
      subjectId: item.subjectId,
      subjectName: item.subjectName,
      quizCount: item.quizCount || 0,
      uniqueStudents: item.uniqueStudents || 0
    }));

    // 7. Weekly Activity (simplified - using quiz completion dates)
    const weeklyActivityQuery = await db
      .select({
        date: sql`DATE(${quizAttempts.completedAt})`.as('date'),
        activeStudents: count(sql`DISTINCT ${quizAttempts.userId}`),
        quizzesCompleted: count(quizAttempts.id),
      })
      .from(quizAttempts)
      .where(gte(sql`DATE(${quizAttempts.completedAt})`, sevenDaysAgo))
      .groupBy(sql`DATE(${quizAttempts.completedAt})`)
      .orderBy(sql`DATE(${quizAttempts.completedAt})`);

    // Fill missing days with zeros
    const weeklyActivity = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const dayData = weeklyActivityQuery.find(item => item.date === date);
      weeklyActivity.push({
        date,
        activeStudents: dayData?.activeStudents || 0,
        quizzesCompleted: dayData?.quizzesCompleted || 0
      });
    }

    // 8. Level Distribution
    const levelDistributionQuery = await db
      .select({
        level: userProgress.level,
        count: count(),
      })
      .from(userProgress)
      .groupBy(userProgress.level);

    const levelDistribution = {
      beginner: 0,
      intermediate: 0,
      advanced: 0
    };

    levelDistributionQuery.forEach(item => {
      const level = item.level || 1;
      if (level <= 2) {
        levelDistribution.beginner += item.count;
      } else if (level <= 5) {
        levelDistribution.intermediate += item.count;
      } else {
        levelDistribution.advanced += item.count;
      }
    });

    // 9. Total Quizzes
    const totalQuizzesResult = await db
      .select({ count: count() })
      .from(quizAttempts);
    const totalQuizzes = totalQuizzesResult[0]?.count || 0;

    // 10. Average Session Time
    const averageSessionTimeResult = await db
      .select({ average: avg(quizAttempts.timeTakenSeconds) })
      .from(quizAttempts)
      .where(sql`${quizAttempts.timeTakenSeconds} IS NOT NULL`);
    const averageSessionTime = Math.round(Number(averageSessionTimeResult[0]?.average) || 0);

    // 11. Streak Leaders
    const streakLeadersQuery = await db
      .select({
        userId: userProgress.userId,
        name: user.name,
        currentStreak: userProgress.currentStreak,
        longestStreak: userProgress.longestStreak,
      })
      .from(userProgress)
      .innerJoin(user, eq(userProgress.userId, user.id))
      .orderBy(desc(userProgress.currentStreak), desc(userProgress.longestStreak))
      .limit(10);

    const streakLeaders = streakLeadersQuery.map(item => ({
      userId: item.userId,
      name: item.name,
      currentStreak: item.currentStreak || 0,
      longestStreak: item.longestStreak || 0
    }));

    // Return comprehensive analytics
    return NextResponse.json({
      completionRates,
      averageScores,
      totalStudents,
      activeToday,
      topPerformers,
      subjectPopularity,
      weeklyActivity,
      levelDistribution,
      totalQuizzes,
      averageSessionTime,
      streakLeaders
    }, { status: 200 });

  } catch (error) {
    console.error('GET analytics error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}