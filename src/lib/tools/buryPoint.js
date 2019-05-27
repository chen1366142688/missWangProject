import cl from './cl';
import {Interface} from 'Lib/config/index';
import _ from 'lodash';

let {contentType, addBuryPoint} = Interface;

let setPoint;

/**
 *
 * @param typeName 埋点类型
 * @param userId 关联用户Id
 * @param applicationId 关联申请单id
 * @param associationTriggerId 关联埋点触发id
 * @param extra 其他数据
 */
setPoint = (typeName, userId, applicationId, associationTriggerId, extra) => {
    let mapping = [{
        name: "cashlendingEvaluationCheck",
        desc: "Evaluation/Cashlending Evaluation模块check按钮点击埋点",
        value: 10001
    },{
        name: "otherAPPEvaluationCheck",
        desc: "Evaluation/Other APP Evaluation模块check按钮点击埋点",
        value: 10002
    }]

    let type = _.find(mapping, item => {
        return item.name === typeName;
    })

    let data = {
        typeId: type.value,
        userId,
        applicationId,
        associationTriggerId,
        extra: JSON.stringify(extra)
    };

    let settings = {
        contentType,
        method: addBuryPoint.type,
        url: addBuryPoint.url,
        data: JSON.stringify(data)
    };

    return cl.clReqwestPromise(settings);
};


export default {
    setPoint
};