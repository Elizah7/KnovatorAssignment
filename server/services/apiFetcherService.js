const axios = require('axios');
const { parseStringPromise } = require('xml2js');

// Function to fetch XML from a given URL and parse it to JSON
async function fetchAndParseXml(url) {
    try {
        const response = await axios.get(url, {
            headers: { 'Accept': 'application/xml' } // Request XML explicitly
        });
        const xmlData = response.data;
        // Parse XML to JSON. Options can be adjusted for specific XML structures.
        const result = await parseStringPromise(xmlData, {
            explicitArray: false, // Ensures single elements are not always arrays
            mergeAttrs: true,     // Merges attributes into the element object
            // You might need to add more parsers or specific options based on the exact XML structure
            // For example, if elements like <title/> are empty, they might be parsed as null or empty objects.
            // Consider `emptyTag: null` or `trim: true`
        });
        return result;
    } catch (error) {
        console.error(`Error fetching or parsing XML from ${url}:`, error.message);
        throw new Error(`Failed to fetch and parse XML from ${url}`);
    }
}

// Function to extract relevant job data from jobicy.com XML structure
function extractJobicyJobs(parsedData) {
    const jobs = [];
    // Assuming the structure is { rss: { channel: { item: [...] } } }
    const items = parsedData?.rss?.channel?.item;
    console.log('Parsed Jobicy items:', items); // Debugging log to check the structure
    if (!items) {
        console.warn('No job items found in Jobicy feed.');
        return [];
    }

    // Ensure items is an array even if there's only one item
    const jobItems = Array.isArray(items) ? items : [items];

    for (const item of jobItems) {
        if (item) {
            jobs.push({
                title: item.title || 'N/A',
                // Prefer content:encoded for detailed description if available, otherwise use description
                description: item['content:encoded'] || item.description || 'N/A',
                company: item['job_listing:company'] || 'N/A', // Corrected tag for company
                location: item['job_listing:location'] || 'N/A', // Corrected tag for location
                salary: null, // Salary not present in the provided jobicy XML snippet
                externalId: item.id || item.guid, // Use 'id' if available, fallback to 'guid'
                jobUrl: item.link,
                publishedDate: item.pubDate ? new Date(item.pubDate) : null,
            });
        }
    }
    return jobs;
}

// Function to extract relevant data from higheredjobs.com XML structure
// NOTE: The provided higheredjobs.com XML snippet appears to be an ARTICLE feed, not a job feed.
// Therefore, fields like company, location, and salary are not present and will be null/N/A.
function extractHigherEdJobs(parsedData) {
    const jobs = []; // Renaming to 'jobs' to fit the generic return type, but these are articles.
    // Assuming the structure is { rss: { channel: { item: [...] } } }
    const items = parsedData?.rss?.channel?.item;
    console.log('Parsed Jobicy items:', items); // Debugging log to check the structure

    if (!items) {
        console.warn('No items found in HigherEdJobs feed (appears to be an article feed).');
        return [];
    }

    // Ensure items is an array even if there's only one item
    const articleItems = Array.isArray(items) ? items : [items];

    for (const item of articleItems) {
        if (item) {
            jobs.push({
                title: item.title || 'N/A',
                description: item.description || 'N/A',
                company: null, // Not present in article feed
                location: null, // Not present in article feed
                salary: null, // Not present in article feed
                externalId: item.guid || item.link, // GUID or link as unique identifier for the article
                jobUrl: item.link,
                publishedDate: item.pubDate ? new Date(item.pubDate) : null,
            });
        }
    }
    return jobs;
}

// Main function to fetch jobs from a given URL and return parsed job objects
async function fetchJobsFromApi(url) {
    try {
        const parsedXml = await fetchAndParseXml(url);
        let jobs = [];

        // Determine which extractor to use based on the URL
        if (url.includes('jobicy.com')) {
            jobs = extractJobicyJobs(parsedXml);
        } else if (url.includes('higheredjobs.com')) {
            jobs = extractHigherEdJobs(parsedXml);
            console.warn(`Warning: The URL ${url} appears to be an article feed, not a job feed. Extracted data may not contain typical job details (company, location, salary).`);
        } else {
            console.warn(`No specific extractor for URL: ${url}. Attempting generic extraction (Jobicy structure).`);
            // Fallback to a generic extraction if needed, or throw an error
            jobs = extractJobicyJobs(parsedXml); // As a generic fallback, try jobicy's structure
        }

        console.log(`Fetched ${jobs.length} items from ${url}`);
        return jobs;
    } catch (error) {
        console.error(`Failed to fetch items from API ${url}:`, error.message);
        throw error;
    }
}

module.exports = {
    fetchJobsFromApi
};
