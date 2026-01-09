# AGENTS.md

이 파일은 AI 코딩 에이전트가 이 프로젝트에서 작업할 때 참고해야 하는 가이드라인입니다.

## 프로젝트 개요

`@toss/nestjs-aop`는 NestJS에서 AOP(Aspect-Oriented Programming)를 우아하게 적용할 수 있게 해주는 라이브러리입니다. NestJS 관리 인스턴스를 데코레이터 내에서 사용할 수 있도록 지원합니다.

## 기술 스택

- **언어**: TypeScript
- **런타임**: Node.js 22
- **패키지 매니저**: pnpm 10
- **프레임워크**: NestJS (v8, v9, v10, v11 지원)
- **테스트**: Jest
- **린터**: ESLint
- **포맷터**: Prettier

## 프로젝트 구조

```
/workspace
├── src/
│   ├── __test__/           # 테스트 파일
│   │   └── fixture/        # 테스트 픽스처
│   ├── core/
│   │   └── types.ts        # 타입 정의
│   ├── utils/              # 유틸리티 함수
│   ├── aop.module.ts       # AopModule 정의
│   ├── aspect.ts           # @Aspect 데코레이터
│   ├── auto-aspect-executor.ts  # 자동 Aspect 실행기
│   ├── create-decorator.ts # createDecorator 함수
│   ├── lazy-decorator.ts   # LazyDecorator 인터페이스
│   └── index.ts            # 모듈 export
├── docs/
│   └── migration-guide-v2.md  # v2 마이그레이션 가이드
├── .github/
│   └── workflows/
│       └── ci.yml          # CI 파이프라인
├── package.json
├── tsconfig.json
├── tsconfig.build.json
├── jest.config.js
├── .eslintrc.js
└── prettier.config.js
```

## 필수 명령어

### 의존성 설치
```bash
pnpm install
```

### 빌드
```bash
pnpm build
```

### 테스트 실행
```bash
pnpm test
```

### 린트 검사
ESLint 규칙이 적용되어 있습니다. 다음 규칙에 주의하세요:
- 미사용 변수 금지 (`@typescript-eslint/no-unused-vars`)
- 미사용 import 금지 (`unused-imports/no-unused-imports-ts`)
- `prefer-const` 필수
- 중괄호 필수 (`curly: all`)
- 엄격한 동등 비교 (`eqeqeq: always`)

## 코딩 컨벤션

### TypeScript
- `strict: true` 모드 사용
- `experimentalDecorators`와 `emitDecoratorMetadata` 활성화
- `any` 타입 허용 (라이브러리 특성상 필요)
- 네임스페이스 사용 허용

### 테스트
- Jest를 사용하여 테스트 작성
- `@nestjs/testing`의 `Test.createTestingModule` 사용
- **중요**: 테스트에서 `module.init()` 호출 필수
- FastifyAdapter 사용하여 테스트
- inline snapshot 테스트 권장 (`toMatchInlineSnapshot`)

### 테스트 예시 패턴
```typescript
const module = await Test.createTestingModule({
  imports: [AopModule, ...],
}).compile();

const app = module.createNestApplication(new FastifyAdapter());
await app.init();  // 반드시 호출해야 함
```

## PR 커밋 메시지 형식

```
<type>: <description>
```

### Type 종류
- `feat`: 새로운 기능 추가
- `fix`: 버그 수정
- `refactor`: 리팩토링
- `docs`: 문서 수정
- `test`: 테스트 수정
- `chore`: 기타 작업

## CI/CD

GitHub Actions를 통해 PR에서 자동 검증:
1. pnpm install
2. pnpm build
3. pnpm test

## 주요 export

```typescript
export * from './aop.module';      // AopModule
export * from './aspect';          // @Aspect 데코레이터
export * from './create-decorator'; // createDecorator 함수
export * from './lazy-decorator';   // LazyDecorator 인터페이스
```

## 핵심 개념

1. **AopModule**: NestJS 앱에 import하여 AOP 기능 활성화
2. **@Aspect(symbol)**: LazyDecorator 구현체를 등록하는 데코레이터
3. **LazyDecorator**: `wrap` 메서드를 구현하여 메서드를 래핑하는 인터페이스
4. **createDecorator**: 메타데이터를 마킹하는 커스텀 데코레이터 생성 함수

## 의존성

### Peer Dependencies
- `@nestjs/common`: ^8 || ^9 || ^10 || ^11
- `@nestjs/core`: ^8 || ^9 || ^10 || ^11
- `reflect-metadata`: ^0.1.13 || ^0.2.0
- `rxjs`: ^7.5.6

### Dependencies
- `ramda`: ^0.28.0

## 주의사항

- 이 라이브러리는 NestJS 데코레이터 시스템과 밀접하게 연관되어 있어 메타데이터 처리에 주의 필요
- 데코레이터 실행 순서가 중요 (아래에서 위로 실행)
- Scope.DEFAULT 모드에서 `wrap`은 인스턴스당 한 번만 실행됨
