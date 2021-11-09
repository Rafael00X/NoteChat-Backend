const { UserInputError, AuthenticationError } = require("apollo-server-errors");

const Conversation = require("../../models/Conversation");
const User = require("../../models/User");
const Message = require("../../models/Message");
const { validateToken } = require("../../util/authorization");

module.exports = {
    Query: {
        async getConversation(_, { conversationId }, context) {
            try {
                const { id } = validateToken(context);
                const conv = await Conversation.findById(conversationId);
                if (!conv.userIds.includes(id)) {
                    throw new AuthenticationError("Not your conversation");
                }
                return conv;
            } catch (err) {
                console.log(err);
                return err;
            }
        }
    },
    Mutation: {
        async createConversation(_, { userIds }, context) {
            try {
                const { id } = validateToken(context);
                if (!userIds.includes(id)) {
                    throw new AuthenticationError("Cannot create conversations as third member");
                }
                const newConv = new Conversation({
                    userIds,
                    messages: [],
                    createdAt: new Date().toISOString()
                });

                // TODO - Add to user
                /*
                for (let i = 0; i < userIds.length; i++) {
                    const user = await User.findById(userId);
                    user.conversations.push(conv.id);
                    await user.save();
                }
                */
                const conv = await newConv.save();

                userIds.forEach(async (userId) => {
                    const user = await User.findById(userId);
                    user.conversations.push(conv.id);
                    await user.save();
                });

                return conv;
            } catch (err) {
                console.log(err);
                return err;
            }
        },

        async createMessage(_, { conversationId, body }, context) {
            try {
                const { id } = validateToken(context);
                const conv = await Conversation.findById(conversationId);
                if (!conv.userIds.includes(id)) {
                    throw new AuthenticationError("Not your conversation");
                }

                const newMessage = new Message({
                    userId: id,
                    body,
                    createdAt: new Date().toISOString()
                });

                conv.messages.push(newMessage);
                await conv.save();
                return newMessage;
            } catch (err) {
                console.log(err);
                return err;
            }
        },

        async deleteMessage(_, { conversationId, messageId }, context) {
            try {
                const { id } = validateToken(context);
                const conv = await Conversation.findById(conversationId);
                if (!conv.userIds.includes(id)) {
                    throw new AuthenticationError("Not your conversation");
                }
                const message = conv.messages.find((message) => message.id === messageId);
                if (!message) {
                    throw new UserInputError("Message not found");
                }
                if (message.userId !== id) {
                    throw new AuthenticationError("Not your message");
                }
                conv.messages = conv.messages.filter((message) => message.id !== messageId);
                await conv.save();
                return conv;
            } catch (err) {
                console.log(err);
                return err;
            }
        }
    }
};
