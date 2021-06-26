import { Meteor } from 'meteor/meteor';
import { _ } from 'meteor/underscore';
import { check } from 'meteor/check';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import path from 'path';
import { Config } from './config';

/**
 * @type {ValidatedMethod}
 */
export const ConfigRulesAddOrEdit = new ValidatedMethod({
  name: 'ConfigRulesAddOrEdit',
  validate(args) {
    check(args, {
      rulesPath: String,
    });
  },
  applyOptions: {
    noRetry: true,
    throwStubExceptions: true,
  },
  run(args) {
    const rulesPath = path.normalize(args.rulesPath);

    if (!_.isAbsolutePath(rulesPath)) {
      throw new Meteor.Error('logic', 'Path must be absolute');
    }

    const conf = Config.findOne({});

    if (conf && _.isId(conf._id)) {
      Config.update({ id: conf._id }, { $set: { rulesPath } });
    } else {
      Config.insert({ rulesPath });
    }

    if (Meteor.isServer) {
      return Meteor.call('parseRules');
    }

    return true;
  },
});
