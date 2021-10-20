const Post = require("../../models/Post");
const User = require("../../models/User");
const { validateToken } = require("../../util/authorization");

module.exports = {
    Mutation: {
        async createComment(_, { postId, body }, context) {
            try {
                if (body.trim() === "") {
                    throw new Error("Comment cannot be empty");
                }
                const { id, username } = validateToken(context);
                const newComment = {
                    userId: id,
                    username: username,
                    body: body,
                    createdAt: new Date().toISOString()
                };

                const post = await Post.findById(postId);
                post.comments.push(newComment);
                post.save();
                return post;
            } catch (err) {
                console.log(err);
            }
        },
        async deleteComment(_, { postId, commentId, userId }, context) {
            try {
                const { id } = validateToken(context);
                if (id !== userId) {
                    throw new Error("Not your comment");
                }

                const post = await Post.findById(postId);
                post.comments = post.comments.filter((comment) => comment.id !== commentId);
                await post.save();
                return post;
            } catch (err) {
                console.log(err);
            }
        }
    }
};
