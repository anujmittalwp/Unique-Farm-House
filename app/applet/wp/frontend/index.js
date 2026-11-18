export default {
  async fetch(request, env, ctx) {
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>WhatsApp SaaS Dashboard</title>
  <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
  <script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-auth-compat.js"></script>
</head>
<body class="bg-gray-950 text-gray-100 min-h-screen flex flex-col items-center justify-center p-6">

  <!-- Login Section -->
  <div id="loginSection" class="w-full max-w-md bg-gray-900 border border-gray-800 rounded-3xl p-8 shadow-2xl text-center space-y-6">
    <div class="w-16 h-16 bg-emerald-500/10 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto text-2xl font-bold">
      WA
    </div>
    <div class="space-y-2">
      <h1 class="text-2xl font-bold tracking-tight">WhatsApp SaaS Login</h1>
      <p class="text-sm text-gray-400">Sign in with Google to manage your WhatsApp connection</p>
    </div>
    <button onclick="loginWithGoogle()" class="w-full py-3 px-4 bg-white hover:bg-gray-100 text-gray-900 font-semibold rounded-2xl transition-all shadow-md flex items-center justify-center gap-3">
      <svg class="w-5 h-5" viewBox="0 0 24 24"><path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.4l3.7 2.9C6.5 7.3 9 5 12 5z"/><path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"/><path fill="#FBBC05" d="M5.6 14.7c-.2-.7-.4-1.5-.4-2.7s.2-2 .4-2.7L1.9 6.4C.7 8.8 0 11.3 0 14s.7 5.2 1.9 7.6l3.7-2.9z"/><path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.3-6.4-5.2L1.9 16c1.8 3.8 5.6 7 10.1 7z"/></svg>
      <span>Sign in with Google</span>
    </button>
  </div>

  <!-- Dashboard Section -->
  <div id="dashboardSection" class="hidden w-full max-w-4xl bg-gray-900 border border-gray-800 rounded-3xl p-8 shadow-2xl space-y-8">
    <div class="flex justify-between items-center border-b border-gray-800 pb-6">
      <div class="flex items-center gap-4">
        <div id="userAvatar" class="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-lg">U</div>
        <div>
          <h2 id="userName" class="font-bold text-lg">User Name</h2>
          <p id="userEmail" class="text-xs text-gray-400">user@example.com</p>
        </div>
      </div>
      <button onclick="logout()" class="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-semibold rounded-xl transition-all">Logout</button>
    </div>

    <!-- WhatsApp Status Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
      <!-- Status & QR Card -->
      <div class="bg-gray-950 border border-gray-800 rounded-2xl p-6 text-center space-y-4">
        <h3 class="text-sm font-semibold text-gray-400 uppercase tracking-wider">WhatsApp Connection</h3>
        <div id="statusIndicator" class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
          <span class="w-2 h-2 rounded-full bg-yellow-400 animate-pulse"></span>
          <span id="statusText">Disconnected</span>
        </div>
        
        <div id="qrContainer" class="hidden flex flex-col items-center justify-center space-y-4">
          <p class="text-xs text-gray-400">Scan this QR Code with WhatsApp on your phone:</p>
          <div class="bg-white p-4 rounded-2xl inline-block">
            <img id="qrImage" src="" alt="WhatsApp QR Code" class="w-56 h-56 object-contain">
          </div>
        </div>

        <div id="connectedContainer" class="hidden space-y-4 py-6">
          <div class="w-16 h-16 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mx-auto text-2xl">✓</div>
          <p class="text-sm font-medium text-emerald-400">WhatsApp Web is Connected & Active!</p>
          <button onclick="disconnectWhatsApp()" class="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-all">Disconnect Session</button>
        </div>

        <div id="connectBtnContainer">
          <button onclick="startConnection()" class="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-emerald-600/20">Connect WhatsApp</button>
        </div>
      </div>

      <!-- Quick Sender Tool -->
      <div class="bg-gray-950 border border-gray-800 rounded-2xl p-6 space-y-4">
        <h3 class="text-sm font-semibold text-gray-400 uppercase tracking-wider">Send Test Message</h3>
        <div class="space-y-3">
          <div>
            <label class="block text-xs text-gray-400 mb-1">Phone Number (with Country Code)</label>
            <input type="text" id="targetPhone" placeholder="919876543210" class="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-sm focus:outline-none focus:border-emerald-500">
          </div>
          <div>
            <label class="block text-xs text-gray-400 mb-1">Message</label>
            <textarea id="targetMessage" rows="3" placeholder="Hello from WhatsApp SaaS!" class="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-sm focus:outline-none focus:border-emerald-500"></textarea>
          </div>
          <button onclick="sendMessage()" class="w-full py-3 bg-white hover:bg-gray-100 text-gray-900 font-semibold rounded-xl transition-all text-sm shadow-md">Send WhatsApp Message</button>
        </div>
      </div>
    </div>
  </div>

  <script>
    const BACKEND_URL = "${env.BACKEND_URL || 'https://your-render-backend-url.onrender.com'}";

    // Simple Firebase Client Config (Replace with your own or mock)
    const firebaseConfig = {
      apiKey: "AIzaSyMockKeyForDemoOnly12345",
      authDomain: "mock-project.firebaseapp.com",
      projectId: "mock-project"
    };
    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }

    function loginWithGoogle() {
      // Simulate Google Login for demonstration or use real provider if configured
      const provider = new firebase.auth.GoogleAuthProvider();
      firebase.auth().signInWithPopup(provider).then((result) => {
        showDashboard(result.user);
      }).catch((error) => {
        // Fallback simulation if Firebase credentials are mock
        showDashboard({ displayName: "Demo User", email: "demo@whatsappsaas.com", photoURL: null });
      });
    }

    function logout() {
      firebase.auth().signOut().then(() => {
        document.getElementById('dashboardSection').classList.add('hidden');
        document.getElementById('loginSection').classList.remove('hidden');
      });
    }

    function showDashboard(user) {
      document.getElementById('loginSection').classList.add('hidden');
      document.getElementById('dashboardSection').classList.remove('hidden');
      document.getElementById('userName').innerText = user.displayName || 'User';
      document.getElementById('userEmail').innerText = user.email || '';
      document.getElementById('userAvatar').innerText = (user.displayName || 'U').charAt(0).toUpperCase();
      
      // Start polling status
      pollStatus();
      setInterval(pollStatus, 5000);
    }

    async function startConnection() {
      try {
        const res = await fetch(\`\${BACKEND_URL}/api/connect\`, { method: 'POST' });
        const data = await res.json();
        pollStatus();
      } catch (err) {
        alert('Failed to connect to backend server. Make sure Render backend URL is correct.');
      }
    }

    async function pollStatus() {
      try {
        const res = await fetch(\`\${BACKEND_URL}/api/status\`);
        const data = await res.json();
        
        const statusText = document.getElementById('statusText');
        const qrContainer = document.getElementById('qrContainer');
        const connectedContainer = document.getElementById('connectedContainer');
        const connectBtnContainer = document.getElementById('connectBtnContainer');
        const qrImage = document.getElementById('qrImage');

        if (data.status === 'connected') {
          statusText.innerText = 'Connected';
          statusText.parentElement.className = 'inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
          qrContainer.classList.add('hidden');
          connectBtnContainer.classList.add('hidden');
          connectedContainer.classList.remove('hidden');
        } else if (data.status === 'qr_ready' && data.qr) {
          statusText.innerText = 'Scan QR Code';
          statusText.parentElement.className = 'inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20';
          qrImage.src = data.qr;
          qrContainer.classList.remove('hidden');
          connectBtnContainer.classList.add('hidden');
          connectedContainer.classList.add('hidden');
        } else {
          statusText.innerText = 'Disconnected / Initializing';
          statusText.parentElement.className = 'inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-yellow-500/10 text-yellow-400 border border-yellow-500/20';
          qrContainer.classList.add('hidden');
          connectedContainer.classList.add('hidden');
          connectBtnContainer.classList.remove('hidden');
        }
      } catch (err) {
        console.error('Polling error:', err);
      }
    }

    async function disconnectWhatsApp() {
      try {
        await fetch(\`\${BACKEND_URL}/api/logout\`, { method: 'POST' });
        pollStatus();
      } catch (err) {
        alert('Logout failed');
      }
    }

    async function sendMessage() {
      const phone = document.getElementById('targetPhone').value;
      const message = document.getElementById('targetMessage').value;
      if (!phone || !message) {
        alert('Please enter phone number and message');
        return;
      }
      try {
        const res = await fetch(\`\${BACKEND_URL}/api/send-message\`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone, message })
        });
        const data = await res.json();
        if (data.success) {
          alert('Message sent successfully!');
          document.getElementById('targetMessage').value = '';
        } else {
          alert('Error: ' + data.error);
        }
      } catch (err) {
        alert('Failed to send message');
      }
    }
  </script>
</body>
</html>`;

    return new Response(html, {
      headers: { 'Content-Type': 'text/html;charset=UTF-8' },
    });
  },
};
