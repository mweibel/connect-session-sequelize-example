const express = require("express");
const Sequelize = require("sequelize");
const session = require("express-session");

const SequelizeStore = require("connect-session-sequelize")(session.Store);
const sequelize = new Sequelize("sqlite::memory");

sequelize.define("Session", {
  sid: {
    type: Sequelize.STRING,
    primaryKey: true,
  },
  userId: Sequelize.STRING,
  expires: Sequelize.DATE,
  data: Sequelize.TEXT,
});

function extendDefaultFields(defaults, session) {
  console.log(defaults, session);
  return {
    data: defaults.data,
    expires: defaults.expires,
    userId: session.userId,
  };
}


const app = express();

const store = new SequelizeStore({
  db: sequelize,
  table: "Session",
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
    res.write("<p>views: " + req.session.userId + "</p>");
    res.write("<p>expires in: " + req.session.cookie.maxAge / 1000 + "s</p>");
    res.end();
  } else {
    req.session.views = 1;
    req.session.userId = "test";
    res.end("welcome to the session demo. refresh!");
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () =>
  console.log(`Example app listening at http://localhost:${port}`)
);
