const topicQuery = {
  topics(parent, args, { prisma }, info) {
    return prisma.query.topics({ orderBy: "updatedAt_DESC" }, info);
  },
  topic(parent, args, { prisma }, info) {
    return prisma.query.topic(
      {
        where: {
          slug: args.slug,
        },
      },
      info
    );
  },
  authorTopics(parent, args, { prisma }, info) {
    return prisma.query.topics(
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

export default topicQuery;
