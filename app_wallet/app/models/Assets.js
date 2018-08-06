import Request from '../utils/RequestUtil';
import {getBalance, listAssets, addAssetToServer, getActions} from '../utils/Api';
import store from 'react-native-simple-store';
import { EasyToast } from '../components/Toast';
import { DeviceEventEmitter } from 'react-native';

export default {
    namespace: 'assets',
    state: {
        assetsData:{},
        newsRefresh:false,
        updateTime:"",
        tradeLog:{},
    },
    effects: {
      *list({payload, callback},{call,put}) {
        try{
            if(payload.page==1){
                yield put({type:'upstatus',payload:{newsRefresh:true}});
            }
            const resp = yield call(Request.request, listAssets, 'post', payload);
            // alert(JSON.stringify(resp));
            if(resp.code=='0'){
                let dts = new Array();
                resp.data.map((item)=>{
                    if(item.name != 'EOS'){  // EOS不显示在列表中
                        item.row=3;
                        dts.push(item);
                    }
                });
                yield put({type:'updateAssetList',payload:{assetsList:dts,...payload}});
            }else{
                EasyToast.show(resp.msg);
            }
            yield put({type:'upstatus',payload:{newsRefresh:false}});
        } catch (error) {
            yield put({type:'upstatus',payload:{newsRefresh:false}});
            EasyToast.show('网络繁忙,请稍后!');
        }
        if(callback) callback("");
      },
      *submitAssetInfoToServer({payload, callback},{call,put}){
        try{
            const resp = yield call(Request.request, addAssetToServer, 'post', {contract_account: payload.contractAccount, name: payload.name});
            if(resp && resp.code=='0'){
                DeviceEventEmitter.emit('updateAssetList', payload);
            }
            if(callback){
                callback(resp);
            }
        }catch(e){
            EasyToast.show('网络繁忙,请稍后!');
        }
     },
     *myAssetInfo({payload, callback},{call,put}){
        var isPriceChange = false; // 价格是否改变
        var myAssets = yield call(store.get, 'myAssets217');

        if(myAssets == null || myAssets.length == 0){ // 未有资产信息时默认取eos的
            var myAssets = [];
            // 单独获取eos信息
            var eosInfoDefault = {
                asset: {name : "EOS", icon: "http://static.eostoken.im/images/20180319/1521432637907.png", contractAccount: "eosio.token", value: "0.00"},
                value: true,
                balance: '0.0000',
            }
            myAssets[0] = eosInfoDefault;
            if(payload && payload.isInit){
                yield put({ type: 'updateMyAssets', payload: {myAssets: myAssets} });
            }
            var resp;
            try {
                resp = yield call(Request.request, listAssets, 'post', {code: 'EOS'});
                if(respresp.code == '0' && resp.data && resp.data.length == 1){
                    var eosInfo = {
                        asset: resp.data[0],
                        value: true,
                        balance: '0.0000',
                    }
                    myAssets[0] = eosInfo;
                }
            } catch (error) {

            }

            yield put({ type: 'updateMyAssets', payload: {myAssets: myAssets} });
        }else{
            if(payload && payload.isInit){
                yield put({ type: 'updateMyAssets', payload: {myAssets: myAssets} });
            }
            try{
                for(var i = 0; i < myAssets.length; i++){
                    const resp = yield call(Request.request, listAssets, 'post', {code: myAssets[i].asset.name});
                    if(resp.code == '0' && resp.data && resp.data.length == 1){
                        var assetInfo = {
                            asset: resp.data[0],
                            value: true,
                            balance: myAssets[i].balance,
                        }
                        if(resp.data[0].value != myAssets[i].asset.value){
                            isPriceChange = true;
                        }
                        myAssets[i] = assetInfo;
                    }
                }
            }catch(e){

            }

        }

        // alert("myAssetInfo" +JSON.stringify(myAssets));
        // 

        var myAssetsNew = yield call(store.get, 'myAssets217');
        if((myAssetsNew == null || myAssetsNew.length == 0 || (myAssetsNew != null && myAssetsNew.length == myAssets.length))){
            yield call(store.save, 'myAssets217', myAssets);
            yield put({ type: 'updateMyAssets', payload: {myAssets: myAssets} });
        }
        if(isPriceChange){
            DeviceEventEmitter.emit('updateMyAssetsPrice', myAssets);
        }

        if(callback){
            callback(myAssets);
        }

    },
    *getBalance({payload, callback}, {call, put}){
        try{
            // alert("------ " + JSON.stringify(payload));
            var myAssets = yield call(store.get, 'myAssets217');
            var isBalanceChange = false;
            for(let i in myAssets){
                let item = myAssets[i];
                var accountName = yield call(store.get, 'accountName');
                if(accountName == null || payload.accountName != accountName){ // 切换用户后
                    isBalanceChange = true;
                    item.balance = '0.0000';
                }
                const resp = yield call(Request.request, getBalance, 'post', {contract: item.asset.contractAccount, account: payload.accountName, symbol: item.asset.name});
                // alert("------ " + JSON.stringify(resp));
                if(resp && resp.code=='0' && resp.data != null){
                    if(resp.data != item.balance){
                        isBalanceChange = true;
                        item.balance = resp.data;
                    }
                }
            }

            if(isBalanceChange){
                // var myAssetsNew = yield call(store.get, 'myAssets');
                // if(myAssetsNew != null && myAssetsNew.length == myAssets.length){
                    // alert("getBalance" +JSON.stringify(myAssets));

                    yield call(store.save, 'accountName', payload.accountName);
                    yield call(store.save, 'myAssets217', myAssets);
                    yield put({ type: 'updateMyAssets', payload: {myAssets: myAssets} });
                // }

                DeviceEventEmitter.emit('updateMyAssetsBalance', payload);
            }

            if(callback){
                callback(payload.myAssets);
            }
        }catch(e){
            EasyToast.show('网络繁忙,请稍后!');
        }
    },
    *addMyAsset({payload, callback},{call,put}){
        var myAssets = yield call(store.get, 'myAssets217');
        // alert(JSON.stringify(payload.asset) + "   " +JSON.stringify(myAssets));
        if (myAssets == null) {
            var  myAssets = [];
        }
        for (var i = 0; i < myAssets.length; i++) {
            if (myAssets[i].asset.name == payload.asset.name) {
                if(payload.value){ // 添加资产,  但资产已存在
                    return;
                }else{ // 删除资产
                    myAssets.splice(i, 1);
                    yield call(store.save, 'myAssets217', myAssets);
                    // alert("delMyAsset" +JSON.stringify(myAssets));
                    yield put({ type: 'updateMyAssets', payload: {myAssets: myAssets} });
                    if(callback) callback(myAssets);
                    // DeviceEventEmitter.emit('updateMyAssets', payload);
                    return;
                }
            }
        }

        // 如果目前我的资产没有传入的资产
        if(!payload.value){ // 删除资产直接退出
            return;
        }

        // 添加资产
        var _asset = {
            asset: payload.asset,
            value: true,
            balance: '0.0000',
        }
        myAssets[myAssets.length] = _asset;
        yield call(store.save, 'myAssets217', myAssets);
        // alert("addMyAsset" +JSON.stringify(myAssets));
        yield put({ type: 'updateMyAssets', payload: {myAssets: myAssets} });
        if(callback) callback(myAssets);
        // DeviceEventEmitter.emit('updateMyAssets', payload);
     },
     *clearTradeDetails({payload, callback},{call,put}) {
        try{
            yield put({ type: 'clearDetails', payload: { data:null, ...payload } });
        } catch (error) {

        }
     },
     *getTradeDetails({payload, callback},{call,put}) {
        try{
            const resp = yield call(Request.request, getActions, "post", payload);
            if(resp.code=='0'){               
                yield put({ type: 'updateDetails', payload: { data:resp.data, ...payload } });
            }else{
                EasyToast.show(resp.msg);
            }
            if (callback) callback(resp);
            
        } catch (error) {
            EasyToast.show('网络繁忙,请稍后!');
            if (callback) callback({ code: 500, msg: "网络异常" });            
        }

     },
      *changeReveal({ payload,callback }, { call, put }) {
        var reveal = yield call(store.get, 'reveal');  
        // alert(JSON.stringify(reveal) );      
        if (reveal == null) {
            reveal = false;              
        }else{
            reveal = !reveal;
        }
        if (callback) callback({ reveal: reveal });
        yield call(store.save, 'reveal', reveal);
      },
      *getReveal({ payload,callback }, { call, put }) {
        var reveal = yield call(store.get, 'reveal');
        if (reveal == null) {
            reveal = false;              
        }
        if (callback) callback({ reveal: reveal });
      },
    },

    reducers: {
        updateAssetList(state, action) {
            let assetsList = action.payload.assetsList;
            return {...state,assetsList,updateTime:Date.parse(new Date())};
        },
        upstatus(state,action){
            return {...state,...action.payload};
        },
        updateMyAssets(state, action) {
            return { ...state, ...action.payload };
        },
        updateDetails(state, action) {
            let tradeLog = state.tradeLog;
            if(action.payload.data == null || action.payload.page==1 || tradeLog == null){
                tradeLog=action.payload.data;
            }else{
                tradeLog = tradeLog.concat(action.payload.data);
            }
            return {...state,tradeLog};
        },
        clearDetails(state, action) {
            let tradeLog = null;
            state.tradeLog = null;
            return { ...state, tradeLog };
        },
    }
  }
  