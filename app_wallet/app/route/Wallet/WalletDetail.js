import React from 'react';
import { connect } from 'react-redux'
import { Dimensions, DeviceEventEmitter, InteractionManager, ListView, StyleSheet, View, RefreshControl, Clipboard, Text, ScrollView, Image, Platform, StatusBar, TextInput, Modal } from 'react-native';
import { TabViewAnimated, TabBar, SceneMap } from 'react-native-tab-view';
import UColor from '../../utils/Colors'
import Button from '../../components/Button'
import Item from '../../components/Item'
import Icon from 'react-native-vector-icons/Ionicons'
import UImage from '../../utils/Img'
import Constants from '../../utils/Constants'
import { EasyLoading } from '../../components/Loading';
import { EasyToast } from '../../components/Toast';
import { EasyDialog } from '../../components/Dialog';
import JPushModule from 'jpush-react-native';
import Ionicons from 'react-native-vector-icons/Ionicons'
import BaseComponent from "../../components/BaseComponent";
const maxWidth = Dimensions.get('window').width;
var AES = require("crypto-js/aes");
var CryptoJS = require("crypto-js");

@connect(({ wallet, login }) => ({ ...wallet, ...login }))
class WalletDetail extends BaseComponent {
  static navigationOptions = ({ navigation }) => {
    const params = navigation.state.params || {};
    return {
      headerTitle: params.data.name,
      headerStyle: {
        paddingTop:Platform.OS == 'ios' ? 30 : 20,
        backgroundColor: UColor.mainColor,
        borderBottomWidth:0,
      },

    };
  };


  constructor(props) {
    super(props);
    this.config = [
      { avatar:UImage.lock, first: true, name: "修改密码", onPress: this.goPage.bind(this, "ModifyPassword") },
      { avatar:UImage.privatekey, first: true, name: "备份私钥", onPress: this.goPage.bind(this, "ExportPrivateKey") },
      { avatar:UImage.publickey, name: "导出公钥", onPress: this.goPage.bind(this, "ExportPublicKey") },
      { avatar:UImage.resources_f, name: "资源管理", onPress: this.goPage.bind(this, "Resources") },
      { avatar:UImage.details, first: true, name: "账户详细信息", onPress: this.goPage.bind(this, "SeeBlockBrowser") },
    ];
    this.state = {
      password: '',
      show: false,
      txt_owner: '',
      txt_active: '',
      integral: 0,
      accumulative: 0,
    }
    DeviceEventEmitter.addListener('modify_password', () => {
      this.props.navigation.goBack();
    });
  }

    //组件加载完成
    componentDidMount() {
      this.props.dispatch({ type: 'wallet/getintegral', payload:{},callback: (data) => { 
        this.setState({integral: data.data});
      } });
    }
    componentWillUnmount(){
      //结束页面前，资源释放操作
      super.componentWillUnmount();
      
    }
  _rightButtonClick() {
    //   console.log('右侧按钮点击了');  
    this._setModalVisible();
  }

  // 显示/隐藏 modal  
  _setModalVisible() {
    let isShow = this.state.show;
    this.setState({
      show: !isShow,
    });
  }

