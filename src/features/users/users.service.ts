import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { User } from './entities/user.entity';
import { EmailService } from '../email/email.service';
import { Role } from '../../common/enum/role.enum';
import { UpdateUserDto, UserQueryDto } from './dto/user.dto';
import { UserRepository } from './repositories/user.repository';
import { SportsService } from '../sports/sports.service';

@Injectable()
export class UsersService {
  constructor(
    private userRepository: UserRepository,
    private emailService: EmailService,
    private readonly sportsService: SportsService,
  ) {}

  findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  findOne(id: number): Promise<User> {
    return this.userRepository.findOne({
      where: { id },
      relations: ['interestedSports'],
    });
  }

  findByEmail(email: string): Promise<User> {
    return this.userRepository.findByEmail(email);
  }

  async create(user: Partial<User>): Promise<User> {
    const existingUser = await this.userRepository.findOne({
      where: { email: user.email },
    });

    if (existingUser) {
      throw new ConflictException(
        'Ya existe un usuario con este correo electrónico',
      );
    }

    const savedUser = await this.userRepository.createUser(user);
    await this.emailService.sendVerificationEmail(
      savedUser.email,
      savedUser.verificationCode,
    );
    return savedUser;
  }

  async update(
    id: number,
    updateUserDto: UpdateUserDto,
    updatingUser: User,
  ): Promise<User> {
    if (updatingUser.role !== Role.ADMIN && updatingUser.id !== id) {
      throw new UnauthorizedException(
        'No tienes permiso para actualizar este usuario',
      );
    }

    const userDb = await this.findOne(id);

    if (updateUserDto.interestedSportIds) {
      const sports = await Promise.all(
        updateUserDto.interestedSportIds.map(async (sportId) => {
          try {
            return await this.sportsService.findOne(sportId);
          } catch (error) {
            throw new NotFoundException(
              `El deporte con ID ${sportId} no existe`,
            );
          }
        }),
      );
      userDb.interestedSports = sports;
    }

    Object.assign(userDb, updateUserDto);
    return this.userRepository.save(userDb);
  }

  async register(user: Partial<User>): Promise<User> {
    const existingUser = await this.userRepository.findOne({
      where: { email: user.email },
    });

    if (existingUser) {
      throw new ConflictException(
        'Ya existe un usuario con este correo electrónico',
      );
    }

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

  async findUsersForEventNotification(
    latitude: number,
    longitude: number,
    sportId: number,
  ): Promise<User[]> {
    return this.userRepository.findUsersForEventNotification(
      latitude,
      longitude,
      sportId,
    );
  }
}
