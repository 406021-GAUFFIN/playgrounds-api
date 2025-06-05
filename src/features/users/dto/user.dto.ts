import { ApiProperty, OmitType } from '@nestjs/swagger';
import { User } from '../entities/user.entity';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import {
  PaginationDto,
  RequestPaginationDto,
} from 'src/common/dto/Pagination.dto';
import { Role } from 'src/common/enum/role.enum';

export class CreateUserDto extends OmitType(User, [
  'id',
  'emailValidatedAt',
  'createdAt',
  'deletedAt',
  'updatedAt',
  'verificationCode',
  'latitude',
  'longitude',
  'interestedSports',
  'searchRadius',
  'wantsNearbyNotifications',
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
  'interestedSports',
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
  @ApiProperty({
    description: 'Deportes disponibles en el espacio',
    type: [Number],
    required: false,
  })
  @IsArray()
  @IsNumber({}, { each: true })
  @IsOptional()
  interestedSportIds: number[];
}

export class UserQueryDto extends RequestPaginationDto {
  @ApiProperty({ description: 'Name filter', required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    description: 'Role filter',
    required: false,
    enum: Role,
    default: Role.SPORTSMAN,
  })
  @IsOptional()
  @IsEnum(Role)
  role?: Role;
}
export class UserPaginationDto extends PaginationDto<User> {
  @ApiProperty({ type: User, isArray: true })
  data: User[];
}
