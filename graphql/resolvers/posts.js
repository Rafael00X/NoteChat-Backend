const { UserInputError, AuthenticationError } = require("apollo-server-errors");

const Post = require("../../models/Post");
const User = require("../../models/User");
const { validateToken } = require("../../util/authorization");

module.exports = {
    Query: {
        async getPosts() {
            try {
                const posts = await Post.find().sort({ createdAt: -1 });
                return posts;
            } catch (err) {
                console.log(err);
                return err;
            }
        },

        async getPost(_, { postId }) {
            try {
                const post = await Post.findById(postId);
                console.log(post);
                if (post) {
                    return post;
                } else {
                    throw new Error("Post not found");
                }
            } catch (err) {
                console.log(err);
                return err;
            }
        }
    },

    Mutation: {
        async createPost(_, { body }, context) {
            try {
                if (body.trim() === "") {
                    throw new UserInputError("Post cannot be empty");
                }
                const { id, username } = validateToken(context);
                const newPost = new Post({
                    userId: id,
                    username: username,
                    body: body,
                    createdAt: new Date().toISOString(),
                    editedAt: "",
                    likes: [],
                    comments: []
                });

                const post = await newPost.save();

                // Save post to user
                const user = await User.findById(id);
                user.posts.push(post.id);
                await user.save();

                return post;
            } catch (err) {
                console.log(err);
                return err;
            }
        },
        async editPost(_, { postId, body }, context) {
            try {
                if (body === "") {
                    throw new UserInputError("Post cannot be empty");
                }
                const { id } = validateToken(context);
                const post = await Post.findById(postId);
                if (post.userId !== id) {
                    throw new AuthenticationError("Not your post");
                }

                post.body = body;
                post.editedAt = new Date().toISOString();
                await post.save();
                return post;
            } catch (err) {
                console.log(err);
                return err;
            }
        },
        async deletePost(_, { postId }, context) {
            try {
                const { id } = validateToken(context);
                const post = await Post.findById(postId);
                if (post.userId !== id) {
                    throw new AuthenticationError("Not your post");
                }

                await post.delete();

                // Remove post from user
                const user = await User.findById(id);
                user.posts = user.posts.filter((p) => p != postId);
                await user.save();

                return post;
            } catch (err) {
                console.log(err);
                return err;
            }
        },
        async likePost(_, { postId }, context) {
            try {
                const { id, username } = validateToken(context);
                const post = await Post.findById(postId);

                if (post.likes.find((like) => like.userId === id)) {
                    post.likes = post.likes.filter((like) => like.userId !== id);
                } else {
                    post.likes.push({
                        userId: id,
                        username: username,
                        createdAt: new Date().toISOString()
                    });
                }

                await post.save();

                // TODO - Add like to user record - done

                return post;
            } catch (err) {
                console.log(err);
                return err;
            }
        }
    }
};
