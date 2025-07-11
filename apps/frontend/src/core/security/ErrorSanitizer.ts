/**
 * @author Mahmoud & Expert System
 * @description Secure error sanitization to prevent information leakage
 * @created 2025-07-11
 */

import { SanitizedError } from '../error-management/types';

export class ErrorSanitizer {
  private static readonly SENSITIVE_PATTERNS = [
    // Email addresses
    /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
    // Credit card numbers
    /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g,
    // IP addresses
    /\b(?:\d{1,3}\.){3}\d{1,3}\b/g,
    // JWT tokens and Bearer tokens
    /Bearer\s+[A-Za-z0-9\-._~+/]+=*/g,
    // API keys (common patterns)
    /[Aa][Pp][Ii][_-]?[Kk][Ee][Yy]\s*[:=]\s*[A-Za-z0-9\-._~+/]{20,}/g,
    // Database connection strings
    /(?:mongodb|mysql|postgresql|redis):\/\/[^\s]+/g,
    // File paths (Windows and Unix)
    /[A-Za-z]:\\(?:[^\\/:*?"<>|\r\n]+\\)*[^\\/:*?"<>|\r\n]*/g,
    /\/(?:[^\/\s]+\/)*[^\/\s]+/g,
    // Phone numbers
    /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g,
    // Social security numbers
    /\b\d{3}-\d{2}-\d{4}\b/g,
    // URLs with sensitive parameters
    /[?&](password|token|key|secret|auth)=[^&\s]+/gi,
  ];

  private static readonly SAFE_ERROR_MESSAGES = {
    'Network Error': 'حدث خطأ في الاتصال بالشبكة',
    'Timeout': 'انتهت مهلة الاتصال',
    'Unauthorized': 'غير مصرح لك بالوصول',
    'Forbidden': 'الوصول محظور',
    'Not Found': 'المورد غير موجود',
    'Internal Server Error': 'خطأ داخلي في الخادم',
    'Bad Request': 'طلب غير صحيح',
    'Service Unavailable': 'الخدمة غير متاحة حالياً'
  };

  static sanitize(error: Error): SanitizedError {
    let sanitizedMessage = error.message;
    let sanitizedStack = error.stack;
    
    // تطبيق أنماط التطهير
    this.SENSITIVE_PATTERNS.forEach(pattern => {
      sanitizedMessage = sanitizedMessage.replace(pattern, '[REDACTED]');
      if (sanitizedStack) {
        sanitizedStack = sanitizedStack.replace(pattern, '[REDACTED]');
      }
    });

    // استبدال رسائل الخطأ التقنية برسائل آمنة ومفهومة
    const safeMessage = this.getSafeErrorMessage(sanitizedMessage);

    return {
      message: safeMessage,
      stack: process.env.NODE_ENV === 'development' ? sanitizedStack : undefined,
      name: error.name,
      timestamp: Date.now(),
      userAgent: typeof navigator !== 'undefined' ? 
        navigator.userAgent.split(' ')[0] : undefined, // Minimal fingerprinting
    };
  }

  private static getSafeErrorMessage(originalMessage: string): string {
    // البحث عن رسائل خطأ معروفة وآمنة
    for (const [pattern, safeMessage] of Object.entries(this.SAFE_ERROR_MESSAGES)) {
      if (originalMessage.toLowerCase().includes(pattern.toLowerCase())) {
        return safeMessage;
      }
    }

    // إذا لم نجد رسالة آمنة، نعطي رسالة عامة
    if (originalMessage.length > 100) {
      return 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.';
    }

    return originalMessage;
  }

  static sanitizeForLogging(error: Error, includeStack = false): SanitizedError {
    const sanitized = this.sanitize(error);
    
    return {
      ...sanitized,
      message: error.message, // Keep original message for logging
      stack: includeStack ? sanitized.stack : undefined,
    };
  }

  static generateErrorId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
