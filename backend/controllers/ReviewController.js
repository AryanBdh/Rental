import mongoose from 'mongoose';
import Review from '../model/Review.js';
import Item from '../model/Item.js';

class ReviewController {
  async create(req, res) {
    try {
      const { itemId, rating, description } = req.body;
      if (!itemId || !rating) {
        return res.json({ status: false, message: 'Missing fields' });
      }

      const review = new Review({
        reviewId: new mongoose.Types.ObjectId().toString(),
        renter: req.user.id,
        item: itemId,
        rating,
        description,
      });

      await review.save();
      await Item.findByIdAndUpdate(itemId, { $push: { reviews: review._id } });

      return res.json({ status: true, review });
    } catch (e) {
      return res.json({ status: false, message: e.message });
    }
  }

  async getByItem(req, res) {
    try {
      const { itemId } = req.params;
      const reviews = await Review.find({ item: itemId }).populate('renter', 'name image');
      return res.json({ status: true, reviews });
    } catch (e) {
      return res.json({ status: false, message: e.message });
    }
  }

  async remove(req, res) {
    try {
      const { id } = req.params;
      const review = await Review.findById(id);
      if (!review) return res.json({ status: false, message: 'Review not found' });

      const isOwner = review.renter.toString() === req.user.id;
      const isAdmin = Array.isArray(req.user.role) ? req.user.role.includes('admin') : false;
      if (!isOwner && !isAdmin) {
        return res.json({ status: false, message: 'Not authorized' });
      }

      await Review.findByIdAndDelete(id);
      await Item.findByIdAndUpdate(review.item, { $pull: { reviews: review._id } });

      return res.json({ status: true, message: 'Review deleted' });
    } catch (e) {
      return res.json({ status: false, message: e.message });
    }
  }
}

export default new ReviewController();
