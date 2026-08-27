import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

@Injectable()
export class ResponseInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((res) => {
        // Bypass wrapping for StreamableFile, Buffer, or direct stream responses
        if (
          res &&
          (res.constructor?.name === 'StreamableFile' ||
            Buffer.isBuffer(res) ||
            typeof (res as any).pipe === 'function')
        ) {
          return res;
        }

        // If response is already formatted as ApiResponse, return directly
        if (
          res &&
          typeof res === 'object' &&
          'success' in res &&
          'data' in res
        ) {
          return res as ApiResponse<T>;
        }

        // If response has a message and data property
        let message = 'Operation successful';
        let data = res;

        if (
          res &&
          typeof res === 'object' &&
          'message' in res &&
          'data' in res
        ) {
          message = res.message;
          data = res.data;
        } else if (res && typeof res === 'object' && 'message' in res && Object.keys(res).length === 1) {
          message = res.message;
          data = null as unknown as T;
        }

        return {
          success: true,
          message,
          data,
        };
      }),
    );
  }
}
