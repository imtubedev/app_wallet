import React from 'react';
import { connect } from 'react-redux'
import {Dimensions,DeviceEventEmitter,InteractionManager,ListView,StyleSheet,View,RefreshControl,Text,ScrollView,Image,Platform,StatusBar,TextInput,TouchableOpacity} from 'react-native';
import {TabViewAnimated, TabBar, SceneMap} from 'react-native-tab-view';
import QRCode from 'react-native-qrcode-svg';
import UColor from '../../utils/Colors'
import Button from  '../../components/Button'
import Item from '../../components/Item'
import Icon from 'react-native-vector-icons/Ionicons'
import UImage from '../../utils/Img'
import AnalyticsUtil from '../../utils/AnalyticsUtil';
import { EasyLoading } from '../../components/Loading';
import { EasyToast } from '../../components/Toast';
import BaseComponent from "../../components/BaseComponent";
import moment from 'moment';
let {width, height} = Dimensions.get('window');

var dismissKeyboard = require('dismissKeyboard');
@connect(({login}) => ({...login}))
class TradeDetails extends BaseComponent {
    static navigationOptions = ({ navigation }) => {
        const params = navigation.state.params || {};
        return {
            headerTitle: '转账详情',
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
      
    };
  }

  componentDidMount() {
        // alert('trade: '+JSON.stringify(this.props.navigation.state.params.trade));
  }
  componentWillUnmount(){
    //结束页面前，资源释放操作
    super.componentWillUnmount();
    
  }
  prot(key, data = {}) {
    const { navigate } = this.props.navigation;
    if (key == 'transactionId') {
    navigate('Web', { title: "交易查询", url:'https://eospark.com/MainNet/tx/' + this.props.navigation.state.params.trade.transactionId});
    }else  if (key == 'from') {
    navigate('Web', { title: "发送方", url:'https://eospark.com/MainNet/account/' + this.props.navigation.state.params.trade.from});
    }else  if (key == 'to') {
    navigate('Web', { title: "接受方", url:'https://eospark.com/MainNet/account/' + this.props.navigation.state.params.trade.to});
    }else  if (key == 'blockNum') {
    navigate('Web', { title: "区块高度", url:'https://eospark.com/MainNet/block/' + this.props.navigation.state.params.trade.blockNum});
    }
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

  render() {
    const c = this.props.navigation.state.params.trade;
    return <View style={styles.container}>
            
        <View style={styles.header}>
            <View style={styles.headout}>
                <Text style={styles.quantitytext}>{c.quantity}</Text>
                {/* <Text style={styles.headtext}> bytes</Text> */}
            </View>
            <Text style={styles.description}>({c.description}{c.bytes? c.bytes + " bytes":""})</Text>
        </View>
        <View style={styles.conout}>
          <View style={styles.conouttext}>
            <Text style={styles.context}>发  送  方：</Text> 
            <Text style={{color: UColor.tintColor, flex: 1,fontSize: 14,}} onPress={this.prot.bind(this, 'from')}>{c.from}</Text>
          </View>
          <View style={styles.conouttext}>
            <Text style={styles.context}>接  受  方：</Text>
            <Text style={{color: UColor.tintColor, flex: 1,fontSize: 14,}} onPress={this.prot.bind(this, 'to')}>{c.to}</Text>
          </View>
          <View style={styles.conouttext}> 
            <Text style={styles.context}>区块高度：</Text>
            <Text style={{color: UColor.tintColor, flex: 1,fontSize: 14,}} onPress={this.prot.bind(this, 'blockNum')}>{c.blockNum}</Text>
          </View>
          <View style={styles.conouttext}>
            <Text style={styles.context}> 备    注 ：</Text>
            <Text style={{color: UColor.arrow, flex: 1,fontSize: 14,}} >{c.memo}</Text>
          </View>
        </View>
        <Text style={styles.blocktime}>{this.transferTimeZone(c.blockTime)}</Text>
        <View style={styles.codeout}>
            <View style={styles.qrcode}>
               <QRCode size={105} value={'https://eospark.com/MainNet/tx/' + c.transactionId } />
            </View>
        </View>
        <Text style={styles.tradehint}>交易号：<Text style={{color: UColor.tintColor,}} onPress={this.prot.bind(this, 'transactionId')}>{c.transactionId.substring(0, 15) +"..."+ c.transactionId.substr(c.transactionId.length-15) }</Text></Text>
        <Text style={styles.tradehint}>提 示：扫码可获取区块交易状态</Text>
    </View>
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection:'column',
    backgroundColor: UColor.secdColor,
  },
 
  header: {
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomColor: UColor.mainColor,
    borderBottomWidth: 0.5,
  },
  headout: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantitytext: {
    fontSize: 30,
    color: UColor.fontColor
  },
  headtext: {
    fontSize: 15,
    color: UColor.fontColor,
    paddingTop: 10,
  },
  description: {
    height: 35,
    fontSize: 14,
    color: UColor.tintColor,
  },
  conout: {
    flexDirection: "column",
    paddingHorizontal: 20,
    paddingVertical: 5,
    borderBottomColor: UColor.mainColor,
    borderBottomWidth: 0.5,
    
  },
  conouttext: {
    flexDirection: "row",
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 10,
  },
  context: {
    textAlign: 'left',
    fontSize: 14,
    color: UColor.arrow,
    width: 90,
  },

  blocktime: {
    fontSize: 14,
    color: UColor.fontColor,
    textAlign: 'right',
    lineHeight: 30,
    marginRight: 10,
  },
  codeout: {
    margin: 20,
    alignItems: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: "row",
  },
  qrcode: {
    backgroundColor: UColor.fontColor,
    padding: 5,
  },
 
  tradehint: {
    fontSize: 14,
    color: UColor.arrow,
    paddingTop: 10,
    paddingHorizontal: 25,
  },
});

export default TradeDetails;