  goPage(key, data) {
    const { navigate } = this.props.navigation;
    if (key == 'ExportPrivateKey') {
      const view =
        <View style={styles.passoutsource}>
          <TextInput autoFocus={true} onChangeText={(password) => this.setState({ password })} returnKeyType="go" 
            selectionColor={UColor.tintColor} secureTextEntry={true}  keyboardType="ascii-capable"  style={styles.inptpass} maxLength={Constants.PWD_MAX_LENGTH}
            placeholderTextColor={UColor.arrow}  placeholder="请输入密码"  underlineColorAndroid="transparent" />
        </View>
      EasyDialog.show("密码", view, "确定", "取消", () => {
        if (this.state.password == "" || this.state.password.length < Constants.PWD_MIN_LENGTH) {
          EasyToast.show('密码长度至少4位,请重输');
          return;
        }
        try {
          var ownerPrivateKey = this.props.navigation.state.params.data.ownerPrivate;
          var bytes_words_owner = CryptoJS.AES.decrypt(ownerPrivateKey.toString(), this.state.password + this.props.navigation.state.params.data.salt);
          var plaintext_words_owner = bytes_words_owner.toString(CryptoJS.enc.Utf8);
          var activePrivateKey = this.props.navigation.state.params.data.activePrivate;
          var bytes_words_active = CryptoJS.AES.decrypt(activePrivateKey.toString(), this.state.password + this.props.navigation.state.params.data.salt);
          var plaintext_words_active = bytes_words_active.toString(CryptoJS.enc.Utf8);
          if (plaintext_words_owner.indexOf('eostoken') != - 1) {
            plaintext_words_active = plaintext_words_active.substr(8, plaintext_words_active.length);
            plaintext_words_owner = plaintext_words_owner.substr(8, plaintext_words_owner.length);
            // this.setState({
            //   txt_active: plaintext_words_active,
            //   txt_owner: plaintext_words_owner
            // });
            // this._setModalVisible();
            // alert('解锁成功' + plaintext_words);
            // this.toBackup(wordsArr);
            navigate('BackupsPkey', { wallet: this.props.navigation.state.params.data, password:this.state.password, entry: "walletDetails"});
          } else {
            EasyToast.show('您输入的密码不正确');
          }
        } catch (error) {
          EasyToast.show('您输入的密码不正确');
        }
        EasyDialog.dismis();
      }, () => { EasyDialog.dismis() });
    } else if(key == 'ExportPublicKey') {
      navigate('ExportPublicKey', { ownerPublicKey: this.props.navigation.state.params.data.ownerPublic, activePublicKey:this.props.navigation.state.params.data.activePublic});
    } else if (key == 'ModifyPassword') {
      navigate('ModifyPassword', this.props.navigation.state.params.data);
    } else if (key == 'Resources') {
      navigate('Resources', {account_name:this.props.navigation.state.params.data.name});
    } else if(key == 'SeeBlockBrowser'){
      if(this.props.navigation.state.params.data.isactived){
        this.setState({ show: true,})
      }else{
        EasyToast.show("该账号还没激活，激活之后才能查看详细信息")
      }
    }else{

    }
  }
 
  eospark() {
    EasyDialog.dismis()
    const { navigate } = this.props.navigation;
    navigate('Web', { title: "区块浏览器", url: "https://eospark.com/MainNet/account/" + this.props.navigation.state.params.data.name});
  }

  eoseco() {
    EasyDialog.dismis()
    const { navigate } = this.props.navigation;
    navigate('Web', { title: "区块浏览器", url: "https://eoseco.com/accounts/" + this.props.navigation.state.params.data.name});
  }

  eosmonitor() {
    EasyDialog.dismis()
    const { navigate } = this.props.navigation;
    navigate('Web', { title: "区块浏览器", url: "https://eosmonitor.io/accounts/" + this.props.navigation.state.params.data.name});
  }

  eostracker() {
    EasyDialog.dismis()
    const { navigate } = this.props.navigation;
    navigate('Web', { title: "区块浏览器", url: "https://eostracker.io/accounts/" + this.props.navigation.state.params.data.name});
  }

  importWallet() {
    const { navigate, goBack } = this.props.navigation;
    navigate('ImportKey', this.props.navigation.state.params.data);
  }

  copy() {
    let isShow = this.state.show;
    this.setState({
      show: !isShow,
    });
    Clipboard.setString('OwnerPrivateKey: ' + this.state.txt_owner + "\n" + 'ActivePrivateKey: ' + this.state.txt_active);
    EasyToast.show("复制成功")
  }

