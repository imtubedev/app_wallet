import React from 'react';
import { connect } from 'react-redux'
import { Dimensions, DeviceEventEmitter, InteractionManager, ListView, StyleSheet, Image, View, RefreshControl, Text, Platform, TextInput, ScrollView, TouchableHighlight, Animated,  Easing, TouchableOpacity, Modal  } from 'react-native';
import { TabViewAnimated, TabBar, SceneMap } from 'react-native-tab-view';
import store from 'react-native-simple-store';
import Ionicons from 'react-native-vector-icons/Ionicons'
import UColor from '../../utils/Colors'
import Button from '../../components/Button'
import { formatterNumber, formatterUnit } from '../../utils/FormatUtil'
import { EasyLoading } from '../../components/Loading';
import { EasyToast } from '../../components/Toast';
import { EasyDialog } from '../../components/Dialog';
import { Eos } from "react-native-eosjs";
import UImage from '../../utils/Img';
import BaseComponent from "../../components/BaseComponent";
import Constants from '../../utils/Constants'
const maxWidth = Dimensions.get('window').width;
const maxHeight = Dimensions.get('window').height;
var dismissKeyboard = require('dismissKeyboard');
const pages = [];
let loadMoreTime = 0;
let currentLoadMoreTypeId;
let timer;
let currentTab = 0;
const _index = 0;

@connect(({ wallet }) => ({ ...wallet }))
class ImportEosKey extends BaseComponent {

  static navigationOptions = {
    title: '导入EOS私钥'
  };

  constructor(props) {
    super(props);
    this.state = {
      bounceValue: new Animated.Value(1), 
      rotateValue: new Animated.Value(0),
      index: 0,
      reWalletpwd: '',
      walletpwd: '',
      ownerPk: '',
      activePk: '',
      words_owner: '',
      words_active: '',
      dataSource: new ListView.DataSource({ rowHasChanged: (row1, row2) => row1 !== row2 }),
      routes: [
        // { key: '0', title: '助记词' },
        { key: '2', title: '私钥' },
      ],
      isChecked: this.props.isChecked || true,
      weak: UColor.arrow,
      medium: UColor.arrow,
      strong: UColor.arrow,
      CreateButton:  UColor.mainColor,
      show: false,
      Invalid: false,
      publicKey: '',
      ReturnData: '',
    };
  }
  //组件加载完成
  componentDidMount() {
    const { dispatch } = this.props;

  }


  startAnimation() {
    this.state.bounceValue.setValue(1);
    this.state.rotateValue.setValue(0);
        Animated.timing(this.state.rotateValue, {
            toValue: 1,  //角度从0变1
            duration: 800,  //从0到1的时间
            easing: Easing.linear,//线性变化，匀速旋转
        }).start();
  }

  refresh () {
    this.startAnimation(); 
  }


  componentWillUnmount() {
     //结束页面前，资源释放操作
     super.componentWillUnmount();
    // if (timer) {
    //   clearInterval(timer);
    // }
    DeviceEventEmitter.removeListener('changeTab');
  }

  // startTick(index) {
  //   const { dispatch } = this.props;
  //   InteractionManager.runAfterInteractions(() => {
  //     clearInterval(timer);
  //     timer = setInterval(function () {
  //       dispatch({ type: 'sticker/list', payload: { type: index } });
  //     }, 7000);
  //   });
  // }

  // onRefresh(key) {
  //   this.startTick(this.getRouteIndex(key));
  // }

  //获得typeid坐标
  getRouteIndex(typeId) {
    for (let i = 0; i < this.state.routes.length; i++) {
      if (this.state.routes[i].key == typeId) {
        return i;
      }
    }
  }

  //点击
  onPress = (coins) => {
    // const { navigate } = this.props.navigation;
    // navigate('Coin', { coins });
  };

  //切换tab
  _handleIndexChange = index => {
    // this.startTick(index);
    this.setState({ index });
    _index = index;
  };

  _handleTabItemPress = ({ route }) => {
    const index = this.getRouteIndex(route.key);
    this.setState({ index });
  };
  
