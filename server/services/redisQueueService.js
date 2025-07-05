const { Queue, Worker } = require('bullmq'); // Remove QueueScheduler
const config = require('../config');
const { processJob } = require('./jobProcessorService');
const { updateImportLog, addFailedJobToLog } = require('./importLogService');

// Redis connection options
const connection = {
    host: config.redis.host,
    port: config.redis.port,
    password: config.redis.password,
};

// Initialize the job queue
const jobQueue = new Queue(config.jobQueueName, { connection });
console.log(`Job queue '${config.jobQueueName}' initialized.`);

// Function to add a job to the queue
async function addJobToQueue(jobData, sourceUrl, importLogId) {
    try {
        await jobQueue.add('processJob', { jobData, sourceUrl, importLogId }, {
            attempts: 3,
            backoff: {
                type: 'exponential',
                delay: 1000
            }
        });
    } catch (error) {
        console.error(`Error adding job to queue for ${jobData.externalId}:`, error.message);
    }
}

// Function to start the worker process
function startJobProcessorWorker() {
    const worker = new Worker(config.jobQueueName, async (job) => {
        const { jobData, sourceUrl, importLogId } = job.data;
        console.log(`Processing job ${job.id} for externalId: ${jobData.externalId}`);

        try {
            const result = await processJob(jobData);

            if (result.status === 'new') {
                await updateImportLog(importLogId, { $inc: { newJobs: 1, totalImported: 1 } });
            } else if (result.status === 'updated') {
                await updateImportLog(importLogId, { $inc: { updatedJobs: 1, totalImported: 1 } });
            } else if (result.status === 'failed') {
                await addFailedJobToLog(importLogId, jobData, result.reason);
            }
            return result;
        } catch (error) {
            console.error(`Worker failed to process job ${job.id} for externalId ${jobData.externalId}:`, error.message);
            await addFailedJobToLog(importLogId, jobData, `Worker processing error: ${error.message}`);
            throw error;
        }
    }, { connection, concurrency: config.concurrency });

    worker.on('completed', (job) => {
        console.log(`Job ${job.id} completed successfully.`);
    });

    worker.on('failed', (job, err) => {
        console.error(`Job ${job.id} failed with error: ${err.message}`);
    });

    worker.on('error', (err) => {
        console.error(`Worker error: ${err.message}`);
    });

    console.log(`Worker for queue '${config.jobQueueName}' started with concurrency ${config.concurrency}.`);
    return worker;
}

module.exports = {
    jobQueue,
    addJobToQueue,
    startJobProcessorWorker
};