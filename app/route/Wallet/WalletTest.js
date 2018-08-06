import React from 'react';
import { connect } from 'react-redux'
import {Dimensions,DeviceEventEmitter,InteractionManager,ListView,StyleSheet,View,RefreshControl,Text,ScrollView,Image,Platform,StatusBar} from 'react-native';
import {TabViewAnimated, TabBar, SceneMap} from 'react-native-tab-view';
import UColor from '../../utils/Colors'
import Button from  '../../components/Button'
import Item from '../../components/Item'
import Icon from 'react-native-vector-icons/Ionicons'
import UImage from '../../utils/Img'
import { EasyLoading } from '../../components/Loading';
import { EasyToast } from '../../components/Toast';
import { EasyDialog } from '../../components/Dialog';
import BaseComponent from "../../components/BaseComponent";
var DeviceInfo = require('react-native-device-info');

@connect(({login}) => ({...login}))
class Setting extends BaseComponent {

  static navigationOptions = {
    title: '钱包测试'
  };

  constructor(props) {
    super(props);
    this.config = [
      {name:"创建钱包",onPress:this.goPage.bind(this, "CreateWallet")},
      {name:"创建账户",onPress:this.goPage.bind(this, "newAccount")},
      {name:"备份助记词",onPress:this.goPage.bind(this, "BackupWord")},
      {name:"备份提示",onPress:this.goPage.bind(this, "BackupNote")},
      {name:"导入钱包",onPress:this.goPage.bind(this, "ImportKey")},
      {name:"钱包管理",onPress:this.goPage.bind(this, "WalletManage")},
      {name:"更改密码",onPress:this.goPage.bind(this, "ModifyPassword")},
      {name:"导出私钥",onPress:this.goPage.bind(this, "ExportPrivateKey")},
      {name:"导出Keystore",onPress:this.goPage.bind(this, "ExportKeystore")},
      {name:"扫描二维码",onPress:this.goPage.bind(this, "scanQR")},
      {name:"AES加解密",onPress:this.goPage.bind(this, "aesTEST")},
      {name:"密钥恢复",onPress:this.goPage.bind(this, "Test")}
    ];
  }
  componentWillUnmount(){
    //结束页面前，资源释放操作
    super.componentWillUnmount();
    
  }
  goPage(key, data = {}){
    const { navigate } = this.props.navigation;
    if(key=="share"){
      if(this.props.loginUser){
        navigate('Share',{});
      }else{
        navigate('Login', {});
        EasyToast.show('请登陆');
      }
    }else if(key=='set'){
      navigate('Set', {});
    }else if(key=='CreateWallet'){
      navigate('CreateWallet', {});
    }else if(key=='BackupWord'){
      navigate('BackupWord', {});
    }else if(key=='ImportKey'){
      navigate('ImportKey', {});
    }else if(key=='WalletManage'){
      navigate('WalletManage', {});
    }else if(key=='aesTEST'){
      navigate('aesTEST', {});
    }else if(key=='ModifyPassword'){
      navigate('ModifyPassword', {});
    }else if(key=='ExportPrivateKey'){
      navigate('ExportPrivateKey', {});
    }else if(key=='ExportKeystore'){
      navigate('ExportKeystore', {});
    }else if(key=='scanQR'){
      navigate('scanQR', {});
    }else if(key=='BackupNote'){
      navigate('BackupNote', {});
    }else{
      EasyDialog.show("温馨提示","该功能正在紧急开发中，敬请期待！","知道了",null,()=>{EasyDialog.dismis()});
    }
  }

  _renderListItem(){
    return this.config.map((item, i) => {
      return (<Item key={i} {...item}/>)
    })
  }

  goProfile(){
    if(this.props.loginUser){
      return;
    }
    const { navigate } = this.props.navigation;
    navigate('Login', {});
  }

  render() {
    return <View style={styles.container}>
        

     {/* <Text style={styles.header}>我的</Text> */}
     <ScrollView style={styles.scrollView}>
        <View>
          {/* <Button onPress={this.goProfile.bind(this)}>
            <View style={styles.userHead}>
              <View style={{flex:1,flexDirection:"row",alignItems: "center",paddingVertical:15}}>
                <Image source={UImage.logo} style={{width:42,height:52}}/>
                <Text style={{color:UColor.fontColor,fontSize:17,marginLeft:15}}>{(this.props.loginUser)?this.props.loginUser.nickname:"登陆"}</Text>
              </View>
              {
                (this.props.loginUser)?null:<Icon name="ios-arrow-forward-outline" size={16} color={UColor.arrow} />
              }
              
            </View>
          </Button> */}
          {/* <Button style={{marginTop:15}}>
            <View style={{flex:1,flexDirection:"row",paddingHorizontal: 20, backgroundColor: UColor.mainColor,justifyContent:'space-between'}}>
              <View style={{flex:1,flexDirection:"column",paddingVertical:12}}>
                <Text style={{color:'#8696B0',fontSize:11}}>EOS资产</Text>
                <Text style={{color:UColor.fontColor,fontSize:15,marginTop:10}}>{(this.props.loginUser)?this.props.loginUser.eost:"0"} EOS</Text>
              </View>
              <View style={{flex:1,flexDirection:"row",alignSelf:'center',justifyContent:"flex-end"}}>
                {
                  this.props.loginUser && <Button onPress={()=>{EasyDialog.show("温馨提示","该功能正在紧急开发中，敬请期待！","知道了",null,()=>{EasyDialog.dismis()});}} style={{backgroundColor:'#65CAFF',borderRadius:5,paddingVertical: 5,paddingHorizontal:15}}>
                  <Text style={{fontSize:15,color:'#fff'}}>提币</Text>
                </Button>
                }
              </View>
            </View>
          </Button> */}
          <View>
              {this._renderListItem()}
          </View>
          <View style={{flex:1,marginTop:15,flexDirection:'column'}}>
            <Text style={{fontSize:10,color:'#8696B0',width:'100%',textAlign:'center'}}>© 2018 eostoken all rights reserved </Text>
            <Text style={{fontSize:10,color:'#8696B0',width:'100%',textAlign:'center',marginTop:5}}>EOS专业版钱包 V{DeviceInfo.getVersion()}</Text>
          </View>
        </View>
    </ScrollView>
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

  },
  userHead: {
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    paddingHorizontal: 20,
    backgroundColor: UColor.mainColor
  },
  header:{
    borderColor: UColor.secdColor,
    borderWidth: 0.6,
    paddingTop: (Platform.OS=='ios'?33:14),
    paddingBottom: 10,
    backgroundColor:UColor.mainColor,
    textAlign:"center",
    fontSize:18,
    fontWeight: 'normal',
    color:UColor.fontColor
  }
});

export default Setting;
