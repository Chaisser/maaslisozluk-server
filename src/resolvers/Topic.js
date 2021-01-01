const Topic = {
  postsCount: {
    async resolve(parent, args, { request, prisma }, info) {
      const result = await prisma.query.postsConnection(
        {
          where: {
            topic: {
              id: parent.id,
            },
          },
        },
        `{
        aggregate {
          count
        }
      }`
      );
      return result.aggregate.count;
    },
  },
};
export default Topic;
