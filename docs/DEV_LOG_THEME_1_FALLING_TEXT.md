# Dev Log: Theme 1 - FallingText

**작성일:** 2026-02-18
**주제:** 압도적인 타이포그래피와 물리 엔진의 만남

## 1. 기획 의도
- **컨셉:** 화면을 가득 채우는 거대한 텍스트들이 하늘에서 쏟아지는 효과.
- **바이브:** 무겁고 강력한 임팩트 (Heavy Impact).
- **인터랙션:** 마우스로 글자를 집어 던지거나, 호버 시 색상이 변함.

## 2. 주요 구현 기능

### 2.1. Matter.js 물리 엔진 적용
- **엔진:** `Matter.Engine`, `Matter.World`, `Matter.Bodies` 사용.
- **렌더링:** `Matter.Render`는 디버깅용으로만 사용하거나 투명하게 설정하고, 실제로는 DOM 요소(`<a>`)의 `transform`을 업데이트하여 물리 객체와 동기화.
- **벽(Wall) 생성:** 화면 밖으로 나가지 않도록 좌/우/바닥에 보이지 않는 벽 설치.

### 2.2. 타이포그래피 디자인
- **폰트:** `Inter` (Black Weight)
- **크기:** `text-[5rem]` ~ `text-[8rem]` (모바일/PC 반응형).
- **스타일:** `tracking-tighter`, `leading-none`으로 아주 쫀쫀하고 꽉 찬 느낌 연출.

### 2.3. 디테일 조정 (Vibe Tuning)
- **낙하 속도:** 공기 저항(`frictionAir`)을 `0.01`로 낮추고 중력(`gravity.y`)을 `1.5`로 높여서 **"쿵!"** 하고 떨어지는 무게감 구현.
- **랜덤 낙하:** `y` 좌표를 `-2000px`까지 분산시켜 시간차를 두고 떨어지게 함.
- **호버 효과:** 마우스 오버 시 형광색(Neon) 팔레트(`HOVER_COLORS`) 중 하나로 랜덤하게 변함.
- **타이트한 충돌 박스:** 글자 길이에 맞춰 물리 객체의 너비를 정교하게 계산(`charWidth * 70 + 40`).

## 3. 핵심 코드 (Snippet)

```typescript
// 물리 객체와 DOM 요소 동기화 루프
const updateDOM = () => {
  textBodies.forEach((body) => {
    const index = parseInt(body.label);
    const domElement = itemRefs.current[index];

    if (domElement) {
      const { x, y } = body.position;
      const rotation = body.angle;
      
      // 물리 좌표 -> CSS Transform 변환
      domElement.style.transform = `translate(${x - width/2}px, ${y - height/2}px) rotate(${rotation}rad)`;
    }
  });
  requestAnimationFrame(updateDOM);
};
```

## 4. 트러블 슈팅
- **문제:** `Matter.js`와 React의 라이프사이클 충돌.
- **해결:** `useEffect` 내에서 엔진 초기화 및 클린업을 철저히 관리하고, `requestAnimationFrame`을 사용하여 부드러운 프레임 갱신 구현.
- **문제:** 캔버스 렌더러와 DOM 요소의 위치 불일치.
- **해결:** 물리 객체의 중심점(`center`)과 DOM 요소의 중심점(`transformOrigin: 50% 50%`)을 일치시킴.
