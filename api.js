/* ═══════════════════════════════════════════
   api.js — GAS API 호출 래퍼
   google.script.run 대신 fetch() 사용
   ═══════════════════════════════════════════ */

// ⚠️ 여기에 GAS 웹앱 URL을 넣어야 함!
var GAS_URL = 'YOUR_GAS_WEB_APP_URL_HERE';

var API = {
  _call: function(action, params, onSuccess, onFailure) {
    var url = GAS_URL + '?action=' + action;
    if (params) {
      Object.keys(params).forEach(function(k) {
        url += '&' + k + '=' + encodeURIComponent(params[k]);
      });
    }
    fetch(url)
      .then(function(res) { return res.json(); })
      .then(function(data) { if (onSuccess) onSuccess(data); })
      .catch(function(err) { if (onFailure) onFailure(err); });
  },

  getSchoolCodes: function(onSuccess, onFailure) {
    this._call('getCodes', null, onSuccess, onFailure);
  },

  checkStudent: function(key, onSuccess, onFailure) {
    this._call('check', { key: key }, onSuccess, onFailure);
  },

  registerStudent: function(key, schoolCode, grade, cls, num, nick, pw, dataJson, onSuccess, onFailure) {
    this._call('register', {
      key: key, schoolCode: schoolCode, grade: grade,
      cls: cls, num: num, nick: nick, pw: pw, data: dataJson
    }, onSuccess, onFailure);
  },

  loginStudent: function(key, pw, onSuccess, onFailure) {
    this._call('login', { key: key, pw: pw }, onSuccess, onFailure);
  },

  saveData: function(key, dataJson, onSuccess, onFailure) {
    this._call('save', { key: key, data: dataJson }, onSuccess, onFailure);
  },

  loadData: function(key, onSuccess, onFailure) {
    this._call('load', { key: key }, onSuccess, onFailure);
  }
};
