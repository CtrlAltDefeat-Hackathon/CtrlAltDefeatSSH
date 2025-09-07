import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { quizAttempts, quizQuestionAttempts, subjects, questionOptions } from '@/db/schema';
import { eq, like, and, or, desc, asc } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const user_id = searchParams.get('user_id');
    const subject_id = searchParams.get('subject_id');
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort') || 'createdAt';
    const order = searchParams.get('order') || 'desc';
    const from_date = searchParams.get('from_date');
    const to_date = searchParams.get('to_date');

    // Get single quiz attempt with detailed results
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json({ 
          error: "Valid ID is required",
          code: "INVALID_ID" 
        }, { status: 400 });
      }

      const attempt = await db.select({
        id: quizAttempts.id,
        userId: quizAttempts.userId,
        subjectId: quizAttempts.subjectId,
        questionsAnswered: quizAttempts.questionsAnswered,
        correctAnswers: quizAttempts.correctAnswers,
        scorePercentage: quizAttempts.scorePercentage,
        xpEarned: quizAttempts.xpEarned,
        coinsEarned: quizAttempts.coinsEarned,
        timeTakenSeconds: quizAttempts.timeTakenSeconds,
        completedAt: quizAttempts.completedAt,
        createdAt: quizAttempts.createdAt,
        subjectName: subjects.name,
        subjectSlug: subjects.slug
      })
      .from(quizAttempts)
      .leftJoin(subjects, eq(quizAttempts.subjectId, subjects.id))
      .where(and(eq(quizAttempts.id, parseInt(id)), eq(quizAttempts.userId, user.id)))
      .limit(1);

      if (attempt.length === 0) {
        return NextResponse.json({ error: 'Quiz attempt not found' }, { status: 404 });
      }

      // Get detailed question attempts
      const questionAttempts = await db.select({
        id: quizQuestionAttempts.id,
        questionId: quizQuestionAttempts.questionId,
        selectedOptionId: quizQuestionAttempts.selectedOptionId,
        isCorrect: quizQuestionAttempts.isCorrect,
        timeTakenSeconds: quizQuestionAttempts.timeTakenSeconds
      })
      .from(quizQuestionAttempts)
      .where(eq(quizQuestionAttempts.quizAttemptId, parseInt(id)));

      return NextResponse.json({
        ...attempt[0],
        questionAttempts
      });
    }

    // Get paginated list of quiz attempts
    let query = db.select({
      id: quizAttempts.id,
      userId: quizAttempts.userId,
      subjectId: quizAttempts.subjectId,
      questionsAnswered: quizAttempts.questionsAnswered,
      correctAnswers: quizAttempts.correctAnswers,
      scorePercentage: quizAttempts.scorePercentage,
      xpEarned: quizAttempts.xpEarned,
      coinsEarned: quizAttempts.coinsEarned,
      timeTakenSeconds: quizAttempts.timeTakenSeconds,
      completedAt: quizAttempts.completedAt,
      createdAt: quizAttempts.createdAt,
      subjectName: subjects.name,
      subjectSlug: subjects.slug
    })
    .from(quizAttempts)
    .leftJoin(subjects, eq(quizAttempts.subjectId, subjects.id));

    // Always scope to authenticated user
    let whereConditions = [eq(quizAttempts.userId, user.id)];

    // Additional filters
    if (subject_id) {
      whereConditions.push(eq(quizAttempts.subjectId, parseInt(subject_id)));
    }

    if (from_date) {
      whereConditions.push(and(quizAttempts.createdAt >= from_date));
    }

    if (to_date) {
      whereConditions.push(and(quizAttempts.createdAt <= to_date));
    }

    if (search) {
      whereConditions.push(like(subjects.name, `%${search}%`));
    }

    query = query.where(and(...whereConditions));

    // Apply sorting
    const orderDirection = order === 'asc' ? asc : desc;
    if (sort === 'scorePercentage') {
      query = query.orderBy(orderDirection(quizAttempts.scorePercentage));
    } else if (sort === 'xpEarned') {
      query = query.orderBy(orderDirection(quizAttempts.xpEarned));
    } else if (sort === 'completedAt') {
      query = query.orderBy(orderDirection(quizAttempts.completedAt));
    } else {
      query = query.orderBy(orderDirection(quizAttempts.createdAt));
    }

    const results = await query.limit(limit).offset(offset);

    return NextResponse.json(results);

  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

    const requestBody = await request.json();
    const { subjectId, questions } = requestBody;

    // Security check: reject if userId provided in body
    if ('userId' in requestBody || 'user_id' in requestBody) {
      return NextResponse.json({ 
        error: "User ID cannot be provided in request body",
        code: "USER_ID_NOT_ALLOWED" 
      }, { status: 400 });
    }

    // Validation
    if (!subjectId) {
      return NextResponse.json({ 
        error: "Subject ID is required",
        code: "MISSING_REQUIRED_FIELD" 
      }, { status: 400 });
    }

    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json({ 
        error: "Questions array is required and cannot be empty",
        code: "MISSING_REQUIRED_FIELD" 
      }, { status: 400 });
    }

    // Validate each question
    for (const question of questions) {
      if (!question.questionId || !question.selectedOptionId || question.timeTakenSeconds === undefined) {
        return NextResponse.json({ 
          error: "Each question must have questionId, selectedOptionId, and timeTakenSeconds",
          code: "INVALID_QUESTION_FORMAT" 
        }, { status: 400 });
      }
    }

    // Calculate results by checking correct answers
    let correctAnswers = 0;
    const questionsAnswered = questions.length;
    let totalTimeTaken = 0;

    // Check each answer against the correct option
    for (const question of questions) {
      totalTimeTaken += question.timeTakenSeconds;
      
      const correctOption = await db.select()
        .from(questionOptions)
        .where(and(
          eq(questionOptions.questionId, question.questionId),
          eq(questionOptions.isCorrect, true)
        ))
        .limit(1);

      if (correctOption.length > 0 && correctOption[0].id === question.selectedOptionId) {
        correctAnswers++;
      }
    }

    const scorePercentage = Math.round((correctAnswers / questionsAnswered) * 100);
    
    // Calculate rewards based on performance
    const baseXpPerQuestion = 10;
    const baseCoinPerQuestion = 2;
    const bonusMultiplier = scorePercentage >= 80 ? 1.5 : scorePercentage >= 60 ? 1.2 : 1.0;
    
    const xpEarned = Math.round(correctAnswers * baseXpPerQuestion * bonusMultiplier);
    const coinsEarned = Math.round(correctAnswers * baseCoinPerQuestion * bonusMultiplier);

    const currentTime = new Date().toISOString();

    // Create quiz attempt
    const newQuizAttempt = await db.insert(quizAttempts)
      .values({
        userId: user.id,
        subjectId,
        questionsAnswered,
        correctAnswers,
        scorePercentage,
        xpEarned,
        coinsEarned,
        timeTakenSeconds: totalTimeTaken,
        completedAt: currentTime,
        createdAt: currentTime
      })
      .returning();

    const quizAttemptId = newQuizAttempt[0].id;

    // Create individual question attempts
    const questionAttempts = [];
    for (const question of questions) {
      const correctOption = await db.select()
        .from(questionOptions)
        .where(and(
          eq(questionOptions.questionId, question.questionId),
          eq(questionOptions.isCorrect, true)
        ))
        .limit(1);

      const isCorrect = correctOption.length > 0 && correctOption[0].id === question.selectedOptionId;

      const questionAttempt = await db.insert(quizQuestionAttempts)
        .values({
          quizAttemptId,
          questionId: question.questionId,
          selectedOptionId: question.selectedOptionId,
          isCorrect,
          timeTakenSeconds: question.timeTakenSeconds
        })
        .returning();

      questionAttempts.push(questionAttempt[0]);
    }

    return NextResponse.json({
      ...newQuizAttempt[0],
      questionAttempts
    }, { status: 201 });

  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    const requestBody = await request.json();

    // Security check: reject if userId provided in body
    if ('userId' in requestBody || 'user_id' in requestBody) {
      return NextResponse.json({ 
        error: "User ID cannot be provided in request body",
        code: "USER_ID_NOT_ALLOWED" 
      }, { status: 400 });
    }

    // Check if record exists and belongs to user
    const existingRecord = await db.select()
      .from(quizAttempts)
      .where(and(eq(quizAttempts.id, parseInt(id)), eq(quizAttempts.userId, user.id)))
      .limit(1);

    if (existingRecord.length === 0) {
      return NextResponse.json({ error: 'Quiz attempt not found' }, { status: 404 });
    }

    const updates = {
      ...requestBody,
      updatedAt: new Date().toISOString()
    };

    const updated = await db.update(quizAttempts)
      .set(updates)
      .where(and(eq(quizAttempts.id, parseInt(id)), eq(quizAttempts.userId, user.id)))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json({ error: 'Quiz attempt not found' }, { status: 404 });
    }

    return NextResponse.json(updated[0]);

  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    // Check if record exists and belongs to user
    const existingRecord = await db.select()
      .from(quizAttempts)
      .where(and(eq(quizAttempts.id, parseInt(id)), eq(quizAttempts.userId, user.id)))
      .limit(1);

    if (existingRecord.length === 0) {
      return NextResponse.json({ error: 'Quiz attempt not found' }, { status: 404 });
    }

    // Delete related question attempts first
    await db.delete(quizQuestionAttempts)
      .where(eq(quizQuestionAttempts.quizAttemptId, parseInt(id)));

    // Delete the quiz attempt
    const deleted = await db.delete(quizAttempts)
      .where(and(eq(quizAttempts.id, parseInt(id)), eq(quizAttempts.userId, user.id)))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json({ error: 'Quiz attempt not found' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Quiz attempt deleted successfully',
      deletedRecord: deleted[0]
    });

  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}