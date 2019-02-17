const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CourseSchema = new mongoose.Schema({
    name: {
        type: String,
        unique: false,
        required: true,
        trim: true
    },
    units: {
        type: Number,
        unique: false,
        required: true,
        trim: true
    },
    university: { type: Schema.Types.ObjectId, ref: 'University' }
});

const Course = mongoose.model('Course', CourseSchema);
module.exports = Course;