  prot(data = {}, key){
    const { navigate } = this.props.navigation;
    if (key == 'clause') {
    navigate('Web', { title: "服务及隐私条款", url: "http://static.eostoken.im/html/reg.html" });
    }else  if (key == 'Memorizingwords') {
    navigate('Web', { title: "什么是助记词", url: "http://static.eostoken.im/html/MemorizingWords.html" });
    }else  if (key == 'privatekey') {
    navigate('Web', { title: "什么是私钥", url: "http://static.eostoken.im/html/Keystore.html" });
    }else  if (key == 'howImportPrivatekey') {
    navigate('Web', { title: "如何导入私钥", url: "http://static.eostoken.im/html/importPrivatekey.html" });
    }


  }

  checkClick() {
    this.setState({
      show: false
    });
  }

  importPriKey() {
    if (this.state.activePk == '') {
      EasyToast.show('请输入私钥');
      return;
    }
    if (this.state.walletpwd == '') {
      EasyToast.show('请输入密码');
      return;
    }
    if (this.state.reWalletpwd == '') {
      EasyToast.show('请输入确认密码');
      return;
    }
    if (this.state.walletpwd.length < 8 && this.state.reWalletpwd.length < 8) {
      EasyToast.show('密码长度至少8位,请重输');
      return;
    }
    if (this.state.walletpwd != this.state.reWalletpwd) {
      EasyToast.show('两次密码不一致');
      return;
    }
    if (this.state.isChecked == false) {
      EasyToast.show('请确认已阅读并同意条款');
      return;
    }
    Eos.checkPrivateKey(this.state.activePk, (r) => {
      if (!r.isSuccess) {
        EasyToast.show('私钥格式不正确');
        return;
      }
      this.createWalletByPrivateKey("", this.state.activePk);
    });
  }



  opendelay(owner_publicKey ,data) {
    var pthis = this;
    this.tm=setTimeout(function(){
      pthis.setState({
        show: true,
        Invalid: false,
        publicKey: '找不到:' + owner_publicKey,
        ReturnData: "对应的账户名" + " " + JSON.stringify(data),
      });
        clearTimeout(pthis.tm);
    },500);
}
  createWalletByPrivateKey(owner_privateKey, active_privatekey){
    EasyLoading.show('正在请求');
    try {
      Eos.privateToPublic(active_privatekey, (r) => {
        var active_publicKey = r.data.publicKey;
        var owner_publicKey = "";//r.data.publicKey;
        var pthis=this;
        this.props.dispatch({
          type: 'wallet/getAccountsByPuk',
          payload: {
            public_key: active_publicKey
          },
          callback: (data) => {
              EasyLoading.dismis();
              if (data == undefined || data.code != '0') {
                pthis.opendelay(active_publicKey, data);
                return;
              }
            var walletList = [];
            var salt;
            Eos.randomPrivateKey((r) => {
              salt = r.data.ownerPrivate.substr(0, 18);
              for (var i = 0; i < data.data.account_names.length; i++) {
                var result = {
                  data: {
                    ownerPublic: '',
                    activePublic: '',
                    ownerPrivate: '',
                    activePrivate: '',
                    words_active: '',
                    words: '',
                  }
                };
                result.data.ownerPublic = owner_publicKey;
                result.data.activePublic = active_publicKey;
                result.data.words = '';
                result.data.words_active = '';
                result.data.ownerPrivate = owner_privateKey;
                result.data.activePrivate = active_privatekey;
                result.password = this.state.walletpwd;
                result.name = data.data.account_names[i];
                result.account = data.data.account_names[i];
                result.isactived = true;
                result.salt = salt;
                walletList[i] = result;
              }
              // 保存钱包信息
              this.props.dispatch({
                type: 'wallet/saveWalletList',
                walletList: walletList,
                callback: (data) => {
                  EasyLoading.dismis();
                  if (data.error != null) {
                    EasyToast.show('导入私钥失败：' + data.error);
                  } else {
                    EasyToast.show('导入私钥成功！');
                    this.props.dispatch({
                      type: 'wallet/updateGuideState',
                      payload: {
                        guide: false
                      }
                    });
                    DeviceEventEmitter.emit('updateDefaultWallet');
                    DeviceEventEmitter.emit('modify_password');
                    this.props.navigation.goBack();

                  }
                }
              });
            });
          }
        });
      });
    } catch (e) {
      EasyLoading.dismis();
      EasyToast.show('privateToPublic err: ' + JSON.stringify(e));
    }
  }

