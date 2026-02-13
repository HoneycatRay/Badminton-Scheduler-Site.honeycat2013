// === 系統入口 ===
function doGet(e) {
  return HtmlService.createHtmlOutputFromFile('index')
      .setTitle('羽球線上分組系統 Pro')
      .addMetaTag('viewport', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// === 核心功能 ===

// 檢查房間是否存在
function checkRoomExists(roomId) {
  var scriptProps = PropertiesService.getScriptProperties();
  var json = scriptProps.getProperty('ROOM_' + roomId);
  return json ? true : false;
}

// 建立新房間 (含防呆與公開索引)
function createNewRoomWithData(payload) {
  if (!payload || !payload.roomId) {
    return { success: false, message: "系統錯誤：資料傳輸異常" };
  }

  var scriptProps = PropertiesService.getScriptProperties();
  scriptProps.setProperty('ROOM_' + payload.roomId, JSON.stringify(payload));
  
  // 更新公開索引
  updatePublicIndex(payload.roomId, payload.settings.isPublic, payload);
  
  return { success: true, data: payload };
}

// 取得房間資料
function getRoomData(roomId) {
  var scriptProps = PropertiesService.getScriptProperties();
  var json = scriptProps.getProperty('ROOM_' + roomId);
  if (!json) return { success: false, message: "房間不存在" };
  return { success: true, data: JSON.parse(json) };
}

// 更新房間資料
function updateRoomData(roomId, data, version, password) {
  var scriptProps = PropertiesService.getScriptProperties();
  var json = scriptProps.getProperty('ROOM_' + roomId);
  if(!json) return { success: false, message: "房間已關閉" };
  
  // 這裡省略嚴格密碼比對，依賴前端權限控制，後端僅做資料更新
  var newData = data;
  newData.updatedAt = Date.now();
  
  scriptProps.setProperty('ROOM_' + roomId, JSON.stringify(newData));
  
  // 同步更新公開狀態
  updatePublicIndex(roomId, newData.settings.isPublic, newData);

  return { success: true, data: newData };
}

// === 公開房間大廳 ===

function getPublicRooms() {
  var scriptProps = PropertiesService.getScriptProperties();
  var indexJson = scriptProps.getProperty('PUBLIC_INDEX');
  var index = indexJson ? JSON.parse(indexJson) : {};
  
  var list = [];
  for (var key in index) {
    list.push(index[key]);
  }
  return list; 
}

function updatePublicIndex(roomId, isPublic, fullData) {
  var scriptProps = PropertiesService.getScriptProperties();
  var indexJson = scriptProps.getProperty('PUBLIC_INDEX');
  var index = indexJson ? JSON.parse(indexJson) : {};
  
  if (isPublic) {
    index[roomId] = {
      id: roomId,
      mode: fullData.settings.mode,
      courtCount: fullData.settings.courtCount,
      playerCount: (fullData.players || []).length,
      status: fullData.roundStatus || 'active'
    };
  } else {
    if (index[roomId]) delete index[roomId];
  }
  scriptProps.setProperty('PUBLIC_INDEX', JSON.stringify(index));
}

// === 管理功能 ===

function closeRoom(roomId, password) {
  var scriptProps = PropertiesService.getScriptProperties();
  scriptProps.deleteProperty('ROOM_' + roomId);
  updatePublicIndex(roomId, false, null); // 移除索引
  return { success: true };
}

function getAllRoomsAdmin(user, pass) {
  if(user !== "honeycat2013ray" || pass !== "Honeycat!") return []; // 簡單驗證
  var props = PropertiesService.getScriptProperties().getProperties();
  var rooms = [];
  for (var key in props) {
    if (key.indexOf('ROOM_') === 0) {
      try { rooms.push(JSON.parse(props[key])); } catch(e){}
    }
  }
  return rooms;
}

function forceDeleteRoom(roomId, user, pass) {
  if(user !== "honeycat2013ray" || pass !== "Honeycat!") return {success:false};
  var scriptProps = PropertiesService.getScriptProperties();
  scriptProps.deleteProperty('ROOM_' + roomId);
  updatePublicIndex(roomId, false, null);
  return { success: true };
}
   //本設計版權由Ray Wang所有 請尊重著作權 請勿抄襲 
