import { Meteor } from 'meteor/meteor';
import { Audit } from '../../../lib/api/audit/audit';
import { Rules } from '../../../lib/api/rules/rules';

Meteor.publish('home.publish', () => [
  Audit.find({}, {
    $fields: {
      _id: 1,
      host: 1,
      requestDate: 1,
      'messages.$.id': 1,
      'messages.$.severity': 1,
      'messages.$.tags': 1,
    },
  }),
  Rules.find({}, {
    $fields: {
      id: 1,
      file: 1,
    },
  }),
]);
