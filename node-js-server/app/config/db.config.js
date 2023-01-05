require("dotenv").config({ path: __dirname + "/.env" });

module.exports = {
  HOST: "localhost",
  PORT: 27017,
  DB: "share_it",

  REMOTE_USERNAME: process.env.REMOTE_USERNAME,
  REMOTE_PASSWORD: process.env.REMOTE_PASSWORD,
};