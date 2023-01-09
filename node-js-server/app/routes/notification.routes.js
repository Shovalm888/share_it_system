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

  app.get("/api/notification/user_notifications/:id", [authJwt.verifyToken], controller.user_notifications);

  app.post("/api/notification/create/", controller.create_notification);

  app.delete("/api/notification/:id", [authJwt.verifyToken], controller.delete_by_id);

};
