const User = {
  topicsCount: {
    async resolve(parent, args, { request, prisma }, info) {
      const result = await prisma.query.topicsConnection(
        {
          where: {
            user: {
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
  postsCount: {
    async resolve(parent, args, { request, prisma }, info) {
      const result = await prisma.query.postsConnection(
        {
          where: {
            user: {
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
export default User;
