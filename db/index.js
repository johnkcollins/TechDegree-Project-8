const Sequelize = require ('sequelize');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './db/library.db',
  define: {
    timestamps: false
  },
  logging: false
});

const db = {
  sequelize,
  Sequelize,
  models: {},
};

db.models.Book = require ('./models/Book')(sequelize);

module.exports = db;