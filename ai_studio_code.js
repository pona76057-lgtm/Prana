import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet, Text, View, ScrollView, TouchableOpacity, Switch,
  TextInput, SafeAreaView, StatusBar, Dimensions, Alert, Platform, Animated
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import Svg, { Path, Circle, Defs, LinearGradient, Stop, G, Rect } from 'react-native-svg';
import { LinearGradient as ExpoGradient } from 'expo-linear-gradient'; // ต้องติดตั้ง expo-linear-gradient

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function SmartFarmPro() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState('control');
  const [weatherStatus, setWeatherStatus] = useState('sunny'); // sunny, rainy, night

  // --- ข้อมูลจำลอง (Mock Data) ---
  const [sensors, setSensors] = useState({
    time: '14:30:05',
    soil1: 65, soil2: 58, tank: 82,
    temp: 32.5, hum: 45.0, vpd: 1.25,
  });

  const [history] = useState([40, 45, 30, 55, 70, 65, 80]);
  const [relays, setRelays] = useState([false, true, false, false, false, false, false, true]);

  // --- Dynamic Theme Logic ---
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 18 || hour < 6) setWeatherStatus('night');
    else if (sensors.hum > 80) setWeatherStatus('rainy');
    else setWeatherStatus('sunny');
  }, [sensors.hum]);

  const getThemeColors = () => {
    if (weatherStatus === 'night') return ['#0f172a', '#1e293b', '#334155'];
    if (weatherStatus === 'rainy') return ['#0c4a6e', '#075985', '#0ea5e9'];
    return ['#064e3b', '#065f46', '#059669']; // Sunny/Green
  };

  // --- UI Components ---
  
  // 1. วิดเจ็ตเข็มไมล์ VPD (Risk Gauge)
  const VPDRiskWidget = ({ value }) => {
    const getRiskColor = (v) => {
      if (v < 0.8) return '#38bdf8'; // Cold/Wet
      if (v <= 1.2) return '#4ade80'; // Optimal
      if (v <= 1.6) return '#fbbf24'; // Warning
      return '#f87171'; // Danger
    };

    return (
      <View style={styles.glassCard}>
        <Text style={styles.cardHeader}>🌿 วิเคราะห์ค่าความดันไอ (VPD)</Text>
        <View style={styles.gaugeContainer}>
          <Svg height="100" width="160" viewBox="0 0 100 60">
            <Path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#334155" strokeWidth="8" strokeLinecap="round" />
            <Path 
              d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke={getRiskColor(value)} 
              strokeWidth="8" strokeDasharray="126" strokeDashoffset={126 - (Math.min(value / 2, 1) * 126)} 
              strokeLinecap="round" 
            />
          </Svg>
          <View style={styles.gaugeTextOverlay}>
            <Text style={[styles.gaugeValue, { color: getRiskColor(value) }]}>{value.toFixed(2)}</Text>
            <Text style={styles.gaugeUnit}>kPa</Text>
          </View>
        </View>
        <Text style={styles.riskStatusText}>สถานะ: {value > 1.6 ? '⚠️ เสี่ยงพืชคายน้ำสูง' : '✅ ปกติเหมาะสม'}</Text>
      </View>
    );
  };

  // 2. กราฟสวยแบบ Power BI (Area Chart)
  const BIChart = ({ data }) => {
    const h = 100;
    const w = screenWidth - 60;
    const step = w / (data.length - 1);
    let points = data.map((v, i) => `${i * step},${h - (v / 100) * h}`).join(' ');
    let fillPoints = `0,${h} ${points} ${w},${h}`;

    return (
      <View style={styles.glassCard}>
        <Text style={styles.cardHeader}>📈 สถิติความชื้น 24 ชม.</Text>
        <Svg height={h} width={w}>
          <Defs>
            <LinearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor="#00f5d4" stopOpacity="0.4" />
              <Stop offset="1" stopColor="#00f5d4" stopOpacity="0" />
            </LinearGradient>
          </Defs>
          <Path d={`M ${points}`} fill="none" stroke="#00f5d4" strokeWidth="3" />
          <Path d={`M ${fillPoints}`} fill="url(#grad)" />
          {data.map((v, i) => (
            <Circle key={i} cx={i * step} cy={h - (v / 100) * h} r="4" fill="#fff" />
          ))}
        </Svg>
      </View>
    );
  };

  if (!isLoggedIn) {
    return (
      <ExpoGradient colors={getThemeColors()} style={styles.fullScreen}>
        <SafeAreaView style={styles.centerBox}>
           <View style={styles.loginGlass}>
              <MaterialCommunityIcons name="clover" size={80} color="#00f5d4" />
              <Text style={styles.loginTitle}>PARNA SMART</Text>
              <TextInput style={styles.glassInput} placeholder="Username" placeholderTextColor="#aaa" />
              <TextInput style={styles.glassInput} placeholder="Password" secureTextEntry placeholderTextColor="#aaa" />
              <TouchableOpacity style={styles.glowButton} onPress={() => setIsLoggedIn(true)}>
                <Text style={styles.buttonText}>LAUNCH SYSTEM</Text>
              </TouchableOpacity>
           </View>
        </SafeAreaView>
      </ExpoGradient>
    );
  }

  return (
    <ExpoGradient colors={getThemeColors()} style={styles.fullScreen}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={{ flex: 1 }}>
        {/* Modern Header */}
        <View style={styles.header}>
           <View>
             <Text style={styles.headerBrand}>PARNA ORGANIC</Text>
             <Text style={styles.headerStatus}>● System Online | {sensors.time}</Text>
           </View>
           <TouchableOpacity style={styles.iconCircle}>
             <Ionicons name="notifications" size={20} color="#fff" />
           </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.mainScroll} showsVerticalScrollIndicator={false}>
          {/* Quick Metrics Grid */}
          <View style={styles.row}>
             <View style={styles.miniGlassCard}>
                <Ionicons name="thermometer" size={20} color="#ff9f43" />
                <Text style={styles.miniVal}>{sensors.temp}°C</Text>
                <Text style={styles.miniLabel}>Air Temp</Text>
             </View>
             <View style={styles.miniGlassCard}>
                <MaterialCommunityIcons name="water-percent" size={20} color="#48dbfb" />
                <Text style={styles.miniVal}>{sensors.hum}%</Text>
                <Text style={styles.miniLabel}>Humidity</Text>
             </View>
             <View style={styles.miniGlassCard}>
                <FontAwesome5 name="fill-drip" size={18} color="#00d2d3" />
                <Text style={styles.miniVal}>{sensors.tank}%</Text>
                <Text style={styles.miniLabel}>Water</Text>
             </View>
          </View>

          {/* New Analytics Widgets */}
          <VPDRiskWidget value={sensors.vpd} />
          
          <BIChart data={history} />

          {/* Relay Control */}
          <View style={styles.glassCard}>
             <Text style={styles.cardHeader}>🎮 Control Panel</Text>
             <View style={styles.relayGrid}>
                {relays.map((on, i) => (
                  <TouchableOpacity 
                    key={i} 
                    style={[styles.glassRelay, on && styles.relayOn]}
                    onPress={() => {
                        let newR = [...relays];
                        newR[i] = !newR[i];
                        setRelays(newR);
                    }}
                  >
                    <MaterialCommunityIcons 
                      name={i === 7 ? "water-pump" : "valve"} 
                      size={24} 
                      color={on ? "#000" : "#00f5d4"} 
                    />
                    <Text style={[styles.relayLabel, { color: on ? "#000" : "#fff" }]}>
                      {i === 7 ? 'MAIN PUMP' : `VALVE ${i+1}`}
                    </Text>
                  </TouchableOpacity>
                ))}
             </View>
          </View>
        </ScrollView>

        {/* Floating Navbar */}
        <View style={styles.floatingNav}>
           <TouchableOpacity style={styles.navBtn} onPress={() => setActiveTab('control')}>
              <Ionicons name="apps" size={24} color={activeTab === 'control' ? '#00f5d4' : '#fff'} />
           </TouchableOpacity>
           <TouchableOpacity style={styles.navBtn} onPress={() => setActiveTab('settings')}>
              <Ionicons name="settings" size={24} color={activeTab === 'settings' ? '#00f5d4' : '#fff'} />
           </TouchableOpacity>
        </View>
      </SafeAreaView>
    </ExpoGradient>
  );
}