  deleteWarning(c,data){
    EasyDialog.show("免责声明",  (<View>
      <Text style={{color: UColor.arrow,fontSize: 14,}}>删除过程中会检测您的账号是否已激活，如果您没有备份私钥，删除后将无法找回！请确保该账号不再使用后再删除！</Text>
    </View>),"下一步","返回钱包",  () => {
      EasyDialog.dismis();
      EasyLoading.show();
       //检测账号是否已经激活
      this.props.dispatch({
          type: "wallet/isExistAccountNameAndPublicKey", payload: {account_name: c.name, owner: c.ownerPublic, active: c.activePublic}, callback:(result) =>{
            EasyLoading.dismis();
            if(result.code == 0 && result.data == true){
            //msg:success,data:true, code:0 账号已存在
              EasyDialog.show("免责声明",  (<View>
                <Text style={{color: UColor.arrow,fontSize: 14,}}>系统检测到该账号<Text style={{color: UColor.showy,fontSize: 15,}}>已经激活</Text>！如果执意删除请先导出私钥并保存好，否则删除后无法找回</Text>
              </View>),"执意删除","返回钱包",  () => {
                  this.deleteWallet();
                  EasyDialog.dismis()
              }, () => { EasyDialog.dismis() });
            }else if(result.code == 521){
                //msg:账号不存在,data:null,code:521
              EasyDialog.show("免责声明",  (<View>
                <Text style={{color: UColor.arrow,fontSize: 14,}}>系统检测到该账号还没激活，如果你不打算激活此账号，我们建议删除。</Text>
              </View>),"删除","取消",  () => {
                  this.deletionDirect();
                  EasyDialog.dismis()
              }, () => { EasyDialog.dismis() });
            }else {
              EasyDialog.show("免责声明",  (<View>
                <Text style={{color: UColor.arrow,fontSize: 14,}}>网络异常, 暂不能检测到账号是否已经激活, 建议暂不删除此账号, 如果执意删除请先导出私钥并保存好，否则删除后无法找回。</Text>
              </View>),"执意删除","取消",  () => {
                  this.deletionDirect();
                  EasyDialog.dismis()
              }, () => { EasyDialog.dismis() });
            }
          }
      })
    }, () => { EasyDialog.dismis() });
  }

  deleteAccount(c,data){
    if(!c.isactived || !c.hasOwnProperty('isactived'))
    {
      //未激活
      this.deleteWarning(c,data);
    }
    else{
      //msg:success,data:true, code:0 账号已存在
      EasyDialog.show("免责声明",  (<View>
       <Text style={{color: UColor.arrow,fontSize: 14,}}>系统检测到该账号<Text style={{color: UColor.showy,fontSize: 15,}}>已经激活</Text>！如果执意删除请先导出私钥并保存好，否则删除后无法找回</Text>
     </View>),"执意删除","返回钱包",  () => {
         this.deleteWallet();
         EasyDialog.dismis()
     }, () => { EasyDialog.dismis() });
    }
  
  }

  //未激活账号直接删除
  deletionDirect() {
    EasyDialog.dismis();
    var data = this.props.navigation.state.params.data;
    this.props.dispatch({ type: 'wallet/delWallet', payload: { data } });
    //删除tags
    JPushModule.deleteTags([data.name],map => {
      if (map.errorCode === 0) {
        console.log('Delete tags succeed, tags: ' + map.tags)
      } else {
        console.log(map)
        console.log('Delete tags failed, error code: ' + map.errorCode)
      }
    });
    DeviceEventEmitter.addListener('delete_wallet', (tab) => {
      this.props.navigation.goBack();
    });
  }

