import getUserId from "./../../utils/getUserId";
import getUser from "./../../utils/getUserId";
import settings from "./../../utils/settings";

const postMutation = {
  createPost(parent, args, { request, prisma }, info) {
    const slug = args.topic;
    const { description } = args.data;
    const user = getUser(request);
    const userId = user.userId;

    if (!description.trim() || description.trim().length < 10) {
      throw new Error("Yazı boş bırakılamaz");
    }

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
  async likePost(parent, args, { request, prisma }, info) {
    const postId = args.id;
    const likeType = args.likeType;
    const user = getUserId(request);

    let previousLikeType = null;
    let previousLikeId = null;
    let amount = 0;
    let budgetType = null;
    let isPayable = false;

    const post = await prisma.query.post(
      {
        where: {
          id: postId,
        },
      },
      `{
        id 
        likesPaidTimes
        dislikesPaidTimes
        user {
          id
        }
        topic {
          id
        }
        likes { 
          id 
          likeType
          user { 
            id
          }
        }
    }`
    );
    if (!post) {
      throw new Error("İçerik bulunamadı");
    }

    const getUserLike = await prisma.query.likes(
      {
        where: {
          AND: [
            {
              user: {
                id: user.userId,
              },
            },
            {
              post: {
                id: postId,
              },
            },
          ],
        },
      },
      `{
      id
      likeType
    }`
    );
    console.log(getUserLike, "GET USER LIKE");
    if (getUserLike.length > 0) {
      previousLikeType = getUserLike[0].likeType;
      previousLikeId = getUserLike[0].id;
    }

    let dislikesPaidTimes = post.dislikesPaidTimes;
    let likesPaidTimes = post.likesPaidTimes;

    if (!previousLikeId) {
      if (args.likeType === "LIKE") {
        if (likesPaidTimes + 1 === settings.likesPaidTimes) {
          amount = settings.likesPaidAmount;
          isPayable = true;
          budgetType = "LIKE";
          likesPaidTimes = 0;
        }

        likesPaidTimes = likesPaidTimes + 1;
      }

      if (args.likeType === "DISLIKE") {
        if (dislikesPaidTimes + 1 === settings.dislikesPaidTimes) {
          amount = settings.dislikesPaidAmount;
          isPayable = true;
          budgetType = "DISLIKE";
          dislikesPaidTimes = 0;
        }
        dislikesPaidTimes = dislikesPaidTimes + 1;
      }
    } else {
      if (previousLikeType === args.likeType) {
        if (previousLikeType === "LIKE") {
          likesPaidTimes = likesPaidTimes - 1;
        } else {
          dislikesPaidTimes = dislikesPaidTimes - 1;
        }
        return prisma.mutation.updatePost({
          where: {
            id: postId,
          },
          data: {
            likesPaidTimes,
            dislikesPaidTimes,
            likes: {
              delete: {
                id: previousLikeId,
              },
            },
          },
        });
      }

      if (previousLikeType === "DISLIKE") {
        dislikesPaidTimes = dislikesPaidTimes - 1;
        likesPaidTimes = likesPaidTimes + 1;
      } else {
        dislikesPaidTimes = dislikesPaidTimes + 1;
        likesPaidTimes = likesPaidTimes - 1;
      }

      if (dislikesPaidTimes === settings.dislikesPaidTimes) {
        amount = settings.dislikesPaidAmount;
        isPayable = true;
        budgetType = "DISLIKE";
        dislikesPaidTimes = 0;
      }
      if (likesPaidTimes === settings.likesPaidTimes) {
        amount = settings.likesPaidAmount;
        isPayable = true;
        budgetType = "LIKE";
        likesPaidTimes = 0;
      }
    }

    if (isPayable) {
      const author = await prisma.query.user(
        {
          where: {
            id: post.user.id,
          },
        },
        `{
        id 
        budget
      }`
      );

      const authorBudget = author.budget;
      const updateAuthor = await prisma.mutation.updateUser({
        where: {
          id: post.user.id,
        },
        data: {
          budget: authorBudget + amount,
        },
      });

      const addTransaction = await prisma.mutation.createTransaction({
        data: {
          amount,
          budgetType,
          user: { connect: { id: post.user.id } },
          topic: { connect: { id: post.topic.id } },
          post: { connect: { id: postId } },
        },
      });
    }

    const likes = {
      create: { likeType, user: { connect: { id: user.userId } } },
    };

    if (previousLikeId) {
      likes.delete = { id: previousLikeId };
    }

    return prisma.mutation.updatePost({
      where: { id: postId },
      data: {
        dislikesPaidTimes,
        likesPaidTimes,
        likes: { ...likes },
      },
    });
  },
  async favoritePost(parent, args, { request, prisma }, info) {
    const postId = args.id;
    const user = getUserId(request);
    const userId = user.userId;

    const post = await prisma.query.post(
      { where: { id: postId } },
      `{
        id 
        favoritesPaidTimes 
        topic {
          id
        }
        user {
          id
        }
      }
      `
    );

    const favExists = await prisma.exists.Favorite({
      user: {
        id: userId,
      },
      post: {
        id: postId,
      },
    });

    if (!favExists) {
      if (post.favoritesPaidTimes + 1 === settings.favouritePaidTimes) {
        const author = await prisma.query.user(
          {
            where: {
              id: post.user.id,
            },
          },
          `{
          id 
          budget
        }`
        );

        const authorBudget = author.budget;
        const updateAuthor = await prisma.mutation.updateUser({
          where: {
            id: post.user.id,
          },
          data: {
            budget: authorBudget + settings.favouritePaidAmount,
          },
        });

        const addTransaction = await prisma.mutation.createTransaction({
          data: {
            amount: settings.favouritePaidAmount,
            budgetType: "FAVORITE",
            user: { connect: { id: post.user.id } },
            topic: { connect: { id: post.topic.id } },
            post: { connect: { id: postId } },
          },
        });
      }

      const increaseInterval = await prisma.mutation.updatePost({
        where: {
          id: postId,
        },
        data: {
          favoritesPaidTimes:
            post.favoritesPaidTimes + 1 === settings.favouritePaidTimes ? 0 : post.favoritesPaidTimes + 1,
        },
      });

      // Add Transaction

      const result = await prisma.mutation.createFavorite(
        {
          data: {
            post: { connect: { id: postId } },
            user: { connect: { id: userId } },
          },
        },
        `{id}`
      );

      if (result) {
        return {
          result: "ADDED",
        };
      }
    }

    const decreaseInterval = await prisma.mutation.updatePost({
      where: {
        id: postId,
      },
      data: {
        favoritesPaidTimes: post.favoritesPaidTimes - 1,
      },
    });

    const result = await prisma.mutation.deleteManyFavorites(
      {
        where: {
          user: {
            id: userId,
          },
          post: {
            id: postId,
          },
        },
      },
      `{count}`
    );
    if (result) {
      return {
        result: "DELETED",
      };
    }
  },
};

export default postMutation;
