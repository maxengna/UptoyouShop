// src/common/filters/all-exceptions.filter.ts
import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Request, Response } from 'express';
import { trace, SpanStatusCode } from '@opentelemetry/api';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('GLOBAL_EXCEPTION');

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // 1. แยกแยะประเภท Error และกำหนด HTTP Status Code
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    // 2. ดึงข้อความ Error Message ออกมา
    let message = 'Internal server error';
    let errorDetails: any = null;

    if (exception instanceof HttpException) {
      const resResponse = exception.getResponse();
      if (typeof resResponse === 'object') {
        message = (resResponse as any).message || exception.message;
        errorDetails = resResponse;
      } else {
        message = resResponse;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
      errorDetails = { stack: exception.stack };
    }

    // 3. บันทึก Exception ลงใน OpenTelemetry Span
    const span = trace.getActiveSpan();
    if (span) {
      if (exception instanceof Error) {
        span.recordException(exception);
      }
      if (status >= 500) {
        span.setStatus({
          code: SpanStatusCode.ERROR,
          message: typeof message === 'string' ? message : JSON.stringify(message),
        });
      }
    }

    const spanContext = span?.spanContext();

    // 4. ดึง Correlation ID ที่ Middleware สร้างไว้
    const correlationId = request.headers['x-correlation-id'] || 'unknown';

    // 5. พ่น Log ออกมาเป็นรูปแบบ Structured JSON (จับคู่กับ Loki และ Tempo/Jaeger)
    const logData = {
      message: `Error occurred on [${request.method}] ${request.url}: ${message}`,
      correlationId,
      traceId: spanContext?.traceId,
      spanId: spanContext?.spanId,
      statusCode: status,
      path: request.url,
      method: request.method,
      error: message,
      details: errorDetails,
    };

    if (status >= 500) {
      this.logger.error(JSON.stringify(logData));
    } else {
      this.logger.warn(JSON.stringify(logData));
    }

    // 6. ส่ง Response กลับไปหา Client
    response.status(status).json({
      statusCode: status,
      message: status >= 500 ? 'เกิดข้อผิดพลาดภายในระบบ กรุณาลองใหม่อีกครั้ง' : message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