  //已激活账号需要验证密码
  deleteWallet() {
    EasyDialog.dismis();
    const view =
      <View style={styles.passoutsource}>
        <TextInput autoFocus={true} onChangeText={(password) => this.setState({ password })} returnKeyType="go" 
          selectionColor={UColor.tintColor} secureTextEntry={true}  keyboardType="ascii-capable"  style={styles.inptpass} maxLength={Constants.PWD_MAX_LENGTH}
          placeholderTextColor={UColor.arrow}  placeholder="请输入密码"  underlineColorAndroid="transparent" />
      </View>
    EasyDialog.show("密码", view, "确定", "取消", () => {
      if (this.state.password == "" || this.state.password.length < Constants.PWD_MIN_LENGTH) {
        EasyToast.show('密码长度至少4位,请重输');
        return;
      }
      try {
        var data = this.props.navigation.state.params.data;
        var ownerPrivateKey = this.props.navigation.state.params.data.ownerPrivate;
        var bytes_words = CryptoJS.AES.decrypt(ownerPrivateKey.toString(), this.state.password + this.props.navigation.state.params.data.salt);
        var plaintext_words = bytes_words.toString(CryptoJS.enc.Utf8);
        if (plaintext_words.indexOf('eostoken') != - 1) {
          plaintext_words = plaintext_words.substr(8, plaintext_words.length);
          const { dispatch } = this.props;
          this.props.dispatch({ type: 'wallet/delWallet', payload: { data } });
          //删除tags
          JPushModule.deleteTags([data.name],map => {
            if (map.errorCode === 0) {
              console.log('Delete tags succeed, tags: ' + map.tags)
            } else {
              console.log(map)
              console.log('Delete tags failed, error code: ' + map.errorCode)
            }
          });
          DeviceEventEmitter.addListener('delete_wallet', (tab) => {
            this.props.navigation.goBack();
          });
        } else {
          EasyToast.show('您输入的密码不正确');
        }
      } catch (error) {
        EasyToast.show('您输入的密码不正确');
      }
      EasyDialog.dismis();
    }, () => { EasyDialog.dismis() });
  }

  activeWalletOnServer(){
    const { navigate } = this.props.navigation;
    let wallet = this.props.navigation.state.params.data
    let name = wallet.account;
    let owner = wallet.ownerPublic;
    let active = wallet.activePublic;
    try {
      EasyLoading.show('正在请求');
      //检测账号是否已经激活
      this.props.dispatch({
        type: "wallet/isExistAccountNameAndPublicKey", payload: {account_name: name, owner: owner, active: active}, callback:(result) =>{
          EasyLoading.dismis();
            if(result.code == 0 && result.data == true){
                wallet.isactived = true
                this.props.dispatch({type: 'wallet/activeWallet', wallet: wallet});
                //msg:success,data:true, code:0 账号已存在
                EasyDialog.show("恭喜激活成功", (<View>
                    <Text style={{fontSize: 20, color: UColor.showy, textAlign: 'center',}}>{name}</Text>
                    {/* <Text style={styles.inptpasstext}>您申请的账号已经被***激活成功</Text> */}
                </View>), "知道了", null,  () => { EasyDialog.dismis() });
            }else if(result.code == 500){ // 网络异常
              EasyToast.show(result.msg);
            }else if(result.code == 515){
              EasyToast.show("账号已被别人占用，请换个账号吧！");
            }else{
              navigate('ActivationAt', {parameter:wallet, entry: "activeWallet"});

              // this.props.dispatch({
              //   type: "login/fetchPoint", payload: { uid: Constants.uid }, callback:(data) =>{
              //     if (data.code == 403) {
              //       this.props.dispatch({
              //         type: 'login/logout', payload: {}, callback: () => {}
              //       });      
              //       EasyLoading.dismis();
              //       navigate('ActivationAt', {parameter:wallet});
              //       return false;   
              //     }else if(data.code == 0){
              //       this.props.dispatch({
              //         type: 'wallet/createAccountService', payload: { username: name, owner: owner, active: active, isact:true}, callback: (data) => {
              //           EasyLoading.dismis();
              //           if (data.code == '0') {
              //             wallet.isactived = true
              //             this.props.dispatch({
              //               type: 'wallet/activeWallet', wallet: wallet, callback: (data, error) => {
              //                 DeviceEventEmitter.emit('updateDefaultWallet');
              //                 if (error != null) {
              //                   navigate('ActivationAt', {parameter:wallet});
              //                   return false;
              //                 } else {
              //                   EasyDialog.show("创建账号成功", (<View>
              //                     <Text style={{fontSize: 20, color: UColor.showy, textAlign: 'center',}}>{name}</Text>
              //                     <Text style={{fontSize: 16, color: '#808080',}}>恭喜！您的EosToken账号积分获得免费创建账号权益，该账号已完成激活，建议您在使用转账功能时先小额尝试，成功后再正常使用钱包。</Text>
              //                 </View>), "确认", null,  () => { EasyDialog.dismis() });
              //                   return true;
              //                 }
              //               }
              //             });
              //           }else{
              //             EasyLoading.dismis();
              //             navigate('ActivationAt', {parameter:wallet});
              //             return false;
              //           }
              //         }
              //       });
              //     }else{
              //       EasyLoading.dismis();
              //       navigate('ActivationAt', {parameter:wallet});
              //       return false;   
              //     }
              //   }
              // });
            }
        }
    });
    } catch (error) {
      EasyLoading.dismis();
      navigate('ActivationAt', {parameter:wallet});
      return false;
    }
  
  }

