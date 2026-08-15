
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'dart:convert';
import 'package:http/http.dart' as http;

void main() => runApp(const ParnaOrganicApp());

class ParnaOrganicApp extends StatelessWidget {
  const ParnaOrganicApp({Key? key}) : super(key: key);
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Parna Organic',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        brightness: Brightness.dark,
        scaffoldBackgroundColor: const Color(0xFF0B132B),
        cardColor: const Color(0xFF1C2541),
        primaryColor: const Color(0xFF4ADE80),
        colorScheme: const ColorScheme.dark(
          primary: Color(0xFF4ADE80),
          secondary: Color(0xFF38BDF8),
          surface: Color(0xFF1C2541),
        ),
        fontFamily: 'Roboto',
      ),
      home: const MainNavigationScreen(),
    );
  }
}

class MainNavigationScreen extends StatefulWidget {
  const MainNavigationScreen({Key? key}) : super(key: key);

  @override
  _MainNavigationScreenState createState() => _MainNavigationScreenState();
}

class _MainNavigationScreenState extends State<MainNavigationScreen> {
  int _currentIndex = 0;
  final String serverIp = '202.139.203.218';
  final int serverPort = 8080;
  final String deviceToken = 'PARNA-TOKEN-2026-MAIN';
  @override
  Widget build(BuildContext context) {
    final List<Widget> pages = [
      DashboardTab(serverIp: serverIp, serverPort: serverPort, deviceToken: deviceToken),
      AnalyticsTab(serverIp: serverIp, serverPort: serverPort, deviceToken: deviceToken),
      SettingsTab(serverIp: serverIp, serverPort: serverPort, deviceToken: deviceToken),
      PlantConditionTab(serverIp: serverIp, serverPort: serverPort, deviceToken: deviceToken),
    ];

    return Scaffold(
      body: pages[_currentIndex],
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          boxShadow: [
            BoxShadow(color: Colors.black.withOpacity(0.3), blurRadius: 10, offset: const Offset(0, -5))
          ],
        ),
        child: BottomNavigationBar(
          currentIndex: _currentIndex,
          backgroundColor: const Color(0xFF1C2541),
          selectedItemColor: const Color(0xFF4ADE80),
          unselectedItemColor: Colors.white54,
          type: BottomNavigationBarType.fixed,
          elevation: 10,
          onTap: (index) {
            setState(() {
              _currentIndex = index;
            });
          },
          items: const [
            BottomNavigationBarItem(icon: Icon(Icons.dashboard_rounded), label: 'หน้าแรก 📊'),
            BottomNavigationBarItem(icon: Icon(Icons.analytics_rounded), label: 'สถิติ 📈'),
            BottomNavigationBarItem(icon: Icon(Icons.settings_rounded), label: 'ตั้งค่า ⚙️'),
            BottomNavigationBarItem(icon: Icon(Icons.eco_rounded), label: 'สุขภาพพืช 🤭☘️'),
          ],
        ),
      ),
    );
  }
}

// ==================== 1. แท็บหน้าแรก (DASHBOARD) ====================
class DashboardTab extends StatefulWidget {
  final String serverIp;
  final int serverPort;
  final String deviceToken;
  const DashboardTab({Key? key, required this.serverIp, required this.serverPort, required this.deviceToken}) : super(key: key);

  @override
  _DashboardTabState createState() => _DashboardTabState();
}

class _DashboardTabState extends State<DashboardTab> {
  List<bool> relayStates = List<bool>.filled(8, false);
  bool isAutoMode = true;
  int soil1 = 30;
  int soil2 = 25;
  int tankLevel = 80;
  double temp = 28.5;
  double humidity = 82.0;
  double vpd = 1.1;
  String diseaseRisk = "สูง (High) 🔴 อันตราย 🥵";
  String diseaseAdvice = "เสี่ยงสูงเกิดโรคราน้ำค้างและเชื้อรา ควร รีบระบายอากาศและพ่นยา 🤭🦠";
  bool isSyncing = false;

  @override
  void initState() {
    super.initState();
    _syncDataFromBoard();
  }

