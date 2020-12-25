const topicQuery = {
  topics(parent, args, { prisma }, info) {
    return prisma.query.topics({}, info);
  },
  topic(parent, args, { prisma }, info) {
    return prisma.query.topic(
      {
        where: {
          id: args.id,
        },
      },
      info
    );
  },
};

export default topicQuery;
