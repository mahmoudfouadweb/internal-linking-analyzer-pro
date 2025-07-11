/**
 * @author Mahmoud & Expert System
 * @description Centralized error management system with advanced features
 * @created 2025-07-11
 */

import { ErrorSanitizer } from '../security/ErrorSanitizer';
import { ErrorQueue } from './ErrorQueue';
import { CircuitBreakerManager } from '../resilience/CircuitBreaker';
import { PerformanceMonitor } from '../monitoring/PerformanceMonitor';
import { 
  ErrorEvent, 
  ErrorContext, 
  ErrorSeverity, 
  ErrorCategory, 
  BaseError,
  SanitizedError 
} from './types';

interface ErrorStore {
  persist(error: ErrorEvent): Promise<void>;
  getErrors(filters?: ErrorFilters): Promise<ErrorEvent[]>;
  clearErrors(): Promise<void>;
}

interface ErrorFilters {
  severity?: ErrorSeverity;
  category?: ErrorCategory;
  component?: string;
  timeRange?: {
    start: Date;
    end: Date;
  };
}

interface TelemetryService {
  track(error: ErrorEvent): void;
  flush(): Promise<void>;
}

interface ErrorManagerConfig {
  maxErrorsInMemory: number;
  batchSize: number;
  flushInterval: number;
  enableTelemetry: boolean;
  enableLocalStorage: boolean;
}

export class ErrorManager {
  private static instance: ErrorManager;
  private errorStore: ErrorStore;
  private telemetryService: TelemetryService;
  private config: ErrorManagerConfig;
  private errorQueue: ErrorQueue;
  private circuitBreakerManager: CircuitBreakerManager;
  private performanceMonitor: PerformanceMonitor;
  private subscribers: Map<string, (error: ErrorEvent) => void> = new Map();

  private constructor(config: Partial<ErrorManagerConfig> = {}) {
    this.config = {
      maxErrorsInMemory: 100,
      batchSize: 10,
      flushInterval: 30000, // 30 seconds
      enableTelemetry: true,
      enableLocalStorage: true,
      ...config
    };

    this.errorStore = new LocalErrorStore(this.config);
    this.telemetryService = new WebTelemetryService();
    this.errorQueue = new ErrorQueue({
      batchSize: this.config.batchSize,
      flushInterval: this.config.flushInterval,
      maxRetries: 3,
      retryDelay: 1000,
      maxQueueSize: this.config.maxErrorsInMemory * 2,
      priorityThreshold: ErrorSeverity.HIGH
    });
    this.circuitBreakerManager = CircuitBreakerManager.getInstance();
    this.performanceMonitor = PerformanceMonitor.getInstance();
  }

  static getInstance(config?: Partial<ErrorManagerConfig>): ErrorManager {
    if (!ErrorManager.instance) {
      ErrorManager.instance = new ErrorManager(config);
    }
    return ErrorManager.instance;
  }

  async handleError(error: Error | BaseError, context: ErrorContext): Promise<string> {
    try {
      // إنشاء معرف فريد للخطأ
      const errorId = ErrorSanitizer.generateErrorId();
      
      // تطهير الخطأ
      const sanitizedError = ErrorSanitizer.sanitizeForLogging(error, true);
      
      // تحديد شدة الخطأ وفئته
      const { severity, category } = this.classifyError(error);
      
      // إنشاء حدث الخطأ
      const errorEvent: ErrorEvent = {
        id: errorId,
        error: sanitizedError,
        context: {
          ...context,
          timestamp: Date.now(),
          metadata: {
            ...context.metadata,
            errorId,
            userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'server',
            url: typeof window !== 'undefined' ? window.location.href : 'unknown',
            stackTrace: error.stack
          }
        },
        severity,
        category
      };

      // إضافة إلى الطابور
      this.enqueueError(errorEvent);
      
      // إشعار المشتركين
      this.notifySubscribers(errorEvent);
      
      // تنفيذ استراتيجية الاسترداد إذا كان الخطأ من نوع BaseError
      if (error instanceof BaseError) {
        await this.executeRecoveryStrategy(error);
      }

      return errorId;
    } catch (processingError) {
      console.error('Failed to process error:', processingError);
      return 'error_processing_failed';
    }
  }

