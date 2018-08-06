import React from 'react';
import { connect } from 'react-redux'
import {Dimensions,DeviceEventEmitter,InteractionManager,ListView,StyleSheet,View,RefreshControl,Text,ScrollView,Image,Platform,StatusBar, Modal,TextInput,TouchableOpacity, ImageBackground,KeyboardAvoidingView} from 'react-native';
import {TabViewAnimated, TabBar, SceneMap} from 'react-native-tab-view';
import UColor from '../../utils/Colors'
import Button from  '../../components/Button'
import Item from '../../components/Item'
import Icon from 'react-native-vector-icons/Ionicons'
import UImage from '../../utils/Img'
import { EasyLoading } from '../../components/Loading';
import { EasyToast } from '../../components/Toast';
import {EasyDialog} from '../../components/Dialog'
import { Eos } from "react-native-eosjs";
import BaseComponent from "../../components/BaseComponent";
import Constants from '../../utils/Constants'
const ScreenWidth = Dimensions.get('window').width;
const ScreenHeight = Dimensions.get('window').height;
var AES = require("crypto-js/aes");
var CryptoJS = require("crypto-js");
var dismissKeyboard = require('dismissKeyboard');
@connect(({wallet, vote}) => ({...wallet, ...vote}))
class Memory extends BaseComponent {

  
    static navigationOptions = ({ navigation }) => {
    
        const params = navigation.state.params || {};
       
        return {    
          title: "内存资源",
          headerStyle: {
            paddingTop:Platform.OS == 'ios' ? 30 : 20,
            backgroundColor: UColor.mainColor,
            borderBottomWidth:0,
          },
        };
      };

    constructor(props) {
        super(props);
        this.state = {
            isBuyOneself: true,  
            isBuyForOther: false,  
            receiver: "",
            buyRamAmount: "",
            sellRamBytes: "",
            password: "",
            balance: '0',
            used: '0',
            available: '0',
            show: false,
        };
    }

    getAccountInfo(){
        this.props.dispatch({ type: 'vote/getaccountinfo', payload: { page:1,username: this.props.defaultWallet.account},callback: (data) => {
            // alert("----------" + JSON.stringify(data));
            this.setState({
                used:(data.ram_usage / 1024).toFixed(3),
                available:((data.total_resources.ram_bytes - data.ram_usage) / 1024).toFixed(3),
            });
        } });
    } 
    
    setEosBalance(data){
        if (data.code == '0') {
            if (data.data == "") {
              this.setState({
                balance: '0',
              })
            } else {
              account: this.props.defaultWallet.name,
              this.setState({ balance: data.data.replace("EOS", ""), })
            }
          } else {
            // EasyToast.show('获取余额失败：' + data.msg);
          }
    }

    getBalance() { 
        if (this.props.defaultWallet != null && this.props.defaultWallet.name != null) {
          this.props.dispatch({
            type: 'wallet/getBalance', payload: { contract: "eosio.token", account: this.props.defaultWallet.name, symbol: 'EOS' }, callback: (data) => {
                this.setEosBalance(data);
            }
          })
        } else {
          this.setState({ balance: '0'})
        }
    }

    componentDidMount() {
        EasyLoading.show();
        this.props.dispatch({type: 'wallet/getDefaultWallet', callback: (data) => {  
            this.getAccountInfo();
            EasyLoading.dismis();
        }});   

        this.props.dispatch({ type: 'wallet/info', payload: { address: "1111" } });
        DeviceEventEmitter.addListener('wallet_info', (data) => {
            this.getBalance();
          });

        DeviceEventEmitter.addListener('updateDefaultWallet', (data) => {
            this.props.dispatch({ type: 'wallet/info', payload: { address: "1111" } });
            this.getBalance();
        });

        DeviceEventEmitter.addListener('eos_balance', (data) => {
            this.setEosBalance(data);
        });
    }

    componentWillUnmount(){
        //结束页面前，资源释放操作
        super.componentWillUnmount();
    }
    
     // 更新"全部/未处理/已处理"按钮的状态  
     _updateBtnSelectedState(currentPressed, array) {  
        if (currentPressed === null || currentPressed === 'undefined' || array === null || array === 'undefined') {  
            return;  
        }  
  
        let newState = {...this.state};  
  
        for (let type of array) {  
            if (currentPressed == type) {  
                newState[type] ? {} : newState[type] = !newState[type];  
                this.setState(newState);  
            } else {  
                newState[type] ? newState[type] = !newState[type] : {};  
                this.setState(newState);  
            }  
        }  
    }  
  
