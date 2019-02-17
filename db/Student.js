const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// 12 digit number...
const StudentSchema = new mongoose.Schema({
    _id: Number,
    name: {
        type: String,
        unique: false,
        required: true,
        trim: true
    },
    courses: [{ type: Schema.Types.ObjectId, ref: 'Course' }],
    grades: [{ type: Schema.Types.ObjectId, ref: 'Grade' }],
    university: { type: Schema.Types.ObjectId, ref: 'University' }
});

const Student = mongoose.model('Student', StudentSchema);
module.exports = Student;