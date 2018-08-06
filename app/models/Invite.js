import Request from '../utils/RequestUtil';
import {inviteInfo,getbind,bindCode} from '../utils/Api';
import { EasyToast } from '../components/Toast';

export default {
    namespace : 'invite',
    state : {
        invite: {},
        inviteInfo:{}
    },
    effects : {
        *info({payload,callback},{call, put}) {
            try {
                //获取数据
                const resp = yield call(Request.request,inviteInfo+payload.uid,'get');
                //解析数据
                if (resp.code == "0") {
                    yield put({type:'update',payload:{invite:resp.data}});
                }else{
                    EasyToast.show(resp.msg);
                }
                if(callback)callback(resp)
            } catch (error) {
                EasyToast.show('网络繁忙,请稍后!');
            }
        },
        *getBind({payload,callback},{call, put}) {
            try {
                //获取数据
                const resp = yield call(Request.request,getbind+payload.uid,'get');
                if(callback)callback(resp);
            } catch (error) {
                EasyToast.show('网络繁忙,请稍后!');
            }
        },
        *bind({payload,callback},{call, put}) {
            try {
                //获取数据
                const resp = yield call(Request.request,bindCode,'post',payload);
                if(callback)callback(resp);
            } catch (error) {
                EasyToast.show('网络繁忙,请稍后!');
            }
        }
    },
    reducers : {
        update(state, action) {
            return {...state,inviteInfo:action.payload.invite};
        }
    }
}