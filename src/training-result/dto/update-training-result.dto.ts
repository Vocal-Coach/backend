import { PartialType } from "@nestjs/swagger";
import { CreateTrainingResultDto } from "./create-training-result.dto";

export class UpdateTrainingResultDto extends PartialType(CreateTrainingResultDto) {}
