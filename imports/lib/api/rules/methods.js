import fs from 'fs';
import path from 'path';
import { Meteor } from 'meteor/meteor';
import { _ } from 'meteor/underscore';
import { Config } from '../config/config';
import { Rules } from './rules';

if (Meteor.isServer) {
  /**
     * @param file
     * @returns {*[]}
     */
  const extractRules = (file) => {
    const rules = [];
    try {
      const data = fs.readFileSync(file, 'UTF-8');
      const lines = data.split(/\r?\n/);
      let rule = {
        id: '',
        phase: null,
        tags: [],
        related: [],
        plain: '',
      };

      let record = false;

      lines.forEach((line) => {
        if (/^#/.test(line)) {
          return false;
        }

        if (_.isEmpty(line)) {
          if (!_.isEmpty(rule.plain)) {
            rules.push(rule);
            rule = {
              id: '',
              tags: [],
              related: [],
              plain: '',
            };
          }
          record = false;
          return false;
        }

        if (/^SecRule (.+)/.test(line)) {
          if (!_.isEmpty(rule.plain)) {
            rules.push(rule);
            rule = {
              id: '',
              tags: [],
              related: [],
              plain: '',
            };
          }
          record = true;
        }

        if (record) {
          rule.plain += line;

          if (/id:([0-9]+),/.test(line)) {
            const arr = line.match(/id:([0-9]+)/);
            rule.id = parseInt(arr[1], 10);
          }
          if (/phase:([1-5]),/g.test(line)) {
            const arr = line.match(/phase:([1-5]),/);
            rule.phase = parseInt(arr[1], 10);
          }
          if (/tag:'([-_ a-zA-Z0-9]+)',/g.test(line)) {
            const arr = line.match(/tag:'([-_ a-zA-Z0-9]+)',/);
            rule.tags.push(arr[1]);
          }
          if (/ctl:rule([a-zA-Z]+)Id=([0-9]+)/g.test(line)) {
            const arr = line.match(/ctl:rule([a-zA-Z]+)Id=([0-9]+)/);
            rule.related.push(parseInt(arr[2], 10));
          }
        }

        return true;
      });
    } catch (err) {
      console.error(err);
    }

    return rules;
  };

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
}