  activeWallet(data) {
    const { navigate } = this.props.navigation;
    if(data.name.length != 12){
      EasyToast.show('该账号格式无效，无法进行激活！');
    }else{
      // 通过后台激活账号
      this.activeWalletOnServer();
    }
  }

  prot(data = {}, key){
    const { navigate } = this.props.navigation;
    if (key == 'Explain') {
      EasyDialog.dismis()
    navigate('Web', { title: "积分说明", url: "http://static.eostoken.im/html/20180703/1530587725565.html" });
    }else  if (key == 'EOS-TOKEN') {
      EasyDialog.dismis()
      navigate('AssistantQrcode', key);
    }
  }

  backupWords() {
    const view =
      <View style={styles.passoutsource}>
        <TextInput autoFocus={true} onChangeText={(password) => this.setState({ password })} returnKeyType="go" 
          selectionColor={UColor.tintColor} secureTextEntry={true}  keyboardType="ascii-capable"  style={styles.inptpass} maxLength={Constants.PWD_MAX_LENGTH}
          placeholderTextColor={UColor.arrow}  placeholder="请输入密码"  underlineColorAndroid="transparent"/>
      </View>

    EasyDialog.show("密码", view, "备份", "取消", () => {

      if (this.state.password == "" || this.state.password.length < Constants.PWD_MIN_LENGTH) {
        EasyToast.show('密码长度至少4位,请重输');
        return;
      }

      try {
        var _words = this.props.navigation.state.params.data.words;
        var bytes_words = CryptoJS.AES.decrypt(_words.toString(), this.state.password + this.props.navigation.state.params.data.salt);
        var plaintext_words = bytes_words.toString(CryptoJS.enc.Utf8);

        var words_active = this.props.navigation.state.params.data.words_active;
        var bytes_words = CryptoJS.AES.decrypt(words_active.toString(), this.state.password + this.props.navigation.state.params.data.salt);
        var plaintext_words_active = bytes_words.toString(CryptoJS.enc.Utf8);

        if (plaintext_words.indexOf('eostoken') != -1) {
          plaintext_words = plaintext_words.substr(9, plaintext_words.length);
          var wordsArr = plaintext_words.split(',');

          plaintext_words_active = plaintext_words_active.substr(9, plaintext_words_active.length);
          var wordsArr_active = plaintext_words_active.split(',');

          this.toBackup({ words_owner: wordsArr, words_active: wordsArr_active });
        } else {
          EasyToast.show('您输入的密码不正确');
        }
      } catch (error) {
        EasyToast.show('您输入的密码不正确');
      }
      EasyDialog.dismis();
    }, () => { EasyDialog.dismis() });
  }

  toBackup = (words) => {
    this.props.navigation.goBack();
    const { navigate } = this.props.navigation;
    navigate('BackupWords', { words_owner: words.words_owner, words_active: words.words_active, wallet: this.props.navigation.state.params });
  }

  _renderListItem() {
    return this.config.map((item, i) => {
      return (<Item key={i} {...item} />)
    })
  }
  
  copyname(c) {
    Clipboard.setString(c.name);
    EasyToast.show('账号复制成功');
  }

