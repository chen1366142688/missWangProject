'use strict';
let enumMaker = require('./enum');//枚举类型

// 示例
enumMaker.fn.extendEnumList("orderStatus", {
    name: "orderStatus",
    describe: "订单状态",
    value: {
        "CREATED": "待审核",
        "APPROVED": "已审核",
        "SHIPPED": "已出库",
        "FINISHED": "已完成",
        "CLOSED": "以关闭"
    }
});

enumMaker.fn.extendEnumList("auditRadioFormType", {
    name: "auditRadioFormType",
    describe: "审核验证模块表单与tab的映射关系",
    value: {
        "1": "form1",
        "2": "form2",
        "3": "form3"
    }
});
module.exports = enumMaker;
