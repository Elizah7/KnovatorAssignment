const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    company: { type: String },
    location: { type: String },
    salary: { type: String },
    externalId: { type: String, required: true, unique: true },
    sourceUrl: { type: String, required: true }, 
    jobUrl: { type: String }, 
    publishedDate: { type: Date },
}, {
    timestamps: true 
});

let JobModel = mongoose.model('Job', JobSchema);
module.exports = JobModel;