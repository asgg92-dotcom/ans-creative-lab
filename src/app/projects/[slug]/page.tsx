// src/app/projects/[slug]/page.tsx
'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useMemo } from 'react';
import Link from 'next/link';
import { links } from '@/data/links';
import { experiments } from '@/data/experiments';

function getSlugFromUrl(url: string): string | null {
  if (url.startsWith('/projects/')) return url.replace('/projects/', '');
  return null;
}

const KNOWN_SLUGS = new Set([
  ...links.map((l) => getSlugFromUrl(l.url)).filter((s): s is string => s !== null),
  ...experiments.map((e) => e.slug),
]);

export default function ProjectPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const experiment = useMemo(
    () => experiments.find((e) => e.slug === slug),
    [slug]
  );

  useEffect(() => {
    if (!slug || !KNOWN_SLUGS.has(slug)) {
      router.replace('/');
    }
  }, [slug, router]);

  if (!KNOWN_SLUGS.has(slug)) {
    return null;
  }

  if (experiment) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white p-8">
        <div className="max-w-2xl w-full bg-white/5 border border-white/10 rounded-2xl p-12 shadow-2xl backdrop-blur-sm">
          <span className="text-sm font-mono text-orange-500 mb-4 block">Experiment (WIP)</span>
          <h1 className="text-4xl font-bold mb-6 capitalize text-white">
            {experiment.title ?? slug.replace(/-/g, ' ')}
          </h1>
          <p className="text-gray-400 text-lg leading-relaxed mb-8">
            이 프로젝트는 아직 개발 중입니다.
          </p>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-white text-black rounded-lg hover:opacity-80 transition-opacity"
          >
            메인으로
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white p-8">
      <div className="max-w-2xl w-full bg-white/5 border border-white/10 rounded-2xl p-12 shadow-2xl backdrop-blur-sm">
        <span className="text-sm font-mono text-orange-500 mb-4 block">Project Detail</span>
        <h1 className="text-4xl font-bold mb-6 capitalize text-white">
          {slug.replace(/-/g, ' ')}
        </h1>
        <p className="text-gray-400 text-lg leading-relaxed mb-8">
          이 페이지는 <strong>{slug}</strong> 프로젝트의 상세 내용을 담을 공간입니다.
          <br />
          바이브코딩을 통해 멋진 내용을 채워보세요!
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-3 bg-white text-black rounded-lg hover:opacity-80 transition-opacity"
        >
          메인으로
        </Link>
      </div>
    </div>
  );
}
