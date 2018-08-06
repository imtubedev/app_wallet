import React from 'react';
import { connect } from 'react-redux'
import { NativeModules, StatusBar, BackHandler, Clipboard, DeviceEventEmitter, InteractionManager, ListView, StyleSheet, Image, ScrollView, View, RefreshControl, Text, TextInput, Platform, Dimensions, Modal, TouchableHighlight, } from 'react-native';
import { TabViewAnimated, TabBar, SceneMap } from 'react-native-tab-view';
import Ionicons from 'react-native-vector-icons/Ionicons'
import store from 'react-native-simple-store';
import UColor from '../../utils/Colors'
import Button from '../../components/Button'
import Echarts from 'native-echarts'
import UImage from '../../utils/Img'
import AnalyticsUtil from '../../utils/AnalyticsUtil';
import QRCode from 'react-native-qrcode-svg';
const maxHeight = Dimensions.get('window').height;
import { EasyDialog } from "../../components/Dialog"
import { EasyToast } from '../../components/Toast';
import { EasyLoading } from '../../components/Loading';
import { Eos } from "react-native-eosjs";
import BaseComponent from "../../components/BaseComponent";
import moment from 'moment';

var logPage = 1;
@connect(({ wallet, assets}) => ({ ...wallet, ...assets }))
class AssetInfo extends BaseComponent {
    static navigationOptions = ({ navigation }) => {
        const params = navigation.state.params || {};
        return {
            headerTitle: params.asset.asset.name,
            headerStyle: {
                paddingTop:Platform.OS == 'ios' ? 30 : 20,
                backgroundColor: UColor.mainColor,
                borderBottomWidth:0,
            },
        };
    };

     // 构造函数  
     constructor(props) {
        super(props);
        this.state = {
            balance: this.props.navigation.state.params.asset.balance,
            dataSource: new ListView.DataSource({ rowHasChanged: (row1, row2) => row1 !== row2 }),
            type: '',
            asset: this.props.navigation.state.params.asset,
            // detailInfo: "请稍候...",
            logRefreshing: false,
        };
        DeviceEventEmitter.addListener('transaction_success', () => {
            try {
                this.getBalance();
                DeviceEventEmitter.emit('wallet_info');
            } catch (error) {
            }
        });
    }

    componentWillMount() {

        super.componentWillMount();
    
        this.props.dispatch({type: 'assets/clearTradeDetails',payload:{}});
    }

    componentDidMount() {
        //加载地址数据
        // EasyLoading.show();
        this.props.dispatch({ type: 'wallet/getDefaultWallet' });

        logPage = 1;
        this.props.dispatch({ type: 'assets/getTradeDetails', payload: { account_name : this.props.defaultWallet.name, contract_account : this.state.asset.asset.contractAccount,  code : this.state.asset.asset.name, page: logPage, countPerPage: 10}, callback: (resp) => {
            if(resp.code != '0'){
                // this.setState({detailInfo: "暂未找到交易哟~"});
            }else if((resp.code == '0') && (this.props.tradeLog.length == 0)){
                // this.setState({detailInfo: "您还没有交易哟~"});
            }
            // EasyLoading.dismis();
        }});     
    }

    componentWillUnmount(){
        //结束页面前，资源释放操作
        super.componentWillUnmount();
        
      }
    turnInAsset(coins) {
        const { navigate } = this.props.navigation;
        navigate('TurnInAsset', {coins, balance: this.state.balance });
    }
    turnOutAsset(coins) {
        const { navigate } = this.props.navigation;
        navigate('TurnOutAsset', { coins, balance: this.state.balance });
    }

    getBalance() {
        this.props.dispatch({
            type: 'wallet/getBalance', payload: { contract: this.props.navigation.state.params.asset.asset.contractAccount, account: this.props.defaultWallet.name, symbol: this.props.navigation.state.params.asset.asset.name }, callback: (data) => {
              if (data.code == '0') {
                if (data.data == "") {
                  this.setState({
                    balance: '0.0000 ' + this.props.navigation.state.params.asset.asset.name,
                  })
                } else {
                    this.setState({ balance: data.data });
                }
              } else {
                // EasyToast.show('获取余额失败：' + data.msg);
              }
              EasyLoading.dismis();
            }
          })
    }

