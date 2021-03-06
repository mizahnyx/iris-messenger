import {gun, resetView} from './Main.js';
import Session from './Session.js';
import Helpers from './Helpers.js';
import {translate as t} from './Translation.js';

function render() {
  resetView();
  $('#header-content').text(t('settings'));
  $('#settings').show();
  var el = $('#profile-photo-settings');
  $('#profile-photo-chapter').after(el);
  $('#current-profile-photo').toggle(!!Session.getMyProfilePhoto());
  Helpers.setImgSrc($('#current-profile-photo'), Session.getMyProfilePhoto());
  $('#add-profile-photo').toggle(!Session.getMyProfilePhoto());
}

function togglePrivateKeyQR() {
  var btn = $('#show-private-key-qr');
  var show = $('#private-key-qr').length === 0;
  var SHOW_TEXT = t('show_privkey_qr');
  function hideText(s) { return t('hide_privkey_qr') + ' (' + s + ')'; }
  if (show) {
    var showPrivateKeySecondsRemaining = 20;
    btn.text(hideText(showPrivateKeySecondsRemaining));
    var hidePrivateKeyInterval = setInterval(() => {
      if ($('#private-key-qr').length === 0) {
        clearInterval(hidePrivateKeyInterval);
        btn.text(SHOW_TEXT);
      }
      showPrivateKeySecondsRemaining -= 1;
      if (showPrivateKeySecondsRemaining === 0) {
       $('#private-key-qr').remove();
        btn.text(SHOW_TEXT);
        clearInterval(hidePrivateKeyInterval);
      } else {
        btn.text(hideText(showPrivateKeySecondsRemaining));
      }
    }, 1000);
    var qrCodeEl = $('<div>').attr('id', 'private-key-qr').addClass('qr-container').insertAfter(btn);
    new QRCode(qrCodeEl[0], {
      text: JSON.stringify(Session.getKey()),
      width: 300,
      height: 300,
      colorDark : "#000000",
      colorLight : "#ffffff",
      correctLevel : QRCode.CorrectLevel.H
    });
  } else {
    $('#private-key-qr').remove();
    btn.text(SHOW_TEXT);
  }
}

function showLogoutConfirmation() {
  resetView();
  $('#header-content').text(t('log_out') + '?');
  $('#logout-confirmation').show();
}

function downloadKey() {
  return Helpers.download('iris_private_key.txt', JSON.stringify(Session.getKey()), 'text/csv', 'utf-8');
}

function init() {
  $('#download-private-key').click(downloadKey);
  $('#show-private-key-qr').click(togglePrivateKeyQR);
  $('.open-settings-button').click(render);
  $(".user-info").off().on('click', render);
  $('#settings-name').on('input', event => {
    var name = $(event.target).val().trim();
    gun.user().get('profile').get('name').put(name);
  });

  $('#settings-about').on('input', event => {
    var about = $(event.target).val().trim();
    gun.user().get('profile').get('about').put(about);
  });

  $('.show-logout-confirmation').click(showLogoutConfirmation);

  $('.copy-chat-link').click(event => {
    Helpers.copyToClipboard(Session.getMyChatLink());
    var te = $(event.target);
    var originalText = te.text();
    var originalWidth = te.width();
    te.width(originalWidth);
    te.text(t('copied'));
    setTimeout(() => {
      te.text(originalText);
      te.css('width', '');
    }, 2000);
  });

  $('#copy-private-key').click(event => {
    Helpers.copyToClipboard(JSON.stringify(Session.getKey()));
    var te = $(event.target);
    var originalText = te.text();
    var originalWidth = te.width();
    te.width(originalWidth);
    te.text(t('copied'));
    setTimeout(() => {
      te.text(originalText);
      te.css('width', '');
    }, 2000);
  });
}

export default {init};
