import { Controller, UseGuards, Get, Post, Patch, Delete, Query, Body } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from "@nestjs/swagger";
import { JwtAuthGuard } from "src/auth/guard/jwt.guard";
import { TrainingService } from "./training.service";
import { CreateTrainingDto } from "./dto/create-training.dto";
import { UpdateTrainingDto } from "./dto/update-training.dto";
import { FindTrainingQueryDto, UpdateTrainingQueryDto, DeleteTrainingQueryDto } from "./dto/training-query.dto";

@ApiTags("training")
@ApiBearerAuth("access-token")
@Controller("training")
@UseGuards(JwtAuthGuard)
export class TrainingController {
  constructor(private readonly trainingService: TrainingService) {}

  @Post()
  @ApiOperation({
    summary: "트레이닝 생성",
    description: "새로운 트레이닝을 생성합니다.",
  })
  @ApiResponse({
    status: 201,
    description: "트레이닝 생성 성공",
    schema: {
      type: "object",
      properties: {
        id: { type: "number", example: 1 },
        title: { type: "string", example: "발성 연습 기초" },
        level: { type: "number", example: 1 },
        data: { type: "string", example: '{"exercises": ["warm-up", "scales"]}' },
        createdAt: { type: "string", format: "date-time" },
        updatedAt: { type: "string", format: "date-time" },
      },
    },
  })
  @ApiResponse({ status: 400, description: "잘못된 요청 데이터" })
  @ApiResponse({ status: 401, description: "인증 실패" })
  create(@Body() body: CreateTrainingDto) {
    return this.trainingService.create(body);
  }

  @Get()
  @ApiOperation({
    summary: "트레이닝 조회",
    description: "ID가 제공되면 특정 트레이닝을, 없으면 모든 트레이닝을 조회합니다.",
  })
  @ApiResponse({
    status: 200,
    description: "트레이닝 조회 성공",
    schema: {
      oneOf: [
        {
          type: "object",
          properties: {
            id: { type: "number", example: 1 },
            title: { type: "string", example: "발성 연습 기초" },
            level: { type: "number", example: 1 },
            data: { type: "string", example: '{"exercises": ["warm-up", "scales"]}' },
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
              title: { type: "string", example: "발성 연습 기초" },
              level: { type: "number", example: 1 },
              data: { type: "string", example: '{"exercises": ["warm-up", "scales"]}' },
              createdAt: { type: "string", format: "date-time" },
              updatedAt: { type: "string", format: "date-time" },
            },
          },
        },
      ],
    },
  })
  @ApiResponse({ status: 401, description: "인증 실패" })
  @ApiResponse({ status: 404, description: "트레이닝을 찾을 수 없음" })
  find(@Query() query: FindTrainingQueryDto) {
    if (query.id === undefined) {
      return this.trainingService.findAll();
    }
    return this.trainingService.findOne(query.id);
  }

  @Patch()
  @ApiOperation({
    summary: "트레이닝 수정",
    description: "기존 트레이닝을 수정합니다.",
  })
  @ApiResponse({
    status: 200,
    description: "트레이닝 수정 성공",
    schema: {
      type: "object",
      properties: {
        id: { type: "number", example: 1 },
        title: { type: "string", example: "발성 연습 기초" },
        level: { type: "number", example: 1 },
        data: { type: "string", example: '{"exercises": ["warm-up", "scales"]}' },
        createdAt: { type: "string", format: "date-time" },
        updatedAt: { type: "string", format: "date-time" },
      },
    },
  })
  @ApiResponse({ status: 400, description: "잘못된 요청 데이터" })
  @ApiResponse({ status: 401, description: "인증 실패" })
  @ApiResponse({ status: 404, description: "트레이닝을 찾을 수 없음" })
  update(@Query() query: UpdateTrainingQueryDto, @Body() body: UpdateTrainingDto) {
    return this.trainingService.update(query.id, body);
  }

  @Delete()
  @ApiOperation({
    summary: "트레이닝 삭제",
    description: "기존 트레이닝을 삭제합니다.",
  })
  @ApiResponse({
    status: 200,
    description: "트레이닝 삭제 성공",
    schema: {
      type: "object",
      properties: {
        message: { type: "string", example: "트레이닝이 성공적으로 삭제되었습니다." },
      },
    },
  })
  @ApiResponse({ status: 401, description: "인증 실패" })
  @ApiResponse({ status: 404, description: "트레이닝을 찾을 수 없음" })
  remove(@Query() query: DeleteTrainingQueryDto) {
    return this.trainingService.remove(query.id);
  }
}
