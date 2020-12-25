import { Prisma } from "prisma-binding";
import { fragmentReplacements } from "./resolvers/index";
const prisma = new Prisma({
  typeDefs: "src/generated/prisma.graphql",
  endpoint: "https://prisma.interaktifis.com/maaslisozluk/prod",
  secret: "interaktifisdiscord",
  fragmentReplacements,
});

export default prisma;
