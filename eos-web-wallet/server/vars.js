const path = require("path");

// import .env variables
require("dotenv-safe").load({
  path: path.join(__dirname, "../.env"),
  sample: path.join(__dirname, "../.env.example")
});

module.exports = {
  env: process.env.NODE_ENV || "development",
  port: process.env.PORT || 9000,
  mongo: {
    uri:
      process.env.NODE_ENV === "test"
        ? process.env.MONGO_URI_TESTS
        : process.env.MONGO_URI
  },
  eosd: {
    uri:
      process.env.NODE_ENV === "test"
        ? process.env.API_URI_TESTS
        : process.env.API_URI
  },
  sessionKey: process.env.SESSION_KEY,
  logs: process.env.NODE_ENV === "production" ? "combined" : "dev"
};
