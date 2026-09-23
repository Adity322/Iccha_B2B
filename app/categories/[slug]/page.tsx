import CategoryDetailPage from '@/components/category/CatSlug';
import React from 'react';

interface CategoryDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default async function CategoryPage({ params }: CategoryDetailPageProps) {
  const { slug } = await params;

  return (
    <CategoryDetailPage slug={slug} />
  );
}
