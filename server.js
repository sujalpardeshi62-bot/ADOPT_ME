const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Middleware - Add payload limit for large images
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// MongoDB Connection
const MONGODB_URI = 'mongodb://127.0.0.1:27017/adoptme_db';

console.log('🔗 Connecting to MongoDB Compass...\n');

mongoose.connect(MONGODB_URI)
.then(() => {
    console.log('✅ Connected to MongoDB Compass!');
    console.log('📊 Database: adoptme_db');
})
.catch(err => {
    console.error('❌ Connection failed:', err.message);
});

// ============ COMPLETE ADOPTION SCHEMA (All Fields) ============
const adoptionSchema = new mongoose.Schema({
    id: { type: String },
    animalId: { type: String },
    animalName: { type: String },
    name: { type: String },
    applicantName: { type: String },
    email: { type: String },
    applicantEmail: { type: String },
    phone: { type: String },
    applicantPhone: { type: String },
    dob: { type: String },
    gender: { type: String },
    occupation: { type: String },
    citizenship: { type: String },
    idType: { type: String },
    aadhaarNumber: { type: String },
    idNumber: { type: String },
    address: { type: String },
    city: { type: String },
    state: { type: String },
    pincode: { type: String },
    liveLocation: { type: String },
    livingType: { type: String },
    ownership: { type: String },
    yard: { type: String },
    otherPets: { type: String },
    familySupport: { type: String },
    experience: { type: String },
    reason: { type: String },
    reasonForAdoption: { type: String },
    dailyCare: { type: String },
    emergencyPlan: { type: String },
    livingSituation: { type: String },
    hasOtherPets: { type: Boolean },
    photoFileName: { type: String },
    documentFileName: { type: String },
    consentAccepted: { type: Boolean },
    status: { type: String, default: 'Pending Review' },
    reviewedAt: { type: String },
    createdAt: { type: Date, default: Date.now },
    applicationDate: { type: Date, default: Date.now }
});

const Adoption = mongoose.model('Adoption', adoptionSchema);

// ============ DONATION SCHEMA ============
const donationSchema = new mongoose.Schema({
    id: String,
    donorName: String,
    donorEmail: String,
    donorPhone: String,
    name: String,
    email: String,
    phone: String,
    amount: String,
    type: String,
    paymentMethod: String,
    upiApp: String,
    upiRedirected: Boolean,
    paymentVerified: Boolean,
    emailVerified: Boolean,
    phoneVerified: Boolean,
    location: String,
    city: String,
    note: String,
    consent: Boolean,
    bankName: String,
    bankAccount: String,
    beneficiary: String,
    cardNumber: String,
    cardName: String,
    cardExpiry: String,
    walletProvider: String,
    walletMobile: String,
    netBankingUserId: String,
    transactionAuthorized: Boolean,
    createdAt: String,
    status: String
});

const Donation = mongoose.model('Donation', donationSchema);

// ============ EVENT SCHEMA ============
const eventSchema = new mongoose.Schema({
    id: { type: String },
    title: { type: String, required: true },
    date: { type: String },
    city: { type: String },
    venue: { type: String },
    category: { type: String },
    seats: { type: Number },
    status: { type: String },
    description: { type: String },
    createdAt: { type: Date, default: Date.now }
});

// ============ EVENT REGISTRATION SCHEMA ============
const eventRegistrationSchema = new mongoose.Schema({
    id: { type: Number },
    registrationId: { type: String },
    userEmail: { type: String },
    name: { type: String },
    email: { type: String },
    phone: { type: String },
    city: { type: String },
    eventId: { type: String },
    eventTitle: { type: String },
    eventDate: { type: String },
    eventVenue: { type: String },
    role: { type: String },
    note: { type: String },
    consentAccepted: { type: Boolean },
    status: { type: String, default: 'Registered' },
    createdAt: { type: String }
});

// ============ EVENT ALERT SCHEMA ============
const eventAlertSchema = new mongoose.Schema({
    title: { type: String, required: true },
    message: { type: String, required: true },
    level: { type: String, default: 'upcoming' },
    createdAt: { type: Date, default: Date.now }
});

// ============ LOST & FOUND SCHEMAS ============

