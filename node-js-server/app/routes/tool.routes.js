const { authJwt } = require("../middlewares");
const controller = require("../controllers/tool.controller");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, Content-Type, Accept"
    );
    next();
  });

  app.get("/api/tool/tools", controller.tools);

  app.post("/api/tool/add", [authJwt.verifyToken], controller.add);

};
