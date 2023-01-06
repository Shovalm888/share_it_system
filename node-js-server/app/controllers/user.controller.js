const db = require("../models");
const mongoose = require("mongoose");
require("dotenv").config({ path: __dirname + "/.env" });
const OrganizationCode = db.organization_code;
const User = db.user;

exports.allAccess = (req, res) => {
  res.status(200).send("Public Content.");
};

exports.userBoard = (req, res) => {
  res.status(200).send("User Content.");
};

exports.adminBoard = (req, res) => {
  res.status(200).send("Admin Content.");
};

exports.moderatorBoard = (req, res) => {
  res.status(200).send("Moderator Content.");
};

exports.setOrganizationCode = (req, res) => {
  const id = mongoose.Types.ObjectId('112211221122');
  const new_code = req.body.organization_code;

  OrganizationCode.findOneAndUpdate({_id: id}, {organization_code: new_code})
  .then( results => {
    res.status(200).send({message: results});
  })
  .catch( err => {
    res.status(500).send({message: err});
  });
};

exports.users = (req, res) => {
  User.find({_id: {$ne: mongoose.Types.ObjectId(`${process.env.SHAREIT_SYSTEM_USER_ID || '112211221122'}`)}})
  .populate("roles", "name").then( users => {
    res.status(200).send({users: users});
  }).catch( err => {
    res.status(500).send({message: err});
  });  
};

exports.user = (req, res) => {
  User.findOne({_id: req.params.id}).populate("roles", "name").then( user => {
    res.status(200).send({user: user});
  }).catch( err => {
    res.status(500).send({message: err});
  });  
};