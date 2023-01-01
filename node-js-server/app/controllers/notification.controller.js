const db = require("../models");
const Tool = db.tool
const ToolRequest = db.tool_request;
const Notification = db.notification;

exports.notifications = (req, res) => {
    Notification.find()
    .populate("owner")
    .populate("recipient")
    .populate("tool_request")
    .then( notifications => {
      res.status(200).send({notifications: notifications});
    }).catch( err => {
      res.status(500).send({message: err});
    });
};

exports.recipient_notifications = (req, res) => {
    Notification.find({recipient: req.params.id})
    .populate("owner")
    .populate("recipient")
    .populate("tool_request")
    .then( notifications => {
      res.status(200).send({notifications: notifications});
    }).catch( err => {
      res.status(500).send({message: err});
    });
};

exports.sender_notifications = (req, res) => {
    Notification.find({sender: req.params.id})
    .populate("owner")
    .populate("recipient")
    .populate("tool_request")
    .then( notifications => {
      res.status(200).send({notifications: notifications});
    }).catch( err => {
      res.status(500).send({message: err});
    });
};
