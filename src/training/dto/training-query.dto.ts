import { Transform } from "class-transformer";
import { IsOptional, IsNumber, IsNotEmpty } from "class-validator";
import { ApiPropertyOptional, ApiProperty } from "@nestjs/swagger";

export class FindTrainingQueryDto {
  @ApiPropertyOptional({
    description: "조회할 트레이닝 ID (없으면 전체 조회)",
    example: 1,
    type: "number",
  })
  @Transform(({ value }) => (value === undefined || value === "" ? undefined : Number(value)))
  @IsOptional()
  @IsNumber()
  id?: number;
}

export class UpdateTrainingQueryDto {
  @ApiProperty({
    description: "수정할 트레이닝 ID",
    example: 1,
    type: "number",
  })
  @Transform(({ value }) => (value === undefined || value === "" ? undefined : Number(value)))
  @IsNotEmpty()
  @IsNumber()
  id: number;
}

export class DeleteTrainingQueryDto {
  @ApiProperty({
    description: "삭제할 트레이닝 ID",
    example: 1,
    type: "number",
  })
  @Transform(({ value }) => (value === undefined || value === "" ? undefined : Number(value)))
  @IsNotEmpty()
  @IsNumber()
  id: number;
}
