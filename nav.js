// BodyLens — shared navigation state + AI coach

// Mark active nav link from current filename
(function(){
  const page = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach(a => {
    const href = (a.getAttribute('href') || '').replace('.html','');
    if (href && page.includes(href.replace('bodylens-',''))) a.classList.add('active');
  });
})();

// AI system prompt
const BL_SYSTEM = `You are BodyLens Coach — a precise, evidence-based performance advisor combining nutritionist, strength coach, sports physio and performance scientist.

PROFILE: Male, 44, advanced lifter 3+ years, ~85kg, omnivore, 4 days/wk, full commercial gym. Morning trainer 06:00–09:00 (90-min activation window before lifting). Goal: lean muscle gain (+200 kcal surplus), tennis return by week 9–12, longevity. Nutrition: Balanced precision (185g protein, ~190g carbs, ~120g fat average, varies by day type).

KNEE — critical context:
Horizontal tear medial meniscus body + posterior horn (degenerative, long-standing). Parameniscal cyst. Baker's cyst resolved. Mild chondromalacia. MCL mildly irritated. All other ligaments intact. 5 weeks post-MRI, 2 weeks rest completed. No persistent pain, no locking; occasional catching in deep kneeling + rotation only.
HARD CONSTRAINTS: No deep knee flexion >90° under load. No twisting under load. No explosive lateral movement early phase. STOP if: swelling within 24h, new locking, sharp medial pain.

PROGRAMME: Mon Push / Tue Rest / Wed Pull (1 mod) / Thu Rest / Fri Posterior chain (3 mods) / Sat Upper / Sun Rest
KEY MODIFICATIONS: Squat→RDL+hip thrust | Lunge→step-up 20cm | Leg press 0–70° only | Bent-over row→chest-supported row

SUPPLEMENTS (Tier 1): Creatine 5g daily · Collagen+VitC 15g+50mg 45min pre-training · Omega-3 2–3g · D3+K2 3000IU · Magnesium glycinate 400mg bed. (Tier 2): ZMA hard training days · Ashwagandha KSM-66 600mg daily.

TONE: Senior, dry, precise. Mechanistic not motivational. 3–5 sentences maximum. Never generic "consult your doctor" unless genuinely warranted. Never waffle.`;

// Shared AI coach
async function sendCoach(inputId, respId, btnId, extraCtx) {
  const inp  = document.getElementById(inputId);
  const resp = document.getElementById(respId);
  const btn  = document.getElementById(btnId);
  const q    = inp ? inp.value.trim() : '';
  if (!q) return;
  if (btn) btn.disabled = true;
  resp.className = 'ai-resp loading';
  resp.textContent = 'Thinking…';
  if (inp) inp.value = '';
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 800,
        system: BL_SYSTEM,
        messages: [{ role: 'user', content: (extraCtx ? extraCtx + '\n\n' : '') + 'Question: ' + q }]
      })
    });
    const data = await res.json();
    resp.className = 'ai-resp';
    resp.textContent = data.content?.map(b => b.text || '').join('') || 'No response.';
  } catch(e) {
    resp.className = 'ai-resp';
    resp.textContent = 'Connection error — check network.';
  }
  if (btn) btn.disabled = false;
}

function askCoach(btn, inputId, respId, btnId, ctx) {
  const inp = document.getElementById(inputId);
  if (inp) inp.value = btn.textContent;
  sendCoach(inputId, respId, btnId, ctx || '');
}

// Protocol card expand/collapse
function toggleProto(card) { card.classList.toggle('expanded'); }

// Scenario toggle
function toggleScenario(el) { el.classList.toggle('open'); }

// Check-in option selector
function selectOpt(btn, group, warn) {
  btn.closest('.ci-options').querySelectorAll('.ci-opt').forEach(b => b.classList.remove('sel','sel-warn'));
  btn.classList.add(warn ? 'sel-warn' : 'sel');
}

// Generic tab switcher (used by pages that don't need day-state)
function switchTab(paneId, btn) {
  const scope = btn ? (btn.closest('.tab-scope') || document) : document;
  scope.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  scope.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
  if (btn) btn.classList.add('active');
  const p = document.getElementById(paneId);
  if (p) p.classList.add('active');
}

