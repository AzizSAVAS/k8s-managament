const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { buildHtml } = require('../../services/htmlBuilder');

describe('HtmlBuilder Unit Tests', () => {
  it('should compile index.html from template and partials successfully', () => {
    buildHtml();

    const indexPath = path.join(__dirname, '..', '..', 'public', 'index.html');
    assert.ok(fs.existsSync(indexPath), 'index.html must exist after buildHtml()');

    const content = fs.readFileSync(indexPath, 'utf8');
    assert.ok(content.length > 50000, 'index.html should be substantial in size');
    
    // Check that none of the raw placeholders remain un-replaced
    assert.equal(content.includes('<!-- @@LOGIN@@ -->'), false);
    assert.equal(content.includes('<!-- @@SIDEBAR@@ -->'), false);
    assert.equal(content.includes('<!-- @@TOPBAR@@ -->'), false);
    assert.equal(content.includes('<!-- @@PORTAL@@ -->'), false);
    assert.equal(content.includes('<!-- @@WIZARD@@ -->'), false);
    assert.equal(content.includes('<!-- @@OPERATIONS@@ -->'), false);
    assert.equal(content.includes('<!-- @@MODALS@@ -->'), false);

    // Verify key modular sections are present
    assert.ok(content.includes('class="app-sidebar"'));
    assert.ok(content.includes('id="sidebar-portal-nav"'));
    assert.ok(content.includes('id="workspace-operations"'));
    assert.ok(content.includes('ops-pane-ebpf-waf'));
    assert.ok(content.includes('ops-pane-cluster-janitor'));
    assert.ok(content.includes('ops-pane-time-machine'));
    assert.ok(content.includes('ops-pane-metrics-oscilloscope'));
  });
});
