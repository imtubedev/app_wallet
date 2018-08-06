import React from 'react';
import { connect } from 'react-redux'
import { Dimensions, DeviceEventEmitter, InteractionManager, ListView, StyleSheet, View, RefreshControl, Text, ScrollView, Image, Platform, StatusBar, TextInput, ImageBackground } from 'react-native';
import { TabViewAnimated, TabBar, SceneMap } from 'react-native-tab-view';
import UColor from '../../utils/Colors'
import Button from '../../components/Button'
import Item from '../../components/Item'
import Icon from 'react-native-vector-icons/Ionicons'
import UImage from '../../utils/Img'
import { EasyLoading } from '../../components/Loading';
import { EasyToast } from '../../components/Toast';
import { EasyDialog } from '../../components/Dialog'
import { kapimg } from '../../utils/Api'
import Constants from '../../utils/Constants'
import BaseComponent from "../../components/BaseComponent";
var ScreenWidth = Dimensions.get('window').width;
var tick = 60;

@connect(({ login }) => ({ ...login }))
class SignIn extends BaseComponent {

  static navigationOptions = {
    title: '用户积分',
    headerStyle: {
      paddingTop:Platform.OS == 'ios' ? 30 : 20,
      backgroundColor: UColor.secdColor,
      borderBottomWidth:0,
    },
  };

  state = {
    phone: "",
    password: "",
    code: "",
    img: Constants.rootaddr+kapimg,
    kcode: "",
    currentPoint: 0,
    Sign_in: false,
    accumulative: 0,
  }

  constructor(props) {
    super(props);

  }

  componentDidMount() {
    EasyLoading.show();
    this.props.dispatch({
      type: "login/fetchPoint", payload: { uid: Constants.uid }, callback:(data) =>{
        EasyLoading.dismis();
        if (data.code == 403) {
          this.props.dispatch({
            type: 'login/logout', payload: {}, callback: () => {
              this.props.navigation.goBack();
              EasyToast.show("登陆已失效, 请重新登陆!");
            }
          });         
        }else if(data.code == 0) {
          this.setState({
              accumulative:this.props.pointInfo.signin + this.props.pointInfo.share + this.props.pointInfo.interact + this.props.pointInfo.store + this.props.pointInfo.turnin + this.props.pointInfo.turnout
          })
        }
      },
    });
    this.props.dispatch({ type: 'login/isSigned', payload:{name: this.state.phone},callback: (data) => { 
      EasyLoading.dismis();
      this.setState({Sign_in: data.data});
    } });
  }
  componentWillUnmount(){
    //结束页面前，资源释放操作
    super.componentWillUnmount();
    
  }
  signIn = () => {
    const { dispatch } = this.props;
    this.props.dispatch({
      type: 'login/signin', payload: { name: this.state.phone }, callback: (data) => {
        if(data.code == 509){
          this.setState({
            Sign_in: true,
          })
        }else if(data.code == 0) {
          EasyToast.show("签到成功");
          this.props.dispatch({ type: 'login/fetchPoint', payload: { uid: Constants.uid },callback:(data) =>{
            this.setState({
              Sign_in: true,
              accumulative:this.props.pointInfo.signin + this.props.pointInfo.share + this.props.pointInfo.interact + this.props.pointInfo.store + this.props.pointInfo.turnin + this.props.pointInfo.turnout
          })
          } });
        } else {
          EasyToast.show(data.msg);
            this.setState({
              Sign_in: false,
            })
        }
        EasyLoading.dismis();
      }
    })
  }