  render() {
    const c = this.props.navigation.state.params.data
    const balance = this.props.navigation.state.params.balance
    return <View style={styles.container}>
        

      <ScrollView style={styles.scrollView}>
        <View>
          <View style={styles.walletout}>
            <View style={styles.accountout} >
              <Text style={styles.accounttext}>{c.isactived && c.balance != null && c.balance != ""? c.balance : balance}</Text>
               <Text style={styles.company}> EOS</Text>
            </View>
            <View style={styles.topout}>
              <Text style={styles.category}>账户名称：</Text>
                <Button onPress={this.copyname.bind(this,c)} underlayColor={UColor.mainColor}>
                  <View style={{flexDirection: "row",}}>
                    <Text style={styles.outname}>{c.name}</Text>
                    <Image source={UImage.copy} style={styles.imgBtn} />
                  </View>
                </Button>
              {(!c.isactived || !c.hasOwnProperty('isactived')) ? <View style={styles.notactivedout}><Text style={styles.notactived}>未激活</Text></View>:(c.isBackups ? null : <View style={styles.stopoutBackupsout}><Text style={styles.stopoutBackups}>未备份</Text></View>) }   
            </View>
          </View>
          <View style={{ marginBottom: 50 }}>{this._renderListItem()}</View>
          {/* <Button onPress={() => this.backupWords()} style={{ flex: 1 }}>
            <View style={{ height: 45, backgroundColor: '#65CAFF', justifyContent: 'center', alignItems: 'center', margin: 20, borderRadius: 5 }}>
              <Text style={{ fontSize: 15, color: '#fff' }}>备份助记词</Text>b
            </View>
          </Button> */}
          {(!c.isactived || !c.hasOwnProperty('isactived')) ? 
          <Button onPress={this.activeWallet.bind(this, c)} style={{ flex: 1 }}>
            <View style={styles.acttiveout}>
              <Text style={styles.delete}>激活账户</Text>
            </View>
          </Button>
          :null
          }
          <Button onPress={this.deleteAccount.bind(this, c)} style={{ flex: 1 }}>
            <View style={styles.deleteout}>
              <Text style={styles.delete}>删除账户</Text>
            </View>
          </Button>

        </View>
      </ScrollView>
      <View style={styles.pupuo}>
        <Modal animationType='slide' transparent={true} visible={this.state.show} onShow={() => { }} onRequestClose={() => { }} >
          <View style={styles.modalStyle}>
            <View style={styles.subView} >
              <Button style={{ alignItems: 'flex-end',}} onPress={this._setModalVisible.bind(this)}>
                <View style={styles.closeText}>
                    <Ionicons style={{ color: '#CBCBCB'}} name="ios-close-outline" size={28} />
                </View>
              </Button>
              <View style={{paddingHorizontal: 11, paddingVertical: 15,  marginBottom: 18, marginHorizontal: 40, flexDirection: "row",borderColor: UColor.tintColor, borderWidth: 1,borderRadius: 5,}}>
                <Text style={{flex: 1, fontSize: 20, color: UColor.mainColor}}>eospark.com</Text>
                <Button onPress={() => { this.eospark() }}>
                  <View style={{ width: 64, height: 30, borderRadius: 5, backgroundColor:  UColor.tintColor, justifyContent: 'center', alignItems: 'center'}}>
                    <Text style={styles.buttonText}>查看</Text>
                  </View>
                </Button>
              </View>
              <View style={{paddingHorizontal: 11, paddingVertical: 15, marginBottom: 34, marginHorizontal: 40, flexDirection: "row",borderColor: UColor.tintColor, borderWidth: 1,borderRadius: 5, }}>
                <Text style={{flex: 1, fontSize: 20, color: UColor.mainColor}}>eoseco.com</Text>
                <Button onPress={() => { this.eoseco() }}>
                  <View style={{ width: 64, height: 30, borderRadius: 5, backgroundColor:  UColor.tintColor, justifyContent: 'center', alignItems: 'center'}}>
                    <Text style={styles.buttonText}>查看</Text>
                  </View>
                </Button>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </View>
  }
}

