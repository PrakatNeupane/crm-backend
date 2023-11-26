const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
require("dotenv").config();

const port = 3001;

//handle api security
// app.use(helmet());

// handle cors error
app.use(cors());

// mongoDB connection
const mongoose = require("mongoose");
mongoose.connect(process.env.MONGO_URL);

if (process.env.NODE_ENV !== "production") {
  const mDb = mongoose.connection;
  mDb.on("open", () => {
    console.log("MongoDB is now connected");
  });

  mDb.on("error", (error) => {
    console.log(error);
  });
  // logger
  app.use(morgan("tiny"));
}

// body parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// load routers
const userRouter = require("./src/routers/user.router");
const ticketRouter = require("./src/routers/ticket.router");
const tokensRouter = require("./src/routers/tokens.router");

// Use routers
app.use("/v1/user", userRouter);
app.use("/v1/ticket", ticketRouter);
app.use("/v1/tokens", tokensRouter);

//Error handler
const handleError = require("./src/utils/errorHandler");
app.use((req, res, next) => {
  const error = new Error("Resources not found");
  error.status = 404;
  next(error);
});

app.use((error, req, res, next) => {
  handleError(error, res);
});

app.listen(port, () => {
  console.log(`listening on port http://localhost:${port}`);
});
