import getUserId from "./../utils/getUserId";
import _ from "lodash";

const Post = {
  isEditable: {
    fragment: "fragment userId on Post { user {id} }",
    async resolve(parent, args, { request, prisma }, info) {
      const user = getUserId(request, false);
      let userId = null;
      if (user) {
        userId = user.userId;
      }

      if (userId && userId === parent.user.id) {
        return true;
      }
      return false;
    },
  },
  totalEarnings: {
    async resolve(parent, args, { request, prisma }, info) {
      const transactions = await prisma.query.transactions(
        {
          where: {
            post: {
              id: parent.id,
            },
          },
        },
        `{id amount}`
      );

      return _.sumBy(transactions, "amount");
    },
  },
  likesCount: {
    async resolve(parent, args, { request, prisma }, info) {
      const result = await prisma.query.likesConnection(
        {
          where: {
            AND: [
              {
                post: {
                  id: parent.id,
                },
              },
              {
                likeType: "LIKE",
              },
            ],
          },
        },
        `{
        aggregate {
          count
        }
      }`
      );
      return result.aggregate.count;
    },
  },
  userLiked: {
    fragment: "fragment userId on Post { user {id} }",
    async resolve(parent, args, { request, prisma }, info) {
      const user = getUserId(request, false);
      if (!user) {
        return null;
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
                  id: parent.id,
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
      if (getUserLike) {
        return getUserLike.likeType;
      }

      return null;
    },
  },
};
export default Post;
