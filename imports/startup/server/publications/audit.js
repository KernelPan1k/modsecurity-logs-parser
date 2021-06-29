import { Meteor } from 'meteor/meteor';
import { Audit } from '../../../lib/api/audit/audit';

Meteor.publish('audit.publish', () => Audit.find(
  {},
  {
    $fields: {
      _id: 1,
      id: 1,
      requestDate: 1,
      uri: 1,
      ua: 1,
      host: 1,
      messages: 1,
    },
  },
));
