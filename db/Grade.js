const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const GradeSchema = new mongoose.Schema({
    score: {
        type: Number,
        unique: false,
        required: true,
        trim: true
    },
    course: {
        type: String,
        unique: false,
        required: true,
        trim: true
    }
});

const Grade = mongoose.model('Grade', GradeSchema);
module.exports = Grade;