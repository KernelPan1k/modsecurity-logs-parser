import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { $ } from 'meteor/jquery';
import { _ } from 'meteor/underscore';
import datatables from 'datatables.net';
// eslint-disable-next-line camelcase
import datatables_bs from 'datatables.net-bs';
import { ReactiveVar } from 'meteor/reactive-var';
import { flashMessage } from '../../../startup/client/utils';
import { Rules } from '../../../lib/api/rules/rules';
import 'datatables.net-bs/css/dataTables.bootstrap.css';
import './rules.html';

let theDataTable = null;

const populateDatatable = (rules) => {
  const data = [];

  _.each(rules, (z) => {
    if (z.id) {
      const row = [
        z.id,
        z.phase,
        (z.tags || []).join('\n'),
        _.truncate(z.plain, 200),
        `<a href="#" class="modal-rule-see" data-rule="${z._id}"><i class="fa fa-eye"></i></a>`,
      ];
      data.push(row);
    }
  });

  datatables(window, $);
  datatables_bs(window, $);

  if (theDataTable) {
    theDataTable.destroy();
    theDataTable = null;
  }

  theDataTable = $('#tableRules').DataTable({
    data,
    order: [[1, 'asc'], [0, 'asc']],
  });
};

Template.rules.onCreated(function rulesOnCreated() {
  let rulesList = [];
  this.currentRule = new ReactiveVar(null);

  this.autorun(() => {
    this.subscribe('rules.publish');
    rulesList = Rules.find({}, { sort: { phase: 1, id: 1 } }).fetch();
    populateDatatable(rulesList);
  });
});

Template.rules.helpers({
  getCurrentRule() {
    return Template.instance().currentRule.get();
  },
});

Template.rules.events({
  'click #remove-all-rules': (event) => {
    event.preventDefault();

    Meteor.call('cleanUpRules', (err) => {
      if (err) {
        flashMessage(err, 'danger');
        return;
      }
      flashMessage('All rules removed', 'success');
    });
  },
  'click .modal-rule-see': (event, templateInstance) => {
    event.preventDefault();
    const element = event.currentTarget;
    const id = element.getAttribute('data-rule');

    if (!_.isId(id)) {
      flashMessage('Unknown id', 'danger');
      return;
    }

    const rule = Rules.findOne({ _id: id });
    templateInstance.currentRule.set(rule.plain || '');
    $('#modal-rule').modal('show');
  },
});
