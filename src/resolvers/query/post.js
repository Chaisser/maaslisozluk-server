import getUserId from "./../../utils/getUserId";

const postQuery = {
  authorPosts(parent, args, { prisma }, info) {
    return prisma.query.posts(
      {
        where: {
          user: {
            username: args.user,
          },
        },
        orderBy: "updatedAt_DESC",
      },
      info
    );
  },
  async post(parent, args, { prisma, request }, info) {
    const user = getUserId(request);
    const userId = user.userId;
    const isExist = await prisma.exists.Post({
      id: args.id,
      user: {
        id: userId,
      },
    });
    if (!isExist) {
      throw new Error("Permission denied");
    }

    const result = await prisma.query.post(
      {
        where: {
          id: args.id,
        },
      },
      `{
        id 
        description
        topic {
          id 
          title
          slug
        }
      }`
    );
    return result;
  },
};

export default postQuery;
