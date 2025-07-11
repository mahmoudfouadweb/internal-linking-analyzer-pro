/**
 * @author Mahmoud & Expert System
 * @description Secure error boundary with throttling and sanitization
 * @created 2025-07-11
 */

'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ErrorSanitizer } from '../security/ErrorSanitizer';
import { ErrorSeverity, ErrorCategory, ErrorContext } from './types';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  componentName?: string;
}

interface SecureErrorBoundaryState {
  hasError: boolean;
  errorId: string;
  retryCount: number;
  lastErrorTime: number;
}

export class SecureErrorBoundary extends Component<Props, SecureErrorBoundaryState> {
  private errorThrottle = new Map<string, number>();
  private readonly MAX_RETRIES = 3;
  private readonly THROTTLE_WINDOW = 60000; // 1 minute
  private readonly MAX_ERRORS_PER_WINDOW = 5;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      errorId: '',
      retryCount: 0,
      lastErrorTime: 0
    };
  }

  static getDerivedStateFromError(error: Error): Partial<SecureErrorBoundaryState> {
    return {
      hasError: true,
      errorId: ErrorSanitizer.generateErrorId(),
      lastErrorTime: Date.now()
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const errorSignature = this.generateErrorSignature(error);
    
    // تطبيق آلية التحكم في معدل الأخطاء (Throttling)
    if (this.shouldThrottleError(errorSignature)) {
      console.warn('Error throttled due to high frequency:', errorSignature);
      return;
    }

    // تطهير الخطأ قبل التسجيل
    const sanitizedError = ErrorSanitizer.sanitizeForLogging(error, true);
    
    // إنشاء سياق الخطأ
    const context: ErrorContext = {
      component: this.props.componentName || 'SecureErrorBoundary',
      action: 'componentDidCatch',
      sessionId: this.getSessionId(),
      timestamp: Date.now(),
      metadata: {
        componentStack: errorInfo.componentStack,
        retryCount: this.state.retryCount,
        errorId: this.state.errorId
      }
    };

    // تسجيل الخطأ
    this.logError(sanitizedError, context, errorInfo);

    // استدعاء callback إضافي إذا تم توفيره
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // تحديث عداد التحكم في معدل الأخطاء
    this.updateErrorThrottle(errorSignature);
  }

  private generateErrorSignature(error: Error): string {
    return `${error.name}:${error.message.substring(0, 50)}`;
  }

  private shouldThrottleError(errorSignature: string): boolean {
    const now = Date.now();
    const lastErrorTime = this.errorThrottle.get(errorSignature) || 0;
    
    return (now - lastErrorTime) < this.THROTTLE_WINDOW;
  }

  private updateErrorThrottle(errorSignature: string): void {
    this.errorThrottle.set(errorSignature, Date.now());
    
    // تنظيف الإدخالات القديمة
    const now = Date.now();
    for (const [signature, timestamp] of this.errorThrottle.entries()) {
      if (now - timestamp > this.THROTTLE_WINDOW) {
        this.errorThrottle.delete(signature);
      }
    }
  }

  private logError(sanitizedError: any, context: ErrorContext, errorInfo: ErrorInfo): void {
    if (process.env.NODE_ENV === 'development') {
      console.group(`🔥 خطأ في ${context.component}`);
      console.error('الخطأ:', sanitizedError);
      console.error('معلومات الخطأ:', errorInfo);
      console.table({
        'معرف الخطأ': context.metadata?.errorId,
        'الوقت': new Date(context.timestamp).toLocaleString('ar-SA'),
        'عدد المحاولات': context.metadata?.retryCount,
        'معرف الجلسة': context.sessionId
      });
      console.groupEnd();
    }

    // في الإنتاج، أرسل إلى خدمة المراقبة
    if (process.env.NODE_ENV === 'production') {
      this.sendToMonitoringService({
        error: sanitizedError,
        context,
        severity: ErrorSeverity.HIGH,
        category: ErrorCategory.INFRASTRUCTURE
      });
    }
  }

  private async sendToMonitoringService(errorData: any): Promise<void> {
    try {
      await fetch('/api/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(errorData),
      });
    } catch (monitoringError) {
      console.error('Failed to send error to monitoring service:', monitoringError);
    }
  }

  private getSessionId(): string {
    if (typeof window === 'undefined') return 'server';
    
    let sessionId = sessionStorage.getItem('error-session-id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('error-session-id', sessionId);
    }
    return sessionId;
  }

  private handleRetry = (): void => {
    if (this.state.retryCount < this.MAX_RETRIES) {
      this.setState(prevState => ({
        hasError: false,
        retryCount: prevState.retryCount + 1,
        errorId: '',
        lastErrorTime: 0
      }));
    }
  };

  private handleReload = (): void => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // إذا تم توفير fallback مخصص، استخدمه
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // واجهة الخطأ الافتراضية
      return (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="max-w-md w-full mx-4">
            <div className="bg-card border border-border rounded-lg p-6 shadow-lg">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-destructive/10 rounded-full flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-destructive"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                </div>
                
                <h2 className="text-xl font-semibold text-card-foreground mb-2">
                  حدث خطأ غير متوقع
                </h2>
                
                <p className="text-muted-foreground mb-6">
                  نعتذر عن هذا الإزعاج. يرجى المحاولة مرة أخرى أو إعادة تحميل الصفحة.
                </p>

                <div className="flex flex-col sm:flex-row gap-3">
                  {this.state.retryCount < this.MAX_RETRIES && (
                    <button
                      onClick={this.handleRetry}
                      className="flex-1 bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
                    >
                      المحاولة مرة أخرى ({this.MAX_RETRIES - this.state.retryCount})
                    </button>
                  )}
                  
                  <button
                    onClick={this.handleReload}
                    className="flex-1 bg-secondary text-secondary-foreground px-4 py-2 rounded-md hover:bg-secondary/90 transition-colors"
                  >
                    إعادة تحميل الصفحة
                  </button>
                </div>

                {process.env.NODE_ENV === 'development' && (
                  <details className="mt-4 text-left">
                    <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
                      تفاصيل الخطأ (وضع التطوير)
                    </summary>
                    <div className="mt-2 p-3 bg-muted rounded text-xs font-mono text-muted-foreground">
                      معرف الخطأ: {this.state.errorId}
                      <br />
                      الوقت: {new Date(this.state.lastErrorTime).toLocaleString('ar-SA')}
                    </div>
                  </details>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default SecureErrorBoundary;
