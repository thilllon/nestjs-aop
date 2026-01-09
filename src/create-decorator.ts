import { applyDecorators } from '@nestjs/common';
import { AopMetadata } from './core/types';
import { AddMetadata } from './utils';

/**
 * @param metadataKey equal to 1st argument of Aspect Decorator
 * @param metadata The value corresponding to the metadata of WrapParams. It can be obtained from LazyDecorator's warp method and used.
 */
export const createDecorator = (
  metadataKey: symbol | string,
  metadata?: unknown,
): MethodDecorator => {
  const aopSymbol = Symbol('AOP_DECORATOR');
  return applyDecorators(
    // 1. Add metadata to the method
    (target: object, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
      return AddMetadata<symbol | string, AopMetadata>(metadataKey, {
        originalFn: descriptor.value,
        metadata,
        aopSymbol,
      })(target, propertyKey, descriptor);
    },
    // 2. Wrap the method before the lazy decorator is executed
    (_: object, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
      const originalFn = descriptor.value;

      descriptor.value = function (this: any, ...args: unknown[]) {
        // `this` can be undefined/null when a method is called unbound.
        // In that case, we should behave like the original method (not throw).
        const receiver = this as any;
        const wrappedFn = receiver?.[aopSymbol]?.[propertyKey];
        if (wrappedFn) {
          // If there is a wrapper stored in the method, use it
          return wrappedFn.apply(this, args);
        }
        // if there is no wrapper that comes out of method, call originalFn
        return originalFn.apply(this, args);
      };

      /**
       * There are codes that using `function.name`.
       * Therefore the codes below are necessary.
       *
       * ex) @nestjs/swagger
       */
      // Make it safe to stack multiple decorators that attempt to set `name`.
      try {
        Object.defineProperty(descriptor.value, 'name', {
          value: propertyKey.toString(),
          writable: false,
          configurable: true,
        });
      } catch {
        // ignore
      }
      Object.setPrototypeOf(descriptor.value, originalFn);
    },
  );
};
