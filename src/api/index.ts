import { Service, Request, Response } from '@liquidmetal/raindrop';

// ============================================================================
// Interfaces
// ============================================================================

interface CreateJobRequest {
    description: string;
    photo_keys: string[];
    user_id?: string;
}

interface CancelJobRequest {
    reason: string;
    userId: string;
}

interface CreateQuoteRequest {
    jobId: number;
    contractorId: string;
    contractorName: string;
    contractorEmail: string;
    description: string;
    estimatedCost: number;
    materialsCost: number;
    laborCost: number;
    otherCosts: number;
    timelineDays: number;
    timelineDescription: string;
    guarantees: string;
    paymentTerms: string;
    photoKeys: string[];
}

interface CancelQuoteRequest {
    reason: string;
    contractorId: string;
}

interface AIResponse {
    aiEstimate: number;
}

export default class ApiService extends Service {

    // ============================================================================
    // Job Endpoints
    // ============================================================================

    // POST /jobs/create
    async createJob(req: Request, res: Response) {
        try {
            const { description, photo_keys, user_id } = req.body as CreateJobRequest;

            if (!description) {
                return res.status(400).json({ error: 'Description is required' });
            }

            // 1. Call Vultr AI Engine
            const vultrUrl = process.env.VULTR_API_URL || 'http://localhost:8080/predict';
            console.log(`Calling AI Engine at ${vultrUrl}...`);

            let aiEstimate = 0;
            try {
                const aiResponse = await fetch(vultrUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ description, category: 'General' })
                });

