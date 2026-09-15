import { HeroSlide, HeroSliderConfig } from '@/lib/types/hero';

export const HERO_SLIDER_CONFIG: HeroSliderConfig = {
  autoSlideInterval: 5500, // 5.5s per slide
  transitionDuration: 1.6, // 1.6s silky liquid glass refraction
  distortionIntensity: 0.22, // Elegant, smooth refraction without jarring distortion
  enableSubtleZoom: true,
  enableMouseParallax: true,
};

export const MOCK_HERO_SLIDES: HeroSlide[] = [
  {
    id: 'hero-slide-1',
    slideNumber: '01',
    navLabel: 'New Arrivals',
    eyebrow: 'NEW COLLECTION • VOL. 26',
    title: 'Everyday,\nMade Beautiful.',
    description: 'Contemporary stitched ethnic kurtas & festive sets designed for effortless daylong elegance and boutique showcases.',
    desktopImage: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1920&auto=format&fit=crop&q=85',
    mobileImage: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1080&auto=format&fit=crop&q=85',
    imageAlt: 'IcchaStore Festive Stitched Kurti with Organza Dupatta',
    primaryCTA: {
      label: 'EXPLORE NEW ARRIVALS',
      href: '/collections'
    },
    secondaryCTA: {
      label: 'WHOLESALE ACCESS →',
      href: '/register'
    },
    contentPosition: 'left',
    textTheme: 'light',
    desktopImagePosition: 'center 25%',
    mobileImagePosition: '60% 20%',
    categoryId: 'cat-4',
    fabricTags: ['Pure Muslin', 'Zari Detailing', 'Alia Flared Silhouette'],
    editorialBadge: 'Direct Factory Archive'
  },
  {
    id: 'hero-slide-2',
    slideNumber: '02',
    navLabel: 'Printed Edit',
    eyebrow: 'PRINTS FOR EVERY MOOD',
    title: 'Colour That\nMoves With You.',
    description: 'Fresh Jaipuri Bagru handblocks, 60x60 Cambric cotton, and breathable artisanal motifs tailored for daily comfort.',
    desktopImage: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=1920&auto=format&fit=crop&q=85',
    mobileImage: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=1080&auto=format&fit=crop&q=85',
    imageAlt: 'Jaipuri Handblock Pure Cotton Stitched Kurti Set',
    primaryCTA: {
      label: 'EXPLORE PRINTED KURTAS',
      href: '/categories/daily-wear-pure-cotton-2-pc-sets'
    },
    secondaryCTA: {
      label: 'VIEW LOOKBOOKS',
      href: '/collections'
    },
    contentPosition: 'left',
    textTheme: 'light',
    desktopImagePosition: 'center 30%',
    mobileImagePosition: '55% 20%',
    categoryId: 'cat-6',
    fabricTags: ['Bagru Handblock', '60x60 Cambric Cotton', 'Pocket Pants'],
    editorialBadge: 'Jaipur Craft Hub'
  },
  {
    id: 'hero-slide-3',
    slideNumber: '03',
    navLabel: 'Festive Edit',
    eyebrow: 'THE FESTIVE EDIT',
    title: 'Made For\nBeautiful Moments.',
    description: 'Elevated Chanderi silk and zari-adorned suites crafted for celebrations, weddings, and memorable gatherings.',
    desktopImage: 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?w=1920&auto=format&fit=crop&q=85',
    mobileImage: 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?w=1080&auto=format&fit=crop&q=85',
    imageAlt: 'Pure Chanderi Silk Zari 3-Piece Festive Kurti Suit',
    primaryCTA: {
      label: 'DISCOVER FESTIVE WEAR',
      href: '/categories/pure-chanderi-silk-3-pc-festive-suits'
    },
    secondaryCTA: {
      label: 'EXPLORE OCCASIONS',
      href: '/categories'
    },
    contentPosition: 'left',
    textTheme: 'light',
    desktopImagePosition: 'center 20%',
    mobileImagePosition: '50% 15%',
    categoryId: 'cat-5',
    fabricTags: ['Chanderi Silk', 'Gota Patti Work', 'Organza Cutwork'],
    editorialBadge: 'Surat Silk Division'
  },
  {
    id: 'hero-slide-4',
    slideNumber: '04',
    navLabel: 'Essentials',
    eyebrow: 'ICCHASTORE ESSENTIALS',
    title: 'Styles You’ll\nReach For Again.',
    description: 'Versatile straight-cut kurtas and coordinated workwear sets created for confidence, breathability, and all-day ease.',
    desktopImage: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=1920&auto=format&fit=crop&q=85',
    mobileImage: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=1080&auto=format&fit=crop&q=85',
    imageAlt: 'Straight-cut Everyday Cotton Kurti Set',
    primaryCTA: {
      label: 'SHOP EVERYDAY KURTAS',
      href: '/categories/straight-kurti-with-pant-2-pc'
    },
    secondaryCTA: {
      label: 'VIEW 2-PC LOTS',
      href: '/categories'
    },
    contentPosition: 'left',
    textTheme: 'light',
    desktopImagePosition: 'center 25%',
    mobileImagePosition: '50% 20%',
    categoryId: 'cat-1',
    fabricTags: ['100% Pure Cotton', 'Tailored Pants', 'All-Day Comfort'],
    editorialBadge: 'Daily High Velocity'
  },
  {
    id: 'hero-slide-5',
    slideNumber: '05',
    navLabel: 'Kurta Sets',
    eyebrow: 'CURATED SETS',
    title: 'One Look.\nEffortlessly Complete.',
    description: 'Thoughtfully coordinated 2-piece and 3-piece designer sets featuring high-slit Nayra cuts and gathered waistlines.',
    desktopImage: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=1920&auto=format&fit=crop&q=85',
    mobileImage: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=1080&auto=format&fit=crop&q=85',
    imageAlt: 'Trending Nayra Cut Flared Kurti Pant Set',
    primaryCTA: {
      label: 'EXPLORE KURTA SETS',
      href: '/categories/nayra-cut-kurti-pant-set-2-pc'
    },
    secondaryCTA: {
      label: 'APPLY FOR ACCESS →',
      href: '/register'
    },
    contentPosition: 'left',
    textTheme: 'light',
    desktopImagePosition: 'center 20%',
    mobileImagePosition: '60% 15%',
    categoryId: 'cat-3',
    fabricTags: ['Nayra Cut Flare', 'Mirror Work', 'Matched Pants'],
    editorialBadge: 'Top Trending Lot'
  }
];
