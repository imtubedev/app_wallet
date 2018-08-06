import Request from '../utils/RequestUtil';
import { existRegisteredUser,capture, register, login, changePwd, userInfo, signin, fetchPoint, isSigned } from '../utils/Api';
import store from 'react-native-simple-store';
import { EasyToast } from '../components/Toast';
import Constants from '../utils/Constants'
import JPushModule from 'jpush-react-native';
import JPush from 'jpush-react-native';

export default {
  namespace: 'login',
  state: {
    pointInfo: {}
  },
  effects: {
    *loadStorage(action, { call, put }) {
      const loginUser = yield call(store.get, 'loginUser')
      if (loginUser) {
        const token = yield call(store.get, 'token');
        const invite = yield call(store.get, 'invite');
        const reward = yield call(store.get, 'reward');
        Constants.loginUser = loginUser;
        Constants.token = token;
        Constants.uid = loginUser.uid;
        yield put({ type: 'update', payload: { loginUser, token, invite, reward } });
      }
    },
    *existRegisteredUser({ payload, callback }, { call, put }) {
      try {
        const resp = yield call(Request.request, existRegisteredUser, 'post', payload);
        if (callback) callback(resp);
      } catch (error) {
        if (callback) callback({ code: 500, msg: "网络异常" });
      }
    },
    *getCapture({ payload, callback }, { call, put }) {
      try {
        const resp = yield call(Request.request, capture, 'post', payload);
        if (callback) callback(resp);
      } catch (error) {
        if (callback) callback({ code: 500, msg: "网络异常" });
      }
    },
    *login({ payload, callback }, { call, put }) {
      try {
        const resp = yield call(Request.request, login, 'post', payload);
        if (resp.code == 0) {
          const loginUser = resp.data;
          yield call(store.save, 'loginUser', loginUser);
          yield call(store.save, 'token', loginUser.token);
          yield call(store.save, 'invite', loginUser.invite);
          yield call(store.save, 'reward', loginUser.reward);
          Constants.loginUser = loginUser;
          Constants.token = loginUser.token;
          Constants.uid = loginUser.uid;
          JPushModule.addTags([loginUser.uid + ""], map => {

          })
          yield put({ type: 'update', payload: { loginUser, token: loginUser.token, invite: loginUser.invite, reward: loginUser.reward } });
        }
        if (callback) callback(resp);
      } catch (error) {
        if (callback) callback({ code: 500, msg: "网络异常" });
      }
    },
    *register({ payload, callback }, { call, put }) {
      try {
        const resp = yield call(Request.request, register, 'post', payload);
        if (resp.code == 0) {
          const loginUser = resp.data;
          yield call(store.save, 'loginUser', loginUser);
          yield call(store.save, 'token', loginUser.token);
          yield call(store.save, 'invite', loginUser.invite);
          yield call(store.save, 'reward', loginUser.reward);
          Constants.loginUser = loginUser;
          Constants.token = loginUser.token;
          Constants.uid = loginUser.uid;
          JPushModule.addTags([loginUser.uid + ""], map => {

          })
          yield put({ type: 'update', payload: { loginUser, token: loginUser.token, invite: loginUser.invite, reward: loginUser.reward } });
        }
        if (callback) callback(resp);
      } catch (error) {
        if (callback) callback({ code: 500, msg: "网络异常" });
      }
    },
    *changePwd({ payload, callback }, { call, put }) {
      try {
        const resp = yield call(Request.request, changePwd, 'post', payload);
        if (callback) callback(resp);
      } catch (error) {
        if (callback) callback({ code: 500, msg: "网络异常" });
      }
    },
    *logout({ payload, callback }, { call, put }) {
      try {
        JPushModule.deleteTags([Constants.loginUser.uid + ""], map => {
          //alert(map.errorCode)
        })
        yield call(store.delete, 'token');
        yield call(store.delete, 'invite');
        yield call(store.delete, 'reward');
        yield call(store.delete, 'loginUser');
        yield put({ type: 'update', payload: { loginUser: null, token: null, invite: null, reward: null } });
        Constants.loginUser = null;
        Constants.token = null;
        Constants.uid = null;
        if (callback) callback();
      } catch (error) {
        if (callback) callback();
      }
    },
    *info({ payload }, { call, put }) {
      try {
        const resp = yield call(Request.request, userInfo + payload.uid, 'post');
        if (resp.code == 0) {
          yield call(store.save, 'loginUser', resp.data);
          yield put({ type: 'update', payload: { loginUser: resp.data } });
        }
      } catch (error) {
        if (callback) callback({ code: 500, msg: "网络异常" });
      }

    },
    *signin({ payload, callback }, { call, put }) {
      try {
        const resp = yield call(Request.request, signin, 'post', payload);
        if (resp.code == 0) {
          const userpoint = resp.data;
          // alert(userpoint);
          // yield put({ type: 'update', payload: { pointInfo: resp.data } });
          // yield call(store.save, 'userpoint',userpoint);
        }
        if (callback) callback(resp);
      } catch (error) {
        if (callback) callback({ code: 500, msg: "网络异常" });
      }
    },
    *fetchPoint({ payload, callback }, { call, put }) {
      try {
        const resp = yield call(Request.request, fetchPoint, 'post', { ...payload });
        if (resp.code == 0) {
          const userpoint = resp.data;
          // alert("fetchPoint: " + JSON.stringify(userpoint));
          yield put({ type: 'updateSign', payload: { pointInfo: resp.data } });
          // yield call(store.save, 'userpoint',userpoint);
          //  alert("fetchPoint: " + JSON.stringify(payload));
        }
        if (callback) callback(resp);
      } catch (error) {
        // alert("error: " + JSON.stringify(error));
        if (callback) callback({ code: 500, msg: "网络异常" });
      }
    },
    *changeJpush({ payload,callback }, { call, put }) {
      var jpush = yield call(store.get, 'jpush');        
      if (jpush == null) {
        jpush = false;              
      }else{
        jpush = !jpush;
      }
      yield call(store.save, 'jpush', jpush);
    },
    *getJpush({ payload,callback }, { call, put }) {
      var jpush = yield call(store.get, 'jpush');
      if (jpush == null) {
        jpush = false;              
      }
      if (callback) callback({ jpush: jpush });
    },
    *isSigned({ payload, callback }, { call, put }) {
      try {
        const resp = yield call(Request.request, isSigned, 'post', payload);
        if (resp.code == 0) {
          // const userpoint = resp.data;
          // alert(userpoint);
          // yield put({ type: 'update', payload: { pointInfo: resp.data } });
          // yield call(store.save, 'userpoint',userpoint);
        }
        if (callback) callback(resp);
      } catch (error) {
        if (callback) callback({ code: 500, msg: "网络异常" });
      }
    },

  },
  // *fetchPoint({ payload }, { call, put }) {
  //   alert('fetchPoint');
  //   try {
  //     const resp = yield call(Request.request, fetchPoint, 'post', payload);
  //     if (resp.code == 0) {
  //       const userpoint = resp.data;
  //       alert(userpoint);
  //       // yield put({ type: 'update', payload: { pointInfo: resp.data } });
  //       // yield call(store.save, 'userpoint',userpoint);
  //     }
  //     // if (callback) callback(resp);
  //   } catch (error) {
  //     if (callback) callback({ code: 500, msg: "网络异常" });
  //   }
  // },
  reducers: {
    update(state, action) {
      return { ...state, ...action.payload };
    }, updateSign(state, action) {
      return { ...state, pointInfo: action.payload.pointInfo };
    }
  },
  subscriptions: {
    setup({ dispatch }) {
      dispatch({ type: 'loadStorage' })
    },
  },
}
