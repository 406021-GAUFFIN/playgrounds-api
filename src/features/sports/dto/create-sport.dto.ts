import { IsString, IsInt, Min } from 'class-validator';

export class CreateSportDto {
  @IsString()
  name: string;

  @IsString()
  pictogram: string;

  @IsInt()
  @Min(1)
  minParticipants: number;

  @IsInt()
  @Min(1)
  maxParticipants: number;
}
