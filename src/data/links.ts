// LinkHub의 모든 링크와 메타데이터를 관리하는 Config 파일

export interface LinkItem {
  id: string;
  title: string;
  description: string;
  url: string; // 내부 페이지(/projects/1) 또는 외부 링크
  thumbnail?: string; // public/images/ 경로 (없으면 테마별 기본 이미지)
  category: 'Web' | 'Mobile' | 'Design' | 'Other';
  tags?: string[];
  date?: string; // YYYY-MM
  themeConfig?: {
    // 테마별로 특별하게 보여주고 싶은 설정값 (예: Retro 모드에서만 쓸 아이콘)
    retroIcon?: string;
    neonColor?: string;
  };
}

export const links: LinkItem[] = [
  {
    id: '1',
    title: 'Elastic Shard Text', // 제목 변경
    description: '반응형 텍스트와 파티클 폭발 효과의 결합',
    url: '/projects/project-alpha',
    category: 'Web',
    tags: ['Next.js', 'Canvas', 'Variable Font'],
    date: '2026-02-18',
  },
  {
    id: '2',
    title: 'HOLO-DECK', // 제목 변경
    description: '유리 질감의 3D 인터랙티브 카드',
    url: '/projects/project-beta',
    category: 'Design',
    tags: ['React Three Fiber', 'WebGL', '3D'],
    date: '2026-02-19',
  },
  {
    id: '3',
    title: 'ASCII TERMINAL', // 제목 변경
    description: '레트로 해커 스타일의 텍스트 터미널',
    url: '/projects/project-gamma',
    category: 'Web',
    tags: ['Retro', 'Terminal', 'Interactive'],
    date: '2026-02-18',
  },
];
