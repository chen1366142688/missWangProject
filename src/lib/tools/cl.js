/* 数字处理js */
import _ from 'lodash';
import reqwest from 'reqwest';
import { message } from 'antd';
import CF from 'currency-formatter';

const CL = {
  formatMoney: function formatMoney(s, type) {
    const re = /(\d)(\d{3},)/;
    let a = [];
    if (/[^0-9]/.test(s)) {
      return '0.00';
    }
    if (s === null || s === 'null' || s === '') {
      return '0.00';
    }
    s = s.toString().replace(/^(\d*)$/, '$1.');
    s = (`${s}00`).replace(/(\d*\.\d\d)\d*/, '$1');
    s = s.replace('.', ',');
    while (re.test(s)) {
      s = s.replace(re, '$1,$2');
    }
    s = s.replace(/,(\d\d)$/, '.$1');
    if (type === 0) {
      a = s.split('.');
      if (a[1] === '00') {
        s = a[0];
      }
    }
    return s;
  },

  cf(value, fix) {
    if (!value) {
      value = 0;
    }

    if (!fix) {
      fix = 0;
    }

    return CF.format(value, {precision: fix})
  },

  setOptions(arr) {
    const newArr = [];
    arr.map((doc) => {
      const obj = {};
      obj.name = doc.typeName;
      obj.value = doc.type;
      return newArr.push(obj);
    });
    return newArr;
  },

  setIdNameOptions(arr) {
    const newArr = [];
    if (!arr) {
      return [];
    }
    arr.map((doc) => {
      const obj = {};
      obj.name = doc.creditName;
      obj.value = doc.creditName;
      obj.zone = doc.zone;
      obj.oname = doc.name;
      return newArr.push(obj);
    });

    return newArr;
  },

  setCheckBox(arr) {
    const newArr = [];
    arr.map((doc) => {
      const obj = {};
      obj.label = doc.typeName;
      obj.value = doc.type;
      return newArr.push(obj);
    });
    return newArr;
  },


  setAuIdOptions(arr) {
    const newArr = [];
    arr.map((doc) => {
      const obj = {};
      obj.name = doc.fullName;
      obj.value = doc.id;
      return newArr.push(obj);
    });
    return newArr;
  },

  clearSearch(item) {
    sessionStorage.removeItem(item);
  },

  setMark(mark, contact) {
    if (mark && mark.qualifiedContactPersonNumbers && contact) {
      if (mark.qualifiedContactPersonNumbers.indexOf(contact) > -1) {
        return 'check-circle';
      } else {
        return 'close-circle';
      }

    } else {
      if (!_.isBoolean(mark)) {
        return false;
      }

      if (mark) {
        return 'check-circle';
      }
      return 'close-circle';
    }

  },

  clReqwest ({ settings, fn}) {
    let req = reqwest(settings).then((res) => {
      if (res.code && res.code === 401) { //会话过期
        location.hash = "/login";
        return;
      }

      if (res.code && res.code === 500) { //服务端错误
        message.error(res.result);
      }

      if (res.code === 200 && (_.isNull(res.data) || res.data === false)) {
        message.success(res.result);
      }
      return fn(res);
    })
    return req;
  },


  clReqwestPromise (settings) {
    return reqwest(settings).then((res) => {
        if (res.code && res.code === 401) { //会话过期
            location.hash = "/login";
            return;
        }

        if (res.code && res.code === 500) { //服务端错误
            message.error(res.result);
        }

        if (res.code === 200 && (_.isNull(res.data) || res.data === false)) {
            message.success(res.result);
        }
        return res;
    })
  },

  isRole(str) {
    let arr = sessionStorage.getItem("roles");
    arr = arr ? JSON.parse(arr) : [];
    return arr.indexOf(str) > -1 ? true : false;
  },

  setEditFlag(data) {
    let editFlag = sessionStorage.getItem("editFlag");
    if (!editFlag) {
      editFlag = {}
    } else {
      editFlag = JSON.parse(editFlag);
    }

    //已经写入
    if (parseInt(editFlag[data.tag])) {
      return;
    }

    editFlag[data.tag] = 1;
    sessionStorage.setItem("editFlag", JSON.stringify(editFlag));
  },

  //不传入tag, 清空数据
  removeEditFlag(tag) {
    let editFlag = sessionStorage.getItem("editFlag");
    if (!editFlag) {
      editFlag = {}
    } else {
      editFlag = JSON.parse(editFlag);
    }

    if (!tag) {
      _.map(editFlag, (doc, index) => {
        editFlag[index] = 0;
      })
    } else {
      //已经写入
      if (parseInt(editFlag[tag])) {
        editFlag[tag] = 0;
      }
    }

    sessionStorage.setItem("editFlag", JSON.stringify(editFlag));
  },

  getEditFlag() {
    let editFlag = sessionStorage.getItem("editFlag");
    let flag = false;
    if (!editFlag) {
      return flag;
    } else {
      editFlag = JSON.parse(editFlag);
    }

    _.each(editFlag, (value)=> {
      if (value) {
        flag = true;
      }
    });

    return flag;
  }
};

export default CL;
