import { Template } from 'meteor/templating';
import { $ } from 'meteor/jquery';
import { _ } from 'meteor/underscore';
import datatables from 'datatables.net';
// eslint-disable-next-line camelcase
import datatables_bs from 'datatables.net-bs';
import { Rules } from '../../../lib/api/rules/rules';
import 'datatables.net-bs/css/dataTables.bootstrap.css';
import './rules.html';

let theDataTable = null;

const populateDatatable = (rules) => {
  const data = [];

  _.each(rules, (z) => {
    const row = [z.id, z.phase, (z.tags || []).join('\n'), _.truncate(z.plain, 200)];
    data.push(row);
  });

  datatables(window, $);
  datatables_bs(window, $);

  if (theDataTable) {
    theDataTable.destroy();
    theDataTable = null;
  }

  theDataTable = $('#tableRules').DataTable({
    data,
  });
};

Template.rules.onCreated(function rulesOnCreated() {
  let rulesList = [];
  
  this.autorun(() => {
    this.subscribe('rules.publish');
    rulesList = Rules.find({}, { sort: { phase: 1, id: 1 } }).fetch();
    populateDatatable(rulesList);
  });
});
