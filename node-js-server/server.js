const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const cookieSession = require("cookie-session");
var CronJob = require('cron').CronJob;
const controller = require('./app/controllers/server.controller')

const dbConfig = require("./app/config/db.config");

const app = express();

var corsOptions = {
  origin: ["http://localhost:4200"],
  credentials: true,
};

app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

app.use(
  cookieSession({
    name: "bezkoder-session",
    secret: "COOKIE_SECRET", // should use as secret environment variable
    httpOnly: true,
  })
);

const db = require("./app/models");
const Role = db.role;
const OrganizationCode = db.organization_code;

db.mongoose
  .connect(`mongodb://${dbConfig.HOST}:${dbConfig.PORT}/${dbConfig.DB}`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
  })
  .then(() => {
    console.log("Successfully connect to MongoDB.");
    initial();
  })
  .catch((err) => {
    console.error("Connection error", err);
    process.exit();
  });

// simple route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to bezkoder application." });
});

// routes
require("./app/routes/auth.routes")(app);
require("./app/routes/user.routes")(app);
require("./app/routes/tool.routes")(app);
require("./app/routes/notification.routes")(app);

// set port, listen for requests
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});

function initial() {
  Role.estimatedDocumentCount((err, count) => {
    if (!err && count === 0) {
      new Role({
        name: "user",
      }).save((err) => {
        if (err) {
          console.log("error", err);
        }

        console.log("added 'user' to roles collection");
      });

      new Role({
        name: "moderator",
      }).save((err) => {
        if (err) {
          console.log("error", err);
        }

        console.log("added 'moderator' to roles collection");
      });

      new Role({
        name: "admin",
      }).save((err) => {
        if (err) {
          console.log("error", err);
        }

        console.log("added 'admin' to roles collection");
      });
    }
  });

  OrganizationCode.estimatedDocumentCount((err, count) => {
    if (!err && count === 0) {
      const ORG_CODE = process.env.ORG_CODE || '111111';
      new OrganizationCode({
        _id: mongoose.Types.ObjectId("112211221122"),
        organization_code: ORG_CODE,
      }).save((err) => {
        if (err) {
          console.log("error", err);
        }

        console.log(
          `added organization code ${ORG_CODE} to organization_code collection`
        );
      });
    }
  });

  new CronJob('0 0 * * * *', function() {
    /*
     * For it to runs every midnight: '0 0 * * *' 
     * For it to runs every minute: '0 * * * * *'
     * * For it to runs every hour: '0 0 * * * *'
    */    
    controller.closeExpiredPendingRequests();
    controller.closeExpiredApprovedRequests();
    }, function () {
     /* This function is executed when the job stops */
    },
     true, /* Start the job right now */
     //timeZone /* Time zone of this job. */
    );
}
