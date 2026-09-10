const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

describe('Frontend & Build Integrity Tests', () => {
  const publicDir = path.join(__dirname, '..', '..', 'public');

  function getAllJsFiles(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    for (const file of list) {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        results = results.concat(getAllJsFiles(fullPath));
      } else if (file.endsWith('.js')) {
        results.push(fullPath);
      }
    }
    return results;
  }

  it('all client JavaScript files should have 100% valid syntax without AST parse errors', () => {
    const jsDir = path.join(publicDir, 'js');
    const jsFiles = getAllJsFiles(jsDir);
    assert.ok(jsFiles.length >= 20, `Found ${jsFiles.length} JS files to validate`);

    for (const file of jsFiles) {
      const code = fs.readFileSync(file, 'utf8');
      assert.doesNotThrow(() => {
        new vm.Script(code, { filename: path.basename(file) });
      }, `Syntax error in client script: ${file}`);
    }
  });

  it('all script and css imports in index.template.html must physically exist on disk', () => {
    const templatePath = path.join(publicDir, 'index.template.html');
    const content = fs.readFileSync(templatePath, 'utf8');

    // Check script src
    const scriptRegex = /<script\s+src=["']([^"']+)["']/g;
    let match;
    let scriptCount = 0;
    while ((match = scriptRegex.exec(content)) !== null) {
      const rawSrc = match[1];
      const cleanPath = rawSrc.split('?')[0]; // Remove query strings (?v=...)
      const fullPath = path.join(publicDir, cleanPath);
      assert.ok(fs.existsSync(fullPath), `Referenced script does not exist: ${rawSrc} -> ${fullPath}`);
      scriptCount++;
    }
    assert.ok(scriptCount >= 15, `Found ${scriptCount} scripts, expected at least 15`);

    // Check css href
    const cssRegex = /<link\s+[^>]*href=["']([^"']+\.css[^"']*)["']/g;
    let cssCount = 0;
    while ((match = cssRegex.exec(content)) !== null) {
      const rawHref = match[1];
      const cleanPath = rawHref.split('?')[0];
      const fullPath = path.join(publicDir, cleanPath);
      assert.ok(fs.existsSync(fullPath), `Referenced stylesheet does not exist: ${rawHref} -> ${fullPath}`);
      cssCount++;
    }
    assert.ok(cssCount >= 1, `Found ${cssCount} stylesheets`);
  });

  it('operations.html must contain DOM view panes for all advanced modules', () => {
    const opsHtml = fs.readFileSync(path.join(publicDir, 'partials', 'operations.html'), 'utf8');

    const expectedPanes = [
      'ops-pane-ebpf-waf',
      'ops-pane-cluster-janitor',
      'ops-pane-time-machine',
      'ops-pane-metrics-oscilloscope',
      'ops-pane-ai-gpu',
      'ops-pane-holo-cluster',
      'ops-pane-bare-metal',
      'ops-pane-flamegraph',
      'ops-pane-edge-mesh',
      'ops-pane-cluster-migrate',
      'ops-pane-secret-radar'
    ];

    for (const paneId of expectedPanes) {
      assert.ok(opsHtml.includes(`id="${paneId}"`), `Missing operations pane: #${paneId}`);
    }
  });

  it('sidebar.html must contain navigation items for modules 49, 50, 51, and 52', () => {
    const sidebarHtml = fs.readFileSync(path.join(publicDir, 'partials', 'sidebar.html'), 'utf8');

    assert.ok(sidebarHtml.includes('ops-nav-ebpf-waf'));
    assert.ok(sidebarHtml.includes('ops-nav-cluster-janitor'));
    assert.ok(sidebarHtml.includes('ops-nav-time-machine'));
    assert.ok(sidebarHtml.includes('ops-nav-metrics-oscilloscope'));
  });
});
