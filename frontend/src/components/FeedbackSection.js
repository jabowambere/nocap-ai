import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, ThumbsUp, Loader2 } from 'lucide-react';
import { useUser } from '@clerk/clerk-react';

const API_URL = (process.env.REACT_APP_API_URL || 'http://localhost:3001').replace(/\/+$/, '');

const FeedbackSection = () => {
  const { user, isSignedIn } = useUser();
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [feedbacks, setFeedbacks] = useState([]);
  const [loadingFeedbacks, setLoadingFeedbacks] = useState(true);

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const fetchFeedbacks = async () => {
    try {
      const res = await fetch(`${API_URL}/api/feedback`);
      if (res.ok) setFeedbacks(await res.json());
    } catch (err) {
      console.error('Failed to fetch feedbacks:', err);
    } finally {
      setLoadingFeedbacks(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          comment: comment.trim(),
          rating: rating || null,
          name: isSignedIn ? (user?.firstName || user?.primaryEmailAddress?.emailAddress) : 'Anonymous',
          user_id: isSignedIn ? user?.id : null
        })
      });
      if (res.ok) {
        setSubmitted(true);
        setComment('');
        setRating(0);
        fetchFeedbacks();
      }
    } catch (err) {
      console.error('Failed to submit feedback:', err);
    } finally {
      setLoading(false);
    }
  };

  const stars = [1, 2, 3, 4, 5];

  return (
    <div className="max-w-6xl mx-auto px-4 py-16">
      <div className="border-t border-slate-200/70 dark:border-slate-800 pt-16">

        {/* Header */}
        <div className="mb-10">
          <p className="text-xs uppercase tracking-widest text-slate-500 dark:text-slate-400">Feedback</p>
          <h2 className="mt-2 text-3xl sm:text-4xl font-semibold text-slate-900 dark:text-slate-50">
            What do you think?
          </h2>
          <p className="mt-3 text-slate-600 dark:text-slate-300 max-w-xl">
            Drop a comment or suggestion — we read every single one.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

          {/* Form */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
            {submitted ? (
              <div className="flex flex-col items-center justify-center py-10 gap-4 text-center">
                <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                  <ThumbsUp className="text-emerald-600 dark:text-emerald-400" size={24} />
                </div>
                <p className="text-lg font-semibold text-slate-900 dark:text-slate-50">Thanks for your feedback!</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Your comment helps us improve NoCap AI.</p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-2 text-sm underline underline-offset-2 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
                >
                  Submit another
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Star Rating */}
                <div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Rate your experience</p>
                  <div className="flex gap-1">
                    {stars.map(star => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="text-2xl transition-transform hover:scale-110"
                      >
                        <span className={(hoverRating || rating) >= star ? 'text-yellow-400' : 'text-slate-300 dark:text-slate-600'}>
                          ★
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Comment */}
                <div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Your comment or suggestion</p>
                  <textarea
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    placeholder="Tell us what you think, what's missing, or what we can improve..."
                    rows={5}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-50 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 resize-none text-sm"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || !comment.trim()}
                  className="w-full flex items-center justify-center gap-2 py-3 px-6 bg-slate-900 dark:bg-slate-50 text-white dark:text-slate-900 rounded-xl font-semibold text-sm hover:bg-slate-700 dark:hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                  {loading ? 'Submitting...' : 'Submit Feedback'}
                </button>

                <p className="text-xs text-slate-400 dark:text-slate-500 text-center">
                  {isSignedIn ? `Submitting as ${user?.firstName || user?.primaryEmailAddress?.emailAddress}` : 'Submitting anonymously'}
                </p>
              </form>
            )}
          </div>

          {/* Recent Feedbacks */}
          <div className="space-y-4">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Recent comments</p>
            {loadingFeedbacks ? (
              <div className="flex justify-center py-10">
                <Loader2 className="animate-spin text-slate-400" size={24} />
              </div>
            ) : feedbacks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 gap-2 text-slate-400">
                <MessageSquare size={32} />
                <p className="text-sm">No comments yet — be the first!</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                {feedbacks.map(fb => (
                  <div key={fb.id} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-semibold text-slate-600 dark:text-slate-300">
                          {fb.name?.[0]?.toUpperCase() || 'A'}
                        </div>
                        <span className="text-sm font-medium text-slate-800 dark:text-slate-200">{fb.name || 'Anonymous'}</span>
                      </div>
                      {fb.rating && (
                        <span className="text-xs text-yellow-500">{'★'.repeat(fb.rating)}{'☆'.repeat(5 - fb.rating)}</span>
                      )}
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{fb.comment}</p>
                    <p className="text-xs text-slate-400 mt-2">{new Date(fb.created_at).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedbackSection;
