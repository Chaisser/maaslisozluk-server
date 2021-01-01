import userQuery from "./query/user";
import categoryQuery from "./query/category";
import topicQuery from "./query/topic";
import postQuery from "./query/post";
const Query = {
  ...userQuery,
  ...categoryQuery,
  ...topicQuery,
  ...postQuery,
};

export default Query;
