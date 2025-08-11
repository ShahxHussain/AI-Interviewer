# Data Retention and Management

This document describes the data retention and management features of the AI Interviewer application.

## Overview

The AI Interviewer application includes comprehensive data retention and management capabilities to help users manage their interview data, comply with data retention policies, and optimize storage usage.

## Features

### 1. Automated Data Cleanup

The system automatically applies retention policies to manage data lifecycle:

- **Archive Policy**: Sessions older than 90 days are automatically archived
- **Deletion Policy**: Sessions older than 2 years are permanently deleted
- **Session Limits**: Users are limited to 100 active sessions maximum
- **Storage Optimization**: Automatic cleanup helps maintain optimal storage usage

### 2. Data Export

Users can export their interview data in multiple formats:

- **JSON Format**: Complete structured data export
- **CSV Format**: Tabular data suitable for spreadsheet analysis
- **PDF Reports**: Human-readable reports for each session

Export options include:
- Date range filtering
- Selective data inclusion (metrics, responses, feedback)
- Bulk export of all sessions or specific sessions

### 3. Session History and Analytics

- **Comprehensive History**: View all past interview sessions with filtering and search
- **Performance Analytics**: Track progress over time with detailed metrics
- **Session Replay**: Review past interviews with original questions and responses
- **Trend Analysis**: Identify improvement patterns and areas for focus

### 4. Storage Management

- **Storage Statistics**: Monitor data usage and session counts
- **Archive Management**: View and manage archived sessions
- **Cleanup Controls**: Manual cleanup options with customizable policies

## API Endpoints

### Session Management

- `GET /api/sessions` - Get filtered user sessions with pagination
- `GET /api/sessions/analytics` - Get user performance analytics
- `GET /api/sessions/[id]` - Get specific session for replay
- `DELETE /api/sessions/[id]` - Delete a specific session
- `GET /api/sessions/export` - Export sessions in various formats

### Data Retention

- `GET /api/data-retention/cleanup` - Get storage statistics
- `POST /api/data-retention/cleanup` - Run manual cleanup
- `POST /api/data-retention/export` - Export user data
- `GET /api/data-retention/archive` - Get archive statistics
- `POST /api/data-retention/archive` - Manage archived sessions

## Automated Cleanup

### Setup

1. **Install Dependencies**: Ensure all npm dependencies are installed
2. **Configure Environment**: Set up MongoDB connection and environment variables
3. **Test Script**: Run a dry-run to test the cleanup script

```bash
npm run cleanup:dry-run
```

### Cron Job Setup

Add the following to your crontab for automated cleanup:

```bash
# Daily cleanup at 2:00 AM
0 2 * * * cd /path/to/ai-interviewer && npm run cleanup >> logs/cleanup.log 2>&1

# Weekly thorough cleanup on Sundays at 3:00 AM
0 3 * * 0 cd /path/to/ai-interviewer && npm run cleanup:weekly >> logs/weekly-cleanup.log 2>&1
```

### Manual Cleanup

Run cleanup manually using npm scripts:

```bash
# Standard cleanup
npm run cleanup

# Dry run (no actual changes)
npm run cleanup:dry-run

# Weekly cleanup with custom policy
npm run cleanup:weekly
```

## Retention Policies

### Default Policy

```json
{
  "maxAge": 365,        // Maximum age in days (1 year)
  "maxSessions": 100,   // Maximum sessions per user
  "archiveAfter": 90,   // Archive after 90 days
  "deleteAfter": 730    // Delete after 2 years
}
```

### Custom Policies

Create custom retention policies by modifying the policy JSON files in the `scripts/` directory.

## Data Export Options

### Export Formats

1. **JSON**: Complete structured data
   - Includes all session data, metrics, and metadata
   - Suitable for data analysis and backup

2. **CSV**: Tabular format
   - Session summary with key metrics
   - Compatible with Excel and other spreadsheet tools

3. **PDF**: Human-readable reports
   - Formatted reports for each session
   - Includes feedback and performance summaries

### Export Configuration

```javascript
const exportOptions = {
  format: 'json',           // 'json', 'csv', or 'pdf'
  includeMetrics: true,     // Include performance metrics
  includeResponses: true,   // Include interview responses
  includeFeedback: true,    // Include feedback and scores
  dateRange: {              // Optional date filtering
    from: '2024-01-01',
    to: '2024-12-31'
  }
};
```

## Storage Optimization

### Monitoring

The system provides detailed storage statistics:

- Total number of sessions
- Active vs. archived session counts
- Storage usage in bytes/MB
- Date range of stored data

### Optimization Strategies

1. **Regular Cleanup**: Schedule automated cleanup to maintain optimal storage
2. **Archive Management**: Review and manage archived sessions periodically
3. **Export and Delete**: Export important data before deletion
4. **Policy Tuning**: Adjust retention policies based on usage patterns

## Security and Privacy

### Data Protection

- All data operations require user authentication
- Users can only access their own data
- Secure deletion ensures data cannot be recovered
- Export operations are logged for audit purposes

### Compliance

The retention system supports compliance with data protection regulations:

- **Right to Export**: Users can export all their data
- **Right to Delete**: Users can delete their data
- **Data Minimization**: Automatic cleanup reduces data footprint
- **Audit Trail**: All operations are logged

## Troubleshooting

### Common Issues

1. **Cleanup Script Fails**
   - Check database connection
   - Verify environment variables
   - Review error logs

2. **Export Fails**
   - Check available disk space
   - Verify user permissions
   - Review date range parameters

3. **High Storage Usage**
   - Run manual cleanup
   - Review retention policies
   - Check for stuck sessions

### Monitoring

Monitor the system using:

- Application logs in `logs/` directory
- Database query performance
- Storage usage statistics
- Cleanup operation results

## Best Practices

1. **Regular Monitoring**: Check storage statistics weekly
2. **Backup Before Cleanup**: Export important data before running cleanup
3. **Test Policies**: Use dry-run mode to test retention policies
4. **Monitor Logs**: Review cleanup logs for errors or issues
5. **User Communication**: Notify users about data retention policies

## Future Enhancements

Planned improvements include:

- Advanced analytics and reporting
- Configurable user-specific retention policies
- Integration with cloud storage services
- Enhanced audit logging and compliance reporting
- Automated backup and disaster recovery