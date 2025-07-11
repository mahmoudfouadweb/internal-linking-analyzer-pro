/**
 * @author Mahmoud & Expert System
 * @description Error queue system for batch processing and efficient error handling
 * @created 2025-07-11
 */

import { ErrorEvent, ErrorSeverity } from './types';
import { ErrorSanitizer } from '../security/ErrorSanitizer';

export interface ErrorQueueConfig {
  batchSize: number;
  flushInterval: number;
  maxRetries: number;
  retryDelay: number;
  maxQueueSize: number;
  priorityThreshold: ErrorSeverity;
}

export interface QueueStats {
  queueSize: number;
  processedCount: number;
  failedCount: number;
  retryCount: number;
  lastFlushTime: number;
  averageProcessingTime: number;
}

interface QueuedError {
  error: ErrorEvent;
  retryCount: number;
  lastAttempt: number;
  priority: number;
}

export class ErrorQueue {
  private queue: QueuedError[] = [];
  private processing = false;
  private flushTimer: NodeJS.Timeout | null = null;
  private stats: QueueStats = {
    queueSize: 0,
    processedCount: 0,
    failedCount: 0,
    retryCount: 0,
    lastFlushTime: 0,
    averageProcessingTime: 0
  };
  private processingTimes: number[] = [];

  constructor(
    private readonly config: ErrorQueueConfig = {
      batchSize: 10,
      flushInterval: 5000, // 5 seconds
      maxRetries: 3,
      retryDelay: 1000, // 1 second
      maxQueueSize: 1000,
      priorityThreshold: ErrorSeverity.HIGH
    }
  ) {
    this.startPeriodicFlush();
  }

  enqueue(error: ErrorEvent): boolean {
    // تحقق من حجم الطابور
    if (this.queue.length >= this.config.maxQueueSize) {
      console.warn('Error queue is full, dropping oldest errors');
      this.dropOldestErrors();
    }

    const priority = this.calculatePriority(error);
    const queuedError: QueuedError = {
      error,
      retryCount: 0,
      lastAttempt: 0,
      priority
    };

    // إدراج مع الحفاظ على الأولوية
    this.insertByPriority(queuedError);
    this.stats.queueSize = this.queue.length;

    // معالجة فورية للأخطاء عالية الأولوية
    if (priority >= this.getPriorityValue(this.config.priorityThreshold)) {
      this.flush();
    } else if (this.queue.length >= this.config.batchSize) {
      this.flush();
    }

    return true;
  }

  private calculatePriority(error: ErrorEvent): number {
    let priority = this.getPriorityValue(error.severity);
    
    // زيادة الأولوية للأخطاء الأمنية
    if (error.category === 'security') {
      priority += 10;
    }
    
    // زيادة الأولوية للأخطاء المتكررة
    const similarErrors = this.queue.filter(q => 
      q.error.error.name === error.error.name &&
      q.error.context.component === error.context.component
    );
    
    if (similarErrors.length > 2) {
      priority += 5;
    }

    return priority;
  }

  private getPriorityValue(severity: ErrorSeverity): number {
    const priorities = {
      [ErrorSeverity.LOW]: 1,
      [ErrorSeverity.MEDIUM]: 5,
      [ErrorSeverity.HIGH]: 10,
      [ErrorSeverity.CRITICAL]: 20
    };
    return priorities[severity] || 1;
  }

  private insertByPriority(queuedError: QueuedError): void {
    let insertIndex = this.queue.length;
    
    for (let i = 0; i < this.queue.length; i++) {
      if (queuedError.priority > this.queue[i].priority) {
        insertIndex = i;
        break;
      }
    }
    
    this.queue.splice(insertIndex, 0, queuedError);
  }

  private dropOldestErrors(): void {
    // إزالة الأخطاء الأقل أولوية والأقدم
    const lowPriorityErrors = this.queue
      .filter(q => q.priority < this.getPriorityValue(ErrorSeverity.HIGH))
      .sort((a, b) => a.error.context.timestamp - b.error.context.timestamp);
    
    if (lowPriorityErrors.length > 0) {
      const toRemove = lowPriorityErrors.slice(0, Math.ceil(this.config.maxQueueSize * 0.1));
      toRemove.forEach(error => {
        const index = this.queue.indexOf(error);
        if (index > -1) {
          this.queue.splice(index, 1);
        }
      });
    }
  }

  private startPeriodicFlush(): void {
    if (typeof window === 'undefined') return;
    
    this.flushTimer = setInterval(() => {
      if (this.queue.length > 0) {
        this.flush();
      }
    }, this.config.flushInterval);
  }

  async flush(): Promise<void> {
    if (this.processing || this.queue.length === 0) return;

    this.processing = true;
    const startTime = Date.now();
    
    try {
      const batch = this.getBatch();
      await this.processBatch(batch);
      
      const processingTime = Date.now() - startTime;
      this.updateProcessingStats(processingTime);
      this.stats.lastFlushTime = Date.now();
      
    } catch (error) {
      console.error('Failed to flush error queue:', error);
      this.stats.failedCount++;
    } finally {
      this.processing = false;
      this.stats.queueSize = this.queue.length;
    }
  }

