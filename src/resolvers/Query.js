import userQuery from "./query/user";
import categoryQuery from "./query/category";
import topicQuery from "./query/topic";
import postQuery from "./query/post";
import currencyQuery from "./query/currency";
const Query = {
  ...userQuery,
  ...categoryQuery,
  ...topicQuery,
  ...postQuery,
  ...currencyQuery,
};

export default Query;
