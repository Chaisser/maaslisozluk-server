import { extractFragmentReplacements } from "prisma-binding";
import Query from "./Query";
import Mutation from "./Mutation";
import Subscription from "./Subscription";
import User from "./User";
import Topic from "./Topic";
import Category from "./Category";
import Post from "./Post";

const resolvers = {
  Query,
  Mutation,
  User,
  Topic,
  Category,
  Post,
};

const fragmentReplacements = extractFragmentReplacements(resolvers);

export { resolvers, fragmentReplacements };
