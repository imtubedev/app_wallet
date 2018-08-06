import React from 'react';
import { connect } from 'react-redux'
import {Easing,Animated,NativeModules,StatusBar,BackHandler,DeviceEventEmitter,InteractionManager,ListView,StyleSheet,Image,ScrollView,View,RefreshControl,Text, TextInput,Platform,Dimensions,Modal,TouchableHighlight,Switch,ImageBackground,ProgressViewIOS} from 'react-native';
import {TabViewAnimated, TabBar, SceneMap} from 'react-native-tab-view';
import store from 'react-native-simple-store';
import UColor from '../../utils/Colors'
import Button from  '../../components/Button'
import Item from '../../components/Item'
import Echarts from 'native-echarts'
import UImage from '../../utils/Img'
import QRCode from 'react-native-qrcode-svg';
const ScreenWidth = Dimensions.get('window').width;
const ScreenHeight = Dimensions.get('window').height;
import { EasyDialog } from "../../components/Dialog"
import ViewShot from "react-native-view-shot";
import BaseComponent from "../../components/BaseComponent";

@connect(({wallet}) => ({...wallet}))
class Bvote extends BaseComponent {
    static navigationOptions = ({ navigation }) => {
    
        const params = navigation.state.params || {};
       
        return {    
          title: "节点投票",
          headerStyle: {
            paddingTop:Platform.OS == 'ios' ? 30 : 20,
            backgroundColor: UColor.mainColor,
            borderBottomWidth:0,
          },
          headerRight: (<Button onPress={navigation.state.params.onPress}>
            <Text style={{color: UColor.arrow, fontSize: 18,justifyContent: 'flex-end',paddingRight:15}}>邀请投票</Text>
          </Button>),            
        };
      };


  _rightTopClick = () =>{  
    DeviceEventEmitter.emit('voteShare',""); 
  }  

  // 构造函数  
  constructor(props) { 
    super(props);
    this.props.navigation.setParams({ onPress: this._rightTopClick });
    this.state = {
      transformY: new Animated.Value(200),
      transformY1: new Animated.Value(-1000),
      value: false,showShare:false,news:{}};
  }
  goPage(key, data = {}) {
    const { navigate } = this.props.navigation;
    if (key == 'delegate'){
      navigate('Delegate', {});
    }else if (key == 'Imvote') {
      navigate('Imvote', {});
    }else if (key == 'Nodevoting') {
      navigate('Nodevoting', {});
    }else {
      EasyDialog.show("温馨提示", "该功能正在紧急开发中，敬请期待！", "知道了", null, () => { EasyDialog.dismis() });
    }
  }
  componentWillUnmount(){
    //结束页面前，资源释放操作
    super.componentWillUnmount();
    
  }
    render() {
        const c = this.props.navigation.state.params.coinType;
        return (
            <View style={styles.container}>
                 <View style={styles.outsource}>
                    <View style={styles.headoutsource}>
                        <Text style={styles.headSizeone}>进度：33.8764%</Text>
                        <Text style={styles.headSizetwo}>可投票数：0</Text>
                    </View>
                    <View>
                      <View style={styles.Underschedule}></View> 
                      <View style={styles.Aboveschedule}>
                        <View style={styles.Abovestrip}></View>
                        <View style={styles.Abovecircular}></View>
                      </View>                     
                    </View>             
                </View>
                {/* <TouchableHighlight  onPress={this.goPage.bind(this, 'delegate')}>
                  <ImageBackground  style={styles.lockoutsource} source={UImage.votea_bj} resizeMode="stretch">                               
                      <Text style={styles.locktitle}>投票前划分锁仓</Text>
                      <View style={styles.locktext}>
                          <Image source={UImage.votea} style={styles.lockimg}/>
                      </View>  
                  </ImageBackground>
                </TouchableHighlight>  */}
                <TouchableHighlight onPress={this.goPage.bind(this, 'Imvote')}>
                  <ImageBackground  style={styles.lockoutsource} source={UImage.votea_bj} resizeMode="stretch">              
                    <Text style={styles.locktitle}>我的投票</Text>
                    <View style={styles.locktext}>
                        <Image source={UImage.voteb} style={styles.lockimg}/>
                    </View>     
                  </ImageBackground>     
                </TouchableHighlight> 
                <TouchableHighlight onPress={this.goPage.bind(this, 'Nodevoting')} >      
                  <ImageBackground  style={styles.lockoutsource} source={UImage.votec_bj} resizeMode="stretch">              
                    <Text style={styles.locktitle}>超级节点</Text>
                    <View style={styles.locktext}>
                        <Image source={UImage.votec} style={styles.lockimg}/>
                    </View>     
                  </ImageBackground>  
                </TouchableHighlight>       
            </View>
        )
    }
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection:'column',
    backgroundColor: UColor.secdColor,
    padding:6,
  },

  outsource: {
    padding: 20,
    height: 78,
    borderRadius: 5, 
    backgroundColor: UColor.mainColor,
  },

  headoutsource: {
    marginBottom: 15,
    flexDirection:'row', 
    alignItems: "center",
    justifyContent: "center", 
  },

  headSizeone: {
    fontSize: 12, 
    color: UColor.fontColor,
    marginRight: 10,
  },

  headSizetwo: {
    marginLeft: 10,
    fontSize: 12, 
    color: UColor.fontColor
  },

  Underschedule: {
    height: 2, 
    backgroundColor: UColor.secdColor, 
    position:'relative', 
    top: 3,
  },

  Aboveschedule: {
    flexDirection:'row', 
    alignItems: 'center', 
    position:'absolute', 
    width: '100%',
  },
  Abovestrip: {
    width: '24.2218%',
    height: 2,
    backgroundColor: UColor.tintColor,
  },

  Abovecircular: {
    width: 8, 
    height: 8,  
    backgroundColor: UColor.tintColor, 
    borderRadius: 5,
  },

  lockoutsource: {
    justifyContent: "flex-end", 
    alignItems: 'center', 
    flexDirection:'row', 
    width: ScreenWidth-10, 
    height: 115, 
    marginTop: 6, 
    paddingRight: 10,
  },

  locktitle: {
    fontSize:16, 
    color: UColor.fontColor
  },

  locktext: {
    justifyContent: 'center', 
    alignItems: 'center',
  },

  lockimg: {
    width: 30, 
    height: 30, 
    margin: 10,
  },


})
export default Bvote;