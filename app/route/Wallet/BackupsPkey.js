import React from 'react';
import { connect } from 'react-redux'
import { Clipboard, Dimensions, DeviceEventEmitter, InteractionManager, ListView, StyleSheet, View, RefreshControl, Text, ScrollView, Image, Platform, StatusBar, TextInput, TouchableOpacity, TouchableHighlight } from 'react-native';
import { TabViewAnimated, TabBar, SceneMap } from 'react-native-tab-view';
import UColor from '../../utils/Colors'
import Button from '../../components/Button'
import Item from '../../components/Item'
import Icon from 'react-native-vector-icons/Ionicons'
import UImage from '../../utils/Img'
import { EasyLoading } from '../../components/Loading';
import { EasyToast } from '../../components/Toast';
import { EasyDialog } from '../../components/Dialog';
import BaseComponent from "../../components/BaseComponent";
import Constants from '../../utils/Constants';
import {NavigationActions} from 'react-navigation';
const maxWidth = Dimensions.get('window').width;
var AES = require("crypto-js/aes");
var CryptoJS = require("crypto-js");
var dismissKeyboard = require('dismissKeyboard');

// @connect(({ login }) => ({ ...login }))
@connect(({ wallet }) => ({ ...wallet }))
class BackupsPkey extends BaseComponent {

    static navigationOptions = ({ navigation }) => {
        return {
            headerTitle: '备份私钥',
            headerStyle: {
                paddingTop:Platform.OS == 'ios' ? 30 : 20,
                backgroundColor: UColor.mainColor,
                borderBottomWidth:0,
            },
        };
    };

