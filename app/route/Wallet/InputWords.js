import React from 'react';
import { connect } from 'react-redux'
import {Dimensions,DeviceEventEmitter,InteractionManager,ListView,StyleSheet,View,RefreshControl,Text,ScrollView,Image,Platform,StatusBar,TextInput} from 'react-native';
import {TabViewAnimated, TabBar, SceneMap} from 'react-native-tab-view';
import UColor from '../../utils/Colors'
import Button from  '../../components/Button'
import Item from '../../components/Item'
import Icon from 'react-native-vector-icons/Ionicons'
import UImage from '../../utils/Img'
import { EasyLoading } from '../../components/Loading';
import { EasyToast } from '../../components/Toast';
import BaseComponent from "../../components/BaseComponent";
var ScreenWidth = Dimensions.get('window').width;
@connect(({login}) => ({...login}))
class InputWords extends BaseComponent {

  static navigationOptions = {
    title: '助记词确认',
    headerStyle:{
        paddingTop:Platform.OS == 'ios' ? 30 : 20,
        backgroundColor: UColor.mainColor,
        borderBottomWidth:0,
    }    
  };

  constructor(props) {
    super(props);
    this.state = {
      select:[],
      world:["f1ds2fd","4f56ds","a12f3d","f4d5a6","f12dsa","r132s1f2","56dsa6f","89d89qw","452df2","5as34f","f5as4ff",]
    }
   
  }
  componentWillUnmount(){
    //结束页面前，资源释放操作
    super.componentWillUnmount();
    
  }
  logout = () =>{
    // if(this.props.loginUser){
    //   this.props.dispatch({type:'login/logout',payload:{},callback:()=>{
    //     this.props.navigation.goBack();
    //   }});
    // }else{
    //   const { navigate } = this.props.navigation;
    //   navigate('Login', {});
    // } 
  }
  _onPressButton() {
    
  }

  _world(){
    let arr = new Array();
    this.state.world.map((item)=>{
        arr.push(
            <Text onPress={()=>{this.add(item)}} style={{fontSize: 15, color:'#EFEFEF',padding:5,margin:5}}>{item}</Text>
        )
    });
    return arr;
}

_select(){
    let arr = new Array();
    this.state.select.map((item)=>{
        arr.push(
            <Text onPress={()=>{this.rem(item)}} style={{fontSize: 15, color:'#687999',paddingLeft:5,paddingRight:5,margin:5}}>{item}</Text>
        )
    });
    return arr;
}

add = (world) =>{
    let ws = this.state.world;
    let ss = this.state.select;
    //删除原来的
    ws.splice(ws.findIndex(item => item === world), 1);
    //添加选中的
    ss.push(world);
    this.setState({
        world:ws,
        select:ss
    });
}

rem = (world) =>{
    let ws = this.state.world;
    let ss = this.state.select;
    //删除原来的
    ss.splice(ss.findIndex(item => item === world), 1);
    //添加选中的
    ws.push(world);
    this.setState({
        world:ws,
        select:ss
    });
}


  render() {
    return <View style={styles.container}>
    

     <ScrollView style={styles.scrollView}>
                  {/* <View>
                    <View  style={{flexDirection:"row"}}>
                        {
                            this._select()
                        }
                    </View>
                    <View style={{flexDirection:"row"}}>
                        {
                            this._world()
                        }
                    </View>
                </View> */}
        <View>
          <Text  style={{color:'#FFFFFF',marginTop:30,marginLeft:10,fontSize:17}}>确认您的钱包助记词</Text>
          <Text  style={{color:'#8696B0',marginLeft:10}}>请按顺序点击助记词，以确认您的备份助记词正确</Text>
          <View style={{backgroundColor:'#586888',marginTop:40}} >
            <View style={{height:100,margin:10,backgroundColor:'#4F617D',flexDirection:'row',flexWrap:'wrap',}} >
                {this._select()}
            </View>
            <View style={{height:100,margin:10,flexDirection:'row',flexWrap:'wrap',}} >
               {this._world()}
                  {/* <Text onPress={this._onPressButton} style={{padding:10,}}>{this.props.navigation.state.params[0]}</Text>
                  <Text style={{padding:5,}}>{this.props.navigation.state.params[1]}</Text>
                  <Text style={{padding:5,}}>{this.props.navigation.state.params[2]}</Text>
                  <Text style={{padding:5,}}>{this.props.navigation.state.params[3]}</Text>
                  <Text style={{padding:5,}}>{this.props.navigation.state.params[4]}</Text>
                  <Text style={{padding:5,}}>{this.props.navigation.state.params[5]}</Text>
                  <Text style={{padding:5,}}>{this.props.navigation.state.params[6]}</Text>
                  <Text style={{padding:5,}}>{this.props.navigation.state.params[7]}</Text>
                  <Text style={{padding:5,}}>{this.props.navigation.state.params[8]}</Text>
                  <Text style={{padding:5,}}>{this.props.navigation.state.params[9]}</Text>
                  <Text style={{padding:5,}}>{this.props.navigation.state.params[10]}</Text>
                  <Text style={{padding:5,}}>{this.props.navigation.state.params[11]}</Text>
                  <Text style={{padding:5,}}>{this.props.navigation.state.params[12]}</Text>
                  <Text style={{padding:5,}}>{this.props.navigation.state.params[13]}</Text>
                  <Text style={{padding:5,}}>{this.props.navigation.state.params[14]}</Text> */}           
            </View>
          </View>
          <Button onPress={() => this.logout()}>
            <View style={{height:45,backgroundColor:'#65CAFF',justifyContent:'center',alignItems:'center',margin:20,borderRadius:5}}>
              <Text style={{fontSize:15,color:'#fff'}}>下一步</Text>
            </View>
          </Button>
        </View>
    </ScrollView>
  </View>
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection:'column',
    backgroundColor:'#586888',
    // backgroundColor: UColor.secdColor,
    
  },
  scrollView: {

  },
  
});

export default InputWords;
