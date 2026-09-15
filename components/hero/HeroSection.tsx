import React from 'react';
import WebGLHeroSlider from './WebGLHeroSlider';
import { HeroService } from '@/lib/services/heroService';

export default async function HeroSection() {
  const [slides, config] = await Promise.all([
    HeroService.getHeroSlides(),
    HeroService.getHeroConfig(),
  ]);

  return (
    <section className="relative w-full overflow-hidden bg-[#141414]" aria-label="Hero Showcase">
      <WebGLHeroSlider slides={slides} config={config} />
    </section>
  );
}
