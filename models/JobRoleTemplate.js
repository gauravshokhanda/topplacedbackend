const mongoose = require('mongoose');

const jobRoleTemplateSchema = new mongoose.Schema({
  jobRole: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'JobRole',
    required: true,
  },
  fields: [
    {
      name: { type: String, required: true },
      type: { type: String, enum: ['text', 'number', 'select', 'boolean'], default: 'text' }, // support different input types
    },
  ],
}, { timestamps: true });

module.exports = mongoose.model('JobRoleTemplate', jobRoleTemplateSchema);
