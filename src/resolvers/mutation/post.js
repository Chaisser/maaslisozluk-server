import getUser from "./../../utils/getUserId";

const postMutation = {
  createPost(parent, args, { request, prisma }, info) {
    const slug = args.topic;
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
          topic: { connect: { slug } },
        },
      },
      info
    );
  },
  async updatePost(parent, args, { request, prisma }, info) {
    const user = getUser(request);
    const userType = user.userType;
    const userId = user.userId;

    const isExist = await prisma.exists.Post({
      id: args.id,
      user: {
        id: userId,
      },
    });
    if (!isExist) {
      throw new Error("Permission denied");
    }

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
