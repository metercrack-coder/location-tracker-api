const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

let locations = [];

app.get('/', (req, res) => {
    res.json({ message: 'Location Tracker API', status: 'running' });
});

app.get('/health', (req, res) => {
    res.json({ status: 'Server is running', timestamp: Date.now(), locations: locations.length });
});

app.get('/api/locations', (req, res) => {
    console.log('GET /api/locations - returning', locations.length, 'locations');
    res.json(locations);
});

app.post('/api/locations', (req, res) => {
    console.log('POST /api/locations - received:', req.body);
    const newLocs = Array.isArray(req.body) ? req.body : [req.body];
    locations.push(...newLocs);
    console.log('Total locations now:', locations.length);
    res.json({ success: true, saved: newLocs.length, total: locations.length });
});

app.delete('/api/locations', (req, res) => {
    locations = [];
    res.json({ success: true, message: 'All cleared' });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log('=== Server started on port', PORT, '===');
});
