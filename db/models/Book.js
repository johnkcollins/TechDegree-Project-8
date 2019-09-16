const Sequelize = require ('sequelize');

module.exports = (sequelize) => {
  class Book extends Sequelize.Model {}
  Book.init({

        title: {
          type: Sequelize.STRING,
          allowNull: false,
          validate: {
            notNull: {
              msg: 'Please provide a value for "title"'
            },
            notEmpty: {
              msg: 'Please provide a value for "title"'
            }
          }
        },
        author: {
          type: Sequelize.STRING,
          allowNull: false,
          validate: {
            notNull: {
              msg: 'Please provide a value for "author"'
            },
            notEmpty: {
              msg: 'Please provide a value for "author"'
            }
          }
        },
        genre: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        year: {
          type: Sequelize.INTEGER,
          allowNull: true,
          validate: {
            min: {
              args: 1,
              msg: 'Please provide a value greater than "0" for "year"'
            }
          }
        },
      },

      {sequelize});
  return Book;
};