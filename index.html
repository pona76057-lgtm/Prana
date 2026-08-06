import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet, Text, View, ScrollView, TouchableOpacity, Switch,
  TextInput, SafeAreaView, StatusBar, Dimensions, Alert, Platform, Animated
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import Svg, { Path, Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { LinearGradient as ExpoGradient } from 'expo-linear-gradient';

const { width: screenWidth } = Dimensions.get('window');

export default function ParnaSmartFarmFull() {
  // --- States ---
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState('control');
  const [isAutoMode, setIsAutoMode] = useState(true);

  // --- Config & API ---
  const [serverUrl] = useState('http://202.139.203.218:8080');
  const [deviceToken, setDeviceToken] = useState('PARNA-TOKEN-2026-MAIN');
  const [farmName, setFarmName] = useState('Parna Organic');

  // --- Sensor Data ---
  const [sensors, setSensors] = useState({
    time: '--:--:--',
    soil1: 0, soil2: 0, tank: 0,
    temp: 0.0, hum: 0.0, vpd: 0.0,
  });
  const [history, setHistory] = useState([0, 0, 0, 0, 0, 0, 0]);
  const [relays, setRelays] = useState([false, false, false, false, false, false, false, false]);

  // --- Sync Data from Cloud ---
  useEffect(() => {
    let interval;
    if (isLoggedIn) {
      const fetchData = async () => {
        try {
          let response = await fetch(`${serverUrl}/api/get-device-data`, {
            headers: { 'Authorization': `Bearer ${deviceToken}` }
          });
          if (response.ok) {
            let json = await response.json();
            setSensors({
              time: json.time || '--:--:--',
              soil1: json.soil1 ?? 0,
              soil2: json.soil2 ?? 0,
              tank: json.tank ?? 0,
              temp: json.temp ?? 0.0,
              hum: json.hum ?? 0.0,
              vpd: json.vpd ?? 0.0,
            });
            if (json.relays) setRelays(json.relays);
            setHistory(prev => [...prev.slice(-6), json.soil1 ?? 0]);
          }
        } catch (e) { /* background fail silent */ }
      };
      fetchData();
      interval = setInterval(fetchData, 4000);
    }
    return () => clearInterval(interval);
  }, [isLoggedIn]);

  // --- UI Logic: Dynamic Theme ---
  const getThemeColors = () => {
    if (sensors.hum > 80) return ['#0c4a6e', '#075985', '#0ea5e9']; // Rainy
    const hr = new Date().getHours();
    if (hr >= 18 || hr < 6) return ['#0f172a', '#1e293b', '#334155']; // Night
    return ['#064e3b', '#065f46', '#059669']; // Sunny/Green
  };

  // --- Components ---
  const VPDRiskGauge = ({ value }) => {
    const color = value < 0.8 ? '#38bdf8' : value <= 1.2 ? '#4ade80' : value <= 1.6 ? '#fbbf24' : '#f87171';
    return (
      <View style={styles.glassCard}>
        <Text style={styles.cardHeader}>🌿 วิเคราะห์ความเสี่ยงพืช (VPD)</Text>
        <View style={styles.gaugeContainer}>
          <Svg height="100" width="160" viewBox="0 0 100 60">
            <Path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" strokeLinecap="round" />
            <Path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke={color} strokeWidth="8" strokeDasharray="126" strokeDashoffset={126 - (Math.min(value / 2, 1) * 126)} strokeLinecap="round" />
          </Svg>
          <View style={styles.gaugeTextOverlay}>
            <Text style={[styles.gaugeValue, { color }]}>{value.toFixed(2)}</Text>
            <Text style={{color: '#fff', fontSize: 10}}>kPa</Text>
          </View>
        </View>
        <Text style={styles.statusText}>สถานะ: {value > 1.5 ? '⚠️ อากาศแห้งไป' : '✅ สภาวะปกติ'}</Text>
      </View>
    );
  };

  const BIGraph = ({ data }) => {
    const h = 80; const w = screenWidth - 70;
    const points = data.map((v, i) => `${i * (w / 6)},${h - (v / 100) * h}`).join(' ');
    return (
      <View style={styles.glassCard}>
        <Text style={styles.cardHeader}>📈 สถิติความชื้นดิน (Real-time BI)</Text>
        <Svg height={h} width={w}>
          <Defs>
            <LinearGradient id="g" x1="0" y1="0" x2="0" y2="1"><Stop offset="0" stopColor="#00f5d4" stopOpacity="0.3"/><Stop offset="1" stopColor="#00f5d4" stopOpacity="0"/></LinearGradient>
          </Defs>
          <Path d={`M 0,${h} ${points} ${w},${h}`} fill="url(#g)" />
          <Path d={`M ${points}`} fill="none" stroke="#00f5d4" strokeWidth="3" />
        </Svg>
      </View>
    );
  };

  // --- Main Render ---
  if (!isLoggedIn) {
    return (
      <ExpoGradient colors={['#051611', '#064e3b']} style={styles.fullScreen}>
        <View style={styles.loginContainer}>
          <MaterialCommunityIcons name="leaf" size={80} color="#00f5d4" />
          <Text style={styles.loginTitle}>PARNA SMART FARM</Text>
          <View style={styles.glassInputBox}>
            <TextInput style={styles.input} placeholder="Username" placeholderTextColor="#aaa" value={username} onChangeText={setUsername} />
            <TextInput style={styles.input} placeholder="Password" secureTextEntry placeholderTextColor="#aaa" value={password} onChangeText={setPassword} />
            <TouchableOpacity style={styles.loginBtn} onPress={() => setIsLoggedIn(true)}>
              <Text style={styles.loginBtnText}>CONNECT SYSTEM</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ExpoGradient>
    );
  }

  return (
    <ExpoGradient colors={getThemeColors()} style={styles.fullScreen}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>{farmName}</Text>
            <Text style={styles.headerSub}>● {sensors.time} | Online</Text>
          </View>
          <TouchableOpacity style={styles.profileCircle}><Ionicons name="person" size={20} color="#fff" /></TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>
          {/* Top Metrics */}
          <View style={styles.metricsRow}>
            <View style={styles.miniCard}><Text style={styles.miniVal}>{sensors.temp}°</Text><Text style={styles.miniLab}>Temp</Text></View>
            <View style={styles.miniCard}><Text style={styles.miniVal}>{sensors.hum}%</Text><Text style={styles.miniLab}>Hum</Text></View>
            <View style={styles.miniCard}><Text style={styles.miniVal}>{sensors.tank}%</Text><Text style={styles.miniLab}>Tank</Text></View>
          </View>

          {activeTab === 'control' ? (
            <>
              <VPDRiskGauge value={sensors.vpd} />
              <BIGraph data={history} />
              
              <View style={styles.glassCard}>
                <View style={styles.cardHeaderRow}>
                  <Text style={styles.cardHeader}>🎮 การควบคุมรีเลย์</Text>
                  <Switch value={isAutoMode} onValueChange={setIsAutoMode} trackColor={{true: '#00f5d4'}} />
                </View>
                <View style={styles.relayGrid}>
                  {relays.map((on, i) => (
                    <TouchableOpacity key={i} style={[styles.relayBtn, on && styles.relayBtnOn]}>
                      <MaterialCommunityIcons name={i === 7 ? "water-pump" : "valve"} size={24} color={on ? "#000" : "#00f5d4"} />
                      <Text style={[styles.relayLabel, {color: on ? '#000' : '#fff'}]}>{i === 7 ? 'PUMP' : `V${i+1}`}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </>
          ) : (
            <View style={styles.glassCard}>
              <Text style={styles.cardHeader}>⚙️ ตั้งค่าระบบ</Text>
              <Text style={styles.label}>Farm Name</Text>
              <TextInput style={styles.inputStyle} value={farmName} onChangeText={setFarmName} />
              <Text style={styles.label}>Device Token</Text>
              <TextInput style={styles.inputStyle} value={deviceToken} onChangeText={setDeviceToken} />
              <TouchableOpacity style={styles.saveBtn}><Text style={{fontWeight: 'bold'}}>SAVE CONFIG</Text></TouchableOpacity>
            </View>
          )}
        </ScrollView>

        {/* Tab Bar */}
        <View style={styles.tabBar}>
          <TouchableOpacity onPress={() => setActiveTab('control')}><Ionicons name="grid" size={24} color={activeTab === 'control' ? '#00f5d4' : '#fff'} /></TouchableOpacity>
          <TouchableOpacity onPress={() => setActiveTab('settings')}><Ionicons name="settings" size={24} color={activeTab === 'settings' ? '#00f5d4' : '#fff'} /></TouchableOpacity>
        </View>
      </SafeAreaView>
    </ExpoGradient>
  );
}

const styles = StyleSheet.create({
  fullScreen: { flex: 1 },
  loginContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 },
  loginTitle: { color: '#00f5d4', fontSize: 24, fontWeight: '900', marginVertical: 20 },
  glassInputBox: { width: '100%', padding: 25, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 30, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  input: { height: 50, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.2)', color: '#fff', marginBottom: 20 },
  loginBtn: { backgroundColor: '#00f5d4', height: 50, borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  loginBtnText: { fontWeight: 'bold', letterSpacing: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, alignItems: 'center' },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  headerSub: { color: '#00f5d4', fontSize: 12 },
  profileCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  glassCard: { backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 25, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  cardHeader: { color: '#fff', fontWeight: 'bold', fontSize: 16, marginBottom: 15 },
  metricsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  miniCard: { width: '30%', backgroundColor: 'rgba(255,255,255,0.15)', padding: 15, borderRadius: 20, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  miniVal: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  miniLab: { color: 'rgba(255,255,255,0.6)', fontSize: 10 },
  gaugeContainer: { alignItems: 'center', justifyContent: 'center' },
  gaugeTextOverlay: { position: 'absolute', top: 30, alignItems: 'center' },
  gaugeValue: { fontSize: 22, fontWeight: 'bold' },
  statusText: { textAlign: 'center', color: '#fff', marginTop: 10, fontSize: 12 },
  relayGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  relayBtn: { width: '23%', aspectRatio: 1, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginBottom: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  relayBtnOn: { backgroundColor: '#00f5d4' },
  relayLabel: { fontSize: 9, fontWeight: 'bold', marginTop: 5 },
  tabBar: { position: 'absolute', bottom: 30, left: 60, right: 60, height: 60, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 30, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  inputStyle: { backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 10, padding: 12, color: '#fff', marginBottom: 15 },
  label: { color: '#00f5d4', fontSize: 12, marginBottom: 5 },
  saveBtn: { backgroundColor: '#00f5d4', padding: 15, borderRadius: 12, alignItems: 'center' },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }
});
