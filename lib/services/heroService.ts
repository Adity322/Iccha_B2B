import { HeroSlide, HeroSliderConfig, CreateHeroSlideDTO } from '@/lib/types/hero';
import { MOCK_HERO_SLIDES, HERO_SLIDER_CONFIG } from '@/lib/data/heroData';
import { AuditService } from '@/lib/services/auditService';

// In-Memory dynamic store with initial mock data
let heroSlidesStore: HeroSlide[] = [...MOCK_HERO_SLIDES.map((slide, index) => ({
  ...slide,
  internalName: slide.navLabel,
  sortOrder: index + 1,
  status: 'PUBLISHED' as const,
  publishedAt: new Date().toISOString(),
  startAt: null,
  endAt: null,
}))];

let heroConfigStore: HeroSliderConfig = { ...HERO_SLIDER_CONFIG };

export class HeroService {
  /**
   * Returns active published hero slides for public visitors.
   * Filters by status = PUBLISHED and active scheduling window (startAt <= now <= endAt).
   */
  static async getHeroSlides(): Promise<HeroSlide[]> {
    const now = new Date();
    
    const active = heroSlidesStore.filter((slide) => {
      // Must be PUBLISHED
      if (slide.status && slide.status !== 'PUBLISHED') return false;

      // Check start date schedule
      if (slide.startAt && new Date(slide.startAt) > now) return false;

      // Check end date schedule
      if (slide.endAt && new Date(slide.endAt) < now) return false;

      return true;
    });

    // Fallback protection: if all slides are scheduled out/archived, return default slide
    if (active.length === 0 && heroSlidesStore.length > 0) {
      return [heroSlidesStore[0]];
    }

    return active.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  }

  /**
   * Returns default hero slider configuration.
   */
  static async getHeroConfig(): Promise<HeroSliderConfig> {
    return heroConfigStore;
  }

  /**
   * Admin: Get all slides with internal status & scheduling metadata
   */
  static async getAllAdminSlides(): Promise<HeroSlide[]> {
    return [...heroSlidesStore].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  }

  /**
   * Admin: Get single slide by ID
   */
  static async getSlideById(id: string): Promise<HeroSlide | null> {
    const slide = heroSlidesStore.find((s) => s.id === id);
    return slide ? { ...slide } : null;
  }

  /**
   * Admin: Create new hero slide
   */
  static async createSlide(dto: CreateHeroSlideDTO, actorEmail = 'admin@icchastore.com'): Promise<HeroSlide> {
    const nextOrder = heroSlidesStore.length + 1;
    const slideNum = String(nextOrder).padStart(2, '0');

    const newSlide: HeroSlide = {
      id: `hero-slide-${Date.now()}`,
      internalName: dto.internalName || `Slide ${slideNum}`,
      slideNumber: slideNum,
      navLabel: dto.navLabel || dto.eyebrow.slice(0, 14) || `Slide ${slideNum}`,
      eyebrow: dto.eyebrow,
      title: dto.title,
      description: dto.description,
      desktopImage: dto.desktopImage,
      mobileImage: dto.mobileImage || dto.desktopImage,
      imageAlt: dto.imageAlt || dto.title.replace('\n', ' '),
      primaryCTA: {
        label: dto.primaryCtaLabel || 'EXPLORE COLLECTION',
        href: dto.primaryCtaUrl || '/collections',
      },
      secondaryCTA: dto.secondaryCtaLabel ? {
        label: dto.secondaryCtaLabel,
        href: dto.secondaryCtaUrl || '/register',
      } : undefined,
      contentPosition: dto.contentPosition || 'left',
      textTheme: dto.textTheme || 'light',
      desktopImagePosition: dto.desktopImagePosition || 'center 25%',
      mobileImagePosition: dto.mobileImagePosition || '60% 20%',
      productId: dto.productId,
      categoryId: dto.categoryId,
      collectionId: dto.collectionId,
      fabricTags: dto.fabricTags || ['Stitched Kurti Set'],
      editorialBadge: dto.editorialBadge || 'Direct Factory Archive',
      sortOrder: dto.sortOrder !== undefined ? dto.sortOrder : nextOrder,
      status: dto.status || 'PUBLISHED',
      startAt: dto.startAt || null,
      endAt: dto.endAt || null,
      publishedAt: dto.status === 'PUBLISHED' ? new Date().toISOString() : null,
      updatedAt: new Date().toISOString(),
    };

    heroSlidesStore.push(newSlide);

    await AuditService.log({
      actorEmail,
      action: 'HERO_SLIDE_CREATED',
      entityType: 'HeroSlide',
      entityId: newSlide.id,
      metadata: { title: newSlide.title, status: newSlide.status },
    });

    HeroService.invalidateCache();
    return newSlide;
  }

