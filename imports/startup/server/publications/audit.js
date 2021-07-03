import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { _ } from 'meteor/underscore';
import { assert } from '../../../lib/utils';
import { Audit } from '../../../lib/api/audit/audit';
import { Rules } from '../../../lib/api/rules/rules';

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

  const auditCursor = Audit.find({ _id: id });
  let audit = null;

  try {
    audit = auditCursor.fetch()[0];
  } catch (e) {
    return this.ready();
  }
  const rulesIds = [];

  _.each(audit.messages || [], (z) => {
    if (z.id) {
      rulesIds.push(z.id);
    }
  });

  return [
    auditCursor,
    Rules.find({ id: { $in: rulesIds } }),
  ];
});
