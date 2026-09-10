// ==============================================================================
// RKE2 CLUSTER HUB: WIZARD CORE ORCHESTRATOR
// Shamssoftware & Aziz SAVAS Enterprise Architecture
// ==============================================================================

// Ensure global references for inline HTML handlers & command palette
window.selectOperationMode = typeof selectOperationMode !== 'undefined' ? selectOperationMode : window.selectOperationMode;
window.stepCount = typeof stepCount !== 'undefined' ? stepCount : window.stepCount;
window.setCount = typeof setCount !== 'undefined' ? setCount : window.setCount;
window.setNodeSpecs = typeof setNodeSpecs !== 'undefined' ? setNodeSpecs : window.setNodeSpecs;
window.generateRandomToken = typeof generateRandomToken !== 'undefined' ? generateRandomToken : window.generateRandomToken;
window.togglePassVisibility = typeof togglePassVisibility !== 'undefined' ? togglePassVisibility : window.togglePassVisibility;
window.updateLiveSummary = typeof updateLiveSummary !== 'undefined' ? updateLiveSummary : window.updateLiveSummary;
window.goToStep = typeof goToStep !== 'undefined' ? goToStep : window.goToStep;
window.selectProvider = typeof selectProvider !== 'undefined' ? selectProvider : window.selectProvider;
window.connectProvider = typeof connectProvider !== 'undefined' ? connectProvider : window.connectProvider;
window.prepareDistributionPreview = typeof prepareDistributionPreview !== 'undefined' ? prepareDistributionPreview : window.prepareDistributionPreview;
window.updateVmTargetHost = typeof updateVmTargetHost !== 'undefined' ? updateVmTargetHost : window.updateVmTargetHost;
window.startDeployment = typeof startDeployment !== 'undefined' ? startDeployment : window.startDeployment;
window.openTemplateModal = typeof openTemplateModal !== 'undefined' ? openTemplateModal : window.openTemplateModal;
window.closeTemplateModal = typeof closeTemplateModal !== 'undefined' ? closeTemplateModal : window.closeTemplateModal;
window.switchTemplateTab = typeof switchTemplateTab !== 'undefined' ? switchTemplateTab : window.switchTemplateTab;
window.copyTemplateSnippet = typeof copyTemplateSnippet !== 'undefined' ? copyTemplateSnippet : window.copyTemplateSnippet;
window.executeCreateTemplate = typeof executeCreateTemplate !== 'undefined' ? executeCreateTemplate : window.executeCreateTemplate;

console.log("[Wizard Hub] Wizard orchestrator and submodules loaded.");
