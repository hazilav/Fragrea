import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAdminSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const notes = await prisma.fragranceNote.findMany({
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
    });
    return NextResponse.json({ success: true, count: notes.length, notes });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = await verifyAdminSession();
    if (!admin) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { name, category, origin, description } = body;

    if (!name) {
      return NextResponse.json({ success: false, error: 'Note name is required' }, { status: 400 });
    }

    const note = await prisma.fragranceNote.create({
      data: {
        name: name.trim(),
        category: category || 'Woody',
        origin: origin || null,
        description: description || null,
      },
    });

    return NextResponse.json({ success: true, note });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
