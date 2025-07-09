#!/usr/bin/env node

/**
 * هذا السكريبت يساعد في تشغيل الأوامر بشكل متوافق بين أنظمة التشغيل المختلفة
 * يستخدم لتشغيل أوامر متعددة بالتوازي في بيئة Windows
 * يعرض مخرجات كل خدمة بلون مختلف لسهولة التمييز
 */

const { spawn } = require('child_process');
const os = require('os');

// ألوان الطرفية
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
  bgBlue: '\x1b[44m',
};

// تحديد الأوامر المراد تنفيذها
const commands = [
  { 
    cmd: 'pnpm', 
    args: ['--filter', 'backend', 'run', 'dev'],
    name: 'BACKEND',
    color: colors.cyan
  },
  { 
    cmd: 'cmd.exe', 
    args: ['/c', 'pnpm', '--filter', 'frontend', 'run', 'dev'],
    name: 'FRONTEND',
    color: colors.green
  }
];

// تخزين العمليات المشغلة
const processes = [];

// طباعة رسالة ترحيبية
console.log(`${colors.bright}${colors.yellow}=== تشغيل خدمات المشروع ====${colors.reset}`);
console.log(`${colors.cyan}[BACKEND]${colors.reset} - خدمة الواجهة الخلفية`);
console.log(`${colors.green}[FRONTEND]${colors.reset} - خدمة الواجهة الأمامية`);
console.log(`${colors.yellow}اضغط CTRL+C لإيقاف جميع الخدمات${colors.reset}\n`);

// دالة لتنفيذ الأمر
function runCommand(command) {
  const { cmd, args, name, color } = command;
  
  // طباعة رسالة بدء التشغيل
  console.log(`${color}[${name}]${colors.reset} جاري بدء التشغيل...`);
  
  // تحديد خيارات العملية
  const options = {
    shell: true,
    stdio: ['inherit', 'pipe', 'pipe']
  };
  
  // إنشاء العملية
  const childProcess = spawn(cmd, args, options);
  processes.push(childProcess);
  
  // معالجة مخرجات العملية
  childProcess.stdout.on('data', (data) => {
    const lines = data.toString().trim().split('\n');
    lines.forEach(line => {
      if (line.trim()) {
        console.log(`${color}[${name}]${colors.reset} ${line}`);
      }
    });
  });
  
  // معالجة أخطاء العملية
  childProcess.stderr.on('data', (data) => {
    const lines = data.toString().trim().split('\n');
    lines.forEach(line => {
      if (line.trim()) {
        console.log(`${color}[${name}]${colors.red} ${line}${colors.reset}`);
      }
    });
  });
  
  // معالجة إنهاء العملية
  childProcess.on('close', (code) => {
    console.log(`${color}[${name}]${colors.reset} انتهت العملية برمز الخروج ${code}`);
    
    // إنهاء جميع العمليات الأخرى عند انتهاء أي عملية بخطأ
    if (code !== 0) {
      console.log(`${colors.red}[SYSTEM] إيقاف جميع العمليات...${colors.reset}`);
      processes.forEach(p => {
        if (p !== childProcess && !p.killed) {
          p.kill();
        }
      });
    }
  });
}

// تشغيل جميع الأوامر
commands.forEach(runCommand);

// معالجة إنهاء البرنامج
process.on('SIGINT', () => {
  console.log(`\n${colors.yellow}[SYSTEM] تم استلام إشارة إيقاف. جاري إيقاف جميع العمليات...${colors.reset}`);
  processes.forEach(p => {
    if (!p.killed) {
      p.kill();
    }
  });
  process.exit(0);
});