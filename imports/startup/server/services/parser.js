import { _ } from 'meteor/underscore';
import fs from 'fs';
import { Audit } from '../../../lib/api/audit/audit';

class AuditLogEntry {
  constructor(logId, a, b, c, e, f, h) {
    this.logId = logId;
    this.requestDate = null;
    this.uri = null;
    this.ua = null;
    this.host = null;
    this.messages = [];
    this.a = a;
    this.b = b;
    this.c = c;
    this.e = e;
    this.f = f;
    this.h = h;
  }

  stringDateToDate(str) {
    const months = {
      Jan: 0,
      Feb: 1,
      Mar: 2,
      Apr: 3,
      May: 4,
      Jun: 5,
      Jul: 6,
      Aug: 7,
      Sep: 8,
      Oct: 9,
      Nov: 10,
      Dec: 11,
    };

    const sp = str.split('.')[0];
    const sp1 = sp.split(':');
    const sp2 = sp1[0].split('/');
    const day = parseInt(sp2[0], 10);
    const month = parseInt(months[sp2[1]], 10);
    const year = parseInt(sp2[2], 10);
    const hour = parseInt(sp1[1], 10);
    const minute = parseInt(sp1[2], 10);
    const seconds = parseInt(sp1[3], 10);

    // TODO UTC
    this.requestDate = new Date(year, month, day, hour, minute, seconds);
  }

  parseA() {
    const a = this.a[0] || '';
    if (/^\[([0-9]{2}\/[a-zA-Z]+\/[0-9]{4}(:[0-9]{2}){3})(\.-?[0-9]+)? \+[0-9]+\]/.test(a)) {
      const arr = a.match(/^\[([0-9]{2}\/[a-zA-Z]+\/[0-9]{4}(:[0-9]{2}){3})(\.-?[0-9]+)? \+[0-9]+\]/);
      this.stringDateToDate(arr[1]);
    }

    this.a = a;
  }

  parseB() {
    _.each(this.b, (z, i) => {
      if (0 === i) {
        this.uri = z;
      }

      if (/^User-Agent:/.test(z)) {
        const arr = z.match(/^User-Agent: (.+)$/);
        try {
          this.ua = (arr[1] || '').trim();
        } catch (e) {
          this.ua = null;
        }
      }

      if (/^Host:/.test(z)) {
        const arr = z.match(/^Host: (.+)$/);
        try {
          this.host = (arr[1] || '').trim();
        } catch (e) {
          this.host = null;
        }
      }
    });

    this.b = this.b.join('\n');
  }

  parseC() {
    this.c = this.c.join('\n');
  }

  parseE() {
    this.e = this.e.join('\n');
  }

  parseF() {
    this.f = this.f.join('\n');
  }

  parseH() {
    _.each(this.h, (z) => {
      if (/^Message:/.test(z)) {
        const arr = z.match(/^Message: (.+)$/);
        this.parseMessage((arr[1] || '').trim());
      }
    });

    this.h = this.h.join('\n');
  }

  parseMessage(message) {
    const obj = {
      value: '',
      data: '',
      file: '',
      line: 0,
      id: 0,
      msg: '',
      severity: '',
      tags: [],
      plain: message,
    };

    obj.value = (message.split('. [file "')[0] || '');
    const regexFile = / \[file "([ .()/:_a-zA-Z0-9\\-]+)"\]/;
    const regexData = / \[data "([ "',:.;_()a-zA-Z0-9/\\-]+)"\]/;
    const regexSeverity = / \[severity "([a-zA-Z]+)"\]/;
    const regexMsg = / \[msg "([ (),;.:_a-zA-Z0-9/\\-]+)"\]/;
    const regexLine = / \[line "([0-9]+)"\]/;
    const regexId = / \[id "([0-9]+)"\]/;
    const regexTags = / \[tag "([ ._()a-zA-Z0-9/\\-]+)"\] /g;

    if (regexData.test(message)) {
      const arr = message.match(regexData);
      obj.data = arr[1];
    }

    if (regexFile.test(message)) {
      const arr = message.match(regexFile);
      obj.file = arr[1];
    }

    if (regexSeverity.test(message)) {
      const arr = message.match(regexSeverity);
      obj.severity = arr[1];
    }

    if (regexLine.test(message)) {
      const arr = message.match(regexLine);
      obj.line = parseInt(arr[1], 10);
    }

    if (regexId.test(message)) {
      const arr = message.match(regexId);
      obj.id = parseInt(arr[1], 10);
    }

    if (regexMsg.test(message)) {
      const arr = message.match(regexMsg);
      obj.msg = arr[1];
    }

    if (regexTags.test(message)) {
      const arr = [...message.matchAll(regexTags)];
      obj.tags = _.map(arr, (z) => z[1]);
    }

    this.messages.push(obj);
  }

  parseAll() {
    this.parseA();
    this.parseB();
    this.parseC();
    this.parseH();
    this.parseE();
    this.parseF();
  }

  toMongo() {
    this.parseAll();

    return {
      id: this.logId || null,
      requestDate: this.requestDate || new Date(1970, 0, 1, 0, 0, 0),
      uri: this.uri || '',
      ua: this.ua || '',
      host: this.host || '',
      messages: this.messages || [],
      sectionA: this.a || '',
      sectionB: this.b || '',
      sectionC: this.c || '',
      sectionE: this.e || '',
      sectionF: this.f || '',
      sectionH: this.h || '',
    };
  }
}

/**
 * @param file
 * @returns {*[]}
 */
export const extractLogs = (file) => {
  const logs = [];

  try {
    const data = fs.readFileSync(file, 'UTF-8');
    const lines = data.split(/\r?\n/);

    let id = null;
    let currentSection = null;
    let obj = {
      A: [],
      B: [],
      C: [],
      E: [],
      F: [],
      H: [],
    };

    const startRegex = /^--([a-z0-9]{8})-A--$/;
    const endRegex = /^--([a-z0-9]{8})-Z--$/;
    const otherSectionRegex = /^--[a-z0-9]{8}-(B|C|E|F|H)--$/;

    lines.forEach((line) => {
      if (!line || '' === line) {
        return;
      }

      if (startRegex.test(line)) {
        const arr = line.match(startRegex);
        id = arr[1];
        currentSection = 'A';
        return;
      } if (endRegex.test(line)) {
        const auditLogEntry = new AuditLogEntry(id, obj.A, obj.B, obj.C, obj.E, obj.F, obj.H);
        const auditLogEntryToMongo = auditLogEntry.toMongo();
        const document = Audit.findOne({ id: auditLogEntryToMongo.id });
        if (document) {
          Audit.update({ _id: document._id }, { $set: auditLogEntryToMongo });
        } else {
          try {
            Audit.insert(auditLogEntryToMongo);
          } catch (e) {
            console.log('fail: ', auditLogEntryToMongo);
          }
        }
        currentSection = null;
        id = null;
        obj = {
          A: [],
          B: [],
          C: [],
          E: [],
          F: [],
          H: [],
        };
      } else if (otherSectionRegex.test(line)) {
        const arr = line.match(otherSectionRegex);
        currentSection = arr[1];
      } else if (null !== currentSection) {
        obj[currentSection].push(line);
      }
    });
  } catch (err) {
    console.error(err);
  }

  return logs;
};

/**
 * @param file
 * @returns {*[]}
 */
export const extractRules = (file) => {
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
