# LinkHub 프로젝트 기획서 (업데이트됨)

Last Updated: 2026-02-18 (수) 13:00

## 1. 프로젝트 개요
- 목표: 다양한 링크(포트폴리오, 작업물)를 모아서 보여주는 "살아 움직이는 미니멀 갤러리" 구축.
- 핵심 컨셉: 바이브코딩 (역동적이고 감각적인 UI/UX).
- 디자인: 미니멀 & 모던 (콘텐츠 중심).
- 배포: Vercel (Team Scope) 고려.

## 2. 기술 스택 및 개발 환경
- 프레임워크: Next.js 14+ (App Router)
- 언어: TypeScript
- 스타일링: Tailwind CSS (미니멀 디자인 시스템)
- 애니메이션: Framer Motion (필수 - 뷰 모드 전환 시 탄성 및 유동적 움직임 구현)
- 아이콘: Lucide React
- 배포: Vercel

## 3. 기능 명세 및 UI 구조

### 3.1. 화면 구성
- 헤더: 로고(텍스트), 뷰 모드 스위치 (List / Card / Grid), 다크모드 토글.
- 메인 컨텐츠: 포트폴리오 성격의 링크 아이템들이 애니메이션과 함께 렌더링.
- 인터랙션:
    - 뷰 모드 전환 시 요소들이 `layoutId`를 통해 자연스럽게 변형(morphing)됨.
    - 스크롤 시 요소들이 순차적으로 등장(Stagger Children).

### 3.2. 뷰 모드 상세 (View Mode)
1.  List View: 썸네일(작게) + 제목 + 설명 + 태그. 가로로 긴 형태.
2.  Card View: 썸네일(크게, 16:9 비율) 강조 + 제목 + 설명. 일반적인 포트폴리오 스타일.
3.  Grid View: 썸네일 위주(Pinterest 스타일 Masonry 또는 정방형). 한 화면에 많은 정보 노출.

### 3.3. 데이터 구조 (TypeScript Interface)
```typescript
export interface LinkItem {
  id: string;
  title: string;
  description: string;
  url: string; // 내부 페이지(/projects/1) 또는 외부 링크
  thumbnail: string; // 필수: 포트폴리오 썸네일 경로 (public/images/)
  category: 'Web' | 'Mobile' | 'Design' | 'Other'; // 필터링용
  tags?: string[];
  date?: string; // 작업 시기 (YYYY-MM)
}
```

## 4. 확장성 및 외부 코드 통합 가이드 (전략 반영)

### 4.1. 프로젝트 폴더 구조 (제안)
```
/app
  /layout.tsx      # 전역 레이아웃 (테마 스위치, 배경)
  /page.tsx        # 메인 페이지 (링크 목록)
  /projects
    /[slug]/page.tsx # 동적 하위 페이지 (Config 기반 라우팅)
/_experiments      # [전략 1] 자유로운 실험 공간 (App Router 제외)
/components
  /ui/             # 재사용 가능한 UI (Button, Card 등)
  /themes/         # [전략 3] 테마별 컴포넌트 (ThemeRetro, Theme3D 등)
/data              # [전략 2] 링크 데이터 (links.ts - Config 중앙 관리)
```

### 4.2. 개발 및 배포 워크플로우
1.  실험: `_experiments/new-idea.tsx`에서 자유롭게 컴포넌트 개발.
2.  이동: 완성된 컴포넌트를 `app/projects/new-idea/page.tsx`로 이동.
3.  등록: `data/links.ts` 배열에 정보 추가.
    ```typescript
    // data/links.ts 예시
    export const links = [
      { id: '1', title: 'New Idea', path: '/projects/new-idea', ... }
    ]
    ```
4.  자동 반영: 메인 페이지 리스트에 자동으로 추가됨.

## 5. 구현 로드맵 (Todos)

[ ] 프로젝트 초기화: Next.js, TypeScript, Tailwind, Framer Motion 설치 <!-- id: init-project -->
[ ] 아키텍처 구성:
    - `data/links.ts` 생성 및 Config 구조 정의 <!-- id: config-setup -->
    - `_experiments` 폴더 및 기본 레이아웃 구성 <!-- id: layout-setup -->
[ ] 테마 시스템 구현:
    - `ThemeContext` 및 스위치 로직 개발 <!-- id: theme-system -->
    - 3가지 이상의 재미있는 테마(Retro, 3D, Minimal 등) 구현 <!-- id: theme-impl -->
[ ] 메인 페이지 개발: Config 기반 리스트 렌더링 및 테마 적용 <!-- id: main-page -->
[ ] 하위 페이지 실험: 샘플 프로젝트를 `_experiments`에서 개발 후 배포 <!-- id: experiment-test -->
[ ] 배포 준비: Vercel 배포 및 최종 점검 <!-- id: deploy-prep -->
