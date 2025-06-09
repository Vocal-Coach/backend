import { Module } from "@nestjs/common";
import { TrainingResultService } from "./training-result.service";
import { TrainingResultController } from "./training-result.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TrainingResult } from "./entities/training-result.entity";

import { AuthModule } from "src/auth/auth.module";
import { TrainingModule } from "src/training/training.module";

@Module({
  imports: [TypeOrmModule.forFeature([TrainingResult]), AuthModule, TrainingModule],
  controllers: [TrainingResultController],
  providers: [TrainingResultService],
})
export class TrainingResultModule {}
