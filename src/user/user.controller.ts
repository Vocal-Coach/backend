import { Controller, Get, UseGuards, Request, Query } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/guard/jwt.guard";
import { UserService } from "./user.service";
import { UserResponseDto } from "./dto/user-response.dto";
import { UserQueryDto } from "./dto/user-query.dto";
import { User } from "./entities/user.entity";

@ApiTags("user")
@Controller("user")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth("access-token")
  @ApiOperation({
    summary: "Get user profile",
    description: "Get user profile information (ID, email, display name). If no ID is provided, returns current user's profile.",
  })
  @ApiResponse({
    status: 200,
    description: "User profile retrieved successfully",
    type: UserResponseDto,
  })
  @ApiResponse({ status: 401, description: "Authentication failed" })
  @ApiResponse({ status: 404, description: "User not found" })
  async getProfile(@Request() request: Request & { user: User }, @Query() query: UserQueryDto): Promise<UserResponseDto> {
    const targetUserId = query.id || request.user.id;
    return this.userService.getProfile(targetUserId);
  }
}
