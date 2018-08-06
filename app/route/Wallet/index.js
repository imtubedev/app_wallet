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

@connect(({login}) => ({...login}))
class Set extends React.Component {

  static navigationOptions = {
    title: '建仓钱包'
  };

  constructor(props) {
    super(props);
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
    

     <ScrollView style={styles.scrollView}>
        <View>
        <Text style={{fontSize:15,color:'#fff'}}>{"重要声明。。。。。"}</Text>
          <Button onPress={() => this.logout()}>
            <View style={{height:45,backgroundColor:'#65CAFF',justifyContent:'center',alignItems:'center',margin:20,borderRadius:5}}>
              <Text style={{fontSize:15,color:'#fff'}}>{this.props.loginUser?"退出":"登陆"}</Text>
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
    backgroundColor: UColor.secdColor,
  },
  scrollView: {

  },
  
});

export default Set;
