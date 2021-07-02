import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { $ } from 'meteor/jquery';
import { _ } from 'meteor/underscore';
import moment from 'moment';
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

  const $theAuditTable = $('#tableAudit');

  function filterGlobal() {
    $theAuditTable.DataTable().search(
      $('#global_filter').val(),
      $('#global_regex').prop('checked'),
      $('#global_smart').prop('checked'),
    ).draw();
  }

  function filterColumn(i) {
    $theAuditTable.DataTable().column(i).search(
      $(`#col${i}_filter`).val(),
      $(`#col${i}_regex`).prop('checked'),
      $(`#col${i}_smart`).prop('checked'),
    ).draw();
  }

  _.each(rules, (z) => {
    if (z.id) {
      const base = [
        z.id || 'unknown',
        moment(z.requestDate).format('DD/MM/YYYY HH:mm:ss'),
        z.host || 'unknown',
        z.uri || 'unknown',
      ];
      _.each(z.messages || [], (m) => {
        const row = _.clone(base);
        row.push(m.id || 'unknown');
        row.push(m.data || 'unknown');
        row.push(m.msg || 'unknown');
        row.push((m.tags || []).join(','));
        row.push(m.severity || 'unknown');
        row.push(`<a href="/audit/display/${z._id}"><i class="fa fa-eye"></i></a>`);
        data.push(row);
      });
    }
  });

  datatables(window, $);
  datatables_bs(window, $);

  if (theDataTable) {
    theDataTable.destroy();
    theDataTable = null;
  }

  theDataTable = $theAuditTable.DataTable({
    data,
    order: [[1, 'desc']],
    search: {
      regex: true,
    },
    columnDefs: [
      {
        targets: -1,
        sortable: false,
      }],
  });

  $('input.global_filter').on('keyup click', () => {
    filterGlobal();
  });

  $('input.column_filter').on('keyup click', function filterInColumn() {
    filterColumn($(this).parents('tr').attr('data-column'));
  });
};

Template.audit.onCreated(function auditOnCreated() {
  let auditList = [];

  this.autorun(() => {
    this.subscribe('audit.publish');
    auditList = Audit.find({}, { sort: { requestDate: 1 } }).fetch();
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