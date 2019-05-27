var EventEmitter = require('events').EventEmitter;
var assign = require('object-assign');
var CHANGE_EVENT = 'change';
/**
 *生成store的基础事件
 * @param CNName 中文名称
 * @param EngName 英文名称
 * @param funcs 拓展方法
 * @param closeLog 是否关闭log
 * @returns {*}
 * @constructor
 */
var StoreBasicFunc = function (CNName, EngName, funcs, closeLog) {
    closeLog = true;   //关闭log
    return assign({}, EventEmitter.prototype, {
        // Emit Change event
        emitChange () {
            if (!closeLog)
                console.log("[store]" + CNName + EngName + "Store发出改变通知");
            this.emit(CHANGE_EVENT);
        },

        // Add change listener
        addChangeListener (callback) {
            if (!closeLog)
                console.log("[store]" + CNName + EngName + "Store添加回调函数");
            this.on(CHANGE_EVENT, callback);
        },

        // Remove change listener
        removeChangeListener (callback) {
            if (!closeLog)
                console.log("[store]" + CNName + EngName + "Store删除回调函数");
            this.removeListener(CHANGE_EVENT, callback);
        }
    }, funcs || {});
};

module.exports = StoreBasicFunc;
