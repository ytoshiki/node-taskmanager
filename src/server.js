const express = require('express');
const userRouter = require('./routes/user');
const taskRouter = require('./routes/task');
// Database
require('./db/mongoose');

const app = express();

app.use(express.json());

// Routers
app.use('/api/users', userRouter);
app.use('/api/tasks', taskRouter);

// Port
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Node server is running on ${port}`);
});

const User = require('./models/User');
