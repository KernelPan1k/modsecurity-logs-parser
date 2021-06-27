import { Template } from 'meteor/templating';
import { Rules } from '../../../lib/api/rules/rules';
import './navigation.html';

Template.navigation.helpers({
  nbrRules() {
    return Rules.find().count();
  },
});
