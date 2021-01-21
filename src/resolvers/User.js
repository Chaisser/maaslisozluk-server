import getUserId from "./../utils/getUserId";

const User = {
  username: {
    async resolve(parent, args, { request, prisma }, info) {
      const user = getUserId(request, false);
      if (user.userId && parent.id === user.userId) {
        return parent.username;
      }
      return "not-permitted";
    },
  },
  email: {
    async resolve(parent, args, { request, prisma }, info) {
      const user = getUserId(request, false);
      if (user.userId && parent.id === user.userId) {
        return parent.email;
      }
      return "not-permitted";
    },
  },
  phoneNumber: {
    async resolve(parent, args, { request, prisma }, info) {
      const user = getUserId(request, false);
      if (user.userId && parent.id === user.userId) {
        return parent.phoneNumber;
      }
      return "not-permitted";
    },
  },
  topicsCount: {
    async resolve(parent, args, { request, prisma }, info) {
      const result = await prisma.query.topicsConnection(
        {
          where: {
            user: {
              id: parent.id,
            },
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
  postsCount: {
    async resolve(parent, args, { request, prisma }, info) {
      const result = await prisma.query.postsConnection(
        {
          where: {
            user: {
              id: parent.id,
            },
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
};
export default User;
