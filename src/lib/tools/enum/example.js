const enum_type = require("./enumDefinition");

//枚举值转换成键，orderStatus是枚举类型名称
enum_type("orderStatus").convertToKey("待审核");
//result:CREATED


//枚举键转换成值，orderStatus是枚举类型名称
enum_type("orderStatus").convertToValue("CREATED");
//result:待审核


//获取枚举类型的定义
enum_type("orderStatus").structure();
//result:
//{
//  name: "orderStatus",
//  describe: "订单状态",
//  value: {
//    "CREATED": "待审核",
//    "APPROVED": "已审核",
//    "SHIPPED": "已出库",
//    "FINISHED": "已完成",
//    "CLOSED": "以关闭"
//  }
//}


//获取枚举类型的键值对列表
enum_type("orderStatus").getList();
//result:
//[
//  {
//    "key": "CREATED",
//    "value": "待审核"
//  },
//  {
//    "key": "APPROVED",
//    "value": "已审核"
//  },
//  {
//    "key": "SHIPPED",
//    "value": "已出库"
//  },
//  {
//    "key": "FINISHED",
//    "value": "已完成"
//  },
//  {
//    "key": "CLOSED",
//    "value": "以关闭"
//  }
//]