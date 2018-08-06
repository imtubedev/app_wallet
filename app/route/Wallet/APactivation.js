import React from 'react';
import { connect } from 'react-redux'
import { Dimensions, DeviceEventEmitter, InteractionManager, ListView, StyleSheet, Clipboard, View, RefreshControl, Text, ScrollView, Image, Platform, StatusBar, TextInput, TouchableOpacity,TouchableHighlight,KeyboardAvoidingView,Modal } from 'react-native';
import UColor from '../../utils/Colors'
import Button from '../../components/Button'
import Item from '../../components/Item'
import Icon from 'react-native-vector-icons/Ionicons'
import UImage from '../../utils/Img'
import AnalyticsUtil from '../../utils/AnalyticsUtil';
import { EasyLoading } from '../../components/Loading';
import { EasyDialog } from "../../components/Dialog";
import { EasyToast } from '../../components/Toast';
import { Eos } from "react-native-eosjs";
import { english } from '../../utils/english';
import BaseComponent from "../../components/BaseComponent";
import Constants from '../../utils/Constants'
var AES = require("crypto-js/aes");
var CryptoJS = require("crypto-js");
var dismissKeyboard = require('dismissKeyboard');
const maxWidth = Dimensions.get('window').width;
const maxHeight = Dimensions.get('window').height;

@connect(({ wallet }) => ({ ...wallet }))
class APactivation extends BaseComponent {

  static navigationOptions = {
    title: '账号支付激活',
    headerStyle:{
        paddingTop:Platform.OS == 'ios' ? 30 : 20,
        backgroundColor: UColor.mainColor,
        borderBottomWidth:0,
    }    
  };

  constructor(props) {
    super(props);
    this.state = {
      accountName: "",
      ownerPuk: "",
      activePuk: "",
      cpu:"0.5",
      net:"0.5",
      ram:"1.5",
      isComplete: false,
      hasErrorInput: false,
      show: false,
    }
  }

  componentDidMount() {
    var accountInfo = this.props.navigation.state.params.accountInfo;
    this.setState({
      cpu: accountInfo.cpu ? accountInfo.cpu : "0.5",
      net: accountInfo.net ? accountInfo.net : "0.5",
      ram: accountInfo.ram ? accountInfo.ram : "1.5",
      accountName: accountInfo.account ? accountInfo.account : "" ,
      ownerPuk: accountInfo.owner ? accountInfo.owner : "",
      activePuk: accountInfo.active ? accountInfo.active : "",
    });
  }
  componentWillUnmount(){
    //结束页面前，资源释放操作
    super.componentWillUnmount();
    
  }

  check(){

  }
  
  confirm(){
    // this.setState({isComplete: true});
    this._setModalVisible();
    //
  }

  onShareFriend() {
    DeviceEventEmitter.emit('ReturnActivation','{"account_name":"' + this.state.accountName + '","owner":"' + this.state.ownerPuk + '","active":"' + this.state.ownerPuk + '","cpu":"' + this.state.cpu + '","net":"' + this.state.net + '","ram":"'+ this.state.ram +'"}');
  }

