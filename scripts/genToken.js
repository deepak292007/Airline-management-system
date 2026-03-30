const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

(async () => {
  await mongoose.connect('mongodb://127.0.0.1:27017/sss-airlines');
  const Passenger = require('../backend/models/Passenger');
  const p = await Passenger.findOne();
  console.log('found passenger', p && p.phoneNumber, p && p._id);
  const secret = process.env.JWT_SECRET || 'supersecretkey';
  const token = jwt.sign({ id: p._id, phoneNumber: p.phoneNumber, role: 'passenger' }, secret, { expiresIn: '7d' });
  console.log('token', token);
  process.exit();
})();