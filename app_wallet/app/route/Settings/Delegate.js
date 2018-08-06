import React from 'react';
import { connect } from 'react-redux'
import {Dimensions,DeviceEventEmitter,InteractionManager,ListView,StyleSheet,View,RefreshControl,Text,ScrollView,Image,Platform,StatusBar, Modal,TextInput,TouchableOpacity,KeyboardAvoidingView} from 'react-native';
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
const maxWidth = Dimensions.get('window').width;
var AES = require("crypto-js/aes");
var CryptoJS = require("crypto-js");
var dismissKeyboard = require('dismissKeyboard');
@connect(({wallet, vote}) => ({...wallet, ...vote}))
class Nodevoting extends BaseComponent {

    static navigationOptions = ({ navigation }) => {
    
        const params = navigation.state.params || {};
       
        return {    
          title: "投票锁仓",
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
            isAllSelected: true,  
            isNotDealSelected: false,  
            delegatebw: "",
            cpu: '',
            net: '', 
            delegate_net: "0",
            delegate_cpu: '0',
            undelegate_net: '0',
            undelegate_cpu: '0',
            balance: '0',
        };
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

    componentDidMount() {
        EasyLoading.show();
        this.props.dispatch({
            type: 'wallet/getDefaultWallet', callback: (data) => {
                this.props.dispatch({ type: 'vote/getaccountinfo', payload: { page:1,username: data.defaultWallet.account},callback: (data) => {
                    // alert("----------" + JSON.stringify(data));
                    this.setState({
                        delegate_net:data.total_resources.net_weight.replace("EOS", ""),
                        delegate_cpu:data.total_resources.cpu_weight.replace("EOS", ""),
                    });
                } });

                this.props.dispatch({ type: 'vote/getundelegatebwInfo', payload: { page:1,username: data.defaultWallet.account},callback: (data) => {
                    // alert("getundelegatebwInfo1: " + (data.rows.length));
                    if(data.rows.length > 0){
                        this.setState({
                            undelegate_net:data.rows[0].net_amount.replace("EOS", ""),
                            undelegate_cpu:data.rows[0].cpu_amount.replace("EOS", ""),
                        });
                    }
                    EasyLoading.dismis();
                } });

            }
        });

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

    getBalance() { 
        if (this.props.defaultWallet != null && this.props.defaultWallet.name != null) {
          this.props.dispatch({
            type: 'wallet/getBalance', payload: { contract: "eosio.token", account: this.props.defaultWallet.name, symbol: 'EOS' }, callback: (data) => {
                this.setEosBalance(data);
            }
          })
        } else {
          this.setState({ balance: '0'})
          // this.props.defaultWallet.name = 'xxxx';
          //   EasyDialog.show("温馨提示", "您还没有创建钱包", "创建一个", "取消", () => {
          //   this.createWallet();
          //   EasyDialog.dismis()
          // }, () => { EasyDialog.dismis() });
        }
      }

    // 抵押
    delegatebw = () => {
        if ((this.state.delegatebw == "")) {
            EasyToast.show('请输入抵押的EOS数量');
            return;
        }

        this.state.cpu = this.state.delegatebw/2;
        this.state.net = this.state.delegatebw/2;
        this.state.cpu += " EOS";
        this.state.net += " EOS";

        // alert("this.state.invite" + this.state.invite);
        // if(this.state.invite > this.props.navigation.state.params.balance) {
           
        //         EasyToast.show('输入抵押的EOS数量不能大于EOS余额');
           
        //     return;
        // }


        const view =
        <View style={styles.passoutsource}>
            <TextInput autoFocus={true} onChangeText={(password) => this.setState({ password })} returnKeyType="go" 
               selectionColor={UColor.tintColor} secureTextEntry={true} keyboardType="ascii-capable" style={styles.inptpass} maxLength={Constants.PWD_MAX_LENGTH}
                placeholderTextColor={UColor.arrow} placeholder="请输入密码" underlineColorAndroid="transparent" />
                <Text style={styles.inptpasstext}>提示：抵押 {this.state.delegatebw} EOS</Text>
        </View>

        EasyDialog.show("请输入密码", view, "确认", "取消", () => {

        if (this.state.password == "" || this.state.password.length < Constants.PWD_MIN_LENGTH) {
            EasyToast.show('密码长度至少4位,请重输');
            return;
        }
        // if(Platform.OS == 'android' ){
        //     EasyLoading.show();
        // }

        var privateKey = this.props.defaultWallet.activePrivate;
        try {
            var bytes_privateKey = CryptoJS.AES.decrypt(privateKey, this.state.password + this.props.defaultWallet.salt);
            var plaintext_privateKey = bytes_privateKey.toString(CryptoJS.enc.Utf8);
            if (plaintext_privateKey.indexOf('eostoken') != -1) {
                plaintext_privateKey = plaintext_privateKey.substr(8, plaintext_privateKey.length);
                EasyLoading.show();
                // 抵押
                Eos.transaction({
                    actions:[
                        {
                            account: 'eosio',
                            name: 'delegatebw',
                            authorization: [{
                                actor: this.props.defaultWallet.account,
                                permission: 'active'
                            }],
                            data:{
                                from: this.props.defaultWallet.account,
                                receiver: this.props.defaultWallet.account,
                                stake_net_quantity: this.state.net,
                                stake_cpu_quantity: this.state.cpu,
                                transfer: 0
                            }
                        }
                    ]
                }, plaintext_privateKey, (r) => {
                    EasyLoading.dismis();
                    if(r.data && r.data.transaction_id){
                        EasyToast.show("抵押成功");
                    }else if(r.data && JSON.parse(r.data).code != 0){
                        var jdata = JSON.parse(r.data);
                        var errmsg = "抵押失败: "+ JSON.stringify(jdata);
                        alert(errmsg);
                    }

                    // alert(JSON.parse(r.data).code);
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
    }

    undelegatebw = () => { 
        if ((this.state.delegatebw == "")) {
            EasyToast.show('请输入赎回的EOS数量');
            return;
        }

        this.state.cpu = this.state.delegatebw/2;
        this.state.net = this.state.delegatebw/2;
        this.state.cpu += " EOS";
        this.state.net += " EOS";

            const view =
            <View style={styles.passoutsource}>
                <TextInput autoFocus={true} onChangeText={(password) => this.setState({ password })} returnKeyType="go" 
                selectionColor={UColor.tintColor} secureTextEntry={true} keyboardType="ascii-capable" style={styles.inptpass} maxLength={Constants.PWD_MAX_LENGTH}
                placeholderTextColor={UColor.arrow} placeholder="请输入密码" underlineColorAndroid="transparent" />
                <Text style={styles.inptpasstext}>提示：赎回 {this.state.delegatebw} EOS</Text>
            </View>
    
            EasyDialog.show("请输入密码", view, "确认", "取消", () => {
    
            if (this.state.password == "" || this.state.password.length < Constants.PWD_MIN_LENGTH) {
                EasyToast.show('密码长度至少4位,请重输');
                return;
            }
            // if(Platform.OS == 'android' ){
            //     EasyLoading.show();
            // }

            var privateKey = this.props.defaultWallet.activePrivate;
            try {
                var bytes_privateKey = CryptoJS.AES.decrypt(privateKey, this.state.password + this.props.defaultWallet.salt);
                var plaintext_privateKey = bytes_privateKey.toString(CryptoJS.enc.Utf8);
                if (plaintext_privateKey.indexOf('eostoken') != -1) {
                    plaintext_privateKey = plaintext_privateKey.substr(8, plaintext_privateKey.length);
                    // alert("plaintext_privateKey "+plaintext_privateKey);
                    EasyLoading.show();
                    // 解除抵押
                    Eos.transaction({
                        actions:[
                            {
                                account: 'eosio',
                                name: 'undelegatebw',
                                authorization: [{
                                    actor: this.props.defaultWallet.account,
                                    permission: 'active'
                                }],
                                data:{
                                    from: this.props.defaultWallet.account,
                                    receiver: this.props.defaultWallet.account,
                                    unstake_net_quantity: this.state.net,
                                    unstake_cpu_quantity: this.state.cpu,
                                }
                            }
                        ]
                    }, plaintext_privateKey, (r) => {
                        EasyLoading.dismis();
                        if(r.data && r.data.transaction_id){
                            EasyToast.show("解除抵押成功");
                        }else if(r.data && JSON.parse(r.data).code != 0){
                            var jdata = JSON.parse(r.data);
                            var errmsg = "解除抵押失败: "+ JSON.stringify(jdata);
                            alert(errmsg);
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
        let BTN_SELECTED_STATE_ARRAY = ['isAllSelected', 'isNotDealSelected'];  
        return(  
            <View style={[style, selectedSate ? {backgroundColor: UColor.tintColor} : {backgroundColor: UColor.mainColor}]}>  
                <Text style={[styles.tabText, selectedSate ? {color: UColor.fontColor} : {color: '#7787A3'}]}  onPress={ () => {this._updateBtnSelectedState(stateType, BTN_SELECTED_STATE_ARRAY)}}>  
                    {buttonTitle}  
                </Text>  
            </View>  
        );  
    }  

    dismissKeyboardClick() {
        dismissKeyboard();
    }

    render() {
        // balance = balance.replace("EOS", "");

        return (
            <View style={styles.container}> 
                    

                <KeyboardAvoidingView behavior={Platform.OS == 'ios' ? "position" : null}>
                    <ScrollView keyboardShouldPersistTaps="always">
                        <TouchableOpacity activeOpacity={1.0} onPress={this.dismissKeyboardClick.bind(this)}>
                            <View style={styles.outsource}>
                                <View style={{}}>
                                    <View style={styles.frame}>
                                        <Text style={styles.number}>{this.state.balance}</Text>
                                        <Text style={styles.state}>余额</Text>
                                    </View>
                                    <View style={styles.frame}>
                                        <Text style={styles.number}>{parseFloat(this.state.delegate_cpu) + parseFloat(this.state.delegate_net)}</Text>
                                        <Text style={styles.state}>投票锁仓</Text>
                                    </View>
                                    <View style={styles.frame}>
                                        <Text style={styles.number}>{parseFloat(this.state.undelegate_cpu) + parseFloat(this.state.undelegate_net)}</Text>
                                        <Text style={styles.state}>赎回中</Text>
                                    </View>
                                </View> 
                                <View style={styles.tablayout}>  
                                    {this._getButton(styles.buttontab, this.state.isAllSelected, 'isAllSelected', '投票锁仓')}  
                                    {this._getButton(styles.buttontab, this.state.isNotDealSelected, 'isNotDealSelected', 'EOS赎回')}  
                                </View>  
                                <View style={styles.inpoutsource}>
                                    <Text style={styles.inptext}>{this.state.isAllSelected ? '投票锁仓':'EOS赎回'}</Text>
                                    <View style={styles.inptoutsource}>
                                        <TextInput ref={(ref) => this._rrpass = ref} value={this.state.delegatebw} returnKeyType="go" 
                                        selectionColor={UColor.tintColor} style={styles.inpt} placeholderTextColor={UColor.arrow} 
                                        placeholder="输入数量" underlineColorAndroid="transparent" keyboardType="phone-pad" 
                                        onChangeText={(delegatebw) => this.setState({ delegatebw })}
                                        />
                                        {/* <Text style={{ fontSize: 15, color: UColor.tintColor, width: 50, textAlign: 'center'}}>全部</Text> */}
                                    </View>
                                </View>
                                <Text style={styles.prompttext}>{this.state.isNotDealSelected ? '提示：解锁已经投票EOS可能会影响您的投票结果，一般投票三天后解锁不影响投票':'提示：在投票前必须将EOS划转至投票锁仓中，否则 无法进行投票。'}</Text>
                            </View>
                            <Button onPress={this.state.isAllSelected ? this.delegatebw.bind(): this.undelegatebw.bind()}>
                                <View style={styles.btnoutsource}>
                                    <Text style={styles.btntext}>{this.state.isAllSelected ? '确定抵押':'确认赎回'}</Text>
                                </View>
                            </Button>   
                        </TouchableOpacity>
                    </ScrollView>   
                </KeyboardAvoidingView>  
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
        width: maxWidth-100,
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
      paddingBottom: 40,
    },

    frame: {
        height:50, 
        flexDirection: 'row', 
        alignItems: 'center', 
        borderBottomColor: UColor.mainColor, 
        borderBottomWidth: 1,
    },

    number: {
        flex: 2, 
        fontSize: 20, 
        color: UColor.fontColor, 
        textAlign: 'left', 
        paddingLeft: 8,
    },

    state: {
        flex: 1, 
        fontSize: 14, 
        color: '#7787A3', 
        textAlign: 'right', 
        paddingRight: 5,
    },

    tablayout: {   
        flexDirection: 'row',  
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

    outsource: {
        paddingHorizontal: 15,
    },

    showoutsource: {
        paddingVertical: 10,
    },

    inpoutsource: {
        paddingLeft: 20,
        paddingRight: 20,
        paddingTop: 40,
        paddingBottom: 60,
        justifyContent: 'center',
    },
    inptext: {
        fontSize: 14,
        color: '#7787A3',
        lineHeight: 30,
    },

    inptoutsource: {
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

    prompttext: {
        fontSize: 14,
        color:  UColor.arrow,
        lineHeight: 25,
    },

    btnoutsource: {
        margin: 10, 
        height: 45,  
        borderRadius: 6, 
        backgroundColor: UColor.tintColor, 
        justifyContent: 'center', 
        alignItems: 'center' 
    },
    btntext: {
        fontSize: 16,
        color: UColor.fontColor
    }
    
});

export default Nodevoting;
