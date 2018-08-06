import React from 'react';
import { connect } from 'react-redux'
import { Dimensions, DeviceEventEmitter,NativeModules, InteractionManager, ListView, StyleSheet, View, RefreshControl, Text, ScrollView, Image, Platform, StatusBar, Switch } from 'react-native';
import { TabViewAnimated, TabBar, SceneMap } from 'react-native-tab-view';
import UColor from '../../utils/Colors'
import Button from '../../components/Button'
import Item from '../../components/Item'
import Icon from 'react-native-vector-icons/Ionicons'
import UImage from '../../utils/Img'
import { EasyLoading } from '../../components/Loading';
import { EasyToast } from '../../components/Toast';
import { EasyDialog } from '../../components/Dialog';

var DeviceInfo = require('react-native-device-info');

@connect(({ login}) => ({ ...login}))
class Setting extends React.Component {

  static navigationOptions = {
    title: '我的'
  };
  

  constructor(props) {
    super(props);
    
    this.config = [
      { avatar:UImage.my_wallet, first: true, name: "钱包管理", onPress: this.goPage.bind(this, "WalletManage") },
      // { avatar:UImage.my_share,  name: "邀请注册", onPress: this.goPage.bind(this, "share") },
      // { avatar:UImage.my_recovery, name: "密钥恢复", onPress: this.goPage.bind(this, "Test1") },
      { avatar:UImage.my_community, name: "EOS社区", onPress: this.goPage.bind(this, "Community") },
      { avatar:UImage.my_help, name: "帮助中心", onPress: this.goPage.bind(this, "Helpcenter") },
      { avatar:UImage.my_system, name: "系统设置", onPress: this.goPage.bind(this, "set") },
    ];
  }

    //组件加载完成
    componentDidMount() {
      const {dispatch}=this.props;
    }

    
  goPage(key, data = {}) {
    const { navigate } = this.props.navigation;
    if (key == "share") {
      if (this.props.loginUser) {
        navigate('Share', {});
      } else {
        navigate('Login', {});
        EasyToast.show('请登陆');
      }
    } else if (key == 'WalletManage') {
      navigate('WalletManage', {});
    } else if (key == 'set') {
      navigate('Set', {});
    } else if (key == 'Community') {
      navigate('Community', {});
    }else if (key == 'Helpcenter') {
      navigate('Helpcenter', {});
    } else{
      EasyDialog.show("温馨提示", "暂未开放，敬请期待！", "知道了", null, () => { EasyDialog.dismis() });
    }
  }

  skipNativeCall() {  
    let phone = '123123123';
    NativeModules.commModule.rnCallNative(phone);  
 }  

  /** 
 * Callback 通信方式 
 */
  callbackComm(msg) {
    NativeModules.commModule.rnCallNativeFromCallback(msg, (result) => {
      alert("CallBack收到消息:" + result);
    })
  }

    /** 
   * 接收原生调用 
   */
  componentDidMount() {
    DeviceEventEmitter.addListener('nativeCallRn', (msg) => {
      title = "React Native界面,收到数据：" + msg;
      // ToastAndroid.show("发送成功", ToastAndroid.SHORT);
      alert(title);
    })
  }

  _renderListItem() {
    return this.config.map((item, i) => {
      return (<Item key={i} {...item} />)
    })
  }

  goProfile() {
    if (this.props.loginUser) {
      return;
    }
    const { navigate } = this.props.navigation;
    navigate('Login', {});
  }

  signIn() {
    const { navigate } = this.props.navigation;
    if (this.props.loginUser) {
      navigate('SignIn', {});
    } else {
      navigate('Login', {});
      EasyToast.show('请登陆');
    }
  }


