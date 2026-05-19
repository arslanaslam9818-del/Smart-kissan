/**
 * Smart Kissan AI - Full Stack API Client Utility
 * Handles authentication, crop management, irrigation scheduling, and AI chatbot communications.
 * Includes a premium, high-fidelity localStorage fallback engine for offline execution if the Node backend is not active.
 */

const API_BASE = 'http://localhost:3000/api';

// --- Local Storage Database Engine (Fallback) ---
const LocalDB = {
    init() {
        if (!localStorage.getItem('sk_users')) {
            // Seed default user
            localStorage.setItem('sk_users', JSON.stringify([
                {
                    id: 1,
                    fullName: 'Ali Khan',
                    email: 'farmer@example.com',
                    password: 'password123', // Clean password for simple fallback matching
                    phone: '+923000000000',
                    role: 'Farmer'
                }
            ]));
        }
        if (!localStorage.getItem('sk_crops')) {
            // Seed default crops for Ali Khan (userId = 1)
            localStorage.setItem('sk_crops', JSON.stringify([
                {
                    id: 1,
                    userId: 1,
                    name: 'Winter Wheat',
                    field: 'Field A',
                    area: 10,
                    plantedDate: '2025-11-15',
                    expectedHarvest: 'April 2026',
                    status: 'Healthy',
                    progress: 65
                },
                {
                    id: 2,
                    userId: 1,
                    name: 'Bt Cotton',
                    field: 'Field B',
                    area: 15,
                    plantedDate: '2025-05-10',
                    expectedHarvest: 'November 2025',
                    status: 'Needs Attention',
                    progress: 80
                }
            ]));
        }
        if (!localStorage.getItem('sk_irrigation')) {
            // Seed default schedules for Ali Khan (userId = 1)
            localStorage.setItem('sk_irrigation', JSON.stringify([
                {
                    id: 1,
                    userId: 1,
                    field: 'Field A',
                    duration: '4 Hours',
                    scheduledTime: 'Today, 18:00',
                    status: 'Pending'
                },
                {
                    id: 2,
                    userId: 1,
                    field: 'Field C',
                    duration: '6 Hours',
                    scheduledTime: 'Tomorrow, 05:00',
                    status: 'Scheduled (AI)'
                }
            ]));
        }
    },

    getUsers() { return JSON.parse(localStorage.getItem('sk_users') || '[]'); },
    getOrCreateUser(email, fullName, password, phone, role) {
        const users = this.getUsers();
        if (users.find(u => u.email === email)) return null;
        const newUser = { id: Date.now(), fullName, email, password, phone, role };
        users.push(newUser);
        localStorage.setItem('sk_users', JSON.stringify(users));
        return newUser;
    },
    verifyUser(email, password) {
        const users = this.getUsers();
        return users.find(u => u.email === email && u.password === password) || null;
    },
    getCrops(userId) {
        const crops = JSON.parse(localStorage.getItem('sk_crops') || '[]');
        return crops.filter(c => c.userId === userId);
    },
    addCrop(userId, cropData) {
        const crops = JSON.parse(localStorage.getItem('sk_crops') || '[]');
        const newCrop = {
            id: Date.now(),
            userId: userId,
            name: cropData.name,
            field: cropData.field,
            area: parseFloat(cropData.area) || 0,
            plantedDate: cropData.plantedDate || new Date().toISOString().split('T')[0],
            expectedHarvest: cropData.expectedHarvest || 'TBD',
            status: 'Healthy',
            progress: 0
        };
        crops.push(newCrop);
        localStorage.setItem('sk_crops', JSON.stringify(crops));
        return newCrop;
    },
    updateCrop(userId, cropId, progress, status) {
        const crops = JSON.parse(localStorage.getItem('sk_crops') || '[]');
        const index = crops.findIndex(c => c.id === parseInt(cropId) && c.userId === userId);
        if (index !== -1) {
            crops[index].progress = parseInt(progress);
            if (status) crops[index].status = status;
            localStorage.setItem('sk_crops', JSON.stringify(crops));
            return true;
        }
        return false;
    },
    deleteCrop(userId, cropId) {
        let crops = JSON.parse(localStorage.getItem('sk_crops') || '[]');
        const initialLen = crops.length;
        crops = crops.filter(c => !(c.id === parseInt(cropId) && c.userId === userId));
        localStorage.setItem('sk_crops', JSON.stringify(crops));
        return crops.length < initialLen;
    },
    getIrrigation(userId) {
        const schedules = JSON.parse(localStorage.getItem('sk_irrigation') || '[]');
        return schedules.filter(s => s.userId === userId);
    },
    addIrrigation(userId, schedData) {
        const schedules = JSON.parse(localStorage.getItem('sk_irrigation') || '[]');
        const newSched = {
            id: Date.now(),
            userId: userId,
            field: schedData.field,
            duration: schedData.duration || '2 Hours',
            scheduledTime: schedData.scheduledTime || 'Scheduled',
            status: schedData.status || 'Pending'
        };
        schedules.push(newSched);
        localStorage.setItem('sk_irrigation', JSON.stringify(schedules));
        return newSched;
    }
};

