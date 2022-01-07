const { UserInputError, AuthenticationError } = require("apollo-server-errors");
const mongoose = require("mongoose");

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
        },

        async getConversations(_, { conversationIds }, context) {
            try {
                const { id } = validateToken(context);

                let convs = [];
                for (const convId of conversationIds) {
                    const c = await Conversation.findById(convId);
                    if (c === null) continue;
                    convs.push(c);
                }

                //console.log("Before sorting\n" + convs.map((c) => c.id));
                convs.sort((a, b) => {
                    let ta = a.messages[a.messages.length - 1].createdAt;
                    let tb = b.messages[b.messages.length - 1].createdAt;
                    return tb.localeCompare(ta);
                });
                //console.log("After sorting\n" + convs.map((c) => c.id));

                let data = [];
                for (const conv of convs) {
                    const u = await User.findById(conv.userIds.find((i) => i !== id));
                    const d = {
                        conversationId: conv.id,
                        userId: u.id,
                        username: u.username
                    };
                    data.push(d);
                }

                return data;
            } catch (err) {
                console.log(err);
                return err;
            }
        },

        async fetchConversations(_, { conversationIds }, context) {
            console.log("In fetchConversations");
            try {
                const { id } = validateToken(context);
                const convs = [];
                for (const convId of conversationIds) {
                    const c = await Conversation.findById(convId);
                    if (c === null) continue;
                    convs.push(c);
                }
                const data = [];
                for (const conv of convs) {
                    const u = await User.findById(conv.userIds.find((i) => i !== id));
                    const d = {
                        conversation: conv,
                        profile: {
                            userId: u.id,
                            username: u.username
                        }
                    };
                    data.push(d);
                }
                return data;
            } catch (err) {
                console.log(err);
                return err;
            }
        }
    },
    Mutation: {
        /*
        async createConversation(_, { userIds }, context) {
            try {
                const { id } = validateToken(context);
                if (!userIds.includes(id)) {
                    throw new AuthenticationError("Cannot create conversations as third member");
                }

                userIds.sort();
                const _id = userIds[0] + userIds[1];
                const newConv = new Conversation({
                    _id,
                    userIds,
                    messages: [],
                    createdAt: new Date().toISOString()
                });

                const conv = await newConv.save();

                userIds.forEach(async (userId) => {
                    const user = await User.findById(userId);
                    user.conversations.push(conv.id);
                    await user.save();
                });

                return newConv;
            } catch (err) {
                console.log(err);
                return err;
            }
        },
        */

        async deleteConversation(parent, { conversationId }) {
            console.log("Deleting");
            try {
                const conv = await Conversation.findById(conversationId);
                if (!conv) return;
                conv.userIds.forEach(async (userId) => {
                    const user = await User.findById(userId);
                    user.conversations = user.conversations.filter((c) => c !== conversationId);
                    await user.save();
                });

                await Conversation.deleteOne({ _id: conversationId });
            } catch (err) {
                console.log(err);
                return err;
            }
        },

        async createMessage(_, { conversationId, recipientId, body }, context) {
            try {
                const { id } = validateToken(context);
                let isNew = false;
                let conv = await Conversation.findById(conversationId);

                if (!conv) {
                    isNew = true;
                    const newConv = new Conversation({
                        _id: conversationId,
                        userIds: [id, recipientId],
                        messages: [],
                        createdAt: new Date().toISOString()
                    });
                    conv = await newConv.save();
                    conv.userIds.forEach(async (userId) => {
                        const user = await User.findById(userId);
                        user.conversations.push(conv.id);
                        await user.save();
                    });
                }

                const newMessage = new Message({
                    userId: id,
                    body,
                    createdAt: new Date().toISOString()
                });
                conv.messages.push(newMessage);
                await conv.save();

                // Changed here
                const result = {
                    message: newMessage,
                    conversation: null,
                    users: null
                };
                if (isNew) {
                    console.log(conv);
                    const users = [];
                    for (const userId of conv.userIds) {
                        const u = await User.findById(userId);
                        users.push({
                            userId: u.id,
                            username: u.username
                        });
                    }
                    result.conversation = conv;
                    result.users = users;
                }
                return result;
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
