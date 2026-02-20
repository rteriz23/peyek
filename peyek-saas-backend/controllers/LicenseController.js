import crypto from 'crypto';

/**
 * Mock Database for Licenses
 * In production, this would be PostgreSQL/MongoDB.
 */
const Database = {
    licenses: new Map() // Key: LicenseToken, Value: { tier: 'pro', active: true, owner: 'user@email.com' }
};

export class LicenseController {

    /**
     * Generates a new premium license key
     */
    static generate(req, res) {
        const { email, tier } = req.body;

        if (!email) {
            return res.status(400).json({ error: 'Email is required to generate license.' });
        }

        // Generate a secure random token format: PYK-XXXXXXXXXX
        const randomHex = crypto.randomBytes(5).toString('hex').toUpperCase();
        const licenseKey = `PYK-${randomHex}`;

        Database.licenses.set(licenseKey, {
            owner: email,
            tier: tier || 'pro',
            active: true,
            issuedAt: new Date().toISOString()
        });

        return res.json({
            message: 'License generated successfully',
            licenseKey,
            details: Database.licenses.get(licenseKey)
        });
    }

    /**
     * Verifies if an SDK license key is valid
     * Called by the P.E.Y.E.K core SDK running on client browsers
     */
    static verify(req, res) {
        const { licenseKey, origin } = req.body;

        if (!licenseKey) {
            return res.status(400).json({ valid: false, error: 'License key is missing.' });
        }

        const license = Database.licenses.get(licenseKey);

        if (!license) {
            return res.status(404).json({ valid: false, error: 'Invalid license key.' });
        }

        if (!license.active) {
            return res.status(403).json({ valid: false, error: 'License is inactive or revoked.' });
        }

        // In a real SaaS, we would also verify if 'origin' (the domain requesting) matches allowed domains

        return res.json({
            valid: true,
            tier: license.tier,
            message: 'License is valid.'
        });
    }
}
