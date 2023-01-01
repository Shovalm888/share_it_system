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

  app.get("/api/tool/tools", [authJwt.verifyToken], controller.tools);

  app.get("/api/tool/board-tool/:id", [authJwt.verifyToken], controller.tool_by_id);

  app.post("/api/tool/add", [authJwt.verifyToken], controller.add);

  app.post("/api/tool/request/", [authJwt.verifyToken], controller.request);

  app.delete("/api/tool/board-tool/:id", [authJwt.verifyToken], controller.delete_by_id);

};
