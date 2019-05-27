import {CL} from '../../../src/lib/tools/index';
import {Interface} from '../../../src/lib/config/index';
import _ from 'lodash';

const {
    contentType, mail
} = Interface;

module.exports = {
    getMailAccountList() {
        let settings = {
            contentType,
            method: mail.getMailAccountList.type,
            url: mail.getMailAccountList.url,
        };
        return CL.clReqwestPromise(settings)
            .then((res) => {
                if (res.data) {
                    return res.data;
                }
            })
    },
    addMailAccount(data) {
        let settings = {
            contentType,
            method: mail.addMailAccount.type,
            url: mail.addMailAccount.url,
            data: JSON.stringify(data)
        };
        return CL.clReqwestPromise(settings)
            .then((res) => {
                if (res.data) {
                    return true;
                }
            })
    },
    changeMailAccountStatus(opened, password, id, type) {
        let settings = {
            contentType,
            method: mail.changeMailAccountStatus.type,
            url: mail.changeMailAccountStatus.url,
            data: JSON.stringify({
                opened: opened ? 1 : 0, password, type, id
            })
        };
        return CL.clReqwestPromise(settings)
            .then((res) => {
                if (res.data) {
                    return true;
                }
            })
    },
    delMailAccount(id) {
        let settings = {
            contentType,
            method: mail.delMailAccount.type,
            url: _.template(mail.delMailAccount.url)({id})
        };
        return CL.clReqwestPromise(settings)
            .then((res) => {
                if (res.data) {
                    return true;
                }
            })
    },
    getMailList(){
        let settings = {
            contentType,
            method: mail.getMailList.type,
            url: mail.getMailList.url
        };
        return CL.clReqwestPromise(settings)
            .then((res) => {
                if (res.data) {
                    return res.data;
                }
            })
    },
    addMail(data){
        let settings = {
            contentType,
            method: mail.addMail.type,
            url: mail.addMail.url,
            data: JSON.stringify(data)
        };
        return CL.clReqwestPromise(settings)
            .then((res) => {
                if (res.data) {
                    return true;
                }
            })
    },
    delMail(id) {
        let settings = {
            contentType,
            method: mail.delMail.type,
            url: _.template(mail.delMail.url)({id})
        };
        return CL.clReqwestPromise(settings)
            .then((res) => {
                if (res.data) {
                    return true;
                }
            })
    },
    updateMail(id, data){
        let settings = {
            contentType,
            method: mail.updateMail.type,
            url: _.template(mail.updateMail.url)({id}),
            data: JSON.stringify(data)
        };
        return CL.clReqwestPromise(settings)
            .then((res) => {
                if (res.data) {
                    return true;
                }
            })
    },
    getMailSenderList() {
        let settings = {
            contentType,
            method: mail.getMailSenderList.type,
            url: mail.getMailSenderList.url,
        };
        return CL.clReqwestPromise(settings)
            .then((res) => {
                if (res.data) {
                    return res.data;
                }
            })
    },
    getMailRecipientList() {
        let settings = {
            contentType,
            method: mail.getMailRecipientList.type,
            url: mail.getMailRecipientList.url,
        };
        return CL.clReqwestPromise(settings)
            .then((res) => {
                if (res.data) {
                    return res.data;
                }
            })
    },
    getMailDetail(id){
        let settings = {
            contentType,
            method: mail.getMailDetail.type,
            url: _.template(mail.getMailDetail.url)({id})
        };
        return CL.clReqwestPromise(settings)
            .then((res) => {
                if (res.data) {
                    return res.data;
                }
            })
    },
    setIndividualRecipientMaps(id, recipientIds){
        let settings = {
            contentType,
            method: mail.setIndividualRecipientMaps.type,
            url: _.template(mail.setIndividualRecipientMaps.url)({id}),
            data: JSON.stringify(recipientIds)
        };
        return CL.clReqwestPromise(settings)
            .then((res) => {
                if (res.data) {
                    return res.data;
                }
            })
    },
    getMailIndividualRecipientMapList(id){
        let settings = {
            contentType,
            method: mail.getMailIndividualRecipientMapList.type,
            url: _.template(mail.getMailIndividualRecipientMapList.url)({id})
        };
        return CL.clReqwestPromise(settings)
            .then((res) => {
                if (res.data) {
                    return res.data;
                }
            })
    },
    validMail(id){
        let settings = {
            contentType,
            method: mail.validMail.type,
            url: _.template(mail.validMail.url)({id})
        };
        return CL.clReqwestPromise(settings)
            .then((res) => {
                if (res.data) {
                    return res.data;
                }
            })
    },
    startupMail(id){
        let settings = {
            contentType,
            method: mail.startupMail.type,
            url: _.template(mail.startupMail.url)({id})
        };
        return CL.clReqwestPromise(settings)
            .then((res) => {
                if (res.data) {
                    return true;
                }
            })
    },
    stopMail(id){
        let settings = {
            contentType,
            method: mail.stopMail.type,
            url: _.template(mail.stopMail.url)({id})
        };
        return CL.clReqwestPromise(settings)
            .then((res) => {
                if (res.data) {
                    return true;
                }
            })
    },
}