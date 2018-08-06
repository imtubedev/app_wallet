import Request from '../utils/RequestUtil';
import {upgrade} from '../utils/Api';
import store from 'react-native-simple-store';
import { EasyToast } from '../components/Toast';
var DeviceInfo = require('react-native-device-info');
import Constants from '../utils/Constants';

export default {
    namespace: 'common',
    state: {
        
    },
    effects: {
      *upgrade({payload,callback},{call,put}) {
        try{
            const resp = yield call(Request.request,upgrade+"?os="+payload.os,'get');
            if(callback)callback(resp);
        }catch(error){
            EasyToast.show("网络异常")
        }
      },
      *init(action, { call, put }) {
        Constants.version = DeviceInfo.getVersion();
        Constants.os = DeviceInfo.getSystemName();
        Constants.osVersion = DeviceInfo.getSystemVersion();
        Constants.model = DeviceInfo.getModel();
        Constants.deviceId = DeviceInfo.getDeviceId();
        Constants.serial = DeviceInfo.getSerialNumber;
      },
      *loadBoot({payload,callback},{call,put}) {
        const boot = yield call(store.get, 'boot');
        if(callback)callback(boot);
      }
    },
    reducers: {
        
    },
    subscriptions: {
      setup({ dispatch }) {
        dispatch({ type: 'init' })
      }
    }
  }
  