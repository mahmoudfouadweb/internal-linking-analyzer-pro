/**
 * @author Mahmoud & Expert System
 * @description Tests for SecureErrorBoundary component
 * @created 2025-07-11
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { SecureErrorBoundary } from '../SecureErrorBoundary';

// Mock component that throws an error
const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error with sensitive data: user@example.com, API_KEY=secret123');
  }
  return <div>No error</div>;
};

// Mock sessionStorage
const mockSessionStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
};

Object.defineProperty(window, 'sessionStorage', {
  value: mockSessionStorage,
});

// Mock console methods
const originalConsoleError = console.error;
const originalConsoleGroup = console.group;
const originalConsoleGroupEnd = console.groupEnd;
const originalConsoleTable = console.table;

beforeEach(() => {
  console.error = jest.fn();
  console.group = jest.fn();
  console.groupEnd = jest.fn();
  console.table = jest.fn();
  mockSessionStorage.getItem.mockClear();
  mockSessionStorage.setItem.mockClear();
  mockSessionStorage.removeItem.mockClear();
});

afterEach(() => {
  console.error = originalConsoleError;
  console.group = originalConsoleGroup;
  console.groupEnd = originalConsoleGroupEnd;
  console.table = originalConsoleTable;
});

describe('SecureErrorBoundary', () => {
  it('renders children when there is no error', () => {
    render(
      <SecureErrorBoundary>
        <ThrowError shouldThrow={false} />
      </SecureErrorBoundary>
    );

    expect(screen.getByText('No error')).toBeInTheDocument();
  });

  it('renders error UI when child component throws', () => {
    render(
      <SecureErrorBoundary>
        <ThrowError shouldThrow={true} />
      </SecureErrorBoundary>
    );

    expect(screen.getByText('حدث خطأ غير متوقع')).toBeInTheDocument();
    expect(screen.getByText('نعتذر عن هذا الإزعاج. يرجى المحاولة مرة أخرى أو إعادة تحميل الصفحة.')).toBeInTheDocument();
  });

  it('renders custom fallback when provided', () => {
    const customFallback = <div>Custom error message</div>;
    
    render(
      <SecureErrorBoundary fallback={customFallback}>
        <ThrowError shouldThrow={true} />
      </SecureErrorBoundary>
    );

    expect(screen.getByText('Custom error message')).toBeInTheDocument();
  });

  it('calls onError callback when error occurs', () => {
    const onErrorMock = jest.fn();
    
    render(
      <SecureErrorBoundary onError={onErrorMock}>
        <ThrowError shouldThrow={true} />
      </SecureErrorBoundary>
    );

    expect(onErrorMock).toHaveBeenCalled();
  });

  it('generates session ID and stores it', () => {
    mockSessionStorage.getItem.mockReturnValue(null);
    
    render(
      <SecureErrorBoundary>
        <ThrowError shouldThrow={true} />
      </SecureErrorBoundary>
    );

    expect(mockSessionStorage.setItem).toHaveBeenCalledWith(
      'error-session-id',
      expect.stringMatching(/^session_\d+_[a-z0-9]+$/)
    );
  });

  it('uses existing session ID if available', () => {
    const existingSessionId = 'existing_session_123';
    mockSessionStorage.getItem.mockReturnValue(existingSessionId);
    
    render(
      <SecureErrorBoundary>
        <ThrowError shouldThrow={true} />
      </SecureErrorBoundary>
    );

    expect(mockSessionStorage.setItem).not.toHaveBeenCalled();
  });

  it('logs error in development mode', () => {
    const originalNodeEnv = process.env.NODE_ENV;
    // @ts-ignore - تجاهل خطأ TypeScript للاختبار
    process.env.NODE_ENV = 'development';
    
    render(
      <SecureErrorBoundary>
        <ThrowError shouldThrow={true} />
      </SecureErrorBoundary>
    );

    expect(console.group).toHaveBeenCalled();
    expect(console.error).toHaveBeenCalled();
    expect(console.table).toHaveBeenCalled();
    expect(console.groupEnd).toHaveBeenCalled();
    
    // @ts-ignore - تجاهل خطأ TypeScript للاختبار
    process.env.NODE_ENV = originalNodeEnv;
  });
});