  /**
   * Admin: Update existing hero slide
   */
  static async updateSlide(
    id: string,
    dto: Partial<CreateHeroSlideDTO> & { slideNumber?: string },
    actorEmail = 'admin@icchastore.com'
  ): Promise<HeroSlide | null> {
    const index = heroSlidesStore.findIndex((s) => s.id === id);
    if (index === -1) return null;

    const current = heroSlidesStore[index];
    const updated: HeroSlide = {
      ...current,
      internalName: dto.internalName !== undefined ? dto.internalName : current.internalName,
      slideNumber: dto.slideNumber !== undefined ? dto.slideNumber : current.slideNumber,
      navLabel: dto.navLabel !== undefined ? dto.navLabel : current.navLabel,
      eyebrow: dto.eyebrow !== undefined ? dto.eyebrow : current.eyebrow,
      title: dto.title !== undefined ? dto.title : current.title,
      description: dto.description !== undefined ? dto.description : current.description,
      desktopImage: dto.desktopImage !== undefined ? dto.desktopImage : current.desktopImage,
      mobileImage: dto.mobileImage !== undefined ? dto.mobileImage : current.mobileImage,
      imageAlt: dto.imageAlt !== undefined ? dto.imageAlt : current.imageAlt,
      primaryCTA: {
        label: dto.primaryCtaLabel !== undefined ? dto.primaryCtaLabel : current.primaryCTA.label,
        href: dto.primaryCtaUrl !== undefined ? dto.primaryCtaUrl : current.primaryCTA.href,
      },
      secondaryCTA: dto.secondaryCtaLabel !== undefined ? (dto.secondaryCtaLabel ? {
        label: dto.secondaryCtaLabel,
        href: dto.secondaryCtaUrl || '/register',
      } : undefined) : current.secondaryCTA,
      contentPosition: dto.contentPosition !== undefined ? dto.contentPosition : current.contentPosition,
      textTheme: dto.textTheme !== undefined ? dto.textTheme : current.textTheme,
      desktopImagePosition: dto.desktopImagePosition !== undefined ? dto.desktopImagePosition : current.desktopImagePosition,
      mobileImagePosition: dto.mobileImagePosition !== undefined ? dto.mobileImagePosition : current.mobileImagePosition,
      productId: dto.productId !== undefined ? dto.productId : current.productId,
      categoryId: dto.categoryId !== undefined ? dto.categoryId : current.categoryId,
      collectionId: dto.collectionId !== undefined ? dto.collectionId : current.collectionId,
      fabricTags: dto.fabricTags !== undefined ? dto.fabricTags : current.fabricTags,
      editorialBadge: dto.editorialBadge !== undefined ? dto.editorialBadge : current.editorialBadge,
      sortOrder: dto.sortOrder !== undefined ? dto.sortOrder : current.sortOrder,
      status: dto.status !== undefined ? dto.status : current.status,
      startAt: dto.startAt !== undefined ? dto.startAt : current.startAt,
      endAt: dto.endAt !== undefined ? dto.endAt : current.endAt,
      updatedAt: new Date().toISOString(),
    };

    heroSlidesStore[index] = updated;

    await AuditService.log({
      actorEmail,
      action: 'HERO_SLIDE_UPDATED',
      entityType: 'HeroSlide',
      entityId: updated.id,
      metadata: { fields: Object.keys(dto) },
    });

    HeroService.invalidateCache();
    return updated;
  }

