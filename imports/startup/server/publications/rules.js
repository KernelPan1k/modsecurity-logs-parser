import { Meteor } from 'meteor/meteor';
import { Rules } from '../../../lib/api/rules/rules';

Meteor.publish('rules.publish', () => Rules.find());
