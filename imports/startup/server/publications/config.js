import { Meteor } from 'meteor/meteor';
import { Config } from '../../../lib/api/config/config';

Meteor.publish('config.publish', () => Config.find());
