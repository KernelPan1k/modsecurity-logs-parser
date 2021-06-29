import { Meteor } from 'meteor/meteor';
import { Audit } from '../../../lib/api/audit/audit';

Meteor.publish('audit.publish', () => Audit.find());
