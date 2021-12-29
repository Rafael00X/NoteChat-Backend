const { ApolloServer } = require("apollo-server");
const mongoose = require("mongoose");
require("dotenv").config();

const typeDefs = require("./graphql/typeDefs");
const resolvers = require("./graphql/resolvers/index");

const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => ({
        headers: req.headers
    })
});

// Connect to DB
const PORT = process.env.PORT || 4000;
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

// Socket

const { Server } = require("socket.io");
const io = new Server(9000, {
    cors: {
        origin: "*"
    }
});

io.on("connection", (clientSocket) => {
    const id = clientSocket.handshake.query.id;
    clientSocket.join(id);
    console.log("Connected: " + clientSocket.id);

    // data = { conversationId, recipient, senderId, senderName, message}

    clientSocket.on("send-message", (data) => {
        clientSocket.emit("receive-message", data);
        clientSocket.to(data.recipient).emit("receive-message", data);
        console.log("Send message to user " + data.recipient);
    });
});
