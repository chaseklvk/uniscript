const express = require('express');
const app = express();

const bodyParser = require('body-parser');
const axios = require('axios');
const uuid = require('uuid');
const hbs = require('express-handlebars');
const path = require('path');
const csrf = require('csurf');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const session = require('express-session');

// Connect to DBs
const mongoose = require('mongoose');
mongoose.connect('mongodb://uniscript_admin:uniscript_admin123@ds163014.mlab.com:63014/uniscript', {
    useNewUrlParser: true,
});

// Models
const User = require('./db/User');
const Univ = require('./db/University');
const Course = require('./db/Course');
const Student = require('./db/Student');
const Grade = require('./db/Grade');

// Config
const PORT = 3000;

// Views
app.engine('hbs', hbs({ extname: 'hbs', defaultLayout: 'layout', layoutsDir: __dirname + '/views/layouts' }));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/static', express.static(path.join(__dirname, 'public')))
app.use(cookieParser());
app.use(csrf({ cookie: true }));

// Express session
app.use(session({
    secret: 'secret',
    saveUninitialized: true,
    resave: true
}));

// Custom Middleware
const requiresLogin = (req, res, next) => {
    if (req.session && req.session.userId) {
        return next();
    } else {
        return res.redirect('/login');
    }
}

// Routes
app.get('/', (req, res) => {
    if (req.session && req.session.userId) {
        res.redirect('/dashboard');
    } else {
        res.redirect('/login');
    }
});

app.get('/dashboard', requiresLogin, (req, res) => {
    Course.find({ university: req.session.univ }).exec((err, courses) => {
        Student.find({ university: req.session.univ }).populate('courses').exec((err, students) => {
            res.render('dashboard', {
                layout: 'layout',
                user: req.session.userId,
                username: req.session.username,
                courses: courses,
                students: students,
                csrfToken: req.csrfToken()
            });
        });
    });
});

app.get('/logout', function (req, res, next) {
    if (req.session) {
        // delete session object
        req.session.destroy(function (err) {
            if (err) {
                return next(err);
            } else {
                return res.redirect('/');
            }
        });
    }
});

// Show login page 
app.get('/login', (req, res) => {
    res.render('login', { layout: 'layout', csrfToken: req.csrfToken() });
});

// Submit login form
app.post('/login', (req, res) => {

    if (req.body.username &&
        req.body.password
    ) {
        User.findOne({ username: req.body.username }).populate('university').exec(function (err, user) {
            if (err) {
                return res.redirect('/login');
            } else if (!user) {
                return res.redirect('/login');
            }

            bcrypt.compare(req.body.password, user.password, function (err, result) {
                if (result === true) {
                    req.session.userId = user._id;
                    req.session.username = user.username;
                    req.session.univ = user.university._id;

                    return res.redirect('/dashboard');
                } else {
                    return res.redirect('/login');
                }
            });

        });
    }

});

// Show register page
app.get('/register', (req, res) => {
    Univ.find().exec((err, data) => {
        if (err) {
            return res.redirect('/register');
        } else if (!data) {
            return res.redirect('/register');
        }

        res.render('register', { layout: 'layout', universities: data, csrfToken: req.csrfToken() });
    });
});

// Submit user reg
app.post('/register', (req, res, next) => {
    if (req.body.email &&
        req.body.username &&
        req.body.password &&
        req.body.password_confirm &&
        req.body.univ_id
    ) {
        if (req.body.password != req.body.password_confirm) {
            // Redirect to register but add an error.
            res.redirect('/register');
        }

        bcrypt.hash(req.body.password, 10, (err, hash) => {
            if (err) {
                return next(err);
            } else {
                let userData = {
                    email: req.body.email,
                    username: req.body.username,
                    password: hash,
                    university: req.body.univ_id
                };

                User.create(userData, (err, data) => {
                    if (err) {
                        return next(err);
                    } else {
                        req.session.userId = data._id;
                        req.session.username = data.username;
                        req.session.univ = data.univ_id;
                        return res.redirect('/dashboard');
                    }
                });
            }
        });
    }
});

app.get('/addcourse', requiresLogin, (req, res) => {
    res.render('addcourse', { layout: 'layout', user: req.session.userId,
    username: req.session.username, csrfToken: req.csrfToken() });
});

