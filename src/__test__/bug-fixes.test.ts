import 'reflect-metadata';

import { Injectable, Module } from '@nestjs/common';
import { FastifyAdapter } from '@nestjs/platform-fastify';
import { Test } from '@nestjs/testing';
import { AopModule } from '../aop.module';
import { AopTesting } from './fixture/aop-testing.decorator';
import { AopTestingModule } from './fixture/aop-testing.module';
import { createDecorator } from '../create-decorator';

/**
 * 버그 수정 검증 테스트
 * 
 * 결론:
 * - 버그 3 (Symbol propertyKey): ✅ 실제 버그 - 테스트로 실패 확인됨
 * - 버그 1 (return descriptor): ❌ 코드 품질 개선 - 현재 NestJS에서 문제 없음
 * - 버그 2 (cache.has()): ❌ 코드 품질 개선 - 캐시값이 항상 truthy
 */
describe('Bug Fixes Verification', () => {
  /**
   * ✅ 버그 3: Symbol propertyKey 처리 오류 - 실제 버그!
   * 
   * 원래 코드: propertyKey.toString() -> Symbol의 경우 "Symbol(name)" 반환
   * 수정 코드: typeof propertyKey === 'symbol' ? (propertyKey.description ?? '') : propertyKey
   */
  describe('Bug 3: Symbol propertyKey handling - REAL BUG', () => {
    it('should set function.name correctly for symbol method keys', () => {
      const TEST_KEY = Symbol('TEST_KEY');
      const methodSymbol = Symbol('mySymbolMethod');

      const TestDecorator = () => createDecorator(TEST_KEY, {});

      class TestClass {
        @TestDecorator()
        [methodSymbol]() {
          return 'symbol method';
        }

        @TestDecorator()
        normalMethod() {
          return 'normal method';
        }
      }

      const instance = new TestClass();

      // Symbol 메서드의 경우: description인 'mySymbolMethod'가 name이어야 함
      // 버그가 있었다면: 'Symbol(mySymbolMethod)'가 됨
      expect(instance[methodSymbol].name).toBe('mySymbolMethod');
      
      // 일반 문자열 메서드의 경우: 그대로 'normalMethod'
      expect(instance.normalMethod.name).toBe('normalMethod');
    });

    it('should handle symbol without description', () => {
      const TEST_KEY = Symbol('TEST_KEY');
      const methodSymbol = Symbol(); // description 없음

      const TestDecorator = () => createDecorator(TEST_KEY, {});

      class TestClass {
        @TestDecorator()
        [methodSymbol]() {
          return 'no description';
        }
      }

      const instance = new TestClass();

      // description이 없는 Symbol의 경우: 빈 문자열이어야 함
      // 버그가 있었다면: 'Symbol()'가 됨
      expect(instance[methodSymbol].name).toBe('');
    });
  });

  /**
   * 버그 3의 원래 동작과 수정된 동작의 차이를 보여주는 테스트
   */
  describe('Bug 3 Demonstration: toString() vs description', () => {
    it('demonstrates the difference between buggy and fixed code', () => {
      const sym = Symbol('testMethod');
      
      // 원래 버그 코드의 동작: toString() 사용
      const buggyResult = sym.toString();
      
      // 수정된 코드의 동작: description 사용
      const fixedResult = sym.description ?? '';
      
      // 원래 코드는 "Symbol(testMethod)"를 반환
      expect(buggyResult).toBe('Symbol(testMethod)');
      
      // 수정된 코드는 "testMethod"만 반환
      expect(fixedResult).toBe('testMethod');
      
      // 이 두 값이 다름을 확인 - 버그가 실제로 존재했음을 증명
      expect(buggyResult).not.toBe(fixedResult);
    });
  });

  /**
   * ❌ 버그 1: return descriptor 누락 - 코드 품질 개선 (현재 문제 없음)
   * 
   * NestJS의 applyDecorators는 데코레이터 반환값을 사용하지 않고
   * descriptor를 직접 수정하기 때문에 현재 코드에서는 문제가 없음
   */
  describe('Bug 1: Missing return descriptor - NOT A BUG (quality improvement)', () => {
    it('works without return descriptor because applyDecorators ignores return value', async () => {
      @Injectable()
      class TestService {
        @AopTesting({
          callback: ({ wrapParams, args }) => wrapParams.method(...args) + '_wrapped',
        })
        testMethod() {
          return 'original';
        }
      }

      @Module({
        providers: [TestService],
        exports: [TestService],
      })
      class TestModule {}

      const module = await Test.createTestingModule({
        imports: [
          AopModule,
          TestModule,
          AopTestingModule.registerAsync({
            useFactory: () => [],
          }),
        ],
      }).compile();

      const app = module.createNestApplication(new FastifyAdapter());
      await app.init();

      const service = app.get(TestService);
      // return descriptor가 없어도 정상 동작함
      expect(service.testMethod()).toBe('original_wrapped');
      
      await app.close();
    });
  });

  /**
   * ❌ 버그 2: cache.has() vs if(cached) - 코드 품질 개선 (현재 문제 없음)
   * 
   * 캐시되는 값이 항상 함수(truthy)이므로
   * if(cached)와 cache.has()의 동작이 동일함
   */
  describe('Bug 2: cache.has() vs if(cached) - NOT A BUG (quality improvement)', () => {
    it('works with if(cached) because cached value is always a function (truthy)', async () => {
      let wrapCallCount = 0;

      @Injectable()
      class TestService {
        @AopTesting({
          wrapCallback: () => {
            wrapCallCount++;
          },
          callback: ({ wrapParams, args }) => wrapParams.method(...args),
        })
        cachedMethod() {
          return 'cached';
        }
      }

      @Module({
        providers: [TestService],
        exports: [TestService],
      })
      class TestModule {}

      const module = await Test.createTestingModule({
        imports: [
          AopModule,
          TestModule,
          AopTestingModule.registerAsync({
            useFactory: () => [],
          }),
        ],
      }).compile();

      const app = module.createNestApplication(new FastifyAdapter());
      await app.init();

      const service = app.get(TestService);
      
      // 메서드를 여러 번 호출해도 wrap은 한 번만 호출
      service.cachedMethod();
      service.cachedMethod();
      service.cachedMethod();

      // 캐싱이 정상 동작 - if(cached)도 cache.has()와 동일하게 동작
      expect(wrapCallCount).toBe(1);
      
      await app.close();
    });
  });
});
