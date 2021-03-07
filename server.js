require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const dns = require("dns");
const url = require("url");

app.use(bodyParser.urlencoded({ extended: false }));

// Basic Configuration
const port = process.env.PORT || 3000;

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const urlshort = mongoose.Schema({
  original_url: { type: String, required: true },
  short_url: { type: String },
});

const ShortURL = mongoose.model("ShortURL", urlshort);

app.use(cors());

app.use("/public", express.static(`${process.cwd()}/public`));

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

// Your first API endpoint
app.get("/api/hello", function (req, res) {
  res.json({ greeting: "hello API" });
});

app.post("/api/shorturl/new", function (req, res) {
  const original_url = url.parse(req.body.url);
  // const original_url= req.body.url
  dns.lookup(original_url.hostname, (error, address, family) => {
    if (address) {
      const sh = new ShortURL({ original_url: original_url.href });
      sh.save();
      return res.json({ original_url: sh.original_url, short_url: sh._id });
    }
    res.json({ error: "invalid url" });
  });
});

app.get("/api/shorturl/:id", (req, res) => {
  const id = req.params.id;
  ShortURL.findById(id, (error, shorturl) => {
    if (error) return res.json({ error: "invalid url" });
    res.redirect(shorturl.original_url)
  });
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
