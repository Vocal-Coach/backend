import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "./entities/user.entity";
import { UserResponseDto } from "./dto/user-response.dto";

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) {}

  async getProfile(userId: number): Promise<UserResponseDto> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: ["id", "email", "displayName"],
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    return {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
    };
  }

  async getProfileById(targetUserId: number): Promise<UserResponseDto> {
    return this.getProfile(targetUserId);
  }
}
