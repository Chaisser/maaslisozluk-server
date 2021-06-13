import getUserId from "./../../utils/getUserId";
import getUser from "./../../utils/getUserId";
import settings from "./../../utils/settings";

const postMutation = {
  async createPost(parent, args, { request, prisma }, info) {
    const slug = args.topic;
    const { description } = args.data;
    const user = getUser(request);
    const userId = user.userId;

    if (!description.trim() || description.trim().length < 10) {
      throw new Error("Yazı boş bırakılamaz");
    }

    const topic = await prisma.mutation.updateTopic({
      where: {
        slug,
      },
      data: {
        slug,
      },
    });

    return prisma.mutation.createPost(
      {
        data: {
          description,
          favoritesPaidTimes: 0,
          likesPaidTimes: 0,
          dislikesPaidTimes: 0,
          user: { connect: { id: userId } },
          topic: { connect: { slug } },
          status: args.data.status ? args.data.status : "ACTIVE",
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
    // console.log(user, "USER FROM POST.JS");
    let previousLikeType = null;
    let previousLikeId = null;
    let amount = 0;
    let budgetType = null;
    let isPayable = false;

    const waitALittle = (sec) => {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve("ok");
        }, sec);
      });
    };
    const isExist = () => {
      return new Promise((resolve, reject) => {
        prisma.exists
          .Post({
            id: postId,
            user: {
              id: user.userId,
            },
          })
          .then((result) => {
            if (result) {
              reject("kendini beğenmiş");
            }
            resolve("ok");
          })
          .catch((err) => {
            console.log(err, "isExist");
            reject("bir hata oluştu - isExist");
          });
      });
    };

    const isLikeExist = () => {
      return new Promise((resolve, reject) => {
        prisma.exists
          .Like({
            post: {
              id: postId,
            },
            likeType,
            user: {
              id: user.userId,
            },
          })
          .then((result) => {
            if (result) {
              reject("tekrar eden like");
            }
            resolve("ok");
          })
          .catch((err) => {
            console.log(err, "isLikeExist");
            reject("bir hata oluştu - isLikeExist");
          });
      });
    };

    const post = () => {
      return new Promise((resolve, reject) => {
        prisma.query
          .post(
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
          )
          .then((result) => {
            if (!result) {
              reject("içerik bulunamadı");
            }
            resolve(result);
          })
          .catch((err) => {
            console.log(err, "post");
            reject("bir hata oluştu - post");
          });
      });
    };

    const doLike = (post) => {
      return new Promise((resolve, reject) => {
        prisma.query
          .likes(
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
                      id: post.id,
                    },
                  },
                ],
              },
            },
            `{
          id
          likeType
        }`
          )
          .then((getUserLike) => {
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
              resolve({
                likesPaidTimes,
                dislikesPaidTimes,
                previousLikeId,
                isPayable,
                budgetType,
                amount,
                likeTypeSimilarity: false,
              });
            } else {
              if (previousLikeType === args.likeType) {
                if (previousLikeType === "LIKE") {
                  likesPaidTimes = likesPaidTimes - 1;
                } else {
                  dislikesPaidTimes = dislikesPaidTimes - 1;
                }

                resolve({
                  likesPaidTimes,
                  dislikesPaidTimes,
                  previousLikeId,
                  isPayable,
                  budgetType,
                  amount,
                  likeTypeSimilarity: true,
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
              resolve({
                likesPaidTimes,
                dislikesPaidTimes,
                previousLikeId,
                isPayable,
                budgetType,
                amount,
                likeTypeSimilarity: false,
              });
            }
          });
      });
    };

    const addPayment = (paymentData, post) => {
      console.log(post, "POST FROM 309 POST.JS");
      return new Promise((resolve, reject) => {
        if (paymentData.isPayable) {
          console.log("burada");
          prisma.query
            .user(
              {
                where: {
                  id: post.user.id,
                },
              },
              `{
            id
            budget
          }`
            )
            .then((userData) => {
              console.log(userData, "USER DATA FROM 326 POST:js");
              const authorBudget = userData.budget;
              console.log(authorBudget, "AUTHOR BUDGET");
              prisma.mutation
                .updateUser({
                  where: {
                    id: post.user.id,
                  },
                  data: {
                    budget: authorBudget + paymentData.amount,
                  },
                })
                .then((updatedUserData) => {
                  prisma.mutation
                    .createTransaction({
                      data: {
                        amount: paymentData.amount,
                        budgetType: paymentData.budgetType,
                        user: { connect: { id: post.user.id } },
                        topic: { connect: { id: post.topic.id } },
                        post: { connect: { id: post.id } },
                      },
                    })
                    .then((result) => {
                      resolve("payment and transaction added");
                    });
                });
            });
        } else {
          resolve("payment not added");
        }
      });
    };

    const updatePost = (likeData) => {
      return new Promise((resolve, reject) => {
        const likes = {};
        if (likeData.previousLikeId) {
          likes.delete = {
            id: likeData.previousLikeId,
          };
        }
        if (!likeData.likeTypeSimilarity) {
          likes.create = {
            likeType,
            user: {
              connect: { id: user.userId },
            },
          };
        }
        prisma.mutation
          .updatePost({
            where: {
              id: postId,
            },
            data: {
              likesPaidTimes: likeData.likesPaidTimes,
              dislikesPaidTimes: likeData.dislikesPaidTimes,
              likes,
            },
          })
          .then((result) => {
            console.log("RESOLVE UPDATE POST");
            resolve(result);
          })
          .catch((err) => {
            console.log(err, "ERROR UPDATE POST");
            reject("hata update post");
          });
      });
    };

    // const isPostExists = await isExist();
    // const isLikeExists = await isLikeExist();
    // const postData = await post();
    const control = await Promise.all([isExist(), isLikeExist(), post()]);
    console.log(control[2], "CONTROL 2 POST.JS");
    const likeData = await doLike(control[2]);
    const postAndPayment = await Promise.all([
      addPayment(likeData, control[2]),
      updatePost(likeData),
    ]);
    return postAndPayment[1];
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
            post.favoritesPaidTimes + 1 === settings.favouritePaidTimes
              ? 0
              : post.favoritesPaidTimes + 1,
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
