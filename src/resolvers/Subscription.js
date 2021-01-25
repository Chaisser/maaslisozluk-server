const Subscription = {
  transactionSubscription: {
    subscribe(parent, args, { prisma, request }, info) {
      return prisma.subscription.transaction({}, info);
    },
  },
  livePostSubscription: {
    subscribe(parent, args, { prisma, request }, info) {
      return prisma.subscription.post(
        {
          where: {
            AND: [
              {
                node: {
                  AND: [{ topic: { slug: args.slug } }, { status: "ACTIVE" }],
                },
              },
              { mutation_in: "CREATED" },
            ],
          },
        },
        info
      );
    },
  },
};

export default Subscription;
