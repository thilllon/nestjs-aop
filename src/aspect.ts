import { applyDecorators, Injectable, SetMetadata } from '@nestjs/common';

export const ASPECT = Symbol('ASPECT');

/**
 * Decorator to apply to providers that implements LazyDecorator.
 * @see LazyDecorator
 */
export function Aspect(metadataKey: string | symbol) {
  // NOTE: `Injectable` must be invoked. Passing `Injectable` itself will treat
  // the class as "options" and won't apply the injectable decorator.
  return applyDecorators(SetMetadata(ASPECT, metadataKey), Injectable());
}
