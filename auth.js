// auth.js
const firebaseConfig = {
    apiKey: "AIzaSyAWlhXhkaOei9RzX8hCNcCXnpjWVId_s48",
    authDomain: "madil-be5be.firebaseapp.com",
    projectId: "madil-be5be",
    storageBucket: "madil-be5be.firebasestorage.app",
    messagingSenderId: "2892375937",
    appId: "1:2892375937:web:8d8381c7914cbd328aaa80",
    measurementId: "G-ZKXRFQDG93"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

let currentUser = null;
let userData = null;

async function requireAuth() {
    return new Promise((resolve, reject) => {
        auth.onAuthStateChanged(async (user) => {
            if (!user) {
                window.location.href = 'login.html';
                return;
            }
            currentUser = user;
            try {
                const doc = await db.collection('users').doc(user.uid).get();
                if (doc.exists) {
                    userData = doc.data();
                } else {
                    userData = {
                        name: user.displayName || '',
                        email: user.email,
                        role: 'buyer',
                        balance: 0,
                        photoURL: user.photoURL || null,
                        settings: { publicProfile: true }
                    };
                    await db.collection('users').doc(user.uid).set(userData);
                }
                const headerUserName = document.getElementById('headerUserName');
                const headerAvatar = document.getElementById('headerAvatar');
                const headerBalance = document.getElementById('headerBalance');
                if (headerUserName) headerUserName.textContent = userData.name || user.email;
                if (headerAvatar) headerAvatar.src = userData.photoURL || 'https://randomuser.me/api/portraits/lego/1.jpg';
                if (headerBalance) {
                    if (userData.role === 'buyer') {
                        headerBalance.textContent = `Solde: ${userData.balance || 0} FCFA`;
                        headerBalance.style.display = 'inline';
                    } else {
                        headerBalance.style.display = 'none';
                    }
                }
                const verificationBanner = document.getElementById('verificationBanner');
                if (verificationBanner) {
                    verificationBanner.style.display = !user.emailVerified ? 'flex' : 'none';
                }
                resolve(userData);
            } catch (error) {
                console.error(error);
                reject(error);
            }
        });
    });
}

function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.className = `toast ${type} show`;
    toast.innerHTML = (type === 'success' ? '<i class="fas fa-check-circle"></i> ' : 
                      type === 'error' ? '<i class="fas fa-exclamation-circle"></i> ' : 
                      '<i class="fas fa-info-circle"></i> ') + message;
    setTimeout(() => toast.classList.remove('show'), 4000);
}

function logout() {
    document.getElementById('logoutModal').classList.add('active');
}

function closeLogoutModal() {
    document.getElementById('logoutModal').classList.remove('active');
}

document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.getElementById('sidebar');
    if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', () => {
            sidebar.classList.toggle('open');
        });
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 768 && !sidebar.contains(e.target) && !menuToggle.contains(e.target) && sidebar.classList.contains('open')) {
                sidebar.classList.remove('open');
            }
        });
    }

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }

    const confirmLogout = document.getElementById('confirmLogout');
    if (confirmLogout) {
        confirmLogout.addEventListener('click', () => {
            auth.signOut();
            closeLogoutModal();
        });
    }

    const resendBtn = document.getElementById('resendVerificationBtn');
    if (resendBtn) {
        resendBtn.addEventListener('click', async () => {
            if (currentUser) {
                await currentUser.sendEmailVerification();
                showToast('Email de vérification renvoyé', 'success');
            }
        });
    }

    const closeModalBtn = document.querySelector('#logoutModal .modal-close');
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeLogoutModal);
    }
});