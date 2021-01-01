const Category = {
  topicsCount: {
    async resolve(parent, args, { request, prisma }, info) {
      const result = await prisma.query.topicsConnection(
        {
          where: {
            category: {
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
export default Category;
