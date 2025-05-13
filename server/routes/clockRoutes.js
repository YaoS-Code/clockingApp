// Correction request routes
router.post('/records/:id/correction', authMiddleware, clockController.requestCorrection);
router.get('/correction-requests', authMiddleware, clockController.getUserCorrectionRequests); 