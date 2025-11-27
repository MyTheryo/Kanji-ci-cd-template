import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  StyleSheet,
  Text,
  Pressable,
  View,
} from 'react-native';
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize,
} from 'react-native-responsive-dimensions';

const CustomModal = ({
  isLoading,
  onRequestCloseCallback,
  message = 'Please Wait..',
}) => {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={isLoading}
      onRequestClose={() => {
        if (onRequestCloseCallback) onRequestCloseCallback();
      }}>
      <View style={styles.container}>
        <View style={styles.modalView}>
          <ActivityIndicator size={'large'} color={'rgb(8 44 83)'} /> 
          <Text style={styles.modalText}>{message}</Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'gray',
    opacity: 0.9,
  },
  modalView: {
    width: responsiveWidth(80),
    height: responsiveHeight(15),
    opacity: 1,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  modalText: {
    textAlign: 'center',
    fontWeight: 'bold',
    marginTop: responsiveHeight(1),
    color: 'black',
  },
});

export default CustomModal;
