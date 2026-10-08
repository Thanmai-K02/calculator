/**
 * NovaCalc — Next-Gen Glassmorphic Scientific & Unit Calculator
 * Robust Calculator Engine, Precision Math Parser, Synthesized Audio, History & Units
 */

(function () {
  'use strict';

  // ==========================================
  // 1. APPLICATION STATE
  // ==========================================
  const state = {
    expression: '',           // Completed expression tokens (e.g., "12 + 5 * ")
    displayValue: '0',        // Current active display numeral or result
    waitingForOperand: false, // Flag: true when an operator was just pressed and next digit replaces display
    isResultEvaluated: false, // Flag: true when '=' was just pressed
    angleMode: 'DEG',         // 'DEG' or 'RAD'
    memory: 0,                // Stored value for MC, MR, M+, M-, MS
    soundEnabled: true,       // Audio FX toggle
    theme: 'nebula',          // Active theme
    currentMode: 'standard',  // 'standard' | 'scientific' | 'converter'
    history: []               // Recorded calculations tape
  };

  const STORAGE_KEYS = {
    THEME: 'novacalc_theme',
    SOUND: 'novacalc_sound',
    HISTORY: 'novacalc_history',
    ANGLE: 'novacalc_angle_mode',
    MEMORY: 'novacalc_memory'
  };

  // Restore saved state
  try {
    const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME);
    if (savedTheme) state.theme = savedTheme;

    const savedSound = localStorage.getItem(STORAGE_KEYS.SOUND);
    if (savedSound !== null) state.soundEnabled = JSON.parse(savedSound);

    const savedAngle = localStorage.getItem(STORAGE_KEYS.ANGLE);
    if (savedAngle) state.angleMode = savedAngle;

    const savedMemory = localStorage.getItem(STORAGE_KEYS.MEMORY);
    if (savedMemory) state.memory = parseFloat(savedMemory) || 0;

    const savedHistory = localStorage.getItem(STORAGE_KEYS.HISTORY);
    if (savedHistory) state.history = JSON.parse(savedHistory) || [];
  } catch (e) {
    console.warn('LocalStorage unavailable:', e);
  }

  // ==========================================
  // 2. DOM REFERENCES
  // ==========================================
  const DOM = {
    body: document.body,
    calculatorContainer: document.getElementById('calculatorContainer'),
    calcScreen: document.getElementById('calcScreen'),
    expressionDisplay: document.getElementById('expressionDisplay'),
    livePreviewDisplay: document.getElementById('livePreviewDisplay'),
    mainDisplay: document.getElementById('mainDisplay'),
    angleUnitToggle: document.getElementById('angleUnitToggle'),
    angleUnitDisplay: document.getElementById('angleUnitDisplay'),
    memoryIndicator: document.getElementById('memoryIndicator'),
    fxIndicator: document.getElementById('fxIndicator'),
    copyResultBtn: document.getElementById('copyResultBtn'),

    // Nav Tabs
    tabStandard: document.getElementById('tabStandard'),
    tabScientific: document.getElementById('tabScientific'),
    tabConverter: document.getElementById('tabConverter'),

    // Panels
    keypadZone: document.getElementById('keypadZone'),
    scientificPanel: document.getElementById('scientificPanel'),
    converterPanel: document.getElementById('converterPanel'),

    // Header buttons
    soundToggleBtn: document.getElementById('soundToggleBtn'),
    themeBtn: document.getElementById('themeBtn'),
    themeDropdown: document.getElementById('themeDropdown'),
    historyToggleBtn: document.getElementById('historyToggleBtn'),
    historyBadge: document.getElementById('historyBadge'),
    shortcutsBtn: document.getElementById('shortcutsBtn'),

    // History elements
    historyDrawer: document.getElementById('historyDrawer'),
    historyList: document.getElementById('historyList'),
    historyEmpty: document.getElementById('historyEmpty'),
    clearHistoryBtn: document.getElementById('clearHistoryBtn'),
    closeHistoryBtn: document.getElementById('closeHistoryBtn'),

    // Modal & Toast
    shortcutsModal: document.getElementById('shortcutsModal'),
    closeShortcutsBtn: document.getElementById('closeShortcutsBtn'),
    toastContainer: document.getElementById('toastContainer'),

    // Converter Elements
    converterCategories: document.getElementById('converterCategories'),
    convertInputVal: document.getElementById('convertInputVal'),
    convertFromUnit: document.getElementById('convertFromUnit'),
    convertOutputVal: document.getElementById('convertOutputVal'),
    convertToUnit: document.getElementById('convertToUnit'),
    swapUnitsBtn: document.getElementById('swapUnitsBtn'),
    transferToCalcBtn: document.getElementById('transferToCalcBtn')
  };

  // ==========================================
  // 3. SYNTHESIZED WEB AUDIO ENGINE
  // ==========================================
  let audioCtx = null;

  function initAudio() {
    if (!audioCtx && (window.AudioContext || window.webkitAudioContext)) {
      const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioCtxClass();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  function playTone(type) {
    if (!state.soundEnabled) return;
    try {
      initAudio();
      if (!audioCtx) return;

      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      const now = audioCtx.currentTime;

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      if (type === 'digit') {
        // High, crisp subtle mechanical click
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(320, now + 0.03);
        gain.gain.setValueAtTime(0.07, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.03);
        osc.start(now);
        osc.stop(now + 0.03);
      } else if (type === 'operator') {
        // Soft rounded blip
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(540, now);
        osc.frequency.exponentialRampToValueAtTime(420, now + 0.045);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.045);
        osc.start(now);
        osc.stop(now + 0.045);
      } else if (type === 'equals') {
        // Harmonious chord
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.setValueAtTime(659.25, now + 0.05); // E5
        osc.frequency.setValueAtTime(783.99, now + 0.1); // G5
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);
        osc.start(now);
        osc.stop(now + 0.22);
      } else if (type === 'clear') {
        // Low warm descend
        osc.type = 'sine';
        osc.frequency.setValueAtTime(360, now);
        osc.frequency.exponentialRampToValueAtTime(140, now + 0.07);
        gain.gain.setValueAtTime(0.09, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.07);
        osc.start(now);
        osc.stop(now + 0.07);
      } else if (type === 'error') {
        // Low alert thud
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.linearRampToValueAtTime(90, now + 0.14);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.14);
        osc.start(now);
        osc.stop(now + 0.14);
      }
    } catch (e) {
      // Audio context restricted or muted
    }
  }

  // ==========================================
  // 4. PRECISION MATHEMATICAL ENGINE
  // ==========================================

  function factorial(n) {
    if (n < 0) throw new Error('Invalid factorial input');
    if (n > 170) return Infinity;
    if (n === 0 || n === 1) return 1;
    let res = 1;
    for (let i = 2; i <= n; i++) res *= i;
    return res;
  }

  function formatNumberPrecision(num) {
    if (typeof num !== 'number' || isNaN(num) || !isFinite(num)) {
      return String(num);
    }
    // Snap close float approximations like 0.1 + 0.2 = 0.30000000000000004
    const rounded = Math.round(num * 1e12) / 1e12;
    if (Math.abs(rounded) < 1e-12 && rounded !== 0) {
      return '0';
    }
    // Scientific notation for very large or very small numbers
    if (Math.abs(rounded) >= 1e13 || (Math.abs(rounded) < 1e-6 && rounded !== 0)) {
      return rounded.toExponential(7).replace(/\.?0+e/, 'e');
    }
    // Format to clean decimal string without trailing zeros
    let str = rounded.toString();
    if (str.includes('.')) {
      str = parseFloat(rounded.toFixed(10)).toString();
    }
    return str;
  }

  /**
   * Prepares math expression with function bindings and operator symbols
   */
  function buildExecutableString(expr) {
    let s = expr;

    // Visual math operators to standard JS
    s = s.replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-');

    // Standalone factorial: e.g. 5! -> fact(5)
    s = s.replace(/(\d+(\.\d+)?)!/g, 'fact($1)');

    // Percentage: 50% -> (50/100)
    s = s.replace(/(\d+(\.\d+)?)%/g, '($1/100)');

    // Replace constant symbols
    s = s.replace(/π/g, 'pi');

    // Power operator ^ -> **
    s = s.replace(/\^/g, '**');

    // Implicit multiplications: e.g. 2(3), (2)(3), 4pi, 2sin
    s = s.replace(/(\d)(\()/g, '$1*(');
    s = s.replace(/(\))(\d)/g, ')*$2');
    s = s.replace(/(\))(\()/g, ')*(');
    s = s.replace(/(\d)([a-zA-Z])/g, '$1*$2');

    return s;
  }

  /**
   * Evaluates expression inside a controlled mathematical scope
   */
  function evaluateMathExpression(rawExpr) {
    if (!rawExpr || rawExpr.trim() === '') return 0;

    let trimmed = rawExpr.trim();
    // Trim incomplete trailing operators
    while (/[+\-*/^.(]$/.test(trimmed)) {
      trimmed = trimmed.slice(0, -1).trim();
    }
    if (!trimmed) return 0;

    // Balance unclosed parentheses
    const openParens = (trimmed.match(/\(/g) || []).length;
    const closeParens = (trimmed.match(/\)/g) || []).length;
    if (openParens > closeParens) {
      trimmed += ')'.repeat(openParens - closeParens);
    }

    const prepared = buildExecutableString(trimmed);

    // Validate characters to ensure safe expression
    const allowedTokens = /^[0-9+\-*/().%\s*^a-zA-Z_]+$/;
    if (!allowedTokens.test(prepared)) {
      throw new Error('Invalid syntax');
    }

    const isDeg = state.angleMode === 'DEG';
    const toRad = (x) => isDeg ? (x * Math.PI / 180) : x;
    const toDeg = (x) => isDeg ? (x * 180 / Math.PI) : x;

    // Controlled scope with high precision handling
    const scope = {
      sin: (x) => {
        if (isDeg && x % 180 === 0) return 0;
        return Math.sin(toRad(x));
      },
      cos: (x) => {
        if (isDeg && (x - 90) % 180 === 0) return 0;
        return Math.cos(toRad(x));
      },
      tan: (x) => {
        if (isDeg && (x - 90) % 180 === 0) throw new Error('Undefined (tan 90°)');
        if (isDeg && x % 180 === 0) return 0;
        return Math.tan(toRad(x));
      },
      asin: (x) => {
        if (x < -1 || x > 1) throw new Error('Invalid domain');
        return toDeg(Math.asin(x));
      },
      acos: (x) => {
        if (x < -1 || x > 1) throw new Error('Invalid domain');
        return toDeg(Math.acos(x));
      },
      atan: (x) => toDeg(Math.atan(x)),
      ln: (x) => {
        if (x <= 0) throw new Error('Domain error');
        return Math.log(x);
      },
      log: (x) => {
        if (x <= 0) throw new Error('Domain error');
        return Math.log10(x);
      },
      sqrt: (x) => {
        if (x < 0) throw new Error('Domain error');
        return Math.sqrt(x);
      },
      cbrt: (x) => Math.cbrt(x),
      abs: (x) => Math.abs(x),
      fact: (x) => factorial(Math.floor(x)),
      pi: Math.PI,
      e: Math.E
    };

    // Construct evaluator passing scope parameters
    const paramNames = Object.keys(scope);
    const paramValues = Object.values(scope);

    const evaluator = new Function(...paramNames, `"use strict"; return (${prepared});`);
    const result = evaluator(...paramValues);

    if (result === undefined || result === null || isNaN(result)) {
      throw new Error('Calculation error');
    }
    if (!isFinite(result)) {
      throw new Error('Cannot divide by zero');
    }

    return result;
  }

  // ==========================================
  // 5. DISPLAY & UI RENDERING
  // ==========================================

  function updateDisplay() {
    const text = state.displayValue;
    DOM.mainDisplay.textContent = text;

    // Dynamic font sizing
    DOM.mainDisplay.classList.remove('size-medium', 'size-small', 'size-tiny');
    const len = text.length;
    if (len > 18) {
      DOM.mainDisplay.classList.add('size-tiny');
    } else if (len > 12) {
      DOM.mainDisplay.classList.add('size-small');
    } else if (len > 8) {
      DOM.mainDisplay.classList.add('size-medium');
    }

    // Expression line
    DOM.expressionDisplay.textContent = state.expression;

    // Angle unit indicator
    DOM.angleUnitDisplay.textContent = state.angleMode;

    // Memory chip
    if (state.memory !== 0) {
      DOM.memoryIndicator.classList.remove('hidden');
    } else {
      DOM.memoryIndicator.classList.add('hidden');
    }

    // Live calculation preview
    renderLivePreview();
  }

  function renderLivePreview() {
    if (state.isResultEvaluated || !state.expression || state.displayValue === 'Error') {
      DOM.livePreviewDisplay.textContent = '';
      return;
    }

    // Combine current expression + active display
    let testExpr = state.expression;
    if (!state.waitingForOperand) {
      testExpr += ' ' + state.displayValue;
    }

    try {
      const preview = evaluateMathExpression(testExpr);
      if (isFinite(preview)) {
        DOM.livePreviewDisplay.textContent = '= ' + formatNumberPrecision(preview);
      } else {
        DOM.livePreviewDisplay.textContent = '';
      }
    } catch (e) {
      DOM.livePreviewDisplay.textContent = '';
    }
  }

  function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    DOM.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(15px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 2200);
  }

  // ==========================================
  // 6. CALCULATOR CORE ACTIONS
  // ==========================================

  function handleDigit(digit) {
    playTone('digit');

    if (state.isResultEvaluated) {
      // User starts fresh after calculation
      state.displayValue = digit;
      state.expression = '';
      state.waitingForOperand = false;
      state.isResultEvaluated = false;
    } else if (state.waitingForOperand) {
      // First digit of new operand
      state.displayValue = digit;
      state.waitingForOperand = false;
    } else {
      // Append to current operand
      if (state.displayValue === '0' || state.displayValue === 'Error') {
        state.displayValue = digit;
      } else {
        state.displayValue += digit;
      }
    }

    updateDisplay();
  }

  function handleDecimal() {
    playTone('digit');

    if (state.isResultEvaluated) {
      state.displayValue = '0.';
      state.expression = '';
      state.waitingForOperand = false;
      state.isResultEvaluated = false;
    } else if (state.waitingForOperand) {
      state.displayValue = '0.';
      state.waitingForOperand = false;
    } else {
      if (!state.displayValue.includes('.')) {
        state.displayValue += '.';
      }
    }

    updateDisplay();
  }

  function handleOperator(op) {
    playTone('operator');

    if (state.displayValue === 'Error') {
      handleClear();
      return;
    }

    // Format operator symbol for expression display
    let opSymbol = op;
    if (op === '*') opSymbol = '×';
    if (op === '/') opSymbol = '÷';
    if (op === '-') opSymbol = '−';

    if (state.isResultEvaluated) {
      // Chain previous result into next calculation
      state.expression = state.displayValue + ' ' + opSymbol + ' ';
      state.waitingForOperand = true;
      state.isResultEvaluated = false;
    } else if (state.waitingForOperand) {
      // User tapped another operator without entering a number, replace last operator
      state.expression = state.expression.replace(/[+\-×÷^]\s*$/, opSymbol + ' ');
    } else {
      // Normal operator attachment
      state.expression += state.displayValue + ' ' + opSymbol + ' ';
      state.waitingForOperand = true;
    }

    updateDisplay();
  }

  function handleParenthesis(paren) {
    playTone('operator');

    if (state.isResultEvaluated) {
      state.expression = paren === '(' ? '(' : '';
      state.displayValue = '0';
      state.waitingForOperand = paren === '(';
      state.isResultEvaluated = false;
    } else {
      if (paren === '(') {
        if (!state.waitingForOperand && state.displayValue !== '0') {
          // Implicit multiplication before open paren
          state.expression += state.displayValue + ' × (';
        } else {
          state.expression += '(';
        }
        state.waitingForOperand = true;
      } else if (paren === ')') {
        if (!state.waitingForOperand) {
          state.expression += state.displayValue + ')';
        } else {
          state.expression += ')';
        }
        state.waitingForOperand = false;
      }
    }

    updateDisplay();
  }

  function handleCalculate() {
    if (state.displayValue === 'Error') return;

    let fullExpr = state.expression;
    if (!state.waitingForOperand && !state.isResultEvaluated) {
      fullExpr += (fullExpr.endsWith('(') || !fullExpr ? '' : ' ') + state.displayValue;
    }

    if (!fullExpr || fullExpr.trim() === '') {
      playTone('digit');
      return;
    }

    try {
      const rawResult = evaluateMathExpression(fullExpr);
      playTone('equals');

      const formatted = formatNumberPrecision(rawResult);

      // Add entry to history tape
      addToHistory(fullExpr, formatted);

      state.displayValue = formatted;
      state.expression = fullExpr + ' =';
      state.waitingForOperand = true;
      state.isResultEvaluated = true;
    } catch (err) {
      playTone('error');
      state.displayValue = err.message.includes('divide') ? 'Cannot divide by 0' : 'Error';
      state.waitingForOperand = true;
      state.isResultEvaluated = true;
    }

    updateDisplay();
  }

  function handleClear() {
    playTone('clear');
    state.expression = '';
    state.displayValue = '0';
    state.waitingForOperand = false;
    state.isResultEvaluated = false;
    updateDisplay();
  }

  function handleBackspace() {
    playTone('digit');
    if (state.isResultEvaluated) {
      handleClear();
      return;
    }

    if (state.waitingForOperand) return;

    if (state.displayValue.length > 1) {
      state.displayValue = state.displayValue.slice(0, -1);
    } else {
      state.displayValue = '0';
    }
    updateDisplay();
  }

  function handleNegate() {
    playTone('operator');
    if (state.displayValue === '0' || state.displayValue === 'Error') return;

    if (state.displayValue.startsWith('-')) {
      state.displayValue = state.displayValue.slice(1);
    } else {
      state.displayValue = '-' + state.displayValue;
    }
    updateDisplay();
  }

  function handlePercent() {
    playTone('operator');
    if (state.displayValue === 'Error') return;

    const val = parseFloat(state.displayValue);
    if (!isNaN(val)) {
      state.displayValue = formatNumberPrecision(val / 100);
      updateDisplay();
    }
  }

  // --- Scientific Operations ---
  function handleScientific(func) {
    playTone('operator');

    if (state.displayValue === 'Error') {
      handleClear();
      return;
    }

    const currentNum = parseFloat(state.displayValue);

    switch (func) {
      case 'sin':
      case 'cos':
      case 'tan':
      case 'asin':
      case 'acos':
      case 'atan':
      case 'ln':
      case 'log':
      case 'sqrt':
      case 'cbrt':
      case 'abs':
        // If user already entered an operand, wrap and evaluate or prefix
        if (!state.waitingForOperand && state.displayValue !== '0') {
          try {
            const res = evaluateMathExpression(`${func}(${currentNum})`);
            state.expression += `${func}(${currentNum}) `;
            state.displayValue = formatNumberPrecision(res);
            state.waitingForOperand = true;
          } catch (e) {
            state.displayValue = 'Error';
            playTone('error');
          }
        } else {
          // Open function call in expression
          state.expression += `${func}(`;
          state.waitingForOperand = true;
        }
        break;

      case 'sqr': // x²
        if (!isNaN(currentNum)) {
          const res = currentNum ** 2;
          state.expression += `(${currentNum})² `;
          state.displayValue = formatNumberPrecision(res);
          state.waitingForOperand = true;
        }
        break;

      case 'cube': // x³
        if (!isNaN(currentNum)) {
          const res = currentNum ** 3;
          state.expression += `(${currentNum})³ `;
          state.displayValue = formatNumberPrecision(res);
          state.waitingForOperand = true;
        }
        break;

      case 'pow': // x^y
        handleOperator('^');
        return;

      case 'inv': // 1/x
        if (!isNaN(currentNum)) {
          if (currentNum === 0) {
            state.displayValue = 'Cannot divide by 0';
            playTone('error');
          } else {
            const res = 1 / currentNum;
            state.expression += `1/(${currentNum}) `;
            state.displayValue = formatNumberPrecision(res);
            state.waitingForOperand = true;
          }
        }
        break;

      case 'fact': // n!
        if (!isNaN(currentNum)) {
          try {
            const intVal = Math.floor(currentNum);
            const res = factorial(intVal);
            state.expression += `${intVal}! `;
            state.displayValue = formatNumberPrecision(res);
            state.waitingForOperand = true;
          } catch (e) {
            state.displayValue = 'Error';
            playTone('error');
          }
        }
        break;

      case 'pi':
        state.displayValue = formatNumberPrecision(Math.PI);
        state.waitingForOperand = false;
        state.isResultEvaluated = false;
        break;

      case 'euler':
        state.displayValue = formatNumberPrecision(Math.E);
        state.waitingForOperand = false;
        state.isResultEvaluated = false;
        break;

      case 'exp':
        if (state.displayValue !== '0' && !state.displayValue.includes('e')) {
          state.displayValue += 'e+';
        }
        break;

      case 'mod':
        handleOperator('%');
        return;
    }

    updateDisplay();
  }

  // --- Memory Operations ---
  function handleMemory(action) {
    playTone('operator');
    const currentNum = parseFloat(state.displayValue) || 0;

    switch (action) {
      case 'mc':
        state.memory = 0;
        showToast('Memory Cleared (MC)');
        break;
      case 'mr':
        state.displayValue = formatNumberPrecision(state.memory);
        state.waitingForOperand = false;
        state.isResultEvaluated = false;
        showToast(`Memory Recalled: ${formatNumberPrecision(state.memory)}`);
        break;
      case 'm-plus':
        state.memory += currentNum;
        showToast(`Added to Memory: ${formatNumberPrecision(state.memory)}`);
        break;
      case 'm-minus':
        state.memory -= currentNum;
        showToast(`Subtracted from Memory: ${formatNumberPrecision(state.memory)}`);
        break;
      case 'ms':
        state.memory = currentNum;
        showToast(`Stored in Memory: ${formatNumberPrecision(state.memory)}`);
        break;
    }

    try {
      localStorage.setItem(STORAGE_KEYS.MEMORY, state.memory.toString());
    } catch (e) {}

    updateDisplay();
  }

  // ==========================================
  // 7. CALCULATION HISTORY TAPE
  // ==========================================

  function addToHistory(expr, result) {
    const item = {
      id: Date.now(),
      expression: expr,
      result: result,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    state.history.unshift(item);
    if (state.history.length > 50) state.history.pop();

    try {
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(state.history));
    } catch (e) {}

    renderHistory();
  }

  function renderHistory() {
    DOM.historyList.innerHTML = '';

    if (state.history.length === 0) {
      DOM.historyEmpty.classList.remove('hidden');
      DOM.historyList.appendChild(DOM.historyEmpty);
      DOM.historyBadge.classList.add('hidden');
      return;
    }

    DOM.historyBadge.classList.remove('hidden');
    DOM.historyBadge.textContent = state.history.length;

    state.history.forEach(item => {
      const el = document.createElement('div');
      el.className = 'history-item';
      el.tabIndex = 0;
      el.setAttribute('role', 'button');
      el.innerHTML = `
        <span class="history-item-time">${item.timestamp}</span>
        <span class="history-item-exp">${item.expression} =</span>
        <span class="history-item-res">${item.result}</span>
      `;

      el.addEventListener('click', () => {
        playTone('digit');
        state.displayValue = item.result;
        state.expression = item.expression;
        state.waitingForOperand = true;
        state.isResultEvaluated = true;
        updateDisplay();
        showToast('Recalled calculation result');
      });

      DOM.historyList.appendChild(el);
    });
  }

  function clearHistory() {
    playTone('clear');
    state.history = [];
    try {
      localStorage.removeItem(STORAGE_KEYS.HISTORY);
    } catch (e) {}
    renderHistory();
    showToast('Calculation tape cleared');
  }

  // ==========================================
  // 8. UNIT CONVERTER SYSTEM
  // ==========================================

  const UNIT_DEFINITIONS = {
    length: {
      label: 'Length',
      base: 'm',
      units: {
        m: { name: 'Meters (m)', factor: 1 },
        km: { name: 'Kilometers (km)', factor: 1000 },
        cm: { name: 'Centimeters (cm)', factor: 0.01 },
        mm: { name: 'Millimeters (mm)', factor: 0.001 },
        mi: { name: 'Miles (mi)', factor: 1609.344 },
        yd: { name: 'Yards (yd)', factor: 0.9144 },
        ft: { name: 'Feet (ft)', factor: 0.3048 },
        in: { name: 'Inches (in)', factor: 0.0254 }
      }
    },
    mass: {
      label: 'Mass / Weight',
      base: 'kg',
      units: {
        kg: { name: 'Kilograms (kg)', factor: 1 },
        g: { name: 'Grams (g)', factor: 0.001 },
        mg: { name: 'Milligrams (mg)', factor: 0.000001 },
        lb: { name: 'Pounds (lb)', factor: 0.45359237 },
        oz: { name: 'Ounces (oz)', factor: 0.02834952 },
        t: { name: 'Metric Tons (t)', factor: 1000 }
      }
    },
    temp: {
      label: 'Temperature',
      custom: true,
      units: {
        c: { name: 'Celsius (°C)' },
        f: { name: 'Fahrenheit (°F)' },
        k: { name: 'Kelvin (K)' }
      },
      convert: (val, from, to) => {
        if (from === to) return val;
        let c = val;
        if (from === 'f') c = (val - 32) * (5 / 9);
        else if (from === 'k') c = val - 273.15;

        if (to === 'c') return c;
        if (to === 'f') return c * (9 / 5) + 32;
        if (to === 'k') return c + 273.15;
        return val;
      }
    },
    digital: {
      label: 'Digital Storage',
      base: 'b',
      units: {
        b: { name: 'Bytes (B)', factor: 1 },
        kb: { name: 'Kilobytes (KB)', factor: 1024 },
        mb: { name: 'Megabytes (MB)', factor: 1024 ** 2 },
        gb: { name: 'Gigabytes (GB)', factor: 1024 ** 3 },
        tb: { name: 'Terabytes (TB)', factor: 1024 ** 4 }
      }
    },
    speed: {
      label: 'Speed',
      base: 'mps',
      units: {
        mps: { name: 'Meters / sec (m/s)', factor: 1 },
        kph: { name: 'Kilometers / hr (km/h)', factor: 0.2777777778 },
        mph: { name: 'Miles / hr (mph)', factor: 0.44704 },
        knot: { name: 'Knots (kn)', factor: 0.5144444444 }
      }
    },
    time: {
      label: 'Time',
      base: 's',
      units: {
        ms: { name: 'Milliseconds (ms)', factor: 0.001 },
        s: { name: 'Seconds (s)', factor: 1 },
        min: { name: 'Minutes (min)', factor: 60 },
        hr: { name: 'Hours (hr)', factor: 3600 },
        day: { name: 'Days (d)', factor: 86400 },
        wk: { name: 'Weeks (wk)', factor: 604800 },
        yr: { name: 'Years (yr)', factor: 31536000 }
      }
    }
  };

  let activeCategory = 'length';

  function initConverter() {
    populateConverterUnits(activeCategory);

    // Category pill listeners
    DOM.converterCategories.querySelectorAll('.cat-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        playTone('digit');
        DOM.converterCategories.querySelectorAll('.cat-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        activeCategory = pill.dataset.category;
        populateConverterUnits(activeCategory);
        performConversion();
      });
    });

    DOM.convertInputVal.addEventListener('input', performConversion);
    DOM.convertFromUnit.addEventListener('change', performConversion);
    DOM.convertToUnit.addEventListener('change', performConversion);

    // Swap units
    DOM.swapUnitsBtn.addEventListener('click', () => {
      playTone('digit');
      const temp = DOM.convertFromUnit.value;
      DOM.convertFromUnit.value = DOM.convertToUnit.value;
      DOM.convertToUnit.value = temp;
      performConversion();
    });

    // Send converted value to main calculator
    DOM.transferToCalcBtn.addEventListener('click', () => {
      playTone('equals');
      const resVal = DOM.convertOutputVal.value;
      if (resVal && !isNaN(parseFloat(resVal))) {
        state.displayValue = resVal;
        state.expression = '';
        state.waitingForOperand = false;
        state.isResultEvaluated = true;
        setMode('standard');
        updateDisplay();
        showToast(`Sent ${resVal} to calculator`);
      }
    });

    performConversion();
  }

  function populateConverterUnits(catKey) {
    const cat = UNIT_DEFINITIONS[catKey];
    if (!cat) return;

    DOM.convertFromUnit.innerHTML = '';
    DOM.convertToUnit.innerHTML = '';

    const keys = Object.keys(cat.units);
    keys.forEach(k => {
      const optFrom = document.createElement('option');
      optFrom.value = k;
      optFrom.textContent = cat.units[k].name;
      DOM.convertFromUnit.appendChild(optFrom);

      const optTo = document.createElement('option');
      optTo.value = k;
      optTo.textContent = cat.units[k].name;
      DOM.convertToUnit.appendChild(optTo);
    });

    if (keys.length > 1) {
      DOM.convertFromUnit.value = keys[0];
      DOM.convertToUnit.value = keys[1];
    }
  }

  function performConversion() {
    const cat = UNIT_DEFINITIONS[activeCategory];
    if (!cat) return;

    const val = parseFloat(DOM.convertInputVal.value);
    if (isNaN(val)) {
      DOM.convertOutputVal.value = '—';
      return;
    }

    const fromKey = DOM.convertFromUnit.value;
    const toKey = DOM.convertToUnit.value;

    let converted = 0;
    if (cat.custom && cat.convert) {
      converted = cat.convert(val, fromKey, toKey);
    } else {
      const fromFactor = cat.units[fromKey].factor;
      const toFactor = cat.units[toKey].factor;
      const inBase = val * fromFactor;
      converted = inBase / toFactor;
    }

    DOM.convertOutputVal.value = formatNumberPrecision(converted);
  }

  // ==========================================
  // 9. MODE & THEME MANAGERS
  // ==========================================

  function setMode(mode) {
    state.currentMode = mode;

    DOM.tabStandard.classList.toggle('active', mode === 'standard');
    DOM.tabScientific.classList.toggle('active', mode === 'scientific');
    DOM.tabConverter.classList.toggle('active', mode === 'converter');

    if (mode === 'converter') {
      DOM.keypadZone.classList.add('hidden');
      DOM.converterPanel.classList.remove('hidden');
    } else {
      DOM.converterPanel.classList.add('hidden');
      DOM.keypadZone.classList.remove('hidden');

      if (mode === 'scientific') {
        DOM.scientificPanel.classList.add('expanded');
      } else {
        DOM.scientificPanel.classList.remove('expanded');
      }
    }
  }

  function applyTheme(themeName) {
    state.theme = themeName;
    DOM.body.setAttribute('data-theme', themeName);

    try {
      localStorage.setItem(STORAGE_KEYS.THEME, themeName);
    } catch (e) {}

    DOM.themeDropdown.querySelectorAll('.theme-option').forEach(opt => {
      opt.classList.toggle('active', opt.dataset.themeChoice === themeName);
    });
  }

  // ==========================================
  // 10. EVENTS & USER INTERACTION
  // ==========================================

  function initEventListeners() {
    // Mode tabs
    DOM.tabStandard.addEventListener('click', () => {
      playTone('digit');
      setMode('standard');
    });
    DOM.tabScientific.addEventListener('click', () => {
      playTone('digit');
      setMode('scientific');
    });
    DOM.tabConverter.addEventListener('click', () => {
      playTone('digit');
      setMode('converter');
    });

    // Sound toggle
    DOM.soundToggleBtn.addEventListener('click', () => {
      state.soundEnabled = !state.soundEnabled;
      try {
        localStorage.setItem(STORAGE_KEYS.SOUND, JSON.stringify(state.soundEnabled));
      } catch (e) {}

      DOM.soundToggleBtn.querySelector('.sound-on-icon').classList.toggle('hidden', !state.soundEnabled);
      DOM.soundToggleBtn.querySelector('.sound-off-icon').classList.toggle('hidden', state.soundEnabled);
      DOM.fxIndicator.style.opacity = state.soundEnabled ? '1' : '0.35';

      if (state.soundEnabled) playTone('equals');
      showToast(state.soundEnabled ? 'Mechanical audio enabled' : 'Audio muted');
    });

    // Theme selector
    DOM.themeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      DOM.themeDropdown.classList.toggle('show');
    });

    document.addEventListener('click', (e) => {
      if (!DOM.themeDropdown.contains(e.target) && e.target !== DOM.themeBtn) {
        DOM.themeDropdown.classList.remove('show');
      }
    });

    DOM.themeDropdown.querySelectorAll('.theme-option').forEach(btn => {
      btn.addEventListener('click', () => {
        playTone('digit');
        applyTheme(btn.dataset.themeChoice);
        DOM.themeDropdown.classList.remove('show');
      });
    });

    // Degree / Radian toggle
    DOM.angleUnitToggle.addEventListener('click', () => {
      playTone('digit');
      state.angleMode = state.angleMode === 'DEG' ? 'RAD' : 'DEG';
      try {
        localStorage.setItem(STORAGE_KEYS.ANGLE, state.angleMode);
      } catch (e) {}
      updateDisplay();
      showToast(`Trigonometry mode: ${state.angleMode}`);
    });

    // Clipboard copy
    DOM.copyResultBtn.addEventListener('click', () => {
      playTone('digit');
      const val = state.displayValue;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(val).then(() => {
          showToast(`Copied "${val}" to clipboard`);
        }).catch(() => fallbackCopy(val));
      } else {
        fallbackCopy(val);
      }
    });

    function fallbackCopy(text) {
      const el = document.createElement('textarea');
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      showToast(`Copied "${text}" to clipboard`);
    }

    // History drawer toggle
    DOM.historyToggleBtn.addEventListener('click', () => {
      playTone('digit');
      DOM.calculatorContainer.classList.toggle('with-history');
    });
    DOM.closeHistoryBtn.addEventListener('click', () => {
      DOM.calculatorContainer.classList.remove('with-history');
    });
    DOM.clearHistoryBtn.addEventListener('click', clearHistory);

    // Keyboard shortcuts modal
    DOM.shortcutsBtn.addEventListener('click', () => {
      DOM.shortcutsModal.classList.remove('hidden');
    });
    DOM.closeShortcutsBtn.addEventListener('click', () => {
      DOM.shortcutsModal.classList.add('hidden');
    });
    DOM.shortcutsModal.addEventListener('click', (e) => {
      if (e.target === DOM.shortcutsModal) {
        DOM.shortcutsModal.classList.add('hidden');
      }
    });

    // Calculator keypad clicks
    document.querySelectorAll('.keypad-zone button').forEach(btn => {
      btn.addEventListener('click', () => {
        const action = btn.dataset.action;
        const val = btn.dataset.val;

        // Button micro-press effect
        btn.classList.add('key-active');
        setTimeout(() => btn.classList.remove('key-active'), 120);

        if (action === 'digit') {
          handleDigit(val);
        } else if (action === 'decimal') {
          handleDecimal();
        } else if (action === 'operator') {
          handleOperator(val);
        } else if (action === 'calculate') {
          handleCalculate();
        } else if (action === 'clear') {
          handleClear();
        } else if (action === 'backspace') {
          handleBackspace();
        } else if (action === 'negate') {
          handleNegate();
        } else if (action === 'percent') {
          handlePercent();
        } else if (action === 'paren-open') {
          handleParenthesis('(');
        } else if (action === 'paren-close') {
          handleParenthesis(')');
        } else if (action && (action.startsWith('m-') || action === 'mc' || action === 'mr' || action === 'ms')) {
          handleMemory(action);
        } else {
          handleScientific(action);
        }
      });
    });

    // ==========================================
    // 11. PHYSICAL KEYBOARD INPUT LISTENER
    // ==========================================
    window.addEventListener('keydown', (e) => {
      // Ignore if user is inside converter input box
      if (document.activeElement === DOM.convertInputVal) return;

      const key = e.key;

      if (key >= '0' && key <= '9') {
        e.preventDefault();
        triggerKeyVisual(`[data-action="digit"][data-val="${key}"]`);
        handleDigit(key);
      } else if (key === '.') {
        e.preventDefault();
        triggerKeyVisual('[data-action="decimal"]');
        handleDecimal();
      } else if (key === '+' || key === '-' || key === '*' || key === '/') {
        e.preventDefault();
        triggerKeyVisual(`[data-action="operator"][data-val="${key}"]`);
        handleOperator(key);
      } else if (key === 'Enter' || key === '=') {
        e.preventDefault();
        triggerKeyVisual('#btnEquals');
        handleCalculate();
      } else if (key === 'Backspace') {
        e.preventDefault();
        triggerKeyVisual('#btnBackspace');
        handleBackspace();
      } else if (key === 'Escape' || key.toLowerCase() === 'c') {
        e.preventDefault();
        triggerKeyVisual('#btnClear');
        handleClear();
      } else if (key === '(') {
        e.preventDefault();
        triggerKeyVisual('[data-action="paren-open"]');
        handleParenthesis('(');
      } else if (key === ')') {
        e.preventDefault();
        triggerKeyVisual('[data-action="paren-close"]');
        handleParenthesis(')');
      } else if (key === '%') {
        e.preventDefault();
        triggerKeyVisual('[data-action="percent"]');
        handlePercent();
      } else if (key === '^') {
        e.preventDefault();
        triggerKeyVisual('[data-action="pow"]');
        handleOperator('^');
      } else if (key.toLowerCase() === 's') {
        e.preventDefault();
        handleScientific('sin');
      } else if (key.toLowerCase() === 'o') {
        e.preventDefault();
        handleScientific('cos');
      } else if (key.toLowerCase() === 't') {
        e.preventDefault();
        handleScientific('tan');
      } else if (key.toLowerCase() === 'p') {
        e.preventDefault();
        handleScientific('pi');
      } else if (key.toLowerCase() === 'h') {
        e.preventDefault();
        DOM.calculatorContainer.classList.toggle('with-history');
      } else if (key.toLowerCase() === 'm') {
        e.preventDefault();
        DOM.soundToggleBtn.click();
      } else if (key === '?') {
        e.preventDefault();
        DOM.shortcutsModal.classList.toggle('hidden');
      }
    });

    function triggerKeyVisual(selector) {
      const btn = document.querySelector(selector);
      if (btn) {
        btn.classList.add('key-active');
        setTimeout(() => btn.classList.remove('key-active'), 120);
      }
    }
  }

  // ==========================================
  // 12. INITIALIZATION
  // ==========================================
  function init() {
    applyTheme(state.theme);
    DOM.soundToggleBtn.querySelector('.sound-on-icon').classList.toggle('hidden', !state.soundEnabled);
    DOM.soundToggleBtn.querySelector('.sound-off-icon').classList.toggle('hidden', state.soundEnabled);
    DOM.fxIndicator.style.opacity = state.soundEnabled ? '1' : '0.35';

    initEventListeners();
    initConverter();
    renderHistory();
    updateDisplay();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
