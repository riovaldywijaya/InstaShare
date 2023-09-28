'use strict';
const { Model } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      // define association here
      User.hasOne(models.Profile);
      User.hasMany(models.Post);
      User.hasMany(models.Like);
      // User.belongsToMany(models.Post, {
      //   through: models.Like,
      // });
    }
  }
  User.init(
    {
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          notNull: {
            msg: 'Email must be filled !',
          },
          notEmpty: {
            msg: 'Email must be filled !',
          },
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: {
            msg: 'Password must be filled !',
          },
          notEmpty: {
            msg: 'Password must be filled !',
          },
          validateLength(value) {
            if (value.length < 8) {
              throw new Error('Minimum length of password is 8 !');
            }
          },
        },
      },
      role: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: {
            msg: 'Role must be filled !',
          },
          notEmpty: {
            msg: 'Role must be filled !',
          },
        },
      },
    },
    {
      hooks: {
        beforeCreate(instance) {
          const salt = bcrypt.genSaltSync(10);
          const hash = bcrypt.hashSync(instance.password, salt);

          instance.password = hash;
        },
      },
      sequelize,
      modelName: 'User',
    }
  );
  return User;
};
