const express = require("express");
const Sequelize = require("sequelize");
const session = require("express-session");

const SequelizeStore = require("connect-session-sequelize")(session.Store);
const sequelize = new Sequelize("sqlite::memory");
const Session = sequelize.define("app_sessions", {
  sid: {
    type: Sequelize.STRING,
    primaryKey: true,
  },
  expires: Sequelize.DATE,
  data: Sequelize.STRING(50000),
});

const extendDefaultFields = (defaults, session) => ({
  data: defaults.data,
  expires: defaults.expires,
});

const app = express();

const store = new SequelizeStore({
  db: sequelize,
  table: "Session",
  checkExpirationInterval: 24 * 60 * 60 * 1000,
  expiration: 14 * 86400,
  extendDefaultFields,
});

app.use(
  session({
    secret: "guinea pig",
    store,
    resave: false,
    proxy: true,
  })
);

store.sync();

app.get("/", (req, res) => {
  if (req.session.views) {
    req.session.views++;
    res.setHeader("Content-Type", "text/html");
    res.write("<p>views: " + req.session.views + "</p>");
    res.write("<p>expires in: " + req.session.cookie.maxAge / 1000 + "s</p>");
    res.end();
  } else {
    req.session.views = 1;
    res.end("welcome to the session demo. refresh!");
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () =>
  console.log(`Example app listening at http://localhost:${port}`)
);
