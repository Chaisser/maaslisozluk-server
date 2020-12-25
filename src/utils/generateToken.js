import jwt from "jsonwebtoken";

const generateToken = (id, userType) => {
  return jwt.sign({ id, userType }, "thisisasecret");
};

export default generateToken;
