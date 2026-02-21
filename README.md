# LinkHub (Project Gamma)

A dynamic link hub website showcasing interactive themes and experimental web projects using **Vibe Coding**.

This project features:
- **Falling Text Theme**: Kinetic typography with physics simulation.
- **Falling Shapes Theme**: Interactive falling shapes with random colors.
- **Project Alpha (Elastic Shard Text)**: Canvas-based kinetic typography with particle explosions.
- **Project Beta (Lo-Fi Desk Widget)**: A minimal Zdog.js 3D desktop diorama.
- **Project Gamma (Reflective Abstract)**: An R3F-based abstract art piece with morphing materials and lighting effects.

## Tech Stack

- **Framework**: [Next.js 14+](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Animation**: [Framer Motion](https://www.framer.com/motion/), [GSAP](https://greensock.com/gsap/)
- **3D Graphics**:
  - [Three.js](https://threejs.org/) & [React Three Fiber](https://docs.pmnd.rs/react-three-fiber)
  - [Zdog.js](https://zzz.dog/)
  - [Matter.js](https://brm.io/matter-js/) (2D Physics)

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

- `src/app`: App Router pages and layouts.
- `src/components`: Reusable UI components.
- `src/data`: Data files (e.g., links configuration).
- `public`: Static assets (images, fonts).

## Experiments (실험 페이지)

미완료 프로젝트는 메인에 노출하지 않고 별도로 관리합니다.

- **로컬 확인**: `npm run dev` → `/experiments` 접속 → 링크 클릭으로 각 실험 페이지 확인
- **워크플로우**: [docs/EXPERIMENTS_WORKFLOW.md](docs/EXPERIMENTS_WORKFLOW.md) 참고

## Documentation

Development logs and architectural decisions are documented in the `docs/` folder.

---

Created by **Ans Kim**
