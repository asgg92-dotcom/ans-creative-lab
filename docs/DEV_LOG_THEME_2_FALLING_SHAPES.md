# Dev Log: Theme 2 - FallingShapes

**작성일:** 2026-02-18
**주제:** 통통 튀는 원형 도형과 인터랙티브 물리 놀이터

## 1. 기획 의도
- **컨셉:** 다양한 크기와 색상의 공들이 쏟아지는 볼풀(Ball Pit) 같은 공간.
- **바이브:** 장난스럽고(Playful), 몽환적인 느낌.
- **기능:** 공을 드래그해서 던지거나, 클릭해서 링크로 이동.

## 2. 주요 구현 기능

### 2.1. 원형 물리 엔진
- **Body:** `Matter.Bodies.circle` 사용.
- **물리 특성:** `restitution: 0.8` (잘 튕김), `friction: 0.001` (잘 구름).
- **랜덤 속성:** 크기(`60px ~ 200px`), 색상(형광 팔레트)을 매번 랜덤하게 생성.

### 2.2. 고급 인터랙션 (드래그 & 클릭)
- **문제:** 물리 객체를 드래그하려는데 클릭(링크 이동)이 되거나, 반대로 클릭하려는데 드래그가 되는 문제.
- **해결:**
    1.  `<a>` 태그 대신 `<div>`를 사용하고 `pointer-events: none` 설정.
    2.  투명한 Canvas를 최상단(`z-index: 10`)에 배치하여 마우스 이벤트를 받음.
    3.  `Matter.Events`를 사용하여 `mousedown` 위치와 `mouseup` 위치를 비교.
    4.  이동 거리가 짧으면(5px 미만) **클릭**으로 간주하여 `window.open`.
    5.  길면 **드래그**로 간주하여 물리 엔진의 `MouseConstraint` 작동.

### 2.3. 디자인 디테일
- **리스폰(Respawn):** 화면 밖으로 멀리 나간 공은 다시 위쪽에서 떨어지게 하여 영원히 즐길 수 있음.
- **타이포그래피:** 원 안의 숫자는 `Montserrat Black` 폰트로 아주 굵게, `mix-blend-overlay`로 은은하게.
- **툴팁:** 마우스를 따라다니는 거대한 텍스트(`text-9xl`), `mix-blend-difference`로 가독성 확보.

## 3. 핵심 코드 (Snippet)

```typescript
// 드래그 vs 클릭 구분 로직
Events.on(mouseConstraint, 'mouseup', (event) => {
  if (!isDragging) { // 드래그하지 않았다면 클릭
    const mousePosition = event.mouse.position;
    const foundBodies = Query.point(shapeBodies, mousePosition);

    if (foundBodies.length > 0) {
      const bodyIndex = parseInt(foundBodies[0].label);
      window.open(links[bodyIndex].url, '_blank');
    }
  }
});
```

## 4. 트러블 슈팅
- **문제:** 툴팁(Hover)이 작동하지 않음.
- **원인:** `pointer-events: none` 때문에 `div`의 `onMouseEnter`가 발생하지 않음.
- **해결:** `Matter.Query.point`를 사용하여 마우스 좌표에 있는 물리 객체를 직접 찾아서 호버 상태를 업데이트함.