  Future<void> _syncDataFromBoard() async {
    if (isSyncing) return;
    setState(() => isSyncing = true);
    
    try {
      final url = Uri.parse('http://${widget.serverIp}:${widget.serverPort}/api/device-sync');
      final response = await http.get(
        url,
        headers: {'Authorization': 'Bearer ${widget.deviceToken}'},
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        setState(() {
          soil1 = data['soil1'] ?? soil1;
          soil2 = data['soil2'] ?? soil2;
          tankLevel = data['tankLevel'] ?? tankLevel;
          temp = (data['temperature'] as num?)?.toDouble() ?? temp;
          humidity = (data['airHumidity'] as num?)?.toDouble() ?? humidity;
          vpd = (data['vpd'] as num?)?.toDouble() ?? vpd;
          
          if (data.containsKey('isAuto')) isAutoMode = data['isAuto'];
          if (data.containsKey('diseaseRisk')) diseaseRisk = data['diseaseRisk'];
          if (data.containsKey('diseaseAdvice')) diseaseAdvice = data['diseaseAdvice'];
          
          if (data.containsKey('relays')) {
            List fetchedRelays = data['relays'];
            for (int i = 0; i < fetchedRelays.length && i < relayStates.length; i++) {
              relayStates[i] = fetchedRelays[i];
            }
          }
        });
      }
    } catch (e) {
      debugPrint('Sync Error: $e');
    } finally {
      setState(() => isSyncing = false);
    }
  }
  Future<void> _toggleRelay(int channel, bool state) async {
    setState(() {
      relayStates[channel] = state;
    });

    try {
      final url = Uri.parse('http://${widget.serverIp}:${widget.serverPort}/api/device-sync');
      await http.post(
        url,
        headers: {'Content-Type': 'application/json', 'Authorization': 'Bearer ${widget.deviceToken}'},
        body: jsonEncode({
          'token': widget.deviceToken,
          'action': 'relay',
          'channel': channel,
          'state': state,
          'relays': relayStates,
        }),
      );
      _syncDataFromBoard();
    } catch (e) {
      debugPrint('Toggle Relay Error: $e');
    }
  }

  Future<void> _toggleAutoMode(bool val) async {
    setState(() {
      isAutoMode = val;
    });

    try {
      final url = Uri.parse('http://${widget.serverIp}:${widget.serverPort}/api/device-sync');
      await http.post(
        url,
        headers: {'Content-Type': 'application/json', 'Authorization': 'Bearer ${widget.deviceToken}'},
        body: jsonEncode({
          'token': widget.deviceToken,
          'isAuto': isAutoMode,
        }),
      );
      _syncDataFromBoard();
    } catch (e) {
      debugPrint('Toggle Auto Mode Error: $e');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Row(
              children: const [
                Icon(Icons.eco_rounded, color: Color(0xFF4ADE80), size: 28),
                SizedBox(width: 8),
                Text('Parna Organic', style: TextStyle(color: Color(0xFF4ADE80), fontWeight: FontWeight.bold, fontSize: 20)),
              ],
            ),
            Row(
              children: [
                const Icon(Icons.access_time_rounded, size: 16, color: Colors.white70),
                const SizedBox(width: 4),
                Text('${DateTime.now().hour.toString().padLeft(2, '0')}:${DateTime.now().minute.toString().padLeft(2, '0')}', style: const TextStyle(fontSize: 14, color: Colors.white75, fontWeight: FontWeight.w600)),
              ],
            )
          ],
        ),
        backgroundColor: const Color(0xFF1C2541),
        elevation: 0,
      ),

