import jwt from "jsonwebtoken";
const userQuery = {
  users(parent, args, { prisma, request }, info) {
    return prisma.query.users({}, info);
  },
  user(parent, args, { prisma, request }, info) {
    return prisma.query.user(
      {
        where: {
          id: args.id,
        },
      },
      info
    );
  },
  author(parent, args, { prisma, request }, info) {
    return prisma.query.user(
      {
        where: {
          username: args.username,
        },
      },
      info
    );
  },
  checkUsername(parent, args, { prisma, request }, info) {
    const username = args.username;
    return prisma.query.user(
      {
        where: {
          username,
        },
      },
      `{
        id
      }`
    );
  },
  async checkToken(parent, args, { prisma }, info) {
    const token = args.token;
    const decoded = jwt.verify(token, "thisisasecret");
    const userId = decoded.id;
    const user = await prisma.query.user(
      {
        where: {
          id: userId,
        },
      },
      info
    );
    if (!user) {
      throw new Error("USER_NOT_FOUND");
    }
    return user;
  },
};

export default userQuery;
