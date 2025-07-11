/**
 * @author Mahmoud & Expert System
 * @description Types and interfaces for error management system
 * @created 2025-07-11
 */

export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum ErrorCategory {
  INFRASTRUCTURE = 'infrastructure',
  BUSINESS_LOGIC = 'business_logic',
  USER_INPUT = 'user_input',
  EXTERNAL_SERVICE = 'external_service',
  SECURITY = 'security'
}

export enum CircuitState {
  CLOSED = 'closed',
  OPEN = 'open',
  HALF_OPEN = 'half_open'
}

export interface ErrorContext {
  readonly component: string;
  readonly action: string;
  readonly userId?: string;
  readonly sessionId: string;
  readonly timestamp: number;
  readonly metadata?: Record<string, unknown>;
}

export interface SanitizedError {
  message: string;
  stack?: string;
  name: string;
  timestamp: number;
  userAgent?: string;
}

export interface ErrorEvent {
  id: string;
  error: SanitizedError;
  context: ErrorContext;
  severity: ErrorSeverity;
  category: ErrorCategory;
}

export interface RecoveryStrategy {
  execute(): Promise<void>;
  canRecover(error: Error): boolean;
}

export abstract class BaseError extends Error {
  abstract readonly code: string;
  abstract readonly severity: ErrorSeverity;
  abstract readonly category: ErrorCategory;
  
  constructor(
    message: string,
    public readonly context: ErrorContext,
    public readonly cause?: Error
  ) {
    super(message);
    this.name = this.constructor.name;
  }
  
  abstract getRecoveryStrategy(): RecoveryStrategy;
}

export class ChunkLoadError extends BaseError {
  readonly code = 'CHUNK_LOAD_FAILED';
  readonly severity = ErrorSeverity.HIGH;
  readonly category = ErrorCategory.INFRASTRUCTURE;
  
  getRecoveryStrategy(): RecoveryStrategy {
    return new ChunkLoadRecoveryStrategy();
  }
}

export class ChunkLoadRecoveryStrategy implements RecoveryStrategy {
  async execute(): Promise<void> {
    // إعادة تحميل الصفحة مع تتبع المحاولات
    const reloadAttempts = parseInt(sessionStorage.getItem('chunk-reload-attempts') || '0');
    
    if (reloadAttempts < 2) {
      sessionStorage.setItem('chunk-reload-attempts', (reloadAttempts + 1).toString());
      window.location.reload();
    } else {
      // إذا فشلت المحاولات، امسح التخزين وأعد التوجيه للصفحة الرئيسية
      sessionStorage.removeItem('chunk-reload-attempts');
      window.location.href = '/';
    }
  }
  
  canRecover(error: Error): boolean {
    return error.message.includes('Loading chunk') || error.message.includes('ChunkLoadError');
  }
}

export class CircuitBreakerOpenError extends Error {
  constructor() {
    super('Circuit breaker is open - service temporarily unavailable');
    this.name = 'CircuitBreakerOpenError';
  }
}
