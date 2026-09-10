// ==============================================================================
// RKE2 CLUSTER HUB: NOC VOICE ALERTING ENGINE (HTML5 SPEECH SYNTHESIS)
// Shamssoftware & Aziz SAVAS Enterprise Architecture
// ==============================================================================

(function() {
  let isVoiceEnabled = localStorage.getItem('rke2_voice_alerts') === 'true';

  function initVoiceAlerts() {
    updateVoiceTopbarButton();
  }

  function toggleVoiceAlerts() {
    isVoiceEnabled = !isVoiceEnabled;
    localStorage.setItem('rke2_voice_alerts', isVoiceEnabled ? 'true' : 'false');
    updateVoiceTopbarButton();

    if (typeof showToast === 'function') {
      if (isVoiceEnabled) {
        showToast('info', '🔊 Sesli Anons Sistemi Açık', 'Kritik küme ve güvenlik olayları sesli olarak anons edilecektir.');
        speakAlert('NOC Sesli Anons Sistemi Devreye Girdi.');
      } else {
        showToast('warning', '🔇 Sesli Anons Sistemi Kapatıldı', 'Sesli uyarılar sessize alındı.');
      }
    }
  }

  function updateVoiceTopbarButton() {
    const btn = document.getElementById('btn-toggle-voice-alerts');
    if (btn) {
      if (isVoiceEnabled) {
        btn.classList.add('active');
        btn.innerHTML = '🔊 <span class="voice-btn-label">Ses: Açık</span>';
        btn.title = 'Sesli Anons Sistemi Aktif. Tıklayarak Sessize Alın.';
      } else {
        btn.classList.remove('active');
        btn.innerHTML = '🔇 <span class="voice-btn-label">Ses: Kapalı</span>';
        btn.title = 'Sesli Anons Sistemi Kapalı. Tıklayarak Açın.';
      }
    }
  }

  /**
   * Speak an alert using Web Speech API
   * @param {string} text 
   * @param {'tr'|'en'} lang 
   */
  function speakAlert(text, lang = 'tr') {
    if (!isVoiceEnabled || !('speechSynthesis' in window)) return;

    // Cancel previous utterance if any
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang === 'en' ? 'en-US' : 'tr-TR';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    // Pick best matching system voice if available
    const voices = window.speechSynthesis.getVoices();
    const targetVoice = voices.find(v => v.lang.startsWith(lang === 'en' ? 'en' : 'tr'));
    if (targetVoice) utterance.voice = targetVoice;

    window.speechSynthesis.speak(utterance);
  }

  function testVoiceAnnouncement(customText) {
    const text = customText || 'Dikkat: RKE2 Kümesinde ikinci master düğüm yük devretmesi başarıyla tamamlandı.';
    speakAlert(text);
    if (typeof showToast === 'function') {
      showToast('info', '🎙️ Ses Testi Yapıldı', text);
    }
  }

  // Global Attachments
  window.speakAlert = speakAlert;
  window.toggleVoiceAlerts = toggleVoiceAlerts;
  window.testVoiceAnnouncement = testVoiceAnnouncement;

  document.addEventListener('DOMContentLoaded', initVoiceAlerts);
  console.log('[VoiceAlerts] NOC Voice Alerting Engine initialized.');
})();
