# enhance-ux-laws — probe

The DOM probe for Step 2a: how to run it with playwright-cli at two widths, the script itself, and how to confirm each candidate before it becomes a finding.

## Contents

- Run loop (playwright-cli)
- Probe script
- Confirming candidates

## Run loop

Save the probe as `ux-laws-probe.js` in a scratch directory outside the repo
and work from there: the CLI writes its `.playwright-cli/` folder, the JSON,
and the screenshots into the current directory. Evaluate the probe in the
live page at a phone width and a desktop width. Resize before navigating so
the page lays out at the target width from first paint. With the pack
installed, follow `protocol-browser-anti-stall` for browser sessions.

```bash
PW="npx --yes @playwright/cli@latest"; S="-s=ux-laws"
$PW $S open "<app-url>"
for wh in "390 844" "1440 900"; do
  $PW $S resize $wh && $PW $S goto "<app-url>/<route>"
  $PW $S eval "$(cat ux-laws-probe.js)" --filename "before-${wh// /x}.json" > /dev/null
  $PW $S screenshot --filename "before-${wh// /x}.png" --full-page
done
$PW $S close
```

Read the JSON files. The probe measures the state the page is in, so repeat
it for each state that matters — filled, error, menu open, every step of a
flow — by driving the same session there (`fill`, `click`) and evaluating
again to a new file. Any driver that evaluates JavaScript in the page works
as well: Playwright `page.evaluate`, a DevTools or browser-automation script
tool, or pasting `(<probe>)()` into the console.

## Probe script

