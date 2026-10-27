/* ============================================================
   app.js — Shared JavaScript for all pages
   ============================================================ */

const API = 'http://localhost:3000/api';

/* ── API CALLS ──────────────────────────────────────────────── */
async function GET(url)         { const r = await fetch(API+url);         return r.json(); }
async function POST(url, body)  { const r = await fetch(API+url, { method:'POST',  headers:{'Content-Type':'application/json'}, body:JSON.stringify(body) }); return r.json(); }
async function PUT(url, body)   { const r = await fetch(API+url, { method:'PUT',   headers:{'Content-Type':'application/json'}, body:JSON.stringify(body) }); return r.json(); }
async function DELETE(url)      { const r = await fetch(API+url, { method:'DELETE' }); return r.json(); }

/* ── TOAST ──────────────────────────────────────────────────── */
function toast(msg, type='success') {
    let box = document.getElementById('toast-container');
    if (!box) { box = document.createElement('div'); box.id='toast-container'; document.body.appendChild(box); }
    const icons = { success:'✅', error:'❌', info:'ℹ️' };
    const t = document.createElement('div');
    t.className = `toast ${type}`;
    t.innerHTML = `<span>${icons[type]||'•'}</span><span>${msg}</span>`;
    box.appendChild(t);
    setTimeout(() => t.remove(), 3500);
}

/* ── MODAL ───────────────────────────────────────────────────── */
function openModal(id)  { document.getElementById(id)?.classList.remove('hidden'); }
function closeModal(id) { document.getElementById(id)?.classList.add('hidden'); }

/* ── CONFIRM DELETE ─────────────────────────────────────────── */
function confirmDelete(msg='Are you sure you want to delete this record?') {
    return new Promise(resolve => {
        const ov = document.createElement('div');
        ov.className = 'modal-overlay';
        ov.innerHTML = `<div class="modal" style="max-width:380px">
            <div class="modal-head"><h3>⚠️ Confirm Delete</h3></div>
            <div class="modal-body"><p style="color:#4a6080;font-size:14px">${msg}</p></div>
            <div class="modal-foot">
                <button class="btn btn-outline" id="cNo">Cancel</button>
                <button class="btn btn-red" id="cYes">Yes, Delete</button>
            </div></div>`;
        document.body.appendChild(ov);
        ov.querySelector('#cNo').onclick  = () => { ov.remove(); resolve(false); };
        ov.querySelector('#cYes').onclick = () => { ov.remove(); resolve(true);  };
    });
}

/* ── HELPERS ─────────────────────────────────────────────────── */
function fmtDate(d)  { if(!d) return '—'; return new Date(d).toLocaleDateString('en-PK',{day:'2-digit',month:'short',year:'numeric'}); }
function fmtMoney(n) { if(!n && n!==0) return '—'; return 'PKR '+ Number(n).toLocaleString(); }
function getInitials(name) { if(!name) return '?'; return name.split(' ').map(p=>p[0]).join('').toUpperCase().slice(0,2); }

function statusBadge(s) {
    const map = { Active:'badge-active', Completed:'badge-completed', Proposed:'badge-proposed',
                  Suspended:'badge-suspended', Expired:'badge-expired', Pending:'badge-pending' };
    return `<span class="badge ${map[s]||''}">${s||'—'}</span>`;
}
function genderBadge(g) {
    if(g==='Male')   return '<span class="badge badge-male">Male</span>';
    if(g==='Female') return '<span class="badge badge-female">Female</span>';
    return `<span class="badge">${g||'—'}</span>`;
}

/* ── POPULATE SELECT ─────────────────────────────────────────── */
async function fillSelect(el, url, valKey, lblKey, placeholder='— Select —') {
    if(!el) return;
    const res = await GET(url);
    if(res.success) {
        el.innerHTML = `<option value="">${placeholder}</option>` +
            res.data.map(d=>`<option value="${d[valKey]}">${d[lblKey]}</option>`).join('');
    }
}

/* ── PAGINATION ──────────────────────────────────────────────── */
function paginate(data, page, perPage=15) {
    const total = data.length, pages = Math.ceil(total/perPage);
    const start = (page-1)*perPage;
    return { items: data.slice(start, start+perPage), total, pages, page, start };
}
function renderPager(container, pager, cb) {
    if(!container) return;
    const { total, pages, page, start } = pager;
    const end = Math.min(start+15, total);
    let btns = '';
    if(pages > 1) {
        if(page>1) btns += `<button class="page-btn" data-p="${page-1}">‹ Prev</button>`;
        for(let i=Math.max(1,page-2); i<=Math.min(pages,page+2); i++)
            btns += `<button class="page-btn ${i===page?'active':''}" data-p="${i}">${i}</button>`;
        if(page<pages) btns += `<button class="page-btn" data-p="${page+1}">Next ›</button>`;
    }
    container.innerHTML = `<span>Showing ${start+1}–${end} of ${total}</span><div class="page-btns">${btns}</div>`;
    container.querySelectorAll('.page-btn').forEach(b => b.onclick = () => cb(Number(b.dataset.p)));
}

/* ── ACTIVE NAV ──────────────────────────────────────────────── */
function setActiveNav() {
    const pg = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-link').forEach(a => {
        a.classList.toggle('active', a.dataset.page === pg);
    });
}

/* ── HAMBURGER ───────────────────────────────────────────────── */
function initHamburger() {
    const btn = document.getElementById('menuBtn');
    const sb  = document.getElementById('sidebar');
    if(btn && sb) {
        btn.onclick = () => sb.classList.toggle('open');
        document.addEventListener('click', e => { if(!sb.contains(e.target) && e.target!==btn) sb.classList.remove('open'); });
    }
}

document.addEventListener('DOMContentLoaded', () => { setActiveNav(); initHamburger(); });
