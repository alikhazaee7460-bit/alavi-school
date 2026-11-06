import React from 'react';
import { View, Text, Image, StyleSheet, ImageBackground, useWindowDimensions } from 'react-native';
import { SCHOOL } from '../constants/app';

const BIG_FLAG = require('../../assets/images/big-flag.webp');

const PORTRAITS = [
  { key: 'imam', label: 'امام خمینی', source: require('../../assets/images/portrait-imam.png') },
  { key: 'khamenei', label: 'شهید آیت‌الله امام سید علی خامنه‌ای', source: require('../../assets/images/portrait-khamenei.png') },
  { key: 'mojtaba', label: 'آیت‌الله امام سید مجتبی خامنه‌ای', source: require('../../assets/images/portrait-mojtaba.png') },
];

export function Header() {
  const { width } = useWindowDimensions();
  // ارتفاع بنر بر اساس عرض صفحه
  const bannerHeight = width > 600 ? 350 : 255;

  return (
    <View style={styles.header}>
      
      {/* 🌟 بخش بالایی: عکس پرچم بزرگ که کل عرض را می‌گیرد */}
      <ImageBackground 
        source={BIG_FLAG} 
        style={[styles.flagHeader, { height: bannerHeight }]}
        resizeMode="cover" // این باعث می‌شود عکس کل کادر را پر کند
      >
        {/* سه پرتره در گوشه بالا-راست */}
        <View style={styles.leaders}>
          {PORTRAITS.map((p) => (
            <View key={p.key} style={styles.leaderCard}>
              <Image source={p.source} style={styles.leader} />
              <Text style={styles.leaderName} numberOfLines={2}>{p.label}</Text>
            </View>
          ))}
        </View>
      </ImageBackground>

      {/* 🌟 بخش پایینی: نوار بنفش با عنوان مدرسه */}
      <View style={styles.headerSecond}>
        <Text style={styles.title}>{SCHOOL.name}</Text>
        <Text style={styles.subtitle}>{SCHOOL.subtitle}</Text>
      </View>
      
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    width: '100%',
    backgroundColor: '#74439b',
    overflow: 'hidden',
  },
  flagHeader: {
    position: 'relative',
    width: '100%',
    backgroundColor: '#74439b',
  },
  leaders: {
    position: 'absolute',
    right: 14,
    top: 14,
    flexDirection: 'row-reverse',
    gap: 9,
    alignItems: 'flex-start',
    zIndex: 4,
  },
  leaderCard: {
    alignItems: 'center',
    width: 70,
  },
  leader: {
    width: 58,
    height: 73,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.95)',
    backgroundColor: '#eeeeee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 13,
    elevation: 5,
  },
  leaderName: {
    marginTop: 4,
    fontSize: 7,
    lineHeight: 12,
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  headerSecond: {
    width: '100%',
    minHeight: 78,
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: '#74439b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: 'Vazirmatn-Bold',
    fontSize: 23,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 7,
  },
  subtitle: {
    fontFamily: 'Vazirmatn-Regular',
    fontSize: 14,
    color: 'white',
    opacity: 0.95,
    textAlign: 'center',
  },
});