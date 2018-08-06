import React from 'react';
import { connect } from 'react-redux'
import { NativeModules, StatusBar, BackHandler, DeviceEventEmitter, InteractionManager, Clipboard, ListView, StyleSheet, Image, ScrollView, View, RefreshControl, Text, TextInput, Platform, Dimensions, Modal, TouchableHighlight,TouchableOpacity,KeyboardAvoidingView } from 'react-native';
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
import Constants from '../../utils/Constants';

var AES = require("crypto-js/aes");
var CryptoJS = require("crypto-js");
var dismissKeyboard = require('dismissKeyboard');
@connect(({ wallet }) => ({ ...wallet }))
class TurnOutAsset extends BaseComponent {
    static navigationOptions = ({ navigation }) => {
        const params = navigation.state.params || {};
        return {
            headerTitle: '转出' + params.coins.asset.name,
            headerStyle: {
                paddingTop:Platform.OS == 'ios' ? 30 : 20,
                backgroundColor: UColor.mainColor,
                borderBottomWidth:0,
            },
        };
    };

    //组件加载完成
    componentDidMount() {
        var params = this.props.navigation.state.params.coins;
        var tmpbalance = this.props.navigation.state.params.balance;
        this.setState({
            toAccount: params.toaccount == null ? '' : params.toaccount,
            amount: params.amount == null ? '' : params.amount,
            name: params.asset.name,
            balance: tmpbalance == null ? '0.0000' : tmpbalance,
        })
        DeviceEventEmitter.addListener('scan_result', (data) => {
            try {
                //TODO: 开启扫码已做检测判断资产类型是否匹配，在此不必判断,this.state.name取值不准。
                // if(data.symbol){
                //     var tmpname = this.state.name;
                //     if(data.symbol != tmpname){
                //         EasyToast.show('扫码转账资产不匹配，请确认再转');
                //         return ;
                //     }
                // }
                if(data.toaccount){
                    this.setState({toAccount:data.toaccount});
                }
                if(data.amount){
                    this.setState({amount:data.amount})
                }
            } catch (error) {
                
            }
        });
    }
    scan() {
        const { navigate } = this.props.navigation;
        navigate('BarCode', {isTurnOut:true,coinType:this.state.name});
    }
    componentWillUnmount(){
        //结束页面前，资源释放操作
        super.componentWillUnmount();
        DeviceEventEmitter.removeListener('scan_result');
      }

    onPress(action) {
        EasyDialog.show("温馨提示", "该功能正在紧急开发中，敬请期待！", "知道了", null, () => { EasyDialog.dismis() });
    }

