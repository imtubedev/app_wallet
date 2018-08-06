import React from 'react';
import { StyleSheet, Dimensions, Text, View,Animated,Keyboard} from 'react-native';
import PropTypes from 'prop-types';
const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

export class EasyToast {
    
    constructor() {
    
    }

    static bind(toast) {
        toast && (this.map['toast'] = toast);
    }

    static unBind() {
        this.map["toast"] = null
        delete this.map["toast"];
    }

    static show(text) {
        this.map["toast"].show(text);
    }

    //切换页面时,如果有显示,立刻关闭
    static switchRoute(){
        if(this.map["toast"] && this.map["toast"].state.isShow)
        {
            this.dismis();
        }
    }

    static dismis() {
        this.map["toast"].close();
    }
}

EasyToast.map = {};

export const DURATION = { 
    LENGTH_SHORT: 500,
    FOREVER: 0,
};

export class Toast extends React.Component {

    state = {
        keyboardHeight:0
    }

    constructor(props) {
        super(props);
        this.state = {
            isShow: false,
            text: '',
            opacityValue: new Animated.Value(0.7),
            keyboardHeight:0,
        }
        EasyToast.bind(this);
    }

    show(text, duration, callback) {
        this.duration = typeof duration === 'number' ? duration : 1000;
        this.callback = callback;
        this.setState({
            isShow: true,
            text: text,
        });

        Animated.timing(
            this.state.opacityValue,
            {
                toValue: 0.7,
                duration: 500,
            }
        ).start(() => {
            this.isShow = true;
            if(duration !== DURATION.FOREVER) this.close();
        });
    }

    close( duration ) {
        let delay = typeof duration === 'undefined' ? this.duration : duration;

        if(delay === DURATION.FOREVER) delay = this.props.defaultCloseDelay || 1000;

        if (!this.isShow && !this.state.isShow) return;
        this.timer && clearTimeout(this.timer);
        this.timer = setTimeout(() => {
            Animated.timing(
                this.state.opacityValue,
                {
                    toValue: 0.0,
                    duration: 500,
                }
            ).start(() => {
                this.setState({
                    isShow: false,
                });
                this.isShow = false;
                if(typeof this.callback === 'function') {
                    this.callback();
                }
            });
        }, delay);
    }

    componentWillMount(){
        Keyboard.addListener('keyboardDidShow', this._keyboardDidShow.bind(this));
        Keyboard.addListener('keyboardDidHide', this._keyboardDidHide.bind(this));
    }

    componentWillUnmount() {
        this.timer && clearTimeout(this.timer);
        Keyboard.removeListener('keyboardDidShow');
        Keyboard.removeListener('keyboardDidHide');
        EasyToast.unBind();
    }

    _keyboardDidShow(e){
        this.setState({
            keyboardHeight:e.endCoordinates.height
        })
        
    }

    _keyboardDidHide(e){
        this.setState({
            keyboardHeight:0
        })
    }
    
    render() {
        const view = this.state.isShow ?
        <View style={[styles.container, { top: SCREEN_HEIGHT-this.state.keyboardHeight-((this.state.keyboardHeight==0)?150:43) }]} pointerEvents="none">
            <Animated.View style={[styles.content,{opacity:this.state.opacityValue}]}>
                <Text style={styles.text}>{this.state.text}</Text>
            </Animated.View>
        </View>
        : null;
        return view;       
    }
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        left: 0,
        right: 0,
        elevation: 999,
        alignItems: 'center',
        zIndex: 10000,
    },
    content: {
        backgroundColor: 'black',
        borderRadius: 5,
        padding: 10,
        opacity:80
    },
    text: {
        color: 'white'
    }
});