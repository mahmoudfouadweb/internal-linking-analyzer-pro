/**
 * @author Mahmoud & Expert System
 * @description Test component for simulating errors to verify error boundary functionality
 * @created 2025-07-11
 */

'use client';

import React, { useState } from 'react';

interface ErrorTestComponentProps {
  onError?: () => void;
}

export function ErrorTestComponent({ onError }: ErrorTestComponentProps) {
  const [shouldThrowError, setShouldThrowError] = useState(false);
  const [errorType, setErrorType] = useState<'render' | 'async' | 'chunk'>('render');

  const simulateRenderError = () => {
    setShouldThrowError(true);
  };

  const simulateAsyncError = async () => {
    try {
      // محاكاة خطأ غير متزامن
      await new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error('Simulated async error with sensitive data: user@example.com, API_KEY=abc123'));
        }, 1000);
      });
    } catch (error) {
      console.error('Async error caught:', error);
      if (onError) onError();
    }
  };

  const simulateChunkError = () => {
    // محاكاة خطأ تحميل chunk
    const error = new Error('Loading chunk 123 failed. (timeout: http://localhost:3000/_next/static/chunks/app/test.js)');
    window.dispatchEvent(new ErrorEvent('error', {
      error,
      message: error.message,
      filename: 'chunk-loader.js',
      lineno: 1,
      colno: 1
    }));
  };

  const simulateNetworkError = async () => {
    try {
      // محاكاة خطأ شبكة
      await fetch('http://nonexistent-domain-12345.com/api/test');
    } catch (error) {
      console.error('Network error:', error);
      if (onError) onError();
    }
  };

  if (shouldThrowError) {
    // هذا سيؤدي إلى تفعيل Error Boundary
    throw new Error('Simulated render error with sensitive info: password=secret123, token=jwt_abc123');
  }

  return (
    <div className="p-6 bg-card border border-border rounded-lg">
      <h3 className="text-lg font-semibold mb-4">اختبار معالجة الأخطاء</h3>
      <p className="text-muted-foreground mb-4">
        استخدم الأزرار التالية لمحاكاة أنواع مختلفة من الأخطاء واختبار نظام معالجة الأخطاء:
      </p>
      
      <div className="space-y-3">
        <button
          onClick={simulateRenderError}
          className="w-full bg-destructive text-destructive-foreground px-4 py-2 rounded-md hover:bg-destructive/90 transition-colors"
        >
          محاكاة خطأ في الرندر (Error Boundary)
        </button>
        
        <button
          onClick={simulateAsyncError}
          className="w-full bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 transition-colors"
        >
          محاكاة خطأ غير متزامن
        </button>
        
        <button
          onClick={simulateChunkError}
          className="w-full bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600 transition-colors"
        >
          محاكاة خطأ تحميل Chunk
        </button>
        
        <button
          onClick={simulateNetworkError}
          className="w-full bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
        >
          محاكاة خطأ شبكة
        </button>
      </div>

      <div className="mt-4 p-3 bg-muted rounded text-sm">
        <strong>ملاحظة:</strong> افتح Developer Tools (F12) لمراقبة السجلات والتأكد من عمل تطهير الأخطاء بشكل صحيح.
      </div>
    </div>
  );
}

export default ErrorTestComponent;
