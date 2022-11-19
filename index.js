const express = require("express");
const app = express();
// const cors = require("cors");
// app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
const mongoose = require("mongoose");
mongoose.connect("mongodb://localhost:27017/iNotebook", {
  useNewUrlParser: true,
});

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.use("/create-user", require("./routes/create-user"));
app.use("/notes", require("./routes/notes"));

app.listen(process.env.PORT || 5000, () => {
  console.log("Server listening on port 5000");
});
