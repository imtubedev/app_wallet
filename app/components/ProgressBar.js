import React from 'react';
import {
    StyleSheet,
    Animated,
    Easing,
    Platform,
    TouchableHighlight,
    KeyboardAvoidingView,
    TouchableWithoutFeedback,
    View,
    Dimensions,
} from 'react-native';
  
var styles = StyleSheet.create({
    background: {
        backgroundColor: '#bbbbbb',
        height: 5,
        overflow: 'hidden'
    },
    fill: {
        backgroundColor: '#51BC78',
        height: 5
    }
});

export default class ProgressBar extends React.Component {
    
    constructor(props){
        super(props)
    }

    state  ={
      progress: new Animated.Value(0)
    }

    componentDidUpdate(prevProps, prevState) {
      if (this.props.progress >= 0 && this.props.progress != prevProps.progress) {
        Animated.timing(this.state.progress, {
          toValue: parseInt(this.props.progress),
          duration: 100
        }).start()
      }
    }
    
    render() {
      return (
        <View style={[styles.background, this.props.backgroundStyle, this.props.style]}>
          <Animated.View style={[styles.fill,{width:this.state.progress}]}></Animated.View>
        </View>
      );
    }
}


