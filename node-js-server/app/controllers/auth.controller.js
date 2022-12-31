const config = require("../config/auth.config");
const db = require("../models");
const User = db.user;
const Role = db.role;
const OrganizationCode = db.organization_code;

var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");

exports.signup = (req, res) => {
  const user = new User({
    fname: req.body.fname,
    lname: req.body.lname,
    username: req.body.username,
    email: req.body.email,
    phone: req.body.phone,
    password: bcrypt.hashSync(req.body.password, 8),
    job: req.body.job || '',
    description: req.body.description || '',
  });

  OrganizationCode.find({ organization_code: req.body.organization_code })
    .then((results) => {
      if (results != undefined && results.length === 0) {
        return res.status(401).send({ message: "Invalid organization code!" });
      }
      user.save((err, user) => {
        if (err) {
          res.status(500).send({ message: err });
          return;
        }

        if (req.body.roles) {
          Role.find(
            {
              name: { $in: req.body.roles },
            },
            (err, roles) => {
              if (err) {
                res.status(500).send({ message: err });
                return;
              }

              user.roles = roles.map((role) => role._id);
              user.save((err) => {
                if (err) {
                  res.status(500).send({ message: err });
                  return;
                }

                res.send({ message: "User was registered successfully!" });
              });
            }
          );
        } else {
          Role.findOne({ name: "user" }, (err, role) => {
            if (err) {
              res.status(500).send({ message: err });
              return;
            }

            user.roles = [role._id];
            user.save((err) => {
              if (err) {
                res.status(500).send({ message: err });
                return;
              }

              res.send({ message: "User was registered successfully!" });
            });
          });
        }
      });
    })
    .catch((err) => {
      res.status(500).send({ message: err });
      return;
    });
};

exports.signin = (req, res) => {
  User.findOne({
    username: req.body.username,
  })
    .populate("roles", "-__v")
    .exec((err, user) => {
      if (err) {
        res.status(500).send({ message: err });
        return;
      }

      if (!user) {
        return res.status(404).send({ message: "User Not found." });
      }

      var passwordIsValid = bcrypt.compareSync(
        req.body.password,
        user.password
      );

      if (!passwordIsValid) {
        return res.status(401).send({ message: "Invalid Password!" });
      }

      var token = jwt.sign({ id: user.id }, config.secret, {
        expiresIn: 86400, // 24 hours
      });

      var authorities = [];

      for (let i = 0; i < user.roles.length; i++) {
        authorities.push("ROLE_" + user.roles[i].name.toUpperCase());
      }

      req.session.token = token;

      res.status(200).send({
        username:user.username,
        email: user.email,
        fname: user.fname,
        lname: user.lname,
        phone: user.phone,
        job: user.job,
        description: user.description,
        rank: user.rank,
        roles:authorities,
        id: user._id,
       
      });
    });
};

exports.signout = async (req, res) => {
  try {
    req.session = null;
    return res.status(200).send({ message: "You've been signed out!" });
  } catch (err) {
    this.next(err);
  }
};
