# KnovatorAssignmentScalable Job Importer with Queue Processing & History Tracking
This project implements a scalable system designed to fetch job listings from external APIs, process them efficiently using a message queue, store them in a MongoDB database, and provide an administrative interface to track the import history.

Table of Contents
Project Overview

Features

Technologies Used

Project Structure

Setup and Installation

Prerequisites

Backend Setup

Frontend Setup

Running the Application

Starting Backend Services

Accessing the Frontend

Triggering Manual Import

Key Architectural Decisions & Logic

Assumptions

Future Enhancements (Bonus Points)

1. Project Overview
The core objective of this application is to automate the ingestion of job data from various external API sources into a centralized database. It leverages a robust queuing mechanism to handle data processing asynchronously, ensuring system responsiveness and scalability. Additionally, it provides a clear history of all import operations, including statistics on new, updated, and failed job records.

2. Features
Multi-API Integration: Fetches job data from multiple specified external XML-based APIs.

XML to JSON Conversion: Automatically converts incoming XML responses into a standardized JSON format for processing.

Queue-Based Processing: Utilizes Redis and BullMQ for efficient, asynchronous background processing of individual job records.

Configurable Concurrency: Workers process jobs with configurable concurrency, optimizing resource usage.

Job Upsert Logic: Inserts new jobs or updates existing ones in MongoDB based on unique identifiers, ensuring data freshness and preventing duplicates.

Import History Tracking: Logs detailed statistics for each import run, including:

fileName (source URL)

importDateTime

totalFetched jobs

newJobs created

updatedJobs

failedJobs with reasons

Scheduled Imports: A cron job automatically triggers job fetching at regular intervals (e.g., hourly).

Admin UI: A simple React frontend to visualize the import history.

Error Handling: Robust error handling for API fetching, job processing, and database operations.

Retry Logic: Configured BullMQ jobs to automatically retry failed processing attempts with exponential backoff.

3. Technologies Used
Backend (Server):

Node.js: JavaScript runtime environment.

Express.js: Web framework for building RESTful APIs.

MongoDB: NoSQL database for storing job listings and import logs.

Mongoose: ODM (Object Data Modeling) library for MongoDB and Node.js.

Redis: In-memory data store for BullMQ.

BullMQ: Robust, feature-rich queue library for Node.js, backed by Redis.

node-cron: For scheduling periodic job fetching.

axios: Promise-based HTTP client for making API requests.

xml2js: For parsing XML responses into JSON.

dotenv: For managing environment variables.

cors: Middleware for enabling Cross-Origin Resource Sharing.

Frontend (Client):

React: JavaScript library for building user interfaces.

Tailwind CSS: Utility-first CSS framework for styling.

HTML/CSS/JavaScript: Standard web technologies.

4. Project Structure
The project follows a modular structure to ensure clear separation of concerns and maintainability:

your-repo/
├── client/          # React frontend application
│   ├── public/
│   │   └── index.html
│   └── src/
│       ├── components/
│       │   ├── ErrorMessage.js
│       │   ├── Header.js
│       │   ├── ImportHistoryTable.js
│       │   └── LoadingSpinner.js
│       └── App.js
├── server/          # Node.js Express backend application
│   ├── config/
│   │   ├── db.js
│   │   └── index.js
│   ├── docs/
│   │   └── architecture.md
│   ├── models/
│   │   ├── ImportLog.js
│   │   └── Job.js
│   ├── routes/
│   │   └── importRoutes.js
│   ├── services/
│   │   ├── apiFetcherService.js
│   │   ├── importLogService.js
│   │   ├── jobProcessorService.js
│   │   └── redisQueueService.js
│   ├── .env.example  # Example .env file (you'll create .env)
│   ├── app.js        # Main Express server entry point
│   ├── cron.js       # Cron job process entry point
│   ├── package.json
│   ├── worker.js     # BullMQ worker process entry point
│   └── package-lock.json
├── README.md        # This file

5. Setup and Installation
Prerequisites
Before you begin, ensure you have the following installed:

Node.js (v18 or higher recommended)

npm (Node Package Manager, comes with Node.js)

MongoDB Instance:

A local MongoDB instance running (e.g., via Docker or installed directly).

OR a cloud-hosted MongoDB Atlas database.

Redis Instance:

A local Redis instance running.

OR a cloud-hosted Redis Cloud database.

Backend Setup
Navigate to the server directory:

cd server

Install backend dependencies:

npm install

Create a .env file:
In the server directory, create a file named .env. Copy the content below and fill in your actual database connection details.

# .env file in server directory

PORT=8081 # Or your desired port for the backend API
MONGO_URI=mongodb://localhost:27017/job_importer # Replace with your MongoDB URI (e.g., MongoDB Atlas connection string)

# Redis Cloud Connection Details (replace with your actual values)
REDIS_HOST=your-redis-cloud-hostname.redislabs.com
REDIS_PORT=your_redis_cloud_port_number
REDIS_PASSWORD=your_redis_cloud_password # Uncomment and set if your Redis requires authentication

