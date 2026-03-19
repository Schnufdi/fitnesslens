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