  private classifyError(error: Error): { severity: ErrorSeverity; category: ErrorCategory } {
    // تصنيف الأخطاء بناءً على النوع والرسالة
    if (error.message.includes('Network') || error.message.includes('fetch')) {
      return { severity: ErrorSeverity.MEDIUM, category: ErrorCategory.EXTERNAL_SERVICE };
    }
    
    if (error.message.includes('chunk') || error.message.includes('loading')) {
      return { severity: ErrorSeverity.HIGH, category: ErrorCategory.INFRASTRUCTURE };
    }
    
    if (error.message.includes('Unauthorized') || error.message.includes('Forbidden')) {
      return { severity: ErrorSeverity.HIGH, category: ErrorCategory.SECURITY };
    }
    
    if (error.message.includes('validation') || error.message.includes('invalid')) {
      return { severity: ErrorSeverity.LOW, category: ErrorCategory.USER_INPUT };
    }

    // افتراضي
    return { severity: ErrorSeverity.MEDIUM, category: ErrorCategory.BUSINESS_LOGIC };
  }

  private enqueueError(errorEvent: ErrorEvent): void {
    this.errorQueue.push(errorEvent);
    
    // إزالة الأخطاء القديمة إذا تجاوزنا الحد الأقصى
    if (this.errorQueue.length > this.config.maxErrorsInMemory) {
      this.errorQueue.shift();
    }
    
    // تنظيف فوري إذا امتلأ الطابور
    if (this.errorQueue.length >= this.config.batchSize) {
      this.flush();
    }
  }

  private notifySubscribers(errorEvent: ErrorEvent): void {
    this.subscribers.forEach(callback => {
      try {
        callback(errorEvent);
      } catch (callbackError) {
        console.error('Error in subscriber callback:', callbackError);
      }
    });
  }

  private async executeRecoveryStrategy(error: BaseError): Promise<void> {
    try {
      const strategy = error.getRecoveryStrategy();
      if (strategy.canRecover(error)) {
        await strategy.execute();
      }
    } catch (recoveryError) {
      console.error('Recovery strategy failed:', recoveryError);
    }
  }

  private startPeriodicFlush(): void {
    if (typeof window === 'undefined') return;
    
    this.flushTimer = setInterval(() => {
      this.flush();
    }, this.config.flushInterval);
  }

  async flush(): Promise<void> {
    if (this.errorQueue.length === 0) return;

    const batch = this.errorQueue.splice(0, this.config.batchSize);
    
    try {
      // حفظ في التخزين المحلي
      if (this.config.enableLocalStorage) {
        await Promise.all(batch.map(error => this.errorStore.persist(error)));
      }
      
      // إرسال للتتبع
      if (this.config.enableTelemetry) {
        batch.forEach(error => this.telemetryService.track(error));
        await this.telemetryService.flush();
      }
      
      // إرسال للخادم
      await this.sendBatchToServer(batch);
      
    } catch (flushError) {
      console.error('Failed to flush errors:', flushError);
      // إعادة الأخطاء إلى الطابور للمحاولة مرة أخرى
      this.errorQueue.unshift(...batch);
    }
  }