    _openDetails(trade) {  
        const { navigate } = this.props.navigation;
        navigate('TradeDetails', {trade});
    }
    transferTimeZone(blockTime){
        var timezone;
        try {
            timezone = moment(blockTime).add(8,'hours').format('YYYY-MM-DD HH:mm');
        } catch (error) {
            timezone = blockTime;
        }
        return timezone;
    }

    onEndReached(){
        if(this.props.defaultWallet == null || this.props.defaultWallet.name == null || this.props.myAssets == null){
          return;
        }
    
        if(this.state.logRefreshing){
            return;
        }
        logPage += 1;
        this.setState({logRefreshing: true});
        this.props.dispatch({ type: 'assets/getTradeDetails', payload: { account_name : this.props.defaultWallet.name, contract_account : this.state.asset.asset.contractAccount,  code : this.state.asset.asset.name, page: logPage, countPerPage: 10}, callback: (resp) => {
            if(resp.code != '0' || (resp.code == '0' && resp.data && resp.data.length == 0)){
                if(logPage > 1){
                    logPage -= 1;
                }
            }
            this.setState({logRefreshing: false});
        }}); 
    }

    onRefresh(){
        if(this.props.defaultWallet == null || this.props.defaultWallet.name == null || this.props.myAssets == null){
          return;
        }
    
        if(this.state.logRefreshing){
            return;
        }
        logPage = 1;
        this.setState({logRefreshing: true});
        this.props.dispatch({ type: 'assets/getTradeDetails', payload: { account_name : this.props.defaultWallet.name, contract_account : this.state.asset.asset.contractAccount,  code : this.state.asset.asset.name, page: logPage, countPerPage: 10}, callback: (resp) => {
            this.setState({logRefreshing: false});
        }}); 
    }

