// src/constants/routeGroups.js
const groups = [
  {
    key: 'Main',
    label: 'Main',
    items: [
      { icon: 'home', name: 'Dashboard', path: '/', category: 'main' },
      { icon: 'user', name: 'Account Center', path: '/req-users-list', category: 'main' },
      { icon: 'scan-eye', name: 'Track / View', path: '/track-view', category: 'main' },
      { icon: 'package-open', name: 'Opening Stock', path: '/mat-opening-stock', category: 'main'},
    ],
  },
  {
    key: 'operations',
    label: 'Operations',
    items: [
      { icon: 'shopping-cart', name: 'Material Request', path: '/mat-request', category: 'operations' },
      { icon: 'edit-2', name: 'View/Edit Request', path: '/manage-mat-request', category: 'operations' },
      { icon: 'file-text', name: 'Create Material Request PO', path: '/mat-request-po', category: 'operations' },
      { icon: 'check-circle', name: 'PO Approval (Material)', path: '/mat-request-po-review', category: 'operations' },
      { icon: 'layers', name: 'Material Additional Input', path: '/mat-add-input', category: 'operations' },
      { icon: 'file-text', name: 'Purchase Order', path: '/mat-purchase-order', category: 'operations' },
    ],
  },
  {
    key: 'transactions',
    label: 'Transactions',
    items: [
      { icon: 'warehouse', name: 'Material Receipt Entry', path: '/mat-receipt-entry', category: 'transactions' },
      { icon: 'database', name: 'Material Account Entry', path: '/mat-account-entry', category: 'transactions' },
      { icon: 'truck', name: 'Material Issue to Site', path: '/mat-issue-to-site', category: 'transactions' },
      { icon: 'arrow-right-left', name: 'Stock Transfer Entry', path: '/stock-transfer', category: 'transactions' },
      { icon: 'rotate-ccw', name: 'Material Return', path: '/material-return', category: 'transactions' },
    ],
  },
  {
    key: 'reports',
    label: 'Reports',
    items: [
      { icon: 'warehouse', name: 'Stock Report By Location', path: '/reports/stocks', category: 'reports' },
      { icon: 'warehouse', name: 'Material Issue Report', path: '/reports/material-issue-report', category: 'reports' },
      { icon: 'warehouse', name: 'Po Status Report', path: '/reports/po-status', category: 'reports' },
      { icon: 'warehouse', name: 'Material Issue By Date', path: '/reports/material-issue-date-report', category: 'reports' },
    ],
  },
  {
    key: 'masters',
    label: 'Masters',
    items: [
      { icon: 'globe', name: 'Sources', path: '/req-source', category: 'masters' },
      { icon: 'warehouse', name: 'Sites', path: '/site-master', category: 'masters' },
      { icon: 'brick-wall', name: 'Material Master', path: '/mat-master', category: 'masters' },
      { icon: 'layers', name: 'Work Stages', path: '/work-stage-master', category: 'masters' },
      { icon: 'tag', name: 'Vendor', path: '/vendor', category: 'masters' },
      
    ],
  },
];

export default groups;