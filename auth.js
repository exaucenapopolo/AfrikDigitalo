// auth.js
// Configuration Firebase
const firebaseConfig = {
    apiKey: "AIzaSyAWlhXhkaOei9RzX8hCNcCXnpjWVId_s48",
    authDomain: "madil-be5be.firebaseapp.com",
    projectId: "madil-be5be",
    storageBucket: "madil-be5be.firebasestorage.app",
    messagingSenderId: "2892375937",
    appId: "1:2892375937:web:8d8381c7914cbd328aaa80",
    measurementId: "G-ZKXRFQDG93"
};

// Initialiser Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Variables globales
let currentUser = null;
let userData = null;

// Fonction de redirection si non connecté
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
                    // Créer un doc par défaut
                    userData = {
                        name: user.displayName || '',
                        email: user.email,
                        role: 'buyer',
                        settings: { publicProfile: true }
                    };
                    await db.collection('users').doc(user.uid).set(userData);
                }
                // Mettre à jour l'en-tête
                document.getElementById('headerUserName').textContent = userData.name || user.email;
                document.getElementById('headerAvatar').src = userData.photoURL || 'https://randomuser.me/api/portraits/lego/1.jpg';
                // Afficher bannière de vérification si nécessaire
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

// Fonction utilitaire pour afficher les toasts
function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.className = `toast ${type} show`;
    toast.innerHTML = (type === 'success' ? '<i class="fas fa-check-circle"></i> ' : 
                      type === 'error' ? '<i class="fas fa-exclamation-circle"></i> ' : 
                      '<i class="fas fa-info-circle"></i> ') + message;
    setTimeout(() => toast.classList.remove('show'), 4000);
}

// Fonction de déconnexion
function logout() {
    document.getElementById('logoutModal').classList.add('active');
}

function closeLogoutModal() {
    document.getElementById('logoutModal').classList.remove('active');
}

document.addEventListener('DOMContentLoaded', () => {
    // Gestion du menu mobile
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

    // Gestion du bouton de déconnexion dans le header
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }

    // Gestion de la confirmation de déconnexion
    const confirmLogout = document.getElementById('confirmLogout');
    if (confirmLogout) {
        confirmLogout.addEventListener('click', () => {
            auth.signOut();
            closeLogoutModal();
        });
    }

    // Gestion du renvoi d'email de vérification
    const resendBtn = document.getElementById('resendVerificationBtn');
    if (resendBtn) {
        resendBtn.addEventListener('click', async () => {
            if (currentUser) {
                await currentUser.sendEmailVerification();
                showToast('Email de vérification renvoyé', 'success');
            }
        });
    }

    // Fermeture du modal de déconnexion
    const closeModalBtn = document.querySelector('#logoutModal .modal-close');
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeLogoutModal);
    }
});