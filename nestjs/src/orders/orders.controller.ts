import {
  Body,
  Controller,
  Get,
  MessageEvent,
  Param,
  Post,
  Sse,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { ExecuteTransactionMessage, InitTransactionDTO } from './orders.dto';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { OrderType } from '@prisma/client';
import { Observable, map } from 'rxjs';

@Controller('wallets/:wallet_id/orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  all(@Param('wallet_id') wallet_id: string) {
    return this.ordersService.all({ wallet_id });
  }

  @Post()
  initTransaction(
    @Param('wallet_id') wallet_id: string,
    @Body() body: Omit<InitTransactionDTO, 'wallet_id'>,
  ) {
    return this.ordersService.initTransaction({ ...body, wallet_id });
  }

  // executeTransaction(@Body() body: InputExecuteTransactionDTO) {
  //   return this.ordersService.executeTransaction(body);
  // }

  @MessagePattern('output')
  async executeTransaction(@Payload() message: ExecuteTransactionMessage) {
    const transaction = message.transactions[message.transactions.length - 1];

    await this.ordersService.executeTransaction({
      order_id: message.order_id,
      status: message.status,
      related_investor_id:
        message.order_type === OrderType.BUY
          ? transaction.seller_id
          : transaction.buyer_id,
      broker_transaction_id: transaction.transaction_id,
      negotiated_shares: transaction.shares,
      price: transaction.price,
    });
  }

  @Sse('events')
  events(@Param('wallet_id') wallet_id: string): Observable<MessageEvent> {
    return this.ordersService.subscribeEvents(wallet_id).pipe(
      map((event) => ({
        type: event.event,
        data: event.data,
      })),
    );
  }
}
