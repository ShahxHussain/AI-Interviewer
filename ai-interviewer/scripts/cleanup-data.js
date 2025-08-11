#!/usr/bin/env node

/**
 * Data Cleanup Script
 * 
 * This script runs automated data cleanup based on retention policies.
 * It should be scheduled to run periodically (e.g., daily via cron job).
 * 
 * Usage:
 *   node scripts/cleanup-data.js
 *   node scripts/cleanup-data.js --dry-run
 *   node scripts/cleanup-data.js --policy-file ./custom-policy.json
 */

const { DataRetentionService } = require('../src/lib/services/data-retention-service');
const { connectToDatabase } = require('../src/lib/mongodb');

// Default retention policy
const DEFAULT_POLICY = {
  maxAge: 365,        // 1 year
  maxSessions: 100,   // max 100 sessions per user
  archiveAfter: 90,   // archive after 3 months
  deleteAfter: 730,   // delete after 2 years
};

async function main() {
  const args = process.argv.slice(2);
  const isDryRun = args.includes('--dry-run');
  const policyFileIndex = args.indexOf('--policy-file');
  
  let policy = DEFAULT_POLICY;
  
  // Load custom policy if specified
  if (policyFileIndex !== -1 && args[policyFileIndex + 1]) {
    try {
      const fs = require('fs');
      const customPolicy = JSON.parse(fs.readFileSync(args[policyFileIndex + 1], 'utf8'));
      policy = { ...DEFAULT_POLICY, ...customPolicy };
      console.log('Using custom policy:', policy);
    } catch (error) {
      console.error('Failed to load custom policy file:', error.message);
      process.exit(1);
    }
  }

  console.log('Starting data cleanup...');
  console.log('Policy:', policy);
  console.log('Dry run:', isDryRun);
  console.log('Timestamp:', new Date().toISOString());
  console.log('---');

  try {
    // Connect to database
    await connectToDatabase();
    console.log('Connected to database');

    if (isDryRun) {
      console.log('DRY RUN MODE - No actual changes will be made');
      // In a real implementation, we would simulate the cleanup
      console.log('Would run global cleanup with policy:', policy);
    } else {
      // Run the actual cleanup
      const results = await DataRetentionService.runGlobalCleanup(policy);
      
      console.log('Cleanup completed:');
      console.log(`- Users processed: ${results.usersProcessed}`);
      console.log(`- Sessions archived: ${results.totalArchived}`);
      console.log(`- Sessions deleted: ${results.totalDeleted}`);
      
      if (results.errors.length > 0) {
        console.log('\nErrors encountered:');
        results.errors.forEach((error, index) => {
          console.log(`${index + 1}. ${error}`);
        });
      }
    }

    // Get and display archive statistics
    const stats = await DataRetentionService.getArchiveStats();
    console.log('\nCurrent archive statistics:');
    console.log(`- Total sessions: ${stats.totalSessions}`);
    console.log(`- Archived sessions: ${stats.archivedSessions}`);
    console.log(`- Storage used: ${(stats.storageUsed / 1024 / 1024).toFixed(2)} MB`);
    console.log(`- Last cleanup: ${stats.lastCleanup.toISOString()}`);

  } catch (error) {
    console.error('Cleanup failed:', error);
    process.exit(1);
  }

  console.log('\nCleanup script completed successfully');
  process.exit(0);
}

// Handle uncaught errors
process.on('unhandledRejection', (error) => {
  console.error('Unhandled rejection:', error);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
  process.exit(1);
});

// Run the script
if (require.main === module) {
  main();
}

module.exports = { main };