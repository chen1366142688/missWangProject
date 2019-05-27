import _ from 'lodash';

let callRetrieve = {
    clientList: "100001",   // Client List 模块
    adviseResult: "100002",   // Advise Result 模块
    callData: "100003"    //Call data 模块
};

let callRetrieveManagement = {
    distributionDashboard: "200001"
};

let OperationManagement = {
};


let storageList = {
    callRetrieve,    // Call Retrieve目录
    callRetrieveManagement,
    OperationManagement,     // Operation Management目录
    Demo: "900001"              // Demo
};


/**
 * 获取属性列表
 * @returns {{callRetrieve: {clientList: string}}}
 */
let getStorageList = () => {
    return storageList;
};

/**
 * 设置单条session属性
 * @param storageCode 唯一代码
 * @param fieldName 属性名
 * @param fieldValue 属性值
 */
let setSession = (storageCode, fieldName, fieldValue) => {
    let session = sessionStorage.getItem(storageCode);
    try {
        session = JSON.parse(session) || {};
        session[fieldName] = fieldValue;
        sessionStorage.setItem(storageCode, JSON.stringify(session));
    } catch (e) {
        throw new Error('session parse failure');
    }
};

/**
 * 批量添加session属性
 * @param storageCode 唯一代码
 * @param fields 属性集合对象
 */
let setSessionBatch = (storageCode, fields) => {
    let session = sessionStorage.getItem(storageCode);
    try {
        session = JSON.parse(session);
        session = _.assign(session, fields);
        sessionStorage.setItem(storageCode, JSON.stringify(session));
    } catch (e) {
        throw new Error('session parse failure');
    }
};

/**
 * 获取session属性
 * @param storageCode 唯一代码
 */
let getSession = (storageCode) => {
    let session = sessionStorage.getItem(storageCode) || '{}';
    try {
        session = JSON.parse(session);
        return session;
    } catch (e) {
        throw new Error('session parse failure');
    }
};

/**
 * 获取session属性
 * @param storageCode 唯一代码
 * @param fieldName 属性名
 */
let getSessionItem = (storageCode, fieldName) => {
    let session = sessionStorage.getItem(storageCode) || '{}';
    try {
        session = JSON.parse(session);
        return session[fieldName];
    } catch (e) {
        throw new Error('session parse failure');
    }
};

/**
 * 回收session属性
 * @param storageCode
 * @param fieldName 属性名
 */
let removeSessionItem = (storageCode, fieldName) => {
    let session = sessionStorage.getItem(storageCode);
    try {
        session = JSON.parse(session) || {};
        delete session[fieldName];
        sessionStorage.setItem(storageCode, JSON.stringify(session));
    } catch (e) {
        throw new Error('session parse failure');
    }
};


/**
 * 回收session属性
 * @param storageCode
 */
let destroySession = (storageCode) => {
    sessionStorage.removeItem(storageCode);
};

/**
 * 清除session
 */
let clear = () => {
    sessionStorage.clear();
};

export default {
    getStorageList,
    setSession,
    setSessionBatch,
    getSession,
    getSessionItem,
    removeSessionItem,
    destroySession,
    clear
}
