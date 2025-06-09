import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, VersionColumn } from "typeorm";
import { ApiProperty, ApiHideProperty } from "@nestjs/swagger";

@Entity()
export class Training {
  @ApiProperty({
    description: "트레이닝 ID",
    example: 1,
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    description: "트레이닝 제목",
    example: "발성 연습 기초",
  })
  @Column()
  title: string;

  @ApiProperty({
    description: "트레이닝 레벨 (1: 초급, 2: 중급, 3: 고급)",
    example: 1,
    minimum: 1,
    maximum: 3,
  })
  @Column()
  level: number;

  @ApiProperty({
    description: "트레이닝 데이터 (JSON 문자열)",
    example: '{"exercises": ["warm-up", "scales"]}',
  })
  @Column()
  data: string;

  @ApiProperty({
    description: "생성 일시",
    example: "2024-01-01T00:00:00.000Z",
  })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({
    description: "수정 일시",
    example: "2024-01-01T00:00:00.000Z",
  })
  @UpdateDateColumn()
  updatedAt: Date;

  @ApiHideProperty()
  @DeleteDateColumn()
  deletedAt: Date;

  @ApiHideProperty()
  @VersionColumn()
  version: number;
}
