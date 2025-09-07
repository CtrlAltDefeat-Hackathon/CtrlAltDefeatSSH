import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { subjects } from '@/db/schema';
import { eq, like, and, or, desc, asc, ne } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Single subject by ID
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json({ 
          error: "Valid ID is required",
          code: "INVALID_ID" 
        }, { status: 400 });
      }

      const subject = await db.select()
        .from(subjects)
        .where(eq(subjects.id, parseInt(id)))
        .limit(1);

      if (subject.length === 0) {
        return NextResponse.json({ 
          error: 'Subject not found',
          code: 'SUBJECT_NOT_FOUND'
        }, { status: 404 });
      }

      return NextResponse.json(subject[0]);
    }

    // List subjects with pagination and search
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort') || 'createdAt';
    const order = searchParams.get('order') || 'desc';

    let query = db.select().from(subjects);

    if (search) {
      query = query.where(
        or(
          like(subjects.name, `%${search}%`),
          like(subjects.description, `%${search}%`)
        )
      );
    }

    // Apply sorting
    const sortColumn = sort === 'name' ? subjects.name : subjects.createdAt;
    const sortOrder = order === 'asc' ? asc(sortColumn) : desc(sortColumn);
    query = query.orderBy(sortOrder);

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
    const requestBody = await request.json();
    const { name, slug, description, icon } = requestBody;

    // Validate required fields
    if (!name) {
      return NextResponse.json({ 
        error: "Name is required",
        code: "MISSING_REQUIRED_FIELD" 
      }, { status: 400 });
    }

    if (!slug) {
      return NextResponse.json({ 
        error: "Slug is required",
        code: "MISSING_REQUIRED_FIELD" 
      }, { status: 400 });
    }

    // Sanitize inputs
    const sanitizedName = name.trim();
    const sanitizedSlug = slug.trim().toLowerCase();
    const sanitizedDescription = description?.trim() || null;
    const sanitizedIcon = icon?.trim() || null;

    // Check if slug already exists
    const existingSubject = await db.select()
      .from(subjects)
      .where(eq(subjects.slug, sanitizedSlug))
      .limit(1);

    if (existingSubject.length > 0) {
      return NextResponse.json({ 
        error: "Subject with this slug already exists",
        code: "SLUG_ALREADY_EXISTS" 
      }, { status: 400 });
    }

    const currentTime = new Date().toISOString();
    
    const newSubject = await db.insert(subjects)
      .values({
        name: sanitizedName,
        slug: sanitizedSlug,
        description: sanitizedDescription,
        icon: sanitizedIcon,
        createdAt: currentTime,
        updatedAt: currentTime
      })
      .returning();

    return NextResponse.json(newSubject[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    const requestBody = await request.json();
    const { name, slug, description, icon } = requestBody;

    // Check if subject exists
    const existingSubject = await db.select()
      .from(subjects)
      .where(eq(subjects.id, parseInt(id)))
      .limit(1);

    if (existingSubject.length === 0) {
      return NextResponse.json({ 
        error: 'Subject not found',
        code: 'SUBJECT_NOT_FOUND'
      }, { status: 404 });
    }

    // Build update object with only provided fields
    const updates: any = {
      updatedAt: new Date().toISOString()
    };

    if (name !== undefined) {
      if (!name.trim()) {
        return NextResponse.json({ 
          error: "Name cannot be empty",
          code: "INVALID_NAME" 
        }, { status: 400 });
      }
      updates.name = name.trim();
    }

    if (slug !== undefined) {
      if (!slug.trim()) {
        return NextResponse.json({ 
          error: "Slug cannot be empty",
          code: "INVALID_SLUG" 
        }, { status: 400 });
      }
      
      const sanitizedSlug = slug.trim().toLowerCase();
      
      // Check if slug already exists for a different subject
      const existingSlug = await db.select()
        .from(subjects)
        .where(and(
          eq(subjects.slug, sanitizedSlug),
          ne(subjects.id, parseInt(id))
        ))
        .limit(1);

      if (existingSlug.length > 0) {
        return NextResponse.json({ 
          error: "Subject with this slug already exists",
          code: "SLUG_ALREADY_EXISTS" 
        }, { status: 400 });
      }
      
      updates.slug = sanitizedSlug;
    }

    if (description !== undefined) {
      updates.description = description?.trim() || null;
    }

    if (icon !== undefined) {
      updates.icon = icon?.trim() || null;
    }

    const updated = await db.update(subjects)
      .set(updates)
      .where(eq(subjects.id, parseInt(id)))
      .returning();

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
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    // Check if subject exists
    const existingSubject = await db.select()
      .from(subjects)
      .where(eq(subjects.id, parseInt(id)))
      .limit(1);

    if (existingSubject.length === 0) {
      return NextResponse.json({ 
        error: 'Subject not found',
        code: 'SUBJECT_NOT_FOUND'
      }, { status: 404 });
    }

    const deleted = await db.delete(subjects)
      .where(eq(subjects.id, parseInt(id)))
      .returning();

    return NextResponse.json({
      message: 'Subject deleted successfully',
      subject: deleted[0]
    });
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}