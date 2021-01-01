const categoryQuery = {
  categories(parent, args, { prisma }, info) {
    const opArgs = {};
    if (args.first) {
      opArgs.first;
    }
    return prisma.query.categories(opArgs, info);
  },
  category(parent, args, { prisma }, info) {
    return prisma.query.category(
      {
        where: {
          id: args.id,
        },
      },
      info
    );
  },
};

export default categoryQuery;
