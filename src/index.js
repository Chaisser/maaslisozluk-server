import { GraphQLServer } from "graphql-yoga";
import { resolvers, fragmentReplacements } from "./resolvers/index";
import prisma from "./prisma";
//https://api.coindesk.com/v1/bpi/currentprice/TRY.json
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