    _rightButtonClick() {
        //   console.log('右侧按钮点击了');  
        if (this.state.toAccount == null || this.state.toAccount == "") {
            EasyToast.show('请输入收款账号');
            return;  
        }
        
        if (this.state.amount == null || this.state.amount == "") {
            EasyToast.show('请输入转账金额');
            return;
        }
        var value;
        var floatbalance;
        try {
            value = parseFloat(this.state.amount);
            floatbalance = parseFloat(this.state.balance);
          } catch (error) {
            value = 0;
          }
        if(value <= 0){
            this.setState({ amount: "" })
            EasyToast.show('请输入转账金额');
            return ;
        }
        if(value > floatbalance){
            this.setState({ amount: "" })
            EasyToast.show('账户余额不足,请重输');
            return ;
        }
        this._setModalVisible();
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

    goPage(coinType) {
        const { navigate } = this.props.navigation;
        navigate('Thin', { coinType });
    }
    inputPwd = () => {

        this._setModalVisible();

        const view =
            <View style={styles.passoutsource}>
                <TextInput autoFocus={true} onChangeText={(password) => this.setState({ password })} returnKeyType="go" 
                    selectionColor={UColor.tintColor} secureTextEntry={true} keyboardType="ascii-capable" style={styles.inptpass} maxLength={Constants.PWD_MAX_LENGTH}
                    placeholderTextColor={UColor.arrow} placeholder="请输入密码" underlineColorAndroid="transparent" />
            </View>
            EasyDialog.show("密码", view, "确认", "取消", () => {

            if (!this.state.password || this.state.password == "" || this.state.password.length < Constants.PWD_MIN_LENGTH) {
                EasyToast.show('密码长度至少4位,请重输');
                return;
            }
            
            var privateKey = this.props.defaultWallet.activePrivate;
            try {
                var bytes_privateKey = CryptoJS.AES.decrypt(privateKey, this.state.password + this.props.defaultWallet.salt);
                var plaintext_privateKey = bytes_privateKey.toString(CryptoJS.enc.Utf8);

                if (plaintext_privateKey.indexOf('eostoken') != -1) {
                    EasyLoading.show();
                    plaintext_privateKey = plaintext_privateKey.substr(8, plaintext_privateKey.length);
                    Eos.transfer(this.props.navigation.state.params.coins.asset.contractAccount, this.props.defaultWallet.account, this.state.toAccount, this.state.amount + " " + this.props.navigation.state.params.coins.asset.name, this.state.memo, plaintext_privateKey, false, (r) => {
                        this.props.dispatch({
                            // type: 'wallet/pushTransaction', payload: { to: this.state.toAccount, amount: this.state.amount, from: this.props.defaultWallet.account, data: r.data.transaction }, callback: (data) => {
                            type: 'wallet/pushTransaction', payload: { from: this.props.defaultWallet.account, to: this.state.toAccount, amount: this.state.amount + " " + this.props.navigation.state.params.coins.asset.name, memo: this.state.memo, data: JSON.stringify(r.data.transaction) }, callback: (result) => {
                                EasyLoading.dismis();
                                if (result.code == '0') {
                                    AnalyticsUtil.onEvent('Turn_out');
                                    EasyToast.show('交易成功');
                                    DeviceEventEmitter.emit('transaction_success');
                                    this.props.navigation.goBack();
                                } else {
                                    EasyToast.show('交易失败');
                                }
                            }
                        });
                    });
                    //     }
                    // });
                } else {
                    EasyLoading.dismis();
                    EasyToast.show('密码错误');
                }
            } catch (e) {
                EasyLoading.dismis();
                EasyToast.show('密码错误');
            }
            EasyDialog.dismis();
        }, () => { EasyDialog.dismis() });
    }

    chkLast(obj) {
        if (obj.substr((obj.length - 1), 1) == '.') {
            obj = obj.substr(0, (obj.length - 1));
        }
    }

    chkAccount(obj) {
        var charmap = '.12345abcdefghijklmnopqrstuvwxyz';
        for(var i = 0 ; i < obj.length;i++){
            var tmp = obj.charAt(i);
            for(var j = 0;j < charmap.length; j++){
                if(tmp == charmap.charAt(j)){
                    break;
                }
            }
            if(j >= charmap.length){
                //非法字符
                obj = obj.replace(tmp, ""); 
                EasyToast.show('请输入正确的账号');
            }
        }
        if (obj == this.props.defaultWallet.account) {
            EasyToast.show('收款账户和转出账户不能相同，请重输');
            obj = "";
        }
        return obj;
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
        var max = 9999999999.9999;  // 100亿 -1
        var min = 0.0000;
        var value = 0.0000;
        var floatbalance;
        try {
          value = parseFloat(obj);
          floatbalance = parseFloat(this.state.balance);
        } catch (error) {
          value = 0.0000;
          floatbalance = 0.0000;
        }
        if(value < min|| value > max){
          EasyToast.show("输入错误");
          obj = "";
        }
        if (value > floatbalance) {
            EasyToast.show('账户余额不足,请重输');
            obj = "";
        }

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
        const c = this.props.navigation.state.params.coins;
        return (
        <View style={styles.container}>
                
            <KeyboardAvoidingView behavior={Platform.OS == 'ios' ? "position" : null}>
                <ScrollView  keyboardShouldPersistTaps="always">
                    <TouchableOpacity activeOpacity={1.0} onPress={this.dismissKeyboardClick.bind(this)}>
                        <View style={styles.header}>
                            <Text style={styles.headertext}>{this.state.balance==""? "0.0000" :this.state.balance.replace(c.asset.name, "")} {c.asset.name}</Text>
                            {/* <Text style={styles.rowtext}>≈ {c.value} ￥</Text> */}
                        </View>
                        <View style={styles.taboutsource}>
                            <View style={styles.outsource}>
                                <View style={styles.inptoutsource}>
                                    <View style={styles.accountoue} >
                                        <TextInput ref={(ref) => this._raccount = ref}  value={this.state.toAccount} returnKeyType="next"   
                                            selectionColor={UColor.tintColor} style={styles.inpt} placeholderTextColor={UColor.arrow}      
                                            placeholder="收款人账号" underlineColorAndroid="transparent" keyboardType="default"  maxLength = {12}
                                            onChangeText={(toAccount) => this.setState({ toAccount: this.chkAccount(toAccount)})} 
                                        />
                                    <View style={styles.scanning}>
                                            <Button onPress={() => this.scan()}>                                  
                                                <Image source={UImage.scan} style={styles.scanningimg} />                                 
                                            </Button>
                                        </View>
                                    </View>
                                </View>
                                <View style={styles.separate}></View>
                                <View style={styles.textinptoue} >
                                    <TextInput  ref={(ref) => this._ramount = ref} value={this.state.amount} returnKeyType="next"
                                        selectionColor={UColor.tintColor} style={styles.textinpt}  placeholderTextColor={UColor.arrow} 
                                        placeholder="转账金额"  underlineColorAndroid="transparent"   keyboardType="numeric"   maxLength = {15}
                                        onChangeText={(amount) => this.setState({ amount: this.chkPrice(amount) })}
                                        />
                                </View>
                                <View style={styles.separate}></View>
                                <View style={styles.textinptoue} >
                                    <TextInput  ref={(ref) => this._rnote = ref}  value={this.state.memo} returnKeyType="next"
                                        selectionColor={UColor.tintColor} style={styles.textinpt}  placeholderTextColor={UColor.arrow}
                                        placeholder="备注(MEMO)" underlineColorAndroid="transparent" keyboardType="default"  
                                        onChangeText={(memo) => this.setState({ memo })}
                                        />
                                </View>
                                <View style={styles.separate}></View>
                                <Button onPress={this._rightButtonClick.bind(this)} style={styles.btnnextstep}>
                                    <View style={styles.nextstep}>
                                        <Text style={styles.nextsteptext}>下一步</Text>
                                    </View>
                                </Button>
                            </View>
                        </View>
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
                <View style={styles.pupuo}>
                    <Modal animationType={'slide'} transparent={true} visible={this.state.show} onShow={() => { }} onRequestClose={() => { }} >
                        <TouchableOpacity style={styles.modalStyle} activeOpacity={1.0}>
                        <View style={{ width: maxWidth,  height: maxHeight*3/5,  backgroundColor: UColor.fontColor,paddingHorizontal: 10}}>
                                <View style={styles.subView}>
                                    <Text style={styles.buttontext}/>
                                    <Text style={styles.titleText}>订单详情</Text>
                                    <Button  onPress={this._setModalVisible.bind(this)} style={styles.buttonView}>
                                        <Text style={styles.buttontext}>×</Text>
                                    </Button>
                                </View>
                                <View style={styles.separationline} >
                                    <Text style={{fontSize: 26,paddingVertical: 15, lineHeight: 10,color:'#000000',textAlign: 'center',}}>{this.state.amount} </Text>
                                    <Text style={{fontSize: 13,paddingVertical: 10, lineHeight: 10,color:'#000000',textAlign: 'center',}}> {c.asset.name}</Text>
                                </View>
                                <View style={{flex: 1,}}>
                                    <View style={styles.separationline} >
                                        <Text style={styles.explainText}>收款账户：</Text>
                                        <Text style={styles.contentText}>{this.state.toAccount}</Text>
                                    </View>
                                    <View style={styles.separationline} >
                                        <Text style={styles.explainText}>转出账户：</Text>
                                        <Text style={styles.contentText}>{this.props.defaultWallet.account}</Text>
                                    </View>
                                    <View style={styles.separationline} >
                                        <Text style={styles.explainText}>备注：</Text> 
                                        <Text style={styles.contentText} numberOfLines={1}>{this.state.memo}</Text> 
                                    </View>
                                    <Button onPress={() => { this.inputPwd() }}>
                                        <View style={styles.btnoutsource}>
                                            <Text style={styles.btntext}>确认</Text>
                                        </View>
                                    </Button>
                                </View>
                        </View>
                        </TouchableOpacity>
                    </Modal>
                </View>
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
    rowtext: {
        fontSize: 14, 
        color: '#8696B0', 
        marginTop: 5
    },
   
    pupuo: {
        backgroundColor: '#ECECF0',
    },
    // modal的样式  
    modalStyle: {
        flex: 1, 
        justifyContent: 'flex-end', 
        alignItems: 'center',
    },
    // modal上子View的样式  
    subView: {
        flexDirection: "row", 
        height: 50, 
        alignItems: 'center'
    },
    buttonView: {
        justifyContent: 'center', 
        alignItems: 'center',
    },
    buttontext: {
        width: 50,
        color: '#CBCBCB',
        fontSize: 28,
        textAlign: 'center',
    },
    // 标题  
    titleText: {
        flex: 1,
        fontSize: 18,
        fontWeight: 'bold',
        color:'#4d4d4d', 
        textAlign:'center'
    },
    // 内容  
    explainText: {
        fontSize: 18,
        textAlign: 'left',
        color: '#4D4D4D',
    },
    contentText: {
        flex: 1,
        fontSize: 18,
        textAlign: 'right',
        color: '#4D4D4D',
    },

    //转帐信息提示分隔线
    separationline: {
        height: 50,
        paddingHorizontal: 20,
        flexDirection: "row",
        borderBottomWidth: 0.5,
        borderBottomColor: '#e5e5e5',
        justifyContent: 'center',
        alignItems: 'center'
    },

    // 按钮  
    btnoutsource: {
        marginTop: 30,
        marginHorizontal: 15,
        height: 45,
        borderRadius: 6,
        backgroundColor: UColor.tintColor,
        justifyContent: 'center',
        alignItems: 'center'
    },
    btntext: {
        fontSize: 16,
        color: UColor.fontColor
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
    accountoue: {
        height: 40,
        flex: 1,
        justifyContent: 'center',
        flexDirection: "row",
    },

    inpt: {
        flex: 1,
        color: UColor.arrow,
        fontSize: 15,
        height: 40,
        paddingLeft: 2
    },
    scanning: {
        width: 30,
        flexDirection: "row",
        alignSelf: 'center',
        justifyContent: "flex-end",
        marginRight: 10
    },
    scanningimg: {
        width:30,
        height:30,
        justifyContent: 'center', 
        alignItems: 'center'
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
    }
})
export default TurnOutAsset;