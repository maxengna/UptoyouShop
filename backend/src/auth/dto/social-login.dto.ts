import { IsString, IsNotEmpty } from 'class-validator';

export class SocialLoginDto {
  @IsString()
  @IsNotEmpty()
  accessToken: string;
}
