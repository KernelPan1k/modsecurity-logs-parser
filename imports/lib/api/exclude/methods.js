import { Meteor } from 'meteor/meteor';
import { _ } from 'meteor/underscore';
import { check } from 'meteor/check';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { Exclude } from './excludes';

/**
 * @type {ValidatedMethod}
 */
export const ExcludeAddOrEdit = new ValidatedMethod({
  name: 'ExcludeAddOrEdit',
  validate(args) {
    check(args, {
      excludeRules: String,
    });
  },
  applyOptions: {
    noRetry: true,
    throwStubExceptions: true,
  },
  run(args) {
    const excludeRules = args.excludeRules;
    const conf = Exclude.findOne({});

    if (excludeRules && conf && _.isId(conf._id)) {
      Exclude.update({ _id: conf._id }, { $set: { excludeRules } });
    } else {
      Exclude.insert({ excludeRules });
    }
  },
});
