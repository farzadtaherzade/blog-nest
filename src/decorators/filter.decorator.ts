import { applyDecorators } from '@nestjs/common';
import { ApiQuery } from '@nestjs/swagger';

export function FilterStory() {
  return applyDecorators(
    // ApiQuery({ name: 'tag', required: false }),
    ApiQuery({ name: 'keyword', required: false }),
  );
}