  /**
   * Admin: Publish slide
   */
  static async publishSlide(id: string, actorEmail = 'admin@icchastore.com'): Promise<HeroSlide | null> {
    return this.updateSlide(id, { status: 'PUBLISHED' }, actorEmail);
  }

  /**
   * Admin: Unpublish slide (convert to DRAFT)
   */
  static async unpublishSlide(id: string, actorEmail = 'admin@icchastore.com'): Promise<HeroSlide | null> {
    return this.updateSlide(id, { status: 'DRAFT' }, actorEmail);
  }

  /**
   * Admin: Archive slide safely
   */
  static async archiveSlide(id: string, actorEmail = 'admin@icchastore.com'): Promise<boolean> {
    const index = heroSlidesStore.findIndex((s) => s.id === id);
    if (index === -1) return false;

    heroSlidesStore[index].status = 'ARCHIVED';
    heroSlidesStore[index].updatedAt = new Date().toISOString();

    await AuditService.log({
      actorEmail,
      action: 'HERO_SLIDE_ARCHIVED',
      entityType: 'HeroSlide',
      entityId: id,
    });

    HeroService.invalidateCache();
    return true;
  }

  /**
   * Admin: Duplicate slide for quick campaign iteration
   */
  static async duplicateSlide(id: string, actorEmail = 'admin@icchastore.com'): Promise<HeroSlide | null> {
    const original = await this.getSlideById(id);
    if (!original) return null;

    const duplicated = await this.createSlide({
      internalName: `${original.internalName || 'Slide'} (Copy)`,
      eyebrow: original.eyebrow,
      title: original.title,
      description: original.description,
      desktopImage: original.desktopImage,
      mobileImage: original.mobileImage,
      imageAlt: original.imageAlt,
      primaryCtaLabel: original.primaryCTA.label,
      primaryCtaUrl: original.primaryCTA.href,
      secondaryCtaLabel: original.secondaryCTA?.label,
      secondaryCtaUrl: original.secondaryCTA?.href,
      contentPosition: original.contentPosition,
      textTheme: original.textTheme,
      desktopImagePosition: original.desktopImagePosition,
      mobileImagePosition: original.mobileImagePosition,
      productId: original.productId,
      categoryId: original.categoryId,
      collectionId: original.collectionId,
      fabricTags: original.fabricTags,
      editorialBadge: original.editorialBadge,
      navLabel: `${original.navLabel} Copy`,
      status: 'DRAFT',
    }, actorEmail);

    return duplicated;
  }

  /**
   * Admin: Transactionally reorder hero slides
   */
  static async reorderSlides(
    reordered: { id: string; sortOrder: number }[],
    actorEmail = 'admin@icchastore.com'
  ): Promise<HeroSlide[]> {
    for (const item of reordered) {
      const slide = heroSlidesStore.find((s) => s.id === item.id);
      if (slide) {
        slide.sortOrder = item.sortOrder;
        slide.slideNumber = String(item.sortOrder).padStart(2, '0');
        slide.updatedAt = new Date().toISOString();
      }
    }

    heroSlidesStore.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

    await AuditService.log({
      actorEmail,
      action: 'HERO_SLIDES_REORDERED',
      entityType: 'HeroSlide',
      entityId: 'batch',
      metadata: { count: reordered.length },
    });

    HeroService.invalidateCache();
    return [...heroSlidesStore];
  }

  /**
   * Next.js cache invalidation helper
   */
  static invalidateCache(): void {
    if (typeof window === 'undefined') {
      try {
        // Dynamic import to prevent client webpack bundling errors
        import('next/cache').then(({ revalidatePath, revalidateTag }) => {
          revalidateTag('homepage-hero');
          revalidatePath('/');
        }).catch(() => {});
      } catch {
        // Non-blocking in dev / test runtime
      }
    }
  }
}
