#!/usr/bin/env node

const { execSync } = require('child_process');

try {
  console.log('Checking for duplicate dependencies...');
  const output = execSync('pnpm list --depth=0 --json').toString();
  const packages = JSON.parse(output);
  
  // Process and check for duplicates
  const deps = {};
  packages.forEach(pkg => {
    Object.keys(pkg.dependencies || {}).forEach(dep => {
      if (!deps[dep]) deps[dep] = [];
      deps[dep].push({ name: pkg.name, version: pkg.dependencies[dep] });
    });
  });
  
  // Report duplicates
  let hasDuplicates = false;
  Object.keys(deps).forEach(dep => {
    if (deps[dep].length > 1) {
      hasDuplicates = true;
      console.log(`Duplicate dependency: ${dep}`);
      deps[dep].forEach(usage => {
        console.log(`  - ${usage.name}: ${usage.version}`);
      });
    }
  });
  
  if (hasDuplicates) {
    console.error('Duplicate dependencies found!');
    process.exit(1);
  } else {
    console.log('No duplicate dependencies found.');
  }
} catch (error) {
  console.error('Error checking dependencies:', error.message);
  process.exit(1);
}