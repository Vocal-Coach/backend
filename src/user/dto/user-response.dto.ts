import { ApiProperty } from "@nestjs/swagger";

export class UserResponseDto {
  @ApiProperty({
    description: "User ID",
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: "User email",
    example: "user@example.com",
  })
  email: string;

  @ApiProperty({
    description: "User display name",
    example: "John Doe",
  })
  displayName: string;
}
