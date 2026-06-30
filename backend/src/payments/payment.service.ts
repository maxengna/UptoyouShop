import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../prisma/prisma.service";
import { OrdersService } from "../orders/orders.service";
import { PaymentStatus } from "@prisma/client";
import Stripe from "stripe";

@Injectable()
export class PaymentsService {
  private stripe: Stripe;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly ordersService: OrdersService,
  ) {
    const secretKey = this.configService.get("app.stripe.secretKey");
    if (secretKey) {
      this.stripe = new Stripe(secretKey, {
        apiVersion: "2026-06-24.dahlia",
      });
    }
  }

  async createPaymentIntent(orderId: string) {
    if (!this.stripe) {
      throw new InternalServerErrorException("Stripe is not configured");
    }

    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) {
      throw new NotFoundException("Order not found");
    }

    if (order.paymentStatus !== PaymentStatus.PENDING) {
      throw new BadRequestException("Payment already processed for this order");
    }

    const existingPayment = await this.prisma.payment.findUnique({
      where: { orderId },
    });

    if (existingPayment) {
      return {
        clientSecret: existingPayment.metadata as any,
        paymentIntentId: existingPayment.paymentIntent,
      };
    }

    const amountInCents = Math.round(Number(order.total) * 100);

    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: amountInCents,
      currency: order.currency.toLowerCase(),
      metadata: {
        orderId: order.id,
        orderNumber: order.orderNumber,
      },
    });

    await this.prisma.payment.create({
      data: {
        orderId: order.id,
        paymentIntent: paymentIntent.id,
        amount: order.total,
        currency: order.currency,
        status: PaymentStatus.PENDING,
        provider: "stripe",
        metadata: { clientSecret: paymentIntent.client_secret },
      },
    });

    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    };
  }

  async handleWebhook(rawBody: string, sig: string) {
    if (!this.stripe) {
      throw new InternalServerErrorException("Stripe is not configured");
    }

    const webhookSecret = this.configService.get("app.stripe.webhookSecret");
    if (!webhookSecret) {
      throw new InternalServerErrorException("Stripe webhook secret is not configured");
    }

    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
    } catch {
      throw new BadRequestException("Invalid webhook signature");
    }

    switch (event.type) {
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await this.confirmPayment(paymentIntent.id);
        break;
      }
      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await this.failPayment(paymentIntent.id);
        break;
      }
    }

    return { received: true };
  }

  async confirmPayment(paymentIntentId: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { paymentIntent: paymentIntentId },
    });

    if (!payment) {
      throw new NotFoundException("Payment not found");
    }

    await this.ordersService.confirmOrderPayment(payment.orderId, payment.id);
  }

  async failPayment(paymentIntentId: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { paymentIntent: paymentIntentId },
    });

    if (!payment) return;

    await this.prisma.payment.update({
      where: { id: payment.id },
      data: { status: PaymentStatus.FAILED },
    });
  }

  async testConfirmPayment(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException("Order not found");
    }

    if (order.paymentStatus !== PaymentStatus.PENDING) {
      throw new BadRequestException("Payment already processed for this order");
    }

    const paymentIntentId = `pi_test_${Date.now()}`;

    await this.prisma.payment.create({
      data: {
        orderId: order.id,
        paymentIntent: paymentIntentId,
        amount: order.total,
        currency: order.currency,
        status: PaymentStatus.COMPLETED,
        provider: "test",
      },
    });

    await this.ordersService.confirmOrderPayment(order.id);

    return { success: true, message: "Payment confirmed successfully" };
  }

  async confirmPaymentIntent(orderId: string, paymentIntentId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException("Order not found");
    }

    if (order.paymentStatus !== PaymentStatus.PENDING) {
      return { success: true, message: "Payment already confirmed" };
    }

    const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== "succeeded") {
      throw new BadRequestException(
        `PaymentIntent status is "${paymentIntent.status}", expected "succeeded"`,
      );
    }

    const existingPayment = await this.prisma.payment.findUnique({
      where: { paymentIntent: paymentIntentId },
    });

    if (!existingPayment) {
      throw new NotFoundException("Payment record not found");
    }

    await this.ordersService.confirmOrderPayment(order.id, existingPayment.id);

    return { success: true, message: "Payment confirmed and inventory updated" };
  }
}