  createAccount() {
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
                EasyDialog.dismis();
                EasyLoading.show();
                plaintext_privateKey = plaintext_privateKey.substr(8, plaintext_privateKey.length);
                Eos.createAndDelegateAccount(this.props.defaultWallet.account, plaintext_privateKey, this.state.accountName, this.state.ownerPuk, this.state.activePuk,
                this.state.cpu + " EOS", this.state.net + " EOS", this.state.ram + " EOS", 1, (r)=>{
                  EasyLoading.dismis();
                  if(r.isSuccess){
                    //   EasyToast.show("创建账号成功");
                    EasyDialog.show("支付成功", (<View>
                        <Text style={styles.Becarefultext}>{this.state.accountName}</Text>
                        <Text style={styles.inptpasstext}>该账号完成支付，请告知账号主人点击激活即可正常使用。</Text>
                        <View style={styles.linkout}>
                            <Text style={styles.linktext} onPress={() => this.onShareFriend()}>分享给你的朋友</Text>
                        </View>
                    </View>), "知道了", null,  () => { EasyDialog.dismis() });
                  }else{
                      if(r.data){
                          if(r.data.msg){
                              EasyToast.show(r.data.msg);
                          }else{
                              EasyToast.show("创建账号失败");
                          }
                      }else{
                          EasyToast.show("创建账号失败");
                      }
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
  }
   // 显示/隐藏 modal  
   _setModalVisible() {
    let isShow = this.state.show;
    // if(!isShow){
    //   this.setState({isComplete: false});
    // }
    this.setState({
        show: !isShow,
    });
  }

  dismissKeyboardClick() {
    dismissKeyboard();
  }

  render() {
    return <View style={styles.container}>
            

    <ScrollView  keyboardShouldPersistTaps="always">
      <TouchableOpacity activeOpacity={1.0} onPress={this.dismissKeyboardClick.bind(this)}>
        <KeyboardAvoidingView behavior={Platform.OS == 'ios' ? "position" : null}>
          <View style={styles.significantout}>
            <Text style={styles.significanttext} >{this.state.accountName}</Text>
            <Text style={styles.nametext} >EOS 账号</Text>
          </View>
          {!this.state.show?<View style={styles.outsource}>
            <Text style={{fontSize: 14, color: UColor.arrow, textAlign: 'right', marginHorizontal: 20, marginTop: 5,}}>账号资源配置</Text>
            <View style={styles.inptout} >
                <View style={styles.rankout}>
                    <Text style={styles.inptitle}>CPU抵押(EOS)</Text>
                    {this.state.hasErrorInput && <Text style={styles.falsehints}>*该内容输入有误！</Text>}
                </View>
                <View style={styles.rankout}>
                    <TextInput ref={(ref) => this._raccount = ref} value={this.state.cpu} returnKeyType="next" 
                        selectionColor={UColor.tintColor} style={styles.inpt} placeholderTextColor={UColor.arrow} 
                        placeholder="最低可输入0.1" underlineColorAndroid="transparent" onChange={this.check()} 
                        keyboardType="default" maxLength={12} onChangeText={(cpu) => this.setState({ cpu })} 
                    />
                    <Text style={styles.company}>EOS</Text>
                </View>    
            </View>
            <View style={styles.inptout} >
                <View style={styles.rankout}>
                    <Text style={styles.inptitle}>网络抵押(EOS)</Text>
                    {this.state.hasErrorInput && <Text style={styles.falsehints}>*该内容输入有误！</Text>}
                </View>
                <View style={styles.rankout}>
                    <TextInput ref={(ref) => this._raccount = ref} value={this.state.net} returnKeyType="next" 
                        selectionColor={UColor.tintColor} style={styles.inpt} placeholderTextColor={UColor.arrow} 
                        placeholder="最低可输入0.1" underlineColorAndroid="transparent" onChange={this.check()} 
                        keyboardType="default" maxLength={12} onChangeText={(net) => this.setState({ net })} 
                    />
                    <Text style={styles.company}>EOS</Text>
                </View>    
            </View>
            <View style={styles.inptout} >
                <View style={styles.rankout}>
                    <Text style={styles.inptitle}>分配内存(EOS)</Text>
                    {this.state.hasErrorInput && <Text style={styles.falsehints}>*该内容输入有误！</Text>}
                </View>
                <View style={styles.rankout}>
                    <TextInput ref={(ref) => this._raccount = ref} value={this.state.ram} returnKeyType="next" 
                        selectionColor={UColor.tintColor} style={styles.inpt} placeholderTextColor={UColor.arrow} 
                        placeholder="最低可输入0.397" underlineColorAndroid="transparent" onChange={this.check()} 
                        keyboardType="default" maxLength={12} onChangeText={(ram) => this.setState({ ram })} 
                    />
                    <Text style={styles.company}>EOS</Text>
                </View>    
            </View>
          </View>
          :
          <View style={styles.outsource}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 5,}}>
                    <View style={{flex: 1, height: 2, backgroundColor: UColor.mainColor,}}/>
                    <Text style={{ color: UColor.arrow, fontSize: 16,}} > (账号资源概况) </Text>
                    <View style={{flex: 1, height: 2, backgroundColor: UColor.mainColor,}}/>
                </View>
                <View style={{ flexDirection: 'row',}}>
                    <View  style={{ flex: 1,  alignItems: 'center',}}>
                        <Text style={{fontSize: 14, color: UColor.tintColor, lineHeight: 30, }}>{this.state.ram}</Text>
                        <Text style={{fontSize: 15, color: UColor.fontColor, paddingBottom: 10,}}>分配内存( EOS )</Text>
                        <Text style={{fontSize: 14, color: UColor.tintColor, lineHeight: 30,}}>{this.state.net}</Text>
                        <Text style={{fontSize: 15, color: UColor.fontColor, paddingBottom: 10,}}>网络抵押( EOS )</Text>
                    </View>
                    <View style={{ flex: 1,  alignItems: 'center',}}>
                        <Text style={{fontSize: 14, color: UColor.tintColor, lineHeight: 30,}}>{this.state.cpu}</Text>
                        <Text style={{fontSize: 15, color: UColor.fontColor, paddingBottom: 10,}}>CPU抵押( EOS )</Text>
                    </View>
                    
                </View>
          </View>}


          <View style={styles.inptoutbg}>
            <View style={styles.inptoutgo} >
                <Text style={styles.inptitle}>owner公钥</Text>
                <Text style={styles.inptext}>{this.state.ownerPuk}</Text>
            </View>
            <View style={{height: 1, backgroundColor: UColor.secdColor,}}/>
            <View style={styles.inptoutgo} >
                <Text style={styles.inptitle}>active公钥</Text>
                <Text style={styles.inptext}>{this.state.activePuk}</Text>
            </View>
            {!this.state.show?<Text style={styles.readtext} >说明：账号资源可输入设置</Text> : <Text style={styles.readtext}></Text>}
            <Button onPress={() => this.confirm()}>
                <View style={styles.createWalletout}>
                    <Text style={styles.createWallet}>确认支付</Text>
                </View>
            </Button>
          </View>

          <View style={styles.pupuo}>
            <Modal animationType={'slide'} transparent={true} visible={this.state.show} onShow={() => { }} onRequestClose={() => { }} >
                <TouchableOpacity style={{ flex: 1, justifyContent: 'flex-end', alignItems: 'center', }} activeOpacity={1.0}>
                <View style={{ width: maxWidth,  height: maxHeight*1/2,  backgroundColor: UColor.fontColor,}}>
                        <View style={{flexDirection: "row",padding: 15,justifyContent: "center",}}>
                            <Text style={{flex: 1,paddingVertical: 5,marginLeft: 135,fontSize: 18,fontWeight: 'bold',color:'#4d4d4d'}}>订单详情</Text>
                            <Button  onPress={this._setModalVisible.bind(this)}>
                                <Text style={styles.buttontext}>×</Text>
                            </Button>
                        </View>
                        <View style={styles.separationline} >
                            <View style={{flexDirection: "row",padding: 15,justifyContent: "center",}}>
                                <Text style={{fontSize: 26,paddingVertical: 15, lineHeight: 10,color:'#000000',textAlign: 'center',}}>{parseFloat(this.state.cpu)+parseFloat(this.state.ram)+parseFloat(this.state.net)} </Text>
                                <Text style={{fontSize: 13,paddingVertical: 10, lineHeight: 10,color:'#000000',textAlign: 'center',}}> EOS</Text>
                            </View>
                        </View>
                        <View style={{flex: 1, paddingLeft: 10, paddingRight:10,paddingHorizontal: 20}}>
                            <View style={styles.separationline} >
                                <View style={styles.rowInfo}>
                                    <Text style={styles.contentText}>购买账号：</Text>
                                    <Text style={styles.contentText}>{this.state.accountName}</Text>
                                </View>
                            </View>
                            <View style={styles.separationline} >
                                <View style={styles.rowInfo}>
                                    <Text style={styles.contentText}>支付账号：</Text>
                                    <Text style={styles.contentText}>{this.props.defaultWallet.account}</Text>
                                </View>
                            </View>
                          
                            <Button onPress={() => { this.createAccount() }}>
                                <View style={styles.btnoutsource}>
                                    <Text style={styles.btntext}>确认</Text>
                                </View>
                            </Button>
                        </View>
                </View>
                </TouchableOpacity>
            </Modal>
          </View>
        </KeyboardAvoidingView>
      </TouchableOpacity>
    </ScrollView>
  </View>
  }
}

const styles = StyleSheet.create({
    inptpasstext: {
        fontSize: 12,
        color: UColor.arrow,
        marginBottom: 15,
        lineHeight: 20,
      },
      Becarefultext: {
         color: UColor.showy,
         fontSize: 12,
      },
      linkout: {
        flexDirection: 'row',
        paddingTop: 20,
        justifyContent: 'flex-end'
      },
      linktext: {
        paddingLeft: 15,
        color: UColor.tintColor,
        fontSize: 14,
      },



    inptoutbg: {
        backgroundColor: UColor.mainColor,
    },
    inptoutgo: {
        paddingVertical: 10,
        paddingHorizontal: 18,
        backgroundColor: UColor.mainColor,
    },
    inptgo: {
        flex: 1,
        paddingHorizontal: 10,
    },
    inptext: {
        fontSize: 14,
        lineHeight: 25,
        color: UColor.arrow,
    },

    readtext: {
        textAlign: 'right',
        fontSize: 13,
        color: UColor.tintColor,
        marginHorizontal: 20,
        marginBottom: 10,
    },





  inptpasstext: {
    fontSize: 12,
    color: UColor.arrow,
    marginBottom: 15,
    lineHeight: 20,
  },
  Becarefultext: {
     color: UColor.showy,
     fontSize: 12,
  },

  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: UColor.mainColor,
  },
  significantout: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: UColor.mainColor,
    borderTopWidth: 10,
    borderTopColor: UColor.secdColor,
  },
  significanttext: {
    color: UColor.fontColor,
    fontSize: 24,
  },
  nametext: {
    color: UColor.arrow,
    fontSize: 16,
  },

