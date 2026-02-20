import express from 'express';
import cors from 'cors';
import { LicenseController } from './controllers/LicenseController.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', service: 'peyek-saas-backend' });
});

app.post('/api/license/generate', LicenseController.generate);
app.post('/api/license/verify', LicenseController.verify);

// Start Server
app.listen(PORT, () => {
    console.log(`[P.E.Y.E.K SaaS] Backend running on http://localhost:${PORT}`);
});