```js
() => {
  const vw = innerWidth, vh = innerHeight, cap = a => a.slice(0, 12);
  const R = el => el.getBoundingClientRect(), CS = el => getComputedStyle(el);
  const vis = el => { const r = R(el), s = CS(el);  // checkVisibility also catches closed <details> and hidden ancestors
    return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && +s.opacity > 0.05 &&
      (!el.checkVisibility || el.checkVisibility()); };
  const label = el => (el.getAttribute('aria-label') || (el.tagName === 'SELECT' ? el.name : el.innerText) ||
    el.value || el.placeholder || el.name || el.tagName).trim().replace(/\s+/g, ' ').slice(0, 32);
  const SEL = 'a[href],button,input:not([type=hidden]),select,textarea,summary,[role=button],' +
    '[role=link],[role=tab],[role=menuitem],[role=checkbox],[role=switch],[role=radio]';
  const targets = [...document.querySelectorAll(SEL)].filter(vis);
  const inFold = el => { const r = R(el); return r.top < vh && r.bottom > 0 && r.left < vw && r.right > 0; };
  // Hit area = element box, extended by its <label> when it has one.
  const hit = el => { let r = R(el), b = { l: r.left, t: r.top, r: r.right, b: r.bottom };
    for (const lb of el.labels || []) { const q = R(lb);
      b = { l: Math.min(b.l, q.left), t: Math.min(b.t, q.top), r: Math.max(b.r, q.right), b: Math.max(b.b, q.bottom) }; }
    return { ...b, w: Math.round(b.r - b.l), h: Math.round(b.b - b.t) }; };
  // Links inside a sentence are exempt from WCAG 2.5.8: their size follows the line of text.
  const inline = el => el.tagName === 'A' && CS(el).display === 'inline' && !!el.closest('p,li,dd,td,blockquote,figcaption') &&
    [...el.parentElement.childNodes].some(n => n.nodeType === 3 && n.textContent.trim().length > 12);
  const gap = (a, b) => Math.round(Math.max(a.l - b.r, b.l - a.r, a.t - b.b, b.t - a.b, 0));
  const hits = targets.filter(el => !inline(el)).map(el => ({ el, ...hit(el) }));

  // FITTS — size, spacing, position of the main action
  const small = hits.filter(t => Math.min(t.w, t.h) < 44);
  const tiny = small.filter(t => Math.min(t.w, t.h) < 24);
  const sized = t => ({ name: label(t.el), w: t.w, h: t.h });
  const crowded = [];
  hits.forEach((a, i) => hits.slice(i + 1).forEach(b => {
    if (Math.min(a.w, a.h, b.w, b.h) >= 44 || a.el.contains(b.el) || b.el.contains(a.el)) return;
    const g = gap(a, b); if (g < 8) crowded.push({ a: label(a.el), b: label(b.el), gapPx: g }); }));
  crowded.sort((p, q) => p.gapPx - q.gapPx);

  // VON RESTORFF — filled, saturated controls competing in the first fold
  const rgb = c => (c.match(/[\d.]+/g) || []).map(Number);
  const filled = el => { const [r, g, b, a = 1] = rgb(CS(el).backgroundColor);
    return a > 0.5 && (Math.max(r, g, b) - Math.min(r, g, b)) > 60; };
  const pointerRoots = [...document.querySelectorAll('body *')].filter(el => vis(el) &&
    CS(el).cursor === 'pointer' && CS(el.parentElement).cursor !== 'pointer' &&
    !el.matches(SEL + ',label') && !el.closest(SEL + ',label'));
  const accents = {};
  [...targets, ...pointerRoots].filter(el => inFold(el) && filled(el)).forEach(el => {
    const k = CS(el).backgroundColor; (accents[k] = accents[k] || []).push(label(el)); });

  // HICK — sets of options offered at once
  const choiceSets = [];
  document.querySelectorAll('nav,[role=navigation],[role=tablist],[role=toolbar],[role=menu],[role=radiogroup]')
    .forEach(c => { const n = [...c.querySelectorAll(SEL)].filter(vis).length;
      if (n) choiceSets.push({ set: c.getAttribute('aria-label') || c.tagName.toLowerCase(), options: n,
        grouped: !!c.querySelector('h2,h3,h4,h5,[role=group],hr,ul ul,details') }); });
  document.querySelectorAll('select').forEach(s => { if (vis(s)) choiceSets.push({ set: 'select:' + label(s),
    options: s.options.length, grouped: !!s.querySelector('optgroup') }); });
  const radios = {};
  document.querySelectorAll('input[type=radio][name]').forEach(r => {
    if (vis(r) || [...(r.labels || [])].some(vis)) (radios[r.name] = radios[r.name] || []).push(r); });
  Object.entries(radios).forEach(([name, rs]) => choiceSets.push({ set: 'radio:' + name, options: rs.length,
    preselected: rs.some(r => r.checked) }));
  const byLabel = {};
  targets.filter(el => /^(BUTTON|A)$/.test(el.tagName) || el.getAttribute('role') === 'button')
    .forEach(el => { const k = label(el); byLabel[k] = (byLabel[k] || 0) + 1; });
  const repeatedActions = Object.entries(byLabel).filter(([, n]) => n >= 3).map(([name, count]) => ({ name, count }));

  // MILLER — things the user has to hold in their head
  const inputs = targets.filter(el => /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName) && !/^(submit|button|reset|image)$/.test(el.type));
  const named = el => (el.labels && el.labels.length) || el.getAttribute('aria-label') || el.getAttribute('aria-labelledby') || el.title;
  const forms = [...document.forms].map(f => { const fs = inputs.filter(el => f.contains(el));
    return { form: f.getAttribute('aria-label') || f.getAttribute('name') || f.getAttribute('action') || 'form',
      fields: fs.filter(el => el.type !== 'radio').length + new Set(fs.filter(el => el.type === 'radio').map(el => el.name)).size,
      groups: [...f.querySelectorAll('fieldset,[role=group],h2,h3,h4')].filter(vis).length,
      required: fs.filter(el => el.required).length }; });
  const longNumericInputs = inputs.filter(el => el.tagName === 'INPUT' && (el.inputMode === 'numeric' || el.type === 'tel' ||
    /cc-number|one-time-code/.test(el.autocomplete) || /card|otp|code|iban|account/i.test(el.name + el.id)))
    .map(el => ({ name: label(el), maxLength: el.maxLength }));
  const longCodes = cap([...new Set((document.body.innerText.match(/\b(?=[A-Z0-9]*\d{4})[A-Z0-9]{10,}\b/g) || []))]);

  // GOAL-GRADIENT + ZEIGARNIK — is progress visible, and is this a multi-step flow?
  const stepWords = /^(next|continue|back|previous)\b|^(次へ|戻る|進む|続ける)/i;
  const progressText = (document.body.innerText.match(
    /(step|ステップ)\s*\d+\s*(of|\/|／)\s*\d+|\d+\s*(of|\/|／)\s*\d+\s*(steps?|complete|done|完了)|\d{1,3}\s*%\s*(complete|done|完了)/gi) || []);
  const progress = { indicators: document.querySelectorAll('progress,meter,[role=progressbar],[aria-current=step]').length,
    text: cap(progressText), stepButtons: targets.filter(el => stepWords.test(label(el))).map(label) };

  // JAKOB — conventions users bring from every other product
  const isHome = a => { try { const u = new URL(a.href); return u.origin === location.origin && u.pathname === '/'; } catch { return false; } };
  const jakob = {
    homeLink: [...document.querySelectorAll('header a[href],[role=banner] a[href]')].some(isHome),
    search: !!document.querySelector('input[type=search],[role=search],[role=searchbox]'),
    fakeControls: cap(pointerRoots.map(el => el.tagName.toLowerCase() + ':' + label(el))),
    inlineLinksNoUnderline: cap(targets.filter(el => inline(el) && CS(el).textDecorationLine === 'none').map(label)),
    inputsUnder16px: inputs.filter(el => !/^(radio|checkbox|range|color|file)$/.test(el.type) && parseFloat(CS(el).fontSize) < 16).length,
    noAutocomplete: inputs.filter(el => el.tagName === 'INPUT' && !el.autocomplete &&
      (/^(email|tel|password)$/.test(el.type) || /name|mail|phone|tel|postal|zip|addr|card/i.test(el.name + el.id))).map(label),
  };
  const primary = hits.filter(t => inFold(t.el) && filled(t.el)).sort((a, b) => b.w * b.h - a.w * a.h)[0];

  return {
    viewport: { vw, vh, touch: matchMedia('(pointer: coarse)').matches },
    fitts: { targets: hits.length, under24: tiny.length, under44: small.length,
      smallest: cap(small.sort((a, b) => Math.min(a.w, a.h) - Math.min(b.w, b.h)).map(sized)),
      crowdedPairs: crowded.length, tightest: cap(crowded),
      primaryGuess: primary ? { ...sized(primary), xPct: Math.round(100 * (primary.l + primary.w / 2) / vw),
        yPct: Math.round(100 * (primary.t + primary.h / 2) / vh) } : null },
    hick: { targetsInFold: targets.filter(inFold).length, choiceSets: choiceSets.filter(c => c.options > 4), repeatedActions },
    vonRestorff: { accentsInFold: Object.entries(accents).map(([bg, names]) => ({ bg, count: names.length, names: cap(names) })),
      loopingAnimations: cap([...document.querySelectorAll('body *')].filter(el => vis(el) &&
        CS(el).animationName !== 'none' && CS(el).animationIterationCount === 'infinite').map(label)) },
    miller: { forms, placeholderOnly: cap(inputs.filter(el => !named(el) && el.placeholder).map(label)),
      unlabeled: cap(inputs.filter(el => !named(el) && !el.placeholder).map(label)), longNumericInputs, longCodes },
    progress, jakob,
  };
}
```

## Confirming candidates

The probe reports candidates. Confirm each one against the page before it
becomes a finding:

- It measures element boxes. A hit area extended by a pseudo-element or a padded parent handler reads smaller than it is
- `touch` reflects the device running the probe, not the resized width. Decide touch from the product
- `primaryGuess` is the largest filled control in the fold. When `accentsInFold` holds several, the guess is arbitrary — which is the Von Restorff finding. `null` means no filled action is visible before scrolling
- `fakeControls` relies on `cursor: pointer`. Click handlers without it need a code search (`onClick` on `div`/`span`). A real `<button>` that does nothing passes; flow walk 7 catches it
- `choiceSets` and `repeatedActions` count options (the same label on three or more buttons is usually a picker). Whether they need evaluating is the Hick precondition, judged in Step 3
- `longNumericInputs` lists fields to try by hand in flow walk 8; the DOM does not show how a field formats what is typed
- `longCodes` reads text content, so a code grouped only by CSS spacing still appears. Confirm by eye
