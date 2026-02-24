# Circle Draw - 기술 문서

드래그로 타원을 그리고, Matter.js 물리 엔진으로 폭발하는 인터랙티브 캔버스 프로젝트의 기술 문서입니다.

---

## 1. 프로젝트 개요

| 항목 | 내용 |
|------|------|
| **경로** | `/projects/circle-draw` |
| **URL** | `/projects/circle-draw` |
| **랜딩 링크명** | Circle Draw |
| **기술 스택** | Next.js, Matter.js, Canvas 2D |

### 핵심 기능

- 마우스/터치로 드래그하여 타원 생성
- 생성된 타원은 중력에 의해 낙하
- 1~3초(랜덤) 후 자동 폭발
- 폭발 시 다양한 다각형(삼각형~육각형, 별 모양) 파편 생성
- 파편은 3단계까지 연쇄 폭발 (최종 3차 파편은 터지며 사라짐)

---

## 2. 대화 흐름 / 기능 진화

개발 과정에서의 요구사항 변화와 해결 과정을 정리합니다.

### 2.1 초기 요구사항

1. **마우스 드래그로 원 생성** + 물리 엔진 적용
2. **커스텀 커서**: 해당 페이지에서만 주황색 커스텀 커서 비활성화
3. **타원 지원**: 드래그 비율에 맞는 타원, 최대 크기 제한 제거
4. **물리 엔진**: 드래그로 만든 도형이 아래로 떨어지도록 구현

### 2.2 트러블슈팅

| 문제 | 원인 | 해결 |
|------|------|------|
| 드래그 미작동 | Matter Render canvas와 이벤트 타이밍 충돌 | 단일 canvas + 직접 이벤트 처리 |
| 중력 미작동 | `Runner.run(engine)` 인자 오류로 `Engine.update` 미호출 | `requestAnimationFrame`에서 `Engine.update` 직접 호출 |
| 폭발 미작동 | `engine.timing.timestamp` 단위/동기화 이슈 | `performance.now()`로 실제 경과 시간 측정 |
| 폭발 미작동 | `afterUpdate` 이벤트 대신 draw 루프에서 직접 체크 | 단일 useEffect로 통합, draw 루프 내 폭발 체크 |
| 폭발 미작동 | body에 저장한 `createdAt`/`explodeAfterMs`가 Matter.js 업데이트로 유실 | `bodyTimingRef` (Map) 사용, body.id를 키로 타이밍 저장 |
| 폭발 미작동 | `MIN_EXPLODE_SIZE`로 작은 타원 필터링 | 제한 제거 및 body.parts 처리 |
| 렉 | 바디 수 무제한 증가 | 화면 밖 제거, 바디 많을 때 파편 수 감소 |

### 2.3 기능 추가

- **폭발 효과**: 생성 후 일정 시간(5초→2~5초→1~3초) 후 화려하게 터짐
- **파편 다양화**: 삼각형, 사각형, 오각형, 육각형, 4/5/6각 별 등
- **연쇄 폭발**: 파편도 1번 더 터짐 → 2차 파편도 한 번 더 → 3차 파편은 터지며 사라짐
- **UI 정리**: 좌측 텍스트, 우측 '메인으로' 버튼 삭제
- **외곽선 제거**: 도형 흰색 테두리 제거
- **실험실 → 랜딩**: experiments에서 제거, links에 'Circle Draw' 추가
- **모바일 지원**: 터치 이벤트 추가

---

## 3. 기술적 구현

### 3.1 파일 구조

```
src/app/projects/circle-draw/
├── page.tsx              # 페이지 레이아웃 (캔버스만 렌더)
└── MatterPhysicsCanvas.tsx  # 핵심 로직 (물리 엔진, 렌더, 이벤트)
```

### 3.2 상수

| 상수 | 값 | 설명 |
|------|-----|------|
| `ELLIPSE_SEGMENTS` | 48 | 타원 꼭짓점 수 (둥글기) |
| `EXPLODE_MIN_MS` | 1000 | 폭발 최소 대기 시간 (ms) |
| `EXPLODE_MAX_MS` | 3000 | 폭발 최대 대기 시간 (ms) |
| `FRAGMENT_COUNT` | 12 | 폭발 시 생성 파편 수 |
| `FRAGMENT_REDUCE_THRESHOLD` | 400 | 이 수 이상 바디 시 파편 수 반감 |
| `OFFSCREEN_MARGIN` | 150 | 화면 밖 이 거리 이상 바디 제거 |

### 3.3 타원 생성

```typescript
// 타원 꼭짓점: 극좌표 → 직교좌표
function createEllipseVertices(rx: number, ry: number): Matter.Vector[] {
  for (let i = 0; i < ELLIPSE_SEGMENTS; i++) {
    const angle = (i / ELLIPSE_SEGMENTS) * Math.PI * 2;
    vertices.push({
      x: Math.cos(angle) * rx,
      y: Math.sin(angle) * ry,
    });
  }
}
```

