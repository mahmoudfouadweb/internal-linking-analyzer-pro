/**
 * @author Mahmoud & Expert System
 * @description Error monitoring dashboard component
 * @created 2025-07-11
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ErrorManager } from '@/core/error-management/ErrorManager';
import { CircuitBreakerManager } from '@/core/resilience/CircuitBreaker';
import { PerformanceMonitor } from '@/core/monitoring/PerformanceMonitor';
import { ErrorEvent, ErrorSeverity, CircuitState } from '@/core/error-management/types';

interface DashboardStats {
  totalErrors: number;
  errorsByseverity: Record<ErrorSeverity, number>;
  recentErrors: ErrorEvent[];
  circuitBreakerStats: Record<string, any>;
  performanceMetrics: Record<string, any>;
  queueStats: any;
}

export function ErrorDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalErrors: 0,
    errorsByseverity: {
      [ErrorSeverity.LOW]: 0,
      [ErrorSeverity.MEDIUM]: 0,
      [ErrorSeverity.HIGH]: 0,
      [ErrorSeverity.CRITICAL]: 0
    },
    recentErrors: [],
    circuitBreakerStats: {},
    performanceMetrics: {},
    queueStats: {}
  });

  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const updateStats = async () => {
      try {
        const errorManager = ErrorManager.getInstance();
        const circuitBreakerManager = CircuitBreakerManager.getInstance();
        const performanceMonitor = PerformanceMonitor.getInstance();

        const recentErrors = await errorManager.getRecentErrors(20);
        const errorsByComponent = await Promise.all([
          errorManager.getErrorsBySeverity(ErrorSeverity.LOW),
          errorManager.getErrorsBySeverity(ErrorSeverity.MEDIUM),
          errorManager.getErrorsBySeverity(ErrorSeverity.HIGH),
          errorManager.getErrorsBySeverity(ErrorSeverity.CRITICAL)
        ]);

        const newStats: DashboardStats = {
          totalErrors: recentErrors.length,
          errorsBySeverity: {
            [ErrorSeverity.LOW]: errorsByComponent[0].length,
            [ErrorSeverity.MEDIUM]: errorsByComponent[1].length,
            [ErrorSeverity.HIGH]: errorsByComponent[2].length,
            [ErrorSeverity.CRITICAL]: errorsByComponent[3].length
          },
          recentErrors,
          circuitBreakerStats: circuitBreakerManager.getAllStats(),
          performanceMetrics: performanceMonitor.getAllMetrics(),
          queueStats: errorManager.getStats()
        };

        setStats(newStats);
      } catch (error) {
        console.error('Failed to update dashboard stats:', error);
      }
    };

    if (isVisible) {
      updateStats();
      const interval = setInterval(updateStats, 5000); // تحديث كل 5 ثوان
      return () => clearInterval(interval);
    }
  }, [isVisible]);

  const getSeverityColor = (severity: ErrorSeverity): string => {
    const colors = {
      [ErrorSeverity.LOW]: 'bg-green-100 text-green-800',
      [ErrorSeverity.MEDIUM]: 'bg-yellow-100 text-yellow-800',
      [ErrorSeverity.HIGH]: 'bg-orange-100 text-orange-800',
      [ErrorSeverity.CRITICAL]: 'bg-red-100 text-red-800'
    };
    return colors[severity];
  };

  const getCircuitStateColor = (state: CircuitState): string => {
    const colors = {
      [CircuitState.CLOSED]: 'bg-green-100 text-green-800',
      [CircuitState.HALF_OPEN]: 'bg-yellow-100 text-yellow-800',
      [CircuitState.OPEN]: 'bg-red-100 text-red-800'
    };
    return colors[state];
  };

  const formatDuration = (ms: number): string => {
    if (ms < 1000) return `${ms.toFixed(0)}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  };

  const formatTimestamp = (timestamp: number): string => {
    return new Date(timestamp).toLocaleString('ar-SA', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsVisible(true)}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-lg shadow-lg hover:bg-primary/90 transition-colors"
        >
          📊 لوحة المراقبة
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-background rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">لوحة مراقبة الأخطاء والأداء</h2>
            <button
              onClick={() => setIsVisible(false)}
              className="text-muted-foreground hover:text-foreground"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* إحصائيات الأخطاء */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">إجمالي الأخطاء</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalErrors}</div>
              </CardContent>
            </Card>

            {/* الأخطاء حسب الشدة */}
            {Object.entries(stats.errorsByseverity).map(([severity, count]) => (
              <Card key={severity}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">
                    <Badge className={getSeverityColor(severity as ErrorSeverity)}>
                      {severity}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{count}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* الأخطاء الحديثة */}
            <Card>
              <CardHeader>
                <CardTitle>الأخطاء الحديثة</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {stats.recentErrors.slice(0, 10).map((error) => (
                    <div key={error.id} className="flex items-center justify-between p-2 bg-muted rounded">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">
                          {error.context.component}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          {error.error.message}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-2">
                        <Badge className={getSeverityColor(error.severity)}>
                          {error.severity}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatTimestamp(error.context.timestamp)}
                        </span>
                      </div>
                    </div>
                  ))}
                  {stats.recentErrors.length === 0 && (
                    <div className="text-center text-muted-foreground py-4">
                      لا توجد أخطاء حديثة
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Circuit Breakers */}
            <Card>
              <CardHeader>
                <CardTitle>حالة Circuit Breakers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {Object.entries(stats.circuitBreakerStats).map(([service, cbStats]: [string, any]) => (
                    <div key={service} className="flex items-center justify-between p-2 bg-muted rounded">
                      <div className="flex-1">
                        <div className="text-sm font-medium">{service}</div>
                        <div className="text-xs text-muted-foreground">
                          نجح: {cbStats.successCount} | فشل: {cbStats.failureCount}
                        </div>
                      </div>
                      <Badge className={getCircuitStateColor(cbStats.state)}>
                        {cbStats.state}
                      </Badge>
                    </div>
                  ))}
                  {Object.keys(stats.circuitBreakerStats).length === 0 && (
                    <div className="text-center text-muted-foreground py-4">
                      لا توجد circuit breakers نشطة
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* مقاييس الأداء */}
            <Card>
              <CardHeader>
                <CardTitle>مقاييس الأداء</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {Object.entries(stats.performanceMetrics).slice(0, 8).map(([operation, metric]: [string, any]) => (
                    <div key={operation} className="flex items-center justify-between p-2 bg-muted rounded">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{operation}</div>
                        <div className="text-xs text-muted-foreground">
                          عدد: {metric.count} | متوسط: {formatDuration(metric.averageDuration)}
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatDuration(metric.maxDuration)}
                      </div>
                    </div>
                  ))}
                  {Object.keys(stats.performanceMetrics).length === 0 && (
                    <div className="text-center text-muted-foreground py-4">
                      لا توجد مقاييس أداء متاحة
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* إحصائيات الطابور */}
            <Card>
              <CardHeader>
                <CardTitle>طابور الأخطاء</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">حجم الطابور:</span>
                    <span className="font-medium">{stats.queueStats.queueSize || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">تم معالجتها:</span>
                    <span className="font-medium">{stats.queueStats.processedCount || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">فشلت:</span>
                    <span className="font-medium">{stats.queueStats.failedCount || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">إعادة المحاولة:</span>
                    <span className="font-medium">{stats.queueStats.retryCount || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">متوسط المعالجة:</span>
                    <span className="font-medium">
                      {formatDuration(stats.queueStats.averageProcessingTime || 0)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ErrorDashboard;
