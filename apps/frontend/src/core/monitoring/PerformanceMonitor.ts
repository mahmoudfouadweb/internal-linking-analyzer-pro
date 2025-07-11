/**
 * @author Mahmoud & Expert System
 * @description Performance monitoring system for tracking application metrics
 * @created 2025-07-11
 */

export interface PerformanceMetric {
  count: number;
  totalDuration: number;
  minDuration: number;
  maxDuration: number;
  averageDuration: number;
  lastRecorded: number;
}

export interface WebVitalsMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  timestamp: number;
}

export interface ResourceTiming {
  name: string;
  duration: number;
  size: number;
  type: string;
  timestamp: number;
}

export interface PerformanceReport {
  metrics: Record<string, PerformanceMetric>;
  webVitals: WebVitalsMetric[];
  resources: ResourceTiming[];
  memoryUsage?: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  };
  timestamp: number;
}

export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, PerformanceMetric> = new Map();
  private webVitals: WebVitalsMetric[] = [];
  private observers: PerformanceObserver[] = [];
  private reportingInterval: NodeJS.Timeout | null = null;

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  private constructor() {
    this.initializeObservers();
    this.startPeriodicReporting();
  }

  private initializeObservers(): void {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
      return;
    }

    try {
      // مراقبة Navigation Timing
      const navObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.recordNavigationTiming(entry as PerformanceNavigationTiming);
        }
      });
      navObserver.observe({ entryTypes: ['navigation'] });
      this.observers.push(navObserver);

      // مراقبة Resource Timing
      const resourceObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.recordResourceTiming(entry as PerformanceResourceTiming);
        }
      });
      resourceObserver.observe({ entryTypes: ['resource'] });
      this.observers.push(resourceObserver);

      // مراقبة Paint Timing
      const paintObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.recordPaintTiming(entry);
        }
      });
      paintObserver.observe({ entryTypes: ['paint'] });
      this.observers.push(paintObserver);

      // مراقبة Layout Shift
      const layoutShiftObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.recordLayoutShift(entry as any);
        }
      });
      layoutShiftObserver.observe({ entryTypes: ['layout-shift'] });
      this.observers.push(layoutShiftObserver);

    } catch (error) {
      console.warn('Failed to initialize performance observers:', error);
    }
  }

  startTiming(operation: string): string {
    const timingId = `${operation}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    if (typeof performance !== 'undefined' && performance.mark) {
      performance.mark(`${timingId}_start`);
    }
    
    return timingId;
  }

  endTiming(timingId: string): number {
    let duration = 0;
    
    try {
      if (typeof performance !== 'undefined' && performance.mark && performance.measure) {
        performance.mark(`${timingId}_end`);
        performance.measure(timingId, `${timingId}_start`, `${timingId}_end`);
        
        const measure = performance.getEntriesByName(timingId)[0];
        duration = measure.duration;
        
        // تنظيف
        performance.clearMarks(`${timingId}_start`);
        performance.clearMarks(`${timingId}_end`);
        performance.clearMeasures(timingId);
      }
    } catch (error) {
      console.warn('Failed to end timing:', error);
    }
    
    const operation = timingId.split('_')[0];
    this.recordMetric(operation, duration);
    
    return duration;
  }

  recordMetric(operation: string, duration: number): void {
    const existing = this.metrics.get(operation) || {
      count: 0,
      totalDuration: 0,
      minDuration: Infinity,
      maxDuration: 0,
      averageDuration: 0,
      lastRecorded: 0
    };

    existing.count++;
    existing.totalDuration += duration;
    existing.minDuration = Math.min(existing.minDuration, duration);
    existing.maxDuration = Math.max(existing.maxDuration, duration);
    existing.averageDuration = existing.totalDuration / existing.count;
    existing.lastRecorded = Date.now();

    this.metrics.set(operation, existing);
  }

  private recordNavigationTiming(entry: PerformanceNavigationTiming): void {
    const metrics = {
      'dns-lookup': entry.domainLookupEnd - entry.domainLookupStart,
      'tcp-connection': entry.connectEnd - entry.connectStart,
      'tls-negotiation': entry.connectEnd - entry.secureConnectionStart,
      'request-response': entry.responseEnd - entry.requestStart,
      'dom-processing': entry.domContentLoadedEventEnd - entry.responseEnd,
      'load-complete': entry.loadEventEnd - entry.loadEventStart,
      'total-page-load': entry.loadEventEnd - entry.navigationStart
    };

    Object.entries(metrics).forEach(([name, duration]) => {
      if (duration > 0) {
        this.recordMetric(name, duration);
      }
    });
  }

  private recordResourceTiming(entry: PerformanceResourceTiming): void {
    const resourceType = this.getResourceType(entry.name);
    const duration = entry.responseEnd - entry.startTime;
    
    this.recordMetric(`resource-${resourceType}`, duration);
    
    // تسجيل حجم المورد إذا كان متاحاً
    if (entry.transferSize) {
      this.recordMetric(`resource-size-${resourceType}`, entry.transferSize);
    }
  }

  private recordPaintTiming(entry: PerformanceEntry): void {
    this.recordMetric(entry.name, entry.startTime);
    
    // تسجيل Web Vitals
    if (entry.name === 'first-contentful-paint') {
      this.recordWebVital('FCP', entry.startTime);
    }
  }

  private recordLayoutShift(entry: any): void {
    if (!entry.hadRecentInput) {
      this.recordWebVital('CLS', entry.value);
    }
  }

  private recordWebVital(name: string, value: number): void {
    const rating = this.getWebVitalRating(name, value);
    
    this.webVitals.push({
      name,
      value,
      rating,
      timestamp: Date.now()
    });

    // الحفاظ على آخر 100 قياس فقط
    if (this.webVitals.length > 100) {
      this.webVitals.shift();
    }
  }

  private getWebVitalRating(name: string, value: number): 'good' | 'needs-improvement' | 'poor' {
    const thresholds = {
      'FCP': { good: 1800, poor: 3000 },
      'LCP': { good: 2500, poor: 4000 },
      'FID': { good: 100, poor: 300 },
      'CLS': { good: 0.1, poor: 0.25 },
      'TTFB': { good: 800, poor: 1800 }
    };

    const threshold = thresholds[name as keyof typeof thresholds];
    if (!threshold) return 'good';

    if (value <= threshold.good) return 'good';
    if (value <= threshold.poor) return 'needs-improvement';
    return 'poor';
  }

  private getResourceType(url: string): string {
    if (url.includes('.js')) return 'script';
    if (url.includes('.css')) return 'stylesheet';
    if (url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/)) return 'image';
    if (url.match(/\.(woff|woff2|ttf|eot)$/)) return 'font';
    if (url.includes('api/')) return 'api';
    return 'other';
  }

  private startPeriodicReporting(): void {
    if (typeof window === 'undefined') return;

    this.reportingInterval = setInterval(() => {
      this.generateReport();
    }, 60000); // كل دقيقة
  }

  generateReport(): PerformanceReport {
    const report: PerformanceReport = {
      metrics: Object.fromEntries(this.metrics),
      webVitals: [...this.webVitals],
      resources: this.getResourceTimings(),
      timestamp: Date.now()
    };

    // إضافة معلومات الذاكرة إذا كانت متاحة
    if (typeof performance !== 'undefined' && (performance as any).memory) {
      const memory = (performance as any).memory;
      report.memoryUsage = {
        usedJSHeapSize: memory.usedJSHeapSize,
        totalJSHeapSize: memory.totalJSHeapSize,
        jsHeapSizeLimit: memory.jsHeapSizeLimit
      };
    }

    // إرسال التقرير في بيئة الإنتاج
    if (process.env.NODE_ENV === 'production') {
      this.sendReport(report);
    }

    return report;
  }

  private getResourceTimings(): ResourceTiming[] {
    if (typeof performance === 'undefined' || !performance.getEntriesByType) {
      return [];
    }

    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    
    return resources.slice(-50).map(entry => ({
      name: entry.name,
      duration: entry.responseEnd - entry.startTime,
      size: entry.transferSize || 0,
      type: this.getResourceType(entry.name),
      timestamp: entry.startTime
    }));
  }

  private async sendReport(report: PerformanceReport): Promise<void> {
    try {
      await fetch('/api/performance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(report)
      });
    } catch (error) {
      console.warn('Failed to send performance report:', error);
    }
  }

  // Public API methods
  getMetric(operation: string): PerformanceMetric | undefined {
    return this.metrics.get(operation);
  }

  getAllMetrics(): Record<string, PerformanceMetric> {
    return Object.fromEntries(this.metrics);
  }

  getWebVitals(): WebVitalsMetric[] {
    return [...this.webVitals];
  }

  clearMetrics(): void {
    this.metrics.clear();
    this.webVitals = [];
  }

  getTopSlowOperations(limit: number = 10): Array<{ operation: string; metric: PerformanceMetric }> {
    return Array.from(this.metrics.entries())
      .map(([operation, metric]) => ({ operation, metric }))
      .sort((a, b) => b.metric.averageDuration - a.metric.averageDuration)
      .slice(0, limit);
  }

  getMemoryUsage(): any {
    if (typeof performance !== 'undefined' && (performance as any).memory) {
      return (performance as any).memory;
    }
    return null;
  }

  destroy(): void {
    // تنظيف المراقبين
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];

    // إيقاف التقارير الدورية
    if (this.reportingInterval) {
      clearInterval(this.reportingInterval);
      this.reportingInterval = null;
    }

    // تنظيف البيانات
    this.clearMetrics();
  }
}

export default PerformanceMonitor;
