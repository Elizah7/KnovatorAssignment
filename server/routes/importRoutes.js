const express = require('express');
const router = express.Router();
const importLogService = require('../services/importLogService');
const { addJobToQueue } = require('../services/redisQueueService');
const { fetchJobsFromApi } = require('../services/apiFetcherService');
const config = require('../config');

// GET /api/imports - Get all import history logs
router.get('/', async (req, res) => {
    try {
        const logs = await importLogService.getImportLogs();
        res.send({message:"All logs",logs});
    } catch (error) {
        console.error('Error in GET /api/imports:', error.message);
        res.status(500).json({ message: 'Failed to retrieve import logs', error: error.message });
    }
});

// POST /api/imports/trigger - Manually trigger an import run (optional)
// This endpoint can be used for testing or ad-hoc imports.
router.post('/trigger', async (req, res) => {
    console.log('Manual import trigger initiated.');
    try {
        for (const url of config.jobApiUrls) {
            const importLog = await importLogService.createImportLog(url);
            let fetchedJobs = [];
            try {
                fetchedJobs = await fetchJobsFromApi(url);
                await importLogService.updateImportLog(importLog._id, { totalFetched: fetchedJobs.length });
            } catch (fetchError) {
                console.error(`Failed to fetch jobs from ${url} during manual trigger:`, fetchError.message);
                await importLogService.updateImportLog(importLog._id, {
                    status: 'failed',
                    errorMessage: `Failed to fetch jobs: ${fetchError.message}`
                });
                continue; // Move to the next URL
            }

            if (fetchedJobs.length > 0) {
                // Add each fetched job to the queue
                for (const jobData of fetchedJobs) {
                    await addJobToQueue(jobData, url, importLog._id);
                }
                // Update log status to processing, it will be marked completed by worker logic
                await importLogService.updateImportLog(importLog._id, { status: 'processing' });
            } else {
                await importLogService.updateImportLog(importLog._id, { status: 'completed', errorMessage: 'No jobs fetched.' });
            }
        }
        res.status(202).json({ message: 'Job import process initiated. Check logs for status.' });
    } catch (error) {
        console.error('Error initiating manual import trigger:', error.message);
        res.status(500).json({ message: 'Failed to trigger job import', error: error.message });
    }
});

module.exports = router;