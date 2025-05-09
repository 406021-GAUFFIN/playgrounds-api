import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sport } from './entities/sport.entity';
import { CreateSportDto } from './dto/create-sport.dto';
import { UpdateSportDto } from './dto/update-sport.dto';

@Injectable()
export class SportsService {
  constructor(
    @InjectRepository(Sport)
    private readonly sportRepository: Repository<Sport>,
  ) {}

  async create(createSportDto: CreateSportDto): Promise<Sport> {
    const sport = this.sportRepository.create(createSportDto);
    return await this.sportRepository.save(sport);
  }

  async findAll(): Promise<Sport[]> {
    return await this.sportRepository.find();
  }

  async findOne(id: number): Promise<Sport> {
    const sport = await this.sportRepository.findOne({ where: { id } });
    if (!sport) {
      throw new NotFoundException(`Sport with ID ${id} not found`);
    }
    return sport;
  }

  async update(id: number, updateSportDto: UpdateSportDto): Promise<Sport> {
    const sport = await this.findOne(id);
    Object.assign(sport, updateSportDto);
    return await this.sportRepository.save(sport);
  }

  async remove(id: number): Promise<void> {
    const sport = await this.findOne(id);
    await this.sportRepository.remove(sport);
  }
}
