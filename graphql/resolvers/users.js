const bcrypt = require("bcryptjs");
const { UserInputError } = require("apollo-server");

const User = require("../../models/User");
const { generateToken, validateToken } = require("../../util/authorization");
const { validateRegisterInput, validateLoginInput } = require("../../util/authentication");

module.exports = {
    Query: {
        async getProfile(_, { userId }, context) {
            try {
                validateToken(context);
                const user = await User.findById(userId);
                if (!user) return null;
                const profile = {
                    userId: user.id,
                    username: user.username
                };
                return profile;
            } catch (err) {
                console.log(err);
                return err;
            }
        }
    },

    Mutation: {
        async register(_, { username, email, password }) {
            try {
                const { error, valid } = validateRegisterInput(username, email, password);
                if (!valid) {
                    throw new UserInputError("Invalid input", { error });
                }

                const fetchedUser = await User.findOne({ email });
                if (fetchedUser) {
                    error.username = "This email is already registered";
                    throw new UserInputError("Email already registered", { error });
                }

                password = await bcrypt.hash(password, 12);
                const newUser = new User({
                    email,
                    username,
                    password,
                    createdAt: new Date().toISOString()
                });

                const user = await newUser.save();
                const token = generateToken(user);

                return {
                    id: user._id,
                    ...user._doc,
                    token
                };
            } catch (err) {
                console.log(err);
                return err;
            }
        },

        async login(_, { email, password }) {
            try {
                const { error, valid } = validateLoginInput(email, password);
                if (!valid) {
                    throw new UserInputError("Invalid input", { error });
                }

                const user = await User.findOne({ email });
                if (!user) {
                    error.email = "User not found";
                    throw new UserInputError("User not found", { error });
                }

                const match = await bcrypt.compare(password, user.password);
                if (!match) {
                    error.general = "Incorrect email or password";
                    throw new UserInputError("Wrong credentials", { error });
                }

                const token = generateToken(user);

                return {
                    ...user._doc,
                    id: user._id,
                    token
                };
            } catch (err) {
                console.log(err);
                return err;
            }
        }
    }
};