const lostReportSchema = new mongoose.Schema({
    id: { type: Number },
    reportId: { type: String },
    reportType: { type: String, default: 'Lost' },
    userEmail: { type: String },
    ownerName: { type: String },
    ownerPhone: { type: String },
    ownerEmail: { type: String },
    petName: { type: String },
    species: { type: String },
    breed: { type: String },
    color: { type: String },
    gender: { type: String },
    age: { type: String },
    uniqueMark: { type: String },
    city: { type: String },
    location: { type: String },
    latitude: { type: String },
    longitude: { type: String },
    lostDate: { type: String },
    description: { type: String },
    petPhoto: { type: String },
    consentAccepted: { type: Boolean },
    verificationStatus: { type: String, default: 'Owner Report Submitted' },
    status: { type: String, default: 'Active Lost Report' },
    createdAt: { type: String },
    updatedAt: { type: String }
});

const foundReportSchema = new mongoose.Schema({
    id: { type: Number },
    reportId: { type: String },
    reportType: { type: String, default: 'Found' },
    userEmail: { type: String },
    finderName: { type: String },
    finderPhone: { type: String },
    finderEmail: { type: String },
    species: { type: String },
    breed: { type: String },
    color: { type: String },
    gender: { type: String },
    uniqueMark: { type: String },
    city: { type: String },
    location: { type: String },
    latitude: { type: String },
    longitude: { type: String },
    foundDate: { type: String },
    condition: { type: String },
    description: { type: String },
    petPhoto: { type: String },
    consentAccepted: { type: Boolean },
    verificationStatus: { type: String, default: 'Finder Report Submitted' },
    status: { type: String, default: 'Active Found Report' },
    createdAt: { type: String },
    updatedAt: { type: String }
});

// ============ RESCUE SCHEMA ============
const rescueSchema = new mongoose.Schema({
    id: { type: Number },
    requestId: { type: String },
    userEmail: { type: String },
    name: { type: String },
    phone: { type: String },
    email: { type: String },
    emergencyContactPerson: { type: String },
    animalType: { type: String },
    emergencyLevel: { type: String },
    animalCondition: { type: String },
    animalCount: { type: String },
    location: { type: String },
    landmark: { type: String },
    latitude: { type: String },
    longitude: { type: String },
    description: { type: String },
    noticedAt: { type: String },
    animalPhoto: { type: String },
    consentAccepted: { type: Boolean },
    status: { type: String, default: 'Open' },
    assignedTeam: { type: String, default: 'Pending Assignment' },
    createdAt: { type: String },
    updatedAt: { type: String }
});

// ============ VOLUNTEER SCHEMA ============
const volunteerSchema = new mongoose.Schema({
    id: { type: Number },
    volunteerId: { type: String },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    city: { type: String },
    photoFileName: { type: String },
    skills: { type: String },
    availability: { type: String },
    rolePreference: { type: String },
    reason: { type: String },
    emergencyContact: { type: String },
    consentAccepted: { type: Boolean },
    verificationStatus: { type: String, default: 'Verified Registration Submitted' },
    createdAt: { type: String },
    updatedAt: { type: String }
});

// ============ USER SCHEMA (COMPLETE - With all fields from register form) ============
const userSchema = new mongoose.Schema({
    id: { type: String },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String },
    city: { type: String },
    bio: { type: String },
    role: { type: String, default: 'User' },
    profilePhoto: { type: String },
    profileImage: { type: String },
    avatar: { type: String },
    // Shelter Staff fields
    shelterName: { type: String },
    shelterLocation: { type: String },
    // Volunteer fields
    volunteerSkills: { type: String },
    volunteerAvailability: { type: String },
    // Admin fields
    adminSecurityCode: { type: String },
    // Additional fields
    registeredAt: { type: String },
    createdAt: { type: String },
    updatedAt: { type: String },
    lastLogin: { type: String },
    emailVerified: { type: Boolean, default: false },
    phoneVerified: { type: Boolean, default: false },
    profileComplete: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    accessPages: { type: [String] }
});

