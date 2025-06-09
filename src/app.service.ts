import { Injectable } from "@nestjs/common";

@Injectable()
export class AppService {
  main(): string {
    return "Vocal Coach API Server";
  }
}
