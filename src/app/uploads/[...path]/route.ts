import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const requestedPath = Array.isArray(params.path) ? params.path : [params.path];
    const filePath = path.join(process.cwd(), 'public', 'uploads', ...requestedPath);

    // Security check: ensure path is within public/uploads
    const baseUploadsDir = path.join(process.cwd(), 'public', 'uploads');
    if (!filePath.startsWith(baseUploadsDir)) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    if (!existsSync(filePath)) {
      return new NextResponse('Image not found in storage', { status: 404 });
    }

    const fileBuffer = await readFile(filePath);
    const ext = path.extname(filePath).toLowerCase();

    const mimeMap: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.webp': 'image/webp',
      '.avif': 'image/avif',
      '.gif': 'image/gif',
      '.svg': 'image/svg+xml',
    };

    const contentType = mimeMap[ext] || 'application/octet-stream';

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error: any) {
    console.error('Image serving error:', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
