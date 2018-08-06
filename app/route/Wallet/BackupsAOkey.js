import React from 'react';
import { connect } from 'react-redux'
import {Easing,Animated,NativeModules,StatusBar,BackHandler,DeviceEventEmitter,InteractionManager,ListView,StyleSheet,Image,ScrollView,View,RefreshControl,Text, TextInput,Platform,Dimensions,Modal,TouchableOpacity,Switch,ImageBackground,ProgressViewIOS} from 'react-native';
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
import { EasyToast } from '../../components/Toast';
import { EasyDialog } from '../../components/Dialog';
import { EasyLoading } from '../../components/Loading';
import ViewShot from "react-native-view-shot";
import BaseComponent from "../../components/BaseComponent";
import {NavigationActions} from 'react-navigation';
import Constants from '../../utils/Constants'

var dismissKeyboard = require('dismissKeyboard');
var AES = require("crypto-js/aes");
var CryptoJS = require("crypto-js");
@connect(({wallet, login}) => ({...wallet, ...login}))
class BackupsAOkey extends BaseComponent {
      static navigationOptions = ({ navigation }) => {
       
        return {                       
          headerTitle:'备份私钥',
          headerStyle:{
                  paddingTop:Platform.OS == 'ios' ? 30 : 20,
                  backgroundColor: UColor.mainColor,
                  borderBottomWidth:0,
                },
          headerRight: (<Button  onPress={navigation.state.params.onPress}>  
                <Text style={{color: UColor.arrow, fontSize: 18,justifyContent: 'flex-end',paddingRight:15}}>跳过</Text>
          </Button>),                  
        };
      };

      _rightTopClick = () =>{
        var entry = this.props.navigation.state.params.entry;
        if(entry == "createWallet"){
            this.pop(2, true);
            return;
        }
        this.pop(3, true);
        // const { navigate } = this.props.navigation;
        // navigate('WalletManage', {});
      }

  // 构造函数  
  constructor(props) { 
    super(props);
    this.props.navigation.setParams({ onPress: this._rightTopClick });
    this.state = {
        password: "",
        ownerPk: '',
        activePk: '',
        txt_owner: '',
        txt_active: '',
        PromptOwner: '',
        PromptActtve: '',
        show: false,
    };
  }

  //组件加载完成
  componentDidMount() {
    var ownerPrivateKey = this.props.navigation.state.params.wallet.ownerPrivate;
    var bytes_words_owner = CryptoJS.AES.decrypt(ownerPrivateKey.toString(), this.props.navigation.state.params.password + this.props.navigation.state.params.wallet.salt);
    var plaintext_words_owner = bytes_words_owner.toString(CryptoJS.enc.Utf8);
    var activePrivateKey = this.props.navigation.state.params.wallet.activePrivate;
    var bytes_words_active = CryptoJS.AES.decrypt(activePrivateKey.toString(), this.props.navigation.state.params.password + this.props.navigation.state.params.wallet.salt);
    var plaintext_words_active = bytes_words_active.toString(CryptoJS.enc.Utf8);
    if (plaintext_words_owner.indexOf('eostoken') != - 1) {
        this.setState({
            txt_owner: plaintext_words_owner.substr(8, plaintext_words_owner.length),
            txt_active: plaintext_words_active.substr(8, plaintext_words_active.length),
        })
    }
  }

  componentWillUnmount(){
    //结束页面前，资源释放操作
    super.componentWillUnmount();
  }

  goToPayForActive(params){
    const { navigate } = this.props.navigation;
    navigate('ActivationAt', params);
  }