//09:07 Pongpun.n // [ส่วนที่ 9/20] การแสดงผลการ์ดเซ็นเซอร์ต่างๆ ในหน้าแรก
      body: ListView(
        padding: const EdgeInsets.all(16.0),
        children: [
          Row(
            children: [
              _buildSensorCard('🌱 ความชื้นดิน 1', 'Soil Moisture 1', '$soil1%', const Color(0xFF4ADE80)),
              const SizedBox(width: 12),
              _buildSensorCard('💧 ระดับน้ำแท็งก์', 'Tank Level', '$tankLevel%', const Color(0xFF38BDF8)),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              _buildSensorCard('🌡️ อุณหภูมิอากาศ', 'Temperature', '${temp.toStringAsFixed(0)}°C', const Color(0xFFFB923C)),
              const SizedBox(width: 12),
              _buildSensorCard('☁️ ความชื้นอากาศ', 'Air Humidity', '${humidity.toStringAsFixed(0)}%', const Color(0xFFC084FC)),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              _buildSensorCard('🌱 ความชื้นดิน 2', 'Soil Moisture 2', '$soil2%', const Color(0xFF4ADE80)),
              const SizedBox(width: 12),
              _buildSensorCard('🛡️ VPD (ความดันไอ)', 'Vapor Pressure', '${vpd.toStringAsFixed(2)} kPa', const Color(0xFFFACC15)),
            ],
          ),
          const SizedBox(height: 20),

//09:07 Pongpun.n // [ส่วนที่ 10/20] การ์ดวิเคราะห์ความเสี่ยงโรคพืช
          Container(
            decoration: BoxDecoration(
              gradient: const LinearGradient(colors: [Color(0xFF1C2541), Color(0xFF0B132B)]),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: const Color(0xFF4ADE80).withOpacity(0.3)),
            ),
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('🛡️ วิเคราะห์ความเสี่ยงโรคพืช', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16)),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(color: const Color(0xFF4ADE80).withOpacity(0.2), borderRadius: BorderRadius.circular(20)),
                        child: const Text('🟢 ปลอดภัย', style: TextStyle(color: Color(0xFF4ADE80), fontSize: 12, fontWeight: FontWeight.bold)),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  const Text('✅ สภาพแวดล้อมเหมาะสม ไม่พบความเสี่ยงโรคพืชในขณะนี้', style: TextStyle(color: Colors.white70, fontSize: 13)),
                  const SizedBox(height: 12),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      _smallInfoCol('VPD', '${vpd.toStringAsFixed(2)} kPa'),
                      _smallInfoCol('ความชื้นอากาศ', '${humidity.toStringAsFixed(0)} %'),
                      _smallInfoCol('อุณหภูมิ', '${temp.toStringAsFixed(1)} °C'),
                      _smallInfoCol('ความชื้นดิน', '$soil1 %'),
                    ],
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 20),