    render() {
        const c = this.props.navigation.state.params.asset;
        return (
            <View style={styles.container}>
                
                <View style={styles.header}>
                    <Text style={styles.headbalance}>{this.state.balance==""? "0.0000" :this.state.balance.replace(c.asset.name, "")} {c.asset.name}</Text>
                    <Text style={styles.headmarket}>≈ {(this.state.balance == null || c.asset.value == null) ? "0.00" : (this.state.balance.replace(c.asset.name, "") * c.asset.value).toFixed(2)} ￥</Text>
                </View>
                <View style={styles.btn}>
                    <Text style={styles.latelytext}>最近交易记录</Text>
                    {/* {(this.props.tradeLog == null || this.props.tradeLog.length == 0) && <View style={styles.nothave}><Text style={styles.copytext}>{this.state.detailInfo}</Text></View>} */}
                    <ListView style={styles.tab} renderRow={this.renderRow} enableEmptySections={true} onEndReachedThreshold = {50}
                    onEndReached={() => this.onEndReached()}
                    refreshControl={
                    <RefreshControl
                        refreshing={this.state.logRefreshing}
                        onRefresh={() => this.onRefresh()}
                        tintColor="#fff"
                        colors={['#ddd', UColor.tintColor]}
                        progressBackgroundColor="#ffffff"
                    />
                    }
                    dataSource={this.state.dataSource.cloneWithRows(this.props.tradeLog == null ? [] : this.props.tradeLog)} 
                    renderRow={(rowData, sectionID, rowID) => (                 
                    <View>
                        <Button onPress={this._openDetails.bind(this,rowData)}> 
                            <View style={styles.row}>
                                <View style={styles.top}>
                                    <View style={styles.timequantity}>
                                        <Text style={styles.timetext}>时间 : {this.transferTimeZone(rowData.blockTime)}</Text>
                                        <Text style={styles.quantity}>数量 : {rowData.quantity.replace(c.asset.name, "")}</Text>
                                    </View>
                                    <View style={styles.typedescription}>
                                       {rowData.type == '转出' ? 
                                       <Text style={styles.typeto}>类型 : {rowData.type}</Text>
                                       :
                                       <Text style={styles.typeout}>类型 : {rowData.type}</Text>
                                       }
                                        <Text style={styles.description}>（{rowData.description}）</Text>
                                    </View>
                                </View>
                                <View style={styles.Ionicout}>
                                    <Ionicons style={styles.Ionico} name="ios-arrow-forward-outline" size={20} /> 
                                </View>
                            </View>
                        </Button>  
                    </View>         
                     )}                
                 /> 
                </View>

                <View style={styles.footer}>
                    <Button onPress={this.turnInAsset.bind(this, c)} style={{ flex: 1 }}>
                        <View style={styles.shiftshiftturnout}>
                            <Image source={UImage.shift_to} style={styles.shiftturn} />
                            <Text style={styles.shifttoturnout}>转入</Text>
                        </View>
                    </Button>
                    <Button onPress={this.turnOutAsset.bind(this, c)} style={{ flex: 1 }}>
                        <View style={styles.shiftshiftturnout}>
                            <Image source={UImage.turn_out} style={styles.shiftturn} />
                            <Text style={styles.shifttoturnout}>转出</Text>
                        </View>
                    </Button>
                </View>
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
        backgroundColor: UColor.mainColor,
    },
    headbalance: {
        fontSize: 20, 
        color: UColor.fontColor
    },
    headmarket: {
        fontSize: 14,
        color: UColor.arrow,
        marginTop: 5
    },

    tab: {
        flex: 1,
    },
    btn: {
        flex: 1,
        paddingBottom: 60,
    },

    latelytext: {
        fontSize: 14,
        color: UColor.arrow,
        margin: 5
    },
    nothave: {
        height: Platform.OS == 'ios' ? 84.5 : 65,
        backgroundColor: UColor.mainColor,
        flexDirection: "row",
        alignItems: 'center',
        justifyContent: "center",
        paddingHorizontal: 20,
        borderRadius: 5,
        margin: 5,
    },
    row: {
        height: Platform.OS == 'ios' ? 84.5 : 65,
        backgroundColor: UColor.mainColor,
        flexDirection: "row",
        paddingHorizontal: 20,
        justifyContent: "space-between",
        borderRadius: 5,
        margin: 5,
    },
    top: {
        flex: 1,
        flexDirection: "row",
        alignItems: 'center',
        justifyContent: "center",
    },
    timequantity: {
        flex: 1,
        flexDirection: "column",
        justifyContent: "flex-end",
    },
    timetext: {
        fontSize: 14,
        color: UColor.arrow,
        textAlign: 'left'
    },
    quantity: {
        fontSize: 14,
        color: UColor.arrow,
        textAlign: 'left',
        marginTop: 3
    },
    description: {
        fontSize: 14,
        color: UColor.arrow,
        textAlign: 'center',
        marginTop: 3
    },
    typedescription: {
        flexDirection: "column",
        justifyContent: "flex-end",
    },
    typeto: {
        fontSize: 14,
        color: UColor.tintColor,
        textAlign: 'center'
    },
    typeout: {
        fontSize: 14,
        color: "#4ed694",
        textAlign: 'center'
    },

    Ionicout: {
        width: 30,
        justifyContent: 'center',
        alignItems: 'flex-end'
    },
    Ionico: {
        color: UColor.arrow,   
    },


    footer: {
        paddingTop: 5,
        height: 60,
        flexDirection: 'row',
        position: 'absolute',
        backgroundColor: UColor.secdColor,
        bottom: 0,
        left: 0,
        right: 0,
    },
    shiftshiftturnout: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        marginRight: 1,
        backgroundColor: UColor.mainColor,
    },
    shiftturn: {
        width: 30, 
        height: 30
    },
    shifttoturnout: {
        marginLeft: 20,
        fontSize: 18,
        color: UColor.fontColor
    },
    copytext: {
        fontSize: 16, 
        color: UColor.fontColor
    },

})
export default AssetInfo;