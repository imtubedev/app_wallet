/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */
import React, { Component } from 'react';
import {
    Platform,
    StyleSheet,
    Text,
    DeviceEventEmitter,
    View,
    Alert
} from 'react-native';
import Barcode from 'react-native-smart-barcode'

import { EasyToast } from '../../components/Toast';

import PropTypes from 'prop-types'

import BaseComponent from "../../components/BaseComponent";

export default class App extends BaseComponent {

    static navigationOptions = ({ navigation }) => {
    }

    static navigationOptions = {
        title: '扫码',
      };


    //构造方法
    constructor(props) {
        super(props);
        this.state = {
            viewAppear: false,
            show: false,
            isTurnOut: this.props.navigation.state.params.isTurnOut == null ? false : this.props.navigation.state.params.isTurnOut,
            coinType: (this.props.navigation.state.params.coinType == null || this.props.navigation.state.params.coinType == "") ? "eos" : this.props.navigation.state.params.coinType,
        };
    }
    componentDidMount() {
        //启动定时器
        this.timer = setTimeout(
            () => this.setState({ viewAppear: true }),
            250
        );
    }
    //组件销毁生命周期
    componentWillUnmount() {
        //结束页面前，资源释放操作
        super.componentWillUnmount();
        //清楚定时器
        this.timer && clearTimeout(this.timer);
    }
    
    _errExit(){
        EasyToast.show('无效的' + this.state.coinType + '二维码');
        this.props.navigation.goBack();
        return;
    }

    activeWallet(data){
        if(data == null || data.action == null || data.action != "activeWallet"){
            return this._errExit();
        }

        var account = data.account;
        var owner = data.owner;
        var active = data.active;
        var cpu = data.cpu;
        var net = data.net;
        var ram = data.ram;
        if(account == null || owner == null || active == null || cpu == null || net == null || ram == null){
            return this._errExit();
        }

        // var length = data.length;
        // var index = "activeWallet:".length; //"eos:"
        // var point = data.lastIndexOf("?");
        // if(point <= index || point >= length)
        // {
        //     return this._errExit();
        // }
        // var account = data.substring(index,point);
        // if(account == undefined || account == null || account == ""){
        //     return this._errExit();
        // }
        // index = point + 1; //"?"
        // var ownerIndex = data.lastIndexOf("owner=");    
        // if(index != ownerIndex || ownerIndex >= length){
        //     return this._errExit();
        // }
        // index += 6; //"owner="
        // var andIndex = data.lastIndexOf("&");    
        // if(andIndex <= index || andIndex >= length){
        //     return this._errExit();
        // }
        // var owner = data.substring(index,andIndex);
        // if(owner == undefined || owner == null || owner == ""){
        //     return this._errExit();
        // }
        // index = andIndex + 1; //"&"
        // var activeIndex = data.lastIndexOf("active=");   
        // if(index != activeIndex || activeIndex >= length){
        //     return this._errExit();
        // } 
        // index += 7; //"active="
        // var active = data.substring(index,length);
        // if(active == null || active == undefined || active == "") 
        // {
        //     return this._errExit();
        // }
        // index += length; //"&"
        // var activeIndex = data.lastIndexOf("active=");   
        // if(index != activeIndex || activeIndex >= length){
        //     return this._errExit();
        // } 
        // index += 7; //"active="
        // var active = data.substring(index,length);
        // if(active == null || active == undefined || active == "") 
        // {
        //     return this._errExit();
        // }
        var jsoncode = '{"account":"' + account + '","owner":"' + owner + '","active":"' + active  + '","cpu":"' + cpu  + '","net":"' + net  + '","ram":"' + ram + '"}';
        var jdata = JSON.parse(jsoncode);
        this.props.navigation.goBack();  //正常返回上一个页面

        const { navigate } = this.props.navigation;
        navigate('APactivation', { accountInfo: jdata });
    }

    _onBarCodeRead = (e) => {
        // console.log(`e.nativeEvent.data.type = ${e.nativeEvent.data.type}, e.nativeEvent.data.code = ${e.nativeEvent.data.code}`)
        this._stopScan();
        try {
            var strcoins = e.nativeEvent.data.code;
            if(strcoins == undefined || strcoins == null){
                return this._errExit();
            }
            // alert("1" + strcoins);
            // var actionData = strcoins.replace(/\\/g,'');
            try{
                var jActionData = JSON.parse(strcoins);
                if(jActionData != null && jActionData.action != null && jActionData.action == "activeWallet"){
                    this.activeWallet(jActionData);
                    return;            
                }
            }catch(e){

            }

            var lowerCointType = this.state.coinType.toLowerCase();
            var upperCointType = this.state.coinType.toUpperCase();
            var length = strcoins.length;
            var index = strcoins.lastIndexOf(lowerCointType + ':'); //"eos:"
            if (index == 0) {
                index += (lowerCointType.length + 1); //"eos:"
                var point = strcoins.lastIndexOf("?");
                if(point <= index || point >= length)
                {
                    return this._errExit();
                }
                var account = strcoins.substring(index,point);
                if(account == undefined || account == null || account == ""){
                    return this._errExit();
                }
                index = point + 1; //"?"
                var pointamount = strcoins.lastIndexOf("amount=");    
                if(index != pointamount || pointamount >= length){
                    return this._errExit();
                }
                index += 7; //"amount="
                var point2 = strcoins.lastIndexOf("&");    
                if(point2 <= index || point2 >= length){
                    return this._errExit();
                }
                var amount = strcoins.substring(index,point2);
                if(amount == undefined || amount == null){
                    return this._errExit();
                }
                index = point2 + 1; //"&"
                var pointtoken = strcoins.lastIndexOf("token=");   
                if(index != pointtoken || pointtoken >= length){
                    return this._errExit();
                } 
                index += 6; //"token="
                var symbol = strcoins.substring(index,length);
                if(symbol == null || symbol != upperCointType)  //'EOS'
                {
                    return this._errExit();
                }
                var jsoncode = '{"toaccount":"' + account + '","amount":"' + amount + '","symbol":"' + this.state.coinType + '"}';
                var coins = JSON.parse(jsoncode);
                this.props.navigation.goBack();  //正常返回上一个页面

                if(this.state.isTurnOut){
                    DeviceEventEmitter.emit('scan_result',coins);
                }else{
                    const { navigate } = this.props.navigation;
                    navigate('TurnOut', { coins: coins });
                }
                
            } else {
                 //兼容上一版本
                 var coins = JSON.parse(e.nativeEvent.data.code);
                 if (coins.toaccount != null) {
                     coins.name = coins.symbol;
                     this.props.navigation.goBack(); //正常返回上一个页面

                     if(this.state.isTurnOut){
                         DeviceEventEmitter.emit('scan_result',coins);
                     }else{
                         const { navigate } = this.props.navigation;
                         navigate('TurnOut', { coins: coins });
                     }
                 } else {
                    return this._errExit();
                 }
            }
        } catch (error) {
            this._errExit();
        }
    };

    _startScan = (e) => {
        this._barCode.startScan()
    };

    _stopScan = (e) => {
        this._barCode.stopScan()
    }
    render() {
        return (
            <View style={{ flex: 1 }}>
                {this.state.viewAppear ?
                    <Barcode style={{ flex: 1, }} ref={component => this._barCode = component}
                        onBarCodeRead={this._onBarCodeRead} />
                    : null
                }
                        

            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5FCFF',
    },
    welcome: {
        fontSize: 20,
        textAlign: 'center',
        margin: 10,
    },
    instructions: {
        textAlign: 'center',
        color: '#333333',
        marginBottom: 5,
    },
});