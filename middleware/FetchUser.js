const jwt = require("jsonwebtoken");
const jwtSecret = "RudraIsTheBest";
const fetchUser = async (req, res, next) => {
  const token = await req.header("auth-token");
  if (!token) {
    res.status(401).send({ error: "Invalid Token" });
  }
  try {
    const data = jwt.verify(token, jwtSecret);
    req.userId = data.id;
    next();
  } catch (error) {
    res.status(401).send({ error: "Invalid Token" });
  }
};

module.exports = fetchUser;
