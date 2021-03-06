import { Template } from 'meteor/templating';
import { $ } from 'meteor/jquery';
import { flashMessage } from '../../../startup/client/utils';
import { ConfigRulesAddOrEdit, ConfigAuditPathAddOrEdit } from '../../../lib/api/config/methods';
import { Config } from '../../../lib/api/config/config';
import './import.html';

Template.import.onCreated(function ConfigOnCreated() {
  this.autorun(() => {
    this.subscribe('config.publish');
  });
});

Template.import.helpers({
  getRulesPath() {
    const config = Config.findOne();

    if (config) {
      return config.rulesPath || null;
    }

    return null;
  },
  getAuditPath() {
    const config = Config.findOne();

    if (config) {
      return config.auditPath || null;
    }

    return null;
  },
});

Template.import.events({
  'submit #rules-import': (event) => {
    event.preventDefault();
    const $form = $(event.currentTarget);
    const $input = $form.find('#rules-path').first();
    const rulesPath = $input.val();

    if (!rulesPath) {
      flashMessage('Missing directory path', 'danger');
      return;
    }

    ConfigRulesAddOrEdit.call({ rulesPath }, (err) => {
      if (err) {
        flashMessage(err, 'danger');
        return;
      }

      flashMessage('Rules loaded successfully', 'success');
    });
  },
  'submit #audit-import': (event) => {
    event.preventDefault();
    const $form = $(event.currentTarget);
    const $input = $form.find('#audit-path').first();
    const auditPath = $input.val();

    if (!auditPath) {
      flashMessage('Missing directory path', 'danger');
      return;
    }

    ConfigAuditPathAddOrEdit.call({ auditPath }, (err) => {
      if (err) {
        flashMessage(err, 'danger');
        return;
      }

      flashMessage('Audit logs loaded successfully', 'success');
    });
  },
});