const Event = mongoose.model('Event', eventSchema);
const EventRegistration = mongoose.model('EventRegistration', eventRegistrationSchema);
const EventAlert = mongoose.model('EventAlert', eventAlertSchema);
const LostReport = mongoose.model('LostReport', lostReportSchema);
const FoundReport = mongoose.model('FoundReport', foundReportSchema);
const Rescue = mongoose.model('Rescue', rescueSchema);
const Volunteer = mongoose.model('Volunteer', volunteerSchema);
const User = mongoose.model('User', userSchema);

// ============ API ROUTES ============

// Test route
app.get('/api/test', (req, res) => {
    res.json({ 
        message: 'Adopt Me Backend is working!', 
        database: 'adoptme_db'
    });
});

// Get database info
app.get('/api/db-info', async (req, res) => {
    try {
        const collections = await mongoose.connection.db.listCollections().toArray();
        res.json({
            database: mongoose.connection.name,
            collections: collections.map(c => c.name),
            adoptionCount: await Adoption.countDocuments(),
            donationCount: await Donation.countDocuments(),
            eventCount: await Event.countDocuments(),
            eventRegistrationCount: await EventRegistration.countDocuments(),
            eventAlertCount: await EventAlert.countDocuments(),
            lostReportCount: await LostReport.countDocuments(),
            foundReportCount: await FoundReport.countDocuments(),
            rescueCount: await Rescue.countDocuments(),
            volunteerCount: await Volunteer.countDocuments(),
            userCount: await User.countDocuments()
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ============ ADOPTION ROUTES ============

app.post('/api/adoptions/apply', async (req, res) => {
    try {
        console.log('📝 Received adoption application with fields:', Object.keys(req.body).length);
        const adoption = new Adoption(req.body);
        await adoption.save();
        console.log('✅ Adoption saved to MongoDB with ID:', adoption._id);
        res.json({ success: true, message: 'Adoption application submitted successfully!', data: adoption });
    } catch (error) {
        console.error('Error saving adoption:', error);
        res.status(400).json({ success: false, message: error.message });
    }
});

app.get('/api/adoptions/all', async (req, res) => {
    try {
        const adoptions = await Adoption.find().sort({ createdAt: -1 });
        console.log(`📋 Retrieved ${adoptions.length} adoptions from database`);
        res.json({ success: true, count: adoptions.length, data: adoptions });
    } catch (error) {
        console.error('Error getting adoptions:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

app.put('/api/adoptions/:id/status', async (req, res) => {
    try {
        const adoption = await Adoption.findByIdAndUpdate(
            req.params.id,
            { status: req.body.status, reviewedAt: new Date().toLocaleString() },
            { new: true }
        );
        if (!adoption) return res.status(404).json({ success: false, message: 'Adoption not found' });
        res.json({ success: true, data: adoption });
    } catch (error) {
        console.error('Error updating status:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

app.delete('/api/adoptions/:id', async (req, res) => {
    try {
        const adoption = await Adoption.findByIdAndDelete(req.params.id);
        if (!adoption) return res.status(404).json({ success: false, message: 'Adoption not found' });
        res.json({ success: true, message: 'Adoption deleted successfully' });
    } catch (error) {
        console.error('Error deleting adoption:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

app.get('/api/adoptions/:id', async (req, res) => {
    try {
        const adoption = await Adoption.findById(req.params.id);
        if (!adoption) return res.status(404).json({ success: false, message: 'Adoption not found' });
        res.json({ success: true, data: adoption });
    } catch (error) {
        console.error('Error getting adoption:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// ============ DONATION ROUTES ============

app.post('/api/donations/add', async (req, res) => {
    try {
        const donation = new Donation(req.body);
        await donation.save();
        console.log('💰 Donation saved:', donation.amount);
        res.json({ success: true, message: 'Donation saved!', data: donation });
    } catch (error) {
        console.error('Error saving donation:', error);
        res.status(400).json({ success: false, message: error.message });
    }
});

app.get('/api/donations/all', async (req, res) => {
    try {
        const donations = await Donation.find().sort({ createdAt: -1 });
        console.log(`📋 Retrieved ${donations.length} donations from database`);
        res.json({ success: true, count: donations.length, data: donations });
    } catch (error) {
        console.error('Error getting donations:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

app.delete('/api/donations/:id', async (req, res) => {
    try {
        const donation = await Donation.findByIdAndDelete(req.params.id);
        if (!donation) return res.status(404).json({ success: false, message: 'Donation not found' });
        res.json({ success: true, message: 'Donation deleted successfully' });
    } catch (error) {
        console.error('Error deleting donation:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// ============ EVENT ROUTES ============

app.get('/api/events/all', async (req, res) => {
    try {
        const events = await Event.find().sort({ date: 1 });
        console.log(`📋 Retrieved ${events.length} events from database`);
        res.json({ success: true, count: events.length, data: events });
    } catch (error) {
        console.error('Error getting events:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

app.post('/api/events/add', async (req, res) => {
    try {
        console.log('📅 Received event data:', req.body);
        const event = new Event(req.body);
        await event.save();
        console.log('✅ Event saved to MongoDB with ID:', event._id);
        res.json({ success: true, message: 'Event saved!', data: event });
    } catch (error) {
        console.error('Error saving event:', error);
        res.status(400).json({ success: false, message: error.message });
    }
});

app.delete('/api/events/:id', async (req, res) => {
    try {
        const event = await Event.findByIdAndDelete(req.params.id);
        if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
        console.log('🗑️ Event deleted from MongoDB:', event.title);
        res.json({ success: true, message: 'Event deleted successfully' });
    } catch (error) {
        console.error('Error deleting event:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

app.get('/api/events/registrations/all', async (req, res) => {
    try {
        const registrations = await EventRegistration.find().sort({ createdAt: -1 });
        console.log(`📋 Retrieved ${registrations.length} event registrations from database`);
        res.json({ success: true, count: registrations.length, data: registrations });
    } catch (error) {
        console.error('Error getting event registrations:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

app.post('/api/events/register', async (req, res) => {
    try {
        const registration = new EventRegistration(req.body);
        await registration.save();
        console.log('✅ Event registration saved for:', registration.name);
        res.json({ success: true, message: 'Event registration successful!', data: registration });
    } catch (error) {
        console.error('Error saving event registration:', error);
        res.status(400).json({ success: false, message: error.message });
    }
});

app.delete('/api/events/registrations/:id', async (req, res) => {
    try {
        const registration = await EventRegistration.findByIdAndDelete(req.params.id);
        if (!registration) return res.status(404).json({ success: false, message: 'Registration not found' });
        console.log('🗑️ Registration deleted from MongoDB');
        res.json({ success: true, message: 'Registration deleted successfully' });
    } catch (error) {
        console.error('Error deleting registration:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// ============ EVENT ALERT ROUTES ============

app.get('/api/events/alerts/all', async (req, res) => {
    try {
        const alerts = await EventAlert.find().sort({ createdAt: -1 });
        console.log(`📋 Retrieved ${alerts.length} event alerts from database`);
        res.json({ success: true, count: alerts.length, data: alerts });
    } catch (error) {
        console.error('Error getting alerts:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

app.post('/api/events/alerts/add', async (req, res) => {
    try {
        console.log('🔔 Received alert data:', req.body);
        const alert = new EventAlert(req.body);
        await alert.save();
        console.log('✅ Alert saved to MongoDB with ID:', alert._id);
        res.json({ success: true, message: 'Alert saved!', data: alert });
    } catch (error) {
        console.error('Error saving alert:', error);
        res.status(400).json({ success: false, message: error.message });
    }
});

app.delete('/api/events/alerts/:id', async (req, res) => {
    try {
        const alert = await EventAlert.findByIdAndDelete(req.params.id);
        if (!alert) return res.status(404).json({ success: false, message: 'Alert not found' });
        console.log('🗑️ Alert deleted from MongoDB:', alert.title);
        res.json({ success: true, message: 'Alert deleted successfully' });
    } catch (error) {
        console.error('Error deleting alert:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// ============ VOLUNTEER ROUTES ============

// Get all volunteers
app.get('/api/volunteers/all', async (req, res) => {
    try {
        const volunteers = await Volunteer.find().sort({ createdAt: -1 });
        console.log(`📋 Retrieved ${volunteers.length} volunteers from database`);
        res.json({ success: true, count: volunteers.length, data: volunteers });
    } catch (error) {
        console.error('Error getting volunteers:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Add new volunteer
app.post('/api/volunteers/add', async (req, res) => {
    try {
        console.log('📝 Received volunteer registration:', req.body.name);
        const volunteer = new Volunteer(req.body);
        await volunteer.save();
        console.log('✅ Volunteer saved to MongoDB with ID:', volunteer._id);
        res.json({ success: true, message: 'Volunteer registration saved!', data: volunteer });
    } catch (error) {
        console.error('Error saving volunteer:', error);
        res.status(400).json({ success: false, message: error.message });
    }
});

// Delete volunteer
app.delete('/api/volunteers/:id', async (req, res) => {
    try {
        const volunteer = await Volunteer.findByIdAndDelete(req.params.id);
        if (!volunteer) {
            return res.status(404).json({ success: false, message: 'Volunteer not found' });
        }
        console.log('🗑️ Volunteer deleted from MongoDB');
        res.json({ success: true, message: 'Volunteer deleted successfully' });
    } catch (error) {
        console.error('Error deleting volunteer:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// ============ LOST & FOUND ROUTES ============

app.get('/api/lost/all', async (req, res) => {
    try {
        const reports = await LostReport.find().sort({ createdAt: -1 });
        console.log(`📋 Retrieved ${reports.length} lost reports from database`);
        res.json({ success: true, count: reports.length, data: reports });
    } catch (error) {
        console.error('Error getting lost reports:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

app.post('/api/lost/add', async (req, res) => {
    try {
        console.log('📝 Received lost report data:', req.body.petName);
        const report = new LostReport(req.body);
        await report.save();
        console.log('✅ Lost report saved to MongoDB with ID:', report._id);
        res.json({ success: true, message: 'Lost report saved!', data: report });
    } catch (error) {
        console.error('Error saving lost report:', error);
        res.status(400).json({ success: false, message: error.message });
    }
});

app.put('/api/lost/:id/status', async (req, res) => {
    try {
        const report = await LostReport.findByIdAndUpdate(
            req.params.id,
            { status: req.body.status, updatedAt: new Date().toLocaleString() },
            { new: true }
        );
        if (!report) return res.status(404).json({ success: false, message: 'Report not found' });
        console.log('✅ Lost report status updated to:', req.body.status);
        res.json({ success: true, data: report });
    } catch (error) {
        console.error('Error updating lost report:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

app.delete('/api/lost/:id', async (req, res) => {
    try {
        const report = await LostReport.findByIdAndDelete(req.params.id);
        if (!report) return res.status(404).json({ success: false, message: 'Report not found' });
        console.log('🗑️ Lost report deleted from MongoDB');
        res.json({ success: true, message: 'Lost report deleted successfully' });
    } catch (error) {
        console.error('Error deleting lost report:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

app.get('/api/found/all', async (req, res) => {
    try {
        const reports = await FoundReport.find().sort({ createdAt: -1 });
        console.log(`📋 Retrieved ${reports.length} found reports from database`);
        res.json({ success: true, count: reports.length, data: reports });
    } catch (error) {
        console.error('Error getting found reports:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

app.post('/api/found/add', async (req, res) => {
    try {
        console.log('📝 Received found report data:', req.body.species);
        const report = new FoundReport(req.body);
        await report.save();
        console.log('✅ Found report saved to MongoDB with ID:', report._id);
        res.json({ success: true, message: 'Found report saved!', data: report });
    } catch (error) {
        console.error('Error saving found report:', error);
        res.status(400).json({ success: false, message: error.message });
    }
});

app.put('/api/found/:id/status', async (req, res) => {
    try {
        const report = await FoundReport.findByIdAndUpdate(
            req.params.id,
            { status: req.body.status, updatedAt: new Date().toLocaleString() },
            { new: true }
        );
        if (!report) return res.status(404).json({ success: false, message: 'Report not found' });
        console.log('✅ Found report status updated to:', req.body.status);
        res.json({ success: true, data: report });
    } catch (error) {
        console.error('Error updating found report:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

app.delete('/api/found/:id', async (req, res) => {
    try {
        const report = await FoundReport.findByIdAndDelete(req.params.id);
        if (!report) return res.status(404).json({ success: false, message: 'Report not found' });
        console.log('🗑️ Found report deleted from MongoDB');
        res.json({ success: true, message: 'Found report deleted successfully' });
    } catch (error) {
        console.error('Error deleting found report:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// ============ RESCUE ROUTES ============

// Get all rescue requests
app.get('/api/rescue/all', async (req, res) => {
    try {
        const requests = await Rescue.find().sort({ createdAt: -1 });
        console.log(`📋 Retrieved ${requests.length} rescue requests from database`);
        res.json({ success: true, count: requests.length, data: requests });
    } catch (error) {
        console.error('Error getting rescue requests:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Add new rescue request
app.post('/api/rescue/add', async (req, res) => {
    try {
        console.log('📝 Received rescue request:', req.body.requestId);
        const request = new Rescue(req.body);
        await request.save();
        console.log('✅ Rescue request saved to MongoDB with ID:', request._id);
        res.json({ success: true, message: 'Rescue request saved!', data: request });
    } catch (error) {
        console.error('Error saving rescue request:', error);
        res.status(400).json({ success: false, message: error.message });
    }
});

// Update rescue request status
app.put('/api/rescue/:id/status', async (req, res) => {
    try {
        const request = await Rescue.findByIdAndUpdate(
            req.params.id,
            { 
                status: req.body.status,
                assignedTeam: req.body.assignedTeam || 'Pending Assignment',
                updatedAt: new Date().toLocaleString()
            },
            { new: true }
        );
        if (!request) {
            return res.status(404).json({ success: false, message: 'Rescue request not found' });
        }
        console.log('✅ Rescue request status updated to:', req.body.status);
        res.json({ success: true, data: request });
    } catch (error) {
        console.error('Error updating rescue request:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Delete rescue request
app.delete('/api/rescue/:id', async (req, res) => {
    try {
        const request = await Rescue.findByIdAndDelete(req.params.id);
        if (!request) {
            return res.status(404).json({ success: false, message: 'Rescue request not found' });
        }
        console.log('🗑️ Rescue request deleted from MongoDB');
        res.json({ success: true, message: 'Rescue request deleted successfully' });
    } catch (error) {
        console.error('Error deleting rescue request:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// ============ USER ROUTES ============

// Register new user
app.post('/api/users/register', async (req, res) => {
    try {
        console.log('📝 Received user registration:', req.body.email);
        
        // Check if user already exists
        const existingUser = await User.findOne({ email: req.body.email });
        if (existingUser) {
            return res.status(400).json({ 
                success: false, 
                message: 'User with this email already exists' 
            });
        }
        
        const user = new User(req.body);
        await user.save();
        console.log('✅ User registered successfully with ID:', user._id);
        
        // Don't send password back
        const userResponse = user.toObject();
        delete userResponse.password;
        
        res.json({ 
            success: true, 
            message: 'User registered successfully!',
            data: userResponse 
        });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(400).json({ success: false, message: error.message });
    }
});

// Login user
app.post('/api/users/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log('🔐 Login attempt for:', email);
        
        const user = await User.findOne({ email: email });
        if (!user) {
            return res.status(401).json({ 
                success: false, 
                message: 'User not found. Please register first.' 
            });
        }
        
        // Check password
        if (user.password !== password) {
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid password' 
            });
        }
        
        // Update last login
        user.lastLogin = new Date().toLocaleString();
        await user.save();
        
        // Don't send password back
        const userResponse = user.toObject();
        delete userResponse.password;
        
        console.log('✅ User logged in successfully:', user.email);
        res.json({ 
            success: true, 
            message: 'Login successful!',
            data: userResponse 
        });
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get all users (Admin only)
app.get('/api/users/all', async (req, res) => {
    try {
        const users = await User.find().sort({ createdAt: -1 }).select('-password');
        console.log(`📋 Retrieved ${users.length} users from database`);
        res.json({ success: true, count: users.length, data: users });
    } catch (error) {
        console.error('Error getting users:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get single user by ID
app.get('/api/users/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.json({ success: true, data: user });
    } catch (error) {
        console.error('Error getting user:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Update user
app.put('/api/users/:id', async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { ...req.body, updatedAt: new Date().toLocaleString() },
            { new: true }
        ).select('-password');
        
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        console.log('✅ User updated:', user.email);
        res.json({ success: true, data: user });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(400).json({ success: false, message: error.message });
    }
});

// Delete user
app.delete('/api/users/:id', async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        console.log('🗑️ User deleted:', user.email);
        res.json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Dashboard stats (updated with users)
app.get('/api/admin/stats', async (req, res) => {
    try {
        const stats = {
            totalAdoptions: await Adoption.countDocuments(),
            pendingAdoptions: await Adoption.countDocuments({ status: 'Pending Review' }),
            approvedAdoptions: await Adoption.countDocuments({ status: 'Approved' }),
            rejectedAdoptions: await Adoption.countDocuments({ status: 'Rejected' }),
            totalDonations: await Donation.countDocuments(),
            totalEvents: await Event.countDocuments(),
            totalEventRegistrations: await EventRegistration.countDocuments(),
            totalEventAlerts: await EventAlert.countDocuments(),
            totalLostReports: await LostReport.countDocuments(),
            totalFoundReports: await FoundReport.countDocuments(),
            totalRescueRequests: await Rescue.countDocuments(),
            totalVolunteers: await Volunteer.countDocuments(),
            totalUsers: await User.countDocuments()
        };
        res.json({ success: true, data: stats });
    } catch (error) {
        console.error('Error getting stats:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Start server
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`\n🚀 Server running on http://localhost:${PORT}`);
    console.log(`📊 Database: adoptme_db`);
    console.log(`\n📝 API Endpoints:`);
    console.log(`   ADOPTIONS:`);
    console.log(`   POST /api/adoptions/apply`);
    console.log(`   GET  /api/adoptions/all`);
    console.log(`   PUT  /api/adoptions/:id/status`);
    console.log(`   DELETE /api/adoptions/:id`);
    console.log(`\n   DONATIONS:`);
    console.log(`   POST /api/donations/add`);
    console.log(`   GET  /api/donations/all`);
    console.log(`   DELETE /api/donations/:id`);
    console.log(`\n   EVENTS:`);
    console.log(`   GET  /api/events/all`);
    console.log(`   POST /api/events/add`);
    console.log(`   DELETE /api/events/:id`);
    console.log(`   GET  /api/events/registrations/all`);
    console.log(`   POST /api/events/register`);
    console.log(`   DELETE /api/events/registrations/:id`);
    console.log(`\n   EVENT ALERTS:`);
    console.log(`   GET  /api/events/alerts/all`);
    console.log(`   POST /api/events/alerts/add`);
    console.log(`   DELETE /api/events/alerts/:id`);
    console.log(`\n   VOLUNTEERS:`);
    console.log(`   GET  /api/volunteers/all`);
    console.log(`   POST /api/volunteers/add`);
    console.log(`   DELETE /api/volunteers/:id`);
    console.log(`\n   LOST & FOUND:`);
    console.log(`   GET  /api/lost/all`);
    console.log(`   POST /api/lost/add`);
    console.log(`   PUT  /api/lost/:id/status`);
    console.log(`   DELETE /api/lost/:id`);
    console.log(`   GET  /api/found/all`);
    console.log(`   POST /api/found/add`);
    console.log(`   PUT  /api/found/:id/status`);
    console.log(`   DELETE /api/found/:id`);
    console.log(`\n   RESCUE:`);
    console.log(`   GET  /api/rescue/all`);
    console.log(`   POST /api/rescue/add`);
    console.log(`   PUT  /api/rescue/:id/status`);
    console.log(`   DELETE /api/rescue/:id`);
    console.log(`\n   USERS:`);
    console.log(`   POST /api/users/register`);
    console.log(`   POST /api/users/login`);
    console.log(`   GET  /api/users/all`);
    console.log(`   GET  /api/users/:id`);
    console.log(`   PUT  /api/users/:id`);
    console.log(`   DELETE /api/users/:id`);
    console.log(`\n   STATS:`);
    console.log(`   GET /api/admin/stats\n`);
});