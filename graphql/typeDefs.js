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
        chats: [ID]!
        posts: [ID]!
        token: String!
    }

    type Query {
        getPosts: [Post]!
        getPost(postId: ID!): Post
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
    }
`;

module.exports = typeDefs;
