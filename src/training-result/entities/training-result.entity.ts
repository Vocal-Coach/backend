import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, VersionColumn, ManyToOne, JoinColumn } from "typeorm";
import { ApiProperty, ApiHideProperty } from "@nestjs/swagger";

import { User } from "../../user/entities/user.entity";
import { Training } from "src/training/entities/training.entity";

@Entity()
export class TrainingResult {
  @ApiProperty({
    description: "트레이닝 결과 ID",
    example: 1,
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    description: "관련 트레이닝 정보",
    type: () => Training,
  })
  @ManyToOne(() => Training)
  @JoinColumn({ name: "trainingId" })
  training: Training;

  @ApiProperty({
    description: "사용자 정보",
    type: () => User,
  })
  @ManyToOne(() => User)
  @JoinColumn({ name: "userId" })
  user: User;

  @ApiProperty({
    description: "트레이닝 점수 (0-100)",
    example: 85,
    minimum: 0,
    maximum: 100,
  })
  @Column()
  score: number;

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