  _onRequestClose() {
    let isShow = this.state.show;
    this.setState({
      show: !isShow,
    });
  }
  _onPressListItem() {
    this.setState((previousState) => {
        return ({
          Invalid: !previousState.Invalid,
        })
    });
  }
  
  intensity() {
    let string = this.state.walletpwd;
    if(string.length >=8) {
      if(/[a-zA-Z]+/.test(string) && /[0-9]+/.test(string) && /\W+\D+/.test(string)) {
        this.state.strong = UColor.tintColor;
        this.state.medium = UColor.arrow;
        this.state.weak = UColor.arrow;
      }else if(/[a-zA-Z]+/.test(string) || /[0-9]+/.test(string) || /\W+\D+/.test(string)) {
        if(/[a-zA-Z]+/.test(string) && /[0-9]+/.test(string)) {
          this.state.strong = UColor.arrow;
          this.state.medium = UColor.tintColor;
          this.state.weak = UColor.arrow;
        }else if(/\[a-zA-Z]+/.test(string) && /\W+\D+/.test(string)) {
          this.state.strong = UColor.arrow;
          this.state.medium = UColor.tintColor;
          this.state.weak = UColor.arrow;
        }else if(/[0-9]+/.test(string) && /\W+\D+/.test(string)) {
          this.state.strong = UColor.arrow;
          this.state.medium = UColor.tintColor;
          this.state.weak = UColor.arrow;
        }else{
          this.state.strong = UColor.arrow;
          this.state.medium = UColor.arrow;
          this.state.weak = UColor.tintColor;
        }
      }
    }else{
      this.state.strong = UColor.arrow;
      this.state.medium = UColor.arrow;
      this.state.weak = UColor.arrow;
    }
    if(this.state.activePk != "" && this.state.walletpwd != "" && this.state.reWalletpwd != ""){
      this.state.CreateButton = UColor.tintColor;
    }else{
      this.state.CreateButton =  UColor.mainColor;
    } 
  }

  dismissKeyboardClick() {
    dismissKeyboard();
  }