  outsource: {
    backgroundColor: UColor.secdColor,
  },

  inptout: {
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: UColor.mainColor,
  },
  rankout: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inptitle: {
    flex: 1,
    fontSize: 15,
    paddingLeft: 5,
    color: UColor.fontColor,
  },
  falsehints: {
    fontSize: 12,
    color: UColor.showy,
    textAlign: 'right',
  },
  inpt: {
    flex: 4,
    color: UColor.arrow,
    fontSize: 15,
    height: 40,
    paddingLeft: 2
  },

  company: {
      textAlign: 'center',
      flex: 1,
     fontSize: 14,
     color: UColor.arrow
  },

  clauseout: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  clauseimg: { 
    width: 20, 
    height: 20,
    marginHorizontal: 10, 
  },
  welcome: {
    fontSize: 14,
    color: UColor.arrow,
  },
  clausetext: {
    fontSize: 14,
    color: UColor.tintColor,
  },
  createWalletout: {
    height: 45,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 50,
    borderRadius: 5,
    backgroundColor: UColor.tintColor
  },
  createWallet: {
    fontSize: 15,
    color: UColor.fontColor
  },
  importWallettext: {
    fontSize: 15,
    color: UColor.tintColor,
    textAlign: 'center'
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
    backgroundColor: UColor.fontColor,
    alignSelf: 'stretch',
    justifyContent: 'center',
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: UColor.baseline,
},
buttonView: {
    alignItems: 'flex-end',
},
buttontext: {
    // width: 30,
    // height: 30,
    // marginTop:1,
    // marginRight: 1,
    // paddingVertical: 12, 
    lineHeight: 25,
    color: '#CBCBCB',
    marginBottom: 0,
    fontSize: 28,
},
// 标题  
titleText: {
    marginBottom: 10,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
},
// 内容  
contentText: {
    marginLeft: 10,
    marginRight: 10,
    lineHeight: 10,
    paddingVertical: 15,
    fontSize: 18,
    textAlign: 'left',
    color: '#4D4D4D',
},

rowInfo: {
    flexDirection: "row",
    padding: 15,
    justifyContent: "space-between",
  },

//转帐信息提示分隔线
separationline: {
    paddingLeft: 10,
    height: 50,
    marginBottom: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: '#e5e5e5',
    justifyContent: 'center',
},

// 按钮  
btnoutsource: {
    margin: 15,
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

});

export default APactivation;