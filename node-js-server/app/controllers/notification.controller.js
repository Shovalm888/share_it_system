const db = require("../models");
const Notification = db.notification;

exports.notifications = (req, res) => {
  Notification.find()
    .populate("sender")
    .populate("recipient")
    .then((notifications) => {
      res.status(200).send({ notifications: notifications });
    })
    .catch((err) => {
      res.status(500).send({ message: err });
    });
};

exports.user_notifications = (req, res) => {
  Notification.find({$or: [{ recipient: req.userId }, { sender: req.userId }]})
    .populate("sender")
    .populate("recipient")
    .then((notifications) => {
      res.status(200).send({ notifications: notifications });
    })
    .catch((err) => {
      res.status(500).send({ message: err });
    });
};

exports.create_notification = (req, res) => {
  const notification = Notification({
    content: req.body.content,
    date: req.body.date,
    sender: req.userId,
    recipient: req.body.recipient,
    request: req.body.request,
    link: req.body.link
  });

  notification
    .save()
    .then( notification => {
      res.status(200).send({ message: "Notification was added successfully!", notification: notification });
    })
    .catch((err) => {
      res.status(500).send({ message: err });
    });
};

exports.delete_by_id = (req, res) => {
  Notification.findOneAndRemove({_id: req.params.id, $or: [{ recipient: req.userId }, { sender: req.userId }]})
    .then((results) => {
      if (results) {
        res.status(200).send({ message: 'Notification has been deleted sucessfully!' });
      } 
      else {
        res.status(401).send({ message: "Notification was not found" });
      }
    })
    .catch((err) => {
      res.status(500).send({ message: err });
    });
};
