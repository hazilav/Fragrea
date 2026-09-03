import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/auth';
import { getStorageService } from '@/lib/storage/factory';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    // Admin Authorization Guard
    const admin = await verifyAdminSession();
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Admin credentials required.' },
        { status: 401 }
      );
    }

    const data = await req.formData();
    const file: File | null = data.get('file') as unknown as File;

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file received' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Delegate binary storage to Image Storage Service
    const storageService = getStorageService();
    const uploadResult = await storageService.upload(buffer, {
      filename: file.name,
      contentType: file.type,
      folder: 'products',
    });

    if (!uploadResult.success) {
      return NextResponse.json(
        { success: false, error: uploadResult.error || 'Upload failed' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      url: uploadResult.url,
      storagePath: uploadResult.storagePath,
      filename: uploadResult.filename,
      size: uploadResult.size,
      type: file.type,
      provider: uploadResult.provider,
    });
  } catch (error: any) {
    console.error('File upload error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const admin = await verifyAdminSession();
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Admin credentials required.' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json({ success: false, error: 'Image URL is required' }, { status: 400 });
    }

    const storageService = getStorageService();
    const result = await storageService.delete(url);

    return NextResponse.json({ success: result.success });
  } catch (error: any) {
    console.error('Image delete error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
