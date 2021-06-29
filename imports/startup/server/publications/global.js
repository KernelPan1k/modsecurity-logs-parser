import { Meteor } from 'meteor/meteor';
import { Rules } from '../../../lib/api/rules/rules';
import { Audit } from '../../../lib/api/audit/audit';

Meteor.publish(null, () => [
  Rules.find({}, { fields: { _id: 1 } }, { is_auto: true }),
  Audit.find({}, { fields: { _id: 1 } }, { is_auto: true }),
]);
