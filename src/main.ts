import * as dotenv from "dotenv";
dotenv.config();

import { NestFactory, Reflector } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe, ClassSerializerInterceptor } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: true,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
    credentials: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    })
  );
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  const config = new DocumentBuilder()
    .setTitle("Vocal Coach API")
    .setDescription("Vocal Coach 서버 API 문서")
    .setVersion("1.0")
    .addTag("auth", "인증 관련 API")
    .addTag("user", "사용자 관련 API")
    .addTag("training", "트레이닝 관련 API")
    .addTag("training-result", "트레이닝 결과 관련 API")
    .addBearerAuth(
      {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        name: "JWT",
        description: "JWT 토큰을 입력하세요",
        in: "header",
      },
      "access-token"
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup("api", app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      defaultModelsExpandDepth: -1,
    },
  });

  await app.listen(process.env.PORT ?? 3000);

  console.log(`Application is running on: ${await app.getUrl()}`);
  console.log(`Swagger documentation is available at: ${await app.getUrl()}/api`);
}
bootstrap();