//09:07 Pongpun.n // [ส่วนที่ 11/20] ส่วนควบคุมรีเลย์ระบบน้ำ (Grid ปุ่มวาล์วทั้งหมด)
          Container(
            decoration: BoxDecoration(
              color: const Color(0xFF1C2541),
              borderRadius: BorderRadius.circular(16),
              boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.2), blurRadius: 8, offset: const Offset(0, 4))],
            ),
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('🎛️ ควบคุมรีเลย์ระบบน้ำ', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
                      Row(
                        children: [
                          const Text('🤖 AUTO', style: TextStyle(color: Color(0xFF4ADE80), fontSize: 13, fontWeight: FontWeight.bold)),
                          const SizedBox(width: 4),
                          Switch(
                            value: isAutoMode,
                            activeColor: const Color(0xFF4ADE80),
                            onChanged: _toggleAutoMode,
                          ),
                        ],
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  GridView.count(
                    crossAxisCount: 4,
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    mainAxisSpacing: 10,
                    crossAxisSpacing: 10,
                    childAspectRatio: 0.85,
                    children: [
                      _buildRelayButtonCard(0, 'วาล์ว 1', Icons.settings_rounded),
                      _buildRelayButtonCard(1, 'วาล์ว 2', Icons.settings_rounded),
                      _buildRelayButtonCard(2, 'วาล์ว 3', Icons.settings_rounded),
                      _buildRelayButtonCard(3, 'วาล์ว 4', Icons.settings_rounded),
                      _buildRelayButtonCard(4, 'วาล์ว 5', Icons.settings_rounded),
                      _buildRelayButtonCard(5, 'วาล์ว 6', Icons.settings_rounded),
                      _buildRelayButtonCard(6, 'วาล์ว 7', Icons.science_rounded),
                      _buildRelayButtonCard(7, 'ปั๊มน้ำ', Icons.water_drop_rounded),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
  Widget _buildSensorCard(String title, String subtitle, String value, Color accentColor) {
    return Expanded(
      child: Container(
        decoration: BoxDecoration(
          color: const Color(0xFF1C2541),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: accentColor.withOpacity(0.3), width: 1.2),
        ),
        child: Padding(
          padding: const EdgeInsets.all(14.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(title, style: TextStyle(color: accentColor, fontWeight: FontWeight.bold, fontSize: 13)),
              if (subtitle.isNotEmpty) Text(subtitle, style: const TextStyle(color: Colors.white54, fontSize: 10)),
              const SizedBox(height: 10),
              Text(value, style: const TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.bold)),
            ],
          ),
        ),
      ),
    );
  }

  Widget _smallInfoCol(String label, String val) {
    return Column(
      children: [
        Text(label, style: const TextStyle(color: Colors.white54, fontSize: 11)),
        const SizedBox(height: 2),
        Text(val, style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
      ],
    );
  }

  Widget _buildRelayButtonCard(int index, String label, IconData icon) {
    bool isOn = relayStates[index];
    return GestureDetector(
      onTap: () => _toggleRelay(index, !isOn),
      child: Container(
        decoration: BoxDecoration(
          color: isOn ? const Color(0xFF0B132B) : const Color(0xFF162038),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isOn ? const Color(0xFF4ADE80) : Colors.white12,
            width: isOn ? 1.5 : 1.0,
          ),
          boxShadow: isOn ? [BoxShadow(color: const Color(0xFF4ADE80).withOpacity(0.2), blurRadius: 6, spreadRadius: 1)] : [],
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, color: isOn ? const Color(0xFF4ADE80) : Colors.white60, size: 24),
            const SizedBox(height: 6),
            Text(label, style: TextStyle(color: isOn ? const Color(0xFF4ADE80) : Colors.white70, fontSize: 11, fontWeight: FontWeight.bold)),
            const SizedBox(height: 4),
            Container(
              width: 8,
              height: 8,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: isOn ? const Color(0xFF4ADE80) : Colors.redAccent,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
// ==================== 2. แท็บสถิติ (ANALYTICS) ====================
class AnalyticsTab extends StatelessWidget {
  final String serverIp;
  final int serverPort;
  final String deviceToken;
  const AnalyticsTab({Key? key, required this.serverIp, required this.serverPort, required this.deviceToken}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('📈 สถิติและกราฟย้อนหลัง'), backgroundColor: const Color(0xFF1C2541)),
      body: ListView(
        padding: const EdgeInsets.all(16.0),
        children: const [
          Card(child: Padding(padding: EdgeInsets.all(16.0), child: Text('ความชื้นในดิน (7 วันย้อนหลัง) - แปลงที่ 1\n[ พื้นที่แสดงกราฟ ] 🌱', style: TextStyle(fontSize: 16)))),
          SizedBox(height: 16),
          Card(child: Padding(padding: EdgeInsets.all(16.0), child: Text('สถิติระดับน้ำในถังเก็บ\n[ พื้นที่แสดงกราฟ ] 💧', style: TextStyle(fontSize: 16)))),
          SizedBox(height: 16),
          Card(child: Padding(padding: EdgeInsets.all(16.0), child: Text('แนวโน้มอุณหภูมิและความชื้นอากาศ\n[ พื้นที่แสดงกราฟ ] 🌡️', style: TextStyle(fontSize: 16)))),
        ],
      ),
    );
  }
}
// ==================== 3. แท็บตั้งค่า (SETTINGS) ====================
class SettingsTab extends StatefulWidget {
  final String serverIp;
  final int serverPort;
  final String deviceToken;
  const SettingsTab({Key? key, required this.serverIp, required this.serverPort, required this.deviceToken}) : super(key: key);

  @override
  _SettingsTabState createState() => _SettingsTabState();
}

class _SettingsTabState extends State<SettingsTab> {
  bool isAutoMode = true;
  bool usePump = true;
  List<int> valveDurationMin = [5, 5, 5, 5, 5, 5]; 
  int pumpDelaySec = 3;      

  final String mainToken = 'PARNA-TOKEN-2026-MAIN';
  final String bed1Token = 'PARNA-TOKEN-BED1-2026';
  final String bed2Token = 'PARNA-TOKEN-BED2-2026';

  @override
  void initState() {
    super.initState();
    _loadSettingsFromServer();
  }
  Future<void> _loadSettingsFromServer() async {
    try {
      final url = Uri.parse('http://${widget.serverIp}:${widget.serverPort}/api/device-sync');
      final response = await http.get(
        url,
        headers: {'Authorization': 'Bearer ${widget.deviceToken}'},
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        setState(() {
          if (data.containsKey('isAuto')) isAutoMode = data['isAuto'];
          if (data.containsKey('usePump')) usePump = data['usePump'];
          
          if (data.containsKey('valveDurationMin')) {
            List fetchedDur = data['valveDurationMin'];
            for (int i = 0; i < fetchedDur.length && i < valveDurationMin.length; i++) {
              valveDurationMin[i] = fetchedDur[i];
            }
          }

          if (data.containsKey('pumpDelay')) {
            pumpDelaySec = data['pumpDelay'];
          } else if (data.containsKey('pumpDelaySec')) {
            pumpDelaySec = data['pumpDelaySec'];
          }
        });
      }
    } catch (e) {
      debugPrint('Load Settings Error: $e');
    }
  }

  void _copyToClipboard(String tokenText, String labelName) {
    Clipboard.setData(ClipboardData(text: tokenText));
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('คัดลอก $labelName สำเร็จ! 📋', style: const TextStyle(color: Colors.white)), backgroundColor: const Color(0xFF1C2541)),
    );
  }

  Future<void> _saveSettings() async {
    try {
      final url = Uri.parse('http://${widget.serverIp}:${widget.serverPort}/api/device-sync');
      await http.post(
        url,
        headers: {'Content-Type': 'application/json', 'Authorization': 'Bearer ${widget.deviceToken}'},
        body: jsonEncode({
          'token': widget.deviceToken,
          'isAuto': isAutoMode,
          'usePump': usePump,
          'valveDurationMin': valveDurationMin,
          'pumpDelay': pumpDelaySec,
          'pumpDelaySec': pumpDelaySec,
        }),
      );
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('บันทึกการตั้งค่าสำเร็จ! 🚀')));
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('เกิดข้อผิดพลาด: $e')));
    }
  }
  Widget _buildValveTimerRow(int valveIndex) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text('วาล์ว ${valveIndex + 1}: ${valveDurationMin[valveIndex]} นาที', style: const TextStyle(fontSize: 14)),
          Row(
            children: [
              IconButton(
                icon: const Icon(Icons.remove_circle_rounded, color: Colors.redAccent, size: 26),
                onPressed: () {
                  setState(() {
                    if (valveDurationMin[valveIndex] > 1) valveDurationMin[valveIndex] -= 1;
                  });
                },
              ),
              Text('${valveDurationMin[valveIndex]}', style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
              IconButton(
                icon: const Icon(Icons.add_circle_rounded, color: Color(0xFF4ADE80), size: 26),
                onPressed: () {
                  setState(() {
                    if (valveDurationMin[valveIndex] < 120) valveDurationMin[valveIndex] += 1;
                  });
                },
              ),
            ],
          ),
        ],
      ),
    );
  }
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('⚙️ ตั้งค่าระบบฟาร์ม'), backgroundColor: const Color(0xFF1C2541)),
      body: ListView(
        padding: const EdgeInsets.all(16.0),
        children: [
          SwitchListTile(
            title: const Text('โหมดอัตโนมัติ (SPV และตั้งเวลา)', style: TextStyle(fontWeight: FontWeight.bold)),
            value: isAutoMode,
            activeColor: const Color(0xFF4ADE80),
            onChanged: (val) => setState(() => isAutoMode = val),
          ),
          const Divider(color: Colors.white24),
          const Text('⏱️ ตั้งเวลาเปิดวาล์วกันลืม (วาล์ว 1-6 หน่วยเป็นนาที)', style: TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF4ADE80))),
          const SizedBox(height: 6),
          
          ...List.generate(6, (index) => _buildValveTimerRow(index)),

          const Divider(color: Colors.white24),
          const Text('⚙️ หน่วงเวลาปั๊มน้ำหลัก (Pump Delay)', style: TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF4ADE80))),
          Padding(
            padding: const EdgeInsets.symmetric(vertical: 8.0),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('หน่วงเวลา: $pumpDelaySec วินาที', style: const TextStyle(fontSize: 15)),
                Row(
                  children: [
                    IconButton(
                      icon: const Icon(Icons.remove_circle_rounded, color: Colors.redAccent, size: 30),
                      onPressed: () {
                        setState(() {
                          if (pumpDelaySec > 0) pumpDelaySec -= 1;
                        });
                      },
                    ),
                    Text('$pumpDelaySec', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                    IconButton(
                      icon: const Icon(Icons.add_circle_rounded, color: Color(0xFF4ADE80), size: 30),
                      onPressed: () {
                        setState(() {
                          if (pumpDelaySec < 60) pumpDelaySec += 1;
                        });
                      },
                    ),
                  ],
                ),
              ],
            ),
          ),
          const Divider(color: Colors.white24),
          const Text('🔑 จัดการรหัสอุปกรณ์ (Token สำหรับบอร์ด)', style: TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF4ADE80))),
          ListTile(
            title: const Text('บอร์ดหลัก (NodeMCU)'),
            subtitle: Text(mainToken, style: const TextStyle(color: Color(0xFF4ADE80))),
            trailing: IconButton(
              icon: const Icon(Icons.copy_rounded, color: Colors.white70),
              onPressed: () => _copyToClipboard(mainToken, 'Token บอร์ดหลัก'),
            ),
          ),
          ListTile(
            title: const Text('Wemos แปลงที่ 1'),
            subtitle: Text(bed1Token, style: const TextStyle(color: Color(0xFF4ADE80))),
            trailing: IconButton(
              icon: const Icon(Icons.copy_rounded, color: Colors.white70),
              onPressed: () => _copyToClipboard(bed1Token, 'Token Wemos แปลง 1'),
            ),
          ),
          ListTile(
            title: const Text('Wemos แปลงที่ 2'),
            subtitle: Text(bed2Token, style: const TextStyle(color: Color(0xFF4ADE80))),
            trailing: IconButton(
              icon: const Icon(Icons.copy_rounded, color: Colors.white70),
              onPressed: () => _copyToClipboard(bed2Token, 'Token Wemos แปลง 2'),
            ),
          ),
          const Divider(color: Colors.white24),
          const SizedBox(height: 10),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF4ADE80),
              foregroundColor: const Color(0xFF0B132B),
              padding: const EdgeInsets.symmetric(vertical: 14),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
            onPressed: _saveSettings,
            child: const Text('บันทึกการตั้งค่า 💾', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }
}
// ==================== 4. แท็บสุขภาพพืช (PLANT CONDITION) ====================
class PlantConditionTab extends StatelessWidget {
  final String serverIp;
  final int serverPort;
  final String deviceToken;
  const PlantConditionTab({Key? key, required this.serverIp, required this.serverPort, required this.deviceToken}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('สภาพพืชและความเสี่ยง 🤭☘️😂'), backgroundColor: const Color(0xFF1C2541)),
      body: ListView(
        padding: const EdgeInsets.all(16.0),
        children: const [
          Card(
            child: Padding(
              padding: EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('🚨 ประเมินความเสี่ยงโรคพืช 🦠', style: TextStyle(color: Colors.redAccent, fontSize: 18, fontWeight: FontWeight.bold)),
                  SizedBox(height: 8),
                  Text('สูง (High) 🔴 อันตราย 🥵', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
                  SizedBox(height: 4),
                  Text('เสี่ยงสูงเกิดโรคราน้ำค้างและเชื้อรา ควร รีบระบายอากาศและพ่นยา 🤭🦠', style: TextStyle(color: Colors.white70)),
                ],
              ),
            ),
          ),
          SizedBox(height: 16),
          Card(
            child: Padding(
              padding: EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('⚠️ การขาดธาตุอาหารพืช ☘️', style: TextStyle(color: Colors.amberAccent, fontSize: 18, fontWeight: FontWeight.bold)),
                  SizedBox(height: 8),
                  Text('ปานกลาง (Moderate) 🟡 ระดับเฝ้าระวัง 🥲', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
                  SizedBox(height: 4),
                  Text('พบสัญญาณเบื้องต้นของการขาดธาตุไนโตรเจน (ใบแก่เหลือง) ในแปลงปลูกที่ 2 ☘️🪾', style: TextStyle(color: Colors.white70)),
                ],
              ),
            ),
          ),
          SizedBox(height: 16),
          Card(
            child: Padding(
              padding: EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('🐜 รายงานแมลงศัตรูพืช 🌴', style: TextStyle(color: Color(0xFF4ADE80), fontSize: 18, fontWeight: FontWeight.bold)),
                  SizedBox(height: 8),
                  Text('ต่ำ (Low) 🟢 ปลอดภัย 😚', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
                  SizedBox(height: 4),
                  Text('พบเพลี้ยอ่อนระบาดเล็กน้อยในแปลงปลูกที่ 1 ไม่ต้องดำเนินการทันที ให้เฝ้าระวังต่อ 🐜🌴', style: TextStyle(color: Colors.white70)),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
