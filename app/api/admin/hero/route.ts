import { NextRequest, NextResponse } from 'next/server';
import { HeroService } from '@/lib/services/heroService';
import { CreateHeroSlideDTO } from '@/lib/types/hero';
import { z } from 'zod';

const createHeroSlideSchema = z.object({
  internalName: z.string().min(1, 'Internal name is required'),
  eyebrow: z.string().min(1, 'Eyebrow label is required'),
  title: z.string().min(1, 'Headline title is required'),
  description: z.string().min(1, 'Description is required'),
  desktopImage: z.string().url('Desktop image must be a valid URL'),
  mobileImage: z.string().url('Mobile image must be a valid URL').optional(),
  imageAlt: z.string().min(1, 'Alt text is required for accessibility'),
  primaryCtaLabel: z.string().min(1, 'Primary CTA label is required'),
  primaryCtaUrl: z.string().min(1, 'Primary CTA URL is required'),
  secondaryCtaLabel: z.string().optional(),
  secondaryCtaUrl: z.string().optional(),
  contentPosition: z.enum(['left', 'right', 'center']).default('left'),
  textTheme: z.enum(['light', 'dark']).default('light'),
  desktopImagePosition: z.string().default('center 25%'),
  mobileImagePosition: z.string().default('60% 20%'),
  productId: z.string().optional(),
  categoryId: z.string().optional(),
  collectionId: z.string().optional(),
  fabricTags: z.array(z.string()).optional(),
  editorialBadge: z.string().optional(),
  navLabel: z.string().optional(),
  sortOrder: z.number().optional(),
  status: z.enum(['PUBLISHED', 'DRAFT', 'SCHEDULED', 'ARCHIVED']).default('PUBLISHED'),
  startAt: z.string().nullable().optional(),
  endAt: z.string().nullable().optional(),
});

export async function GET() {
  try {
    const slides = await HeroService.getAllAdminSlides();
    return NextResponse.json({
      success: true,
      data: slides,
      meta: { total: slides.length },
      error: null,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        data: null,
        error: { code: 'HERO_FETCH_FAILED', message: 'Failed to retrieve hero slides' },
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = createHeroSlideSchema.parse(body);

    const newSlide = await HeroService.createSlide(validated as CreateHeroSlideDTO);

    return NextResponse.json(
      {
        success: true,
        data: newSlide,
        error: null,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid hero slide submission',
            details: error.issues,
          },
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        data: null,
        error: { code: 'HERO_CREATION_FAILED', message: 'Failed to create hero slide' },
      },
      { status: 500 }
    );
  }
}
