const router = require('express').Router();
const User = require('../models/User');

router.post('/', async (req, res) => {
  const newUser = new User(req.body);

  try {
    const user = await newUser.save();
    res.status(201).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error
    });
  }
});

router.get('/:id', async (req, res) => {
  const _id = req.params.id;

  try {
    const user = await User.findById(_id);
    if (!user) {
      return res.status(404).json({
        success: false,
        data: 'User Not found'
      });
    }
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error
    });
  }
});

router.get('/', async (req, res) => {
  try {
    const users = await User.find({});
    res.status(200).json({
      success: true,
      data: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error
    });
  }
});

router.patch('/:id', async (req, res) => {
  const allowedUpdates = ['name', 'email', 'password', 'age'];
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
    const user = await User.findById(req.params.id);

    requestUpdates.forEach((update) => (user[update] = req.body[update]));
    await user.save();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User Not Found'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false
    });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User Not Found'
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
