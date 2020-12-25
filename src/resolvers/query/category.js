const categoryQuery = {
  categories(parent, args, { prisma }, info) {
    return prisma.query.categories({}, info);
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
