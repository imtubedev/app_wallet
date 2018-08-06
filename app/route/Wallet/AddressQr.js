import React from 'react';
import { connect } from 'react-redux'
import { NativeModules, StatusBar, BackHandler, Clipboard, DeviceEventEmitter, InteractionManager, ListView, StyleSheet, Image, ScrollView, View, RefreshControl, Text, TextInput, Platform, Dimensions, Modal, TouchableHighlight, } from 'react-native';
import { TabViewAnimated, TabBar, SceneMap } from 'react-native-tab-view';
import store from 'react-native-simple-store';
import UColor from '../../utils/Colors'
import Button from '../../components/Button'
import Echarts from 'native-echarts'
import UImage from '../../utils/Img'
import QRCode from 'react-native-qrcode-svg';
const maxHeight = Dimensions.get('window').height;
import { EasyDialog } from "../../components/Dialog"
import { EasyToast } from '../../components/Toast';
import { Eos } from "react-native-eosjs";
import BaseComponent from "../../components/BaseComponent";

@connect(({ wallet }) => ({ ...wallet }))
class AddressQr extends BaseComponent {
    static navigationOptions = ({ navigation }) => {
        const params = navigation.state.params || {};
        return {
            headerTitle:'收款账号',
            headerStyle: {
                paddingTop:Platform.OS == 'ios' ? 30 : 20,
                backgroundColor: UColor.mainColor,
                borderBottomWidth:0,
            },

        };
    };

    componentDidMount() {
        // EasyDialog.show("温馨提示", "该功能正在紧急开发中，敬请期待！", "知道了", null, () => { EasyDialog.dismis() });
        //加载地址数据
        const { dispatch } = this.props;
        this.props.dispatch({ type: 'wallet/getDefaultWallet' });

        DeviceEventEmitter.addListener('transfer_result', (result) => {
            // EasyToast.show('交易成功：刷新交易记录');
            // this.props.dispatch({ type: 'wallet/walletList' });
            // if (result.success) {
            //     // this.props.navigation.goBack();
            // } else {
            //     EasyToast.show('交易失败：' + result.result);
            // }
        });
    }
    componentWillUnmount(){
        //结束页面前，资源释放操作
        super.componentWillUnmount();
        
      }
    onPress(action) {
        EasyDialog.show("温馨提示", "该功能正在紧急开发中，敬请期待！", "知道了", null, () => { EasyDialog.dismis() });
    }

    _rightButtonClick() {
        // EasyDialog.show("温馨提示", "该功能正在紧急开发中，敬请期待", "知道了", null, () => { EasyDialog.dismis() });
        this._setModalVisible();
    }

    // 显示/隐藏 modal  
    _setModalVisible() {
        let isShow = this.state.show;
        this.setState({
            show: !isShow,
        });
    }
    turnOut(coins) {
        const { navigate } = this.props.navigation;
    }

    // 构造函数  
    constructor(props) {
        super(props);
        this.state = {
            show: false,
            // balance: this.props.navigation.state.params.balance,
        };
    }



    render() {
        return (
            <View style={styles.container}>
                    

                <View style={styles.header}>
                    <Text style={{ fontSize: 20, color: '#fff' }}></Text>
                    <Text style={{ fontSize: 14, color: '#8696B0', marginTop: 5 }}>ds2f1gdsg1321gd3sf1d3sf1ds3f1d32sf1ds3f1d25s</Text>
                </View>
                <View style={styles.tab1}>
                   <QRCode size={200} style={{ width: 200, }} value={'{\"contract\":\"eos\",\"toaccount\":\"' + 'this.props.defaultWallet.account' + '\",\"symbol\":\"EOS\"}'} />
                </View>
                <Button onPress={() => { this.copy() }}>
                    <View style={{ margin: 10, height: 40, borderRadius: 6, backgroundColor: '#65CAFF', justifyContent: 'center', alignItems: 'center' }}>
                        <Text style={{ fontSize: 16, color: '#fff' }}>复制地址</Text>
                    </View>
                </Button>              
            </View>
        )
    }
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: UColor.secdColor,
        paddingTop: 5,
    },
    header: {
        height: 110,
        justifyContent: "center",
        alignItems: "center",
        margin: 5,
        borderRadius: 5,
        backgroundColor: '#586888',
    },
    row: {
        height: 90,
        backgroundColor: UColor.mainColor,
        flexDirection: "column",
        padding: 10,
        justifyContent: "space-between",
        borderRadius: 5,
        margin: 5,
    },
    top: {
        flex: 1,
        flexDirection: "row",
        alignItems: 'center',
    },
    footer: {
        paddingTop: 10,
        height: 60,
        flexDirection: 'row',
        position: 'absolute',
        backgroundColor: '#43536D',
        bottom: 0,
        left: 0,
        right: 0,
    },

    pupuo: {
        // flex:1,  
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
        backgroundColor: '#fff',
        alignSelf: 'stretch',
        justifyContent: 'center',
        borderRadius: 10,
        borderWidth: 0.5,
        borderColor: '#ccc',
    },
    // 标题  
    titleText: {
        marginBottom: 5,
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    // 内容  
    contentText: {
        marginLeft: 15,
        fontSize: 12,
        textAlign: 'left',
    },
    // 按钮  
    buttonView: {
        alignItems: 'flex-end',
    },
    tab1: {
        flex: 1,
    },
    tab2: {
        flex: 1,
        flexDirection: 'column',
    }


})
export default AddressQr;