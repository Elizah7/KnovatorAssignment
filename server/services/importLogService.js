const ImportLogModel = require('../models/ImportLog');

async function createImportLog(fileName) {
    try {
        const newLog = new ImportLogModel({
            fileName: fileName,
            status: 'processing',
            importDateTime: new Date()
        });
        await newLog.save();
        console.log(`Created new import log for ${fileName} with ID: ${newLog._id}`);
        return newLog;
    } catch (error) {
        console.error(`Error creating import log for ${fileName}:`, error.message);
        throw error;
    }
}

async function updateImportLog(logId, updates) {
    try {
        const updatedLog = await ImportLogModel.findByIdAndUpdate(logId, { $set: updates }, { new: true });
        if (!updatedLog) {
            console.warn(`Import log with ID ${logId} not found for update.`);
        }
        return updatedLog;
    } catch (error) {
        console.error(`Error updating import log with ID ${logId}:`, error.message);
        throw error;
    }
}

async function addFailedJobToLog(logId, jobData, reason) {
    try {
        const updatedLog = await ImportLogModel.findByIdAndUpdate(
            logId,
            {
                $inc: { failedJobsCount: 1 }, // If you add a direct count field
                $push: { failedJobs: { jobData, reason } }
            },
            { new: true }
        );
        if (!updatedLog) {
            console.warn(`Import log with ID ${logId} not found when adding failed job.`);
        }
        return updatedLog;
    } catch (error) {
        console.error(`Error adding failed job to log ${logId}:`, error.message);
        throw error;
    }
}

async function getImportLogs() {
    try {
        const logs = await ImportLogModel.find().sort({ importDateTime: -1 }); // Sort by most recent
        return logs;
    } catch (error) {
        console.error('Error fetching import logs:', error.message);
        throw error;
    }
}

module.exports = {
    createImportLog,
    updateImportLog,
    addFailedJobToLog,
    getImportLogs
};