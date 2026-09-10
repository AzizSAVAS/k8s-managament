// ==============================================================================
// RKE2 CLUSTER HUB: MODULAR HTML BUILDER & PARTIALS ASSEMBLER
// Shamssoftware & Aziz SAVAS Enterprise Architecture
// ==============================================================================

const fs = require('fs');
const path = require('path');

function buildHtml() {
  const publicDir = path.join(__dirname, '..', 'public');
  const templatePath = path.join(publicDir, 'index.template.html');
  const partialsDir = path.join(publicDir, 'partials');
  const outputPath = path.join(publicDir, 'index.html');

  if (!fs.existsSync(templatePath)) {
    console.warn('[htmlBuilder] No index.template.html found, skipping HTML build.');
    return;
  }

  let template = fs.readFileSync(templatePath, 'utf8');

  const partialsMap = {
    '<!-- @@LOGIN@@ -->': 'login.html',
    '<!-- @@SIDEBAR@@ -->': 'sidebar.html',
    '<!-- @@TOPBAR@@ -->': 'topbar.html',
    '<!-- @@PORTAL@@ -->': 'portal.html',
    '<!-- @@WIZARD@@ -->': 'wizard.html',
    '<!-- @@OPERATIONS@@ -->': 'operations.html',
    '<!-- @@MODALS@@ -->': 'modals.html'
  };

  for (const [placeholder, filename] of Object.entries(partialsMap)) {
    const filePath = path.join(partialsDir, filename);
    if (fs.existsSync(filePath)) {
      const partialContent = fs.readFileSync(filePath, 'utf8');
      template = template.replace(placeholder, partialContent);
    } else {
      console.warn(`[htmlBuilder] Missing partial: ${filename}`);
      template = template.replace(placeholder, `<!-- Missing: ${filename} -->`);
    }
  }

  fs.writeFileSync(outputPath, template, 'utf8');
  console.log(`[htmlBuilder] Successfully compiled modular HTML to index.html (${template.split('\n').length} lines).`);
}

module.exports = { buildHtml };

if (require.main === module) {
  buildHtml();
}