  render() {
    return <View style={styles.container}>
            

      <ScrollView style={styles.scrollView}>
        <View>
          <Button onPress={this.goProfile.bind(this)}>
            <View style={styles.userHead} >
              <View style={styles.headout}>
                <Image source={UImage.logo} style={styles.headimg} />
                <Text style={styles.headtext}>{(this.props.loginUser) ? this.props.loginUser.nickname : "登陆"}</Text>
              </View>
              <View style={styles.signedout}>
                {
                  <Button onPress={this.signIn.bind(this)} style={styles.signedbtn}>
                    <Image source={UImage.signed} style={styles.signedimg} />
                  </Button>
                }
              </View>
            </View>
          </Button>
          <Button style={styles.eosbtn}>
            <View style={styles.eosbtnout}>
              <View style={styles.eosout}>
                <Text style={styles.eosbtntext}>活动奖励</Text>
                <Text style={styles.eostext}>{(this.props.loginUser) ? this.props.loginUser.eost : "0"} EOS</Text>
              </View>
              <View style={styles.Withdrawout}>
                {
                  this.props.loginUser && <Button onPress={() => { EasyDialog.show("温馨提示", "该功能正在紧急开发中，敬请期待！", "知道了", null, () => { EasyDialog.dismis() }); }} style={styles.Withdrawbtn}>
                    <Text style={styles.Withdrawtext}>领取</Text>
                  </Button>
                }
              </View>
            </View>
          </Button>
          <View>
            {this._renderListItem()}
          </View>
          
          <View style={styles.footer}>
            <Text style={styles.foottext}>© 2018 eostoken all rights reserved </Text>
            {/* <Text style={styles.foottext}>EOS专业版钱包 V{DeviceInfo.getVersion()}</Text> */}
            <Text style={styles.foottext}>EOS专业版钱包 V2.1.9.3</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: UColor.secdColor,
  },
  scrollView: {
    flex: 1,
  },
  userHead: {
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    paddingHorizontal: 20,
    backgroundColor: UColor.mainColor
  },
  headout: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15
  },
  headimg: {
    width: 42,
    height: 52
  },
  headtext: {
    color: UColor.fontColor,
    fontSize: 17,
    marginLeft: 15
  },

  signedout: {
    flex: 1,
    flexDirection: "row",
    alignSelf: 'center',
    justifyContent: "flex-end"
  },
  signedbtn: {
    borderRadius: 5,
    paddingVertical: 5,
    paddingHorizontal: 15
  },
  signedimg: {
    width: 40,
    height: 49
  },

  eosbtn: {
    marginTop: 15
  },
  eosbtnout: {
    flex: 1,
    flexDirection: "row",
    paddingHorizontal: 20,
    backgroundColor: UColor.mainColor,
    justifyContent: 'space-between'
  },
  eosout: {
    flex: 1,
    flexDirection: "column",
    paddingVertical: 12
  },
  eosbtntext: {
    color: UColor.arrow,
    fontSize: 11
  },
  eostext: {
    color: UColor.fontColor,
    fontSize: 15,
    marginTop: 10
  },

  Withdrawout: {
    flex: 1,
    flexDirection: "row",
    alignSelf: 'center',
    justifyContent: "flex-end"
  },
  Withdrawbtn: {
    backgroundColor: UColor.tintColor,
    borderRadius: 5,
    paddingVertical: 5,
    paddingHorizontal: 15
  },
  Withdrawtext: {
    fontSize: 15,
    color: UColor.fontColor,
  },


  header: {
    borderColor: UColor.secdColor,
    borderWidth: 0.6,
    paddingTop: (Platform.OS == 'ios' ? 33 : 14),
    paddingBottom: 10,
    backgroundColor: UColor.mainColor,
    textAlign: "center",
    fontSize: 18,
    fontWeight: 'normal',
    color: UColor.fontColor
  },

  listItem: {
    backgroundColor: UColor.mainColor,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  listInfo: {
    height: 55,
    flex: 1,
    paddingLeft: 16,
    paddingRight: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth:1,
    borderTopColor: UColor.secdColor,
  },
  listInfoTitle: {
    color:UColor.fontColor, 
    fontSize:16
  },
  listInfoRight: {
    flexDirection: "row",
    alignItems: "center"
  },

  footer: {
    flex: 1,
    marginTop: 30,
    flexDirection: 'column'
  },
  foottext: {
    fontSize: 10,
    color: UColor.arrow,
    width: '100%',
    textAlign: 'center',
    marginTop: 5
  },
});

export default Setting;
