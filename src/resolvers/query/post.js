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
};

export default postQuery;
