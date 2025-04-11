import React, { useState } from 'react';

const Comments = ({ postId, comments = [], onAddComment, User }) => {
  const [commentText, setCommentText] = useState('');

  const handleAddComment = () => {
    if (!commentText.trim()) return;
    const newComment = {
      text: commentText,
      commenter: User.name,
      commenterId: User.id
    };
    onAddComment(postId, newComment);
    setCommentText('');
  };

  return (
    <div className="comment-box">
      <h3 className="comment-title">Comments</h3>

      <div className="comment-list">
        {comments.length === 0 ? (
          <p className="comment-empty">No comments yet.</p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="comment-item">
              <p className="comment-text">
                <span className="comment-author">{comment.commenter}:</span> {comment.text}
              </p>
            </div>

          ))
        )}
      </div>

      <div className="comment-input-section">
        <input
          type="text"
          className="comment-input"
          placeholder="Write a comment..."
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
        />
        <button className="comment-button" onClick={handleAddComment}>
          Comment
        </button>
      </div>
    </div>
  );
};

export default Comments;