  render() {
    let {feedBackText, selection} = this.state;
    return (
      <View style={styles.container}>
          

       <ScrollView keyboardShouldPersistTaps="always">
            <TouchableOpacity activeOpacity={1.0} onPress={this.dismissKeyboardClick.bind(this)}>
            <View style={styles.header}>
              {/* <View style={styles.headout}>
                  <Text style={styles.headtitle}>直接复制粘贴钱包私钥文件内容至输入框。或者直接输入私钥</Text>
              </View>      */}
              <View style={styles.inptoutbg}>
                <View style={styles.inptoutgo} >
                  {/* <Text style={styles.inptitle}>私钥</Text> */}
                  <TextInput ref={(ref) => this._lphone = ref} value={this.state.activePk} returnKeyType="next" editable={true}
                    selectionColor={UColor.tintColor} style={styles.inptgo} placeholderTextColor={UColor.arrow} autoFocus={false} 
                    onChangeText={(activePk) => this.setState({ activePk })}  onChange={this.intensity()} keyboardType="default"
                    placeholder="粘贴或输入active私钥" underlineColorAndroid="transparent"  multiline={true}  />
                </View>
                {/* <View style={styles.inptout}>
                  <Text style={styles.inptitle}>账号名称</Text>
                  <View style={{flexDirection: 'row',}}>
                      <TextInput ref={(ref) => this._lpass = ref} value={this.state.walletName}  returnKeyType="go"
                      selectionColor={UColor.tintColor} style={styles.inpt} placeholderTextColor={UColor.arrow}
                      onChangeText={(walletName) => this.setState({ walletName })} autoFocus={false} editable={true}
                      placeholder="输入账号或者点击刷新按钮" underlineColorAndroid="transparent" secureTextEntry={true} maxLength={20}
                      />
                      <Button onPress={() => this.refresh()}>
                        <Animated.Image source={UImage.refresh} style={{width:30,height: 30, 
                                    transform: [{scale: this.state.bounceValue},
                                    {rotateZ: this.state.rotateValue.interpolate({ inputRange: [0,1], outputRange: ['0deg', '360deg'],})},
                            ]}}>
                        </Animated.Image>
                      </Button>   
                  </View>
                </View> */}
              
              <View style={styles.inptout}>
                  <View style={{flexDirection: 'row',}}>
                    <Text style={styles.inptitle}>设置密码</Text>
                    <View style={{flexDirection: 'row',}}>
                        <Text style={{color:this.state.weak, fontSize: 15, padding: 5,}}>弱</Text>
                        <Text style={{color:this.state.medium, fontSize: 15, padding: 5,}}>中</Text>
                        <Text style={{color:this.state.strong, fontSize: 15, padding: 5,}}>强</Text>
                    </View>
                  </View>
                  <TextInput ref={(ref) => this._lpass = ref} value={this.state.walletpwd}  returnKeyType="next" editable={true}
                    selectionColor={UColor.tintColor} style={styles.inpt} placeholderTextColor={UColor.arrow} autoFocus={false} maxLength={Constants.PWD_MAX_LENGTH}
                    onChangeText={(password) => this.setState({walletpwd: password })} underlineColorAndroid="transparent"
                    placeholder="输入密码至少8位,建议大小写字母与数字混合" secureTextEntry={true} onChange={this.intensity()} />
              </View>
              <View style={styles.inptout} >
                  <Text style={styles.inptitle}>确认密码</Text>
                  <TextInput ref={(ref) => this._lpass = ref} value={this.state.reWalletpwd} returnKeyType="next" editable={true} 
                      selectionColor={UColor.tintColor} style={styles.inpt} placeholderTextColor={UColor.arrow} secureTextEntry={true} maxLength={Constants.PWD_MAX_LENGTH}
                      placeholder="重复密码" underlineColorAndroid="transparent"  autoFocus={false} onChange={this.intensity()}
                      onChangeText={(reWalletpwd) => this.setState({ reWalletpwd })} />  
                </View>
              </View>
              <View style={styles.readout}>
                  <TouchableHighlight underlayColor={'transparent'} onPress={() => this.checkClick()}>
                      <Image source={this.state.isChecked?UImage.aab1:UImage.aab2} style={styles.readoutimg}/>
                  </TouchableHighlight>
                <Text style={styles.readtext} >我已经仔细阅读并同意 <Text onPress={() => this.prot(this,'clause')} style={styles.servicetext}>服务及隐私条款</Text></Text> 
              </View> 
              <Button onPress={() => this.importPriKey()}>
                <View style={styles.importPriout} backgroundColor={this.state.CreateButton}>
                  <Text style={styles.importPritext}>开始导入</Text>
                </View>
              </Button>
              {/* <Button onPress={() => this.prot(this,'privatekey')}>
                <View style={styles.importPriout}>
                  <Text style={styles.privatekeytext}>什么是私钥 ？</Text>
                </View>
              </Button> */}

              <Button onPress={() => this.prot(this,'howImportPrivatekey')}>
                <View style={styles.importPriout}>
                  <Text style={styles.privatekeytext}>如何导入私钥？</Text>
                </View>
              </Button>

            </View>
          </TouchableOpacity>
        </ScrollView> 
        <Modal style={styles.touchableout} animationType={'slide'} transparent={true}  visible={this.state.show} onRequestClose={()=>{}}>
            <TouchableOpacity style={styles.pupuo} activeOpacity={1.0}>
              <View style={styles.modalStyle}>
                <View style={styles.subView}> 
                  <Text style={styles.titleout}/>
                  <Text style={styles.titleText}>导入失败</Text>
                  <Button style={{}} onPress={this._onRequestClose.bind(this)}>
                    <Text style={styles.titleout}>×</Text>
                  </Button>
                </View>
                <Text style={styles.contentText}>该私钥信息导入失败，请仔细核对私钥是否正确</Text>
                <View>
                    <TouchableOpacity onPress={() => this._onPressListItem()}>
                        <View style={styles.codeout}>
                            <Text style={styles.prompttext}>查看原因</Text>
                            <Ionicons name={this.state.Invalid ? "ios-arrow-down-outline" : "ios-arrow-forward-outline"} size={14} color={UColor.tintColor}/>
                        </View>
                    </TouchableOpacity>
                    {this.state.Invalid ? <Text style={styles.copytext}>{this.state.publicKey}{this.state.ReturnData}</Text> : null}
                </View>
                  <Button onPress={this._onRequestClose.bind(this)}>
                      <View style={styles.buttonView}>
                          <Text style={styles.buttoncols}>知道了</Text>
                      </View>
                  </Button>  
              </View>
            </TouchableOpacity>
        </Modal>  
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: UColor.secdColor
  },
  header: { 
    backgroundColor: UColor.secdColor,
  },
  headout: {
    backgroundColor: '#4F617D',
    paddingLeft: 25,
    paddingRight: 25,
    paddingTop: 10,
    paddingBottom: 15,
    marginBottom: 5,
  },
  headtitle: {
    color: UColor.arrow,
    fontSize: 15,
    lineHeight: 25,
  },
  inptoutbg: { 
    backgroundColor: UColor.mainColor,
  },

  row: {
    flex: 1,
    backgroundColor: UColor.mainColor,
    flexDirection: "row",
    padding: 20,
    paddingTop: 10,
    justifyContent: "space-between",
  },
  left: {
    flex: 1,
    flexDirection: "column",
    backgroundColor: 'red'
  },
  right: {
    flex: 1,
    flexDirection: "column",
    backgroundColor: 'black'
  },
  incup: {
    fontSize: 12,
    color: UColor.fontColor,
    backgroundColor: '#F25C49',
    padding: 5,
    textAlign: 'center',
    marginLeft: 10,
    borderRadius: 5,
    minWidth: 60,
    maxHeight: 25
  },
  incdo: {
    fontSize: 12,
    color: UColor.fontColor,
    backgroundColor: '#25B36B',
    padding: 5,
    textAlign: 'center',
    marginLeft: 10,
    borderRadius: 5,
    minWidth: 60,
    maxHeight: 25
  },

  inptout: {
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    backgroundColor: UColor.mainColor,
    borderBottomColor: UColor.secdColor,
  },
  inptitle: {
    flex: 1,
    fontSize: 15,
    lineHeight: 30,
    paddingLeft: 5,
    color: UColor.fontColor,
  },
  inpt: {
    height: 50,
    fontSize: 16,
    color: UColor.arrow, 
  },
  inptoutgo: {
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderBottomWidth: 10,
    backgroundColor: UColor.mainColor,
    borderBottomColor: UColor.secdColor,
  },
  inptgo: {
    flex: 1, 
    height: 90, 
    fontSize: 16,
    lineHeight: 25,
    borderRadius: 5,
    color: UColor.arrow, 
    paddingHorizontal: 10,
    textAlignVertical: 'top', 
    borderWidth: 1,
    borderColor: UColor.arrow,
    backgroundColor: UColor.secdColor,
  },

  readout: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  readoutimg: {
    width: 20,
    height: 20,
    marginHorizontal: 10,
  },
  readtext: {
    fontSize: 14,
    color: UColor.arrow,
  },
  servicetext: {
    fontSize: 14,
    color: UColor.tintColor,
  },

  importPriout: { 
    height: 45, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginHorizontal: 20,
    marginTop: 20, 
    borderRadius: 5, 
  },
  importPritext: {
    fontSize: 15,
    color: UColor.fontColor,
  },

  privatekeytext: { 
    fontSize: 15, 
    color: UColor.tintColor,
  },
  pupuo: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalStyle: {
    width: maxWidth - 20,
    backgroundColor: UColor.fontColor,
    borderRadius: 5,
    paddingHorizontal: 25,
  },
  subView: {
    flexDirection: "row",
    alignItems: 'center',
    justifyContent: 'center',
    height: 30,
    marginVertical: 15,
  },
  buttonView: {
    height: 50,
    marginVertical: 10,
    borderRadius: 6,
    backgroundColor: UColor.showy,
    justifyContent: 'center',
    alignItems: 'center'
  },
  buttoncols: {
    fontSize: 16,
    color: UColor.fontColor
  },
  titleText: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  titleout: {
    width: 40,
    color: '#CBCBCB',
    fontSize: 28,
    textAlign: 'center',
  },
  contentText: {
      fontSize: 14,
      color: UColor.showy,
      textAlign: 'left',
      marginVertical: 20,
    },
    prompttext: {
      fontSize: 14,
      color: UColor.tintColor,
      marginHorizontal: 5,
    },
    codeout: {
      flexDirection: "row",
      alignItems: 'center',
      justifyContent: 'flex-end',
    },
    copytext: {
      fontSize: 14,
      color: '#808080',
      textAlign: 'left'
    },
});

export default ImportEosKey;
