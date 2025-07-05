// server/cron.js (UPDATED to use connectDB from db.js)
const cron = require('node-cron');
const config = require('./config');
const { fetchJobsFromApi } = require('./services/apiFetcherService');
const { addJobToQueue } = require('./services/redisQueueService');
const importLogService = require('./services/importLogService');
const connectDB = require('./config/db'); // Import the connectDB function

// Connect to MongoDB before scheduling the cron job
// We need to await this to ensure the DB is connected before cron starts
connectDB().then(() => {
    console.log('Cron job MongoDB connection established.');

    // Define the scheduled task - moved inside the .then() block
    const scheduledJobImport = async () => {
        console.log(`Cron job started: Fetching jobs at ${new Date().toISOString()}`);
        for (const url of config.jobApiUrls) {
            console.log(url, "url30"); // This log should now appear!
            let importLog;
            try {
                // Create a new import log entry for each API URL
                importLog = await importLogService.createImportLog(url);
                let fetchedJobs = [];
                try {
                    fetchedJobs = await fetchJobsFromApi(url);
                    // Update total fetched count in the log
                    await importLogService.updateImportLog(importLog._id, { totalFetched: fetchedJobs.length });
                } catch (fetchError) {
                    console.error(`Failed to fetch jobs from ${url}:`, fetchError.message);
                    // Mark the import log as failed if fetching fails for this URL
                    await importLogService.updateImportLog(importLog._id, {
                        status: 'failed',
                        errorMessage: `Failed to fetch jobs: ${fetchError.message}`
                    });
                    continue; // Move to the next URL
                }

                if (fetchedJobs.length > 0) {
                    // Add each fetched job to the Redis queue for processing
                    for (const jobData of fetchedJobs) {
                        await addJobToQueue(jobData, url, importLog._id);
                    }
                    // Update log status to processing. The worker will update counts and mark as 'completed'
                    await importLogService.updateImportLog(importLog._id, { status: 'processing' });
                } else {
                    // If no jobs fetched, mark as completed immediately
                    await importLogService.updateImportLog(importLog._id, { status: 'completed', errorMessage: 'No jobs fetched.' });
                }
            } catch (error) {
                console.error(`Overall error processing URL ${url}:`, error.message);
                if (importLog && importLog._id) {
                    await importLogService.updateImportLog(importLog._id, {
                        status: 'failed',
                        errorMessage: `Overall import error: ${error.message}`
                    });
                }
            }
        }
        console.log('Cron job finished adding jobs to queue.');
    };

    // Schedule the cron job - only schedule AFTER DB connection is confirmed
    cron.schedule(config.cronSchedule, scheduledJobImport, {
        scheduled: true,
        timezone: "Asia/Kolkata" // Set your desired timezone
    });

    console.log(`Cron job scheduled to run with schedule: '${config.cronSchedule}' (Timezone: Asia/Kolkata)`);
    console.log('Cron job process started. Waiting for scheduled runs...');

}).catch(err => {
    console.error('Failed to connect to MongoDB for cron job, exiting:', err.message);
    process.exit(1); // Exit if DB connection fails
});