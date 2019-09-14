import { combineResolvers } from 'graphql-resolvers';
import { AuthenticationError, UserInputError } from 'apollo-server';

import { isAdmin, isAuthenticated, isOwner } from '../../utils/authorization';
import createToken from '../../utils/createToken';
import { transformUser } from '../../utils/transfrom';
import sendEmail from '../../utils/sendEmail';
import createCofirmEmailLink from '../../utils/createCofirmEmailLink';

export default {
  Query: {
    users: async (_, __, { models }) => {
      const users = await models.User.find();

      return users.map(user => {
        return transformUser(user);
      });
    },

    user: async (_, { id }, { models }) => {
      const user = await models.User.findById(id);

      return transformUser(user);
    },

    me: async (_, __, { models, me }) => {
      if (!me) {
        return null;
      }

      const user = await models.User.findById(me.id);

      return transformUser(user);
    },
  },

  Mutation: {
    signUp: async (_, { email, password }, { models, url }) => {
      const userAlreadyExist = await models.User.findOne({ email });

      if (userAlreadyExist) {
        throw new Error('Email is already taken.');
      }
      const user = await models.User.create({
        email,
        password,
      });

      if (process.env.NODE_ENV !== 'test') {
        await sendEmail(email, await createCofirmEmailLink(url, user.id));
      }

      return null;
    },

    signIn: async (_, { email, password }, { models }) => {
      const user = await models.User.findOne({ email });

      if (!user) {
        throw new UserInputError('No user found with this login credentials.');
      }

      const isValid = await user.validatePassword(password);

      if (!isValid) {
        throw new AuthenticationError('Invalid password.');
      }

      return { token: createToken(user) };
    },

    updateUser: combineResolvers(
      isAuthenticated,
      async (_, { userInput }, { models, me }) => {
        const user = await models.User.findByIdAndUpdate(me.id, userInput, {
          new: true,
        });
        return transformUser(user);
      }
    ),

    deleteUser: combineResolvers(isAdmin, async (_, { id }, { models }) => {
      const user = await models.User.findById(id);

      if (user) {
        await user.remove();
        return true;
      } else {
        return false;
      }
    }),

    selfDeleteUser: combineResolvers(
      isAuthenticated,
      async (_, __, { models, me }) => {
        const user = await models.User.findById(me.id);

        if (user) {
          await user.remove();
          return true;
        } else {
          return false;
        }
      }
    ),

    makeAdmin: combineResolvers(isOwner, async (_, { id }, { models }) => {
      //! FIX ME: what's about OWNER role, what if someone make OWNER to become ADMIN
      const user = await models.User.findByIdAndUpdate(id, { role: 'ADMIN' });

      if (user) {
        if (user.role !== 'ADMIN') {
          return true;
        } else {
          throw new Error('User is already an Admin.');
        }
      } else {
        throw new Error('User does not exist.');
      }
    }),
  },
};
