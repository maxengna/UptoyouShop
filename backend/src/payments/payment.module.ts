import { Module } from "@nestjs/common";
import { PaymentsService } from "./payment.service";
import { PaymentsController } from "./payment.controller";
import { OrdersModule } from "../orders/orders.module";

@Module({
  imports: [OrdersModule],
  controllers: [PaymentsController],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
