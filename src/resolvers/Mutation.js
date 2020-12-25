import userMutation from "./mutation/user";
import categoryMutation from "./mutation/category";
import topicMutation from "./mutation/topic";
import postMutation from "./mutation/post";

const Mutation = {
  ...userMutation,
  ...categoryMutation,
  ...topicMutation,
  ...postMutation,
};

export default Mutation;
