const Sequelize = require ('sequelize');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './db/library.db',
  logging: false
});

const db = {
  sequelize,
  Sequelize,
  models: {},
};

//Resets Sequelize sequencing
sequelize.query("UPDATE SQLITE_SEQUENCE SET SEQ=0");

db.models.Book = require ('./models/Book')(sequelize);

module.exports = db;