import { IsNotEmpty, IsNumber } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateTrainingResultDto {
  @ApiProperty({
    description: "트레이닝 ID",
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  trainingId: number;

  @ApiProperty({
    description: "트레이닝 점수 (0-100)",
    example: 85,
    minimum: 0,
    maximum: 100,
  })
  @IsNotEmpty()
  @IsNumber()
  score: number;
}
