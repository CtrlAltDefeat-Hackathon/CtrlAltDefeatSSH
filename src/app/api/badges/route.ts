import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { badges, userBadges } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');

    if (userId) {
      // Get badges earned by specific user
      const earnedBadges = await db
        .select({
          id: badges.id,
          name: badges.name,
          description: badges.description,
          icon: badges.icon,
          requirementType: badges.requirementType,
          requirementValue: badges.requirementValue,
          earnedAt: userBadges.earnedAt,
        })
        .from(userBadges)
        .innerJoin(badges, eq(userBadges.badgeId, badges.id))
        .where(eq(userBadges.userId, userId))
        .orderBy(desc(userBadges.earnedAt))
        .limit(limit)
        .offset(offset);

      return NextResponse.json(earnedBadges);
    } else {
      // Get all available badges
      const allBadges = await db
        .select()
        .from(badges)
        .orderBy(desc(badges.createdAt))
        .limit(limit)
        .offset(offset);

      return NextResponse.json(allBadges);
    }
  } catch (error) {
    console.error('GET badges error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const requestBody = await request.json();
    const { userId, badgeId } = requestBody;

    // Security check: prevent user ID injection
    if ('userId' in requestBody || 'user_id' in requestBody) {
      return NextResponse.json({ 
        error: "User ID cannot be provided in request body",
        code: "USER_ID_NOT_ALLOWED" 
      }, { status: 400 });
    }

    // Validate required fields
    if (!badgeId) {
      return NextResponse.json({ 
        error: "Badge ID is required",
        code: "MISSING_BADGE_ID" 
      }, { status: 400 });
    }

    // Validate badgeId is valid integer
    if (isNaN(parseInt(badgeId))) {
      return NextResponse.json({ 
        error: "Valid badge ID is required",
        code: "INVALID_BADGE_ID" 
      }, { status: 400 });
    }

    const badgeIdInt = parseInt(badgeId);

    // Check if badge exists
    const badge = await db
      .select()
      .from(badges)
      .where(eq(badges.id, badgeIdInt))
      .limit(1);

    if (badge.length === 0) {
      return NextResponse.json({ 
        error: 'Badge not found',
        code: 'BADGE_NOT_FOUND' 
      }, { status: 404 });
    }

    // Check if user already has this badge
    const existingUserBadge = await db
      .select()
      .from(userBadges)
      .where(and(
        eq(userBadges.userId, user.id),
        eq(userBadges.badgeId, badgeIdInt)
      ))
      .limit(1);

    if (existingUserBadge.length > 0) {
      return NextResponse.json({ 
        error: 'User already has this badge',
        code: 'BADGE_ALREADY_EARNED' 
      }, { status: 400 });
    }

    // Award badge to user
    const newUserBadge = await db
      .insert(userBadges)
      .values({
        userId: user.id,
        badgeId: badgeIdInt,
        earnedAt: new Date().toISOString(),
      })
      .returning();

    return NextResponse.json({
      success: true,
      message: 'Badge awarded successfully',
      userBadge: newUserBadge[0],
      badge: badge[0]
    }, { status: 201 });

  } catch (error) {
    console.error('POST badges error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}