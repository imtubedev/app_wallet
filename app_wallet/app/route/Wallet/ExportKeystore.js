import React from 'react';
import { connect } from 'react-redux'
import { Dimensions, DeviceEventEmitter, InteractionManager, ListView, StyleSheet, Image, View, RefreshControl, Text, Platform, TextInput, ScrollView } from 'react-native';
import { TabViewAnimated, TabBar, SceneMap } from 'react-native-tab-view';
import store from 'react-native-simple-store';
import UColor from '../../utils/Colors'
import Button from '../../components/Button'
import { formatterNumber, formatterUnit } from '../../utils/FormatUtil'
import BaseComponent from "../../components/BaseComponent";

const pages = [];

let loadMoreTime = 0;

let currentLoadMoreTypeId;

let timer;

let currentTab = 0;

const _index = 0;

@connect(({ sticker }) => ({ ...sticker }))
class Coins extends BaseComponent {

    static navigationOptions = {
        title: '导出Keystore'
    };

    constructor(props) {
        super(props);
        this.state = {
            index: 0,
            dataSource: new ListView.DataSource({ rowHasChanged: (row1, row2) => row1 !== row2 }),
            routes: [
                { key: '0', title: '文件' },
                { key: '1', title: '二维码' },
            ]
        };
    }
    //组件加载完成
    componentDidMount() {
        const { dispatch } = this.props;
        InteractionManager.runAfterInteractions(() => {
            dispatch({ type: 'sticker/list', payload: { type: -1 } });
            this.startTick(0);
        });
        var th = this;
        DeviceEventEmitter.addListener('changeTab', (tab) => {
            if (tab == "Coins" || tab == "Coin") {
                th.startTick(th.state.index);
            } else {
                if (timer) {
                    clearInterval(timer);
                }
            }
        });
        DeviceEventEmitter.addListener('coinSlefChange', (tab) => {
            dispatch({ type: 'sticker/list', payload: { type: 0 } });
        });
        
    }

    componentWillUnmount() {
        //结束页面前，资源释放操作
        super.componentWillUnmount();
        if (timer) {
            clearInterval(timer);
        }
        DeviceEventEmitter.removeListener('changeTab');
    }

    startTick(index) {
        const { dispatch } = this.props;
        InteractionManager.runAfterInteractions(() => {
            clearInterval(timer);
            timer = setInterval(function () {
                dispatch({ type: 'sticker/list', payload: { type: index } });
            }, 7000);
        });
    }

    onRefresh(key) {
        this.startTick(this.getRouteIndex(key));
    }

    //获得typeid坐标
    getRouteIndex(typeId) {
        for (let i = 0; i < this.state.routes.length; i++) {
            if (this.state.routes[i].key == typeId) {
                return i;
            }
        }
    }

    //点击
    onPress = (coins) => {
        const { navigate } = this.props.navigation;
        navigate('Coin', { coins });
    };

    showQR(){
        
    }

    //切换tab
    _handleIndexChange = index => {
        this.startTick(index);
        this.setState({ index });
        _index = index;
    };

    _handleTabItemPress = ({ route }) => {
        const index = this.getRouteIndex(route.key);
        this.setState({ index });
    }

    //渲染页面
    renderScene = ({ route }) => {
        if (route.key == '') {
            return (<View></View>)
        }
        const v = (<View></View>)
        // if (_index == 0) {
        if (route.key == '0') {
            const v = <View style={styles.container}>
                <ScrollView style={styles.scrollView}>
                    <View>
                        <Text style={styles.welcome} style={{ color: '#FFFFFF', fontSize: 17, marginLeft: 10, marginRight: 10, marginTop: 20 }}>离线保存:</Text>
                        <Text style={styles.welcome} style={{ margin: 10, color: '#8696B0' }}>请复制Keystore到安全离线的地方</Text>
                        <View style={{ backgroundColor: '#8696B0', height: 150, marginTop: 30, marginLeft: 10, marginRight: 10 }}>
                            <Text style={{ fontSize: 15 }}> jsdf46as56f16as5d1f6sad56a4g6s5d4f3sd1f654sdf564as6d5f4as86d45s6d4f65asd4f6a5sd4f8asd4f65asd4f65asd4f65as4df</Text>
                        </View>
                        <Button onPress={() => this.logout()}>
                            <View style={{ height: 45, backgroundColor: '#65CAFF', justifyContent: 'center', alignItems: 'center', margin: 20, borderRadius: 5 }}>
                                <Text style={{ fontSize: 15, color: '#fff' }}>复制Keystore</Text>
                            </View>
                        </Button>
                    </View>
                </ScrollView>
            </View>
            return (v);
        }
        // if (_index == 1) {
        if (route.key == '1') {
            const v = <View style={styles.container}>
                <ScrollView style={styles.scrollView}>
                    <View>
                        <Text style={styles.welcome} style={{ color: '#FFFFFF', marginTop: 20, marginLeft: 10, fontSize: 17 }}>仅供直接扫描</Text>
                        <Text style={styles.welcome} style={{ marginLeft: 10, marginRight: 10, }} >直接复制粘贴以太坊官方钱包 Keystore 文件内 容至输入框。或者通过生成 Keystore 内容的二 维码，扫描录入。</Text>
                        <Text style={styles.welcome} style={{ color: '#FFFFFF', marginTop: 20, marginLeft: 10, fontSize: 17 }}>在安全环境下使用</Text>
                        <Text style={styles.welcome} style={{ marginLeft: 10, marginRight: 10, }}>请在确保四周无人及无摄像头的情况下使用。二维码一旦 被他人获取将造成不可挽回的资产损失</Text>
                        <View style={{ backgroundColor: '#8696B0', height: 150, marginTop: 30, marginLeft: 10, marginRight: 10 }}>
                        </View>
                        <Button onPress={() => this.showQR()}>
                            <View style={{ height: 45, backgroundColor: '#65CAFF', justifyContent: 'center', alignItems: 'center', margin: 20, borderRadius: 5 }}>
                                <Text style={{ fontSize: 15, color: '#fff' }}>显示二维码</Text>
                            </View>
                        </Button>
                    </View>
                </ScrollView>
            </View>
            return (v);
        }
        return (v);
    }
    render() {
        return (
            <View style={styles.container}>
                <TabViewAnimated
                    lazy={true}
                    style={styles.container}
                    navigationState={this.state}
                    renderScene={this.renderScene.bind(this)}
                    renderHeader={(props) => <TabBar onTabPress={this._handleTabItemPress} labelStyle={{ fontSize: 15, margin: 0, marginBottom: 10, paddingTop: 10, color: '#8696B0' }} indicatorStyle={{ backgroundColor: UColor.tintColor, width: 60, marginLeft: 20 }} style={{ backgroundColor: UColor.secdColor }} tabStyle={{ width: 100, padding: 0, margin: 0 }} scrollEnabled={true} {...props} />}
                    onIndexChange={this._handleIndexChange}
                    initialLayout={{ height: 0, width: Dimensions.get('window').width }}
                />
            </View>
        );
    }
}



const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: UColor.secdColor
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
    }
});

export default Coins;
