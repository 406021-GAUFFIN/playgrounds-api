import { Injectable, UnauthorizedException } from '@nestjs/common';
import { User } from './entities/user.entity';
import { EmailService } from '../email/email.service';
import { Role } from '../../common/enum/role.enum';
import { UpdateUserDto, UserQueryDto } from './dto/user.dto';
import { UserRepository } from './repositories/user.repository';

@Injectable()
export class UsersService {
  constructor(
    private userRepository: UserRepository,
    private emailService: EmailService,
  ) {}

  findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  findOne(id: number): Promise<User> {
    return this.userRepository.findOne({ where: { id } });
  }

  findByEmail(email: string): Promise<User> {
    return this.userRepository.findByEmail(email);
  }

  async create(user: Partial<User>): Promise<User> {
    const savedUser = await this.userRepository.createUser(user);
    await this.emailService.sendVerificationEmail(
      savedUser.email,
      savedUser.verificationCode,
    );
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
    return this.userRepository.updateUser(id, user);
  }

  async register(user: Partial<User>): Promise<User> {
    const newUser = this.userRepository.create(user);
    const savedUser = await this.userRepository.save(newUser);
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
    await this.userRepository.save(user);
    return true;
  }

  findUsersByFiltersPaginated(payload: UserQueryDto) {
    return this.userRepository.findUsersByFiltersPaginated(payload);
  }
}
