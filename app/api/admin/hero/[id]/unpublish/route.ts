import { NextRequest, NextResponse } from 'next/server';
import { HeroService } from '@/lib/services/heroService';

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const unpublished = await HeroService.unpublishSlide(id);

    if (!unpublished) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: { code: 'HERO_SLIDE_NOT_FOUND', message: `Slide with ID ${id} not found` },
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: unpublished,
      error: null,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        data: null,
        error: { code: 'HERO_UNPUBLISH_FAILED', message: 'Failed to unpublish slide' },
      },
      { status: 500 }
    );
  }
}
