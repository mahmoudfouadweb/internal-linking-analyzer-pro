/**
 * @author Mahmoud & Expert System
 * @description Circuit Breaker pattern implementation for resilient service calls
 * @created 2025-07-11
 */

import { CircuitState } from '../error-management/types';

export interface CircuitBreakerConfig {
  failureThreshold: number;
  recoveryTimeout: number;
  monitoringWindow: number;
  halfOpenMaxCalls: number;
  slowCallThreshold: number;
  slowCallDurationThreshold: number;
}

export interface CircuitBreakerStats {
  state: CircuitState;
  failureCount: number;
  successCount: number;
  totalCalls: number;
  lastFailureTime: number;
  lastSuccessTime: number;
  slowCallCount: number;
}

export class CircuitBreakerOpenError extends Error {
  constructor(serviceName: string) {
    super(`Circuit breaker is open for service: ${serviceName}`);
    this.name = 'CircuitBreakerOpenError';
  }
}

export class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failureCount = 0;
  private successCount = 0;
  private totalCalls = 0;
  private lastFailureTime = 0;
  private lastSuccessTime = 0;
  private slowCallCount = 0;
  private halfOpenCalls = 0;
  private callHistory: { timestamp: number; success: boolean; duration: number }[] = [];

  constructor(
    private readonly serviceName: string,
    private readonly config: CircuitBreakerConfig = {
      failureThreshold: 5,
      recoveryTimeout: 60000, // 1 minute
      monitoringWindow: 120000, // 2 minutes
      halfOpenMaxCalls: 3,
      slowCallThreshold: 5,
      slowCallDurationThreshold: 5000 // 5 seconds
    }
  ) {}

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    this.updateState();
    
    if (this.state === CircuitState.OPEN) {
      throw new CircuitBreakerOpenError(this.serviceName);
    }
    
    if (this.state === CircuitState.HALF_OPEN && this.halfOpenCalls >= this.config.halfOpenMaxCalls) {
      throw new CircuitBreakerOpenError(this.serviceName);
    }

    const startTime = Date.now();
    this.totalCalls++;
    
    if (this.state === CircuitState.HALF_OPEN) {
      this.halfOpenCalls++;
    }

    try {
      const result = await operation();
      const duration = Date.now() - startTime;
      
      this.onSuccess(duration);
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.onFailure(duration);
      throw error;
    }
  }

  private updateState(): void {
    const now = Date.now();
    
    // تنظيف السجل القديم
    this.cleanupHistory(now);
    
    switch (this.state) {
      case CircuitState.CLOSED:
        if (this.shouldOpenCircuit()) {
          this.openCircuit();
        }
        break;
        
      case CircuitState.OPEN:
        if (this.shouldAttemptReset(now)) {
          this.halfOpenCircuit();
        }
        break;
        
      case CircuitState.HALF_OPEN:
        if (this.shouldCloseCircuit()) {
          this.closeCircuit();
        } else if (this.shouldReopenCircuit()) {
          this.openCircuit();
        }
        break;
    }
  }

  private shouldOpenCircuit(): boolean {
    const recentCalls = this.getRecentCalls();
    
    if (recentCalls.length < this.config.failureThreshold) {
      return false;
    }
    
    const failureRate = recentCalls.filter(call => !call.success).length / recentCalls.length;
    const slowCallRate = recentCalls.filter(call => call.duration > this.config.slowCallDurationThreshold).length / recentCalls.length;
    
    return failureRate >= 0.5 || slowCallRate >= 0.5; // 50% failure or slow call rate
  }

  private shouldAttemptReset(now: number): boolean {
    return now - this.lastFailureTime >= this.config.recoveryTimeout;
  }

  private shouldCloseCircuit(): boolean {
    return this.halfOpenCalls >= this.config.halfOpenMaxCalls && 
           this.getRecentSuccessRate() >= 0.8; // 80% success rate
  }

  private shouldReopenCircuit(): boolean {
    return this.getRecentSuccessRate() < 0.5; // Less than 50% success rate
  }

  private openCircuit(): void {
    this.state = CircuitState.OPEN;
    this.lastFailureTime = Date.now();
    this.halfOpenCalls = 0;
    
    console.warn(`🔴 Circuit breaker opened for service: ${this.serviceName}`);
    this.notifyStateChange();
  }

  private halfOpenCircuit(): void {
    this.state = CircuitState.HALF_OPEN;
    this.halfOpenCalls = 0;
    
    console.info(`🟡 Circuit breaker half-open for service: ${this.serviceName}`);
    this.notifyStateChange();
  }

  private closeCircuit(): void {
    this.state = CircuitState.CLOSED;
    this.failureCount = 0;
    this.halfOpenCalls = 0;
    
    console.info(`🟢 Circuit breaker closed for service: ${this.serviceName}`);
    this.notifyStateChange();
  }

  private onSuccess(duration: number): void {
    this.successCount++;
    this.lastSuccessTime = Date.now();
    
    this.recordCall(true, duration);
    
    if (duration > this.config.slowCallDurationThreshold) {
      this.slowCallCount++;
    }
  }

  private onFailure(duration: number): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    
    this.recordCall(false, duration);
  }

  private recordCall(success: boolean, duration: number): void {
    this.callHistory.push({
      timestamp: Date.now(),
      success,
      duration
    });
    
    // الحفاظ على حجم السجل
    if (this.callHistory.length > 100) {
      this.callHistory.shift();
    }
  }

  private cleanupHistory(now: number): void {
    this.callHistory = this.callHistory.filter(
      call => now - call.timestamp <= this.config.monitoringWindow
    );
  }

  private getRecentCalls(): { timestamp: number; success: boolean; duration: number }[] {
    const now = Date.now();
    return this.callHistory.filter(
      call => now - call.timestamp <= this.config.monitoringWindow
    );
  }

  private getRecentSuccessRate(): number {
    const recentCalls = this.getRecentCalls();
    if (recentCalls.length === 0) return 1;
    
    const successfulCalls = recentCalls.filter(call => call.success).length;
    return successfulCalls / recentCalls.length;
  }

  private notifyStateChange(): void {
    // إرسال حدث تغيير الحالة
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('circuitBreakerStateChange', {
        detail: {
          serviceName: this.serviceName,
          state: this.state,
          stats: this.getStats()
        }
      }));
    }
  }

  // Public API
  getStats(): CircuitBreakerStats {
    return {
      state: this.state,
      failureCount: this.failureCount,
      successCount: this.successCount,
      totalCalls: this.totalCalls,
      lastFailureTime: this.lastFailureTime,
      lastSuccessTime: this.lastSuccessTime,
      slowCallCount: this.slowCallCount
    };
  }

  getState(): CircuitState {
    this.updateState();
    return this.state;
  }

  isCallAllowed(): boolean {
    this.updateState();
    
    if (this.state === CircuitState.OPEN) {
      return false;
    }
    
    if (this.state === CircuitState.HALF_OPEN) {
      return this.halfOpenCalls < this.config.halfOpenMaxCalls;
    }
    
    return true;
  }

  reset(): void {
    this.state = CircuitState.CLOSED;
    this.failureCount = 0;
    this.successCount = 0;
    this.totalCalls = 0;
    this.lastFailureTime = 0;
    this.lastSuccessTime = 0;
    this.slowCallCount = 0;
    this.halfOpenCalls = 0;
    this.callHistory = [];
    
    console.info(`🔄 Circuit breaker reset for service: ${this.serviceName}`);
    this.notifyStateChange();
  }
}