    // 返回设置的button  
    _getButton(style, selectedSate, stateType, buttonTitle) {  
        let BTN_SELECTED_STATE_ARRAY = ['isBuyOneself', 'isBuyForOther'];  
        return(  
            <TouchableOpacity style={[style, selectedSate ? {backgroundColor: UColor.tintColor} : {backgroundColor: UColor.mainColor}]} onPress={ () => {this._updateBtnSelectedState(stateType, BTN_SELECTED_STATE_ARRAY)}}>  
                <Text style={[styles.tabText, selectedSate ? {color: UColor.fontColor} : {color: '#7787A3'}]} >{buttonTitle}</Text>      
            </TouchableOpacity>  
        );  
    }  

    // 显示/隐藏 modal  
    _setModalVisible() {
        let isShow = this.state.show;
        this.setState({
        show: !isShow,
        });
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
            EasyToast.show('接收账号和自己账号不能相同，请重输');
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
        try {
          value = parseFloat(obj);
        } catch (error) {
          value = 0.0000;
        }
        if(value < min|| value > max){
          EasyToast.show("输入错误");
          obj = "";
        }
        return obj;
      }
    buyram = (rowData) => { // 选中用户
        if(!this.props.defaultWallet){
            EasyToast.show('请先创建钱包');
            return;
        }

        if(this.state.buyRamAmount == ""){
            EasyToast.show('请输入购买金额');
            return;
        }
        var tmp;
        try {
             tmp = parseFloat(this.state.buyRamAmount);
          } catch (error) {
              tmp = 0;
          }
        if(tmp <= 0){
            this.setState({ buyRamAmount: "" })
            EasyToast.show('请输入购买金额');
            return;
        }

        this. dismissKeyboardClick();
            const view =
            <View style={styles.passoutsource}>
                <TextInput autoFocus={true} onChangeText={(password) => this.setState({ password })} returnKeyType="go" 
                    selectionColor={UColor.tintColor} secureTextEntry={true} keyboardType="ascii-capable" style={styles.inptpass} maxLength={Constants.PWD_MAX_LENGTH}
                    placeholderTextColor={UColor.arrow} placeholder="请输入密码" underlineColorAndroid="transparent" />
                <Text style={styles.inptpasstext}></Text>  
            </View>
    
            EasyDialog.show("请输入密码", view, "确认", "取消", () => {
    
            if (this.state.password == "" || this.state.password.length < Constants.PWD_MIN_LENGTH) {
                EasyToast.show('密码长度至少4位,请重输');
                return;
            }


            var privateKey = this.props.defaultWallet.activePrivate;
            try {
                var bytes_privateKey = CryptoJS.AES.decrypt(privateKey, this.state.password + this.props.defaultWallet.salt);
                var plaintext_privateKey = bytes_privateKey.toString(CryptoJS.enc.Utf8);
                if (plaintext_privateKey.indexOf('eostoken') != -1) {
                    plaintext_privateKey = plaintext_privateKey.substr(8, plaintext_privateKey.length);
                    // alert("plaintext_privateKey "+plaintext_privateKey);
                    EasyLoading.show();
                    if(this.state.isBuyOneself){
                        this.state.receiver = this.props.defaultWallet.account;
                    }
                    // alert("isBuyOneself: " + this.state.isBuyOneself + " receiver: "+this.state.receiver+" amount: " + this.state.buyRamAmount + " account: "+this.props.defaultWallet.account);

                    Eos.buyram(plaintext_privateKey, this.props.defaultWallet.account, this.state.receiver, this.state.buyRamAmount + " EOS", (r) => {
                        EasyLoading.dismis();
                        if(r.isSuccess){
                            this.getAccountInfo();
                            EasyToast.show("购买成功");
                        }else{
                            // var errmsg = "抵押失败: ";
                            // if(r.data){
                            //     if(r.data.msg){
                            //         errmsg += r.data.msg;
                            //     }
                            // }
                            // EasyToast.show(errmsg);
                            this._setModalVisible();
                        }
                    });

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
    };

    sellram = (rowData) => { // 选中用户
        if(!this.props.defaultWallet){
            EasyToast.show('请先创建钱包');
            return;
        }

        if(this.state.sellRamBytes == ""){
            EasyToast.show('请输入出售内存kb数量');
            return;
        }
        var tmp;
        try {
            tmp = parseFloat(this.state.sellRamBytes);
        } catch (error) {
            tmp = 0;
        }
        if(tmp <= 0){
            this.setState({ sellRamBytes: "" })
            EasyToast.show('请输入出售内存kb数量');
            return;
        }

        this. dismissKeyboardClick();
            const view =
            <View style={styles.passoutsource}>
                <TextInput autoFocus={true} onChangeText={(password) => this.setState({ password })} returnKeyType="go" 
                    selectionColor={UColor.tintColor} secureTextEntry={true}  keyboardType="ascii-capable" style={styles.inptpass} maxLength={Constants.PWD_MAX_LENGTH}
                    placeholderTextColor={UColor.arrow} placeholder="请输入密码" underlineColorAndroid="transparent" />
                <Text style={styles.inptpasstext}></Text>  
            </View>
    
            EasyDialog.show("请输入密码", view, "确认", "取消", () => {
    
            if (this.state.password == "" || this.state.password.length < Constants.PWD_MIN_LENGTH) {
                EasyToast.show('密码长度至少4位,请重输');
                return;
            }

            var privateKey = this.props.defaultWallet.activePrivate;
            try {
                var bytes_privateKey = CryptoJS.AES.decrypt(privateKey, this.state.password + this.props.defaultWallet.salt);
                var plaintext_privateKey = bytes_privateKey.toString(CryptoJS.enc.Utf8);
                if (plaintext_privateKey.indexOf('eostoken') != -1) {
                    plaintext_privateKey = plaintext_privateKey.substr(8, plaintext_privateKey.length);
                    // alert("plaintext_privateKey "+plaintext_privateKey);
                    EasyLoading.show();
                    // alert("receiver: "+this.props.defaultWallet.account+" " + "sellBytes: " + this.state.sellRamBytes);
                    Eos.sellram(plaintext_privateKey, this.props.defaultWallet.account, this.state.sellRamBytes * 1024, (r) => {
                        EasyLoading.dismis();
                        if(r.isSuccess){
                            this.getAccountInfo();
                            EasyToast.show("出售成功");
                        }else{
                            // var errmsg = "抵押失败: ";
                            // if(r.data){
                            //     if(r.data.msg){
                            //         errmsg += r.data.msg;
                            //     }
                            // }
                            // EasyToast.show(errmsg);
                            this._setModalVisible();
                        }
                    });
                    
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
    };

    dismissKeyboardClick() {
        dismissKeyboard();
    }

    render() {
        return (
            <View style={styles.container}> 
                    

                <KeyboardAvoidingView behavior={Platform.OS == 'ios' ? "position" : null}>
                    <ScrollView keyboardShouldPersistTaps="always">
                        <TouchableOpacity activeOpacity={1.0} onPress={this.dismissKeyboardClick.bind(this)}>
                            <ImageBackground  style={styles.headbj} source={UImage.resources_bj} resizeMode="stretch">
                                <View style={styles.frameoutsource}>
                                    <View style={styles.frame}>
                                        <Text style={styles.number}>{this.state.used}</Text>
                                        <Text style={styles.state}>已用(KB)</Text>
                                    </View>
                                    <View style={styles.frame}>
                                        <Text style={styles.number}>{this.state.available}</Text>
                                        <Text style={styles.state}>可用(KB)</Text>
                                    </View>
                                </View> 
                                <View style={styles.headoutsource}>
                                    <Text style={styles.headText}>内存资源，可以使用EOS买入，也可以卖出获得EOS</Text>
                                </View> 
                            </ImageBackground>  
                            <View style={styles.tablayout}>  
                                {this._getButton(styles.buttontab, this.state.isBuyOneself, 'isBuyOneself', '购买')}  
                                {this._getButton(styles.buttontab, this.state.isBuyForOther, 'isBuyForOther', '赠人')}  
                            </View>  
                            <Text style={styles.showytext}>账户余额：{this.state.balance} EOS</Text>
                            {this.state.isBuyOneself ? null:
                            <View style={styles.inptoutsource}>
                                <Text style={styles.inptTitle}>注：只限EOS账号，一旦送出可能无法收回！</Text>
                                <View style={styles.outsource}>
                                    <TextInput ref={(ref) => this._rrpass = ref} value={this.state.receiver}  returnKeyType="go" 
                                    selectionColor={UColor.tintColor} style={styles.inpt}  placeholderTextColor={UColor.arrow} 
                                    placeholder="输入接收账号" underlineColorAndroid="transparent" keyboardType="default" maxLength = {12}
                                    onChangeText={(receiver) => this.setState({ receiver: this.chkAccount(receiver) })}
                                    />
                                    <Button >
                                        <View style={styles.botnimg}>
                                            <Image source={UImage.al} style={{width: 26, height: 26, }} />
                                        </View>
                                    </Button> 
                                </View>
                            </View>
                            }
                            <View style={styles.inptoutsource}>
                                <Text style={styles.inptTitle}>购买内存（EOS）</Text>
                                <View style={styles.outsource}>
                                    <TextInput ref={(ref) => this._rrpass = ref} value={this.state.buyRamAmount} returnKeyType="go" 
                                    selectionColor={UColor.tintColor} style={styles.inpt}  placeholderTextColor={UColor.arrow} 
                                    placeholder="输入购买的额度" underlineColorAndroid="transparent" keyboardType="numeric"  maxLength = {15}
                                    onChangeText={(buyRamAmount) => this.setState({ buyRamAmount: this.chkPrice(buyRamAmount)})}
                                    />
                                    <Button onPress={this.buyram.bind()}>
                                        <View style={styles.botn}>
                                            <Text style={styles.botText}>购买</Text>
                                        </View>
                                    </Button> 
                                </View>
                            </View>
                            {this.state.isBuyForOther ? null:<View style={styles.inptoutsource}>
                                <Text style={styles.inptTitle}>出售内存（KB）</Text>
                                <View style={styles.outsource}>
                                    <TextInput ref={(ref) => this._rrpass = ref} value={this.state.sellRamBytes} returnKeyType="go" 
                                    selectionColor={UColor.tintColor} style={styles.inpt}  placeholderTextColor={UColor.arrow}
                                    placeholder="输入出售的数量" underlineColorAndroid="transparent" keyboardType="numeric"  maxLength = {15}
                                    onChangeText={(sellRamBytes) => this.setState({ sellRamBytes: this.chkPrice(sellRamBytes)})}
                                    />
                                    <Button onPress={this.sellram.bind()}>
                                        <View style={styles.botn}>
                                            <Text style={styles.botText}>出售</Text>
                                        </View>
                                    </Button> 
                                </View>
                            </View>}
                            <View style={styles.basc}>
                                <Text style={styles.basctext}>提示</Text>
                                <Text style={styles.basctext}>1.购买资源内存，您将获得更多权限的使用；</Text>
                                <Text style={styles.basctext}>2.购买和出售资源成功，主网将收取0.5%手续费用；</Text>
                                <Text style={styles.basctext}>3.购买后如过多闲置可进行出售；</Text>
                            </View>
                        </TouchableOpacity>
                    </ScrollView> 
                </KeyboardAvoidingView>  
                <View style={styles.pupuo}>
                    <Modal animationType='slide' transparent={true} visible={this.state.show} onShow={() => { }} onRequestClose={() => { }} >
                    <View style={styles.modalStyle}>
                        <View style={styles.subView} >
                        <Button style={{ alignItems: 'flex-end', }} onPress={this._setModalVisible.bind(this)}>
                            <Text style={styles.closeText}>×</Text>
                        </Button>
                        <Text style={styles.titleText}>资源受限</Text>
                        <View style={styles.contentText}>
                            <Text style={styles.textContent}>抱歉,该账号资源(NET/CPU)不足以支持本次操作,请设置小的额度尝试或联系身边的朋友帮您抵押。</Text>
                        </View>
                        <Button onPress={() => { this._setModalVisible() }}>
                            <View style={styles.buttonView}>
                            <Text style={styles.buttonText}>知道了</Text>
                            </View>
                        </Button>
                        </View>
                    </View>
                    </Modal>
                </View>
            </View>
        );
    }
};


const styles = StyleSheet.create({
    passoutsource: {
        flexDirection: 'column', 
        alignItems: 'center'
    },
    inptpass: {
        color: UColor.tintColor,
        height: 45,
        width: ScreenWidth-100,
        paddingBottom: 5,
        fontSize: 16,
        backgroundColor: UColor.fontColor,
        borderBottomColor: UColor.baseline,
        borderBottomWidth: 1,
    },
    inptpasstext: {
        fontSize: 14,
        color: '#808080',
        lineHeight: 25,
        marginTop: 5,
    },

    container: {
        flex: 1,
        flexDirection:'column',
        backgroundColor: UColor.secdColor,
      },
  
      headbj: {
          justifyContent: "center", 
          alignItems: 'center',
          flexDirection:'column', 
          height: 140,
      },
  
      frameoutsource: {
          justifyContent: "center", 
          alignItems: 'center', 
          flexDirection:'row', 
          flex: 1, 
          paddingTop: 15,
      },
  
      frame: {
          flex: 1,
          flexDirection: 'column', 
          justifyContent: "center",
      },
  
      number: {
          flex: 2, 
          fontSize: 24, 
          color: UColor.fontColor, 
          textAlign: 'center',  
      },
  
      state: {
          flex: 1, 
          fontSize: 12, 
          color: UColor.fontColor, 
          textAlign: 'center',     
      },
      headoutsource: {
          justifyContent: "center", 
          alignItems: 'center', 
          flexDirection:'row', 
          paddingTop: 5,
      },
  
      headText: {
          color: '#7787A3', 
          fontSize: 12, 
          lineHeight: 60,
      },
  
      tablayout: {   
          flexDirection: 'row',  
          borderBottomColor: UColor.mainColor,
          borderBottomWidth: 1,
          paddingHorizontal: 10,
          paddingTop: 10,
          paddingBottom: 5,
      },  
  
      buttontab: {  
          margin: 5,
          width: 100,
          height: 33,
          borderRadius: 15,
          alignItems: 'center',   
          justifyContent: 'center', 
      },  
  
      tabText: {  
         fontSize: 15,
      }, 

      showytext: {
        lineHeight: 40, 
        paddingRight: 20, 
        textAlign: 'right', 
        color: UColor.showy,
      },

      inptoutsource: {
          paddingHorizontal: 20,
          paddingBottom: 20,
          justifyContent: 'center',
      },
      outsource: {
          flexDirection: 'row',  
          alignItems: 'center',
      },
      inpt: {
          flex: 1, 
          color: UColor.arrow, 
          fontSize: 15, 
          height: 40, 
          paddingLeft: 10, 
          backgroundColor: UColor.fontColor, 
          borderRadius: 5,
      },
      inptTitlered: {
          fontSize: 12, 
          color: '#FF6565', 
          lineHeight: 35,
      },
      inptTitle: {
          fontSize: 14, 
          color: '#7787A3', 
          lineHeight: 35,
      },
      botnimg: {
          marginLeft: 10, 
          width: 86, 
          height: 38, 
          justifyContent: 'center', 
          alignItems: 'flex-start'
      },
      botn: {
          marginLeft: 10, 
          width: 86, 
          height: 38,  
          borderRadius: 3, 
          backgroundColor: UColor.tintColor, 
          justifyContent: 'center', 
          alignItems: 'center' 
      },
      botText: {
          fontSize: 17, 
          color: UColor.fontColor,
      },
      basc: {
          padding: 20,
      },
      basctext :{
          fontSize: 12, 
          color: UColor.arrow, 
          lineHeight: 25,
      },
      pupuo: {
          backgroundColor: '#ECECF0',
        },
        // modal的样式  
        modalStyle: {
          backgroundColor: UColor.mask,
          alignItems: 'center',
          justifyContent: 'center',
          flex: 1,
        },
        // modal上子View的样式  
        subView: {
          marginLeft: 10,
          marginRight: 10,
          backgroundColor:  UColor.fontColor,
          alignSelf: 'stretch',
          justifyContent: 'center',
          borderRadius: 10,
          borderWidth: 0.5,
          borderColor: UColor.baseline,
        },
        closeText: {
          width: 30,
          height: 30,
          marginBottom: 0,
          color: '#CBCBCB',
          fontSize: 28,
        },
         // 标题  
      titleText: {
          color: '#000000',
          marginBottom: 5,
          fontSize: 18,
          fontWeight: 'bold',
          textAlign: 'center',
      },
      // 内容  
    contentText: {
      margin: 20,
      alignItems: 'center',
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: "row",
    },
    textContent: {
      color: '#999999',
      fontSize: 14,
      textAlign: 'left',
      lineHeight: 25,
    },
    // 按钮  
    buttonView: {
      margin: 10,
      height: 46,
      borderRadius: 6,
      backgroundColor:  UColor.showy,
      justifyContent: 'center',
      alignItems: 'center'
      },
      buttonText: {
      fontSize: 16,
      color:  UColor.fontColor,
      }
});

export default Memory;
