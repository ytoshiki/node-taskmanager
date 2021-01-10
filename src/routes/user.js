const router = require('express').Router();
const User = require('../models/User');
const auth = require('../middlewares/auth');

// Sign Up
router.post('/', async (req, res) => {
  const newUser = new User(req.body);

  try {
    const user = await newUser.save();
    const token = await user.generateAuthToken();
    res.status(201).json({
      success: true,
      data: { user, token }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error
    });
  }
});

router.get('/profile', auth, async (req, res) => {
  await req.user.populate('tasks').execPopulate();
  console.log(req.user.tasks);
  res.json({
    success: true,
    data: req.user
  });
});

router.patch('/', auth, async (req, res) => {
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
    const user = req.user;
    requestUpdates.forEach((update) => (user[update] = req.body[update]));
    await user.save();

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

router.delete('/', auth, async (req, res) => {
  try {
    await req.user.remove();

    res.status(200).json({
      success: true,
      action: 'delete',
      data: req.user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to Delete'
    });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const user = await User.findByCredentials(req.body.email, req.body.password);
    const token = await user.generateAuthToken();
    res.status(200).json({
      success: true,
      data: { user, token }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error
    });
  }
});

// Logout
router.post('/logout', auth, async (req, res) => {
  const token = req.token;
  const user = req.user;

  try {
    user.tokens = user.tokens.filter((obj) => {
      return obj.token !== token;
    });

    await user.save();

    res.send({
      success: true,
      data: []
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: 'Failed to Log Out'
    });
  }
});

router.post('/logoutAll', auth, async (req, res) => {
  const user = req.user;

  try {
    user.tokens = [];

    await user.save();

    res.send({
      success: true,
      data: []
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: 'Failed to Log Out'
    });
  }
});

module.exports = router;
