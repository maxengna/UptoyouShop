import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  success: boolean;
  data: T;
  message: string;
  errors: any[];
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, Response<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<Response<T>> {
    return next.handle().pipe(
      map((data) => {
        // If response is already formatted, return as is
        if (
          data &&
          typeof data === 'object' &&
          'success' in data &&
          'data' in data &&
          'message' in data
        ) {
          return data as Response<T>;
        }

        // Format the response
        return {
          success: true,
          data: data || null,
          message: 'Operation completed successfully',
          errors: [],
        };
      }),
    );
  }
}
