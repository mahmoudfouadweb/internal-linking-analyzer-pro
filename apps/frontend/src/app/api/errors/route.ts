/**
 * @author Mahmoud & Expert System
 * @description API endpoint for receiving error reports from frontend
 * @created 2025-07-11
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const errorData = await request.json();
    
    // في بيئة الإنتاج، يمكن إرسال هذه البيانات إلى خدمة مراقبة خارجية
    // مثل Sentry, LogRocket, أو Datadog
    
    console.log('📊 Error Report Received:', {
      timestamp: new Date().toISOString(),
      errorId: errorData.context?.metadata?.errorId,
      component: errorData.context?.component,
      severity: errorData.severity,
      category: errorData.category,
      message: errorData.error?.message,
      sessionId: errorData.context?.sessionId,
      userAgent: errorData.error?.userAgent
    });

    // محاكاة إرسال إلى خدمة مراقبة خارجية
    if (process.env.NODE_ENV === 'production') {
      // await sendToExternalMonitoringService(errorData);
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Error report received successfully',
      errorId: errorData.context?.metadata?.errorId 
    });
    
  } catch (error) {
    console.error('Failed to process error report:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to process error report' 
      },
      { status: 500 }
    );
  }
}

// معالجة batch errors
export async function PUT(request: NextRequest) {
  try {
    const batchData = await request.json();
    const { errors, metadata } = batchData;
    
    console.log('📊 Batch Error Report Received:', {
      timestamp: new Date().toISOString(),
      batchSize: errors?.length || 0,
      sessionId: metadata?.sessionId,
      batchId: metadata?.batchId
    });

    // معالجة كل خطأ في الدفعة
    if (Array.isArray(errors)) {
      errors.forEach((error, index) => {
        console.log(`📊 Batch Error ${index + 1}:`, {
          errorId: error.id,
          message: error.error?.message,
          severity: error.severity,
          category: error.category
        });
      });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Batch error report received successfully',
      processedCount: errors?.length || 0
    });
    
  } catch (error) {
    console.error('Failed to process batch error report:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to process batch error report' 
      },
      { status: 500 }
    );
  }
}

// دالة مساعدة لإرسال البيانات إلى خدمة مراقبة خارجية
async function sendToExternalMonitoringService(errorData: any): Promise<void> {
  // مثال على التكامل مع Sentry
  /*
  if (process.env.SENTRY_DSN) {
    await fetch('https://sentry.io/api/...', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.SENTRY_AUTH_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(errorData)
    });
  }
  */
  
  // مثال على التكامل مع خدمة مراقبة مخصصة
  /*
  if (process.env.MONITORING_SERVICE_URL) {
    await fetch(process.env.MONITORING_SERVICE_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.MONITORING_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(errorData)
    });
  }
  */
}
