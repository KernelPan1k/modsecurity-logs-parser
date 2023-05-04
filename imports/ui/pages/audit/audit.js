import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { $ } from 'meteor/jquery';
import { _ } from 'meteor/underscore';
import moment from 'moment';
import datatables from 'datatables.net';
import filterXSS from 'xss';
// eslint-disable-next-line camelcase
import datatables_bs from 'datatables.net-bs';
import 'datatables.net-bs/css/dataTables.bootstrap.css';
import { flashMessage } from '../../../startup/client/utils';
import { Audit } from '../../../lib/api/audit/audit';
import './audit.html';
import { ExcludeAddOrEdit } from '../../../lib/api/exclude/methods';
import { Exclude } from '../../../lib/api/exclude/excludes';

let theDataTable = null;

const getAuditList = () => Audit.find({}, { sort: { requestDate: 1 } }).fetch();

const populateDatatable = (rules = null) => {
  if (!rules) {
    // eslint-disable-next-line no-param-reassign
    rules = getAuditList();
  }

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
        filterXSS(z.id) || 'unknown',
        moment(z.requestDate).format('DD/MM/YYYY HH:mm:ss'),
        filterXSS(z.host) || 'unknown',
        filterXSS(z.uri) || 'unknown',
      ];
      _.each(z.messages || [], (m) => {
        const row = _.clone(base);
        row.push(m.id || 'unknown');
        row.push(filterXSS(m.data) || 'unknown');
        row.push(filterXSS(m.msg) || 'unknown');
        row.push((m.tags || []).join(','));
        row.push(m.severity || 'unknown');
        const auditPath = FlowRouter.path('audit-display', { id: z._id });
        row.push(`<a href="${auditPath}"><i class="fa fa-eye"></i></a>
                  <a href="#" class="remove-row" data-id="${z.id}"><i class="fa fa-remove bg-red"></i></a>`);
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
    lengthMenu: [100, 200, 500],
    responsive: true,
    searchHighlight: true,
    render: $.fn.dataTable.render.text(),
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
    this.subscribe('audit.publish', () => {
      auditList = Audit.find({}, { sort: { requestDate: 1 } }).fetch();
      populateDatatable(auditList);
    });
  });
});

Template.audit.helpers({
  getRulesList() {
    try {
      return Exclude.findOne({}).excludeRules;
    } catch (e) {
      return '';
    }
  },
});

Template.audit.events({
  'click #save-rules': (event) => {
    event.preventDefault();
    const excludeRules = document.querySelector('#exclude-list').value;
    ExcludeAddOrEdit.call({ excludeRules }, (err) => {
      if (err) {
        flashMessage(err, 'danger');
        return;
      }
      flashMessage('All rules are saved', 'success');
    });
  },
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
  'click #remove-all-by-rules': (event) => {
    event.preventDefault();
    const excludesrules = document.querySelector('#exclude-list').value;

    Meteor.call('cleanUpByRules', excludesrules, (err) => {
      if (err) {
        flashMessage(err, 'danger');
        return;
      }
      flashMessage('All audit entries removed following the rules', 'success');
      populateDatatable();
    });
  },
  'click #remove-all-selected': (event) => {
    event.preventDefault();
    const requestIds = _.uniq(
      _.filter(
        _.map(theDataTable.rows({ search: 'applied' }).data(), (z) => z[0]),
        (z) => !!z,
      ),
    );

    Meteor.call('removeAuditSelected', requestIds, (err) => {
      if (err) {
        flashMessage(err, 'danger');
        return;
      }
      flashMessage('All audit entries removed', 'success');
      populateDatatable();
    });
  },
  'click .remove-row': (event) => {
    event.preventDefault();
    const element = event.currentTarget;
    const id = element.getAttribute('data-id');
    Meteor.call('removeAuditSelected', [id], (err) => {
      if (err) {
        flashMessage(err, 'danger');
        return;
      }
      flashMessage('audit entry removed', 'success');
      populateDatatable();
    });
  },
});
