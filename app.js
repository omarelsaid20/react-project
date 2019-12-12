//                      بسم الله الرحمن الرحيم 
//          اللهم لك الحمد حتى ترضى و لك الحمد اذا رضيت و لك الحمد بعد الرضا 
// اللهم تتم علينا نعمتك و اللهم صلى على حبيبنا و رسولنا محمد عليه الصلاة و السلام 

const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const csurf = require('csurf');
const multer = require('multer');

const User = require('./models/user');

const app = express();

const store = new MongoDBStore({
  uri: 'mongodb+srv://omar:omar.0123@cluster0-ib5pg.mongodb.net/feed  ',
  collection: 'mySessions'
});
const csurfProtection = csurf();

const omar = 'omar';

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'images')
  },
  filename: (req, file, cb) => {
    cb(null,'-' + file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === 'image/png' ||
    file.mimetype === 'image/jpg' ||
    file.mimetype === 'image/jpeg'
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const feedRoutes = require('./routes/feed');
const authRoutes = require('./routes/auth');
const errorController = require('./controllers/error');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(multer({storage: fileStorage, fileFilter: fileFilter}).single('image'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(
  session({
    secret: 'my secret',
    resave: false,
    saveUninitialized: false,
    store: store
  }));
app.use(csurfProtection);

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csurfToken = req.csrfToken();
  next();
});


app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then(user => {
      if (!user) {
        return next();
      }
      req.user = user;
      next();
    })
    .catch(err => {
      next(new Error(err));
    });
});

app.use(adminRoutes);
app.use(feedRoutes);
app.use(authRoutes);

app.use(errorController.get404);

mongoose
  .connect('mongodb+srv://omar:omar.0123@cluster0-ib5pg.mongodb.net/feed')
  .then(result => {
    app.listen(3000);
  })
  .catch(err => {
    console.log(err);
  })
