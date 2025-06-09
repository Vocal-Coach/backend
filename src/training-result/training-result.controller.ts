import { Controller, UseGuards, Request, Get, Post, Patch, Delete, Query, Body } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from "@nestjs/swagger";
import { JwtAuthGuard } from "src/auth/guard/jwt.guard";
import { TrainingResultService } from "./training-result.service";
import { CreateTrainingResultDto } from "./dto/create-training-result.dto";
import { UpdateTrainingResultDto } from "./dto/update-training-result.dto";
import { FindTrainingResultQueryDto, UpdateTrainingResultQueryDto, DeleteTrainingResultQueryDto } from "./dto/training-result-query.dto";

import { User } from "src/user/entities/user.entity";

@ApiTags("training-result")
@ApiBearerAuth("access-token")
@Controller("training-result")
@UseGuards(JwtAuthGuard)
export class TrainingResultController {
  constructor(private readonly trainingResultService: TrainingResultService) {}

  @Post()
  @ApiOperation({
    summary: "트레이닝 결과 생성",
    description: "새로운 트레이닝 결과를 생성합니다.",
  })
  @ApiResponse({
    status: 201,
    description: "트레이닝 결과 생성 성공",
    schema: {
      type: "object",
      properties: {
        id: { type: "number", example: 1 },
        trainingId: { type: "number", example: 1 },
        score: { type: "number", example: 85 },
        userId: { type: "number", example: 1 },
        createdAt: { type: "string", format: "date-time" },
        updatedAt: { type: "string", format: "date-time" },
      },
    },
  })
  @ApiResponse({ status: 400, description: "잘못된 요청 데이터" })
  @ApiResponse({ status: 401, description: "인증 실패" })
  create(@Request() req: Request & { user: User }, @Body() body: CreateTrainingResultDto) {
    return this.trainingResultService.create(body, req.user);
  }

  @Get()
  @ApiOperation({
    summary: "트레이닝 결과 조회",
    description: "ID나 trainingId가 제공되면 특정 결과를, 없으면 사용자의 모든 결과를 조회합니다.",
  })
  @ApiResponse({
    status: 200,
    description: "트레이닝 결과 조회 성공",
    schema: {
      oneOf: [
        {
          type: "object",
          properties: {
            id: { type: "number", example: 1 },
            trainingId: { type: "number", example: 1 },
            score: { type: "number", example: 85 },
            userId: { type: "number", example: 1 },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        {
          type: "array",
          items: {
            type: "object",
            properties: {
              id: { type: "number", example: 1 },
              trainingId: { type: "number", example: 1 },
              score: { type: "number", example: 85 },
              userId: { type: "number", example: 1 },
              createdAt: { type: "string", format: "date-time" },
              updatedAt: { type: "string", format: "date-time" },
            },
          },
        },
      ],
    },
  })
  @ApiResponse({ status: 401, description: "인증 실패" })
  @ApiResponse({ status: 404, description: "트레이닝 결과를 찾을 수 없음" })
  find(@Request() req: Request & { user: User }, @Query() query: FindTrainingResultQueryDto) {
    if (query.id !== undefined) {
      return this.trainingResultService.findOne(query.id, req.user);
    }
    if (query.trainingId !== undefined) {
      return this.trainingResultService.findByTrainingId(query.trainingId, req.user);
    }
    return this.trainingResultService.findAll(req.user);
  }

  @Patch()
  @ApiOperation({
    summary: "트레이닝 결과 수정",
    description: "기존 트레이닝 결과를 수정합니다.",
  })
  @ApiResponse({
    status: 200,
    description: "트레이닝 결과 수정 성공",
    schema: {
      type: "object",
      properties: {
        id: { type: "number", example: 1 },
        trainingId: { type: "number", example: 1 },
        score: { type: "number", example: 85 },
        userId: { type: "number", example: 1 },
        createdAt: { type: "string", format: "date-time" },
        updatedAt: { type: "string", format: "date-time" },
      },
    },
  })
  @ApiResponse({ status: 400, description: "잘못된 요청 데이터" })
  @ApiResponse({ status: 401, description: "인증 실패" })
  @ApiResponse({ status: 403, description: "권한 없음 (다른 사용자의 결과)" })
  @ApiResponse({ status: 404, description: "트레이닝 결과를 찾을 수 없음" })
  update(@Request() req: Request & { user: User }, @Query() query: UpdateTrainingResultQueryDto, @Body() body: UpdateTrainingResultDto) {
    return this.trainingResultService.update(query.id, body, req.user);
  }

  @Delete()
  @ApiOperation({
    summary: "트레이닝 결과 삭제",
    description: "기존 트레이닝 결과를 삭제합니다.",
  })
  @ApiResponse({
    status: 200,
    description: "트레이닝 결과 삭제 성공",
    schema: {
      type: "object",
      properties: {
        message: { type: "string", example: "트레이닝 결과가 성공적으로 삭제되었습니다." },
      },
    },
  })
  @ApiResponse({ status: 401, description: "인증 실패" })
  @ApiResponse({ status: 403, description: "권한 없음 (다른 사용자의 결과)" })
  @ApiResponse({ status: 404, description: "트레이닝 결과를 찾을 수 없음" })
  remove(@Request() req: Request & { user: User }, @Query() query: DeleteTrainingResultQueryDto) {
    return this.trainingResultService.remove(query.id, req.user);
  }
}
