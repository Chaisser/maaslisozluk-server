import getUser from "./../../utils/getUserId";
import getSlug from "speakingurl";
const topicMutation = {
  createTopic(parent, args, { request, prisma }, info) {
    const categoryId = args.category;
    const { title, description } = args.data;
    const user = getUser(request);
    const userId = user.userId;
    if (title.trim().length > 60) {
      throw new Error("başlık 60 karakteri geçemez");
    }
    const data = {
      title: title.trim(),
      slug: getSlug(title, { lang: "tr" }),
      paidTimes: 0,
      status: true,
      category: {
        connect: {
          id: categoryId,
        },
      },
      user: {
        connect: {
          id: userId,
        },
      },
      posts: {
        create: {
          description,
          favoritesPaidTimes: 0,
          likesPaidTimes: 0,
          dislikesPaidTimes: 0,
          user: { connect: { id: userId } },
          status: "ACTIVE",
        },
      },
    };
    return prisma.mutation.createTopic(
      {
        data,
      },
      info
    );
  },
  updateTopic(parent, args, { request, prisma }, info) {
    const user = getUser(request);
    const userType = user.userType;
    if (userType !== "ADMIN" && userType !== "MODERATOR") {
      throw new Error("Permission denied.");
    }

    return prisma.mutation.updateTopic({
      where: {
        id: args.id,
      },
      data: {
        title: args.data.title,
      },
    });
  },
  deleteTopic(parent, args, { request, prisma }, info) {
    const user = getUser(request);
    const userType = user.userType;
    if (userType !== "ADMIN" && userType !== "MODERATOR") {
      throw new Error("Permission denied.");
    }

    return prisma.mutation.deleteTopic(
      {
        where: {
          id: args.id,
        },
      },
      info
    );
  },
};

export default topicMutation;
