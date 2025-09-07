import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { userProgress } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Authentication check
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const requestedUserId = searchParams.get('user_id');

    // Validate user_id parameter
    if (!requestedUserId) {
      return NextResponse.json({ 
        error: 'User ID is required',
        code: 'MISSING_USER_ID' 
      }, { status: 400 });
    }

    // Security: Only allow users to access their own progress
    if (requestedUserId !== user.id) {
      return NextResponse.json({ 
        error: 'Access denied',
        code: 'ACCESS_DENIED' 
      }, { status: 403 });
    }

    // Get user progress
    const progress = await db.select()
      .from(userProgress)
      .where(eq(userProgress.userId, requestedUserId))
      .limit(1);

    if (progress.length === 0) {
      return NextResponse.json({ 
        error: 'User progress not found',
        code: 'PROGRESS_NOT_FOUND' 
      }, { status: 404 });
    }

    return NextResponse.json(progress[0]);

  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Authentication check
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const requestedUserId = searchParams.get('user_id');

    // Validate user_id parameter
    if (!requestedUserId) {
      return NextResponse.json({ 
        error: 'User ID is required',
        code: 'MISSING_USER_ID' 
      }, { status: 400 });
    }

    // Security: Only allow users to update their own progress
    if (requestedUserId !== user.id) {
      return NextResponse.json({ 
        error: 'Access denied',
        code: 'ACCESS_DENIED' 
      }, { status: 403 });
    }

    const requestBody = await request.json();
    
    // Security check: reject if userId provided in body
    if ('userId' in requestBody || 'user_id' in requestBody) {
      return NextResponse.json({ 
        error: "User ID cannot be provided in request body",
        code: "USER_ID_NOT_ALLOWED" 
      }, { status: 400 });
    }

    const { xp, coins, level, currentStreak, longestStreak } = requestBody;

    // Check if progress record exists
    const existingProgress = await db.select()
      .from(userProgress)
      .where(eq(userProgress.userId, requestedUserId))
      .limit(1);

    const now = new Date().toISOString();
    const today = new Date().toISOString().split('T')[0];

    let updatedProgress;

    if (existingProgress.length === 0) {
      // Create new progress record
      const newXp = xp ?? 0;
      const calculatedLevel = level ?? Math.floor(newXp / 100) + 1;
      const newCurrentStreak = currentStreak ?? 0;
      const newLongestStreak = Math.max(longestStreak ?? 0, newCurrentStreak);

      updatedProgress = await db.insert(userProgress)
        .values({
          userId: requestedUserId,
          xp: newXp,
          coins: coins ?? 0,
          level: calculatedLevel,
          currentStreak: newCurrentStreak,
          longestStreak: newLongestStreak,
          lastActivityDate: today,
          createdAt: now,
          updatedAt: now,
        })
        .returning();
    } else {
      // Update existing progress record
      const current = existingProgress[0];
      const updates: any = {
        updatedAt: now,
        lastActivityDate: today,
      };

      // Update only provided fields
      if (xp !== undefined) {
        updates.xp = xp;
        // Auto-calculate level based on XP if level not provided
        if (level === undefined) {
          updates.level = Math.floor(xp / 100) + 1;
        }
      }

      if (coins !== undefined) {
        updates.coins = coins;
      }

      if (level !== undefined) {
        updates.level = level;
      }

      if (currentStreak !== undefined) {
        updates.currentStreak = currentStreak;
        // Update longest streak if current streak exceeds it
        const newLongestStreak = Math.max(
          longestStreak ?? current.longestStreak ?? 0,
          currentStreak
        );
        updates.longestStreak = newLongestStreak;
      }

      if (longestStreak !== undefined) {
        updates.longestStreak = Math.max(
          longestStreak,
          current.longestStreak ?? 0,
          current.currentStreak ?? 0
        );
      }

      updatedProgress = await db.update(userProgress)
        .set(updates)
        .where(eq(userProgress.userId, requestedUserId))
        .returning();
    }

    if (updatedProgress.length === 0) {
      return NextResponse.json({ 
        error: 'Failed to update progress',
        code: 'UPDATE_FAILED' 
      }, { status: 500 });
    }

    return NextResponse.json(updatedProgress[0]);

  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}