const styles = StyleSheet.create({
  fullScreen: { flex: 1 },
  mainScroll: { padding: 20, paddingBottom: 100 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    alignItems: 'center'
  },
  headerBrand: { fontSize: 22, fontWeight: '900', color: '#fff', letterSpacing: 1 },
  headerStatus: { color: '#00f5d4', fontSize: 12, fontWeight: '600' },
  iconCircle: { width: 45, height: 45, borderRadius: 22.5, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  
  // Glassmorphism Styles
  glassCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
  },
  cardHeader: { color: '#fff', fontSize: 16, fontWeight: '700', marginBottom: 15 },
  
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  miniGlassCard: {
    width: '30%',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 20,
    padding: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  miniVal: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginVertical: 5 },
  miniLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 10, fontWeight: '600' },

  // Gauge Styles
  gaugeContainer: { alignItems: 'center', justifyContent: 'center' },
  gaugeTextOverlay: { position: 'absolute', top: 30, alignItems: 'center' },
  gaugeValue: { fontSize: 24, fontWeight: 'bold' },
  gaugeUnit: { color: '#fff', fontSize: 10 },
  riskStatusText: { textAlign: 'center', color: '#fff', marginTop: 10, fontSize: 13, fontWeight: '600' },

  // Control Grid
  relayGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  glassRelay: {
    width: '48%',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 18,
    padding: 15,
    marginBottom: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  relayOn: { backgroundColor: '#00f5d4' },
  relayLabel: { fontSize: 11, fontWeight: '800', marginTop: 8 },

  // Login
  centerBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loginGlass: {
    width: screenWidth * 0.85,
    padding: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 40,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  loginTitle: { color: '#fff', fontSize: 24, fontWeight: '900', marginVertical: 20 },
  glassInput: {
    width: '100%',
    height: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    paddingHorizontal: 20,
    color: '#fff',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  glowButton: {
    width: '100%',
    height: 55,
    backgroundColor: '#00f5d4',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#00f5d4',
    shadowRadius: 15,
    shadowOpacity: 0.5,
  },
  buttonText: { fontWeight: '900', color: '#000' },

  // Nav
  floatingNav: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    height: 70,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 35,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  navBtn: { padding: 10 }
});