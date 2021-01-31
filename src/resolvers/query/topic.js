const topicQuery = {
  async topics(parent, args, { prisma }, info) {
    const skip = args.skip ? args.skip : 0;
    const first = args.first ? args.first : 150;
    const orderBy = args.orderBy ? args.orderBy : "updatedAt_DESC";

    const opArgs = {
      orderBy,
      skip,
      first,
    };

    if (args.category) {
      opArgs.where = {
        category: {
          slug: args.category,
        },
      };
    }
    const topics = await prisma.query.topics(
      opArgs,
      `
    {
      id
      title
      slug
      createdAt
      updatedAt
    }
    `
    );

    delete opArgs.skip;
    delete opArgs.first;

    const totalTopic = await prisma.query.topicsConnection(
      opArgs,
      `{
      aggregate { 
        count
      }
    }`
    );

    return {
      topics,
      totalTopic: totalTopic.aggregate.count,
    };
  },
  topic(parent, args, { prisma }, info) {
    try {
      return prisma.query.topic(
        {
          where: {
            slug: args.slug,
          },
        },
        info
      );
    } catch (err) {
      return null;
    }
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
