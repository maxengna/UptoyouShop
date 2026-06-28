import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePaymentIntentDto {
  @ApiProperty({ example: 'order-id' })
  @IsString()
  orderId: string;
}
