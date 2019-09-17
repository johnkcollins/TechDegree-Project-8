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
      const messages = error.errors.map(err => (err));
      console.error('Validation errors: ', messages);
    } else {
      throw error;
    }
  }
})();

//Async Handler
function asyncHandler(cb) {
  return async (req, res, next) => {
    try {
      await cb(req, res, next);
    } catch (err) {
      messages.length = 0;
      if (err.name === 'SequelizeValidationError') {
        messages = err.errors.map(err => err.message);
        console.error('Validation errors: ', messages);
        res.render('error');
      }
    }
  }
}

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

app.get('/books', asyncHandler(async (req, res) => {
  messages.length = 0;
  books = await Book.findAll();
  res.render('index', {books});
}));

app.get('/books/new', (req, res) => {
  res.render('new-book');
});

app.post('/books/new', async (req, res) => {
  try {
    let newBook = {
      where: {
        title: req.body.title,
        author: req.body.author,
        genre: req.body.genre,
        year: req.body.year
      }
    };
    await Book.findOrCreate(newBook);
    res.redirect(`/books`);
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      const messages = error.errors.map(err => (err));
      messages.map(message => console.log(message.message));
      res.render('new-book', {messages});
      messages.length = 0;
    }
  }
});

app.get('/books/:id', asyncHandler(async (req, res) => {
  (books[req.params.id - 1])
      ? res.render('update-book', {id: req.params.id, books, messages})
      : res.redirect('/does_not_exist')
}));

app.post('/books/:id', async (req, res) => {
  try {
    let id = req.params.id;
    const renderBook = {
      id,
      title: req.body.title,
      author: req.body.author,
      genre: req.body.genre,
      year: req.body.year
    };
    const bookToUpdate = await Book.findByPk(id);
    const updatedBook = await bookToUpdate.update(renderBook);
    books = await Book.findAll();
    res.render('update-book', {id: id, books, messages});
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      let id = req.params.id;
      messages = error.errors.map(err => (err));
      await messages.map(message => console.log(message.message));
      res.render('update-book', {messages, books, id});
      messages.length = 0;
    }
  }
});

app.get('/does_not_exist', (req, res) => {
  res.render('page-not-found')
});

app.post('/books/:id/delete', asyncHandler(async (req, res) => {
      let id = req.params.id;
      const destroyBook = {id};
      const bookToDelete = await Book.findByPk(id);
      bookToDelete.destroy(destroyBook);
      res.redirect(`/`);
    })
);

app.use((req, res, next) => {
  const err = new Error();
  err.status = 404;
  err.message = "Hmmm, something isn't quite right...Make sure the address is correctly entered";
  next(err);
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