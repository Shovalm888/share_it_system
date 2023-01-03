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

  app.get("/api/tool/tool-history/:id", [authJwt.verifyToken], controller.tool_history);

  app.get("/api/tool/board-tool/:id", [authJwt.verifyToken], controller.tool_by_id);

  app.post("/api/tool/add", [authJwt.verifyToken], controller.add);

  app.post("/api/tool/board-tool/:id", [authJwt.verifyToken], controller.request);

  app.delete("/api/tool/board-tool/:id", [authJwt.verifyToken], controller.delete_by_id);

  app.delete("/api/tool/board-tool/requests/:id", [authJwt.verifyToken], controller.delete_request);

  app.get("/api/tool/board-tool/requests", [authJwt.verifyToken], controller.requests);

  app.post("/api/tool/board-tool/request/feedback", [authJwt.verifyToken], controller.request_feedback);

  app.get("/api/tool/board-tool/requests/:id", [authJwt.verifyToken], controller.tool_requests);

  app.post("/api/tool/board-tool/request/:id", [authJwt.verifyToken], controller.update_request);

  app.post("/api/tool/board-tool/request_status/:id", [authJwt.verifyToken], controller.update_request_status);
};
