import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { questions, questionOptions, questionTranslations, optionTranslations, subjects } from '@/db/schema';
import { eq, and, like, desc, asc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    const subjectId = searchParams.get('subject_id');
    const difficulty = searchParams.get('difficulty');
    const language = searchParams.get('language');
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    const sort = searchParams.get('sort') || 'createdAt';
    const order = searchParams.get('order') || 'desc';

    // Single question by ID
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json({ 
          error: "Valid question ID is required",
          code: "INVALID_ID" 
        }, { status: 400 });
      }

      const questionData = await db.select()
        .from(questions)
        .where(eq(questions.id, parseInt(id)))
        .limit(1);

      if (questionData.length === 0) {
        return NextResponse.json({ error: 'Question not found' }, { status: 404 });
      }

      const question = questionData[0];

      // Get all options for this question
      const optionsData = await db.select()
        .from(questionOptions)
        .where(eq(questionOptions.questionId, question.id))
        .orderBy(asc(questionOptions.optionOrder));

      // Get question translations
      let questionTranslationsData = await db.select()
        .from(questionTranslations)
        .where(eq(questionTranslations.questionId, question.id));

      // Filter by language if specified
      if (language) {
        questionTranslationsData = questionTranslationsData.filter(
          qt => qt.languageCode === language
        );
      }

      // Get option translations for all options
      const optionIds = optionsData.map(opt => opt.id);
      let optionTranslationsData = [];
      if (optionIds.length > 0) {
        optionTranslationsData = await db.select()
          .from(optionTranslations)
          .where(
            optionIds.length === 1 
              ? eq(optionTranslations.optionId, optionIds[0])
              : optionTranslations.optionId
          );

        // Filter by language if specified
        if (language) {
          optionTranslationsData = optionTranslationsData.filter(
            ot => ot.languageCode === language
          );
        }
      }

      // Structure the response with nested relationships
      const structuredQuestion = {
        ...question,
        options: optionsData.map(option => ({
          ...option,
          translations: optionTranslationsData.filter(
            ot => ot.optionId === option.id
          )
        })),
        translations: questionTranslationsData
      };

      return NextResponse.json(structuredQuestion);
    }

    // Questions by subject ID or all questions
    let query = db.select().from(questions);
    let whereConditions = [];

    // Filter by subject ID
    if (subjectId) {
      if (isNaN(parseInt(subjectId))) {
        return NextResponse.json({ 
          error: "Valid subject ID is required",
          code: "INVALID_SUBJECT_ID" 
        }, { status: 400 });
      }

      // Verify subject exists
      const subjectExists = await db.select()
        .from(subjects)
        .where(eq(subjects.id, parseInt(subjectId)))
        .limit(1);

      if (subjectExists.length === 0) {
        return NextResponse.json({ error: 'Subject not found' }, { status: 404 });
      }

      whereConditions.push(eq(questions.subjectId, parseInt(subjectId)));
    }

    // Filter by difficulty
    if (difficulty && ['easy', 'medium', 'hard'].includes(difficulty)) {
      whereConditions.push(eq(questions.difficultyLevel, difficulty));
    }

    // Apply where conditions
    if (whereConditions.length > 0) {
      query = query.where(
        whereConditions.length === 1 
          ? whereConditions[0]
          : and(...whereConditions)
      );
    }

    // Apply sorting
    const sortField = sort === 'difficulty' ? questions.difficultyLevel : 
                     sort === 'xpReward' ? questions.xpReward :
                     sort === 'coinReward' ? questions.coinReward :
                     sort === 'updatedAt' ? questions.updatedAt :
                     questions.createdAt;

    if (order === 'asc') {
      query = query.orderBy(asc(sortField));
    } else {
      query = query.orderBy(desc(sortField));
    }

    // Apply pagination
    const questionsData = await query.limit(limit).offset(offset);

    if (questionsData.length === 0) {
      return NextResponse.json([]);
    }

    // Get all question IDs for batch fetching
    const questionIds = questionsData.map(q => q.id);

    // Get all options for these questions
    let allOptionsData = [];
    if (questionIds.length > 0) {
      allOptionsData = await db.select()
        .from(questionOptions)
        .where(
          questionIds.length === 1 
            ? eq(questionOptions.questionId, questionIds[0])
            : questionOptions.questionId
        )
        .orderBy(asc(questionOptions.optionOrder));
    }

    // Get question translations
    let allQuestionTranslations = [];
    if (questionIds.length > 0) {
      allQuestionTranslations = await db.select()
        .from(questionTranslations)
        .where(
          questionIds.length === 1 
            ? eq(questionTranslations.questionId, questionIds[0])
            : questionTranslations.questionId
        );

      // Filter by language if specified
      if (language) {
        allQuestionTranslations = allQuestionTranslations.filter(
          qt => qt.languageCode === language
        );
      }
    }

    // Get all option IDs for translations
    const optionIds = allOptionsData.map(opt => opt.id);
    let allOptionTranslations = [];
    if (optionIds.length > 0) {
      allOptionTranslations = await db.select()
        .from(optionTranslations)
        .where(
          optionIds.length === 1 
            ? eq(optionTranslations.optionId, optionIds[0])
            : optionTranslations.optionId
        );

      // Filter by language if specified
      if (language) {
        allOptionTranslations = allOptionTranslations.filter(
          ot => ot.languageCode === language
        );
      }
    }

    // Structure the response with nested relationships
    const structuredQuestions = questionsData.map(question => {
      const questionOptions = allOptionsData.filter(
        opt => opt.questionId === question.id
      );

      const optionsWithTranslations = questionOptions.map(option => ({
        ...option,
        translations: allOptionTranslations.filter(
          ot => ot.optionId === option.id
        )
      }));

      return {
        ...question,
        options: optionsWithTranslations,
        translations: allQuestionTranslations.filter(
          qt => qt.questionId === question.id
        )
      };
    });

    return NextResponse.json(structuredQuestions);

  } catch (error) {
    console.error('GET questions error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const requestBody = await request.json();
    
    const { 
      subjectId, 
      questionText, 
      explanation, 
      difficultyLevel = 'medium',
      xpReward = 10,
      coinReward = 2,
      options = [],
      translations = []
    } = requestBody;

    // Validate required fields
    if (!subjectId) {
      return NextResponse.json({ 
        error: "Subject ID is required",
        code: "MISSING_SUBJECT_ID" 
      }, { status: 400 });
    }

    if (!questionText || questionText.trim() === '') {
      return NextResponse.json({ 
        error: "Question text is required",
        code: "MISSING_QUESTION_TEXT" 
      }, { status: 400 });
    }

    if (!Array.isArray(options) || options.length === 0) {
      return NextResponse.json({ 
        error: "At least one option is required",
        code: "MISSING_OPTIONS" 
      }, { status: 400 });
    }

    // Validate at least one correct answer
    const hasCorrectAnswer = options.some(opt => opt.isCorrect === true);
    if (!hasCorrectAnswer) {
      return NextResponse.json({ 
        error: "At least one option must be marked as correct",
        code: "NO_CORRECT_ANSWER" 
      }, { status: 400 });
    }

    // Validate subject exists
    const subjectExists = await db.select()
      .from(subjects)
      .where(eq(subjects.id, parseInt(subjectId)))
      .limit(1);

    if (subjectExists.length === 0) {
      return NextResponse.json({ 
        error: "Subject not found",
        code: "SUBJECT_NOT_FOUND" 
      }, { status: 400 });
    }

    // Validate difficulty level
    if (difficultyLevel && !['easy', 'medium', 'hard'].includes(difficultyLevel)) {
      return NextResponse.json({ 
        error: "Difficulty level must be easy, medium, or hard",
        code: "INVALID_DIFFICULTY" 
      }, { status: 400 });
    }

    const now = new Date().toISOString();

    // Create the question
    const newQuestion = await db.insert(questions)
      .values({
        subjectId: parseInt(subjectId),
        questionText: questionText.trim(),
        explanation: explanation?.trim() || null,
        difficultyLevel,
        xpReward: parseInt(xpReward) || 10,
        coinReward: parseInt(coinReward) || 2,
        createdAt: now,
        updatedAt: now
      })
      .returning();

    const questionId = newQuestion[0].id;

    // Create options
    const createdOptions = [];
    for (let i = 0; i < options.length; i++) {
      const option = options[i];
      
      if (!option.optionText || option.optionText.trim() === '') {
        return NextResponse.json({ 
          error: `Option ${i + 1} text is required`,
          code: "MISSING_OPTION_TEXT" 
        }, { status: 400 });
      }

      const newOption = await db.insert(questionOptions)
        .values({
          questionId,
          optionText: option.optionText.trim(),
          isCorrect: Boolean(option.isCorrect),
          optionOrder: option.optionOrder || i + 1
        })
        .returning();

      createdOptions.push(newOption[0]);

      // Create option translations if provided
      if (option.translations && Array.isArray(option.translations)) {
        for (const translation of option.translations) {
          if (translation.languageCode && translation.optionText) {
            await db.insert(optionTranslations)
              .values({
                optionId: newOption[0].id,
                languageCode: translation.languageCode,
                optionText: translation.optionText.trim()
              });
          }
        }
      }
    }

    // Create question translations if provided
    if (translations && Array.isArray(translations)) {
      for (const translation of translations) {
        if (translation.languageCode && translation.questionText) {
          await db.insert(questionTranslations)
            .values({
              questionId,
              languageCode: translation.languageCode,
              questionText: translation.questionText.trim(),
              explanation: translation.explanation?.trim() || null
            });
        }
      }
    }

    // Fetch the complete question with all relationships
    const completeQuestion = {
      ...newQuestion[0],
      options: createdOptions,
      translations: []
    };

    return NextResponse.json(completeQuestion, { status: 201 });

  } catch (error) {
    console.error('POST questions error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid question ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    const requestBody = await request.json();
    
    const { 
      subjectId, 
      questionText, 
      explanation, 
      difficultyLevel,
      xpReward,
      coinReward 
    } = requestBody;

    // Check if question exists
    const existingQuestion = await db.select()
      .from(questions)
      .where(eq(questions.id, parseInt(id)))
      .limit(1);

    if (existingQuestion.length === 0) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }

    // Validate subject exists if provided
    if (subjectId) {
      const subjectExists = await db.select()
        .from(subjects)
        .where(eq(subjects.id, parseInt(subjectId)))
        .limit(1);

      if (subjectExists.length === 0) {
        return NextResponse.json({ 
          error: "Subject not found",
          code: "SUBJECT_NOT_FOUND" 
        }, { status: 400 });
      }
    }

    // Validate difficulty level if provided
    if (difficultyLevel && !['easy', 'medium', 'hard'].includes(difficultyLevel)) {
      return NextResponse.json({ 
        error: "Difficulty level must be easy, medium, or hard",
        code: "INVALID_DIFFICULTY" 
      }, { status: 400 });
    }

    // Prepare update data
    const updateData: any = {
      updatedAt: new Date().toISOString()
    };

    if (subjectId !== undefined) updateData.subjectId = parseInt(subjectId);
    if (questionText !== undefined) updateData.questionText = questionText.trim();
    if (explanation !== undefined) updateData.explanation = explanation?.trim() || null;
    if (difficultyLevel !== undefined) updateData.difficultyLevel = difficultyLevel;
    if (xpReward !== undefined) updateData.xpReward = parseInt(xpReward) || 10;
    if (coinReward !== undefined) updateData.coinReward = parseInt(coinReward) || 2;

    // Update the question
    const updatedQuestion = await db.update(questions)
      .set(updateData)
      .where(eq(questions.id, parseInt(id)))
      .returning();

    return NextResponse.json(updatedQuestion[0]);

  } catch (error) {
    console.error('PUT questions error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid question ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    // Check if question exists
    const existingQuestion = await db.select()
      .from(questions)
      .where(eq(questions.id, parseInt(id)))
      .limit(1);

    if (existingQuestion.length === 0) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }

    // Delete related option translations first
    const questionOptionsData = await db.select()
      .from(questionOptions)
      .where(eq(questionOptions.questionId, parseInt(id)));

    const optionIds = questionOptionsData.map(opt => opt.id);
    if (optionIds.length > 0) {
      await db.delete(optionTranslations)
        .where(
          optionIds.length === 1 
            ? eq(optionTranslations.optionId, optionIds[0])
            : optionTranslations.optionId
        );
    }

    // Delete question translations
    await db.delete(questionTranslations)
      .where(eq(questionTranslations.questionId, parseInt(id)));

    // Delete question options
    await db.delete(questionOptions)
      .where(eq(questionOptions.questionId, parseInt(id)));

    // Delete the question
    const deletedQuestion = await db.delete(questions)
      .where(eq(questions.id, parseInt(id)))
      .returning();

    return NextResponse.json({ 
      message: 'Question deleted successfully',
      question: deletedQuestion[0]
    });

  } catch (error) {
    console.error('DELETE questions error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}