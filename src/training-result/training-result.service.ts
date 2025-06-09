import { Injectable, BadRequestException } from "@nestjs/common";
import { CreateTrainingResultDto } from "./dto/create-training-result.dto";
import { UpdateTrainingResultDto } from "./dto/update-training-result.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { TrainingResult } from "./entities/training-result.entity";
import { User } from "../user/entities/user.entity";

@Injectable()
export class TrainingResultService {
  constructor(
    @InjectRepository(TrainingResult)
    private readonly trainingResultRepository: Repository<TrainingResult>
  ) {}

  create(createTrainingResultDto: CreateTrainingResultDto, user: User): Promise<TrainingResult> {
    return this.trainingResultRepository.save({ ...createTrainingResultDto, training: { id: createTrainingResultDto.trainingId }, user: user });
  }

  findAll(user: User): Promise<TrainingResult[]> {
    return this.trainingResultRepository.find({ where: { user: { id: user.id } }, relations: ["training"] });
  }

  async findOne(id: number, user: User): Promise<TrainingResult> {
    const result = await this.trainingResultRepository.findOne({ where: { id: id, user: { id: user.id } }, relations: ["training"] });
    if (!result) {
      throw new BadRequestException(`TrainingResult with id ${id} not found`);
    }
    return result;
  }

  findByTrainingId(trainingId: number, user: User): Promise<TrainingResult[]> {
    return this.trainingResultRepository.find({ where: { training: { id: trainingId }, user: { id: user.id } } });
  }

  async update(id: number, updateTrainingResultDto: UpdateTrainingResultDto, user: User): Promise<TrainingResult> {
    const result = await this.findOne(id, user);
    if (!result) {
      throw new BadRequestException(`TrainingResult with id ${id} not found`);
    }
    return this.trainingResultRepository.save({ ...result, ...updateTrainingResultDto });
  }

  async remove(id: number, user: User): Promise<null> {
    const result = await this.trainingResultRepository.delete({ id: id, user: { id: user.id } });
    if (result.affected === 0) {
      throw new BadRequestException(`TrainingResult with id ${id} not found`);
    }
    return null;
  }
}
