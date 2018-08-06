import React from 'react';
import { connect } from 'react-redux'
import { NativeModules, StatusBar, BackHandler, DeviceEventEmitter, InteractionManager, Clipboard, ListView, StyleSheet, Image, ScrollView, View, RefreshControl, Text, TextInput, Platform, Dimensions, Modal, TouchableHighlight,TouchableOpacity, KeyboardAvoidingView } from 'react-native';
import { TabViewAnimated, TabBar, SceneMap } from 'react-native-tab-view';
import store from 'react-native-simple-store';
import UColor from '../../utils/Colors'
import Button from '../../components/Button'
import UImage from '../../utils/Img'
import AnalyticsUtil from '../../utils/AnalyticsUtil';
const maxWidth = Dimensions.get('window').width;
const maxHeight = Dimensions.get('window').height;
import { EasyDialog } from "../../components/Dialog"
import { EasyToast } from '../../components/Toast';
import { EasyLoading } from '../../components/Loading';
import { Eos } from "react-native-eosjs";
import BaseComponent from "../../components/BaseComponent";
import Constants from '../../utils/Constants'
var dismissKeyboard = require('dismissKeyboard');
var ScreenWidth = Dimensions.get('window').width;

class Warning extends BaseComponent {
    static navigationOptions = ({ navigation }) => {
        const params = navigation.state.params || {};
        return {
            // headerTitle: '转出' + params.coins.name,
            headerTitle: '价格预警',
            headerStyle: {
                paddingTop:Platform.OS == 'ios' ? 30 : 20,
                backgroundColor: UColor.mainColor,
                borderBottomWidth:0,
            },
        };
    };

    //组件加载完成
    componentDidMount() {
        // this.props.dispatch({
        //     type: 'wallet/getDefaultWallet', callback: (data) => {
        //         if (data != null && data.defaultWallet.account != null) {
        //             this.getBalance(data);
        //         } else {
        //             EasyToast.show('获取账号信息失败');
        //         }
        //     }
        // });
        // var params = this.props.navigation.state.params.coins;
        this.setState({
            toAccount: "eosbille1234",
            // amount: "1.0000",
            name: "EOS",
        })
    }

    componentWillUnmount(){
        //结束页面前，资源释放操作
        super.componentWillUnmount();
      }

   
    onPress(action) {
        EasyDialog.show("温馨提示", "该功能正在紧急开发中，敬请期待！", "知道了", null, () => { EasyDialog.dismis() });
    }

    _rightButtonClick() {
       
    }

    // 显示/隐藏 modal  
    _setModalVisible() {
        let isShow = this.state.show;
        this.setState({
            show: !isShow,
        });
    }

    // 构造函数  
    constructor(props) {
        super(props);
        this.state = {
            show: false,
            toAccount: '',
            amount: '',
            memo: '',
            defaultWallet: null,
            balance: '0',
            name: '',
        };
    }

    inputPwd = () => {

    }

    chkPrice(obj) {
        obj = obj.replace(/[^\d.]/g, "");  //清除 "数字"和 "."以外的字符
        obj = obj.replace(/^\./g, "");  //验证第一个字符是否为数字
        obj = obj.replace(/\.{2,}/g, "."); //只保留第一个小数点，清除多余的
        obj = obj
          .replace(".", "$#$")
          .replace(/\./g, "")
          .replace("$#$", ".");
        obj = obj.replace(/^(\-)*(\d+)\.(\d\d\d\d).*$/,'$1$2.$3'); //只能输入四个小数
        // var max = 9999999999.9999;  // 100亿 -1
        // var min = 0.0000;
        // var value = 0.0000;
        // var floatbalance;
        // try {
        //   value = parseFloat(obj);
        //   floatbalance = parseFloat(this.state.balance);
        // } catch (error) {
        //   value = 0.0000;
        //   floatbalance = 0.0000;
        // }
        // if(value < min|| value > max){
        //   EasyToast.show("输入错误");
        //   obj = "";
        // }
        // if (value > floatbalance) {
        //     EasyToast.show('账户余额不足,请重输');
        //     obj = "";
        // }

        return obj;
      }

    clearFoucs = () => {
        this._raccount.blur();
        this._lpass.blur();
    }

    dismissKeyboardClick() {
        dismissKeyboard();
    }

