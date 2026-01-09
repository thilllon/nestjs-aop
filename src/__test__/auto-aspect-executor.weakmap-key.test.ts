import 'reflect-metadata';

import { AutoAspectExecutor } from '../auto-aspect-executor';

describe('AutoAspectExecutor.wrapMethod', () => {
  it('legacy cache implementation should throw for non-object receiver (WeakMap key)', () => {
    // This reproduces the original bug: WeakMap keys must be objects.
    const wrappedMethodCache = new WeakMap<object, WeakMap<Function, Function>>();
    const originalFn = jest.fn(() => 'ok');
    const lazyDecorator = { wrap: jest.fn(({ method }: any) => method) };

    // Legacy (buggy) wrapper.
    // eslint-disable-next-line func-names
    const legacyWrappedFn = function (this: any, ...args: unknown[]) {
      const cache = wrappedMethodCache.get(this) || new WeakMap();
      const cached = cache.get(originalFn);
      if (cached) {
        return cached.apply(this, args);
      }
      const wrappedMethod = lazyDecorator.wrap({ instance: this, methodName: 'hello', method: originalFn.bind(this) });
      cache.set(originalFn, wrappedMethod);
      wrappedMethodCache.set(this, cache);
      return wrappedMethod.apply(this, args);
    };

    expect(() => legacyWrappedFn.call('x')).toThrow();
  });

  it('should not throw when called with a non-object receiver', () => {
    const executor = new AutoAspectExecutor({} as any, {} as any, {} as any);

    const originalFn = jest.fn(() => 'ok');
    const aopSymbol = Symbol('AOP');
    const target: any = {};

    const lazyDecorator = {
      wrap: jest.fn(({ method }: any) => method),
    };

    (executor as any).wrapMethod({
      lazyDecorator,
      aopMetadata: { originalFn, metadata: undefined, aopSymbol },
      methodName: 'hello',
      target,
    });

    expect(() => target[aopSymbol].hello.call('x')).not.toThrow();
    expect(target[aopSymbol].hello.call('x')).toBe('ok');
    expect(lazyDecorator.wrap).toHaveBeenCalled();
  });
});

