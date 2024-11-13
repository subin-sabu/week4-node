const express = require("express");
const session = require("express-session");
const path = require("path");
const nocache = require("nocache");

///////////////////////////////////////

const app = express();

// middleware to parse deep into req.body
app.use(express.urlencoded({ extended: true }));

// middleware to manage session
app.use(
  session({
    secret: "my_secret_key",
    resave: false,
    saveUninitialized: true,
     cookie: { secure: false, maxAge: 60000 }, 
  })
);

// set ejs as view engine
app.set("view engine", "ejs");

// make public folder static 
app.use('/public', express.static(path.join(__dirname, 'public')));

app.use(nocache());

// pre-defined staff data; to be actually fetched from DB
const staffData = [
  {
    name: 'John Doe',
    role: 'Full Stack Developer',
    project: 'ECOM-34',
    imageUrl: '/public/images/img1.jpg'
  },
  {
    name: 'Jane Zinger',
    role: 'Mobile App Developer',
    project: 'ECOM-34',
    imageUrl: '/public/images/img2.jpg'
  },
  {
    name:'Memoji',
    role: 'Frontend Developer',
    project: 'NEWS-02',
    imageUrl: '/public/images/img3.jpg'
  }
]


// middleware to check if the user is authenticated
function isAuthenticated(req, res, next) {
  if (req.session.isAuthenticated) {
    return next();
  }
  res.redirect('/');
}


/* Routes */

// root path is login page
app.get('/', (req, res) => {
  if (req.session.isAuthenticated) {
    return res.redirect('/home');
  }
  res.render('login', { errorMessage: null });
});

app.post('/', (req, res) => {
  // mimick the server side validation
  const { username, password } = req.body;
  if (username === 'admin' && password === 'express123') {
    // set authentication status to true
    req.session.isAuthenticated = true; 
    return res.redirect('/home');
  }
  // if userid or password is incorrect show error
  res.render('login', { errorMessage: 'Invalid username or password' });  
});

// home page (login with authentication)
app.get('/home', isAuthenticated,  (req, res) => {
  res.render('home', { data: staffData });
});

// sign out route
app.post('/signout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.log('Error signing out: ', err);
    }
     // Clear session cookie 
     res.clearCookie('connect.sid', { path: '/' }); 
    res.redirect('/');
  });
});


// 404 for all other paths
app.use((req, res) => {
  res.status(404).render('404');
});


// start server from a specified port
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server started in port ${PORT}`);
});