  activeWalletOnServer(){
    const { navigate } = this.props.navigation;
    let entry = this.props.navigation.state.params.entry;
    var wallet = this.props.navigation.state.params.wallet;
    let name = wallet.account;
    let owner = wallet.ownerPublic;
    let active = wallet.activePublic;

    try {
    EasyLoading.show('正在请求');
    //检测账号是否已经激活
    this.props.dispatch({
        type: "wallet/isExistAccountNameAndPublicKey", payload: {account_name: name, owner: owner, active: active}, callback:(result) =>{
            if(result.code == 0 && result.data == true){
                EasyLoading.dismis();
                wallet.isactived = true
                this.props.dispatch({type: 'wallet/activeWallet', wallet: wallet});
                //msg:success,data:true, code:0 账号已存在
                EasyDialog.show("恭喜激活成功", (<View>
                    <Text style={{fontSize: 20, color: UColor.showy, textAlign: 'center',}}>{name}</Text>
                    {/* <Text style={styles.inptpasstext}>您申请的账号已经被***激活成功</Text> */}
                </View>), "知道了", null,  () => {EasyDialog.dismis(), this.pop(3, true) });
            }else {
                EasyLoading.dismis();
                this.goToPayForActive({parameter:wallet, entry: entry});
            // this.props.dispatch({
            //     type: "login/fetchPoint", payload: { uid: Constants.uid }, callback:(data) =>{
            //       if (data.code == 403) {
            //         this.props.dispatch({
            //           type: 'login/logout', payload: {}, callback: () => {}
            //         });      
            //         EasyLoading.dismis();
            //         this.goToPayForActive({parameter:wallet, entry: "backupWallet"})
            //         return false;   
            //       }else if(data.code == 0){
            //         this.props.dispatch({
            //           type: 'wallet/createAccountService', payload: { username:name, owner: owner, active: active, isact:true}, callback: (data) => {
            //             EasyLoading.dismis();
            //             if (data.code == '0') {
            //               wallet.isactived = true
            //               this.props.dispatch({
            //                 type: 'wallet/activeWallet', wallet: wallet, callback: (data, error) => {
            //                   DeviceEventEmitter.emit('updateDefaultWallet');
            //                   if (error != null) {
            //                     this.goToPayForActive({parameter:wallet, entry: "backupWallet"})
            //                     return false;
            //                   } else {
            //                     EasyToast.show('激活账号成功');
            //                     return true;
            //                   }
            //                 }
            //               });
            //             }else{
            //               EasyLoading.dismis();
            //               this.goToPayForActive({parameter:wallet, entry: "backupWallet"})
            //               return false;
            //             }
            //           }
            //         });
            //       }else{
            //         EasyLoading.dismis();
            //         this.goToPayForActive({parameter:wallet, entry: "backupWallet"})
            //         return false;   
            //       }
            //     }
            //   });
            }
        }
    });
    } catch (error) {
      EasyLoading.dismis();
      this.goToPayForActive({parameter:wallet, entry: entry})
      return false;
    }
  
  }

  pop(nPage, immediate) {
    const action = NavigationActions.pop({
        n: nPage,
        immediate: immediate,
    });
    this.props.navigation.dispatch(action);

  }

  backupOK(){
    const { navigate } = this.props.navigation;
    // 将钱包备份状态修改为已备份
    var wallet = this.props.navigation.state.params.wallet;
    wallet.isBackups = true;
    this.props.dispatch({type: 'wallet/updateWallet', wallet: wallet, callback: () => {
        // 跳转至下一步
        if(wallet.isactived){
            // 已经激活，这时钱包为已激活已备份状态，则跳回至钱包管理页面
            this.pop(3, true);
        }else{
            // 未激活，这时钱包为已备份未激活状态，则开始激活账号流程
            this.activeWalletOnServer();
        }
    }});
  }

  backupConfirm() {
    if(this.state.txt_owner == ""){ // 由于导入私钥只导入active, 可能这里备份没有active私钥
        if(this.state.activePk == ""){
            EasyToast.show('请输入active私钥');
            return;
        }
        if(this.state.activePk != this.state.txt_active){
            this.setState({PromptActtve: '该私钥内容有误'})
            return;
        }

        if(this.state.activePk == this.state.txt_active ){
            this.backupOK();
            return;
        }
    }else{
        if (this.state.activePk == "") {
            EasyToast.show('请输入active私钥');
            return;
        }
        if (this.state.ownerPk == "") {
            EasyToast.show('请输入owner私钥');
            return;
        }
        if(this.state.activePk != this.state.txt_active){
            this.setState({PromptActtve: '该私钥内容有误'})
            return;
        }
        if(this.state.ownerPk != this.state.txt_owner){
            this.setState({PromptOwner: '该私钥内容有误'})
            return;
        }

        if(this.state.activePk == this.state.txt_active && this.state.ownerPk == this.state.txt_owner){
            this.backupOK();
            return;
        }
    }

    // const { navigate } = this.props.navigation;
    // navigate('ActivationAt', {});
  }

