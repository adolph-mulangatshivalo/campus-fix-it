import { auth, db } from './firebase-config.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', () => {
    const navLinks = document.getElementById('nav-links');
    if (!navLinks) return;

    onAuthStateChanged(auth, async (user) => {
        if (user) {
            let role = 'student';
            let fullName = user.displayName;
            try {
                // Add a 3-second timeout so Safari networking bugs don't permanently freeze the app
                const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 3000));
                const docSnap = await Promise.race([getDoc(doc(db, 'users', user.uid)), timeoutPromise]);
                
                if (docSnap && docSnap.exists()) {
                    role = docSnap.data().role || 'student';
                    if (docSnap.data().full_name) {
                        fullName = docSnap.data().full_name;
                    }
                }
            } catch (e) {
                console.error("Error or timeout fetching user role, defaulting to student", e);
            }

            document.body.className = `theme-${role}`;

            navLinks.innerHTML = `
                <span>Welcome, ${fullName || user.email}</span>
                <a href="#" id="logout-btn">Logout</a>
            `;

            const logoutBtn = document.getElementById('logout-btn');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', async (e) => {
                    e.preventDefault();
                    await signOut(auth);
                    window.location.href = '/auth/login.html';
                });
            }
            
            // Redirect logged-in users away from auth/index pages to their dashboard
            const path = window.location.pathname;
            if (path === '/auth/login.html' || 
                path === '/auth/register.html' || 
                path === '/' || 
                path === '/index.html') {
                window.location.href = `/${role}/dashboard.html`;
            }

        } else {
            navLinks.innerHTML = `
                <a href="/auth/login.html">Login</a>
                <a href="/auth/register.html" id="nav-register">Register</a>
            `;
            
            const path = window.location.pathname;
            if (path !== '/auth/login.html' && 
                path !== '/auth/register.html' && 
                path !== '/auth/forgot_password.html' && 
                path !== '/' && path !== '/index.html') {
                window.location.href = '/auth/login.html';
            }
        }
    });

    // Kill Service Worker to prevent Safari PWA hanging bugs
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(function(registrations) {
            for(let registration of registrations) {
                registration.unregister();
            }
        }).catch(function(err) {
            console.log('Service Worker unregistration failed: ', err);
        });
    }
});
