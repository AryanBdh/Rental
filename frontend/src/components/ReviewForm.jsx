import { useState } from 'react';
import toast from 'react-hot-toast';
import API_BASE_URL from '../config/api';

const ReviewForm = ({ itemId, onSaved }) => {
  const [rating, setRating] = useState(5);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_BASE_URL}/api/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ itemId, rating, description }),
      });
      const data = await res.json();
      if (!res.ok || !data.status) throw new Error(data.message || 'Failed to save review');
      toast.success('Review submitted');
      setRating(5);
      setDescription('');
      onSaved && onSaved(data.review);
    } catch (err) {
      toast.error(err.message || 'Error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="block text-sm">Rating</label>
        <select value={rating} onChange={(e) => setRating(Number(e.target.value))} className="mt-1 p-2 border rounded">
          {[5,4,3,2,1].map((r) => (
            <option key={r} value={r}>{r} star{r>1?'s':''}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm">Review</label>
        <textarea value={description} onChange={(e)=>setDescription(e.target.value)} className="mt-1 w-full p-2 border rounded" rows={4} />
      </div>

      <button type="submit" disabled={loading} className="px-4 py-2 bg-[#d4af37] text-white rounded">
        {loading ? 'Saving...' : 'Submit Review'}
      </button>
    </form>
  );
};

export default ReviewForm;
