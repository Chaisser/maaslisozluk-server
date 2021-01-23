const Subscription = {
  transactionSubscription: {
    subscribe(parent, args, { prisma, request }, info) {
      return prisma.subscription.transaction({}, info);
    },
  },
};

export default Subscription;
