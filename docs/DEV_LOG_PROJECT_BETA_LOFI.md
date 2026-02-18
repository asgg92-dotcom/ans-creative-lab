# 개발 로그: Project Beta (Zdog Interactive Diorama)

## 1. 개요
- **목표:** 사용자의 조작에 따라 시각, 청각, 분위기가 변하는 **'살아있는 3D 미니어처 책상'** 구현.
- **컨셉:** 90년대 로우폴리(Low-poly) 감성과 현대적인 플랫 디자인이 결합된 **Lo-Fi 와이드 디오라마**.
- **기술 스택:** React, Zdog (Canvas 3D Engine), GSAP (Animation), Web Audio API (Sound).

## 2. 씬 구성 및 비주얼 (Visuals)
- **와이드 책상:** 가로폭 600px의 넓은 책상에 6개의 가젯을 2열로 배치하여 여유로운 공간감 조성.
- **색상 팔레트:**
  - **Day:** 소프트 블루(#A9D0F5) 배경 + 딥 스카이 블루(#00BFFF) 창문으로 시원하고 화사한 느낌.
  - **Night:** 딥 네이비(#2C3E50) 배경 + 웜 옐로우(#F1C40F) 조명으로 아늑한 느낌.
- **시점 (Camera):**
  - 초기 각도: 30도 (High-angle).
  - **Zoom:** 0.8 (전체 조망).

## 3. 주요 가젯 및 기능 (Gadgets)

### [Back Row]
1. **💡 전등 (Lamp)**
   - **기능:** Day/Night 모드 토글.
   - **효과:** 배경색 및 창문 색상 전환 (GSAP), 전등 갓 내부 발광.
2. **🪟 창문 (Window)**
   - **기능:** 배경 장식 및 깊이감 부여.
   - **효과:** 창문 너머로 구름이 흐르는 무한 스크롤 애니메이션.
3. **📻 라디오 (Radio)**
   - **기능:** Lo-Fi 음악 재생/정지.
   - **구현:** `Web Audio API` (Oscillator + LFO)로 실시간 비트 생성. 재생 중 본체가 둥둥거리는(Bounce) 비주얼라이저 효과.

### [Front Row]
4. **🌱 다육식물 (Plant)**
   - **기능:** 성장 시스템.
   - **로직:** 30초마다 자동 성장 또는 클릭 시 수동 성장.
   - **애니메이션:** `GSAP Elastic Ease`를 사용하여 잎이 '뽕' 하고 솟아나는 탄성 효과 (Zdog Vector 직접 제어).
5. **☕ 머그컵 (Mug)**
   - **기능:** 중앙 장식.
   - **효과:** 김(Steam) 입자가 피어오르며 사라지는 파티클 애니메이션. 클릭 시 김 추가.
6. **📸 카메라 (Camera)**
   - **디자인:** 가죽 바디 + 실버 탑 + 3단 렌즈의 레트로 디자인.
   - **기능:** 사진 촬영 및 필터 적용.
   - **효과:** 화면 플래시(White Flash) 후 전체 화면에 `Sepia` -> `Grain` -> `None` 필터 순차 적용.

### [Environment]
- **✨ 공중 먼지 (Particles):** 마우스 커서 위치로 끌려오는(Attraction) 인터랙티브 파티클 시스템.

## 4. 기술적 구현 디테일

### 4.1 인터랙션 로직
- **Parallax View (마우스 반응):**
  - `illo` 대신 내부 `scene` 그룹을 회전시켜, 사용자의 **드래그 회전(Drag Rotate)**과 **마우스 시차(Parallax)** 효과가 공존하도록 구현.
  - 반응성을 높여(`TAU/8`, `TAU/16`) 역동적인 3D 깊이감 제공.
- **Click Detection (가상 Raycasting):**
  - Canvas 특성상 DOM 이벤트가 없으므로, 각 가젯 그룹의 `renderOrigin` (화면상 좌표)을 실시간 추적.
  - 클릭 시 마우스 좌표와 가장 가까운 가젯을 찾아 이벤트를 트리거하는 거리 기반 판정 로직 사용.

### 4.2 애니메이션 최적화
- **Render Loop:** `requestAnimationFrame` 내에서 모든 애니메이션(부유, 회전, 입자 이동) 처리.
- **State Sync:** `useEffect` 클로저 문제 해결을 위해 `useRef`로 React State(`isNight`, `isPlaying`)를 동기화하여 애니메이션 루프 내에서 최신 상태 참조.

## 5. 업데이트 내역
- **Layout:** 책상 확장 및 가젯 간격 확보로 클릭 편의성 개선.
- **Design:** 카메라 모델링 디테일 업 (렌즈 반사광, 뷰파인더 등).
- **Bugfix:** 식물 성장 시 `scale` 애니메이션이 적용되지 않던 문제 해결 (GSAP onUpdate).
