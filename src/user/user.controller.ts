import { Controller, Get, Post, Body, Param, Delete, Patch } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  create(@Body() createUserDto: { nome: string; email: string; cep: string }) {
    return this.userService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Patch(':email')
  edit(
    @Param('email') email: string,
    @Body() editUserDto: { nome?: string; email?: string; cep?: string },
  ) {
    const user = this.userService.findByEmail(email);
    if (user) {
      Object.assign(user, editUserDto);
    }
    return this.userService.update(email, user);
  }

  @Delete(':email')
  delete(@Param('email') email: string) {
    return this.userService.delete(email);
  }
}
