import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { BasketService } from './basket.service';
import { JwtAuthGuard } from 'src/jwt-auth/jwt-auth.guard';
import { AddItemDto } from './dto/add-item.dto';
import { GetUser } from 'src/decorators/user.decorator';
import { User } from 'src/users/entities/user.entity';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@Controller('basket')
@ApiBearerAuth()
@ApiTags('Basket')
@UseGuards(JwtAuthGuard)
export class BasketController {
  constructor(private readonly basketService: BasketService) {}

  @Post('/add')
  addToBasket(@Body() addItemDto: AddItemDto, @GetUser() user: User) {
    return this.basketService.addToBasket(addItemDto, user);
  }

  @Get()
  findOne(@GetUser() user: User, @Query('page') page: number) {
    return this.basketService.findOne(user, page);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.basketService.remove(+id);
  }
}
