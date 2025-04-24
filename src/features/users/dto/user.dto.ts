import { ApiProperty, OmitType } from '@nestjs/swagger';
import { User } from '../entities/user.entity';
import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateUserDto extends OmitType(User, [
  'id',
  'emailValidatedAt',
  'createdAt',
  'deletedAt',
  'updatedAt',
  'verificationCode',
] as const) {}

export class RegisterUserDto extends OmitType(User, [
  'id',
  'emailValidatedAt',
  'createdAt',
  'deletedAt',
  'updatedAt',
  'role',
  'verificationCode',
] as const) {}

export class UpdateUserDto extends OmitType(User, [
  'id',
  'emailValidatedAt',
  'createdAt',
  'deletedAt',
  'updatedAt',
  'role',
  'verificationCode',
  'email',
  'password',
] as const) {
  @ApiProperty({
    description: 'Password',
    required: false,
  })
  @IsNotEmpty({
    message: 'Si proporcionas una contraseña, no puede estar vacía',
  })
  @IsOptional()
  password?: string;
}
