// 실험(미완료) 페이지 목록 - 메인 페이지 links에 포함되지 않음

export interface ExperimentItem {
  slug: string; // 폴더명 및 URL 경로 (예: linguistic-organism)
  title?: string; // (선택) 임시 제목
  description?: string; // (선택) 메모
}

export const experiments: ExperimentItem[] = [
  { slug: 'linguistic-organism', title: 'Linguistic Organism (WIP)' },
  // 새 실험 추가 시 여기에 등록
];
