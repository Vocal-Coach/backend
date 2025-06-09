import { Transform } from "class-transformer";
import { IsOptional, IsNumber, IsNotEmpty } from "class-validator";
import { ApiPropertyOptional, ApiProperty } from "@nestjs/swagger";

export class FindTrainingResultQueryDto {
  @ApiPropertyOptional({
    description: "조회할 트레이닝 결과 ID",
    example: 1,
    type: "number",
  })
  @Transform(({ value }) => (value === undefined || value === "" ? undefined : Number(value)))
  @IsOptional()
  @IsNumber()
  id?: number;

  @ApiPropertyOptional({
    description: "특정 트레이닝의 결과들을 조회할 트레이닝 ID",
    example: 1,
    type: "number",
  })
  @Transform(({ value }) => (value === undefined || value === "" ? undefined : Number(value)))
  @IsOptional()
  @IsNumber()
  trainingId?: number;
}

export class UpdateTrainingResultQueryDto {
  @ApiProperty({
    description: "수정할 트레이닝 결과 ID",
    example: 1,
    type: "number",
  })
  @Transform(({ value }) => (value === undefined || value === "" ? undefined : Number(value)))
  @IsNotEmpty()
  @IsNumber()
  id: number;
}

export class DeleteTrainingResultQueryDto {
  @ApiProperty({
    description: "삭제할 트레이닝 결과 ID",
    example: 1,
    type: "number",
  })
  @Transform(({ value }) => (value === undefined || value === "" ? undefined : Number(value)))
  @IsNotEmpty()
  @IsNumber()
  id: number;
}
