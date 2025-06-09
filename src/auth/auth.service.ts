import { Injectable, BadRequestException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User, Gender } from "src/user/entities/user.entity";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService
  ) {}

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.userRepository.findOneBy({ email: email });
    if (user && (await bcrypt.compare(password, user.passwordHash))) {
      return user;
    }
    return null;
  }

  login(user: User) {
    const payload = {
      sub: user.id,
      email: user.email,
      displayName: user.displayName,
      gender: user.gender,
    };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async register(email: string, password: string, displayName: string, gender: Gender): Promise<User> {
    const existingUser = await this.userRepository.findOneBy({ email: email });
    if (existingUser) {
      throw new BadRequestException("User already exists");
    }
    const existingDisplayName = await this.userRepository.findOneBy({ displayName: displayName });
    if (existingDisplayName) {
      throw new BadRequestException("Display name already exists");
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = this.userRepository.save({
      email,
      passwordHash: hashedPassword,
      displayName,
      gender,
    });
    return user;
  }
}
