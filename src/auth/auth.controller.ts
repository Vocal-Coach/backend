import { Controller, UseGuards, Request, Post, Body } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from "@nestjs/swagger";
import { AuthService } from "./auth.service";
import { RegisterDto } from "./dto/register.dto";
import { LocalAuthGuard } from "./guard/local.guard";
import { User } from "src/user/entities/user.entity";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post("login")
  @ApiOperation({
    summary: "사용자 로그인",
    description: "이메일과 비밀번호로 로그인하여 JWT 토큰을 받습니다.",
  })
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        email: { type: "string", example: "user@example.com" },
        password: { type: "string", example: "password123" },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: "로그인 성공",
    schema: {
      type: "object",
      properties: {
        access_token: { type: "string", example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." },
      },
    },
  })
  @ApiResponse({ status: 401, description: "인증 실패" })
  login(@Request() request: Request & { user: User }) {
    return this.authService.login(request.user);
  }

  @Post("register")
  @ApiOperation({
    summary: "사용자 회원가입",
    description: "새 사용자 계정을 생성합니다.",
  })
  @ApiResponse({
    status: 201,
    description: "회원가입 성공",
    schema: {
      type: "object",
      properties: {
        id: { type: "number", example: 1 },
        email: { type: "string", example: "user@example.com" },
        displayName: { type: "string", example: "홍길동" },
      },
    },
  })
  @ApiResponse({ status: 400, description: "잘못된 요청 데이터" })
  @ApiResponse({ status: 409, description: "이미 존재하는 이메일" })
  register(@Body() body: RegisterDto) {
    return this.authService.register(body.email, body.password, body.displayName);
  }
}
