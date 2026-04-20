import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class ChatRequestDto {
  @IsString()
  @IsNotEmpty()
  sessionId: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  message: string;
}
