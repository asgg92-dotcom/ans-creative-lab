import Link from 'next/link';
import { experiments } from '@/data/experiments';

export const metadata = {
  title: 'Experiments - LinkHub',
  description: '실험 중인 프로젝트 목록',
};

export default function ExperimentsPage() {
  return (
    <main className="min-h-screen bg-black text-white pt-24 pb-8 px-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-8 text-center">실험 페이지</h1>

        {experiments.length === 0 ? (
          <p className="text-white/40">등록된 실험이 없습니다.</p>
        ) : (
          <ul className="space-y-3">
            {experiments.map((exp) => (
              <li key={exp.slug}>
                <Link
                  href={`/projects/${exp.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block py-3 px-4 rounded-lg border border-white/10 hover:border-white/30 hover:bg-white/5 transition-colors"
                >
                  <span className="font-medium">
                    {exp.title ?? exp.slug.replace(/-/g, ' ')}
                  </span>
                  <span className="text-white/50 text-sm ml-2">
                    /projects/{exp.slug}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
