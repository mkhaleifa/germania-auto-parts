import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Suspense, cache } from 'react'
import { db } from '@/lib/db'
import { Breadcrumbs } from '@/components/layout/breadcrumbs'
import { ProductGridSkeleton } from '@/components/ui/product-skeleton'
import { ProductListingWrapper } from '../../products/product-listing-wrapper'
import { siteConfig } from '@/config/site'

interface Props {
  params: Promise<{ slug: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

// One DB query per request, shared by generateMetadata and the page
const getCategory = cache((slug: string) =>
  db.category.findUnique({
    where: { slug },
    select: { name: true, slug: true, description: true },
  }),
)

function getDescription(category: {
  name: string
  description: string | null
}) {
  return (
    category.description ||
    `Browse ${category.name} Germania auto parts. Quality parts shipped from Germany.`
  )
}

export async function generateStaticParams() {
  try {
    const categories = await db.category.findMany({
      select: { slug: true },
    })
    return categories.map((cat) => ({ slug: cat.slug }))
  } catch {
    return []
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { slug } = await params
    const category = await getCategory(slug)

    if (!category) return {}

    return {
      title: category.name,
      description: getDescription(category),
      alternates: { canonical: `/categories/${category.slug}` },
    }
  } catch {
    return {}
  }
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params
  const category = await getCategory(slug)

  if (!category) notFound()

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: category.name,
    description: getDescription(category),
    url: `${siteConfig.url}/categories/${category.slug}`,
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: siteConfig.url,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Products',
          item: `${siteConfig.url}/products`,
        },
        { '@type': 'ListItem', position: 3, name: category.name },
      ],
    },
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
      <script
        type="application/ld+json"
        // Escape "<" so a name/description containing "</script>" can't break the page
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
        }}
      />

      <Breadcrumbs
        items={[
          { label: 'Products', href: '/products' },
          { label: category.name },
        ]}
      />

      <div className="mt-6">
        <h1 className="text-2xl font-bold md:text-3xl">{category.name}</h1>
        {category.description && (
          <p className="mt-2 max-w-2xl text-muted-foreground">
            {category.description}
          </p>
        )}
      </div>

      <div className="mt-6">
        <Suspense fallback={<ProductGridSkeleton count={12} />}>
          <ProductListingWrapper
            searchParams={searchParams}
            categorySlug={category.slug}
          />
        </Suspense>
      </div>
    </div>
  )
}
