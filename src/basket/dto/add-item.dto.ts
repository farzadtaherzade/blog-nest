import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class AddItemDto {
  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({ type: Number })
  article_id: number;
}
