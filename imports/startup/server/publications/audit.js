import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { assert } from '../../../lib/utils';
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

Meteor.publish('audit_display.publish', (id) => {
  check(id, assert.id);

  return Audit.find({ _id: id });
});
