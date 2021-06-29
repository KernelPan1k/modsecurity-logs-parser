import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { $ } from 'meteor/jquery';
import { _ } from 'meteor/underscore';
import datatables from 'datatables.net';
// eslint-disable-next-line camelcase
import datatables_bs from 'datatables.net-bs';
import 'datatables.net-bs/css/dataTables.bootstrap.css';
import { flashMessage } from '../../../startup/client/utils';
import { Audit } from '../../../lib/api/audit/audit';
import './audit.html';

let theDataTable = null;

const populateDatatable = (rules) => {
  const data = [];

  _.each(rules, (z) => {
    if (z.id) {
      const row = [z.id, z.phase, (z.tags || []).join('\n'), _.truncate(z.plain, 200)];
      data.push(row);
    }
  });

  datatables(window, $);
  datatables_bs(window, $);

  if (theDataTable) {
    theDataTable.destroy();
    theDataTable = null;
  }

  theDataTable = $('#tableAudit').DataTable({
    data,
  });
};

Template.audit.onCreated(function auditOnCreated() {
  let auditList = [];

  this.autorun(() => {
    this.subscribe('audit.publish');
    auditList = Audit.find({}, { sort: { phase: 1, id: 1 } }).fetch();
    populateDatatable(auditList);
  });
});

Template.audit.events({
  'click #remove-all-entries': (event) => {
    event.preventDefault();

    Meteor.call('cleanUpAudit', (err) => {
      if (err) {
        flashMessage(err, 'danger');
        return;
      }
      flashMessage('All audit entries removed', 'success');
    });
  },
});
