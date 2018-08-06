import React from 'react';
import { connect } from 'react-redux'
import {Dimensions,DeviceEventEmitter,InteractionManager,ListView,StyleSheet,View,RefreshControl,Text,ScrollView,Image,Platform,Linking,Switch} from 'react-native';
import {TabViewAnimated, TabBar, SceneMap} from 'react-native-tab-view';
import Upgrade from 'react-native-upgrade-android';
import UColor from '../../utils/Colors'
import Button from  '../../components/Button'
import Item from '../../components/Item'
import Icon from 'react-native-vector-icons/Ionicons'
import Ionicons from 'react-native-vector-icons/Ionicons'
import UImage from '../../utils/Img'
import AnalyticsUtil from '../../utils/AnalyticsUtil';
import { EasyDialog } from "../../components/Dialog"
import { EasyLoading } from '../../components/Loading';
import { EasyToast } from '../../components/Toast';
import JPush from 'jpush-react-native';
import JPushModule from 'jpush-react-native';
import BaseComponent from "../../components/BaseComponent";

var DeviceInfo = require('react-native-device-info');

const Font = { Ionicons }
@connect(({login,jPush}) => ({...login,...JPush}))
class Set extends BaseComponent {

  static navigationOptions = {
    title: '系统设置',
   
  };

  constructor(props) {
    super(props);
    this.state = {
      value: false,
      gesture: false
    }
  }

  componentDidMount() {
    const {dispatch}=this.props;
    dispatch({type:'login/getJpush',callback:(jpush)=>{
      this.setState({
        value:jpush.jpush,
      });
    }});

    //APK更新
    if (Platform.OS !== 'ios') {
      Upgrade.init();
      DeviceEventEmitter.addListener('progress', (e) => {
        if (e.code === '0000') { // 开始下载
          EasyDialog.startProgress();
        } else if (e.code === '0001') {
          EasyDialog.progress(e.fileSize, e.downSize);
        } else if (e.code === '0002') {
          EasyDialog.endProgress();
        }
      });
    }
  }
  componentWillUnmount(){
    //结束页面前，资源释放操作
    super.componentWillUnmount();
    
  }
  logout = () =>{
    if(this.props.loginUser){
      this.props.dispatch({type:'login/logout',payload:{},callback:()=>{
        this.props.navigation.goBack();
        AnalyticsUtil.onEvent('Sign_out');
      }});
    }else{
      const { navigate } = this.props.navigation;
      navigate('Login', {});
    } 
  }

 
  gesturepass(){
    EasyDialog.show("温馨提示", "该功能正在紧急开发中，敬请期待！", "知道了", null, () => { EasyDialog.dismis() });
  }


  changeJpush(state){
    const {dispatch}=this.props;
    dispatch({type:'login/changeJpush',callback:(jpush)=>{
      this.setState({
        value:jpush,
      });
    }});
    if(state){
      JPushModule.addTags(['newsmorningbook'], map => {
      })
    }else{
      JPushModule.deleteTags(['newsmorningbook'], map => {
      });
    }
  }
  doUpgrade = (url, version) => {
    if (Platform.OS !== 'ios') {
      this.setState({ visable: false });
      Upgrade.startDownLoad(url, version, "eostoken");
    } else {
      Linking.openURL(url);
    }
  }

  checkVersion(){
    //升级
    this.props.dispatch({
      type: 'common/upgrade', payload: { os: DeviceInfo.getSystemName() }, callback: (data) => {
        if (data.code == 0) {
          if (DeviceInfo.getVersion() < data.data.version) {
            if (data.data.must == 1) {
              EasyDialog.show("版本更新", data.data.intr, "升级", null, () => { this.doUpgrade(data.data.url, data.data.version) })
            } else {
              EasyDialog.show("版本更新", data.data.intr, "升级", "取消", () => { this.doUpgrade(data.data.url, data.data.version) })
            }
          }else{
            EasyToast.show("当前已是最新版本");
          }
        }
      }
    });
  }

  render() {
    return <View style={styles.container}>
      <View style={styles.scrollView}>
          <Button onPress={() => this.gesturepass()}>
            <View style={styles.listItem}>
                <View style={styles.listInfo}>
                  <View style={styles.scrollView}>
                    <Text style={styles.listInfoTitle}>货币单位</Text>
                  </View>
                  <View style={styles.listInfoRight}>            
                    <Font.Ionicons name="ios-arrow-forward-outline" size={16} color={UColor.arrow} />
                  </View>
                </View>
              </View>
          </Button>
          <View style={styles.listItem}>
              <View style={styles.listInfo}>
                <View style={styles.scrollView}>
                  <Text style={styles.listInfoTitle}>手势密码</Text>
                </View>
                <View style={styles.listInfoRight}>
                  <Switch  tintColor={UColor.secdColor} onTintColor={UColor.tintColor} thumbTintColor="#ffffff"
                      value={this.state.gesture} onValueChange={(gesture)=>{
                      this.setState({
                        gesture:gesture,
                      });
                      this.gesturepass(gesture);
                  }}/>
                </View>
              </View>
          </View>
          <View style={styles.listItem}>
              <View style={styles.listInfo}>
                <View style={styles.scrollView}>
                  <Text style={styles.listInfoTitle}>消息推送</Text>
                </View>
                <View style={styles.listInfoRight}>
                  <Switch  tintColor={UColor.secdColor} onTintColor={UColor.tintColor} thumbTintColor="#ffffff"
                      value={this.state.value} onValueChange={(value)=>{ this.setState({ value:value, });
                      this.changeJpush(value);
                  }}/>
                </View>
              </View>
          </View>
          <Button onPress={() => this.checkVersion()}>
            <View style={styles.listItem}>
                <View style={styles.listInfo}>
                  <View style={styles.scrollView}>
                    <Text style={styles.listInfoTitle}>检查新版本</Text>
                  </View>
                  {/* <View style={styles.listInfoRight}>            
                    <Font.Ionicons name="ios-arrow-forward-outline" size={16} color={UColor.arrow} />
                  </View> */}
                </View>
              </View>
          </Button>
      </View>
      <View style={styles.btnout}>
        <Button onPress={() => this.logout()}>
          <View style={styles.btnloginUser}>
            <Text style={styles.btntext}>{this.props.loginUser?"退出登陆":"登陆"}</Text>
          </View>
        </Button>
      </View>
  </View>
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection:'column',
    backgroundColor: UColor.secdColor,
  },
  scrollView: {
    flex: 1,
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
    borderTopColor: UColor.secdColor
  },
  listInfoTitle: {
    color:UColor.fontColor, 
    fontSize:16
  },
  listInfoRight: {
    flexDirection: "row",
    alignItems: "center"
  },
  btnout: {
    height: 80, 
    marginBottom: 30,
  },
  btnloginUser: {
    height: 45,
    backgroundColor: UColor.tintColor,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 20,
    borderRadius: 5
  },
  btntext: {
    fontSize:15,
    color: UColor.fontColor,
  },
  
});

export default Set;
