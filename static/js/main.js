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
                const docSnap = await getDoc(doc(db, 'users', user.uid));
                if (docSnap.exists()) {
                    role = docSnap.data().role || 'student';
                    if (docSnap.data().full_name) {
                        fullName = docSnap.data().full_name;
                    }
                }
            } catch (e) {
                console.error("Error fetching user role", e);
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

    // Register Service Worker for App Shell caching
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js').catch(err => {
                console.error('SW registration failed: ', err);
            });
        });
    }

    // Route Prefetching: silently fetch pages linked on the current page
    setTimeout(() => {
        const links = document.querySelectorAll('a[href^="/"]');
        links.forEach(link => {
            if (link.href !== window.location.href) {
                fetch(link.href, { mode: 'no-cors', cache: 'force-cache' }).catch(() => {});
            }
        });
    }, 1000);
});
