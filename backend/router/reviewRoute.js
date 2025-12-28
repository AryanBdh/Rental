import express from 'express';
import ReviewController from '../controllers/ReviewController.js';
import RouteMiddleware from '../middleware/RouteMiddleware.js';

const router = express.Router();
const auth = new RouteMiddleware();

router.post('/', auth.check, ReviewController.create);
router.get('/item/:itemId', ReviewController.getByItem);
router.delete('/:id', auth.check, ReviewController.remove);

export default router;