// مدير Circuit Breakers
export class CircuitBreakerManager {
  private static instance: CircuitBreakerManager;
  private breakers: Map<string, CircuitBreaker> = new Map();

  static getInstance(): CircuitBreakerManager {
    if (!CircuitBreakerManager.instance) {
      CircuitBreakerManager.instance = new CircuitBreakerManager();
    }
    return CircuitBreakerManager.instance;
  }

  getCircuitBreaker(serviceName: string, config?: Partial<CircuitBreakerConfig>): CircuitBreaker {
    if (!this.breakers.has(serviceName)) {
      const fullConfig: CircuitBreakerConfig = {
        failureThreshold: 5,
        recoveryTimeout: 60000,
        monitoringWindow: 120000,
        halfOpenMaxCalls: 3,
        slowCallThreshold: 5,
        slowCallDurationThreshold: 5000,
        ...config
      };
      
      this.breakers.set(serviceName, new CircuitBreaker(serviceName, fullConfig));
    }
    
    return this.breakers.get(serviceName)!;
  }

  getAllStats(): Record<string, CircuitBreakerStats> {
    const stats: Record<string, CircuitBreakerStats> = {};
    
    this.breakers.forEach((breaker, serviceName) => {
      stats[serviceName] = breaker.getStats();
    });
    
    return stats;
  }

  resetAll(): void {
    this.breakers.forEach(breaker => breaker.reset());
  }

  removeCircuitBreaker(serviceName: string): void {
    this.breakers.delete(serviceName);
  }
}

export default CircuitBreaker;
