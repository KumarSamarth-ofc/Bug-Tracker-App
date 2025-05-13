import express from 'express';
import { check, validationResult } from 'express-validator';
import Comment from '../models/Comment.js';
import BugReport from '../models/BugReport.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// @route    POST api/comments
// @desc     Add a comment to a bug report
// @access   Private
router.post(
  '/',
  [
    auth,
    [
      check('bugReport', 'Bug report ID is required').not().isEmpty(),
      check('text', 'Text is required').not().isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { bugReport, text } = req.body;

      // Check if bug report exists
      const bugReportExists = await BugReport.findById(bugReport);
      if (!bugReportExists) {
        return res.status(404).json({ msg: 'Bug report not found' });
      }

      // Create new comment
      const newComment = new Comment({
        bugReport,
        user: req.user.id,
        text
      });

      const comment = await newComment.save();
      
      // Populate user information
      await comment.populate('user', ['name', 'email', 'role']);
      
      res.json(comment);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route    GET api/comments/bug-report/:bugReportId
// @desc     Get comments for a bug report
// @access   Private
router.get('/bug-report/:bugReportId', auth, async (req, res) => {
  try {
    const comments = await Comment.find({ bugReport: req.params.bugReportId })
      .populate('user', ['name', 'email', 'role'])
      .sort({ createdAt: -1 });
    
    res.json(comments);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route    DELETE api/comments/:id
// @desc     Delete a comment
// @access   Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    
    if (!comment) {
      return res.status(404).json({ msg: 'Comment not found' });
    }

    // Check if user owns the comment
    if (comment.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    await comment.deleteOne();
    
    res.json({ msg: 'Comment removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Comment not found' });
    }
    res.status(500).send('Server Error');
  }
});

export default router;