    constructor(props) {
        super(props);
        this.state = {
            password: "",
            ownerPk: '',
            activePk: '',
            show: false,
        }
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
                ownerPk: plaintext_words_owner.substr(8, plaintext_words_owner.length),
                activePk: plaintext_words_active.substr(8, plaintext_words_active.length),
            })
        }
    }

    componentWillUnmount(){
        var entry = this.props.navigation.state.params.entry;
        if(entry == "createWallet"){
            this.pop(1, true);
        }
        //结束页面前，资源释放操作
        super.componentWillUnmount();
    }

    pop(nPage, immediate) {
        const action = NavigationActions.pop({
            n: nPage,
            immediate: immediate,
        });
        this.props.navigation.dispatch(action);
    
    }

    toBackup = (data) => {
        this.props.navigation.goBack();
        const { navigate } = this.props.navigation;
        navigate('BackupWords', data);
    }

    decryptWords = () => {
        const view =
            <View style={styles.passoutsource}>
                <TextInput autoFocus={true} onChangeText={(password) => this.setState({ password })} returnKeyType="go" 
                    selectionColor={UColor.tintColor} secureTextEntry={true} keyboardType="ascii-capable" style={styles.inptpass} maxLength={Constants.PWD_MAX_LENGTH}   
                    placeholderTextColor={UColor.arrow} placeholder="请输入密码" underlineColorAndroid="transparent"/>
            </View>

        EasyDialog.show("密码", view, "备份", "取消", () => {

            if (this.state.password == "" || this.state.password.length < Constants.PWD_MIN_LENGTH) {
                EasyToast.show('密码长度至少4位,请重输');
                return;
            }
            try{
            var _words = this.props.navigation.state.params.words;
            var bytes_words = CryptoJS.AES.decrypt(_words.toString(), this.state.password + this.props.navigation.state.params.salt);
            var plaintext_words = bytes_words.toString(CryptoJS.enc.Utf8);

            var words_active = this.props.navigation.state.params.words_active;
            var bytes_words = CryptoJS.AES.decrypt(words_active.toString(), this.state.password + this.props.navigation.state.params.salt);
            var plaintext_words_active = bytes_words.toString(CryptoJS.enc.Utf8);

            if (plaintext_words.indexOf('eostoken') != -1) {
                plaintext_words = plaintext_words.substr(9, plaintext_words.length);
                var wordsArr = plaintext_words.split(',');

                plaintext_words_active = plaintext_words_active.substr(9, plaintext_words_active.length);
                var wordsArr_active = plaintext_words_active.split(',');

                this.toBackup({ words_owner: wordsArr, words_active: wordsArr_active });
            } else {
                // alert('密码错误');
                EasyToast.show('密码错误');
            }
        }catch(e){
            EasyToast.show('密码错误');
        }
            EasyDialog.dismis();
        }, () => { EasyDialog.dismis() });
    }

    dismissKeyboardClick() {
      dismissKeyboard();
    }

    checkClick() {
    this.setState({
        show: false
    });
    }

    prot(key, data = {}) {
        const { navigate } = this.props.navigation; 
        if(key == 'activePk'){
            Clipboard.setString(this.state.activePk);
            EasyToast.show('Active私钥已复制成功');
        } else if(key == 'ownerPk'){
          Clipboard.setString(this.state.ownerPk);
          EasyToast.show('Owner私钥已复制成功');
        }else  if(key == 'problem') {
          navigate('Web', { title: "什么是私钥", url: "http://static.eostoken.im/html/Keystore.html" });   
        }
    }

    nextStep() {
        const { navigate } = this.props.navigation;
        var entry = this.props.navigation.state.params.entry;
        var wallet = this.props.navigation.state.params.wallet;
        var password = this.props.navigation.state.params.password;
        navigate('BackupsAOkey', {wallet:wallet, password:password, entry: entry});
    }

    render() {
        return (<View style={styles.container}>
                

       <ScrollView keyboardShouldPersistTaps="always">
            <TouchableOpacity activeOpacity={1.0} onPress={this.dismissKeyboardClick.bind(this)}>
            <View style={styles.header}>
                <View style={styles.inptoutbg}>
                    <View style={styles.headout}>
                        <Text style={styles.inptitle}>立即备份你的私钥</Text>
                        <View style={styles.warningout}>
                            <Image source={UImage.warning} style={styles.imgBtn} />
                            <Text style={styles.headtitle}>安全警告：私钥相当于您的银行卡密码，请妥善保管！（切勿截图、存储到网络硬盘、微信等传输！）</Text>
                        </View>
                    </View> 
                    {this.state.activePk != ''&& 
                    <View style={styles.inptoutgo} >
                        <Text style={styles.inptitle}>Active私钥</Text>
                        <TouchableHighlight style={styles.inptgo}  underlayColor={UColor.secdColor}>
                            <Text style={styles.inptext}>{this.state.activePk}</Text>
                        </TouchableHighlight>
                    </View>}  
                    {this.state.ownerPk != ''&&
                    <View style={styles.inptoutgo} >
                        <Text style={styles.inptitle}>Owner私钥</Text>
                        <TouchableHighlight style={styles.inptgo}  underlayColor={UColor.secdColor}>
                            <Text style={styles.inptext}>{this.state.ownerPk}</Text>
                        </TouchableHighlight>
                    </View>}
                </View>
                <Button onPress={this.prot.bind(this, 'problem')}>
                    <Text style={styles.readtext} >什么是私钥？</Text> 
                </Button> 
                <Button onPress={() => this.nextStep()}>
                    <View style={styles.importPriout}>
                        <Text style={styles.importPritext}>下一步(已经抄好)</Text>
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
        width: maxWidth-100,
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
    warningout: {
        width: maxWidth-40,
        flexDirection: "row",
        alignItems: 'center', 
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderColor: UColor.showy,
        borderWidth: 1,
        borderRadius: 5,
    },
    imgBtn: {
        width: 20,
        height: 20,
    },
    headtitle: {
        flex: 1,
        color: UColor.showy,
        fontSize: 14,
        lineHeight: 25,
        paddingLeft: 10,
    },
    inptoutbg: {
        backgroundColor: UColor.mainColor,
        paddingHorizontal: 20,
        marginBottom: 10,
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
    inpt: {
        height: 50,
        fontSize: 16,
        color: UColor.arrow,
    },
    inptoutgo: {
        paddingBottom: 15,
        backgroundColor: UColor.mainColor,
    },
    inptgo: {
        flex: 1,
        height: 60,
        paddingHorizontal: 10,
        backgroundColor: UColor.secdColor,
    },
    inptext: {
        fontSize: 14,
        lineHeight: 25,
        color: UColor.arrow,
    },

    readout: {
        justifyContent: 'center',
        alignItems: 'flex-end',
        paddingHorizontal: 10,
       
    },
    readtext: {
        textAlign: 'right',
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
        marginTop: 60,
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
        width: maxWidth - 20,
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
    prompttext: {
        fontSize: 14,
        color: UColor.tintColor,
        marginHorizontal: 5,
    },
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

export default BackupsPkey;