app.post('/addcourse', requiresLogin, (req, res) => {
    if (req.body.name &&
        req.body.units
    ) {

        let courseData = {
            name: req.body.name,
            units: req.body.units,
            university: req.session.univ
        }

        Course.create(courseData, (err, data) => {
            if (err) {
                return next(err);
            } else {
                return res.redirect('/dashboard');
            }
        });
    }
});

app.post('/addstudent', requiresLogin, (req, res) => {
    if (req.body.name) {

        Course.find({ university: req.session.univ }).exec((err, courses) => {
            
            let course_ids = [];

            for (let i = 0; i < courses.length; ++i) {
                if (courses[i]._id in req.body) {
                    course_ids = course_ids.concat(courses[i]._id);
                }
            }

            let studentData = {
                _id: Math.floor(Math.random() * 1000000000000),
                name: req.body.name,
                courses: course_ids,
                university: req.session.univ
            };

            Student.create(studentData, (err, data) => {
                if (err) {
                    return next(err);
                } else {
                    return res.redirect('/dashboard');
                }
            });

        });

    }
});

app.get('/addstudent', requiresLogin, (req, res) => {

    Course.find({ university: req.session.univ }).exec((err, data) => {
        if (err) {
            return res.redirect('/dashboard');
        } else if (!data) {
            return res.redirect('/dashboard');
        }
        res.render('addstudent', { layout: 'layout', courses: data, user: req.session.userId,
        username: req.session.username, csrfToken: req.csrfToken() });
    });
});

app.get('/grade', requiresLogin, (req, res) => {
    const studentId = req.query.id;    

    Student.findOne({ _id: studentId }).populate('grades').populate('courses').exec((err, data) => {
        res.render('grade', { layout: 'layout', studentId: studentId, grades: data.grades, user: req.session.userId,
        username: req.session.username, csrfToken: req.csrfToken() });
    });
});

app.get('/addgrade', requiresLogin, (req, res) => {
    Student.findOne({ _id: req.query.id }).populate('courses').exec((err, data) => {
        res.render('addgrade', { layout: 'layout', studentId: data._id, courses: data.courses, user: req.session.userId,
        username: req.session.username, csrfToken: req.csrfToken() });
    });
});

app.post('/addgrade', requiresLogin, (req, res) => {
    if (req.body.grade &&
        req.body.course_id &&
        req.body._id
    ) {
        let gradeData = {
            score: req.body.grade,
            course: req.body.course_id
        }

        Grade.create(gradeData, (err, data) => {
            if (err) {
                return next(err);
            } else {
                Student.update({ _id: req.body._id }, { $push: { grades: data._id } }, (err, data) => {
                    if (err) {
                        return next(err);
                    } else {
                        return res.redirect('/dashboard');
                    }
                });
            }
        });
    }
});

app.post('/search', requiresLogin, (req, res) => {

    const { searchId } = req.body;

    axios.post('https://B822AB2B2D174C49BF6297061964EC6D.blockchain.ocp.oraclecloud.com:443/restproxy1/bcsgw/rest/v1/transaction/invocation', {
        channel: "default",
        chaincode: "uniscript",
        method: "readStudent",
        args: [searchId]
    }, {
        auth: {
            username: 'uscblockhack',
            password: 'Oracle12345#'
        }
    })
    .then(function (response) {
        const payload = JSON.parse(response.data.result.payload);

        res.render('searchresults', { layout: 'layout', data: payload, user: req.session.userId,
        username: req.session.username })
    })
    .catch(function (error) {
        console.log(error);
    });
});

app.get('/publish', requiresLogin, (req, res) => {

    Student.findOne({ _id: req.query.id }).exec((err, data) => {
        axios.post('https://B822AB2B2D174C49BF6297061964EC6D.blockchain.ocp.oraclecloud.com:443/restproxy1/bcsgw/rest/v1/transaction/invocation', {
            channel: "default",
            chaincode: "uniscript",
            method: "initStudent",
            chaincodeVer: "2.0",
            args: [data.name, data.name, data._id]
        }, {
            auth: {
                username: 'uscblockhack',
                password: 'Oracle12345#'
            }
        })
        .then(function (response) {
            res.redirect('/dashboard');
        })
        .catch(function (error) {
            console.log(error);
        });
    });
});

// Run App
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));