import { Meteor } from 'meteor/meteor';
import { Rules } from '../../../lib/api/rules/rules';

Meteor.publish(null, () => [
  Rules.find({}, { fields: { _id: 1 } }, { is_auto: true }),
]);
