import { NextRequest, NextResponse } from 'next/server';
import { HeroService } from '@/lib/services/heroService';
import { z } from 'zod';

const updateHeroSlideSchema = z.object({
  internalName: z.string().optional(),
  eyebrow: z.string().optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  desktopImage: z.string().url().optional(),
  mobileImage: z.string().url().optional(),
  imageAlt: z.string().optional(),
  primaryCtaLabel: z.string().optional(),
  primaryCtaUrl: z.string().optional(),
  secondaryCtaLabel: z.string().optional(),
  secondaryCtaUrl: z.string().optional(),
  contentPosition: z.enum(['left', 'right', 'center']).optional(),
  textTheme: z.enum(['light', 'dark']).optional(),
  desktopImagePosition: z.string().optional(),
  mobileImagePosition: z.string().optional(),
  productId: z.string().optional(),
  categoryId: z.string().optional(),
  collectionId: z.string().optional(),
  fabricTags: z.array(z.string()).optional(),
  editorialBadge: z.string().optional(),
  navLabel: z.string().optional(),
  sortOrder: z.number().optional(),
  status: z.enum(['PUBLISHED', 'DRAFT', 'SCHEDULED', 'ARCHIVED']).optional(),
  startAt: z.string().nullable().optional(),
  endAt: z.string().nullable().optional(),
});

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const slide = await HeroService.getSlideById(id);

    if (!slide) {
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
      data: slide,
      error: null,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        data: null,
        error: { code: 'HERO_FETCH_FAILED', message: 'Failed to retrieve slide' },
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const validated = updateHeroSlideSchema.parse(body);

    const updated = await HeroService.updateSlide(id, validated);

    if (!updated) {
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
      data: updated,
      error: null,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: { code: 'VALIDATION_ERROR', message: 'Invalid payload', details: error.issues },
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        data: null,
        error: { code: 'HERO_UPDATE_FAILED', message: 'Failed to update hero slide' },
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const archived = await HeroService.archiveSlide(id);

    if (!archived) {
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
      data: { id, archived: true },
      error: null,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        data: null,
        error: { code: 'HERO_ARCHIVE_FAILED', message: 'Failed to archive slide' },
      },
      { status: 500 }
    );
  }
}
