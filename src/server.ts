import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";

import { resolvers } from "./resolvers/query";
import typesDefFile from "./schema";

const server = new ApolloServer({
  typeDefs: typesDefFile,
  resolvers

});

await startStandaloneServer(server, {
  listen: { port: 4000 }

})
.then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);

})
.catch((error: unknown) => {
  console.error(error);

});
