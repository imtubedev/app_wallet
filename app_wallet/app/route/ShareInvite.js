
import React from 'react';
import { connect } from 'react-redux'
import { StyleSheet, Dimensions, Modal, Animated, View, Image, ScrollView, Text, Clipboard, ImageBackground, Linking, TextInput } from 'react-native';
import SplashScreen from 'react-native-splash-screen';
import NavigationUtil from '../utils/NavigationUtil';
import UImage from '../utils/Img'
import AnalyticsUtil from '../utils/AnalyticsUtil';
import Button from '../components/Button'
const maxHeight = Dimensions.get('window').height;
const maxWidth = Dimensions.get('window').width;
import { EasyToast } from '../components/Toast';
import { EasyDialog } from '../components/Dialog'
import { EasyLoading } from '../components/Loading'
import QRCode from 'react-native-qrcode-svg';
import Constants from '../utils/Constants'

var WeChat = require('react-native-wechat');

@connect(({ invite, login }) => ({ ...invite, ...login }))
class ShareInvite extends React.Component {

  state = {
    code: "",
    focus: false
  }

  static navigationOptions = {
    title: "邀请注册"
  };

  constructor(props) {
    super(props);
    WeChat.registerApp('wxc5eefa670a40cc46');
  }

  componentDidMount() {
    var th = this;

    this.props.dispatch({
      type: "invite/info", payload: { uid: Constants.uid }, callback: (data) =>{
        if (data.code == 403) {
          this.props.dispatch({
            type: 'login/logout', payload: {}, callback: () => {
              this.props.navigation.goBack();
              EasyToast.show("登陆已失效, 请重新登陆!");
            }
          });
        }
      }
    });
    // this.props.dispatch({
    //   type: "invite/getBind", payload: { uid: Constants.uid }, callback: function (data) {
        // if (data.code == "0") {
        //   if (data.data == "" || data.data == "null" || data.data == null) {
        //     const view = <TextInput autoFocus={true} onChangeText={(code) => th.setState({ code })} returnKeyType="go" selectionColor="#65CAFF" style={{ color: '#65CAFF', width: maxWidth - 100, fontSize: 15, backgroundColor: '#EFEFEF' }} placeholderTextColor="#8696B0" placeholder="输入邀请码" underlineColorAndroid="transparent" keyboardType="phone-pad" maxLength={8} />
        //     EasyDialog.show("未绑定，补填邀请码", view, "绑定", "取消", () => {
        //       th.setState({ focus: true })
        //       EasyLoading.show("绑定中");
        //       th.props.dispatch({
        //         type: "invite/bind", payload: { uid: Constants.uid, code: th.state.code }, callback: function (dt) {
        //           EasyLoading.dismis()
        //           if (dt.code == "0") {
        //             EasyToast.show("绑定成功");
        //             EasyDialog.dismis();
        //           } else {
        //             EasyToast.show(dt.msg);
        //           }
        //         }
        //       });
        //     }, () => { EasyDialog.dismis() });
        //   }
        // }
    //   }
    // });
  }

  copy = () => {
    // let msg = "由硬币资本、连接资本领投的全网第一款柚子钱包EosToken上线撒币啦，500,000EOS赠送新用户活动，太爽了~真是拿到手软，用我的邀请链接注册即获得"+(parseFloat(this.props.inviteInfo.regReward)+parseFloat(this.props.inviteInfo.l1Reward))+"EOS。"+this.props.inviteInfo.inviteUrl+"#"+this.props.inviteInfo.code+"（如果微信无法打开，请复制链接到手机浏览器打开,苹果版本已上线）";
    let msg = "由硬币资本、连接资本领投的全网第一款柚子钱包EosToken开放注册了，" + this.props.inviteInfo.inviteUrl + "（请复制链接到手机浏览器打开）（如果微信无法打开，请复制链接到手机浏览器打开,苹果版本已上线）";

    // Clipboard.setString(msg);
    EasyDialog.show("复制成功", msg, "分享给微信好友", "取消", () => {
      //   Linking.openURL('weixin://'); }, () => { EasyDialog.dismis() }
      AnalyticsUtil.onEvent('Invitation_registershare');
      WeChat.isWXAppInstalled()
        .then((isInstalled) => {
          EasyDialog.dismis();
          if (isInstalled) {
            WeChat.shareToSession({ type: 'text', description: msg })
              .catch((error) => {
                EasyToast.show(error.message);
              });
          } else {
            EasyToast.show('没有安装微信软件，请您安装微信之后再试');
          }
        });
    });
  }

  render() {
    return (
      <View style={styles.container}>     
          

        <ImageBackground style={{flex:1, justifyContent: "center" }} source={UImage.shareBg} resizeMode="cover">
          <View style={{justifyContent: 'center', alignItems: 'center',width: '100%', height: 20,}}>
              <Image source={UImage.share_Size} style={{width: maxWidth - 100, height: (maxWidth/2 - 100) * 0.45}} />  
          </View> 
          <View style={{flexDirection: "row", paddingTop: 40, paddingBottom: 40,}}>            
            <View  style={{flex:1,flexDirection: "column",}}>
              <View style={{flex: 1, justifyContent: 'center', alignItems: 'center',}}>
                <Image style={{ justifyContent: 'center', width:60, height:60, }} source={UImage.logo} />
                <Text style={{ color: '#fff',textAlign: 'center', fontSize: 16, marginTop: 15, }}>EosToken</Text>                 
              </View>
              <View style={{flex: 1, justifyContent: 'center', alignItems: 'center',}}>
                <View style={{padding:5,backgroundColor:'#fff'}}>
                  <QRCode size={70} value={this.props.inviteInfo.inviteUrl + "#" + this.props.inviteInfo.code} />
                </View>  
                <Text style={{ fontSize: 16, color: '#65CAFF', marginTop: 15, textAlign: 'center' }}>扫码下载APP</Text>
              </View>
            </View>
            
            <View style={{justifyContent: 'center', alignItems: 'center', paddingRight: 20,}}>
              <Image source={UImage.phone} style={{justifyContent: 'center', width:maxWidth/1.5-30, height:maxHeight/2-40,}} />
            </View>
          </View>
          <View style={{ flexDirection: "row", justifyContent: "center", marginBottom: 20, }}>
            <Image style={{ width: maxWidth / 2.5 - 30, height: (maxWidth / 2.5 - 30) * 0.45 }} source={UImage.inb} />
            <Image style={{ width: maxWidth / 2.5 - 30, height: (maxWidth / 2.5 - 30) * 0.45, marginLeft: 20 }} source={UImage.link} />
          </View>
          <Text style={{ height:30, color: '#000', width: "100%", textAlign: 'center', fontSize: 14, }}>领投机构：硬币资本，连接资本</Text>
        </ImageBackground>       
                
        <Button onPress={() => { this.copy() }}>
          <View style={{ height: 50, backgroundColor: '#65CAFF', justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ fontSize: 16, color: '#fff' }}>复制专属邀请链接</Text>
          </View>
        </Button>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#fff',
  }
});

export default ShareInvite;