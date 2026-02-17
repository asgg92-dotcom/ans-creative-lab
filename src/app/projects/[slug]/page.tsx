// src/app/projects/[slug]/page.tsx
'use client';

import { useParams } from 'next/navigation';

export default function ProjectPage() {
  const params = useParams();
  const slug = params.slug as string;

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
        <button 
          onClick={() => window.close()} // 닫기 버튼 (새 창이므로)
          className="px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-lg hover:opacity-80 transition-opacity"
        >
          닫기
        </button>
      </div>
    </div>
  );
}
