import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";

import { TypeOrmModule } from "@nestjs/typeorm";

import { AuthModule } from "./auth/auth.module";
import { UserModule } from "./user/user.module";
import { TrainingModule } from "./training/training.module";
import { TrainingResultModule } from "./training-result/training-result.module";

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: "postgres",
      host: process.env.DB_HOST || "postgres",
      port: parseInt(process.env.DB_PORT || "5432"),
      username: process.env.DB_USERNAME || "postgres",
      password: process.env.DB_PASSWORD || "postgres",
      database: process.env.DB_NAME || "postgres",
      synchronize: process.env.NODE_ENV !== "production",
      autoLoadEntities: true,
      ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
    }),
    AuthModule,
    UserModule,
    TrainingModule,
    TrainingResultModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
