#!/usr/bin/env node

/**
 * Simple deployment test script
 * Tests that the production build works correctly
 */

import { spawn } from 'child_process';
import { setTimeout } from 'timers/promises';
import http from 'http';

console.log('🚀 Testing deployment build...');

// Test 1: Build the application
console.log('📦 Building application...');
const buildProcess = spawn('npm', ['run', 'build'], { stdio: 'inherit' });

buildProcess.on('close', async (code) => {
  if (code !== 0) {
    console.error('❌ Build failed');
    process.exit(1);
  }
  
  console.log('✅ Build successful');
  
  // Test 2: Start the server
  console.log('🌐 Starting production server...');
  const serverProcess = spawn('node', ['dist/index.js'], {
    env: { ...process.env, NODE_ENV: 'production' },
    stdio: 'pipe'
  });
  
  // Wait for server to start
  await setTimeout(3000);
  
  // Test 3: Check if server responds
  console.log('🔍 Testing server response...');
  
  const req = http.request({
    hostname: 'localhost',
    port: 5000,
    path: '/',
    method: 'GET'
  }, (res) => {
    if (res.statusCode === 200) {
      console.log('✅ Server responding correctly (HTTP 200)');
      console.log('🎉 Deployment test passed!');
    } else {
      console.error(`❌ Server returned HTTP ${res.statusCode}`);
    }
    
    serverProcess.kill();
    process.exit(res.statusCode === 200 ? 0 : 1);
  });
  
  req.on('error', (err) => {
    console.error('❌ Server connection failed:', err.message);
    serverProcess.kill();
    process.exit(1);
  });
  
  req.end();
  
  // Timeout after 10 seconds
  setTimeout(10000).then(() => {
    console.error('❌ Test timeout');
    serverProcess.kill();
    process.exit(1);
  });
});