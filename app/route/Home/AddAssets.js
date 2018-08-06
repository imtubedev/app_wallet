import React from 'react';
import { connect } from 'react-redux'
import {DeviceEventEmitter,ListView,StyleSheet,Image,ScrollView,View,RefreshControl,Text, TextInput,Platform,Dimensions,Modal,TouchableHighlight,Switch} from 'react-native';
import UColor from '../../utils/Colors'
import Button from  '../../components/Button'
import UImage from '../../utils/Img'
import { EasyDialog } from "../../components/Dialog"
import { EasyLoading } from '../../components/Loading';
import BaseComponent from "../../components/BaseComponent";

@connect(({wallet, assets}) => ({...wallet, ...assets}))
class AddAssets extends BaseComponent {
    static navigationOptions = ({ navigation }) => {
       
        return {                       
          headerTitle:'添加资产',
          headerStyle:{
                  paddingTop:Platform.OS == 'ios' ? 30 : 20,
                  backgroundColor: UColor.mainColor,
                  borderBottomWidth:0,
                },
          headerRight: (<Button name="search" onPress={navigation.state.params.onPress}>
            <View style={{ padding: 15 }}>
                <Image source={UImage.Magnifier} style={{ width: 30, height: 30 }}></Image>
            </View>
          </Button>),                  
        };
      };

  // 构造函数  
  constructor(props) { 
    super(props);
    this.props.navigation.setParams({ onPress: this._rightTopClick });
    this.state = {
      show:false,
      value: false,
      dataSource: new ListView.DataSource({ rowHasChanged: (row1, row2) => row1 !== row2 }),
      selectasset: null,
      isAdding: false,
    };
  }


  componentDidMount() {
    try {
      EasyLoading.show();
      DeviceEventEmitter.emit('stopBalanceTimer', "");
      this.props.dispatch({ type: 'assets/list', payload: { page: 1}, callback: () => {
        EasyLoading.dismis();
      } });
      this.props.dispatch({ type: 'assets/myAssetInfo'});
      DeviceEventEmitter.addListener('updateAssetList', (data) => {
        this.props.dispatch({ type: 'assets/list', payload: { page: 1} });
      });
    } catch (error) {
      EasyLoading.dismis();
    }

  }

  _rightTopClick = () =>{
    const { navigate } = this.props.navigation;
    navigate('AssetSearch', {});
  }

  componentWillUnmount(){
    DeviceEventEmitter.emit('updateMyAssets', '');
    DeviceEventEmitter.emit('startBalanceTimer', "");
    //结束页面前，资源释放操作
    super.componentWillUnmount();
  }

  onPress(action){
    EasyDialog.show("温馨提示","该功能正在紧急开发中，敬请期待!","知道了",null,()=>{EasyDialog.dismis()});
  }

  _rightButtonClick() {  
    this._setModalVisible();  
  }  

   // 显示/隐藏 modal  
   _setModalVisible() {  
    let isShow = this.state.show;  
    this.setState({  
      show:!isShow,  
    });  
  }  

  addAsset(asset, value) {
    if (this.props.defaultWallet == null || this.props.defaultWallet.account == null) {
      //todo 创建钱包引导
      EasyDialog.show("温馨提示", "您还没有创建钱包", "创建一个", "取消", () => {
        // EasyToast.show('创建钱包');
        this.createWallet();
        EasyDialog.dismis()
      }, () => { EasyDialog.dismis() });
      return;
    }

    EasyLoading.show();
    this.props.dispatch({ type: 'assets/addMyAsset', payload: {asset: asset, value: value}, callback: (data) => {
      this.setState({isAdding: false});
      EasyLoading.dismis();
    } });
  }

  isMyAsset(rowData){
    if(this.props.myAssets == null){
        return false;
    }
    
    if(this.state.selectasset != null && this.state.selectasset.name == rowData.name){
      if(this.state.value){
        return true;
      }else{
        return false;
      }
    }

    for(var i = 0; i < this.props.myAssets.length; i++){
        if(this.props.myAssets[i].asset.name == rowData.name ){
            return true;
        } 
    }

    return false;
 }
  
 render() {
        return (
            <View style={styles.container}>
                <ListView style={styles.tab} renderRow={this.renderRow} enableEmptySections={true} 
                  dataSource={this.state.dataSource.cloneWithRows(this.props.assetsList == null ? [] : this.props.assetsList)} 
                  renderRow={(rowData, sectionID, rowID) => (      
                  <View style={styles.listItem}>
                      <View style={styles.listInfo}>
                        <Image source={rowData.icon==null ? UImage.eos : { uri: rowData.icon }} style={{width: 28, height: 28, resizeMode: "cover", overflow:"hidden", borderRadius: 10, marginRight:10,}}/>
                        <View style={styles.scrollView}>
                          <Text style={styles.listInfoTitle}>{rowData.name}</Text>
                          <Text style={styles.quantity}>合约账户 : {rowData.contractAccount == null ? "" : rowData.contractAccount}</Text>
                        </View>
                        <View style={styles.listInfoRight}>
                          <Switch  tintColor={UColor.secdColor} onTintColor={UColor.tintColor} thumbTintColor="#ffffff"
                              value={this.isMyAsset(rowData)} onValueChange={(value)=>{
                                if(this.state.isAdding){
                                  return;
                                }
                                this.setState({isAdding: true});
                                this.setState({selectasset: rowData, value: value});
                                this.addAsset(rowData, value);
                              }}/>
                        </View>
                      </View>
                      
                  </View>
                  )}                
                /> 
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

    listItem: {
      backgroundColor: UColor.mainColor,
      flexDirection: "column",
      justifyContent: "flex-start",
      alignItems: "flex-start",
    },
   
    listInfo: {
      height: 60,
      flex: 1,
      paddingLeft: 16,
      paddingRight: 16,
      flexDirection: "row",
      alignItems: "center",
      
      borderTopWidth:1,
      borderTopColor: UColor.secdColor
    },
    scrollView: {
      flex: 1,
      paddingLeft: 10,
      // alignItems: "center",
      justifyContent: "center",
    },
    listInfoTitle: {
      color:UColor.fontColor, 
      fontSize:16
    },
    listInfoRight: {
      flexDirection: "row",
      alignItems: "center"
    },

    quantity: {
      fontSize: 14,
      color: UColor.arrow,
    },
   
})
export default AddAssets;