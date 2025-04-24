import {
  Controller,
  Post,
  UseGuards,
  Request,
  Body,
  Get,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from 'src/features/users/users.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthDto, ValidateEmailDto } from './dto/auth.dto';
import { LocalAuthGuard } from './guard/local.guard';
import { RequestWithUser } from './types/request.user.type';
import { JwtAuthGuard } from './guard/jwt-auth.guard';
import { RegisterUserDto } from '../users/dto/user.dto';
import { Role } from 'src/common/enum/role.enum';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) {}

  @UseGuards(LocalAuthGuard)
  @ApiBody({ type: AuthDto })
  @Post('login')
  async login(@Request() req) {
    return this.authService.login(req.user);
  }

  @Post('register')
  async register(@Body() userData: RegisterUserDto) {
    const user = await this.usersService.register({
      ...userData,
      role: Role.SPORTSMAN,
    });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = user;
    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiOkResponse({ description: 'Profile user' })
  @ApiUnauthorizedResponse({ description: 'Wrong credentials' })
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  async me(@Request() req: RequestWithUser) {
    const user = await this.usersService.findOne(req.user.id);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = user;
    return result;
  }

  @Post('verify-email')
  async verifyEmail(@Body() body: ValidateEmailDto) {
    const isVerified = await this.usersService.verifyEmail(
      body.email,
      body.code,
    );
    if (!isVerified) {
      throw new UnauthorizedException('Código de verificación inválido');
    }
    return { message: 'Email verificado correctamente' };
  }
}
