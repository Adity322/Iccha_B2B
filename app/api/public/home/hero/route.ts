import { NextResponse } from 'next/server';
import { HeroService } from '@/lib/services/heroService';

export async function GET() {
  try {
    const [slides, config] = await Promise.all([
      HeroService.getHeroSlides(),
      HeroService.getHeroConfig(),
    ]);

    // Public DTO mapping - never leak internal notes or sensitive data
    const publicSlides = slides.map((s) => ({
      id: s.id,
      slideNumber: s.slideNumber,
      navLabel: s.navLabel,
      eyebrow: s.eyebrow,
      title: s.title,
      description: s.description,
      desktopImage: s.desktopImage,
      mobileImage: s.mobileImage || s.desktopImage,
      imageAlt: s.imageAlt,
      primaryCTA: s.primaryCTA,
      secondaryCTA: s.secondaryCTA,
      contentPosition: s.contentPosition,
      textTheme: s.textTheme,
      desktopImagePosition: s.desktopImagePosition || 'center 25%',
      mobileImagePosition: s.mobileImagePosition || '60% 20%',
      categoryId: s.categoryId,
      collectionId: s.collectionId,
      fabricTags: s.fabricTags,
      editorialBadge: s.editorialBadge,
    }));

    const response = NextResponse.json({
      success: true,
      data: {
        slides: publicSlides,
        config,
      },
      error: null,
    });

    // Cache header for fast CDN edge delivery
    response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');

    return response;
  } catch (error) {
    console.error('Error serving public hero:', error);
    return NextResponse.json(
      {
        success: false,
        data: null,
        error: { code: 'HERO_FETCH_ERROR', message: 'Failed to fetch active hero slides' },
      },
      { status: 500 }
    );
  }
}