    render() {
        return (
        <View style={styles.container}>
                

            <KeyboardAvoidingView behavior={Platform.OS == 'ios' ? "position" : null}>
                <ScrollView  keyboardShouldPersistTaps="always">
                    <TouchableOpacity activeOpacity={1.0} onPress={this.dismissKeyboardClick.bind(this)}>
                        <View style={styles.basc}>
                            <Text style={styles.basctext}>当前价格约 1EOS/120KB</Text>
                        </View>

                        <View style={styles.taboutsource}>
                            <View style={styles.outsource}>
                                <View style={styles.textinptoue} >
                                    <TextInput  ref={(ref) => this._ramount = ref} value={this.state.amount} returnKeyType="next"
                                        selectionColor={UColor.tintColor} style={styles.textinpt}  placeholderTextColor={UColor.arrow} 
                                        placeholder="上涨0.25%"  underlineColorAndroid="transparent"   keyboardType="numeric"   maxLength = {15}
                                        onChangeText={(amount) => this.setState({ amount: this.chkPrice(amount) })}
                                        />
                                </View>
                                <View style={styles.separate}></View>
                                <View style={styles.textinptoue} >
                                    <TextInput  ref={(ref) => this._rnote = ref}  value={this.state.memo} returnKeyType="next"
                                        selectionColor={UColor.tintColor} style={styles.textinpt}  placeholderTextColor={UColor.arrow}
                                        placeholder="下跌2%" underlineColorAndroid="transparent" keyboardType="default" maxLength={20} 
                                        onChangeText={(memo) => this.setState({ memo })}
                                        />
                                </View>
                                <View style={styles.separate}></View>
                                <View style={styles.basc}>
                                        <Text style={styles.basctext}>注：由于不同的手机设置与地区网络环境的不同，本服务可能存在一定的偏差,不适用于实施挂单!交易建议实时操作为准。</Text>
                                </View>
                                <Button onPress={this._rightButtonClick.bind(this)} style={styles.btnnextstep}>
                                    <View style={styles.nextstep}>
                                        <Text style={styles.nextsteptext}>确认</Text>
                                    </View>
                                </Button>
                            </View>
                        </View>
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
                
        </View>
        )
    }
}
const styles = StyleSheet.create({
    passoutsource: {
        flexDirection: 'column', 
        alignItems: 'center'
    },
    inptpass: {
        color: UColor.tintColor,
        height: 45,
        width: maxWidth-100,
        paddingBottom: 5,
        fontSize: 16,
        backgroundColor: UColor.fontColor,
        borderBottomColor: UColor.baseline,
        borderBottomWidth: 1,
    },

    container: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: UColor.secdColor,
        paddingTop: 5,
    },
    header: {
        height: 110,
        justifyContent: "center",
        alignItems: "center",
        margin: 5,
        borderRadius: 5,
        backgroundColor: UColor.mainColor,
    },
    headertext: {
        fontSize: 20,
        color: UColor.fontColor
    },
    row: {
        height: 90,
        backgroundColor: UColor.mainColor,
        flexDirection: "column",
        padding: 10,
        justifyContent: "space-between",
        borderRadius: 5,
        margin: 5,
    },
    top: {
        flex: 1,
        flexDirection: "row",
        alignItems: 'center',
    },
    footer: {
        height: 50,
        flexDirection: 'row',
        position: 'absolute',
        backgroundColor: UColor.secdColor,
        bottom: 0,
        left: 0,
        right: 0,
    },
   
    taboutsource: {
        flex: 1,
        flexDirection: 'column',
    },
    outsource: {
        backgroundColor: UColor.secdColor,
        flexDirection: 'column',
        padding: 20,
        flex: 1,
    },
    inptoutsource: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: UColor.mainColor,
        marginBottom: 10,
        paddingLeft: 10,
    },

    inpt: {
        flex: 1,
        color: UColor.arrow,
        fontSize: 15,
        height: 40,
        paddingLeft: 2
    },
    textinptoue: {
        paddingLeft: 10,
        height: 40,
        marginBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: UColor.mainColor,
        justifyContent: 'center',
    },

    separate: {
        height: 0.5,
        backgroundColor: UColor.secdColor
    },

    textinpt: {
        color: UColor.arrow,
        fontSize: 15,
        height: 40,
        paddingLeft: 2
    },
    btnnextstep: {
        height: 85,
        // width:ScreenWidth-120,
        marginTop: 60,
    },
    nextstep: {
        height: 45,
        backgroundColor: UColor.tintColor,
        justifyContent: 'center',
        alignItems: 'center',
        margin: 20,
        borderRadius: 5
    },
    nextsteptext: {
        fontSize: 15,
        color: UColor.fontColor
    },
    basc: {
        padding: 20,
        backgroundColor: UColor.secdColor,
    },
    basctext :{
        fontSize: 15, 
        color: UColor.arrow, 
        lineHeight: 25,
    },


})
export default Warning;