  render() {
    return <View style={styles.container}>
            

      <ScrollView keyboardShouldPersistTaps="always">
        <View>
          <View style={styles.outsource}>
            <Text style={styles.promptText}> 温馨提示：连续签到将获得额外积分哦~</Text>
            <ImageBackground style={styles.imgbg} source={UImage.integral_bg} resizeMode="cover">
              <View style={styles.accumulativeout}>
                <Text style={styles.accumulativetext}>累计积分</Text>
                <Text style={styles.accumulative}>{this.state.accumulative}</Text>
              </View>
            </ImageBackground>
            <Image source={UImage.point_full} style={styles.imgsty} />           
            <View style={styles.sigshaint}>
              <Text style={styles.sigsto}>{this.props.pointInfo.signin}</Text>
              <Text style={styles.shatur}>{this.props.pointInfo.share}</Text>
              <Text style={styles.sigsto}>{this.props.pointInfo.interact}</Text>
            </View>
            <View style={styles.sigshaint}>
              <Text style={styles.sigstotext}>签到累计</Text>
              <Text style={styles.shaturtext}>分享资讯</Text>
              <Text style={styles.sigstotext}>资讯互动</Text>
            </View>
            <View style={styles.stotur}>
              <Text style={styles.sigsto}>{this.props.pointInfo.store}</Text>
              <Text style={styles.shatur}>{this.props.pointInfo.turnin}</Text>
              <Text style={styles.sigsto}>{this.props.pointInfo.turnout}</Text>
            </View>
            <View style={styles.stoturtext}>
              <Text  style={styles.sigstotext}>资产存储</Text>
              <Text style={styles.shaturtext}>转入累计</Text>
              <Text style={styles.sigstotext}>转出累计</Text>
            </View>
          </View>
          <Button onPress={() => this.signIn()}>
            <View style={{ height: 45, justifyContent: 'center', alignItems: 'center', margin: 20, borderRadius: 5 }} backgroundColor={this.state.Sign_in ? UColor.mainColor:UColor.tintColor}  >
              <Text style={{ fontSize: 15, color: UColor.fontColor }}>{this.state.Sign_in ? "已签到": "立即签到"}</Text>
            </View>
          </Button>
          <Text style={styles.foottop}>积分细则：</Text>
          <Text style={styles.foottext}>1.签到每日可获得积分+1，连续签到可额外增加积分；</Text>
          <Text style={styles.foottext}>2.分享资讯到朋友圈或微信好友每日可获得积分+1；</Text>
          <Text style={styles.foottext}>3.资讯浏览评点每日可获得积分+1；</Text>
          {/* <Text style={styles.foottext}>4.转入资产成功，每笔可获得积分+5;</Text>
          <Text style={styles.foottext}>5.转出资产成功，每笔可获得积分+2；</Text>
          <Text style={styles.foottext}>6.定存EOS币，每日可获得2%比例的积分；</Text> */}
          <Text style={styles.footbom}>4.积分可兑换官方礼品和提高用户权益，官方将会在后续开发积分价值体系，让拥有更多积分的用户享受官方VIP服务，敬请期待。</Text>
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

  outsource: {
    backgroundColor: UColor.secdColor,
    flex: 1,
    flexDirection: 'column',
  },
  promptText: {
    fontSize: 12,
    color: UColor.arrow,
    margin: 10,
    fontSize: 14
  },
  imgbg: {
    justifyContent: "center",
    alignItems: 'center',
    marginLeft: ScreenWidth / 7 * 2,
    marginRight: ScreenWidth / 7 * 2,
    width: ScreenWidth / 7 * 3,
    height: ScreenWidth / 7 * 3,
  },
  accumulativeout: {
    flexDirection: "column",
    margin: 10,
    justifyContent: "center",
    alignItems: 'center',
  },
  accumulativetext: {
    fontSize: 14,
    color: UColor.fontColor,
    marginBottom: 10,
  },
  accumulative: {
    fontSize: 28,
    color: UColor.fontColor,
    marginLeft: 2,
    paddingBottom: 2
  },
  imgsty: { 
    width: 320, 
    height: 25, 
    justifyContent: 'center', 
    alignSelf: 'center', 
    marginTop: 10, 
  },

  sigshaint: { 
    flexDirection: "row",
  },
  stotur: { 
    flexDirection: "row", 
    marginTop: 10 
  },
  stoturtext: { 
    flexDirection: "row", 
    marginBottom: 20 
  },
  sigsto: { 
    textAlign: "center", 
    fontSize: 16, 
    color: UColor.fontColor, 
    alignSelf: 'center', 
    width: '35%', 
  },
  sigstotext: { 
    textAlign: "center", 
    fontSize: 14, 
    color: UColor.arrow, 
    width: '35%' 
  },
  shatur: { 
    textAlign: "center", 
    fontSize: 16, 
    color: UColor.fontColor, 
    alignSelf: 'center', 
    width: '30%', 
  },
  shaturtext: { 
    textAlign: "center", 
    fontSize: 14, 
    color: UColor.arrow,
    width: '30%' 
  },


  foottop: {
    fontSize: 14, 
    color: UColor.arrow, 
    marginLeft: 20
  },
  foottext: {
    fontSize: 14,
    color: UColor.arrow,
    marginLeft: 10
  },
  footbom: {
    fontSize: 14,
    color: UColor.arrow,
    marginLeft: 10,
    marginRight: 10,
  },
});

export default SignIn;
