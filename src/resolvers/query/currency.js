const topicQuery = {
  async currency(parent, args, { prisma }, info) {
    const result = await prisma.query.currencies(
      {
        orderBy: "createdAt_DESC",
        first: 1,
      },
      `{
        id 
        usDollar
        turkishLira
        createdAt
      }`
    );
    return result[0];
  },
};

export default topicQuery;
