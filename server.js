const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Data storage
let locations = [];
let trackingStatus = {
    isTracking: false,
    lastUpdated: Date.now()
};

// Root endpoint
app.get('/', (req, res) => {
    res.json({ 
        message: 'Location Tracker API',
        status: 'running',
        endpoints: {
            health: '/health',
            status: '/api/status',
            locations: '/api/locations'
        }
    });
});

// Health check
app.get('/health', (req, res) => {
    res.json({ 
        status: 'Server is running', 
        timestamp: Date.now(), 
        totalLocations: locations.length,
        isTracking: trackingStatus.isTracking
    });
});

// GET tracking status
app.get('/api/status', (req, res) => {
    console.log('GET /api/status - Tracking:', trackingStatus.isTracking);
    res.json({ 
        isTracking: trackingStatus.isTracking,
        lastUpdated: trackingStatus.lastUpdated
    });
});

// SET tracking status (from Controller App)
app.post('/api/status', (req, res) => {
    const newStatus = req.body.isTracking;
    trackingStatus.isTracking = newStatus;
    trackingStatus.lastUpdated = Date.now();
    
    console.log('POST /api/status - Tracking changed to:', newStatus);
    
    res.json({ 
        success: true, 
        isTracking: trackingStatus.isTracking,
        message: newStatus ? 'Tracking started' : 'Tracking stopped'
    });
});

// GET all locations
app.get('/api/locations', (req, res) => {
    console.log('GET /api/locations - Returning', locations.length, 'locations');
    res.json(locations);
});

// POST new locations (from Tracker App)
app.post('/api/locations', (req, res) => {
    console.log('POST /api/locations - Received data');
    
    try {
        const newLocs = Array.isArray(req.body) ? req.body : [req.body];
        
        newLocs.forEach(loc => {
            if (loc.latitude && loc.longitude && loc.timestamp) {
                locations.push({
                    latitude: parseFloat(loc.latitude),
                    longitude: parseFloat(loc.longitude),
                    timestamp: parseInt(loc.timestamp)
                });
            }
        });
        
        console.log('Saved', newLocs.length, 'location(s). Total:', locations.length);
        
        res.json({ 
            success: true, 
            saved: newLocs.length, 
            total: locations.length 
        });
    } catch (error) {
        console.error('Error saving locations:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// DELETE all locations (optional - for testing)
app.delete('/api/locations', (req, res) => {
    console.log('DELETE /api/locations - Clearing all data');
    locations = [];
    trackingStatus.isTracking = false;
    res.json({ 
        success: true, 
        message: 'All locations cleared and tracking stopped' 
    });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log('========================================');
    console.log('   LOCATION TRACKER SERVER STARTED');
    console.log('========================================');
    console.log('Port:', PORT);
    console.log('');
    console.log('Endpoints:');
    console.log('  GET    /health         - Health check');
    console.log('  GET    /api/status     - Get tracking status');
    console.log('  POST   /api/status     - Set tracking status');
    console.log('  GET    /api/locations  - Get all locations');
    console.log('  POST   /api/locations  - Save locations');
    console.log('  DELETE /api/locations  - Clear all data');
    console.log('========================================');
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\nShutting down server...');
    process.exit(0);
});