const styles = StyleSheet.create({
  inptpasstext: {
    fontSize: 12,
    color: UColor.arrow,
    marginBottom: 15,
    lineHeight: 20,
  },
  Becarefultext: {
     color: UColor.showy,
     fontSize: 12,
  },
  linkout: {
    flexDirection: 'row',
    paddingTop: 20,
    justifyContent: 'flex-end'
  },
  linktext: {
    paddingLeft: 15,
    color: UColor.tintColor,
    fontSize: 14,
  },


  passoutsource: {
    flexDirection: 'column', 
    alignItems: 'center'
  },
  inptpass: {
    color: UColor.tintColor,
    width: maxWidth-100,
    height: 45,
    paddingBottom: 5,
    fontSize: 16,
    backgroundColor: UColor.fontColor,
    borderBottomColor: UColor.baseline,
    borderBottomWidth: 1,
  },

  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: UColor.secdColor,
  },
  walletout: { 
    padding: 20, 
    height: 120, 
    backgroundColor:  UColor.mainColor, 
    margin: 10, 
    borderRadius: 5, 
  },
  accountout: { 
    flexDirection: "row",
    justifyContent: 'center', 
    alignItems: 'center', 
  },
  accounttext: { 
    fontSize: 24, 
    color: UColor.fontColor, 
    marginBottom: 10, 
  },
  company: {
    fontSize: 15,
    color: '#FFFFFF',
    marginBottom: 5,
  },



  topout: {
    flexDirection: "row",
    marginBottom: 20,
    alignItems: 'center',
  },
  category: {
    fontSize: 16,
    color:  UColor.fontColor,
  },
  outname: {
    fontSize: 14,
    color: UColor.arrow,
  },
  imgBtn: {
    width: 20,
    height: 20,
    marginHorizontal:5,
  },
  stopoutBackupsout: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#2ACFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stopoutBackups: {
    fontSize: 10,
    color: '#2ACFFF',
    textAlign: 'center',
    paddingHorizontal: 8,
    paddingVertical: 1,
  },

  notactivedout: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: UColor.showy,
    justifyContent: 'center',
    alignItems: 'center',
  },

  notactived: {
    fontSize: 10,
    color: UColor.showy,
    textAlign: 'center', 
    paddingHorizontal: 8,
    paddingVertical: 1,
  },
 

  walletname: { 
    fontSize: 15, 
    color:  UColor.arrow, 
  },
  acttiveout: {
    height: 45, 
    backgroundColor:  UColor.tintColor, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginLeft: 20, 
    marginRight: 20, 
    borderRadius: 5,
    marginBottom: 30,
  },
  deleteout: {
    height: 45, 
    backgroundColor: UColor.showy, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginLeft: 20, 
    marginRight: 20, 
    borderRadius: 5,
    marginBottom: 30,
  },
  delete: { 
    fontSize: 15, 
    color:  UColor.fontColor,
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
    marginHorizontal: 30,
    backgroundColor:  UColor.fontColor,
    alignSelf: 'stretch',
    justifyContent: 'center',
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: UColor.baseline,
  },
  closeText: {
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // 标题  
  titleText: {
    color: '#000000',
    marginBottom: 5,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  //警告提示  
  noticeText: {
    color: '#F45353',
    fontSize: 14,
    marginLeft: 15,
    marginRight: 15,
    textAlign: 'left',
  },
  // 内容  
  contentText: {
    margin: 20,
    alignItems: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: "row",
  },
  textContent: {
    color: '#999999',
    fontSize: 14,
    textAlign: 'left',
    lineHeight: 25,
  },
  // 按钮  
  buttonView: {
    margin: 10,
    height: 46,
    borderRadius: 6,
    backgroundColor:  UColor.tintColor,
    justifyContent: 'center',
    alignItems: 'center'
  },
  buttonText: {
    fontSize: 16,
    color:  UColor.fontColor,
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

});

export default WalletDetail;
