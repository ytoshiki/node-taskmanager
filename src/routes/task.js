const router = require('express').Router();
const Task = require('../models/Task');
const auth = require('../middlewares/auth');

router.get('/', auth, async (req, res) => {
  try {
    // const tasks = await Task.find({ user: req.user._id });
    await req.user.populate('tasks').execPopulate();
    res.status(200).json({
      success: true,
      data: req.user.tasks
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error
    });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task Not Found'
      });
    }
    res.status(200).json({
      success: true,
      data: task
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error
    });
  }
});

router.post('/', auth, async (req, res) => {
  // req.body.user = req.user._id;
  const newTask = new Task({
    ...req.body,
    user: req.user._id
  });

  try {
    const task = await newTask.save();
    await task.populate('user').execPopulate();
    res.status(201).json({
      success: true,
      data: task
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error
    });
  }
});

router.patch('/:id', auth, async (req, res) => {
  const allowedUpdates = ['description', 'completed'];
  const requestUpdates = Object.keys(req.body);

  const isValid = requestUpdates.every((r_key) => {
    return allowedUpdates.includes(r_key);
  });

  if (!isValid) {
    return res.status(400).json({
      success: false,
      message: 'Not Allowed Property'
    });
  }

  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task Not Found'
      });
    }

    requestUpdates.forEach((update) => (task[update] = req.body[update]));
    await task.save();

    res.status(200).json({
      success: true,
      data: task
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error
    });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task Not Found'
      });
    }

    await task.remove();

    res.status(200).json({
      success: true,
      data: []
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to Delete'
    });
  }
});

module.exports = router;