                if (aiResponse.ok) {
                    const data = await aiResponse.json() as AIResponse;
                    aiEstimate = data.aiEstimate;
                } else {
                    console.error('AI Engine error:', await aiResponse.text());
                    aiEstimate = 0;
                }
            } catch (error) {
                console.error('Failed to reach AI Engine:', error);
            }

            // 2. Save to SmartSQL
            const db = this.database('main');
            const result = await db.query(
                `INSERT INTO jobs (description, status, ai_estimate, photo_keys, user_id, created_at) 
         VALUES (?, ?, ?, ?, ?, datetime('now', 'localtime')) 
         RETURNING job_id`,
                [description, 'published', aiEstimate, JSON.stringify(photo_keys), user_id || 'anonymous']
            );

            const jobId = result.rows[0].job_id;

            // 3. Return result
            return res.json({
                job_id: jobId,
                aiEstimate: aiEstimate,
                status: 'published'
            });

        } catch (error) {
            console.error('Error creating job:', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    // GET /jobs/:jobId
    async getJob(req: Request, res: Response) {
        try {
            const { jobId } = req.params;
            const db = this.database('main');

            const result = await db.query(
                'SELECT * FROM jobs WHERE job_id = ?',
                [jobId]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Job not found' });
            }

            return res.json(result.rows[0]);
        } catch (error) {
            console.error('Error getting job:', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    // POST /jobs/:jobId/cancel
    async cancelJob(req: Request, res: Response) {
        try {
            const { jobId } = req.params;
            const { reason, userId } = req.body as CancelJobRequest;

            if (!reason) {
                return res.status(400).json({ error: 'Cancellation reason is required' });
            }

            const db = this.database('main');

            // 1. Verify job exists and user has permission
            const jobResult = await db.query(
                'SELECT * FROM jobs WHERE job_id = ?',
                [jobId]
            );

            if (jobResult.rows.length === 0) {
                return res.status(404).json({ error: 'Job not found' });
            }

            const job = jobResult.rows[0];

            // Check if already cancelled
            if (job.status === 'cancelled') {
                return res.status(400).json({ error: 'Job is already cancelled' });
            }

            // 2. Update job status to cancelled
            await db.query(
                `UPDATE jobs 
         SET status = 'cancelled', 
             cancelled_at = datetime('now', 'localtime'), 
             cancellation_reason = ?, 
             cancelled_by = ?,
             updated_at = datetime('now', 'localtime')
         WHERE job_id = ?`,
                [reason, userId, jobId]
            );

            // 3. Get all contractors with active quotes for this job
            const quotesResult = await db.query(
                'SELECT contractor_id, contractor_name FROM quotes WHERE job_id = ? AND status = ?',
                [jobId, 'active']
            );

            // 4. Create notifications for all contractors
            for (const quote of quotesResult.rows) {
                await db.query(
                    `INSERT INTO notifications (user_id, type, title, message, related_id, related_type, created_at)
           VALUES (?, ?, ?, ?, ?, ?, datetime('now', 'localtime'))`,
                    [
                        quote.contractor_id,
                        'job_cancelled',
                        'Trabajo Cancelado',
                        `El trabajo #${jobId} ha sido cancelado por el cliente. Razón: ${reason}`,
                        jobId,
                        'job'
                    ]
                );
            }

            return res.json({
                success: true,
                message: 'Job cancelled successfully',
                jobId: jobId
            });

        } catch (error) {
            console.error('Error cancelling job:', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    // ============================================================================
    // Quote/Levantamiento Endpoints
    // ============================================================================

    // POST /quotes/create
    async createQuote(req: Request, res: Response) {
        try {
            const quoteData = req.body as CreateQuoteRequest;

            if (!quoteData.jobId || !quoteData.contractorId) {
                return res.status(400).json({ error: 'Job ID and Contractor ID are required' });
            }

            const db = this.database('main');

            // 1. Verify job exists and is not cancelled
            const jobResult = await db.query(
                'SELECT * FROM jobs WHERE job_id = ?',
                [quoteData.jobId]
            );

            if (jobResult.rows.length === 0) {
                return res.status(404).json({ error: 'Job not found' });
            }

            if (jobResult.rows[0].status === 'cancelled') {
                return res.status(400).json({ error: 'Cannot create quote for cancelled job' });
            }

            // 2. Create quote
            const result = await db.query(
                `INSERT INTO quotes (
          job_id, contractor_id, contractor_name, contractor_email,
          description, estimated_cost, materials_cost, labor_cost, other_costs,
          timeline_days, timeline_description, guarantees, payment_terms,
          photo_keys, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now', 'localtime'))
        RETURNING quote_id`,
                [
                    quoteData.jobId,
                    quoteData.contractorId,
                    quoteData.contractorName,
                    quoteData.contractorEmail,
                    quoteData.description,
                    quoteData.estimatedCost,
                    quoteData.materialsCost,
                    quoteData.laborCost,
                    quoteData.otherCosts,
                    quoteData.timelineDays,
                    quoteData.timelineDescription,
                    quoteData.guarantees,
                    quoteData.paymentTerms,
                    JSON.stringify(quoteData.photoKeys)
                ]
            );

            const quoteId = result.rows[0].quote_id;

            // 3. Create notification for job owner
            const job = jobResult.rows[0];
            if (job.user_id) {
                await db.query(
                    `INSERT INTO notifications (user_id, type, title, message, related_id, related_type, created_at)
           VALUES (?, ?, ?, ?, ?, ?, datetime('now', 'localtime'))`,
                    [
                        job.user_id,
                        'quote_received',
                        'Nueva Cotización Recibida',
                        `${quoteData.contractorName} ha enviado una cotización para tu trabajo #${quoteData.jobId}`,
                        quoteId,
                        'quote'
                    ]
                );
            }

            return res.json({
                success: true,
                quoteId: quoteId,
                message: 'Quote created successfully'
            });

        } catch (error) {
            console.error('Error creating quote:', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    // GET /quotes/:quoteId
    async getQuote(req: Request, res: Response) {
        try {
            const { quoteId } = req.params;
            const db = this.database('main');

            const result = await db.query(
                'SELECT * FROM quotes WHERE quote_id = ?',
                [quoteId]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Quote not found' });
            }

            return res.json(result.rows[0]);
        } catch (error) {
            console.error('Error getting quote:', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    // GET /quotes/job/:jobId
    async getQuotesByJob(req: Request, res: Response) {
        try {
            const { jobId } = req.params;
            const db = this.database('main');

            const result = await db.query(
                'SELECT * FROM quotes WHERE job_id = ? ORDER BY created_at DESC',
                [jobId]
            );

            return res.json(result.rows);
        } catch (error) {
            console.error('Error getting quotes:', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    // GET /quotes/contractor/:contractorId
    async getQuotesByContractor(req: Request, res: Response) {
        try {
            const { contractorId } = req.params;
            const db = this.database('main');

            const result = await db.query(
                'SELECT * FROM quotes WHERE contractor_id = ? ORDER BY created_at DESC',
                [contractorId]
            );

            return res.json(result.rows);
        } catch (error) {
            console.error('Error getting quotes:', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    // POST /quotes/:quoteId/cancel
    async cancelQuote(req: Request, res: Response) {
        try {
            const { quoteId } = req.params;
            const { reason, contractorId } = req.body as CancelQuoteRequest;

            if (!reason) {
                return res.status(400).json({ error: 'Cancellation reason is required' });
            }

            const db = this.database('main');

            // 1. Verify quote exists and contractor has permission
            const quoteResult = await db.query(
                'SELECT * FROM quotes WHERE quote_id = ?',
                [quoteId]
            );

            if (quoteResult.rows.length === 0) {
                return res.status(404).json({ error: 'Quote not found' });
            }

            const quote = quoteResult.rows[0];

            // Verify contractor owns this quote
            if (quote.contractor_id !== contractorId) {
                return res.status(403).json({ error: 'Unauthorized: You can only cancel your own quotes' });
            }

            // Check if already cancelled
            if (quote.status === 'cancelled') {
                return res.status(400).json({ error: 'Quote is already cancelled' });
            }

            // 2. Update quote status to cancelled
            await db.query(
                `UPDATE quotes 
         SET status = 'cancelled', 
             cancelled_at = datetime('now', 'localtime'), 
             cancellation_reason = ?,
             updated_at = datetime('now', 'localtime')
         WHERE quote_id = ?`,
                [reason, quoteId]
            );

            // 3. Revert job status to 'published' so other contractors can take it
            await db.query(
                `UPDATE jobs 
         SET status = 'published',
             updated_at = datetime('now', 'localtime')
         WHERE job_id = ?`,
                [quote.job_id]
            );

            // 4. Get job details for notification
            const jobResult = await db.query(
                'SELECT * FROM jobs WHERE job_id = ?',
                [quote.job_id]
            );

            // 5. Create notification for job owner (client)
            if (jobResult.rows.length > 0 && jobResult.rows[0].user_id) {
                await db.query(
                    `INSERT INTO notifications (user_id, type, title, message, related_id, related_type, created_at)
           VALUES (?, ?, ?, ?, ?, ?, datetime('now', 'localtime'))`,
                    [
                        jobResult.rows[0].user_id,
                        'quote_cancelled',
                        'Cotización Cancelada',
                        `${quote.contractor_name} ha cancelado su cotización para el trabajo #${quote.job_id}. Razón: ${reason}. El trabajo está nuevamente disponible en el marketplace.`,
                        quoteId,
                        'quote'
                    ]
                );
            }

            return res.json({
                success: true,
                message: 'Quote cancelled successfully. Job is now available in marketplace.',
                quoteId: quoteId,
                jobId: quote.job_id
            });

        } catch (error) {
            console.error('Error cancelling quote:', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    // ============================================================================
    // Notification Endpoints
    // ============================================================================

    // GET /notifications/:userId
    async getNotifications(req: Request, res: Response) {
        try {
            const { userId } = req.params;
            const db = this.database('main');

            const result = await db.query(
                'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50',
                [userId]
            );

            return res.json(result.rows);
        } catch (error) {
            console.error('Error getting notifications:', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    // GET /notifications/:userId/unread-count
    async getUnreadNotificationsCount(req: Request, res: Response) {
        try {
            const { userId } = req.params;
            const db = this.database('main');

            const result = await db.query(
                'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND read_status = 0',
                [userId]
            );

            return res.json({ count: result.rows[0].count });
        } catch (error) {
            console.error('Error getting unread count:', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    // PUT /notifications/:notificationId/read
    async markNotificationAsRead(req: Request, res: Response) {
        try {
            const { notificationId } = req.params;
            const db = this.database('main');

            await db.query(
                'UPDATE notifications SET read_status = 1 WHERE notification_id = ?',
                [notificationId]
            );

            return res.json({ success: true });
        } catch (error) {
            console.error('Error marking notification as read:', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    // PUT /notifications/:userId/read-all
    async markAllNotificationsAsRead(req: Request, res: Response) {
        try {
            const { userId } = req.params;
            const db = this.database('main');

            await db.query(
                'UPDATE notifications SET read_status = 1 WHERE user_id = ?',
                [userId]
            );

            return res.json({ success: true });
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    }
}
