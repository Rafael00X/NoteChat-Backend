const { gql } = require("apollo-server");

const typeDefs = gql`
    type Comment {
        id: ID!
        userId: ID!
        username: String!
        body: String!
        createdAt: String!
    }

    type Like {
        id: ID!
        userId: ID!
        username: String!
        createdAt: String!
    }

    type Post {
        id: ID!
        userId: ID!
        username: String!
        body: String!
        createdAt: String!
        editedAt: String!
        commentCount: Int!
        comments: [Comment]!
        likeCount: Int!
        likes: [Like]!
    }

    type User {
        id: ID!
        email: String!
        username: String!
        password: String!
        createdAt: String!
        conversations: [ID]!
        posts: [ID]!
        token: String!
    }

    type Message {
        id: ID
        userId: ID!
        body: String!
        createdAt: String!
    }

    type Conversation {
        id: ID!
        userIds: [ID]!
        messages: [Message]!
        createdAt: String!
    }

    type Query {
        getPosts: [Post]!
        getPost(postId: ID!): Post
        getConversation(conversationId: ID!): Conversation
    }

    type Mutation {
        register(email: String!, username: String!, password: String!): User!
        login(email: String!, password: String!): User!
        createPost(body: String!): Post!
        editPost(postId: ID!, body: String!): Post!
        deletePost(postId: ID!): Post!
        likePost(postId: ID!): Post!
        createComment(postId: ID!, body: String!): Post!
        deleteComment(postId: ID!, userId: ID!, commentId: ID!): Post!

        createConversation(userIds: [ID]!): Conversation!
        createMessage(conversationId: ID!, body: String!): Message!
        deleteMessage(conversationId: ID!, messageId: ID!): Conversation!
    }
`;

module.exports = typeDefs;
