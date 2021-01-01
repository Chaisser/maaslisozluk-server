import { extractFragmentReplacements } from "prisma-binding";
import Query from "./Query";
import Mutation from "./Mutation";
import Subscription from "./Subscription";
import User from "./User";
import Topic from "./Topic";
import Category from "./Category";
const resolvers = {
  Query,
  Mutation,
  User,
  Topic,
  Category,
};

const fragmentReplacements = extractFragmentReplacements(resolvers);

export { resolvers, fragmentReplacements };
