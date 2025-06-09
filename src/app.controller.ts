import { Controller, Get } from "@nestjs/common";
import { AppService } from "./app.service";

import { ApiTags, ApiExcludeEndpoint } from "@nestjs/swagger";

@ApiTags("main")
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @ApiExcludeEndpoint()
  @Get()
  main(): string {
    return this.appService.main();
  }
}
