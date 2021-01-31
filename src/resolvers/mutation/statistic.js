import getUser from "./../../utils/getUserId";
const statisticMutation = {
  createStatistic(parent, args, { request, prisma }, info) {
    const topicSlug = args.topic;
    let userData = null;
    const user = getUser(request, false);
    if (user) {
      userData = {
        connect: {
          id: user.userId,
        },
      };
    }

    return prisma.mutation.createStatistic(
      {
        data: {
          topic: {
            connect: {
              slug: topicSlug,
            },
          },
          user: userData,
          ip: "127.0.0.1",
        },
      },
      info
    );
  },
};

export default statisticMutation;
