const express = require('express');

const Controller = require('./controllers/controller');
const app = express();
const session = require('express-session');
const port = 3000;

app.use(express.static('public'));

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: 'rahasia',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      sameSite: true,
    },
  })
);

const multer = require('multer');
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/assets/');
  },
  filename: function (req, file, cb) {
    console.log(req, '<<<<<<<<<<');
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

app.get('/', Controller.showLandingPage);
app.get('/register', Controller.registerForm);
app.post('/register', Controller.postRegister);
app.get('/login', Controller.loginForm);
app.post('/login', Controller.postLogin);
app.get('/logout', Controller.getLogout);

app.use(function (req, res, next) {
  console.log(req.session);
  if (!req.session.userId) {
    const error = 'Please login first !!';
    res.redirect(`/login?errors=${error}`);
  } else {
    next();
  }
});

app.get('/home/:id', Controller.showHome);

app.get('/like/:id', Controller.likePost);

app.get('/profiles/create/:id', Controller.addProfile);

app.post('/profiles/create/:id', upload.single('profilePicture'), Controller.createProfile);

app.get('/profiles/edit/:id', Controller.editProfile);

app.post('/profiles/edit/:id', upload.single('profilePicture'), Controller.updateProfile);

app.get('/addPost/:id', Controller.addPost);

app.post('/addPost/:id', upload.single('imgUrl'), Controller.submitPost);

app.use(function (req, res, next) {
  console.log(req.session);
  if (req.session.userId && req.session.role !== 'Admin') {
    const error = 'You have no access to list users !';
    // res.redirect(`/login?errors=${error}`);
    res.redirect(`/home/${req.session.userId}?errors=${error}`);
  } else {
    next();
  }
});

app.get('/listUsers/delete/:id', Controller.deleteUser);

app.get('/listUsers/:id', Controller.showAllUsers);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