  private getBatch(): QueuedError[] {
    const now = Date.now();
    const batch: QueuedError[] = [];
    
    // اختيار الأخطاء للمعالجة
    for (let i = 0; i < this.queue.length && batch.length < this.config.batchSize; i++) {
      const queuedError = this.queue[i];
      
      // تحقق من إمكانية إعادة المحاولة
      if (queuedError.retryCount === 0 || 
          now - queuedError.lastAttempt >= this.getRetryDelay(queuedError.retryCount)) {
        batch.push(queuedError);
      }
    }
    
    return batch;
  }

  private getRetryDelay(retryCount: number): number {
    // Exponential backoff
    return this.config.retryDelay * Math.pow(2, retryCount - 1);
  }

  private async processBatch(batch: QueuedError[]): Promise<void> {
    const results = await Promise.allSettled(
      batch.map(queuedError => this.processError(queuedError))
    );

    // معالجة النتائج
    results.forEach((result, index) => {
      const queuedError = batch[index];
      const queueIndex = this.queue.indexOf(queuedError);
      
      if (result.status === 'fulfilled') {
        // نجحت المعالجة - إزالة من الطابور
        if (queueIndex > -1) {
          this.queue.splice(queueIndex, 1);
        }
        this.stats.processedCount++;
      } else {
        // فشلت المعالجة - إعادة جدولة أو إزالة
        queuedError.retryCount++;
        queuedError.lastAttempt = Date.now();
        this.stats.retryCount++;
        
        if (queuedError.retryCount >= this.config.maxRetries) {
          // تجاوز الحد الأقصى للمحاولات - إزالة
          if (queueIndex > -1) {
            this.queue.splice(queueIndex, 1);
          }
          this.stats.failedCount++;
          console.error('Error dropped after max retries:', queuedError.error.id);
        }
      }
    });
  }

  private async processError(queuedError: QueuedError): Promise<void> {
    const { error } = queuedError;
    
    try {
      // إرسال للخادم
      const response = await fetch('/api/errors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...error,
          queueMetadata: {
            retryCount: queuedError.retryCount,
            priority: queuedError.priority,
            queueTime: Date.now() - error.context.timestamp
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
      }

      // معالجة إضافية حسب نوع الخطأ
      await this.handleSpecialCases(error);
      
    } catch (processingError) {
      console.error('Failed to process error:', processingError);
      throw processingError;
    }
  }

  private async handleSpecialCases(error: ErrorEvent): Promise<void> {
    // معالجة خاصة للأخطاء الحرجة
    if (error.severity === ErrorSeverity.CRITICAL) {
      // إرسال إشعار فوري
      await this.sendCriticalAlert(error);
    }
    
    // معالجة خاصة للأخطاء الأمنية
    if (error.category === 'security') {
      await this.handleSecurityError(error);
    }
  }

  private async sendCriticalAlert(error: ErrorEvent): Promise<void> {
    try {
      await fetch('/api/alerts/critical', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          errorId: error.id,
          message: error.error.message,
          component: error.context.component,
          timestamp: error.context.timestamp
        })
      });
    } catch (alertError) {
      console.error('Failed to send critical alert:', alertError);
    }
  }

  private async handleSecurityError(error: ErrorEvent): Promise<void> {
    try {
      await fetch('/api/security/incident', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          errorId: error.id,
          sanitizedError: ErrorSanitizer.sanitize(new Error(error.error.message)),
          context: error.context,
          timestamp: error.context.timestamp
        })
      });
    } catch (securityError) {
      console.error('Failed to report security incident:', securityError);
    }
  }

  private updateProcessingStats(processingTime: number): void {
    this.processingTimes.push(processingTime);
    
    // الحفاظ على آخر 100 قياس
    if (this.processingTimes.length > 100) {
      this.processingTimes.shift();
    }
    
    // حساب المتوسط
    this.stats.averageProcessingTime = 
      this.processingTimes.reduce((sum, time) => sum + time, 0) / this.processingTimes.length;
  }

  // Public API methods
  getStats(): QueueStats {
    return { ...this.stats, queueSize: this.queue.length };
  }

  getQueueSnapshot(): Array<{ id: string; severity: ErrorSeverity; retryCount: number; priority: number }> {
    return this.queue.map(q => ({
      id: q.error.id,
      severity: q.error.severity,
      retryCount: q.retryCount,
      priority: q.priority
    }));
  }

  clear(): void {
    this.queue = [];
    this.stats.queueSize = 0;
  }

  pause(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
  }

  resume(): void {
    if (!this.flushTimer) {
      this.startPeriodicFlush();
    }
  }

  destroy(): void {
    this.pause();
    this.clear();
    this.processingTimes = [];
  }
}

export default ErrorQueue;
