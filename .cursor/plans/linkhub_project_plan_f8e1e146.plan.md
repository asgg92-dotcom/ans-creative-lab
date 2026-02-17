---
name: ""
overview: ""
todos: []
isProject: false
---

# LinkHub 프로젝트 기획서

## 1. 프로젝트 개요

- **목표:** 다양한 링크를 모아서 보여주는 허브 웹사이트 구축.
- **핵심 기능:** 사용자가 스위치 버튼을 통해 링크 목록의 보기 방식(리스트, 카드, 그리드)을 자유롭게 변경 가능.
- **확장성:** 추후 하위 페이지를 지속적으로 추가하고 통합할 수 있는 모듈형 구조.
- **배포:** Vercel을 통한 기업용/상용 배포 고려.

## 2. 기술 스택 및 개발 환경

- **프레임워크:** Next.js 14+ (App Router) - 파일 시스템 기반 라우팅과 최적화된 성능 제공.
- **언어:** TypeScript - 코드 안정성 및 유지보수 용이성 확보 (페이지 추가 시 타입 오류 방지).
- **스타일링:** Tailwind CSS - 빠른 UI 개발 및 일관된 디자인 시스템 적용.
- **상태 관리:** React Context API (`ViewModeContext`) - 전역적인 뷰 모드 상태 공유.
- **버전 관리:** Git - Vercel 배포와의 연동을 위함.

## 3. 기능 명세 및 UI 구조 (목표 1: 바이브코딩 & 가변형 UI)

### 3.1. 화면 구성

- **헤더:** 로고, 다크 모드 토글(선택), **뷰 모드 스위치 (List / Card / Grid)**.
- **메인 컨텐츠:** 링크 아이템들이 선택된 뷰 모드에 따라 다르게 렌더링되는 영역.
- **푸터:** 저작권 및 정보.

### 3.2. 뷰 모드 (View Mode)

1. **List View:** 텍스트 위주의 간결한 목록. 제목과 짧은 설명 표시.
2. **Card View:** 썸네일(아이콘)과 상세 설명이 포함된 카드 형태.
3. **Grid View:** 좁은 공간에 많은 링크를 배치하는 격자 형태.

### 3.3. 데이터 구조 (TypeScript Interface)

```typescript
interface LinkItem {
  id: string;
  title: string;
  description: string;
  url: string; // 하위 페이지 경로 (예: /sub-page-1) 또는 외부 링크
  icon?: string; // 아이콘 식별자 또는 이미지 경로
  tags?: string[];
}
```

## 4. 확장성 및 외부 코드 통합 가이드 (목표 2: 하위 페이지 추가)

### 4.1. 프로젝트 폴더 구조

```
/app
  /page.tsx        # 메인 페이지
  /[slug]/page.tsx # 동적 하위 페이지 (선택 사항)
  /sub-page-1/     # 개별 하위 페이지 폴더
/components
  /ui/             # 재사용 가능한 UI (Button, Card 등)
  /links/          # 링크 관련 컴포넌트 (LinkCard, LinkList, LinkGrid)
  /layout/         # 레이아웃 컴포넌트 (Header, Container)
/data              # 링크 데이터 (JSON 또는 TS 파일)
```

### 4.2. "다른 폴더"에서 작업한 코드 통합 프로세스

다른 곳(바이브코딩 등)에서 개발한 페이지를 이 프로젝트로 가져오는 표준 절차입니다.

1. **독립성 확보:** 외부에서 작업할 때도 본 프로젝트의 `components/ui` 폴더를 복사하여 사용하거나, 표준 HTML/Tailwind 구조를 유지해야 통합이 쉽습니다.
2. **파일 복사:** 개발된 페이지의 핵심 로직(`page.tsx` 내용)을 `app/새로운-페이지-이름/page.tsx`로 복사합니다.
3. **의존성 체크:** 외부 코드에서 사용된 패키지(예: framer-motion 등)가 본 프로젝트에도 설치되어 있는지 확인하고 (`package.json`), 없으면 설치합니다.
4. **컴포넌트 경로 수정:** import 경로를 상대 경로(`../../components`)에서 절대 경로(`@/components`)로 수정하여 깨짐을 방지합니다.

## 5. 배포 및 운영 전략 (목표 3: Vercel 배포)

### 5.1. 배포 프로세스

1. **GitHub 리포지토리 생성:** 코드를 Private/Public 리포지토리에 업로드.
2. **Vercel 프로젝트 생성:**
  - GitHub 계정 연동.
    - 해당 리포지토리 선택 (Import).
    - **Team Scope:** 회사 계정 사용 시 Team을 생성하거나 선택하여 프로젝트 생성.
3. **환경 변수 설정:** 필요한 API 키 등이 있다면 Vercel 대시보드 Settings > Environment Variables에 등록.
4. **자동 배포:** `main` 브랜치에 푸시될 때마다 자동으로 프로덕션 배포.

### 5.2. 로컬 개발 시 주의사항

- Vercel 배포 환경과 동일하게 맞추기 위해 Node.js 버전을 확인합니다.
- 빌드 에러 방지를 위해 배포 전 반드시 `npm run build`를 로컬에서 실행해봅니다.

## 6. 구현 로드맵 (Todos)

- **프로젝트 초기화:** Next.js, TypeScript, Tailwind CSS 설치 및 설정 (Git 초기화 포함) 
- **기본 UI 컴포넌트 개발:** 버튼, 레이아웃 컨테이너 등 공통 컴포넌트 작성 
- **링크 데이터 모델링:** LinkItem 인터페이스 정의 및 더미 데이터 생성 
- **상태 관리 구현:** ViewModeContext 생성 (List/Card/Grid 상태 관리) 
- **뷰 모드별 컴포넌트 개발:** LinkList, LinkCard, LinkGrid 컴포넌트 각각 구현 
- **메인 페이지 조립:** Switch 버튼과 링크 컨테이너를 메인 페이지에 통합 
- **하위 페이지 추가 테스트:** 샘플 하위 페이지를 생성하여 라우팅 및 스타일 일관성 확인 
- **배포 준비:** 빌드 테스트 및 README 작성 (통합/배포 가이드 포함)

