import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateTagDto {
    @IsString()
    @IsNotEmpty()
    @ApiProperty()
    name: string
}
