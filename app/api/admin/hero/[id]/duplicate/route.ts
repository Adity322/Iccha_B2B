import { NextRequest, NextResponse } from 'next/server';
import { HeroService } from '@/lib/services/heroService';

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const duplicated = await HeroService.duplicateSlide(id);

    if (!duplicated) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: { code: 'HERO_SLIDE_NOT_FOUND', message: `Slide with ID ${id} not found` },
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: duplicated,
        error: null,
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        data: null,
        error: { code: 'HERO_DUPLICATE_FAILED', message: 'Failed to duplicate slide' },
      },
      { status: 500 }
    );
  }
}
