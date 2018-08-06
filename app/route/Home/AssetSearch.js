import React from 'react';
import { connect } from 'react-redux'
import {NativeModules,StatusBar,BackHandler,DeviceEventEmitter,InteractionManager,ListView,StyleSheet,Image,ScrollView,View,RefreshControl,Text, TextInput,Platform,Dimensions,Modal,TouchableHighlight,Switch,TouchableOpacity  } from 'react-native';
import {TabViewAnimated, TabBar, SceneMap} from 'react-native-tab-view';
import store from 'react-native-simple-store';
import UColor from '../../utils/Colors'
import Button from  '../../components/Button'
import Item from '../../components/Item'
import Echarts from 'native-echarts'
import UImage from '../../utils/Img'
import QRCode from 'react-native-qrcode-svg';
const maxHeight = Dimensions.get('window').height;
import { EasyDialog } from "../../components/Dialog"
import { EasyToast } from '../../components/Toast';
import BaseComponent from "../../components/BaseComponent";

@connect(({assets}) => ({...assets}))
class Coin_search extends BaseComponent {

  static navigationOptions = {
    header:null,  //隐藏顶部导航栏
  };

  // 构造函数  
  constructor(props) { 
    super(props);
    this.props.navigation.setParams({ search: this._leftTopClick, cancel:this._rightTopClick  });
    this.state = {
      show:false,
      value: false,
      labelname: '',
      tokenname: '',
      address: '',
      dataSource: new ListView.DataSource({ rowHasChanged: (row1, row2) => row1 !== row2 }),
    };
  }


  componentDidMount() {
    this.props.dispatch({ type: 'assets/list', payload: { page: 1} });
  }

  _rightTopClick = () => {
    const {goBack} = this.props.navigation;
    goBack();
  }

  _leftTopClick =() => {
    if (this.state.labelname == "") {
      EasyToast.show('请输入token名称或合约地址');
      return;
    }
  }
  componentWillUnmount(){
    //结束页面前，资源释放操作
    super.componentWillUnmount();
    
  }
  // onBackAndroid = () => {
  //   if (cangoback) {
  //     let type = this.state.routes[this.state.index]
  //     let w = this.web[type.key];
  //     if (w) {
  //       w.goBack();
  //       return true;
  //     }
  //   }
  // }

  //获得typeid坐标
  getRouteIndex(typeId) {
    for (let i = 0; i < this.props.types.length; i++) {
      if (this.props.types[i].key == typeId) {
        return i;
      }
    }
  }

  getCurrentRoute() {
    return this.props.types[this.state.index];
  }

  //加载更多
  onEndReached(typeId) {
    pages[index] += 1;
    currentLoadMoreTypeId = typeId;
    const time = Date.parse(new Date()) / 1000;
    const index = this.getRouteIndex(typeId);
    if (time - loadMoreTime > 1) {
      pages[index] += 1;
      this.props.dispatch({ type: 'news/list', payload: { type: typeId, page: pages[index] } });
      loadMoreTime = Date.parse(new Date()) / 1000;
    }
  };

  //下拉刷新
  onRefresh = (typeId, refresh) => {
    this.props.dispatch({ type: 'news/list', payload: { type: typeId, page: 1, newsRefresh: refresh } });
    const index = this.getRouteIndex(typeId);
    if (index >= 0) {
      pages[index] = 1;
    }
  };

    

  onPress(action){
    EasyDialog.show("温馨提示","该功能正在紧急开发中，敬请期待！","知道了",null,()=>{EasyDialog.dismis()});
  }
  logout() {
    this._setModalVisible();  
  }

  
   // 显示/隐藏 modal  
   _setModalVisible() {  
    let isShow = this.state.show;  
    this.setState({  
      show:!isShow,  
    });  
  }  

  submit() {
    if (this.state.tokenname == "") {
      EasyToast.show('请输入token名称');
      return;
    }
    if (this.state.address == "") {
      EasyToast.show('请输入合约账户');
      return;
    }

    // EasyDialog.show();
    this.props.dispatch({ type: 'assets/submitAssetInfoToServer', payload: { contractAccount: this.state.address, name: this.state.tokenname }, callback: (data) => {
      if(data && data.code=='0'){
        EasyToast.show('添加成功');
        // this._setModalVisible();
      }else{
        EasyToast.show(data.msg);
      }
      // EasyDialog.dismis();
    } });
  }



