const express = require('express');
const app = express();
const router = express.Router();
const bodyParser = require('body-parser');

//allows attributes from the form to be read
app.use(bodyParser.urlencoded({extended: false}));

//SEQUELIZE
const Sequelize = require('sequelize');
const db = require('../db');
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: '../db/library'
});
const {Op} = Sequelize;
const {Book} = db.models;
let books;

// Retrieves the books from the sqlite database with SEQUELIZE
(async () => {
  await db.sequelize.sync();

  try {
    books = await Book.findAll();
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      const errors = error.errors.map(err => err.message);
      console.error('Validation errors: ', errors);
    } else {
      throw error;
    }
  }
})();

// Sets the view engine
app.set('view engine', 'pug');

// Serves static page
app.use('/static', express.static('public'));


/*******************************************
 ROUTERS
 ********************************************/
app.get('/', (req, res) => {
  res.redirect('books')
});

app.get('/books', (req, res) => {
  res.render('index', {books})
});

app.get('/books/new', (req, res) => {
  res.render('new-book')
});

app.post('/books/new', (req, res) => {
  let newBook = {
    where: {
      title: req.body.title,
      author: req.body.author,
      genre: req.body.genre,
      year: req.body.year
    }
  };
  (async () => {
    await db.sequelize.sync();

    try {
      Book
          .findOrCreate(newBook)
          .success(function (user, created) {
            alert(`Your book has been added`)
          })
    } catch (error) {
      if (error.name === 'SequelizeValidationError') {
        const errors = error.errors.map(err => err.message);
        console.error('Validation errors: ', errors);
      } else {
        next(error);
      }
    }
  })();
  res.render('new-book')
});

app.get('/books/:id', (req, res) => {
  (books[req.params.id])
      ? res.render('update-book', {id: req.params.id, books})
      : res.redirect('/does_not_exist')
});

app.post('/books/:id', (req, res) => {

  res.render('update-book', {id: req.params.id, books})
});

app.get('/does_not_exist', (req, res) => {
  res.render('page-not-found')
});

app.post('/books/:id/delete', (req, res) => {
  res.render('delete')
});

//Renders the error page
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.render('error', {err});
});


// router.get('/', function(req, res) {
//   models.book.findAll()
//     .then(function(book){
//       res.render('index', {
//         title: "Sequelize: express example",
//         book: book
//       });
//     });
// });

//Crates a local server for the site to be viewed
app.listen(3000, () => {
  console.log('The app is listening on port 3000')
});

module.exports = router;

