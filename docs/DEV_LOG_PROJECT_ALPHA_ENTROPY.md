# Dev Log: Project Alpha - ENTROPY

**작성일:** 2026-02-18
**주제:** 질서(Text)와 혼돈(Shard)의 순환, 우주적 엔트로피

## 1. 기획 의도
- **컨셉:** 평소에는 쫀득한 고무줄처럼 반응하다가, 클릭하면 산산조각 나서 우주 먼지처럼 흩어지는 텍스트.
- **바이브:** SF, 사이버펑크, 파괴와 재생.
- **기술:** Variable Font (Elastic) + HTML5 Canvas (Shard).

## 2. 주요 구현 기능

### 2.1. Elastic Text (Variable Font)
- **폰트:** `Inter` (Variable Font 지원).
- **로직:** 마우스와 글자 사이의 거리를 계산하여 `font-variation-settings: 'wght' ...` 값을 실시간으로 변경.
- **효과:** 마우스가 지나가면 글자가 두꺼워지며 꿀렁거리는 느낌.

### 2.2. Shard Particle System (Canvas)
- **생성:** 캔버스에 텍스트를 그리고 `getImageData`로 픽셀을 스캔하여 파티클 생성.
- **형태:** 랜덤한 꼭짓점(3~5개)을 가진 **다각형(Polygon)**. 크기는 지수 분포를 사용하여 아주 작은 것부터 거대한 것까지 다양함.
- **물리:**
    - **폭발:** 초기 속도를 매우 높게(`60~150`) 주어 쾅 터지는 느낌.
    - **무중력:** 마찰을 없애고(`1.0`) 벽에 튕기게 하여 영원히 부유함.
    - **유동성:** 랜덤한 힘(`Noise`)을 계속 주어 정지하지 않음.

### 2.3. 역재생 (Rewind & Repair)
- **타이머:** 폭발 3초 후 복구 모드 진입.
- **로직:** 파티클들이 자신의 원래 위치(`originX`, `originY`)로 `Lerp` 이동.
- **피날레:** 파티클이 모이면 사라지고, DOM 글자가 `opacity` 트랜지션으로 스르륵 나타남. (아이언맨 슈트 착용 효과)

## 3. 핵심 코드 (Snippet)

```typescript
// 파티클 생성 (픽셀 스캔)
const imageData = tempCtx.getImageData(scanX, scanY, scanW, scanH);
for (let y = 0; y < scanH; y += step) {
  for (let x = 0; x < scanW; x += step) {
    if (data[index + 3] > 128) { // 알파값이 있는 픽셀만
       // 파티클 생성 (랜덤 다각형, 랜덤 색상, 랜덤 크기)
       newShards.push({ ... });
    }
  }
}

// 역재생 로직
if (shard.returning) {
  shard.x += (shard.originX - shard.x) * 0.15; // Lerp 이동
  shard.y += (shard.originY - shard.y) * 0.15;
  // 도착 시 삭제
}
```

## 4. 트러블 슈팅
- **문제:** 복구 시 파티클 위치와 글자 위치가 어긋남.
- **원인:** Canvas의 `textAlign: center`와 DOM의 `getBoundingClientRect` 기준점 차이.
- **해결:** Canvas에 그릴 때 DOM 요소의 정확한 좌표(`rect.left`, `rect.top`)를 사용하여 그림.
- **문제:** 파티클 크기 차이가 잘 안 느껴짐.
- **해결:** `Math.random()` 대신 `Math.pow(Math.random(), 3)` (지수 분포)를 사용하여 크기 편차를 극대화함.
