import 'reflect-metadata';

import { AutoAspectExecutor } from '../auto-aspect-executor';

describe('AutoAspectExecutor.wrapMethod', () => {
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

