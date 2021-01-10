const topicQuery = {
  topics(parent, args, { prisma }, info) {
    const opArgs = {
      orderBy: "updatedAt_DESC",
    };
    if (args.category) {
      opArgs.where = {
        category: {
          slug: args.category,
        },
      };
    }
    return prisma.query.topics(opArgs, info);
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
