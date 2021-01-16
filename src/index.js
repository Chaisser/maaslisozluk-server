import { GraphQLServer } from "graphql-yoga";
import { resolvers, fragmentReplacements } from "./resolvers/index";
import prisma from "./prisma";
import cron from "node-cron";
import fetchCurrency from "./utils/fetchCurrency";

cron.schedule("30 * * * *", () => {
  fetchCurrency();
  console.log("currency has updated!");
});

const server = new GraphQLServer({
  typeDefs: "./src/schema.graphql",
  resolvers,
  context(request) {
    return {
      prisma,
      request,
    };
  },
  fragmentReplacements,
});

server.start(() => {
  console.log("The server is up!");
});
