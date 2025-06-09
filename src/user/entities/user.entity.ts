import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, VersionColumn } from "typeorm";
import { Exclude } from "class-transformer";
import { ApiProperty, ApiHideProperty } from "@nestjs/swagger";

@Entity()
export class User {
  @ApiProperty({
    description: "사용자 ID",
    example: 1,
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    description: "사용자 이메일",
    example: "user@example.com",
  })
  @Column({ unique: true })
  email: string;

  @ApiHideProperty()
  @Exclude()
  @Column()
  passwordHash: string;

  @ApiProperty({
    description: "사용자 표시 이름",
    example: "홍길동",
  })
  @Column({ unique: true })
  displayName: string;

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
