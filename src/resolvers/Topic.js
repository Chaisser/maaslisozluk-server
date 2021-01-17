const Topic = {
  // posts: {
  //   async resolve(parent, args, { request, prisma }, info) {
  //     console.log(args, "ARGS");
  //   },
  // },
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
