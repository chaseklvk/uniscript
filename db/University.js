const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UniversitySchema = new mongoose.Schema({
    name: {
        type: String,
        unique: false,
        required: true,
        trim: true
    },
    students: [{ type: Schema.Types.ObjectId, ref: 'Student' }],
    staff: [{ type: Schema.Types.ObjectId, ref: 'User'}] 
});

const University = mongoose.model('University', UniversitySchema);
module.exports = University;