import { Template } from 'meteor/templating';
import { Rules } from '../../../lib/api/rules/rules';
import './navigation.html';
import { Audit } from '../../../lib/api/audit/audit';

Template.navigation.helpers({
  nbrRules() {
    return Rules.find({}, { $fields: { _id: 1 } }).count();
  },
  nbrAudit() {
    return Audit.find({}, { $fields: { _id: 1 } }).count();
  },
});
