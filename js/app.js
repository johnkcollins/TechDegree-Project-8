const express = require('express');
const app = express();
const router = express.Router();
const bodyParser = require('body-parser');
const Sequelize = require('sequelize');
const sequelize = require('../db/index');

//allows attributes from the form to be read
app.use(bodyParser.urlencoded({extended: false}));

//SEQUELIZE
const db = require('../db');
const {Book} = db.models;
let books;
let messages = [];


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
  (async () => {
    await db.sequelize.sync();
    try {
      messages = [];
      books = await Book.findAll()
          .then(res.render('index', {books}));
    } catch (error) {
      if (error.name === 'SequelizeValidationError') {
        const errors = error.errors.map(err => err.message);
        console.error('Validation errors: ', messages);
      } else {
        throw error;
      }
    }
  })();
});

app.get('/books/new', (req, res) => {
  res.render('new-book');
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
    try {
      await Book.findOrCreate(newBook)
          .then(() => res.redirect(`/books`));
    } catch (error) {
      if (error.name === 'SequelizeValidationError') {
        const errors = error.errors.map(err => messages.push(err));
        messages.map(message => console.log(message.message));
        res.render('new-book', {messages});
        messages = [];
      }
    }
  })();
});

app.get('/books/:id', (req, res) => {
  (books[req.params.id - 1])
      ? res.render('update-book', {id: req.params.id, books})
      : res.redirect('/does_not_exist')
});

app.post('/books/:id', (req, res) => {
  let id = parseInt(req.params.id);
  const updateBook = {
    title: req.body.title,
    author: req.body.author,
    genre: req.body.genre,
    year: req.body.year
  };
  let renderBook = Book.findByPk({where: updateBook})
  (async () => {
    try {
      await Book.update(updateBook)
          .then(res.render('update-book', renderBook));
    } catch (error) {
      if (error.name === 'SequelizeValidationError') {
        const errors = error.errors.map(err => messages.push(err.message));
        console.error('Validation errors: ', errors);
      }
    }
  })();
});

app.get('/does_not_exist', (req, res) => {
  res.render('page-not-found')
});

app.post('/books/:id/delete', (req, res) => {
  let id = req.params.id;
  const destroyBook = {id};
  (async () => {
    try {
      const bookToDelete = await Book.findByPk(id);
      await bookToDelete.destroy(destroyBook)
          .then(() => res.redirect('/'));
    } catch (error) {
      if (error.name === 'SequelizeValidationError') {
        const errors = error.errors.map(err => messages.push(err.message));
        console.error('Validation errors: ', errors);
      }
    }
  })();
});

//Renders the error page
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.render('error', {err});
});

//Crates a local server for the site to be viewed
app.listen(3000, () => {
  console.log('The app is listening on port 3000')
});

module.exports = router;