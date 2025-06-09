import { IsNotEmpty, IsString, IsEmail } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class RegisterDto {
  @ApiProperty({
    description: "사용자 이메일",
    example: "user@example.com",
    format: "email",
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    description: "사용자 비밀번호",
    example: "password123",
    minLength: 6,
  })
  @IsNotEmpty()
  @IsString()
  password: string;

  @ApiProperty({
    description: "사용자 표시 이름",
    example: "홍길동",
  })
  @IsNotEmpty()
  @IsString()
  displayName: string;
}
