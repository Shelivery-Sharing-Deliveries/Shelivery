'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { PageLayout } from '@/components/ui/PageLayout';
import { notFound } from 'next/navigation';

interface BlogSection {
  type: 'heading' | 'text' | 'image';
  content?: string;
  image_url?: string;
}

interface BlogContent {
  title: string;
  sections: BlogSection[];
}

interface ShopBlog {
  shop: {
    id: string;
    name: string;
    logo_url: string | null;
  };
  blog: {
    title: string;
    content: BlogContent;
  } | null;
}

export default function ShopBlogPage() {
  const params = useParams();
  const router = useRouter();
  const shopId = params.shopId as string;
  const [data, setData] = useState<ShopBlog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBlog() {
      try {
        const response = await fetch(`/api/shops/${shopId}/blog`, {
          cache: 'no-store',
        });

        if (!response.ok) {
          throw new Error('Failed to fetch');
        }

        const result = await response.json();
        setData(result);
      } catch (err) {
        setError('Failed to load blog');
      } finally {
        setLoading(false);
      }
    }

    fetchBlog();
  }, [shopId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-shelivery-background-gray flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-shelivery-primary-yellow border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-shelivery-text-secondary">Loading blog...</p>
        </div>
      </div>
    );
  }

  if (error || !data?.shop) {
    notFound();
  }

  const blog = data.blog;

  const headerContent = (
    <div>
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-shelivery-text-secondary hover:text-shelivery-text-primary mb-4"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
        Back
      </button>

      <div className="text-center pb-6">
        <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-[12px] flex items-center justify-center">
          {data.shop.logo_url ? (
            <Image
              src={data.shop.logo_url}
              alt={data.shop.name}
              width={80}
              height={80}
              className="w-full h-full object-cover rounded-[12px]"
            />
          ) : (
            <div className="w-12 h-12 bg-gray-300 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-4L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
          )}
        </div>
        <h1 className="text-2xl font-bold text-shelivery-text-primary mb-2">
          {data.shop.name}
        </h1>
        <p className="text-lg text-shelivery-text-secondary">Blog</p>
      </div>
    </div>
  );

  return (
    <PageLayout header={headerContent}>
      <div className="max-w-4xl mx-auto px-4 py-8">
        {blog ? (
          <>
            <article className="prose prose-headings:text-shelivery-text-primary prose-p:text-shelivery-text-primary max-w-none">
              <h1>{blog.content.title}</h1>
              {blog.content.sections.map((section, index) => (
                <div key={index} className="mb-8">
                  {section.type === 'heading' && (
                    <h2 className="text-xl font-semibold text-shelivery-text-primary mb-4">{section.content}</h2>
                  )}
                  {section.type === 'text' && (
                    <p className="text-lg text-shelivery-text-primary leading-relaxed mb-6 whitespace-pre-wrap">{section.content}</p>
                  )}
                  {section.type === 'image' && section.image_url && (
                    <div className="mb-8">
                      <Image
                        src={`${section.image_url}?v=${Date.now()}`}
                        alt=""
                        width={600}
                        height={300}
                        className="w-full h-auto max-h-[400px] object-cover rounded-shelivery-lg shadow-lg"
                      />
                    </div>
                  )}
                </div>
              ))}
            </article>
          </>
        ) : (
          <div className="text-center py-20">
            <div className="w-16 h-16 mx-auto mb-6 text-gray-400">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-shelivery-text-primary mb-4">
              No blog post yet
            </h2>
            <p className="text-shelivery-text-secondary">
              {data.shop.name} hasn't published a blog post yet. Check back soon!
            </p>
          </div>
        )}
      </div>
    </PageLayout>
  );
}