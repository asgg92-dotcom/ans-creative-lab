// 메인 페이지: Server Component로 유지하여 데이터 패칭이나 최적화에 유리합니다.
import { links } from '@/data/links';
import { ThemeRenderer } from '@/components/ThemeRenderer';

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-black dark:bg-black dark:text-white">
      {/* 
        테마 렌더러 (Client Component) 
        여기에 데이터를 주입하면, 현재 선택된 테마에 맞춰서 그려줍니다.
      */}
      <ThemeRenderer links={links} />
    </main>
  );
}
