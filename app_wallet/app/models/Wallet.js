import Request from '../utils/RequestUtil';
import { address, getAccountsByPuk, isExistAccountName, getintegral, isExistAccountNameAndPublicKey } from '../utils/Api';
import { EasyToast } from '../components/Toast';
import { EasyLoading } from '../components/Loading';
import store from 'react-native-simple-store';
import * as CryptoJS from 'crypto-js';
import { DeviceEventEmitter } from 'react-native';
import { Eos } from "react-native-eosjs";
import { createAccount, pushTransaction, getBalance, getInfo } from '../utils/Api';
import { pay } from 'react-native-wechat';
import JPushModule from 'jpush-react-native';

export default {
    namespace: 'wallet',
    state: {
        list: [],
        total: {},
        totalOpt: {},
        Details: []
    },
    effects: {
        *info({ payload, callback }, { call, put }) {
            var walletList = yield call(store.get, 'walletArr');
            var defaultWallet = yield call(store.get, 'defaultWallet');
            // if (walletList == null || defaultWallet == null) {
            //     // walletList = [];
            //     return;
            // }

            yield put({ type: 'update', payload: { walletList: walletList, defaultWallet: defaultWallet } });
            DeviceEventEmitter.emit('wallet_info');
            if (callback) callback();
        },
        *activeWallet({ wallet, callback}, {call, put}) {
            var AES = require("crypto-js/aes");
            var CryptoJS = require("crypto-js");
            var walletArr = yield call(store.get, 'walletArr');
            var defaultWallet = yield call(store.get, 'defaultWallet');
            if (walletArr == null) {
                walletArr = [];
                if (callback) callback({error: wallet.account + "不存在"});
                return;
            } 
            for (var i = 0; i < walletArr.length; i++) {
                if (walletArr[i].account == wallet.account) {
                    if(walletArr[i].isactived) {
                        if (callback) callback({}, error);
                        return;
                    }else if(wallet.isactived){
                        //激活账号，修改激活状态
                        walletArr[i].isactived = true;
                        yield call(store.save, 'walletArr', walletArr);
                        yield call(store.save, 'defaultWallet', walletArr[i]);
                        yield put({ type: 'updateDefaultWallet', payload: { defaultWallet: defaultWallet} });
                        DeviceEventEmitter.emit('updateDefaultWallet', {});
                        if (callback) callback(wallet,null);
                        return;
                    }                   
                }
            }

            if (callback) callback({error: wallet.account + "不存在"});

        },
        *updateWallet({ wallet, callback}, {call, put}) {
            var AES = require("crypto-js/aes");
            var CryptoJS = require("crypto-js");
            var walletArr = yield call(store.get, 'walletArr');
            if (walletArr == null) {
                walletArr = [];
                if (callback) callback({error: wallet.account + "不存在"});
                return;
            } 
            for (var i = 0; i < walletArr.length; i++) {
                if (walletArr[i].account == wallet.account) {
                    walletArr.splice(i, 1);
                }
            }
            walletArr[walletArr.length] = wallet;
            yield call(store.save, 'walletArr', walletArr);
            yield call(store.save, 'defaultWallet', wallet);
            DeviceEventEmitter.emit('updateDefaultWallet', {}); 
            if (callback) callback(wallet,null);

        },
        *saveWallet({ wallet, callback }, { call, put }) {

            var AES = require("crypto-js/aes");
            var CryptoJS = require("crypto-js");
            var walletArr = yield call(store.get, 'walletArr');
            var defaultWallet = yield call(store.get, 'defaultWallet');
            if (walletArr == null) {
                walletArr = [];
            } else if (walletArr.length >= 10) {
                DeviceEventEmitter.emit('wallet_10');
                return;
            }
            // if (defaultWallet != null && defaultWallet.account != null) {
            //     if (callback) callback({ error: '暂时只能注册一个账号' });
            //     DeviceEventEmitter.emit('wallet_10');
            //     return;
            // }
            for (var i = 0; i < walletArr.length; i++) {
                if (walletArr[i].account == wallet.account) {
                    walletArr.splice(i, 1);
                    // if (callback) callback({error: wallet.account + "已存在"});
                    // return;
                    // if(walletArr[i].isactived || !walletArr[i].hasOwnProperty('isactived') ){
                    //     if (callback) callback({}, error);
                    //     return;
                    // }else if(wallet.isactived){
                    //     //激活账号，修改激活状态
                    //     walletArr[i].isactived = true;
                    //     yield call(store.save, 'walletArr', walletArr);
                    //     yield call(store.save, 'defaultWallet', walletArr[i]);
                    //     yield put({ type: 'updateDefaultWallet', payload: { defaultWallet: defaultWallet} });
                    //     DeviceEventEmitter.emit('updateDefaultWallet', {});
                    //     if (callback) callback(_wallet,null);
                    //     return;
                    // }
                   
                }
            }

            var _ownerPrivate = CryptoJS.AES.encrypt('eostoken' + wallet.data.ownerPrivate, wallet.password + wallet.salt);
            var _activePrivate = CryptoJS.AES.encrypt('eostoken' + wallet.data.activePrivate, wallet.password + wallet.salt);
            var _words = CryptoJS.AES.encrypt('eostoken' + wallet.data.words, wallet.password + wallet.salt);
            var _words_active = CryptoJS.AES.encrypt('eostoken' + wallet.data.words_active, wallet.password + wallet.salt);

            var _wallet = {
                name: wallet.name,
                account: wallet.name,
                ownerPublic: wallet.data.ownerPublic,
                activePublic: wallet.data.activePublic,
                ownerPrivate: _ownerPrivate.toString(),
                activePrivate: _activePrivate.toString(),
                words: _words.toString(),
                words_active: _words_active.toString(),
                salt: wallet.salt,
                isactived: wallet.isactived,
                isBackups: false
            }

            // walletArr[walletArr.length] = _wallet;
            // yield call(store.save, 'walletArr', walletArr);
            // yield call(store.save, 'defaultWallet', _wallet);
            // yield put({ type: 'updateAction', payload: { data: _wallet, ...payload } });
            // if (wallet.obj.method == 'eosjs_create_key') {
            // DeviceEventEmitter.emit('key_created', { wallet: _wallet, privateKey: wallet.ownerPrivate });
            // // Eos.createAccount("eosio", wallet.ownerPrivate, wallet.name, wallet.ownerPublic, wallet.activePublic, (r) => {

            walletArr[walletArr.length] = _wallet;


            yield call(store.save, 'walletArr', walletArr);
            DeviceEventEmitter.emit('key_created');
            if(wallet.isactived || (walletArr.length == 1)){
                yield call(store.save, 'defaultWallet', _wallet);
                yield put({ type: 'updateDefaultWallet', payload: { defaultWallet: _wallet } });
                yield put({ type: 'updateGuide', payload: { guide: false } });
            }
            // DeviceEventEmitter.emit('wallet_backup', _wallet);
            JPushModule.addTags([_wallet.name], map => {

            })
            DeviceEventEmitter.emit('updateDefaultWallet', {});
            if (callback) callback(_wallet,null);
        },
        *saveWalletList({ walletList, callback }, { call, put }) {
            // alert(" --- "+walletList);
            if(walletList == null || walletList.length == 0){
                return;
            }

            var AES = require("crypto-js/aes");
            var CryptoJS = require("crypto-js");
            var walletArr = yield call(store.get, 'walletArr');
            var defaultWallet = yield call(store.get, 'defaultWallet');
            if (walletArr == null) {
                walletArr = [];
            } else if (walletArr.length >= 10) {
                DeviceEventEmitter.emit('wallet_10');
                return;
            }

            for(var j = 0; j < walletList.length; j++){
                if(walletArr.length >= 10){
                    break;
                }
                var wallet = walletList[j];
                for (var i = 0; i < walletArr.length; i++) {
                    if (walletArr[i].account == wallet.account) {
                        walletArr.splice(i, 1);
                        // if(walletArr[i].isactived || !walletArr[i].hasOwnProperty('isactived') ){
                        //     break;
                        // }
                        // if (callback) callback({error: wallet.account + "已存在"});
                        // return;
                    }
                }

                var _ownerPrivate = CryptoJS.AES.encrypt('eostoken' + wallet.data.ownerPrivate, wallet.password + wallet.salt);
                var _activePrivate = CryptoJS.AES.encrypt('eostoken' + wallet.data.activePrivate, wallet.password + wallet.salt);
                var _words = CryptoJS.AES.encrypt('eostoken' + wallet.data.words, wallet.password + wallet.salt);
                var _words_active = CryptoJS.AES.encrypt('eostoken' + wallet.data.words_active, wallet.password + wallet.salt);
    
                var _wallet = {
                    name: wallet.name,
                    account: wallet.name,
                    ownerPublic: wallet.data.ownerPublic,
                    activePublic: wallet.data.activePublic,
                    ownerPrivate: _ownerPrivate.toString(),
                    activePrivate: _activePrivate.toString(),
                    words: _words.toString(),
                    words_active: _words_active.toString(),
                    salt: wallet.salt,
                    isactived: wallet.isactived,
                    isBackups: false
                }
    
                walletArr[walletArr.length] = _wallet;

                yield call(store.save, 'walletArr', walletArr);
                DeviceEventEmitter.emit('key_created');
                if(wallet.isactived || (walletArr.length == 1)){
                    yield call(store.save, 'defaultWallet', _wallet);
                    yield put({ type: 'updateDefaultWallet', payload: { defaultWallet: _wallet } });
                }
                // DeviceEventEmitter.emit('wallet_backup', _wallet);
                JPushModule.addTags([_wallet.name], map => {
    
                })
            }
            DeviceEventEmitter.emit('updateDefaultWallet', {});
            if (callback) callback(_wallet,null);
        },
        *importPrivateKey({ payload, callback }, { call, put }) {
            var AES = require("crypto-js/aes");
            var CryptoJS = require("crypto-js");
            // const walletArr = yield call(store.get, 'walletArr');
            // yield put({ type: 'update', payload: { data: walletArr, ...payload } });
            var walletArr = yield call(store.get, 'walletArr');
            if (walletArr == null) {
                walletArr = [];
            } else if (walletArr.length >= 10) {
                if (callback) callback({ isSuccess: false });
                return;
            }
            // Encrypt
            var salt = Math.ceil(Math.random() * 100000000000000000).toString();
            var _ownerPrivate = CryptoJS.AES.encrypt('eostoken' + payload.privateKey, payload.password + salt);
            var _wallet = {
                name: payload.walletName,
                account: payload.walletName,
                // ownerPublic: wallet.ownerPublic,
                // activePublic: wallet.activePublic,
                ownerPrivate: _ownerPrivate.toString(),
                salt: salt,
                isBackups: true
                // activePrivate: _activePrivate.toString(),
                // words: _words.toString()
            }
            walletArr[walletArr.length] = _wallet;
            yield call(store.save, 'walletArr', walletArr);
            yield call(store.save, 'defaultWallet', _wallet);
            DeviceEventEmitter.emit('prikey_imported', _wallet);
        },
        *walletList({ payload, callback }, { call, put }) {
            const walletArr = yield call(store.get, 'walletArr');
            yield put({ type: 'updateAction', payload: { data: walletArr, ...payload } });
            if(callback) callback(walletArr);
        }, 
        *getWalletDetail({ payload }, { call, put }) {
            const walletArr = yield call(store.get, 'walletArr');
        },
        *modifyPassword({ payload, callback }, { call, put }) {
            var walletArr = yield call(store.get, 'walletArr');
            for (var i = 0; i < walletArr.length; i++) {
                if (walletArr[i].account == payload._wallet.account) {
                    walletArr[i] = payload._wallet;
                    yield call(store.save, 'walletArr', walletArr);
                    yield call(store.save, 'defaultWallet', payload._wallet);
                    yield put({ type: 'updateDefaultWallet', payload: { defaultWallet: payload._wallet } });
                }
            }
            if(callback) callback(payload);
            DeviceEventEmitter.emit('modify_password', payload);
            DeviceEventEmitter.emit('updateDefaultWallet', payload);
        }, 
        *delWallet({ payload, callback }, { call, put }) {
            var walletArr = yield call(store.get, 'walletArr');
            var defaultWallet = yield call(store.get, 'defaultWallet');
            if (walletArr.length == 1) {
                walletArr = [];
                yield call(store.save, 'defaultWallet', []);
                yield put({ type: 'updateDefaultWallet', payload: { defaultWallet: [] } });
                yield call(store.save, 'walletArr', walletArr);
                yield put({ type: 'updateGuide', payload: { guide: true } });
                DeviceEventEmitter.emit('delete_wallet', payload);
            } else {
                for (var i = 0; i < walletArr.length; i++) {
                    if (walletArr[i].account == payload.data.account) {
                        walletArr.splice(i, 1);
                        if (payload.data.account == defaultWallet.account) {
                            yield call(store.save, 'defaultWallet', walletArr[0]);
                            yield put({ type: 'updateDefaultWallet', payload: { defaultWallet: payload.data } });
                        }
                        yield call(store.save, 'walletArr', walletArr);
                        DeviceEventEmitter.emit('delete_wallet', payload);
                    }
                }
            }
            if(callback) callback(payload);
            DeviceEventEmitter.emit('updateDefaultWallet');
        }, 
        *delWalletList({ payload, callback }, { call, put }) {
            if(payload.walletList == null){
                return;
            }
            var walletArr = yield call(store.get, 'walletArr');
            var defaultWallet = yield call(store.get, 'defaultWallet');
            if (walletArr.length == 1) {
                walletArr = [];
                yield call(store.save, 'defaultWallet', []);
                yield put({ type: 'updateDefaultWallet', payload: { defaultWallet: [] } });
                yield call(store.save, 'walletArr', walletArr);
                DeviceEventEmitter.emit('delete_wallet', payload);
            } else {
                for(var j = 0; j < payload.walletList.length; j++){
                    for (var i = 0; i < walletArr.length; i++) {
                        if (walletArr[i].account == payload.walletList[j].account) {
                            walletArr.splice(i, 1);
                            if (payload.walletList[j].account == defaultWallet.account) {
                                yield call(store.save, 'defaultWallet', walletArr[0]);
                                yield put({ type: 'updateDefaultWallet', payload: { defaultWallet: payload.data } });
                            }
                            yield call(store.save, 'walletArr', walletArr);
                            DeviceEventEmitter.emit('delete_wallet', {data: payload.walletList[j]});
                        }
                    }
                }
            }
            if (callback) callback({ walletArr });

            DeviceEventEmitter.emit('updateDefaultWallet');
        }, 
        *getDefaultWallet({ payload, callback }, { call, put }) {
            var defaultWallet = yield call(store.get, 'defaultWallet');
            if (callback) callback({ defaultWallet });
            yield put({ type: 'updateDefaultWallet', payload: { defaultWallet: defaultWallet } });
        }, 
        *changeWallet({ payload, callback }, { call, put }) {
            yield call(store.save, 'defaultWallet', payload.data);
            yield put({ type: 'updateDefaultWallet', payload: { defaultWallet: payload.data } });
            if(callback) callback(payload.data);
        }, 
        *backupWords({ payload }, { call, put }) {
            var walletArr = yield call(store.get, 'walletArr');
            for (var i = 0; i < walletArr.length; i++) {
                // alert('backupWords: ' + walletArr[i].account + ' ' + payload.account);
                if (walletArr[i].account == payload.data.data.account) {
                    payload.data.data.isBackups = true;
                    walletArr[i] = payload.data.data;
                    yield call(store.save, 'walletArr', walletArr);
                    // DeviceEventEmitter.emit('backupWords', payload);
                }
            }
            // yield put({ type: 'updateDefaultWallet', payload: { defaultWallet: payload.data } });
        }, 
        *createAccount({ payload }, { call, put }) {
            var walletArr = yield call(store.get, 'walletArr');
            if (walletArr == null) {
                walletArr = [];
            }
            walletArr[walletArr.length] = payload;
            yield call(store.save, 'walletArr', walletArr);
            yield call(store.save, 'defaultWallet', payload);
            DeviceEventEmitter.emit('wallet_backup', payload);
            yield put({ type: 'updateDefaultWallet', payload: { defaultWallet: payload.data } });
        }, 
        *createAccountService({ payload, callback }, { call, put }) {
            // var defaultWallet = yield call(store.get, 'defaultWallet');
            // if (defaultWallet != null && defaultWallet.account != null) {
            //     if (callback) callback({ code: '500',data:'暂时不支持创建更多账号' });
            //     // DeviceEventEmitter.emit('wallet_10');
            //     return;
            // }
            try {
                const resp = yield call(Request.request, createAccount, 'post', payload);
                if (callback) callback(resp);
            } catch (error) {
                if (callback) callback({ code: 500, msg: "网络异常" });
            }
            
        }, 
        *pushTransaction({ payload, callback }, { call, put }) {
            try {
                const resp = yield call(Request.request, pushTransaction, 'post', payload);
                if (callback) callback(resp);
            } catch (error) {
                if (callback) callback({ code: 500, msg: "网络异常" });
            }
        }, 
        *getBalance({ payload, callback }, { call, put }) {
            try {
                const resp = yield call(Request.request, getBalance, 'post', payload);
                if (callback) callback(resp);
                const walletArr = yield call(store.get, 'walletArr');
                for(var i = 0; i < walletArr.length; i++){
                    if(walletArr[i].name == payload.account && resp.code == '0' && resp.data != null && resp.data != ""){
                        walletArr[i].balance = resp.data.replace("EOS", "");
                        var defaultWallet = yield call(store.get, 'defaultWallet');
                        if(defaultWallet.name != null && defaultWallet.name == payload.account){
                            DeviceEventEmitter.emit('eos_balance', resp);
                        }
                    }
                }
                yield call(store.save, 'walletArr', walletArr);
                yield put({ type: 'updateAction', payload: { data: walletArr, ...payload } });

            } catch (error) {
                if (callback) callback({ code: 500, msg: "网络异常" });
            }
        },
        *getAccountsByPuk({payload, callback},{call,put}) {
            try{
                let resp = yield call(Request.request,getAccountsByPuk,"post", payload);
                try {
                    if (callback) callback(resp);
                } catch (error) {
                }
            } catch (error) {
                if (callback) callback({ code: 500, msg: "网络异常" });
            }
         },   
         *isExistAccountName({payload, callback}, {call, put}) {
            try{
                let resp = yield call(Request.request, isExistAccountName,"post", payload);
                try {
                    if (callback) callback(resp);
                } catch (error) {
                }
            } catch (error) {
                if (callback) callback({ code: 500, msg: "网络异常" });
            }
         },
         *getintegral({payload, callback},{call,put}) {
            try{
                const resp = yield call(Request.request, getintegral, "post", payload);
                if(resp.code=='0'){              
                    if (callback) callback(resp);
                }else{
                    EasyToast.show(resp.msg);
                }
            } catch (error) {
                EasyToast.show('网络繁忙,请稍后!');
            }
         },
         *updateGuideState({payload, callback},{call,put}) {
            yield put({ type: 'updateGuide', payload: { guide: payload.guide } });
            if (callback) callback(payload);
         },
         *updateInvalidState({payload, callback},{call,put}) {
            yield put({ type: 'updateInvalid', payload: { Invalid: payload.Invalid } });
            if (callback) callback(payload);
         },
         *scanInvalidWallet({callback},{call,put}) {
            const walletArr = yield call(store.get, 'walletArr');
            var invalidWalletArr = [];
            if(walletArr != null){
                for(var i = 0; i < walletArr.length; i++){
                    if(walletArr[i].name.length < 12 || walletArr[i].name == "genesisblock"){
                      invalidWalletArr.push(walletArr[i]);
                    }
                  }
            }

            if(callback) callback(invalidWalletArr);
            yield put({ type: 'updateInvalidWalletArr', payload: { invalidWalletArr: invalidWalletArr} });
            yield call(store.save, 'invalidWalletArr', invalidWalletArr);
         },
         *changeRevealWallet({ payload,callback }, { call, put }) {
            var reveal = yield call(store.get, 'reveal_wallet');  
            // alert(JSON.stringify(reveal) );      
            if (reveal == null) {
                reveal = false;              
            }else{
                reveal = !reveal;
            }
            if (callback) callback({ reveal: reveal });
            yield call(store.save, 'reveal_wallet', reveal);
          },
          *getRevealWallet({ payload,callback }, { call, put }) {
            var reveal = yield call(store.get, 'reveal_wallet');
            if (reveal == null) {
                reveal = false;              
            }
            if (callback) callback({ reveal: reveal });
          },

         *isExistAccountNameAndPublicKey({payload, callback},{call,put}) {
            // alert('22' + JSON.stringify(payload) )
            try{
                let resp = yield call(Request.request, isExistAccountNameAndPublicKey,"post", payload);
                // alert('22' + resp)
                try {
                    if (callback) callback(resp);
                } catch (error) {
                    if (callback) callback({ code: 600, msg: "未知异常" });
                }
            } catch (error) {
                if (callback) callback({ code: 500, msg: "网络异常" });
            }
         },

         *updateTipState({payload, callback},{call,put}) {
            yield put({ type: 'updateTip', payload: { tipFlagIOS: payload.tipFlagIOS } });
            if (callback) callback(payload);
         },

    },
    reducers: {
        update(state, action) {
            return { ...state, ...action.payload };
        },
        updateAction(state, action) {
            let walletList = action.payload.data;
            return { ...state, walletList };
        },
        walletCreated(state, action) {
            let data = action.payload.data;
        }, 
        updateDefaultWallet(state, action) {
            return { ...state, ...action.payload };
        },
        updateGuide(state, action){
            return { ...state, ...action.payload };
        },
        updateInvalid(state, action){
            // alert('11: ' + JSON.stringify(action.payload))
            return { ...state, ...action.payload };
        },
        updateInvalidWalletArr(state, action) {
            let dts = action.payload.invalidWalletArr;
            let newarr = new Array();
            dts.map((item)=>{
                item.isChecked=true;
                newarr.push(item);
            })
            return {...state,invalidWalletList:newarr}; 
        },
        updateTip(state, action){
            // alert('11: ' + JSON.stringify(action.payload))
            return { ...state, ...action.payload };
        },
    }
}