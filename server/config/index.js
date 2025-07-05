require('dotenv').config();

module.exports = {
    redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
        password: process.env.REDIS_PASSWORD
    },
    jobQueueName: 'jobImportQueue',
    cronSchedule: process.env.CRON_SCHEDULE || '0 * * * *', // Every hour
    concurrency: parseInt(process.env.WORKER_CONCURRENCY || '5', 10), // Number of jobs processed concurrently by worker
    // External Job API URLs
    jobApiUrls: [
        'https://jobicy.com/?feed=job_feed',
        'https://jobicy.com/?feed=job_feed&job_categories=smm&job_types=full-time',
        'https://jobicy.com/?feed=job_feed&job_categories=seller&job_types=full-time&search_region=france',
        'https://jobicy.com/?feed=job_feed&job_categories=design-multimedia',
        'https://jobicy.com/?feed=job_feed&job_categories=data-science',
        'https://jobicy.com/?feed=job_feed&job_categories=copywriting',
        'https://jobicy.com/?feed=job_feed&job_categories=business',
        'https://jobicy.com/?feed=job_feed&job_categories=management',
        'https://www.higheredjobs.com/rss/articleFeed.cfm',
    ],
};