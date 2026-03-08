# Web Canvas Software Renderer

## 개발 스크립트

- `npm run dev`: 개발 서버 실행
- `npm run build`: 타입체크 + 빌드
- `npm run lint`: 전체 TS 파일 lint 검사
- `npm run lint:fix`: lint 자동 수정
- `npm run format`: Prettier 포맷 적용
- `npm run format:check`: Prettier 포맷 검사

## 커밋 정책

이 프로젝트는 **Conventional Commits**를 사용합니다.

- 형식: `type(scope): subject`
- 예시:
    - `feat(renderer): add line rasterization`
    - `fix(canvas): resolve out-of-bounds write`
    - `chore(deps): update dev dependencies`

주요 `type` 예시:

- `feat`: 기능 추가
- `fix`: 버그 수정
- `docs`: 문서 변경
- `refactor`: 리팩터링
- `test`: 테스트 변경
- `chore`: 기타 작업

## 커밋 시 자동 검사

Husky 훅으로 아래 검사가 자동 실행됩니다.

- `pre-commit`: `lint-staged`로 ESLint + Prettier 실행
- `commit-msg`: `commitlint`로 커밋 메시지가 Conventional Commit 규칙을 따르는지 검사

규칙에 맞지 않으면 커밋이 차단됩니다.

추가 규칙:

- `type`은 `feat|fix|docs|refactor|test|chore`만 허용
- `scope`는 필수
