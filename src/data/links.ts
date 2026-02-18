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
    title: 'Elastic Shard Text',
    description: '반응형 텍스트와 파티클 폭발 효과의 결합',
    url: '/projects/elastic-shard-text',
    category: 'Web',
    tags: ['Next.js', 'Canvas', 'Variable Font'],
    date: '2026-02-18',
  },
  {
    id: '2',
    title: 'Lo-Fi Desk Widget',
    description: '따뜻한 감성의 3D Zdog 디오라마',
    url: '/projects/lo-fi-desk-widget',
    category: 'Design',
    tags: ['Zdog', '3D', 'Interactive'],
    date: '2026-02-21',
  },
  {
    id: '3',
    title: 'Reflective Abstract',
    description: '반사 재질의 추상 도형과 마우스 조명 효과',
    url: '/projects/project-gamma',
    category: 'Design',
    tags: ['R3F', 'Three.js', 'Postprocessing'],
    date: '2026-02-22',
  },
];
