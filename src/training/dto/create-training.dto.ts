import { IsNotEmpty, IsNumber, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateTrainingDto {
  @ApiProperty({
    description: "트레이닝 제목",
    example: "발성 연습 기초",
  })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({
    description: "트레이닝 레벨 (1: 초급, 2: 중급, 3: 고급)",
    example: 1,
    minimum: 1,
    maximum: 3,
  })
  @IsNotEmpty()
  @IsNumber()
  level: number;

  @ApiProperty({
    description: "트레이닝 데이터 (JSON 문자열)",
    example: '{"exercises": ["warm-up", "scales"]}',
  })
  @IsNotEmpty()
  @IsString()
  data: string;
}
