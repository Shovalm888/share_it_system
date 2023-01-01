const { authJwt } = require("../middlewares");
const controller = require("../controllers/notification.controller");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, Content-Type, Accept"
    );
    next();
  });

  app.get("/api/notification/notifications/", [authJwt.verifyToken], controller.notifications);

  app.get("/api/notification/recipient_notifications/:id", [authJwt.verifyToken], controller.recipient_notifications);

  app.get("/api/notification/sender_notifications/:id", [authJwt.verifyToken], controller.sender_notifications);
};
