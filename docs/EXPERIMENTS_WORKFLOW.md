# 실험 페이지 워크플로우

미완료 프로젝트를 메인 페이지에 노출하지 않고, 로컬에서 쉽게 확인하고, 완료 시 메인에 추가하는 방법입니다.

## 단계별 워크플로우

| 단계 | 작업 |
|------|------|
| **시작** | `src/app/projects/my-experiment/` 폴더 생성, `src/data/experiments.ts`에 `{ slug: 'my-experiment' }` 추가 |
| **확인** | `npm run dev` → `/ex`에서 링크 클릭하여 `/projects/my-experiment` 확인 |
| **완료** | 1) 페이지 최종 이름 결정 2) `src/data/links.ts`에 LinkItem 추가 3) `experiments.ts`에서 해당 항목 제거 4) 필요 시 폴더명 변경 (slug 변경 시) |

## 파일 구조

- **links.ts**: 메인 페이지에 표시되는 완료된 프로젝트만 등록
- **experiments.ts**: 실험(미완료) 프로젝트 등록 → `/ex` 인덱스에서 목록 확인
- **/ex**: 실험 목록 페이지, 클릭 시 `/projects/[slug]`로 이동

## 새 실험 시작하기

1. `src/app/projects/[원하는-slug]/page.tsx` 생성
2. `src/data/experiments.ts`에 추가:

```ts
{ slug: '원하는-slug', title: '임시 제목 (선택)', description: '메모 (선택)' }
```

3. `npm run dev` → 브라우저에서 `/ex` 접속 → 링크로 바로 확인

## 실험 완료하기

1. 최종 표시 이름(title), URL(slug), 설명 등 결정
2. `src/data/links.ts`에 LinkItem 추가 (id, title, description, url, category, tags 등)
3. `src/data/experiments.ts`에서 해당 항목 제거
4. slug를 바꾼 경우: `src/app/projects/` 폴더명도 변경하고, links.ts의 url 반영
