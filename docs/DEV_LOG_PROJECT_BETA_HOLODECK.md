# 개발 로그: Project Beta (HOLO-DECK)

## 1. 개요
- **목표:** 3D 인터랙티브 카드 시스템 구현
- **컨셉:** 사이버펑크 스타일의 유리 질감(Glassmorphism) 홀로그램 카드
- **기술 스택:** React Three Fiber (R3F), @react-three/drei, Framer Motion

## 2. 주요 기능 구현
### 2.1 3D Scene 구성
- `Canvas`: R3F의 3D 렌더링 컨텍스트. `camera` 위치와 `fov` 설정으로 깊이감 조절.
- `Environment`: `@react-three/drei`의 `preset="city"`를 사용하여 사실적인 반사광 구현.
- `Lighting`: `ambientLight`와 포인트 조명(`pointLight`)을 조합하여 몽환적인 분위기 연출.

### 2.2 HoloCard 컴포넌트
- **형태:** `RoundedBox`를 사용하여 모서리가 둥근 직육면체 카드 구현.
- **재질 (Material):** `MeshTransmissionMaterial`을 사용하여 유리와 같은 투명도, 굴절, 색수차 효과 구현.
  - `transmission`: 1 (완전 투명)
  - `thickness`: 0.5 (유리 두께감)
  - `chromaticAberration`: 0.1 (홀로그램 느낌의 색상 분리)
- **인터랙션:**
  - `useFrame`: 마우스 위치(`state.pointer`)에 따라 카드가 미세하게 회전하는 `Tilt` 효과 구현 (Lerp 사용).
  - `Hover`: 마우스 오버 시 `scale`이 커지고 커서가 변경됨.
  - `Text`: 3D 공간 안에 텍스트를 배치하여 카드 내부에 떠 있는 느낌 구현.

### 3. 트러블슈팅
- **이슈:** `npm install` 시 `framer-motion-3d`와 `R3F` 버전 충돌 발생.
- **해결:** `--legacy-peer-deps` 옵션으로 강제 설치.
- **이슈:** `RoundedBox`의 테두리(`Edges`)가 상자 크기와 정확히 일치하지 않는 문제.
- **해결:** `Edges` 컴포넌트의 `threshold` 값 조정 및 `RoundedBox` 자체의 `wireframe` 속성 고려 (최종적으로 `Edges` 사용).

## 4. 향후 개선 사항
- 카드 클릭 시 실제 페이지 이동 기능 추가.
- 모바일 디바이스에서의 성능 최적화 (Geometry 단순화 등).
