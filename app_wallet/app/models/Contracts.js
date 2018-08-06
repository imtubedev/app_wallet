import Request from '../utils/RequestUtil';
import { address } from '../utils/Api';
import { EasyToast } from '../components/Toast';
import store from 'react-native-simple-store';
import * as CryptoJS from 'crypto-js';
import { DeviceEventEmitter } from 'react-native';


export default {
    namespace: 'contracts',
    state: {
        list: [],
        total: {},
        totalOpt: {}
    },
    effects: {
        *info({ payload }, { call, put }) {
            try {
                //获取数据
                const resp = yield call(Request.request, address, 'get');
                //解析数据
                if (resp.code == "0") {
                    let i = 0;
                    let list = [];
                    resp.data.coins.forEach(element => {
                        var other = new Object();
                        other.name = "其他";
                        other.value = resp.data.money - element.value;
                        var current = new Object();
                        current.name = element.name;
                        current.value = element.value;
                        element.opt = {
                        }
                        i++;
                        list.push(element);
                    });
                    let contracts = yield call(store.get, 'contracts');
                    yield put({ type: 'update', payload: { contracts : contracts } });
                } else {
                    EasyToast.show(resp.msg);
                }
            } catch (error) {
                EasyToast.show('网络繁忙,请稍后!');
            }
        },
        *saveWallet({ payload }, { call, put }) {
            var contracts = yield call(store.get, 'contracts');        
            if (contracts == null) {
                contracts = [];              
            }

            // wallet = JSON.parse(wallet);
            alert(3);

            // var _account = "account" + contracts.length;
            // alert(4);
        
            var _wallet = {
                labelname: payload.labelname,
                address: payload.address,               
            }         
            contracts[contracts.length] = _wallet;
            yield call(store.save, 'contracts', contracts);
            yield put({ type: 'updateAction', payload: { data: contracts, ...payload } });
        },
        *walletList({ payload }, { call, put }) {
            const walletArr = yield call(store.get, 'walletArr');
            // alert('walletArr'+JSON.stringify(walletArr));
            yield put({ type: 'updateAction', payload: { data: walletArr, ...payload } });

        }, 
        *delWallet({ payload }, { call, put }) {          
            var walletArr = yield call(store.get, 'contracts');
            for (var i = payload.keyArr.length; i > 0 ; i--) {
                walletArr.splice(payload.keyArr[i-1], 1);
                yield call(store.save, 'contracts', walletArr);
                yield put({ type: 'update', payload: { data: walletArr, ...payload } });
                EasyToast.show('删除成功，点击完成刷新');
            }
        }
    },
    reducers: {
        update(state, action) {
            return {...state,...action.payload};
        },
        updateAction(state, action) {
            let contracts = action.payload.data;
            return { ...state, contracts };
        },
    }
}