import { Entity, Column, BeforeInsert, ManyToMany, JoinTable } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsBoolean,
  Min,
  Max,
} from 'class-validator';
import { Role } from '../../../common/enum/role.enum';
import { EntityBase } from '../../../common/entity/base.entity';
import { Sport } from '../../sports/entities/sport.entity';

@Entity()
export class User extends EntityBase {
  @ApiProperty({
    description: 'Name',
    required: true,
  })
  @IsNotEmpty()
  @Column()
  name: string;

  @ApiProperty({
    description: 'Email',
    required: true,
  })
  @IsNotEmpty()
  @IsEmail()
  @Column({ unique: true })
  email: string;

  @ApiProperty({
    description: 'Pass',
    required: true,
  })
  @IsNotEmpty()
  @Column()
  password: string;

  @Column({
    type: 'timestamp',
    nullable: true,
    default: null,
  })
  emailValidatedAt: Date;

  @Column({
    length: 6,
    nullable: true,
  })
  verificationCode: string;

  @ApiProperty({
    description: 'Role of User',
    required: false,
    default: Role.SPORTSMAN,
  })
  @Column({ type: 'simple-enum', enum: Role, default: Role.SPORTSMAN })
  @IsEnum(Role)
  @IsNotEmpty()
  role: Role;

  @ApiProperty({
    description: 'Latitud de la ubicación del usuario',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Column({ type: 'float', nullable: true })
  latitude: number;

  @ApiProperty({
    description: 'Longitud de la ubicación del usuario',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Column({ type: 'float', nullable: true })
  longitude: number;

  @ApiProperty({
    description: 'Radio de búsqueda en metros',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(100)
  @Max(50000)
  @Column({ type: 'int', nullable: true })
  searchRadius: number;

  @ApiProperty({
    description:
      'Indica si el usuario desea recibir notificaciones de eventos cercanos',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  @Column({ type: 'boolean', default: false })
  wantsNearbyNotifications: boolean;

  @ApiProperty({
    description: 'Deportes de interés del usuario',
    required: false,
  })
  @ManyToMany(() => Sport)
  @JoinTable()
  interestedSports: Sport[];

  @BeforeInsert()
  async hashPassword() {
    this.password = await bcrypt.hash(this.password, 10);
  }

  @BeforeInsert()
  generateVerificationCode() {
    if (!this.emailValidatedAt) {
      this.verificationCode = Math.floor(
        100000 + Math.random() * 900000,
      ).toString();
    }
  }
}
