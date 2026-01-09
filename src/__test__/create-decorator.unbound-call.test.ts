import 'reflect-metadata';

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
});

