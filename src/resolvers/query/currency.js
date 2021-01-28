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

  currencies(parent, args, { prisma }, info) {
    return prisma.query.currencies(
      {
        last: 5,
      },
      `{
        id 
        usDollar
        turkishLira
        createdAt
      }`
    );
  },
};

export default topicQuery;
