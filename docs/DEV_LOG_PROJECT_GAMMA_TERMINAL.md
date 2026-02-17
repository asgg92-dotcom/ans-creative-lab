# 개발 로그: Project Gamma (ASCII TERMINAL)

## 1. 개요
- **목표:** 레트로 해커 스타일의 텍스트 터미널 구현
- **컨셉:** 90년대 CRT 모니터와 같은 깜빡이는 녹색 커서, 타이핑 효과, 스캔라인
- **기술 스택:** React (useState, useEffect), Tailwind CSS, Custom Font (Courier New)

## 2. 주요 기능 구현
### 2.1 타이핑 효과 (Typewriter Effect)
- `useEffect`와 `setTimeout`을 사용하여 `welcomeText` 배열을 순차적으로 한 글자씩 출력.
- **로직:**
  - `lineIndex`와 `charIndex`를 추적하며 텍스트를 `output` 상태에 추가.
  - 줄 바꿈 시 추가 지연 시간(300ms) 적용.
  - 완료 시 `isTyping` 상태를 `false`로 변경하고 입력 프롬프트 활성화.

### 2.2 명령어 시스템 (Command System)
- `handleCommand` 함수에서 사용자 입력을 파싱하고 적절한 응답을 생성.
- **지원 명령어:**
  - `help`: 사용 가능한 명령어 목록 표시.
  - `ls`: 프로젝트 목록 표시.
  - `whoami`: 현재 사용자(`guest@linkhub.system`) 표시.
  - `clear`: 터미널 출력 초기화.
  - `exit`: 현재 탭 닫기 (`window.close()`).

### 2.3 UI/UX 디자인
- **폰트:** `Courier New`, `monospace` 폰트 사용으로 고정폭 글꼴 확보.
- **색상:** 검정 배경(`bg-black`)에 밝은 녹색 텍스트(`text-green-500`) 및 `text-shadow` 효과.
- **CRT 효과:** `linear-gradient`를 사용한 스캔라인 오버레이(`fixed inset-0 pointer-events-none`) 적용으로 모니터 주사선 느낌 구현.
- **자동 스크롤:** 새로운 출력이 추가될 때마다 `scrollRef.current.scrollTop`을 최하단으로 이동.

## 3. 트러블슈팅
- **이슈:** `useEffect` 내부에서의 상태 업데이트가 비동기적으로 처리되어, 타이핑 효과가 불규칙하거나 겹치는 현상 발생 가능성.
- **해결:** `setTimeout`을 재귀적으로 호출하는 방식(또는 의존성 배열을 최소화)으로 순차 실행 보장. 현재 구현은 `setTimeout` 재귀 호출 방식 사용.
- **이슈:** 입력창(`input`) 포커스가 유지되지 않는 문제.
- **해결:** `autoFocus` 속성과 전체 컨테이너 `onClick` 이벤트에 `input.focus()` 추가.

## 4. 향후 개선 사항
- `cd [project_id]` 명령어로 실제 페이지 이동 기능 추가.
- `history` 기능 (방향키 위/아래로 이전 명령어 불러오기) 구현.
- `Tab` 키 자동 완성 기능 추가.
