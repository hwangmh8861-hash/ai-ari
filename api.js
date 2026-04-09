/**
 * AI아리 — GAS API 서버
 * GitHub Pages에서 fetch()로 호출하는 용도
 */

function doGet(e) {
  return handleRequest(e);
}

function doPost(e) {
  return handleRequest(e);
}

function handleRequest(e) {
  var params = e.parameter || {};
  var action = params.action || '';
  var result = {};
  
  try {
    switch(action) {
      case 'getCodes':
        result = getSchoolCodes();
        break;
      case 'check':
        result = checkStudent(params.key);
        break;
      case 'register':
        result = registerStudent(params.key, params.schoolCode, params.grade, params.cls, params.num, params.nick, params.pw, params.data);
        break;
      case 'login':
        result = loginStudent(params.key, params.pw);
        break;
      case 'save':
        result = saveData(params.key, params.data);
        break;
      case 'load':
        result = loadData(params.key);
        break;
      default:
        result = { success: false, error: 'Unknown action' };
    }
  } catch(err) {
    result = { success: false, error: err.toString() };
  }
  
  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

function getSheet(name) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    if (name === '학교코드') {
      sheet.appendRow(['코드', '학교명', '지역', '생성일']);
      sheet.appendRow(['DEMO2026', '데모학교', '서울', new Date()]);
      sheet.appendRow(['TEST1234', '테스트학교', '테스트', new Date()]);
    } else if (name === '학생') {
      sheet.appendRow(['키', '학교코드', '학년', '반', '번호', '닉네임', '비밀번호', '데이터JSON', '생성일', '수정일']);
    }
  }
  return sheet;
}

function getSchoolCodes() {
  var sheet = getSheet('학교코드');
  var data = sheet.getDataRange().getValues();
  var codes = {};
  for (var i = 1; i < data.length; i++) {
    if (data[i][0]) codes[data[i][0]] = { name: data[i][1], region: data[i][2] };
  }
  return codes;
}

function checkStudent(key) {
  var sheet = getSheet('학생');
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === key) return { exists: true };
  }
  return { exists: false };
}

function registerStudent(key, schoolCode, grade, cls, num, nick, pw, dataJson) {
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var check = checkStudent(key);
    if (check.exists) return { success: false, error: '이미 등록된 학번이야!' };
    var sheet = getSheet('학생');
    sheet.appendRow([key, schoolCode, grade, cls, num, nick, pw, dataJson, new Date(), new Date()]);
    return { success: true };
  } finally {
    lock.releaseLock();
  }
}

function loginStudent(key, pw) {
  var sheet = getSheet('학생');
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === key) {
      if (data[i][6] !== pw) return { success: false, error: '비밀번호가 틀렸어!' };
      return { success: true, data: data[i][7] };
    }
  }
  return { success: false, error: '등록되지 않은 계정이야!' };
}

function saveData(key, dataJson) {
  var sheet = getSheet('학생');
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === key) {
      sheet.getRange(i + 1, 8).setValue(dataJson);
      sheet.getRange(i + 1, 10).setValue(new Date());
      return { success: true };
    }
  }
  return { success: false };
}

function loadData(key) {
  var sheet = getSheet('학생');
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === key) return { success: true, data: data[i][7] };
  }
  return { success: false };
}
