import { NextRequest, NextResponse } from 'next/server';
import { HeroService } from '@/lib/services/heroService';
import { z } from 'zod';

const reorderSchema = z.object({
  slides: z.array(
    z.object({
      id: z.string(),
      sortOrder: z.number().int().positive(),
    })
  ).min(1),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = reorderSchema.parse(body);

    const reordered = await HeroService.reorderSlides(validated.slides);

    return NextResponse.json({
      success: true,
      data: reordered,
      error: null,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: { code: 'VALIDATION_ERROR', message: 'Invalid reorder array', details: error.issues },
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        data: null,
        error: { code: 'HERO_REORDER_FAILED', message: 'Failed to reorder hero slides' },
      },
      { status: 500 }
    );
  }
}
