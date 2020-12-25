import userQuery from "./query/user";
import categoryQuery from "./query/category";
import topicQuery from "./query/topic";
const Query = {
  ...userQuery,
  ...categoryQuery,
  ...topicQuery,
};

export default Query;
