import {
  Controller,
  Post,
  Body,
  Param,
  Req,
  Headers,
  HttpCode,
  UseGuards,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { PaymentsService } from "./payment.service";
import { CreatePaymentIntentDto } from "./dto/create-payment-intent.dto";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { GetUser } from "../common/decorators/get-user.decorator";
import { Request } from "express";

@ApiTags("Payments")
@Controller("payments")
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post("create-intent")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Create Stripe payment intent for an order" })
  async createPaymentIntent(
    @GetUser("id") userId: string,
    @Body() dto: CreatePaymentIntentDto,
  ) {
    return this.paymentsService.createPaymentIntent(dto.orderId);
  }

  @Post("webhook")
  @HttpCode(200)
  @ApiOperation({ summary: "Stripe webhook endpoint" })
  async handleWebhook(
    @Req() req: Request,
    @Headers("stripe-signature") sig: string,
  ) {
    const rawBody = (req as any).rawBody;
    return this.paymentsService.handleWebhook(rawBody, sig);
  }

  @Post("confirm/:orderId")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Test-only: manually confirm payment for an order" })
  async testConfirmPayment(
    @GetUser("id") userId: string,
    @Param("orderId") orderId: string,
  ) {
    return this.paymentsService.testConfirmPayment(orderId);
  }

  @Post("confirm")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Confirm payment and update inventory after successful Stripe payment" })
  async confirmPayment(
    @GetUser("id") userId: string,
    @Body() dto: { orderId: string; paymentIntentId: string },
  ) {
    return this.paymentsService.confirmPaymentIntent(dto.orderId, dto.paymentIntentId);
  }
}
