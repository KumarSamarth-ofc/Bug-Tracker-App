import express from 'express';
import { check, validationResult } from 'express-validator';
import BugReport from '../models/BugReport.js';
import User from '../models/User.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// @route    POST api/bug-reports
// @desc     Create a bug report
// @access   Private
router.post(
  '/',
  [
    auth,
    [
      check('title', 'Title is required').not().isEmpty(),
      check('description', 'Description is required').not().isEmpty(),
      check('severity', 'Severity is required').isIn(['low', 'medium', 'high', 'critical']),
      check('reporterEmail', 'Reporter email is required').isEmail()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const {
        title,
        description,
        status,
        severity,
        bountyAmount,
        reporterEmail,
        assignedUser
      } = req.body;

      // Create new bug report
      const newBugReport = new BugReport({
        title,
        description,
        status: status || 'open',
        severity,
        bountyAmount: bountyAmount || 0,
        reporterEmail,
        assignedUser: assignedUser || null
      });

      const bugReport = await newBugReport.save();
      res.json(bugReport);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route    GET api/bug-reports
// @desc     Get all bug reports
// @access   Private
router.get('/', auth, async (req, res) => {
  try {
    const bugReports = await BugReport.find()
      .populate('assignedUser', ['name', 'email', 'role'])
      .sort({ createdTimeStamp: -1 });
    res.json(bugReports);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route    GET api/bug-reports/assigned
// @desc     Get bug reports assigned to current user
// @access   Private
router.get('/assigned', auth, async (req, res) => {
  try {
    const bugReports = await BugReport.find({ assignedUser: req.user.id })
      .populate('assignedUser', ['name', 'email', 'role'])
      .sort({ createdTimeStamp: -1 });
    res.json(bugReports);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route    GET api/bug-reports/assigned/open
// @desc     Get incomplete bug reports assigned to current user
// @access   Private
router.get('/assigned/open', auth, async (req, res) => {
  try {
    const bugReports = await BugReport.find({
      assignedUser: req.user.id,
      status: { $in: ['open', 'in-progress'] }
    })
      .populate('assignedUser', ['name', 'email', 'role'])
      .sort({ createdTimeStamp: -1 });
    res.json(bugReports);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route    GET api/bug-reports/assigned/closed
// @desc     Get completed bug reports assigned to current user
// @access   Private
router.get('/assigned/closed', auth, async (req, res) => {
  try {
    const bugReports = await BugReport.find({
      assignedUser: req.user.id,
      status: { $in: ['resolved', 'closed'] }
    })
      .populate('assignedUser', ['name', 'email', 'role'])
      .sort({ createdTimeStamp: -1 });
    res.json(bugReports);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route    GET api/bug-reports/:id
// @desc     Get bug report by ID
// @access   Private
router.get('/:id', auth, async (req, res) => {
  try {
    const bugReport = await BugReport.findById(req.params.id)
      .populate('assignedUser', ['name', 'email', 'role']);
    
    if (!bugReport) {
      return res.status(404).json({ msg: 'Bug report not found' });
    }

    res.json(bugReport);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Bug report not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route    PUT api/bug-reports/:id
// @desc     Update a bug report
// @access   Private
router.put('/:id', auth, async (req, res) => {
  try {
    const bugReport = await BugReport.findById(req.params.id);
    
    if (!bugReport) {
      return res.status(404).json({ msg: 'Bug report not found' });
    }

    // Update fields
    const {
      title,
      description,
      status,
      severity,
      bountyAmount,
      assignedUser
    } = req.body;

    if (title) bugReport.title = title;
    if (description) bugReport.description = description;
    if (status) {
      bugReport.status = status;
      if (status === 'resolved' || status === 'closed') {
        bugReport.closedTimeStamp = Date.now();
      }
    }
    if (severity) bugReport.severity = severity;
    if (bountyAmount !== undefined) bugReport.bountyAmount = bountyAmount;
    if (assignedUser) bugReport.assignedUser = assignedUser;

    await bugReport.save();
    
    const updatedBugReport = await BugReport.findById(req.params.id)
      .populate('assignedUser', ['name', 'email', 'role']);
    
    res.json(updatedBugReport);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Bug report not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route    DELETE api/bug-reports/:id
// @desc     Delete a bug report
// @access   Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const bugReport = await BugReport.findById(req.params.id);
    
    if (!bugReport) {
      return res.status(404).json({ msg: 'Bug report not found' });
    }

    await bugReport.deleteOne();
    
    res.json({ msg: 'Bug report removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Bug report not found' });
    }
    res.status(500).send('Server Error');
  }
});

export default router;