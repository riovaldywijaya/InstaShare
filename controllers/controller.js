const { User, Profile, Post, Like } = require('../models');
let bcrypt = require('bcryptjs');
const Helper = require('../helpers/helper');
const { Op } = require('sequelize');
// const showTimePost = require('../models/post');

class Controller {
  static showLandingPage(req, res) {
    res.render('landing-page');
  }

  static registerForm(req, res) {
    const { errors } = req.query;
    res.render('register-form', { errors });
  }

  static postRegister(req, res) {
    const { email, password, role } = req.body;

    User.create({ email, password, role })
      .then((result) => {
        res.redirect('/login');
      })
      .catch((err) => {
        if (err.name === 'SequelizeValidationError') {
          const errors = err.errors.map((e) => {
            return e.message;
          });
          res.redirect(`/register?errors=${errors}`);
        } else {
          console.log(err);
          res.send(err);
        }
      });
  }

  static loginForm(req, res) {
    const { errors } = req.query;
    res.render('login-form', { errors });
  }

  static postLogin(req, res) {
    const { email, password } = req.body;
    User.findOne({ where: { email } })
      .then((user) => {
        if (user) {
          const isValidPassword = bcrypt.compareSync(password, user.password);

          if (isValidPassword) {
            req.session.userId = user.id;
            req.session.role = user.role;

            return res.redirect(`/home/${user.id}`);
            // return res.redirect(`/profiles/create/${user.id}`);
          } else {
            const error = 'Sorry, your password was incorrect. Please double-check your password.';
            return res.redirect(`/login?errors=${error}`);
          }
        } else {
          const error = 'Sorry, your email was incorrect. Please double-check your email.';
          return res.redirect(`/login?errors=${error}`);
        }
      })
      .catch((err) => {
        console.log(err);
        res.send(err);
      });
  }

  static getLogout(req, res) {
    req.session.destroy((err) => {
      if (err) {
        res.send(err);
      } else {
        res.redirect('/login');
      }
    });
  }

  static showHome(req, res) {
    let { id } = req.params;
    const { errors } = req.query;

    let result = [];
    let userId = undefined;

    Post.findAll({
      include: [
        {
          model: User,
          include: {
            model: Profile,
          },
        },
        {
          model: Like,
          where: {
            UserId: id,
          },
          required: false,
        },
      ],
      order: [['createdAt', 'DESC']],
    })
      .then((posts) => {
        // res.send(result);
        result = posts;
        result.isLike = true;
        return User.findByPk(id);
      })
      .then((user) => {
        userId = user.id;
        // res.send(result);
        // console.log(errors);
        res.render('home', { result, userId, errors, id });
      })
      .catch((err) => {
        console.log(err);
        res.send(err);
      });
  }

  static likePost(req, res) {
    const { id } = req.params;
    const { userId } = req.query;

    console.log(userId + '<<<< ini user id di awal');
    // let userLike = undefined;

    // console.log(id, userId);
    Like.findOne({ where: { UserId: userId, PostId: id } }).then((result) => {
      // userLike = result;
      if (!result) {
        Like.create({ UserId: userId, PostId: id })
          .then((result) => {
            return Post.increment(
              { likes: 1 },
              {
                where: {
                  id,
                },
              }
            );
          })
          .then((result) => {
            console.log(userId + '<<<< ini user id di akhir jika like tidak ada');
            res.redirect(`/home/${userId}`);
          })
          .catch((err) => {
            console.log(err);
            res.send(err);
          });
      } else {
        Like.destroy({ where: { UserId: userId, PostId: id } })
          .then((result) => {
            return Post.decrement(
              { likes: 1 },
              {
                where: {
                  id,
                },
              }
            );
          })
          .then((result) => {
            console.log(userId + '<<<< ini user id di akhir jika like ada');
            res.redirect(`/home/${userId}`);
          })
          .catch((err) => {
            console.log(err);
            res.send(err);
          });
      }
    });
  }

  static addProfile(req, res) {
    const { id } = req.params;

    Profile.findOne({ where: { UserId: id } })
      .then((result) => {
        if (!result) {
          res.render('profile-create-form', { id });
        } else {
          res.redirect(`/profiles/edit/${id}`);
        }
      })
      .catch((err) => {
        console.log(err);
        res.send(err);
      });
  }

  static createProfile(req, res) {
    const { firstName, lastName, dateOfBirth, gender, phone, bio } = req.body;
    const UserId = req.params.id;

    let profilePicture = null;

    if (req.file !== undefined) {
      profilePicture = req.file.originalname;
    } else {
      profilePicture = 'no-profile-picture.png';
    }

    Profile.create({ firstName, lastName, dateOfBirth, gender, phone, profilePicture, bio, UserId })
      .then((result) => {
        res.redirect(`/home/${UserId}`);
      })
      .catch((err) => {
        res.send(err);
      });
  }

  static editProfile(req, res) {
    const { id } = req.params;

    Profile.findOne({ where: { UserId: id } })
      .then((result) => {
        if (result) {
          res.render('profile-edit-form', { result, id });
        } else {
          res.redirect(`/profiles/create/${id}`);
          // res.send('BELUM BUAT PROFILE');
        }
      })
      .catch((err) => {
        console.log(err);
        res.send(err);
      });
  }

  static updateProfile(req, res) {
    const { firstName, lastname, dateOfBirth, gender, phone, bio } = req.body;
    let profilePicture = null;

    if (req.file !== undefined) {
      profilePicture = req.file.originalname;
    } else {
      profilePicture = 'no-profile-picture.png';
    }

    const { id } = req.params;
    Profile.update(
      { firstName, lastname, dateOfBirth, gender, phone, profilePicture, bio },
      {
        where: {
          UserId: id,
        },
      }
    )
      .then((result) => {
        res.redirect(`/home/${id}`);
      })
      .catch((err) => {
        console.log(err);
        res.send(err);
      });
  }

  static addPost(req, res) {
    const { id } = req.params;
    res.render('add-post', { id });
  }

  static submitPost(req, res) {
    const { id } = req.params;
    const { caption } = req.body;
    const imgUrl = req.file.originalname;

    Post.create({ imgUrl, caption, UserId: id })
      .then((result) => {
        res.redirect(`/home/${id}`);
      })
      .catch((err) => {
        res.send(err);
      });
  }

  static showAllUsers(req, res) {
    let { search } = req.query;
    let options = { include: Post, where: {} };
    const user = req.params.id;

    if (search) {
      options.where.email = {
        [Op.iLike]: `%${search.toLowerCase()}%`,
      };
    }

    User.findAll(options)
      .then((result) => {
        res.render('allUsers', { result, Helper, user });
      })
      .catch((err) => {
        console.log(err);
        res.send(err);
      });
  }

  static deleteUser(req, res) {
    const { user } = req.query;

    User.destroy({
      where: {
        id: req.params.id,
      },
    })
      .then((result) => {
        res.redirect(`/listUsers/${user}`);
      })
      .catch((err) => {
        console.log(err);
        res.send(err);
      });
  }
}

module.exports = Controller;
