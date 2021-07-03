import { Template } from 'meteor/templating';
import { _ } from 'meteor/underscore';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Audit } from '../../../lib/api/audit/audit';
import { Rules } from '../../../lib/api/rules/rules';
import './display.html';

Template.auditDisplay.onCreated(function auditDisplayOnCreated() {
  const id = FlowRouter.getParam('id');

  this.autorun(() => {
    this.subscribe('audit_display.publish', id);
  });
});

Template.auditDisplay.helpers({
  getAudit() {
    return Audit.findOne();
  },
  getRules() {
    const audit = Audit.findOne();
    const rulesIds = [];

    _.each(audit.messages || [], (z) => {
      if (z.id) {
        rulesIds.push(z.id);
      }
    });

    return Rules.find({ id: { $in: rulesIds } });
  },
});
