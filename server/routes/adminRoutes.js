// Correction request management routes
router.get('/correction-requests', authMiddleware, adminMiddleware, adminController.getAllCorrectionRequests);
router.get('/correction-requests/count', authMiddleware, adminMiddleware, adminController.getPendingCorrectionRequestsCount);
router.put('/correction-requests/:id/approve', authMiddleware, adminMiddleware, adminController.approveCorrection);
router.put('/correction-requests/:id/reject', authMiddleware, adminMiddleware, adminController.rejectCorrection); 