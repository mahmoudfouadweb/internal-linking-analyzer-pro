#!/usr/bin/env node

const { execSync } = require('child_process');

function checkAndInstallRollupWinModule() {
  try {
    require.resolve('@rollup/rollup-win32-x64-msvc');
    console.log('Rollup Windows module is already installed.');
  } catch (e) {
    console.log('Missing @rollup/rollup-win32-x64-msvc. Installing...');
    execSync('pnpm add -D @rollup/rollup-win32-x64-msvc', { stdio: 'inherit' });
  }
}

function main() {
  checkAndInstallRollupWinModule();
}

main();
