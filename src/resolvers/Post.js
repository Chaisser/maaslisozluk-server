import getUserId from "./../utils/getUserId";

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
};
export default Post;