CRON_SCHEDULE=0 * * * * # Cron schedule for job fetching (e.g., "0 * * * *" for every hour)
WORKER_CONCURRENCY=5 # Number of jobs processed concurrently by the worker

# External Job API URLs (comma-separated if you want to manage them via .env)
# JOB_API_URLS="https://jobicy.com/?feed=job_feed,https://jobicy.com/?feed=job_feed&job_categories=smm&job_types=full-time,https://www.higheredjobs.com/rss/articleFeed.cfm"
# Note: Currently, jobApiUrls are hardcoded in server/config/index.js for simplicity,
# but can be moved here as shown commented above for more flexibility.

Important: Ensure your REDIS_HOST, REDIS_PORT, and REDIS_PASSWORD match the details from your Redis Cloud instance. The PORT for the backend is currently set to 8081.

Frontend Setup
The frontend is a simple HTML file that loads React from CDNs. No npm install is needed for the frontend itself in this setup.

Navigate to the client/public directory:

cd client/public

Ensure index.html is present (it loads the React App.js from ../src/App.js).

6. Running the Application
Starting Backend Services
The backend consists of three separate Node.js processes that need to be running concurrently.

Navigate to the server directory:

cd server

Start all backend services:

npm run dev

This command uses concurrently to start:

The Express API server (app.js)

The BullMQ worker (worker.js)

The cron job scheduler (cron.js)

You should see console output indicating that all three components are initialized and connected to MongoDB and Redis. Pay attention to any error messages.

Accessing the Frontend
Open the index.html file in your browser:
Navigate to client/public/index.html in your file explorer and open it with your web browser.
Alternatively, you can get the full path to the file (e.g., file:///path/to/your-repo/client/public/index.html) and paste it into your browser.

The frontend will attempt to fetch import history from http://localhost:8081/api/imports.

Triggering Manual Import (for immediate testing)
Since the cron job runs hourly, you can manually trigger an import run to see data populate immediately:

Ensure your backend services are running (npm run dev).

Open a new terminal or use a tool like Postman/Insomnia.

Send a POST request to:

http://localhost:8081/api/imports/trigger

You should see detailed logs in your backend terminal(s) as jobs are fetched, queued, and processed. After a few moments, refresh your frontend page to see the updated import history.

7. Key Architectural Decisions & Logic
This project's architecture is detailed in server/docs/architecture.md. Key aspects include:

Producer-Consumer Pattern: Decoupling data fetching (producer: cron job) from data processing (consumer: worker) using a Redis-backed BullMQ queue. This enhances scalability and fault tolerance.

Modular Design: Code is organized into models, services, routes, and configuration files for clear separation of concerns, maintainability, and testability.

MongoDB for Persistence: Used for both raw job data and structured import logs, leveraging Mongoose for schema management and interactions.

Upsert Logic: JobProcessorService uses findOneAndUpdate with upsert: true to efficiently insert new jobs or update existing ones based on a unique externalId.

Centralized DB Connection: A server/config/db.js file centralizes the MongoDB connection logic, ensuring all backend components connect reliably before starting their main operations.

Error Handling and Retries: Comprehensive try-catch blocks and BullMQ's built-in retry mechanisms ensure robustness against transient failures.

For a deeper dive into the system design, please refer to: server/docs/architecture.md

8. Assumptions
External API Stability: Assumes the external job APIs (jobicy.com, higheredjobs.com) are generally available and return valid XML data.

XML Structure: Assumes the XML structures for the specified APIs are consistent enough for the parsing logic in apiFetcherService.js. Minor adjustments might be needed if their schemas change.

HigherEdJobs Feed: The https://www.higheredjobs.com/rss/articleFeed.cfm URL appears to be an article feed, not a job feed. The system will still process its items but will store null for job-specific fields like company, location, and salary, as they are not present in that feed.

Unique Job Identifier: Relies on item.guid or item.link (or item.id for Jobicy) as a sufficiently unique externalId for upsert operations.

Redis Eviction Policy: It is assumed that the Redis database's eviction policy will be set to noeviction to prevent accidental loss of queue jobs under memory pressure. (This is a critical configuration for production environments.)

9. Future Enhancements (Bonus Points)
Real-time Frontend Updates: Implement Socket.IO or Server-Sent Events (SSE) to push real-time import progress updates to the frontend.

Environment-Configurable Parameters: Extend .env to include configurable batch sizes for adding jobs to the queue and maximum concurrency for workers.

Deployment: Deploy the backend to a platform like Render and the frontend to Vercel, utilizing MongoDB Atlas and Redis Cloud for managed services.

Advanced Error Reporting: Integrate a dedicated error tracking service (e.g., Sentry, Bugsnag).

Authentication/Authorization: Add user authentication for the Admin UI.

More Robust API Parsing: Implement more flexible or configurable parsing rules for diverse XML structures.

Unit/Integration Tests: Add comprehensive test suites for backend services and API endpoints.