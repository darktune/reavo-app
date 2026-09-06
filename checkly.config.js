import { defineConfig } from 'checkly';

/**
 * Checkly Synthetic Monitoring Configuration
 * Runs cloud synthetic checks against live Vercel deployment every 10-15 minutes.
 */
export default defineConfig({
  projectName: 'REAVO Storefront & Mobile Fortress',
  logicalId: 'reavo-production-monitoring',
  repoUrl: 'https://github.com/darktune/reavo-app',
  checks: {
    activated: true,
    muted: false,
    runtimeId: '2024.09',
    frequency: 10, // Run synthetic checks every 10 minutes from cloud edge nodes
    locations: ['eu-west-1', 'us-east-1', 'af-south-1'],
    tags: ['production', 'critical', 'storefront', 'mobile-viewport'],
    alertChannels: [],
    checkMatch: '**/__checks__/**/*.check.js',
    browserChecks: {
      frequency: 10,
      testMatch: '**/__checks__/**/*.spec.js',
    },
  },
  cli: {
    runLocation: 'eu-west-1',
  },
});