  intensity() {
    if (this.state.activePk == ""){
        this.state.PromptActtve = ''
    }
    if(this.state.ownerPk == ""){
        this.state.PromptOwner = ''
    }
  }

  dismissKeyboardClick() {
    dismissKeyboard();
  }


    render() {
        return (<View style={styles.container}>
                

        <ScrollView keyboardShouldPersistTaps="always">
            <TouchableOpacity activeOpacity={1.0} onPress={this.dismissKeyboardClick.bind(this)}>
                <View style={styles.header}>
                    <View style={styles.inptoutbg}>
                        <View style={styles.headout}>
                            <Text style={styles.inptitle}>确认你的钱包私钥</Text>
                            <Text style={styles.headtitle}>请填入你所抄写的私钥，确保你填入无误后，按下一步.</Text>
                        </View>  
                        {this.state.txt_active != ''&& 
                        <View style={styles.inptoutgo} >
                            <View style={styles.ionicout}>
                                <Text style={styles.inptitle}>Active私钥</Text>
                                <Text style={styles.prompttext}>{this.state.PromptActtve}</Text>
                            </View>
                            <TextInput ref={(ref) => this._lphone = ref} value={this.state.activePk} returnKeyType="next" editable={true}
                                selectionColor={UColor.tintColor} style={styles.inptgo} placeholderTextColor={UColor.arrow} autoFocus={false} 
                                onChangeText={(activePk) => this.setState({ activePk })}   keyboardType="default" onChange={this.intensity()} 
                                placeholder="输入active私钥" underlineColorAndroid="transparent"  multiline={true}  />
                        </View>
                        }
                         {this.state.txt_owner  != ''&&
                        <View style={styles.inptoutgo} >
                            <View style={styles.ionicout}>
                                <Text style={styles.inptitle}>Owner私钥</Text>
                                <Text style={styles.prompttext}>{this.state.PromptOwner}</Text>
                            </View>
                            <TextInput ref={(ref) => this._lphone = ref} value={this.state.ownerPk} returnKeyType="next" editable={true}
                                selectionColor={UColor.tintColor} style={styles.inptgo} placeholderTextColor={UColor.arrow} autoFocus={false} 
                                onChangeText={(ownerPk) => this.setState({ ownerPk })}   keyboardType="default" onChange={this.intensity()} 
                                placeholder="输入owner私钥" underlineColorAndroid="transparent"  multiline={true}  />
                        </View>}
                    </View>
                    <Button onPress={() => this.backupConfirm()}>
                        <View style={styles.importPriout}>
                            <Text style={styles.importPritext}>下一步</Text>
                        </View>
                    </Button>
                </View>
            </TouchableOpacity>
         </ScrollView> 
     </View>)
    }
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: UColor.secdColor,
    },
    scrollView: {

    },
    weltitle: {
        color: UColor.fontColor, 
        fontSize: 15, 
        marginTop: 15, 
        marginLeft: 10
    },
    welcome: {
        color: UColor.arrow,
        marginTop: 5, 
        marginLeft: 10, 
        marginBottom: 25
    },
    backupsout: {
        height: 45, 
        backgroundColor: UColor.tintColor, 
        justifyContent: 'center', 
        alignItems: 'center', 
        margin: 20, 
        borderRadius: 5 
    },
    backups:{
        fontSize: 15, 
        color: UColor.fontColor,
    },

    passoutsource: {
        flexDirection: 'column', 
        alignItems: 'center'
    },
    inptpass: {
        color: UColor.tintColor,
        height: 45,
        width: ScreenWidth -100,
        paddingBottom: 5,
        fontSize: 16,
        backgroundColor: UColor.fontColor,
        borderBottomColor: UColor.baseline,
        borderBottomWidth: 1,
    },

    header: {
        marginTop: 10,
        backgroundColor: UColor.secdColor,
    },
    headout: {
        paddingTop: 20,
        paddingBottom: 15,
    },
    headtitle: {
        color: UColor.arrow,
        fontSize: 14,
        lineHeight: 25,
    },
    inptoutbg: {
        backgroundColor: UColor.mainColor,
        paddingHorizontal: 20,
    },

    row: {
        flex: 1,
        backgroundColor: UColor.mainColor,
        flexDirection: "row",
        padding: 20,
        paddingTop: 10,
        justifyContent: "space-between",
    },
    left: {
        flex: 1,
        flexDirection: "column",
        backgroundColor: 'red'
    },
    right: {
        flex: 1,
        flexDirection: "column",
        backgroundColor: 'black'
    },
    incup: {
        fontSize: 12,
        color: UColor.fontColor,
        backgroundColor: '#F25C49',
        padding: 5,
        textAlign: 'center',
        marginLeft: 10,
        borderRadius: 5,
        minWidth: 60,
        maxHeight: 25
    },
    incdo: {
        fontSize: 12,
        color: UColor.fontColor,
        backgroundColor: '#25B36B',
        padding: 5,
        textAlign: 'center',
        marginLeft: 10,
        borderRadius: 5,
        minWidth: 60,
        maxHeight: 25
    },

    inptout: {
        paddingHorizontal: 15,
        borderBottomWidth: 1,
        backgroundColor: UColor.mainColor,
        borderBottomColor: UColor.secdColor,
    },
    inptitle: {
        flex: 1,
        fontSize: 15,
        lineHeight: 30,
        color: UColor.fontColor,
    },
    prompttext: {
        flex: 1,
        fontSize: 14,
        lineHeight: 30,
        textAlign: 'right',
        color: UColor.showy,
    },
    inpt: {
        height: 50,
        fontSize: 16,
        color: UColor.arrow,
    },
    inptoutgo: {
        paddingBottom: 15,
        backgroundColor: UColor.mainColor,
    },
    ionicout: {
        flexDirection: "row",
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    inptgo: {
        flex: 1,
        height: 60,
        fontSize: 14,
        lineHeight: 25,
        color: UColor.arrow,
        paddingHorizontal: 10,
        textAlignVertical: 'top',
        backgroundColor: UColor.secdColor,
    },

    readout: {
        justifyContent: 'center',
        alignItems: 'flex-end',
        paddingHorizontal: 10,
        marginTop: 10,
    },
    readtext: {
        fontSize: 15,
        color: UColor.tintColor,
    },



    servicetext: {
        fontSize: 14,
        color: UColor.tintColor,
    },

    importPriout: {
        height: 45,
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 20,
        marginTop: 50,
        borderRadius: 5,
        backgroundColor:  UColor.tintColor,
    },
    importPritext: {
        fontSize: 15,
        color: UColor.fontColor,
    },

    privatekeytext: {
        fontSize: 15,
        color: UColor.tintColor,
    },
    pupuo: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalStyle: {
        width: ScreenWidth - 20,
        backgroundColor: UColor.fontColor,
        borderRadius: 5,
        paddingHorizontal: 25,
    },
    subView: {
        flexDirection: "row",
        alignItems: 'center',
        justifyContent: 'center',
        height: 30,
        marginVertical: 15,
    },
    buttonView: {
        height: 50,
        marginVertical: 10,
        borderRadius: 6,
        backgroundColor: UColor.showy,
        justifyContent: 'center',
        alignItems: 'center'
    },
    buttoncols: {
        fontSize: 16,
        color: UColor.fontColor
    },
    titleText: {
        flex: 1,
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    titleout: {
        width: 40,
        color: '#CBCBCB',
        fontSize: 28,
        textAlign: 'center',
    },
    contentText: {
        fontSize: 14,
        color: UColor.showy,
        textAlign: 'left',
        marginVertical: 20,
    },
    // prompttext: {
    //     fontSize: 14,
    //     color: UColor.tintColor,
    //     marginHorizontal: 5,
    // },
    codeout: {
        flexDirection: "row",
        alignItems: 'center',
        justifyContent: 'flex-end',
    },
    copytext: {
        fontSize: 14,
        color: '#808080',
        textAlign: 'left'
    },

});
export default BackupsAOkey;