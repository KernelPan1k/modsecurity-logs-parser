import fs from 'fs';
import path from 'path';
import { Meteor } from 'meteor/meteor';
import { _ } from 'meteor/underscore';
import { Config } from '../../../lib/api/config/config';
import { Rules } from '../../../lib/api/rules/rules';
import { extractRules } from './parser';

Meteor.methods({
  cleanUpRules() {
    return Rules.remove({});
  },
  parseRules() {
    const bound = Meteor.bindEnvironment((callback) => { callback(); });
    const rulesPath = Config.findOne().rulesPath;

    if (!rulesPath || !_.isDir(rulesPath)) {
      throw new Meteor.Error('not_found', 'Invalid path');
    }

    fs.readdir(rulesPath, (err, files) => {
      bound(() => {
        if (err) {
          throw err;
        }

        files.forEach((file) => {
          if (/.+\.conf$/.test(file)) {
            const rules = extractRules(path.join(rulesPath, file));
            _.each(rules, (r) => {
              if (r.id && r.plain) {
                // eslint-disable-next-line no-param-reassign
                r.related = _.uniq(r.related);
                // eslint-disable-next-line no-param-reassign
                r.tags = _.uniq(r.tags);
                try {
                  const docId = Rules.findOne({ id: r.id });
                  if (_.isId(docId)) {
                    Rules.update({ _id: docId }, r);
                  } else {
                    Rules.insert(r);
                  }
                } catch (e) {
                  console.log(e);
                }
              }
            });
          }
        });
      });
    });

    return true;
  },
});
