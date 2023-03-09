const { ApolloServer } = require("apollo-server");
const mongoose = require("mongoose");
require("dotenv").config();

const typeDefs = require("./graphql/typeDefs");
const resolvers = require("./graphql/resolvers/index");

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => ({
    headers: req.headers,
  }),
});

// Connect to DB
const PORT = process.env.PORT || 3001;
const URL = process.env.DATABASE_URL;

mongoose
  .connect(URL)
  .then(() => {
    console.log("Successfully connected to database");
    return server.listen({ port: PORT });
  })
  .then((res) => {
    console.log(`Server running at ${res.url}`);
  })
  .catch((err) => {
    console.error(err);
  });

/*** SocketIO ***/

const { Server } = require("socket.io");
const io = new Server(3002, {
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
