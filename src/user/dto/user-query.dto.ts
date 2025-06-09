import { Transform } from "class-transformer";
import { IsOptional, IsNumber } from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";

export class UserQueryDto {
  @ApiPropertyOptional({
    description: "User ID to get profile (if not provided, returns current user's profile)",
    example: 1,
    type: "number",
  })
  @Transform(({ value }) => (value === undefined || value === "" ? undefined : Number(value)))
  @IsOptional()
  @IsNumber()
  id?: number;
}