// ── TOOLTIP / JARGON SYSTEM ──────────────────────────────
// Applied to any element with class "tip" and data-tip attribute.
// The CSS handles hover display — this just ensures dynamic content gets tooltips too.
const GLOSSARY = {
  'RPE':   'Rate of Perceived Exertion — a 1–10 scale of workout difficulty. RPE 8 means 2 reps left in the tank.',
  'MPS':   'Muscle Protein Synthesis — the biological process of building new muscle tissue. Triggered by training and protein intake.',
  'mTOR':  'Mechanistic Target of Rapamycin — the molecular "switch" that activates muscle building when leucine levels are sufficient.',
  'GH':    'Growth Hormone — released during deep sleep. Drives muscle repair and connective tissue remodelling.',
  'PCr':   'Phosphocreatine — the energy molecule creatine supplements. Used for explosive, high-intensity efforts lasting under 10 seconds.',
  'COX':   'Cyclo-oxygenase — an enzyme that produces inflammatory compounds. Omega-3s compete with pro-inflammatory fats at this enzyme.',
  'EPA':   'Eicosapentaenoic acid — an omega-3 fatty acid found in fish. Reduces inflammation at the synovial joint level.',
  'DHA':   'Docosahexaenoic acid — an omega-3 fatty acid. Works alongside EPA for joint and brain health.',
  'VO₂max':'Maximum oxygen uptake — the gold standard measure of cardiovascular fitness. Higher = more aerobic capacity.',
  'DOMS':  'Delayed Onset Muscle Soreness — the ache felt 24–48h after training. Normal, caused by microscopic muscle damage. Not an injury.',
  'ROM':   'Range of Motion — the full movement a joint can perform. Restricted to 0–70° for the knee in modified exercises.',
  'MCL':   'Medial Collateral Ligament — the ligament on the inner side of the knee. Mildly irritated in your MRI. Intact.',
  'ACL':   'Anterior Cruciate Ligament — the main stabilising ligament of the knee. Intact in your MRI.',
  'IGF-1': 'Insulin-like Growth Factor 1 — a hormone produced in response to GH. Directly stimulates muscle protein synthesis.',
  'ATP':   'Adenosine Triphosphate — the molecule cells use as energy currency. Creatine helps regenerate ATP faster.',
  'CNS':   'Central Nervous System — brain and spinal cord. Training requires CNS freshness for peak output on heavy compound lifts.',
  'EMG':   'Electromyography — measurement of muscle electrical activity. Used to compare which exercises activate which muscles most.',
  'RDL':   'Romanian Deadlift — a hip hinge movement that loads the hamstrings and glutes with minimal knee flexion.',
  'MRI':   'Magnetic Resonance Imaging — the scan that revealed the medial meniscus tear and associated findings.',
  'PGE2':  'Prostaglandin E2 — the primary chemical mediator of joint inflammation. Omega-3s reduce its production.',
  'NMDA':  'N-methyl-D-aspartate receptor — involved in sleep regulation. Magnesium glycinate modulates this to deepen slow-wave sleep.',
  'KSM-66':'A standardised extract of ashwagandha root. Standardisation matters — generic ashwagandha shows inconsistent results in research.',
};

// Wrap known terms in .tip spans when added to the DOM
function applyTooltips(root) {
  root = root || document.body;
  // Walk text nodes and wrap glossary terms
  const terms = Object.keys(GLOSSARY).sort((a,b) => b.length - a.length);
  const skip  = new Set(['SCRIPT','STYLE','INPUT','TEXTAREA','SELECT','BUTTON','A']);

  function walk(node) {
    if (skip.has(node.nodeName)) return;
    if (node.nodeType === 3) { // text node
      const text = node.textContent;
      for (const term of terms) {
        const idx = text.indexOf(term);
        if (idx >= 0) {
          // Check parent isn't already a .tip
          if (node.parentElement && node.parentElement.classList.contains('tip')) break;
          const span = document.createElement('span');
          span.innerHTML =
            escHtml(text.slice(0, idx)) +
            `<span class="tip" data-tip="${escHtml(GLOSSARY[term])}">${escHtml(term)}</span>` +
            escHtml(text.slice(idx + term.length));
          node.parentNode.replaceChild(span, node);
          break;
        }
      }
    } else {
      Array.from(node.childNodes).forEach(walk);
    }
  }

  // Only run on main content, not nav
  const content = root.querySelector('.page, .main-inner, .tab-content');
  if (content) walk(content);
}

function escHtml(s) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// Run once after page load
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => applyTooltips(document.body), 300);
});

// ── LOCALSTORAGE PERSISTENCE ─────────────────────────────
// Saves: wake time preference, selected nutrition journey, check-in data
const BL_STORE = {
  get(key)      { try { return JSON.parse(localStorage.getItem('bl_'+key)); } catch(e){ return null; } },
  set(key,val)  { try { localStorage.setItem('bl_'+key, JSON.stringify(val)); } catch(e){} },
};

// Restore wake time on Today page load
function restorePreferences() {
  const wakeEl = document.getElementById('wake-select');
  if (wakeEl) {
    const saved = BL_STORE.get('wake_time');
    if (saved) wakeEl.value = saved;
    wakeEl.addEventListener('change', () => BL_STORE.set('wake_time', wakeEl.value));
  }
}

document.addEventListener('DOMContentLoaded', restorePreferences);
