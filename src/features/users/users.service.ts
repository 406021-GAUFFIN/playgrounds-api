import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { EmailService } from '../email/email.service';
import * as bcrypt from 'bcrypt';
import { Role } from '../../common/enum/role.enum';
import { UpdateUserDto } from './dto/user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private emailService: EmailService,
  ) {}

  findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  findOne(id: number): Promise<User> {
    return this.usersRepository.findOne({ where: { id } });
  }

  findByEmail(email: string): Promise<User> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async create(user: Partial<User>): Promise<User> {
    const newUser = this.usersRepository.create({
      ...user,
      emailValidatedAt: new Date(),
    });
    const savedUser = await this.usersRepository.save(newUser);

    return savedUser;
  }

  async update(
    id: number,
    user: UpdateUserDto,
    updatingUser: User,
  ): Promise<User> {
    if (updatingUser.role !== Role.ADMIN && updatingUser.id !== id) {
      throw new UnauthorizedException(
        'No tienes permiso para actualizar este usuario',
      );
    }

    if (user.password) {
      user.password = await bcrypt.hash(user.password, 10);
    }

    await this.usersRepository.update(id, user);
    return this.findOne(id);
  }

  async register(user: Partial<User>): Promise<User> {
    const newUser = this.usersRepository.create(user);
    const savedUser = await this.usersRepository.save(newUser);
    await this.emailService.sendVerificationEmail(
      savedUser.email,
      savedUser.verificationCode,
    );
    return savedUser;
  }

  async verifyEmail(email: string, code: string): Promise<boolean> {
    const user = await this.findByEmail(email);
    if (!user || user.verificationCode !== code) {
      return false;
    }

    user.emailValidatedAt = new Date();
    user.verificationCode = null;
    await this.usersRepository.save(user);
    return true;
  }
}
