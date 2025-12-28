import express from 'express';

const router = express.Router();

router.use((req, res) => {
	res.status(404).json({ status: false, message: 'Payments feature removed' });
});

export default router;
