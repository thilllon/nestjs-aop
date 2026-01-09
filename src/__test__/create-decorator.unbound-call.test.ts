import 'reflect-metadata';

import { applyDecorators } from '@nestjs/common';

import { createDecorator } from '../create-decorator';

describe('createDecorator', () => {
  it('should not throw when method is called unbound (this = undefined)', () => {
    const Deco = createDecorator('TEST');

    class TestService {
      @Deco
      sum(a: number, b: number) {
        return a + b;
      }
    }

    const svc = new TestService();
    const unbound = svc.sum;

    expect(() => unbound(1, 2)).not.toThrow();
    expect(unbound(1, 2)).toBe(3);
  });

  it('legacy implementation should throw when method is called unbound (this = undefined)', () => {
    // This reproduces the original bug: `this[aopSymbol]` access throws if `this` is undefined/null.
    const legacyCreateDecorator = (
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      metadataKey: any,
      metadata?: unknown,
    ): MethodDecorator => {
      const aopSymbol = Symbol('AOP_DECORATOR');
      return applyDecorators(
        (target: object, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
          if (!Reflect.hasMetadata(metadataKey, descriptor.value)) {
            Reflect.defineMetadata(metadataKey, [], descriptor.value);
          }
          const metadataValues: any[] = Reflect.getMetadata(metadataKey, descriptor.value);
          metadataValues.push({ originalFn: descriptor.value, metadata, aopSymbol });
          return descriptor;
        },
        (_: object, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
          const originalFn = descriptor.value;
          descriptor.value = function (this: any, ...args: unknown[]) {
            // Legacy (buggy): crashes when `this` is undefined
            const wrappedFn = this[aopSymbol]?.[propertyKey];
            if (wrappedFn) {
              return wrappedFn.apply(this, args);
            }
            return originalFn.apply(this, args);
          };
        },
      );
    };

    const LegacyDeco = legacyCreateDecorator('TEST');

    class LegacyService {
      @LegacyDeco
      sum(a: number, b: number) {
        return a + b;
      }
    }

    const svc = new LegacyService();
    const unbound = svc.sum;

    expect(() => unbound(1, 2)).toThrow();
  });
});

