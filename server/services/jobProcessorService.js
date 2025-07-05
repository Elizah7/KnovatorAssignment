const JobModel = require('../models/JobModel');

async function processJob(jobData) {
    try {
        // Basic validation: ensure essential fields are present
        if (!jobData.title || !jobData.description || !jobData.externalId || !jobData.sourceUrl) {
            throw new Error('Missing essential job data fields for processing.');
        }

        // Use findOneAndUpdate with upsert: true to either update an existing job
        // or insert a new one based on externalId.
        // The `new: true` option returns the modified document rather than the original.
        // The `setDefaultsOnInsert: true` option applies schema defaults when upserting.
        const result = await JobModel.findOneAndUpdate(
            { externalId: jobData.externalId }, // Query to find the job
            {
                $set: {
                    title: jobData.title,
                    description: jobData.description,
                    company: jobData.company,
                    location: jobData.location,
                    salary: jobData.salary,
                    jobUrl: jobData.jobUrl,
                    publishedDate: jobData.publishedDate,
                    sourceUrl: jobData.sourceUrl // Ensure sourceUrl is also set/updated
                }
            },
            {
                upsert: true,     // Create if not found
                new: true,        // Return the updated/new document
                setDefaultsOnInsert: true // Apply defaults for new documents
            }
        );

        // Check if the document was newly created or updated
        if (result.createdAt.getTime() === result.updatedAt.getTime()) {
            // If createdAt and updatedAt are the same (within a very small margin),
            // it's likely a new record. Mongoose sets them to the same value on creation.
            return { status: 'new', job: result };
        } else {
            return { status: 'updated', job: result };
        }

    } catch (error) {
        console.error(`Error processing job with externalId ${jobData.externalId}:`, error.message);
        return { status: 'failed', reason: error.message, jobData: jobData };
    }
}

module.exports = {
    processJob
};