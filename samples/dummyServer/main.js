const express = require("express");
const bodyParser = require("body-parser");
const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const port = 8080;

app.get("/hello", (req, res) => {
  const user = req.query.user ?? "";
  res.send(`hello ${user}!`);
});

app.get("/foo", (req, res) => {
  res.send("foo");
});

app.get("/generateCode", (req, res) => {
  const user = req.query.user ?? "";
  const code = user
    .split("")
    .map((ch) => "" + ch.charCodeAt(0))
    .join("");
  res.send({
    code,
  });
});

app.get("/verifyCode", (req, res) => {
  const user = req.query.user ?? "";
  const code = user
    .split("")
    .map((ch) => "" + ch.charCodeAt(0))
    .join("");
  const inputCode = req.query.code ?? "";
  res.send({
    success: inputCode === code,
  });
});

app.listen({ port, backlog: 1000 }, () => {
  console.log(`Dummy app listening at http://127.0.0.1:${port}`);
});
