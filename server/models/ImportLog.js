const mongoose = require('mongoose');

const ImportLogSchema = new mongoose.Schema({
    fileName: { type: String, required: true }, 
    importDateTime: { type: Date, default: Date.now },
    totalFetched: { type: Number, default: 0 },
    totalImported: { type: Number, default: 0 }, 
    newJobs: { type: Number, default: 0 },
    updatedJobs: { type: Number, default: 0 },
    failedJobs: [{
        jobData: mongoose.Schema.Types.Mixed, 
        reason: { type: String },
        timestamp: { type: Date, default: Date.now }
    }],
    status: { type: String, enum: ['pending', 'processing', 'completed', 'failed'], default: 'pending' },
    errorMessage: { type: String } 
}, {
    timestamps: true 
});

const ImportLogModel = mongoose.model('ImportLog', ImportLogSchema);

module.exports = ImportLogModel;