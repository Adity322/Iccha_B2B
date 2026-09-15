import { NextRequest, NextResponse } from 'next/server';
import { HeroService } from '@/lib/services/heroService';

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const published = await HeroService.publishSlide(id);

    if (!published) {
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
      data: published,
      error: null,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        data: null,
        error: { code: 'HERO_PUBLISH_FAILED', message: 'Failed to publish slide' },
      },
      { status: 500 }
    );
  }
}
