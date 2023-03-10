const { ApolloServer } = require("apollo-server");
const mongoose = require("mongoose");
require("dotenv").config();

const typeDefs = require("./graphql/typeDefs");
const resolvers = require("./graphql/resolvers/index");

const GRAPHQL_PORT = 3001;
const SOCKET_PORT = 3002;
const DATABASE_URL = process.env.DATABASE_URL;

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => ({
    headers: req.headers,
  }),
});

mongoose
  .connect(DATABASE_URL)
  .then(() => {
    console.log("Successfully connected to database");
    return server.listen({ port: GRAPHQL_PORT });
  })
  .then((res) => {
    console.log("Server running");
  })
  .catch((err) => {
    console.error(err);
  });

/*** SocketIO ***/

const { Server } = require("socket.io");
const io = new Server(SOCKET_PORT, {
  cors: {
    origin: "*",
  },
});

const RECEIVE_CONVERSATION = "receive-conv";
const RECEIVE_MESSAGE = "receive-message";
const SEND_CONVERSATION = "send-conv";
const SEND_MESSAGE = "send-message";

io.on("connection", (clientSocket) => {
  const id = clientSocket.handshake.query.id;
  clientSocket.join(id);
  console.log("Connected: " + clientSocket.id);

  clientSocket.on(SEND_MESSAGE, (data) => {
    clientSocket.emit(RECEIVE_MESSAGE, data);
    clientSocket.to(data.recipient).emit(RECEIVE_MESSAGE, data);
  });

  clientSocket.on(SEND_CONVERSATION, (data) => {
    clientSocket.emit(RECEIVE_CONVERSATION, data);
    clientSocket.to(data.recipient).emit(RECEIVE_CONVERSATION, data);
  });
});