- `Matter.Bodies.fromVertices(cx, cy, [vertices], options)`로 타원 바디 생성
- 실패 시 `Matter.Bodies.circle`로 폴백

### 3.4 폭발 세대(generation)

| generation | 설명 | 동작 |
|------------|------|------|
| 0 | 초기 타원 | 1~3초 후 폭발 → 12개 파편 생성 |
| 1 | 1차 파편 | 1~3초 후 폭발 → 12개 파편 생성 |
| 2 | 2차 파편 | 1~3초 후 폭발 → 12개 파편 생성 |
| 3 | 3차 파편 | 1~3초 후 폭발 → **바디 제거만** (사라짐) |

### 3.5 파편 도형

- `createRandomFragmentVertices(size)`: 7가지 도형 중 랜덤 선택
  - 삼각형, 사각형, 오각형, 육각형
  - 4각 별, 5각 별, 6각 별
- `createStarVertices(outerR, innerR, points)`: 바깥/안쪽 반지름 교차로 별 꼭짓점 생성

### 3.6 타이밍

- `performance.now()`로 생성 시점 기록
- `afterUpdate` 이벤트(또는 draw 루프)에서 `now - createdAt > explodeAfterMs` 체크
- Matter.js `engine.timing.timestamp`는 사용하지 않음 (동기화 이슈)

### 3.7 이벤트 흐름

```
[마우스]                    [터치]
mousedown  ─┐              touchstart ─┐
            ├─→ onPointerDown          │
mousemove ─┼─→ onPointerMove          ├─→ 동일 로직
            │              touchmove ──┤
mouseup ───┼─→ onPointerUp            │
mouseleave ┘              touchend ──┘
                          touchcancel ┘
```

- `getCoordsFromClient(clientX, clientY)`: 캔버스 좌표로 변환 (마우스/터치 공통)
- `touchAction: 'none'`, `passive: false`로 스크롤 방지

---

## 4. 성능 최적화

### 4.1 화면 밖 바디 제거

```typescript
// y > h + OFFSCREEN_MARGIN 인 바디 제거
const toRemoveOffscreen = bodies.filter(
  (b) => !b.isStatic && b.position.y > h + OFFSCREEN_MARGIN
);
```

### 4.2 바디 많을 때 파편 수 감소

```typescript
const fragmentCount = bodyCount > FRAGMENT_REDUCE_THRESHOLD
  ? Math.max(4, Math.floor(FRAGMENT_COUNT * 0.5))  // 6개
  : FRAGMENT_COUNT;  // 12개
```

### 4.3 단일 useEffect

- engine 생성, draw 루프, resize를 하나의 useEffect로 통합
- engine이 준비된 상태에서 draw가 실행되도록 보장

---

## 5. Matter.js 관련

### 5.1 사용 모듈

- `Engine`, `Composite`, `Bodies`, `Body`, `Events`
- `Bodies.fromVertices`, `Bodies.rectangle`, `Bodies.circle`
- `Composite.add`, `Composite.remove`, `Composite.allBodies`
- `Engine.update`, `Engine.create`, `Engine.clear`
- `Events.on`, `Events.off` (afterUpdate)

### 5.2 Body 커스텀 속성

```typescript
interface TimedBody extends Matter.Body {
  createdAt?: number;      // performance.now() 생성 시점
  explodeAfterMs?: number; // 1000~3000 랜덤
  generation?: number;     // 0~3
}
```

- body 객체에 직접 저장 (Matter.js가 유지하지 않을 수 있어 Map 사용도 고려했으나, 현재는 body 속성 유지)

### 5.3 렌더링

- Matter.js Render는 사용하지 않음
- 단일 `<canvas>`에 `requestAnimationFrame`으로 직접 draw
- `body.circleRadius` 있으면 → `ctx.arc`
- `body.vertices` 있으면 → `ctx.moveTo` / `ctx.lineTo`로 폴리곤

---

## 6. 모바일 터치

| 이벤트 | 동작 |
|--------|------|
| touchstart | `e.preventDefault()`, 첫 터치로 onPointerDown |
| touchmove | `e.touches[0]` 좌표로 onPointerMove |
| touchend / touchcancel | onPointerUp (타원 생성) |

- `touch-action: none`으로 캔버스 내 터치 시 스크롤/줌 방지
- `passive: false`로 `preventDefault()` 사용 가능

---

## 7. 관련 파일

| 파일 | 역할 |
|------|------|
| `src/data/links.ts` | 랜딩 페이지 'Circle Draw' 링크 |
| `src/components/ui/CustomCursor.tsx` | `/projects/circle-draw`에서 커스텀 커서 비활성화 |

---

## 8. 참고

- [Matter.js 공식 문서](https://brm.io/matter-js/)
- `engine.timing.timestamp`는 ms 단위, 실제 경과 시간과 동기화 이슈 가능 → `performance.now()` 권장
- `Bodies.fromVertices`는 단일 Body 반환 (compound body는 parts 배열 포함 가능)
