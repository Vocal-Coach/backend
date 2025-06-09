import { Injectable, BadRequestException } from "@nestjs/common";
import { CreateTrainingDto } from "./dto/create-training.dto";
import { UpdateTrainingDto } from "./dto/update-training.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { Training } from "./entities/training.entity";

@Injectable()
export class TrainingService {
  constructor(
    @InjectRepository(Training)
    private readonly trainingRepository: Repository<Training>
  ) {}

  create(createTrainingDto: CreateTrainingDto): Promise<Training> {
    return this.trainingRepository.save({ ...createTrainingDto });
  }

  findAll(): Promise<Training[]> {
    return this.trainingRepository.find();
  }

  async findOne(id: number): Promise<Training> {
    const result = await this.trainingRepository.findOne({ where: { id } });
    if (!result) {
      throw new BadRequestException(`Training with id ${id} not found`);
    }
    return result;
  }

  async update(id: number, updateTrainingDto: UpdateTrainingDto): Promise<Training> {
    const result = await this.trainingRepository.update(id, updateTrainingDto);
    if (result.affected === 0) {
      throw new BadRequestException(`Training with id ${id} not found`);
    }
    return this.findOne(id);
  }

  async remove(id: number): Promise<null> {
    const result = await this.trainingRepository.delete(id);
    if (result.affected === 0) {
      throw new BadRequestException(`Training with id ${id} not found`);
    }
    return null;
  }
}
