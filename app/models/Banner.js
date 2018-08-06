import Request from '../utils/RequestUtil';
import {bannerList} from '../utils/Api';
import store from 'react-native-simple-store';
import { EasyToast } from '../components/Toast';

export default {
    namespace: 'banner',
    state: {
        banners:[]
    },
    effects: {
      *list({payload},{call,put}) {
        try{
            const resp = yield call(Request.request,bannerList,'get');
            if(resp.code=='0'){
                yield call(store.save,'banners',resp.data);
                yield put({type:'update',payload:{banners:resp.data}});
            }else{
                EasyToast.show(resp.msg);
            }
        }catch(error){
            EasyToast.show("网络异常")
        }
      },
      *loadStorage(action, { call, put }) {
        const banners = yield call(store.get, 'banners')
        yield put({type:'update',payload:{banners}});
      },
    },
    reducers: {
        update(state, action) {
            return {...state,
                banners:action.payload.banners
            };
        },
    },
    subscriptions: {
        setup({ dispatch }) {
          dispatch({ type: 'loadStorage' })
        },
      },
  }
  