// Initialize LocalDB
LocalDB.init();

// --- Main API Wrapper ---
const API = {
    // Check if offline/server unreachable fallback should trigger
    async isOnline() {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 1500); // 1.5s timeout
            const res = await fetch(`${API_BASE}`, { signal: controller.signal });
            clearTimeout(timeoutId);
            return res.ok;
        } catch (e) {
            return false;
        }
    },

    getToken() {
        return localStorage.getItem('sk_token');
    },

    setSession(token, user) {
        localStorage.setItem('sk_token', token);
        localStorage.setItem('sk_user', JSON.stringify(user));
    },

    logout() {
        localStorage.removeItem('sk_token');
        localStorage.removeItem('sk_user');
        window.location.href = window.location.pathname.includes('dashboard') ? '../login.html' : 'login.html';
    },

    getUserSession() {
        const userStr = localStorage.getItem('sk_user');
        if (!userStr) return null;
        try {
            return JSON.parse(userStr);
        } catch (e) {
            return null;
        }
    },

    async request(method, endpoint, body = null) {
        const token = this.getToken();
        const headers = {
            'Content-Type': 'application/json'
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const options = { method, headers };
        if (body) {
            options.body = JSON.stringify(body);
        }

        const online = await this.isOnline();
        if (online) {
            try {
                const res = await fetch(`${API_BASE}${endpoint}`, options);
                if (res.status === 401 || res.status === 403) {
                    // Auth issues, clear session
                    localStorage.removeItem('sk_token');
                    localStorage.removeItem('sk_user');
                }
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || 'Server error occurred');
                return data;
            } catch (err) {
                console.warn('Real API failed, switching to local DB state:', err.message);
                return this.handleFallback(method, endpoint, body);
            }
        } else {
            return this.handleFallback(method, endpoint, body);
        }
    },

    // High fidelity fallback implementation
    handleFallback(method, endpoint, body) {
        console.log(`[API Fallback] ${method} ${endpoint}`, body);
        const sessionUser = this.getUserSession();
        const userId = sessionUser ? sessionUser.id : 1;

        // --- AUTH ---
        if (endpoint === '/auth/register' && method === 'POST') {
            const { fullName, email, password, phone, role } = body;
            const user = LocalDB.getOrCreateUser(email, fullName, password, phone, role || 'Farmer');
            if (!user) throw new Error('Email already exists');
            
            // Issue dummy token
            const mockToken = 'mock_jwt_token_' + Date.now();
            this.setSession(mockToken, user);
            return { message: 'User registered successfully', token: mockToken, user };
        }

        if (endpoint === '/auth/login' && method === 'POST') {
            const { email, password } = body;
            const user = LocalDB.verifyUser(email, password);
            if (!user) throw new Error('Invalid email or password credentials');
            
            const mockToken = 'mock_jwt_token_' + Date.now();
            this.setSession(mockToken, user);
            return { message: 'Login successful', token: mockToken, user };
        }

        if (endpoint === '/auth/me' && method === 'GET') {
            if (!sessionUser) throw new Error('Unauthorized');
            return sessionUser;
        }

        // --- CROPS ---
        if (endpoint === '/crops' && method === 'GET') {
            if (!sessionUser) throw new Error('Unauthorized');
            return LocalDB.getCrops(userId);
        }

        if (endpoint === '/crops' && method === 'POST') {
            if (!sessionUser) throw new Error('Unauthorized');
            const newCrop = LocalDB.addCrop(userId, body);
            return { message: 'Crop added successfully', id: newCrop.id };
        }

        if (endpoint.startsWith('/crops/') && method === 'PUT') {
            if (!sessionUser) throw new Error('Unauthorized');
            const cropId = endpoint.split('/')[2];
            const success = LocalDB.updateCrop(userId, cropId, body.progress, body.status);
            if (!success) throw new Error('Crop not found or unauthorized');
            return { message: 'Crop updated successfully' };
        }

        if (endpoint.startsWith('/crops/') && method === 'DELETE') {
            if (!sessionUser) throw new Error('Unauthorized');
            const cropId = endpoint.split('/')[2];
            const success = LocalDB.deleteCrop(userId, cropId);
            if (!success) throw new Error('Crop not found or unauthorized');
            return { message: 'Crop deleted successfully' };
        }

        // --- IRRIGATION ---
        if (endpoint === '/irrigation' && method === 'GET') {
            if (!sessionUser) throw new Error('Unauthorized');
            return LocalDB.getIrrigation(userId);
        }

        if (endpoint === '/irrigation' && method === 'POST') {
            if (!sessionUser) throw new Error('Unauthorized');
            const newSched = LocalDB.addIrrigation(userId, body);
            return { message: 'Schedule added successfully', id: newSched.id };
        }

        // --- CHATBOT ---
        if (endpoint === '/chat' && method === 'POST') {
            const { message } = body;
            const query = message.toLowerCase();
            let reply = "";

            if (query.includes('wheat') || query.includes('gandum') || query.includes('urea') || query.includes('dap')) {
                reply = "For your Wheat crop, apply 1 bag of Urea per acre with your first watering (20-25 days). Make sure to spray Tilt if yellow rust spots appear on leaves due to morning humidity.";
            } else if (query.includes('cotton') || query.includes('kapas') || query.includes('pest') || query.includes('whitefly')) {
                reply = "Bt Cotton requires active scouting. For Whiteflies, treat with Pyriproxyfen or Acetamiprid if counts exceed 5 insects per leaf. Keep soil moisture optimal during flowering to prevent boll drop.";
            } else if (query.includes('water') || query.includes('irrigate') || query.includes('irrigation') || query.includes('paani')) {
                reply = "Smart Irrigation advises delay if rain is forecasted. Wheat requires critical watering at Crown Root Initiation (21 days) and Flowering (85 days). Alternating furrow irrigation saves up to 35% water!";
            } else if (query.includes('disease') || query.includes('sick') || query.includes('yellow') || query.includes('leaves') || query.includes('spots')) {
                reply = "Leaf yellowing can indicate rust disease or nitrogen deficiency. For leaf spots, try spraying a general-purpose copper fungicide. Check the 'Disease Detection' module to snap a pic!";
            } else if (query.includes('price') || query.includes('rate') || query.includes('mandi') || query.includes('punjab')) {
                reply = "Current Punjab Wheat support price is ₨ 3,900 per 40kg. Local private grain buyers are trading at ₨ 4,100. Fertilizer prices: Urea is roughly ₨ 4,600/bag and DAP is around ₨ 12,000/bag.";
            } else {
                reply = "Assalamu Alaikum! As your AI Agronomist, I'm here to maximize your harvest. Mention 'Wheat', 'Cotton', 'Irrigation' or 'Diseases' to get specialized local recommendations for your fields!";
            }

            return {
                message: reply,
                sender: 'ai',
                timestamp: new Date().toISOString()
            };
        }

        throw new Error('Endpoint not implemented');
    }
};

// Expose API globally
window.API = API;
