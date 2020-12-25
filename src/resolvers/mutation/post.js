import getUser from "./../../utils/getUserId";

const postMutation = {
  createPost(parent, args, { request, prisma }, info) {
    const topicId = args.topic;
    const { description } = args.data;
    const user = getUser(request);
    const userId = user.userId;

    return prisma.mutation.createPost(
      {
        data: {
          description,
          favoritesPaidTimes: 0,
          likesPaidTimes: 0,
          dislikesPaidTimes: 0,
          user: { connect: { id: userId } },
          topic: { connect: { id: topicId } },
        },
      },
      info
    );
  },
  updatePost(parent, args, { request, prisma }, info) {
    const user = getUser(request);
    const userType = user.userType;
    //TO-DO check if this post has user.

    const data = {};

    if (typeof args.data.description === "string") {
      data.description = args.data.description;
    }

    return prisma.mutation.updatePost({
      where: {
        id: args.id,
      },
      data,
    });
  },
  deletePost(parent, args, { request, prisma }, info) {
    const user = getUser(request);
    const userType = user.userType;

    if (userType !== "ADMIN" && userType !== "MODERATOR") {
      throw new Error("Permission denied.");
    }

    return prisma.mutation.deletePost(
      {
        where: {
          id: args.id,
        },
      },
      info
    );
  },
};

export default postMutation;
