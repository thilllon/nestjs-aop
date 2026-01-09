# AGENTS.md

이 문서는 `@toss/nestjs-aop` 저장소에서 자동화 에이전트(코딩 봇 포함)가 **일관된 방식으로 작업**하도록 돕기 위한 가이드입니다.  
레포 기본 커뮤니케이션은 영어를 권장하지만(참고: `CONTRIBUTING.md`), 에이전트가 따라야 할 규칙은 아래를 우선합니다.

## 목표

- **빌드/테스트가 통과**하는 변경을 만든다.
- 라이브러리의 **공개 API 변경**은 신중히(필요 시 문서/테스트/마이그레이션 가이드 포함).
- NestJS + 데코레이터 기반 동작을 깨지 않도록 **타입 안정성/런타임 동작**을 함께 확인한다.

## 빠른 시작 (로컬/CI 동일)

이 레포는 `pnpm`을 사용하며, CI는 Node 22 환경에서 실행됩니다.

- **권장 런타임**
  - Node: `22.x` (레포 `package.json`의 `volta.node`: `22.15.1`)
  - pnpm: `10.x` (레포 `package.json`의 `volta.pnpm`: `10.11.0`)

```bash
pnpm install --frozen-lockfile
pnpm build
pnpm test
```

## 자주 쓰는 명령

- **의존성 설치**: `pnpm install --frozen-lockfile`
- **빌드(타입체크 + dist 생성)**: `pnpm build`
  - `dist/`를 지우고 `tsc -p tsconfig.build.json`로 빌드합니다.
- **테스트(Jest)**: `pnpm test`
  - `ts-jest` 기반, `**/*.test.ts` 패턴을 실행합니다.

## 프로젝트 구조(요약)

- **소스**: `src/`
- **테스트**: `src/__test__/`
- **빌드 산출물**: `dist/` (커밋 여부는 변경 목적에 따름; 일반적으로 소스만 변경)
- **엔트리 포인트**: `src/index.ts` → `dist/index.js`, `dist/index.d.ts`

## 코딩 규칙(필수)

- **TypeScript strict 유지**: `tsconfig.json`에서 `strict: true`, `noUnusedLocals: true`가 켜져 있습니다.
  - 사용하지 않는 import/변수는 제거합니다.
- **데코레이터 관련 옵션 유지**: `emitDecoratorMetadata`, `experimentalDecorators`가 사용됩니다.
  - 리플렉션/메타데이터(`reflect-metadata`) 의존 동작을 깨지 않도록 주의합니다.
- **포맷**: Prettier 설정(`prettier.config.js`)을 따릅니다.
  - `singleQuote: true`, `printWidth: 100`, `trailingComma: 'all'`
- **린트(참고)**: `.eslintrc.js` 기준으로 `unused-imports`/`no-unused-vars` 등이 엄격합니다.
  - 레포에 `lint` 스크립트는 없을 수 있으니, 변경 시 최소한 `pnpm build`로 타입/unused 문제를 잡습니다.

## 변경 유형별 체크리스트

- **버그 수정/리팩터**
  - 재현 테스트 추가 또는 기존 테스트 보강을 우선합니다.
  - `pnpm test`로 회귀를 막습니다.
- **공개 API 변경**
  - README(또는 `docs/`) 업데이트를 포함합니다.
  - 필요한 경우 `docs/migration-guide-v2.md`에 마이그레이션 내용을 추가합니다.
- **의존성 변경**
  - `peerDependencies` 범위를 불필요하게 좁히지 않습니다.
  - NestJS 버전 호환성(`^8 || ^9 || ^10 || ^11`)을 의식합니다.

## PR/커밋 가이드(필수)

`CONTRIBUTING.md`의 규칙을 따릅니다.

- **PR 제목 포맷**: `<type>: <description>`
  - shipped code 변경: `feat`, `fix`, `refactor`
  - shipped code 미변경: `docs`, `test`
  - 기타: `chore`
- **커밋 스타일**: 레포는 squash merge를 전제로 하므로 커밋 개수/스타일은 엄격히 요구하지 않습니다.

## CI 참고

GitHub Actions에서 아래를 실행합니다.

- `pnpm install --frozen-lockfile`
- `pnpm build`
- `pnpm test`

로컬에서도 위 순서대로 재현 가능해야 합니다.

## 금지 사항(에이전트 안전 규칙)

- **브랜치 이동/리베이스/푸시**를 자동으로 수행하지 않습니다. (필요하면 사람이 직접 수행)
- 레포에 **불필요한 대규모 포맷팅 변경**(전 파일 prettier 등)을 섞지 않습니다.
- `dist/` 등 산출물을 커밋해야 하는지 확실치 않다면, 기본적으로 **소스/테스트/문서만** 변경합니다.

