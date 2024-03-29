import { GraphQLDateTime } from 'graphql-iso-date';

import userResolvers from './user';
import deviceResolvers from './device';
import activeEventResolvers from './activeEvent';
import maintainEventResolvers from './maintainEvent';
import liquidateEventResolvers from './liquidateEvent';
import accountantEventResolvers from './accountantEvent';
import fileResolvers from './file';

const customScalarResolver = {
  Date: GraphQLDateTime,
};

export default [
  customScalarResolver,
  userResolvers,
  deviceResolvers,
  activeEventResolvers,
  maintainEventResolvers,
  liquidateEventResolvers,
  accountantEventResolvers,
  fileResolvers,
];
