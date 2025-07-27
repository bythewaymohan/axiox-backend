const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema({
    certificateNumber: { type: String, unique: true, required: true },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true, // <-- required
        index: true // <-- just index, not unique!
    },
    name: { type: String, required: true },
    email: { type: String, required: true },
    course: { type: String, required: true },
    organization: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    issuedDate: { type: Date, default: Date.now },
    duration: { type: String, required: true },
    signature: {
        name: { type: String, required: true },
        title: { type: String },
        imageUrl: { type: String }
    },
    verified: { type: Boolean, default: false },
    governmentApprovalNumber: { type: String },
    remarks: { type: String }
});

module.exports = mongoose.model('Certificate', certificateSchema);
