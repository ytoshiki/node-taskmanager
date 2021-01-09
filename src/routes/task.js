const router = require('express').Router();
const Task = require('../models/Task');

router.get('/', async (req, res) => {
  try {
    const tasks = await Task.find({});
    res.status(200).json({
      success: true,
      data: tasks
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error
    });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
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

router.post('', async (req, res) => {
  const newTask = new Task(req.body);
  try {
    const task = await newTask.save();
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

router.patch('/:id', async (req, res) => {
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
    const task = await Task.findById(req.params.id);
    requestUpdates.forEach((update) => (task[update] = req.body[update]));
    await task.save();

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

router.delete('/:id', async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task Not Found'
      });
    }

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
