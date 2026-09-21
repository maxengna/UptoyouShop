// logging.interceptor.ts
import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import {trace,context as otelContext} from '@opentelemetry/api'

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP_REQUEST');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const req = ctx.getRequest();
    const { method, url, headers } = req;
    const correlationId = headers['x-correlation-id'];
    const startTime = Date.now();
    const activeSpan = trace.getSpan(otelContext.active());
    const spanContext = activeSpan?.spanContext();
    const otelTraceID = spanContext?.traceId;
    const otelSpanId = spanContext?.spanId; 

    // 1. Log ข้อมูลขาเข้า (Pre-request)
    this.logger.log(JSON.stringify({
      message: `Incoming Request: ${method} ${url}`,
      correlationId,
      traceId : otelTraceID,
      spanId : otelSpanId,
      method,
      url,
    }));

    // 2. ปล่อยให้ Controller ทำงาน และ Log ข้อมูลขาออก (Post-request)
    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - startTime;
        const res = ctx.getResponse();
        
        this.logger.log(JSON.stringify({
          message: `Request Completed: ${method} ${url}`,
          correlationId,
          traceId: otelTraceID,
          spanId: otelSpanId,
          statusCode: res.statusCode,
          duration: `${duration}ms`,
        }));
      }),
    );
  }
}
