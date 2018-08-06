import Request from '../utils/RequestUtil';
import {sticker} from '../utils/Api';
import store from 'react-native-simple-store';
import { EasyToast } from '../components/Toast';

export default {
    namespace: 'sticker',
    state: {
        coinList:{},
        updateTime:"",
        coinSelf:{},
        loading:false
    },
    effects: {
      *listincrease({payload,callback},{call,put}) {
        try{
          
          yield put({type:'updateLoading',payload:{loading:true}});
          
          const resp = yield call(Request.request,sticker,'get');
          if(resp.code=='0'){
              yield put({type:'update',payload:{...payload,data:resp.data}});
              if (callback) callback(resp.data);
          }else{
            yield put({type:'updateLoading',payload:{loading:false}});
            EasyToast.show(resp.msg);
            if (callback) callback(null);
          }
        }catch(err){
          yield put({type:'updateLoading',payload:{loading:false}});
          EasyToast.show('网络繁忙,请稍后!');
        }
      },
      *list({payload,callback},{call,put}) {
        try{
          
          yield put({type:'updateLoading',payload:{loading:true}});
          
          const resp = yield call(Request.request,sticker,'get');
          if(resp.code=='0'){
              yield put({type:'update',payload:{...payload,data:resp.data}});
          }else{
            yield put({type:'updateLoading',payload:{loading:false}});
            EasyToast.show(resp.msg);
          }
          if (callback) callback();
        }catch(err){
          yield put({type:'updateLoading',payload:{loading:false}});
          EasyToast.show('网络繁忙,请稍后!');
        }
      },
      *loadStorage(action,{ call, put }) {
        let coinSelf = yield call(store.get, 'coinSelf');
        if(coinSelf==undefined || coinSelf==null || coinSelf=="null"){
          coinSelf={"eos":1};
          yield call(store.save, 'coinSelf',coinSelf);
        }
        yield put({type:'updateSelf',payload:{coinSelf}});
      },
      *doCoinSelf({payload,callback},{call,put}){
        let coinSelf = yield call(store.get,'coinSelf');
        if(!coinSelf || coinSelf==null){
          coinSelf = {};
        }
        if(payload.action=="add"){
          coinSelf[payload.name.toLowerCase()]=1;
        }else{
          coinSelf[payload.name.toLowerCase()]=0;
        }
        yield call(store.save, 'coinSelf',coinSelf);
        yield put({type:'loadStorage'});
        if(callback)callback();
      }
    },
    reducers: {
      
        update(state, action) {
            combine(state,action);
            state.updateTime=Date.parse(new Date());
            return {...state,loading:false};
        },
        updateSelf(state,action){
           state.updateTime=Date.parse(new Date());
           return {...state,...action.payload};
        },
        updateLoading(state,action){
          state.loading=action.payload.loading;
          return {...state,...action.payload};
       },
    },
    subscriptions: {
      setup({ dispatch }) {
        dispatch({ type: 'loadStorage' })
      },
    },
  }

  function combine(state, action) {
    //空处理
    if(action.payload.data==undefined){
      state.coinList[action.typeId] = [];
      return;
    }
    if(action.payload.type==-1){
      state.coinList[0] = gemSlef(state,action.payload.data);
      state.coinList[1] = gemMoney(action.payload.data);
      state.coinList[2] = gemDeep(action.payload.data);
      state.coinList[3] = gemSell(action.payload.data);
    }else if(action.payload.type==0){
      state.coinList[0] = gemSlef(state,action.payload.data);
    }else if(action.payload.type==1){
      state.coinList[1] = gemMoney(action.payload.data);
    }else if(action.payload.type==2){
      state.coinList[2] = gemDeep(action.payload.data);
    }else if(action.payload.type==3){
      state.coinList[3] = gemSell(action.payload.data);
    }
    return state;
  }

//自选
 function gemSlef(state,list){
    let datas = [];
    if(state.coinSelf){
      for(var p in state.coinSelf){
        if(state.coinSelf[p]==1){
          for(var i in list){
            var item = list[i];
            if(item.name.toLowerCase()==p){
              datas.push(item);
            }
          }
        }
      }
    }
    return datas;
  }
  
  //市值
  function gemMoney(list){
    let datas = list.concat();
    datas.sort(function(a,b){
      return b.value-a.value;
    });
    return datas;
  }
  
  //涨跌
  function gemDeep(list){
    let datas = list.concat();
    datas.sort(function(a,b){
      return b.increase-a.increase;
    });
    return datas;
  }
  
  //成交
  function gemSell(list){
    let datas = list.concat();
    datas.sort(function(a,b){
      return b.txs-a.txs;
    });
    return datas;
  }
  