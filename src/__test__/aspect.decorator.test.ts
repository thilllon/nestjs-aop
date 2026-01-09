import 'reflect-metadata';

import { applyDecorators, Injectable, SetMetadata } from '@nestjs/common';
import { INJECTABLE_WATERMARK } from '@nestjs/common/constants';

import { ASPECT, Aspect } from '../aspect';

describe('Aspect decorator', () => {
  it('should apply @Injectable() watermark', () => {
    @Aspect('TEST_ASPECT')
    class TestAspect {}

    expect(Reflect.getMetadata(INJECTABLE_WATERMARK, TestAspect)).toBe(true);
  });

  it('legacy implementation should NOT apply @Injectable() watermark', () => {
    // This reproduces the original bug:
    // `Injectable` (factory) is passed instead of `Injectable()` (decorator).
    function LegacyAspect(metadataKey: string | symbol) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return applyDecorators(SetMetadata(ASPECT, metadataKey), Injectable as any);
    }

    @LegacyAspect('TEST_ASPECT')
    class LegacyTestAspect {}

    expect(Reflect.getMetadata(INJECTABLE_WATERMARK, LegacyTestAspect)).not.toBe(true);
  });
});

