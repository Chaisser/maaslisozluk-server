import jwt from "jsonwebtoken";

const getUserId = (request, requireAuth = true) => {
  const header = request.request ? request.request.headers.authorization : request.connection.context.Authorization;

  if (header) {
    const token = header.replace("Bearer ", "");
    const decoded = jwt.verify(token, "thisisasecret");
    const userType = decoded.userType;

    return { userId: decoded.id, userType: decoded.userType };
  }

  if (requireAuth) {
    throw new Error("Authentication required");
  }

  return null;
};

export default getUserId;