  private async sendBatchToServer(errors: ErrorEvent[]): Promise<void> {
    if (typeof window === 'undefined') return;
    
    try {
      const response = await fetch('/api/errors', {
        method: 'PUT', // استخدام PUT للـ batch
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          errors,
          metadata: {
            sessionId: this.getSessionId(),
            batchId: ErrorSanitizer.generateErrorId(),
            timestamp: Date.now(),
            batchSize: errors.length
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }
    } catch (networkError) {
      console.error('Failed to send batch to server:', networkError);
      throw networkError;
    }
  }

  private getSessionId(): string {
    if (typeof window === 'undefined') return 'server';
    
    let sessionId = sessionStorage.getItem('error-session-id');
    if (!sessionId) {
      sessionId = ErrorSanitizer.generateErrorId();
      sessionStorage.setItem('error-session-id', sessionId);
    }
    return sessionId;
  }

  // Public API methods
  subscribe(id: string, callback: (error: ErrorEvent) => void): void {
    this.subscribers.set(id, callback);
  }

  unsubscribe(id: string): void {
    this.subscribers.delete(id);
  }

  async getRecentErrors(limit: number = 50): Promise<ErrorEvent[]> {
    const storedErrors = await this.errorStore.getErrors();
    const allErrors = [...storedErrors, ...this.errorQueue];
    
    return allErrors
      .sort((a, b) => b.context.timestamp - a.context.timestamp)
      .slice(0, limit);
  }

  async getErrorsByComponent(component: string): Promise<ErrorEvent[]> {
    return this.errorStore.getErrors({ component });
  }

  async getErrorsBySeverity(severity: ErrorSeverity): Promise<ErrorEvent[]> {
    return this.errorStore.getErrors({ severity });
  }

  async clearAllErrors(): Promise<void> {
    this.errorQueue = [];
    await this.errorStore.clearErrors();
  }

  getStats(): {
    queueSize: number;
    totalSubscribers: number;
    config: ErrorManagerConfig;
  } {
    return {
      queueSize: this.errorQueue.length,
      totalSubscribers: this.subscribers.size,
      config: this.config
    };
  }

  destroy(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
    
    // تنظيف نهائي
    this.flush();
    this.subscribers.clear();
  }
}

// تنفيذ التخزين المحلي
class LocalErrorStore implements ErrorStore {
  private readonly storageKey = 'app_errors';
  private readonly maxStorageSize: number;

  constructor(config: ErrorManagerConfig) {
    this.maxStorageSize = config.maxErrorsInMemory * 2; // ضعف الحد الأقصى للذاكرة
  }

  async persist(error: ErrorEvent): Promise<void> {
    if (typeof window === 'undefined') return;
    
    try {
      const stored = this.getStoredErrors();
      stored.push(error);
      
      // إزالة الأخطاء القديمة
      if (stored.length > this.maxStorageSize) {
        stored.splice(0, stored.length - this.maxStorageSize);
      }
      
      localStorage.setItem(this.storageKey, JSON.stringify(stored));
    } catch (storageError) {
      console.warn('Failed to persist error to localStorage:', storageError);
    }
  }

  async getErrors(filters?: ErrorFilters): Promise<ErrorEvent[]> {
    const stored = this.getStoredErrors();
    
    if (!filters) return stored;
    
    return stored.filter(error => {
      if (filters.severity && error.severity !== filters.severity) return false;
      if (filters.category && error.category !== filters.category) return false;
      if (filters.component && error.context.component !== filters.component) return false;
      if (filters.timeRange) {
        const errorTime = new Date(error.context.timestamp);
        if (errorTime < filters.timeRange.start || errorTime > filters.timeRange.end) {
          return false;
        }
      }
      return true;
    });
  }

  async clearErrors(): Promise<void> {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(this.storageKey);
  }

  private getStoredErrors(): ErrorEvent[] {
    if (typeof window === 'undefined') return [];
    
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch (parseError) {
      console.warn('Failed to parse stored errors:', parseError);
      return [];
    }
  }
}

// تنفيذ خدمة التتبع
class WebTelemetryService implements TelemetryService {
  private events: ErrorEvent[] = [];

  track(error: ErrorEvent): void {
    this.events.push(error);
    
    // إرسال فوري للأخطاء الحرجة
    if (error.severity === ErrorSeverity.CRITICAL) {
      this.flush();
    }
  }

  async flush(): Promise<void> {
    if (this.events.length === 0) return;
    
    const eventsToSend = [...this.events];
    this.events = [];
    
    // في بيئة الإنتاج، يمكن إرسال هذه البيانات إلى خدمة تحليلات
    if (process.env.NODE_ENV === 'production') {
      console.log('📊 Telemetry flush:', eventsToSend.length, 'events');
      // await sendToAnalyticsService(eventsToSend);
    }
  }
}

export default ErrorManager;
