import 'reflect-metadata';

import { INJECTABLE_WATERMARK } from '@nestjs/common/constants';

import { Aspect } from '../aspect';

describe('Aspect decorator', () => {
  it('should apply @Injectable() watermark', () => {
    @Aspect('TEST_ASPECT')
    class TestAspect {}

    expect(Reflect.getMetadata(INJECTABLE_WATERMARK, TestAspect)).toBe(true);
  });
});

