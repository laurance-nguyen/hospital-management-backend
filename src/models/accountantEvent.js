const mongoose = require('mongoose');

const accountantEventSchema = new mongoose.Schema({
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  device: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Device',
  },
  action: {
    type: Boolean,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('AccountantEvent', accountantEventSchema);
