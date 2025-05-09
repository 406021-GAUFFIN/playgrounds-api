import {
  IsString,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsArray,
  Length,
  IsNotEmpty,
} from 'class-validator';

export class CreateSpaceDto {
  @IsString()
  @Length(1, 100)
  @IsNotEmpty()
  name: string;

  @IsString()
  @Length(1, 200)
  @IsNotEmpty()
  address: string;

  @IsString()
  @IsOptional()
  schedule?: string;

  @IsString()
  @IsNotEmpty()
  conditions: string;

  @IsBoolean()
  @IsOptional()
  isAccessible?: boolean;

  @IsString()
  @IsOptional()
  description?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  photos?: string[];

  @IsNumber()
  @IsNotEmpty()
  latitude: number;

  @IsNumber()
  @IsNotEmpty()
  longitude: number;

  @IsArray()
  @IsNumber({}, { each: true })
  @IsOptional()
  sportIds: number[];
}
