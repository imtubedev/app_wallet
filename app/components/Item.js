import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Text,
  View,
  Image,
  StyleSheet,
  Dimensions,
  Platform,
  TouchableHighlight,
  AlertIOS,
  SwitchIOS,
  Switch,
  TouchableNativeFeedback
} from 'react-native'
import UColor from '../utils/Colors'
import Button from './Button'
import Ionicons from 'react-native-vector-icons/Ionicons'
import FontAwesome from 'react-native-vector-icons/FontAwesome'

let {width, height} = Dimensions.get('window')

const itemHeight = 56

const Font = {
  Ionicons,
  FontAwesome
}

class ItemButton extends Component {
    constructor(props){
      super(props)
    }
    render(){
      return (
        <Button style={{marginTop: this.props.first?10:0}} onPress={this.props.onPress}>
          <View style={styles.button}>
            <Text style={{color: this.props.color || "#f00"}}>{this.props.name}</Text>
          </View>
        </Button>
      )
    }
  }

export default class Item extends Component {

  state = {
    value: false,
    thcolor:UColor.secdColor
  }

  constructor(props){
    super(props)
  }
  static propTypes = {
    icon: PropTypes.string,
    name: PropTypes.string.isRequired,
    subName: PropTypes.string,
    color: PropTypes.string,
    first: PropTypes.bool,
    avatar: PropTypes.number,
    disable: PropTypes.bool,
    iconSize: PropTypes.number,
    font: PropTypes.string,
    onPress: PropTypes.func,
    swt:PropTypes.string,
  }

  _render(){
    let {swt,icon, iconSize, name, subName, color, first, avatar, disable, font} = this.props
    font = font||"Ionicons"
 
    return (
      <View style={[styles.listItem,{marginTop: first?15:0}]}>
        {icon?(<Icon name={icon} size={iconSize||20} style={{width: 22, marginRight:5, textAlign:"center"}} color={color || "#4da6f0"} />):null}
        <View style={[styles.listInfo, {borderTopWidth: !first?0.5:0}]}>
          {avatar?(<Image source={avatar} style={{width: 28, height: 28, resizeMode: "cover", overflow:"hidden",marginRight:10,}}/>):null}
          <View style={{flex: 1}}><Text style={{color:UColor.fontColor, fontSize:16}}>{name}</Text></View>
          <View style={styles.listInfoRight}>
            {subName?(<Text style={{color:'#8696B0', fontSize:15}}>{subName}</Text>):null}            
            {disable?null:(<Font.Ionicons style={{marginLeft: 10}} name="ios-arrow-forward-outline" size={16} color={UColor.arrow} />)}
            {!swt?null:( 
            <Switch 
              tintColor={UColor.secdColor}
              onTintColor={UColor.tintColor}
              thumbTintColor="#ffffff"
              value={this.state.value} onValueChange={(value)=>{
              this.setState({value:value})}}
            />)
            }
          </View>
        </View>
      </View>
    )
  }
  render(){
    let { onPress, first, disable } = this.props
    onPress = onPress || (() => {})
    return disable?
      this._render():
      <Button onPress={onPress}>{this._render()}</Button>
  }
}
Item.Button = ItemButton
const styles = StyleSheet.create({
  listItem: {
    height: itemHeight,
    backgroundColor: UColor.mainColor,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  button:{
    height: itemHeight,
    backgroundColor: UColor.mainColor,
    justifyContent: "center",
    alignItems: "center"
  },
  listInfo: {
    height: itemHeight,
    flex: 1,
    paddingLeft: 16,
    paddingRight: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopColor: UColor.secdColor
  },
  listInfoRight: {
    flexDirection: "row",
    alignItems: "center"
  }
})
