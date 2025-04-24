import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';

export class AuthDto {
  @ApiProperty({
    type: String,
    example: 'example@email.com',
  })
  email: string;

  @ApiProperty({
    type: String,
    example: 'Passw0rdExampl3!',
  })
  password: string;
}

export class ValidateEmailDto {
  @ApiProperty({
    type: String,
    required: true,
    example: 'example@email.com',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    type: String,
    required: true,
    example: '123456',
  })
  @IsNotEmpty()
  @IsString()
  @Length(6, 6)
  code: string;
}