    render() {
        return (
            <View style={styles.container}>
                
                  <View style={styles.header}>  
                    <TouchableOpacity onPress={this._leftTopClick.bind()}>  
                        <View style={styles.leftout} >
                            <Image source={UImage.Magnifier} style={styles.headleftimg}></Image>
                        </View>
                    </TouchableOpacity>  
                    <View style={styles.inptout} >
                        <TextInput ref={(ref) => this._raccount = ref} value={this.state.labelname} returnKeyType="go"
                            selectionColor={UColor.tintColor} style={styles.inpt} placeholderTextColor="#b3b3b3" 
                            placeholder="输入token名称或合约账户搜索" underlineColorAndroid="transparent" keyboardType="default"
                            onChangeText={(labelname) => this.setState({ labelname })}
                            />      
                    </View>     
                    <TouchableOpacity   onPress={this._rightTopClick.bind()}>  
                        <Text style={styles.canceltext}>取消</Text>
                    </TouchableOpacity>  
                </View> 

                <Text style={styles.prompttext}>提示：如果您没有搜索到您要找的Token，可以使用手动添加。</Text>
                <View style={styles.btnout}>
                    <Button onPress={() => this.logout()}>
                        <View style={styles.btnloginUser}>
                            <Text style={styles.btntext}>手动添加</Text>
                        </View>
                    </Button>
                </View>

                <View style={styles.pupuo}>
                  <Modal animationType='slide' transparent={true} visible={this.state.show} onShow={() => { }} onRequestClose={() => { }} >
                    <View style={styles.modalStyle}>
                      <View style={styles.subView} >
                        <Button style={styles.buttonView} onPress={this._setModalVisible.bind(this)}>
                          <Text style={styles.butclose}>×</Text>
                        </Button>
                        <Text style={styles.titleText}>手动添加</Text>
                        <View style={styles.passoutsource}>
                            <TextInput ref={(ref) => this._raccount = ref} value={this.state.tokenname}  returnKeyType="next" 
                                selectionColor={UColor.tintColor}  style={styles.inptpass}  placeholderTextColor="#b3b3b3" 
                                placeholder="输入Token名称" underlineColorAndroid="transparent" keyboardType="default"   
                                onChangeText={(tokenname) => this.setState({ tokenname })}/>
                                
                            <TextInput ref={(ref) => this._raccount = ref} value={this.state.address}   returnKeyType="go" 
                                selectionColor={UColor.tintColor}  style={styles.inptpass} placeholderTextColor="#b3b3b3" 
                                placeholder="输入合约账户" underlineColorAndroid="transparent"  keyboardType="default"  
                                onChangeText={(address) => this.setState({ address })}/>
                        </View>
                        <Button onPress={() => { this.submit() }}>
                          <View style={styles.copyout}>
                            <Text style={styles.copytext}>提交</Text>
                          </View>
                        </Button>
                      </View>
                    </View>
                  </Modal>
                </View>
            </View>
        )
    }
}
const styles = StyleSheet.create({
    container: {
      flex: 1,
      flexDirection:'column',
      backgroundColor: UColor.secdColor,
      paddingTop:5,
    },
    header: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      paddingTop:Platform.OS == 'ios' ? 30 : 20,
      paddingBottom: 5,
      backgroundColor: UColor.mainColor,
    },
    leftout: {
      paddingLeft: 15
    },
    headleftimg: {
      width: 30,
      height: 30
    },
    inptout: {
      flex: 1,
      paddingHorizontal: 20,
      justifyContent: 'center', 
    },
    inpt: {
        color: '#999999',
        fontSize: 14,
        height: 30,
        borderRadius: 5,
        paddingHorizontal: 10,
        backgroundColor: UColor.fontColor,
        paddingVertical: 0,
    },

    pupuo: {
      backgroundColor: '#ECECF0',
    },
    // modal的样式  
    modalStyle: {
      backgroundColor: UColor.mask,
      alignItems: 'center',
      justifyContent: 'center',
      flex: 1,
    },
    // modal上子View的样式  
    subView: {
      marginLeft: 10,
      marginRight: 10,
      backgroundColor: UColor.fontColor,
      alignSelf: 'stretch',
      justifyContent: 'center',
      borderRadius: 5,
      borderWidth: 0.5,
      borderColor: UColor.mask,
    },
     // 关闭按钮  
     buttonView: {
      alignItems: 'flex-end',
    },
    butclose: {
      width: 30,
      height: 30,
      marginBottom: 0,
      color: '#CBCBCB',
      fontSize: 28,
    },
    // 标题  
    titleText: {
      marginBottom: 5,
      fontSize: 18,
      fontWeight: 'bold',
      textAlign: 'center',
    },
    passoutsource: {
      flexDirection: 'column', 
      alignItems: 'center',
      padding: 10,
      
    },
    inptpass: {
        color: UColor.tintColor,
        height: 45,
        width: '100%',
        paddingHorizontal: 15,
        marginVertical: 10,
        fontSize: 16,
        backgroundColor: '#f3f3f3',
    },
    copyout: {
      margin: 10, 
      height: 45, 
      borderRadius: 3, 
      backgroundColor: UColor.tintColor, 
      justifyContent: 'center', 
      alignItems: 'center' 
    },
    copytext: {
      fontSize: 16, 
      color: UColor.fontColor,
    },
  
    tab1:{
      flex:1,
    },
    tab2:{
      flex:1,
      flexDirection: 'column',
    }, 
    
    canceltext: {
      color: UColor.arrow,
      fontSize: 18,
      justifyContent: 'flex-end',
      paddingRight: 15
    },
    prompttext: {
      fontSize: 15,
      color: UColor.arrow,
      lineHeight: 30,
      padding: 30,
    },
    btnout: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    btnloginUser: {
      width: 150,
      height: 45,
      backgroundColor: UColor.tintColor,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 5
    },
    btntext: {
      fontSize:17,
      color: UColor.fontColor,
    },
})
export default Coin_search;