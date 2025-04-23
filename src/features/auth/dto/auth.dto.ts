import { ApiProperty } from '@nestjs/swagger';

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
