import { Entity, Column, BeforeInsert, BeforeUpdate } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty } from 'class-validator';
import { Role } from '../../../common/enum/role.enum';
import { EntityBase } from '../../../common/entity/base.entity';

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

  @BeforeInsert()
  @BeforeUpdate()
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
