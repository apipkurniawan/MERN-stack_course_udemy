const fs = require("fs");
const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");

const mongoose = require("mongoose");
const HttpError = require("./models/http-error");
const placesRoutes = require("./routes/places-routes");
const usersRoutes = require("./routes/users-routes");

const app = express();

app.use(bodyParser.json());

// handle url images
app.use("/uploads/images", express.static(path.join("uploads", "images")));

// handle CORS-Origin
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE");
  next();
});

app.use("/api/places", placesRoutes);
app.use("/api/users", usersRoutes);

app.use((req, res, next) => {
  const error = new HttpError("Could not find this route", 404); // handle undefined route
  throw error;
});

app.use((error, req, res, next) => {
  if (req.file) {
    // validate penyimpanan image, jika ada error saat simpan, image tidak akan tersimpan
    console.log(req.file);
    fs.unlink(req.file.path, (err) => {
      console.log(err);
    });
  }
  if (res.headerSent) {
    return next(error);
  }
  res.status(error.code || 500);
  res.json({ message: error.message || "An unknown error occurred!" });
});

mongoose
  .connect("mongodb://localhost:27017/node-react")
  .then(() => {
    console.log("connect to database");
    app.listen(5000);
  })
  .catch(() => {
    console.log("not connect to database");
  });
