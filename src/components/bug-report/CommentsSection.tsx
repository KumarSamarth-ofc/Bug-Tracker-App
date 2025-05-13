import { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { useBugReports } from '../../context/BugReportContext';
import { useAuth } from '../../context/AuthContext';
import { Send, Trash2, User } from 'lucide-react';

interface Comment {
  _id: string;
  text: string;
  user: {
    _id: string;
    name: string;
    email: string;
    role: string;
  };
  createdAt: string;
}

interface CommentsSectionProps {
  bugReportId: string;
}

const CommentsSection = ({ bugReportId }: CommentsSectionProps) => {
  const { getCommentsByBugReportId, addComment, deleteComment } = useBugReports();
  const { user } = useAuth();
  
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadComments();
  }, [bugReportId]);

  const loadComments = async () => {
    setLoading(true);
    const comments = await getCommentsByBugReportId(bugReportId);
    setComments(comments);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newComment.trim()) return;
    
    setLoading(true);
    const comment = await addComment(bugReportId, newComment);
    
    if (comment) {
      setComments([comment, ...comments]);
      setNewComment('');
    }
    
    setLoading(false);
  };

  const handleDelete = async (commentId: string) => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      setLoading(true);
      const success = await deleteComment(commentId);
      
      if (success) {
        setComments(comments.filter(comment => comment._id !== commentId));
      }
      
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 mt-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Team Comments</h3>
      
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="flex items-start space-x-2">
          <div className="flex-shrink-0 bg-gray-200 rounded-full p-2">
            <User className="h-5 w-5 text-gray-500" />
          </div>
          <div className="flex-grow">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment... (only visible to team members)"
              className="form-input resize-none"
              rows={3}
              required
            ></textarea>
            <div className="flex justify-end mt-2">
              <button
                type="submit"
                disabled={loading || !newComment.trim()}
                className="btn btn-primary flex items-center"
              >
                <Send className="h-4 w-4 mr-1" /> Add Comment
              </button>
            </div>
          </div>
        </div>
      </form>
      
      {loading && comments.length === 0 ? (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : comments.length === 0 ? (
        <p className="text-gray-500 text-center py-4">No comments yet. Be the first to comment!</p>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment._id} className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-2">
                  <div className="flex-shrink-0 bg-blue-100 rounded-full p-2">
                    <User className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{comment.user.name}</div>
                    <div className="text-sm text-gray-500 capitalize">{comment.user.role}</div>
                  </div>
                </div>
                <div className="text-xs text-gray-500">
                  {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                </div>
              </div>
              <div className="mt-2 text-gray-700">{comment.text}</div>
              {user?.id === comment.user._id && (
                <div className="mt-2 flex justify-end">
                  <button
                    onClick={() => handleDelete(comment._id)}
                    className="text-red-500 hover:text-red-700 flex items-center text-sm"
                  >
                    <Trash2 className="h-3 w-3 mr-1" /> Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentsSection;