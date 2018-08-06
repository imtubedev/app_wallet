import React from 'react';
import { connect } from 'react-redux'
import {Dimensions,DeviceEventEmitter,InteractionManager,ListView,StyleSheet,View,RefreshControl,Text,ScrollView,Image,Platform,StatusBar,TextInput,KeyboardAvoidingView} from 'react-native';
import {TabViewAnimated, TabBar, SceneMap} from 'react-native-tab-view';
import UColor from '../../utils/Colors'
import Button from  '../../components/Button'
import Item from '../../components/Item'
import Icon from 'react-native-vector-icons/Ionicons'
import UImage from '../../utils/Img'
import { EasyLoading } from '../../components/Loading';
import { EasyToast } from '../../components/Toast';
import BaseComponent from "../../components/BaseComponent";
@connect(({login}) => ({...login}))
class Set extends BaseComponent {

  static navigationOptions = {
    title: '导出私钥'
  };

  constructor(props) {
    super(props);
  }
  
  componentWillUnmount(){
    //结束页面前，资源释放操作
    super.componentWillUnmount();
    
  }
  logout = () =>{
    if(this.props.loginUser){
      this.props.dispatch({type:'login/logout',payload:{},callback:()=>{
        this.props.navigation.goBack();
      }});
    }else{
      const { navigate } = this.props.navigation;
      navigate('Login', {});
    } 
  }

  render() {
    return <View style={styles.container}>
        

    <KeyboardAvoidingView behavior='position'>
      <ScrollView keyboardShouldPersistTaps="always">
        <TouchableOpacity activeOpacity={1.0} onPress={this.dismissKeyboardClick.bind(this)}>
          <View>
            <Text style={styles.welcome}>抄写下您的钱包助记词:</Text>
            <Text style={styles.welcome}>助记词用于恢复钱包或重置钱包密码，将它准确的抄写 到纸上，并存放在只有您知道的安全地方。</Text>
            {/* <Button onPress={() => this.logout()}>
              <View style={{height:45,backgroundColor:'#65CAFF',justifyContent:'center',alignItems:'center',margin:20,borderRadius:5}}>
                <Text style={{fontSize:15,color:'#fff'}}>{this.props.loginUser?"退出":"登陆"}</Text>
              </View>
            </Button> */}
            <View style={{backgroundColor:'#43536D'}}>
              <View style={{padding:20,height:80,backgroundColor:'#586888'}} >
                  {/* <Text style={{fontSize:12,color:'#8696B0'}}> 手机号</Text> */}
                  <TextInput ref={(ref) => this._lphone = ref} autoFocus={false} editable = {true} 
                  // value={this.state.loginPhone} 
                  returnKeyType="next" selectionColor="#65CAFF" style={{color:'#8696B0',fontSize:15,height:40,paddingLeft:2}} 
                  placeholderTextColor="#8696B0" placeholder="钱包名称" underlineColorAndroid="transparent" keyboardType="phone-pad" maxLength={11}
                  />
              </View>
              <View style={{height:0.5,backgroundColor:'#43536D',flex: 1,flexDirection: 'column',}}></View>
              <View style={{padding:20,height:80,backgroundColor:'#586888'}} >
                  {/* <Text style={{fontSize:12,color:'#8696B0'}}> 密码</Text> */}
                  <TextInput ref={(ref) => this._lpass = ref} autoFocus={false} editable = {true} 
                  // value={this.state.loginPwd} 
                  returnKeyType="go" selectionColor="#65CAFF" style={{color:'#8696B0',fontSize:15,height:40,paddingLeft:2}} placeholderTextColor="#8696B0" 
                  placeholder="密码"  underlineColorAndroid="transparent" secureTextEntry={true} maxLength={20}
                  // onSubmitEditing={() => this.loginKcaptrue()}
                  // onChangeText={(loginPwd) => this.setState({loginPwd})}
                  />
              </View>
            </View>
            <Button onPress={() => this.logout()}>
              <View style={{height:45,backgroundColor:'#65CAFF',justifyContent:'center',alignItems:'center',margin:20,borderRadius:5}}>
                {/* <Text style={{fontSize:15,color:'#fff'}}>{this.props.loginUser?"退出":"登陆"}</Text> */}
                <Text style={{fontSize:15,color:'#fff'}}>备份助记词</Text>
              </View>
            </Button>
            <Button onPress={() => this.logout()}>
              <View style={{height:45,backgroundColor:'#65CAFF',justifyContent:'center',alignItems:'center',margin:20,borderRadius:5}}>
                {/* <Text style={{fontSize:15,color:'#fff'}}>{this.props.loginUser?"退出":"登陆"}</Text> */}
                <Text style={{fontSize:15,color:'#fff'}}>删除钱包</Text>
              </View>
            </Button>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
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
  
});

export default Set;
