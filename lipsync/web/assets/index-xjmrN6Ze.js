// @__NO_SIDE_EFFECTS__
function makeMap(str) {
  const map = /* @__PURE__ */ Object.create(null);
  for (const key of str.split(",")) map[key] = 1;
  return (val) => val in map;
}
const EMPTY_OBJ = {};
const EMPTY_ARR = [];
const NOOP = () => {
};
const NO = () => false;
const isOn = (key) => key.charCodeAt(0) === 111 && key.charCodeAt(1) === 110 && // uppercase letter
(key.charCodeAt(2) > 122 || key.charCodeAt(2) < 97);
const isModelListener = (key) => key.startsWith("onUpdate:");
const extend = Object.assign;
const remove = (arr, el) => {
  const i = arr.indexOf(el);
  if (i > -1) {
    arr.splice(i, 1);
  }
};
const hasOwnProperty$c = Object.prototype.hasOwnProperty;
const hasOwn = (val, key) => hasOwnProperty$c.call(val, key);
const isArray$1 = Array.isArray;
const isMap = (val) => toTypeString(val) === "[object Map]";
const isSet = (val) => toTypeString(val) === "[object Set]";
const isDate = (val) => toTypeString(val) === "[object Date]";
const isFunction$1 = (val) => typeof val === "function";
const isString = (val) => typeof val === "string";
const isSymbol$1 = (val) => typeof val === "symbol";
const isObject$2 = (val) => val !== null && typeof val === "object";
const isPromise = (val) => {
  return (isObject$2(val) || isFunction$1(val)) && isFunction$1(val.then) && isFunction$1(val.catch);
};
const objectToString$1 = Object.prototype.toString;
const toTypeString = (value) => objectToString$1.call(value);
const toRawType = (value) => {
  return toTypeString(value).slice(8, -1);
};
const isPlainObject$1 = (val) => toTypeString(val) === "[object Object]";
const isIntegerKey = (key) => isString(key) && key !== "NaN" && key[0] !== "-" && "" + parseInt(key, 10) === key;
const isReservedProp = /* @__PURE__ */ makeMap(
  // the leading comma is intentional so empty string "" is also included
  ",key,ref,ref_for,ref_key,onVnodeBeforeMount,onVnodeMounted,onVnodeBeforeUpdate,onVnodeUpdated,onVnodeBeforeUnmount,onVnodeUnmounted"
);
const cacheStringFunction = (fn) => {
  const cache = /* @__PURE__ */ Object.create(null);
  return ((str) => {
    const hit = cache[str];
    return hit || (cache[str] = fn(str));
  });
};
const camelizeRE = /-\w/g;
const camelize = cacheStringFunction(
  (str) => {
    return str.replace(camelizeRE, (c) => c.slice(1).toUpperCase());
  }
);
const hyphenateRE = /\B([A-Z])/g;
const hyphenate = cacheStringFunction(
  (str) => str.replace(hyphenateRE, "-$1").toLowerCase()
);
const capitalize = cacheStringFunction((str) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
});
const toHandlerKey = cacheStringFunction(
  (str) => {
    const s = str ? `on${capitalize(str)}` : ``;
    return s;
  }
);
const hasChanged = (value, oldValue) => !Object.is(value, oldValue);
const invokeArrayFns = (fns, ...arg) => {
  for (let i = 0; i < fns.length; i++) {
    fns[i](...arg);
  }
};
const def = (obj, key, value, writable = false) => {
  Object.defineProperty(obj, key, {
    configurable: true,
    enumerable: false,
    writable,
    value
  });
};
const looseToNumber = (val) => {
  const n = parseFloat(val);
  return isNaN(n) ? val : n;
};
const toNumber = (val) => {
  const n = isString(val) ? Number(val) : NaN;
  return isNaN(n) ? val : n;
};
let _globalThis;
const getGlobalThis = () => {
  return _globalThis || (_globalThis = typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : {});
};
function normalizeStyle(value) {
  if (isArray$1(value)) {
    const res = {};
    for (let i = 0; i < value.length; i++) {
      const item = value[i];
      const normalized = isString(item) ? parseStringStyle(item) : normalizeStyle(item);
      if (normalized) {
        for (const key in normalized) {
          res[key] = normalized[key];
        }
      }
    }
    return res;
  } else if (isString(value) || isObject$2(value)) {
    return value;
  }
}
const listDelimiterRE = /;(?![^(]*\))/g;
const propertyDelimiterRE = /:([^]+)/;
const styleCommentRE = /\/\*[^]*?\*\//g;
function parseStringStyle(cssText) {
  const ret = {};
  cssText.replace(styleCommentRE, "").split(listDelimiterRE).forEach((item) => {
    if (item) {
      const tmp = item.split(propertyDelimiterRE);
      tmp.length > 1 && (ret[tmp[0].trim()] = tmp[1].trim());
    }
  });
  return ret;
}
function normalizeClass(value) {
  let res = "";
  if (isString(value)) {
    res = value;
  } else if (isArray$1(value)) {
    for (let i = 0; i < value.length; i++) {
      const normalized = normalizeClass(value[i]);
      if (normalized) {
        res += normalized + " ";
      }
    }
  } else if (isObject$2(value)) {
    for (const name in value) {
      if (value[name]) {
        res += name + " ";
      }
    }
  }
  return res.trim();
}
function normalizeProps(props) {
  if (!props) return null;
  let { class: klass, style } = props;
  if (klass && !isString(klass)) {
    props.class = normalizeClass(klass);
  }
  if (style) {
    props.style = normalizeStyle(style);
  }
  return props;
}
const specialBooleanAttrs = `itemscope,allowfullscreen,formnovalidate,ismap,nomodule,novalidate,readonly`;
const isSpecialBooleanAttr = /* @__PURE__ */ makeMap(specialBooleanAttrs);
function includeBooleanAttr(value) {
  return !!value || value === "";
}
function looseCompareArrays(a, b) {
  if (a.length !== b.length) return false;
  let equal = true;
  for (let i = 0; equal && i < a.length; i++) {
    equal = looseEqual(a[i], b[i]);
  }
  return equal;
}
function looseEqual(a, b) {
  if (a === b) return true;
  let aValidType = isDate(a);
  let bValidType = isDate(b);
  if (aValidType || bValidType) {
    return aValidType && bValidType ? a.getTime() === b.getTime() : false;
  }
  aValidType = isSymbol$1(a);
  bValidType = isSymbol$1(b);
  if (aValidType || bValidType) {
    return a === b;
  }
  aValidType = isArray$1(a);
  bValidType = isArray$1(b);
  if (aValidType || bValidType) {
    return aValidType && bValidType ? looseCompareArrays(a, b) : false;
  }
  aValidType = isObject$2(a);
  bValidType = isObject$2(b);
  if (aValidType || bValidType) {
    if (!aValidType || !bValidType) {
      return false;
    }
    const aKeysCount = Object.keys(a).length;
    const bKeysCount = Object.keys(b).length;
    if (aKeysCount !== bKeysCount) {
      return false;
    }
    for (const key in a) {
      const aHasKey = a.hasOwnProperty(key);
      const bHasKey = b.hasOwnProperty(key);
      if (aHasKey && !bHasKey || !aHasKey && bHasKey || !looseEqual(a[key], b[key])) {
        return false;
      }
    }
  }
  return String(a) === String(b);
}
function looseIndexOf(arr, val) {
  return arr.findIndex((item) => looseEqual(item, val));
}
const isRef$1 = (val) => {
  return !!(val && val["__v_isRef"] === true);
};
const toDisplayString = (val) => {
  return isString(val) ? val : val == null ? "" : isArray$1(val) || isObject$2(val) && (val.toString === objectToString$1 || !isFunction$1(val.toString)) ? isRef$1(val) ? toDisplayString(val.value) : JSON.stringify(val, replacer, 2) : String(val);
};
const replacer = (_key, val) => {
  if (isRef$1(val)) {
    return replacer(_key, val.value);
  } else if (isMap(val)) {
    return {
      [`Map(${val.size})`]: [...val.entries()].reduce(
        (entries, [key, val2], i) => {
          entries[stringifySymbol(key, i) + " =>"] = val2;
          return entries;
        },
        {}
      )
    };
  } else if (isSet(val)) {
    return {
      [`Set(${val.size})`]: [...val.values()].map((v) => stringifySymbol(v))
    };
  } else if (isSymbol$1(val)) {
    return stringifySymbol(val);
  } else if (isObject$2(val) && !isArray$1(val) && !isPlainObject$1(val)) {
    return String(val);
  }
  return val;
};
const stringifySymbol = (v, i = "") => {
  var _a;
  return (
    // Symbol.description in es2019+ so we need to cast here to pass
    // the lib: es2016 check
    isSymbol$1(v) ? `Symbol(${(_a = v.description) != null ? _a : i})` : v
  );
};
let activeEffectScope;
class EffectScope {
  // TODO isolatedDeclarations "__v_skip"
  constructor(detached = false) {
    this.detached = detached;
    this._active = true;
    this._on = 0;
    this.effects = [];
    this.cleanups = [];
    this._isPaused = false;
    this._warnOnRun = true;
    this.__v_skip = true;
    if (!detached && activeEffectScope) {
      if (activeEffectScope.active) {
        this.parent = activeEffectScope;
        this.index = (activeEffectScope.scopes || (activeEffectScope.scopes = [])).push(
          this
        ) - 1;
      } else {
        this._active = false;
        this._warnOnRun = false;
      }
    }
  }
  get active() {
    return this._active;
  }
  pause() {
    if (this._active) {
      this._isPaused = true;
      let i, l;
      if (this.scopes) {
        for (i = 0, l = this.scopes.length; i < l; i++) {
          this.scopes[i].pause();
        }
      }
      for (i = 0, l = this.effects.length; i < l; i++) {
        this.effects[i].pause();
      }
    }
  }
  /**
   * Resumes the effect scope, including all child scopes and effects.
   */
  resume() {
    if (this._active) {
      if (this._isPaused) {
        this._isPaused = false;
        let i, l;
        if (this.scopes) {
          for (i = 0, l = this.scopes.length; i < l; i++) {
            this.scopes[i].resume();
          }
        }
        for (i = 0, l = this.effects.length; i < l; i++) {
          this.effects[i].resume();
        }
      }
    }
  }
  run(fn) {
    if (this._active) {
      const currentEffectScope = activeEffectScope;
      try {
        activeEffectScope = this;
        return fn();
      } finally {
        activeEffectScope = currentEffectScope;
      }
    }
  }
  /**
   * This should only be called on non-detached scopes
   * @internal
   */
  on() {
    if (++this._on === 1) {
      this.prevScope = activeEffectScope;
      activeEffectScope = this;
    }
  }
  /**
   * This should only be called on non-detached scopes
   * @internal
   */
  off() {
    if (this._on > 0 && --this._on === 0) {
      if (activeEffectScope === this) {
        activeEffectScope = this.prevScope;
      } else {
        let current = activeEffectScope;
        while (current) {
          if (current.prevScope === this) {
            current.prevScope = this.prevScope;
            break;
          }
          current = current.prevScope;
        }
      }
      this.prevScope = void 0;
    }
  }
  stop(fromParent) {
    if (this._active) {
      this._active = false;
      let i, l;
      for (i = 0, l = this.effects.length; i < l; i++) {
        this.effects[i].stop();
      }
      this.effects.length = 0;
      for (i = 0, l = this.cleanups.length; i < l; i++) {
        this.cleanups[i]();
      }
      this.cleanups.length = 0;
      if (this.scopes) {
        for (i = 0, l = this.scopes.length; i < l; i++) {
          this.scopes[i].stop(true);
        }
        this.scopes.length = 0;
      }
      if (!this.detached && this.parent && !fromParent) {
        const last = this.parent.scopes.pop();
        if (last && last !== this) {
          this.parent.scopes[this.index] = last;
          last.index = this.index;
        }
      }
      this.parent = void 0;
    }
  }
}
function effectScope(detached) {
  return new EffectScope(detached);
}
function getCurrentScope() {
  return activeEffectScope;
}
function onScopeDispose(fn, failSilently = false) {
  if (activeEffectScope) {
    activeEffectScope.cleanups.push(fn);
  }
}
let activeSub;
const pausedQueueEffects = /* @__PURE__ */ new WeakSet();
class ReactiveEffect {
  constructor(fn) {
    this.fn = fn;
    this.deps = void 0;
    this.depsTail = void 0;
    this.flags = 1 | 4;
    this.next = void 0;
    this.cleanup = void 0;
    this.scheduler = void 0;
    if (activeEffectScope) {
      if (activeEffectScope.active) {
        activeEffectScope.effects.push(this);
      } else {
        this.flags &= -2;
      }
    }
  }
  pause() {
    this.flags |= 64;
  }
  resume() {
    if (this.flags & 64) {
      this.flags &= -65;
      if (pausedQueueEffects.has(this)) {
        pausedQueueEffects.delete(this);
        this.trigger();
      }
    }
  }
  /**
   * @internal
   */
  notify() {
    if (this.flags & 2 && !(this.flags & 32)) {
      return;
    }
    if (!(this.flags & 8)) {
      batch(this);
    }
  }
  run() {
    if (!(this.flags & 1)) {
      return this.fn();
    }
    this.flags |= 2;
    cleanupEffect(this);
    prepareDeps(this);
    const prevEffect = activeSub;
    const prevShouldTrack = shouldTrack;
    activeSub = this;
    shouldTrack = true;
    try {
      return this.fn();
    } finally {
      cleanupDeps(this);
      activeSub = prevEffect;
      shouldTrack = prevShouldTrack;
      this.flags &= -3;
    }
  }
  stop() {
    if (this.flags & 1) {
      for (let link = this.deps; link; link = link.nextDep) {
        removeSub(link);
      }
      this.deps = this.depsTail = void 0;
      cleanupEffect(this);
      this.onStop && this.onStop();
      this.flags &= -2;
    }
  }
  trigger() {
    if (this.flags & 64) {
      pausedQueueEffects.add(this);
    } else if (this.scheduler) {
      this.scheduler();
    } else {
      this.runIfDirty();
    }
  }
  /**
   * @internal
   */
  runIfDirty() {
    if (isDirty(this)) {
      this.run();
    }
  }
  get dirty() {
    return isDirty(this);
  }
}
let batchDepth = 0;
let batchedSub;
let batchedComputed;
function batch(sub, isComputed = false) {
  sub.flags |= 8;
  if (isComputed) {
    sub.next = batchedComputed;
    batchedComputed = sub;
    return;
  }
  sub.next = batchedSub;
  batchedSub = sub;
}
function startBatch() {
  batchDepth++;
}
function endBatch() {
  if (--batchDepth > 0) {
    return;
  }
  if (batchedComputed) {
    let e = batchedComputed;
    batchedComputed = void 0;
    while (e) {
      const next = e.next;
      e.next = void 0;
      e.flags &= -9;
      e = next;
    }
  }
  let error;
  while (batchedSub) {
    let e = batchedSub;
    batchedSub = void 0;
    while (e) {
      const next = e.next;
      e.next = void 0;
      e.flags &= -9;
      if (e.flags & 1) {
        try {
          ;
          e.trigger();
        } catch (err) {
          if (!error) error = err;
        }
      }
      e = next;
    }
  }
  if (error) throw error;
}
function prepareDeps(sub) {
  for (let link = sub.deps; link; link = link.nextDep) {
    link.version = -1;
    link.prevActiveLink = link.dep.activeLink;
    link.dep.activeLink = link;
  }
}
function cleanupDeps(sub) {
  let head;
  let tail = sub.depsTail;
  let link = tail;
  while (link) {
    const prev = link.prevDep;
    if (link.version === -1) {
      if (link === tail) tail = prev;
      removeSub(link);
      removeDep(link);
    } else {
      head = link;
    }
    link.dep.activeLink = link.prevActiveLink;
    link.prevActiveLink = void 0;
    link = prev;
  }
  sub.deps = head;
  sub.depsTail = tail;
}
function isDirty(sub) {
  for (let link = sub.deps; link; link = link.nextDep) {
    if (link.dep.version !== link.version || link.dep.computed && (refreshComputed(link.dep.computed) || link.dep.version !== link.version)) {
      return true;
    }
  }
  if (sub._dirty) {
    return true;
  }
  return false;
}
function refreshComputed(computed2) {
  if (computed2.flags & 4 && !(computed2.flags & 16)) {
    return;
  }
  computed2.flags &= -17;
  if (computed2.globalVersion === globalVersion) {
    return;
  }
  computed2.globalVersion = globalVersion;
  if (!computed2.isSSR && computed2.flags & 128 && (!computed2.deps && !computed2._dirty || !isDirty(computed2))) {
    return;
  }
  computed2.flags |= 2;
  const dep = computed2.dep;
  const prevSub = activeSub;
  const prevShouldTrack = shouldTrack;
  activeSub = computed2;
  shouldTrack = true;
  try {
    prepareDeps(computed2);
    const value = computed2.fn(computed2._value);
    if (dep.version === 0 || hasChanged(value, computed2._value)) {
      computed2.flags |= 128;
      computed2._value = value;
      dep.version++;
    }
  } catch (err) {
    dep.version++;
    throw err;
  } finally {
    activeSub = prevSub;
    shouldTrack = prevShouldTrack;
    cleanupDeps(computed2);
    computed2.flags &= -3;
  }
}
function removeSub(link, soft = false) {
  const { dep, prevSub, nextSub } = link;
  if (prevSub) {
    prevSub.nextSub = nextSub;
    link.prevSub = void 0;
  }
  if (nextSub) {
    nextSub.prevSub = prevSub;
    link.nextSub = void 0;
  }
  if (dep.subs === link) {
    dep.subs = prevSub;
    if (!prevSub && dep.computed) {
      dep.computed.flags &= -5;
      for (let l = dep.computed.deps; l; l = l.nextDep) {
        removeSub(l, true);
      }
    }
  }
  if (!soft && !--dep.sc && dep.map) {
    dep.map.delete(dep.key);
  }
}
function removeDep(link) {
  const { prevDep, nextDep } = link;
  if (prevDep) {
    prevDep.nextDep = nextDep;
    link.prevDep = void 0;
  }
  if (nextDep) {
    nextDep.prevDep = prevDep;
    link.nextDep = void 0;
  }
}
let shouldTrack = true;
const trackStack = [];
function pauseTracking() {
  trackStack.push(shouldTrack);
  shouldTrack = false;
}
function resetTracking() {
  const last = trackStack.pop();
  shouldTrack = last === void 0 ? true : last;
}
function cleanupEffect(e) {
  const { cleanup } = e;
  e.cleanup = void 0;
  if (cleanup) {
    const prevSub = activeSub;
    activeSub = void 0;
    try {
      cleanup();
    } finally {
      activeSub = prevSub;
    }
  }
}
let globalVersion = 0;
class Link {
  constructor(sub, dep) {
    this.sub = sub;
    this.dep = dep;
    this.version = dep.version;
    this.nextDep = this.prevDep = this.nextSub = this.prevSub = this.prevActiveLink = void 0;
  }
}
class Dep {
  // TODO isolatedDeclarations "__v_skip"
  constructor(computed2) {
    this.computed = computed2;
    this.version = 0;
    this.activeLink = void 0;
    this.subs = void 0;
    this.map = void 0;
    this.key = void 0;
    this.sc = 0;
    this.__v_skip = true;
  }
  track(debugInfo) {
    if (!activeSub || !shouldTrack || activeSub === this.computed) {
      return;
    }
    let link = this.activeLink;
    if (link === void 0 || link.sub !== activeSub) {
      link = this.activeLink = new Link(activeSub, this);
      if (!activeSub.deps) {
        activeSub.deps = activeSub.depsTail = link;
      } else {
        link.prevDep = activeSub.depsTail;
        activeSub.depsTail.nextDep = link;
        activeSub.depsTail = link;
      }
      addSub(link);
    } else if (link.version === -1) {
      link.version = this.version;
      if (link.nextDep) {
        const next = link.nextDep;
        next.prevDep = link.prevDep;
        if (link.prevDep) {
          link.prevDep.nextDep = next;
        }
        link.prevDep = activeSub.depsTail;
        link.nextDep = void 0;
        activeSub.depsTail.nextDep = link;
        activeSub.depsTail = link;
        if (activeSub.deps === link) {
          activeSub.deps = next;
        }
      }
    }
    return link;
  }
  trigger(debugInfo) {
    this.version++;
    globalVersion++;
    this.notify(debugInfo);
  }
  notify(debugInfo) {
    startBatch();
    try {
      if (false) ;
      for (let link = this.subs; link; link = link.prevSub) {
        if (link.sub.notify()) {
          ;
          link.sub.dep.notify();
        }
      }
    } finally {
      endBatch();
    }
  }
}
function addSub(link) {
  link.dep.sc++;
  if (link.sub.flags & 4) {
    const computed2 = link.dep.computed;
    if (computed2 && !link.dep.subs) {
      computed2.flags |= 4 | 16;
      for (let l = computed2.deps; l; l = l.nextDep) {
        addSub(l);
      }
    }
    const currentTail = link.dep.subs;
    if (currentTail !== link) {
      link.prevSub = currentTail;
      if (currentTail) currentTail.nextSub = link;
    }
    link.dep.subs = link;
  }
}
const targetMap = /* @__PURE__ */ new WeakMap();
const ITERATE_KEY = /* @__PURE__ */ Symbol(
  ""
);
const MAP_KEY_ITERATE_KEY = /* @__PURE__ */ Symbol(
  ""
);
const ARRAY_ITERATE_KEY = /* @__PURE__ */ Symbol(
  ""
);
function track(target, type, key) {
  if (shouldTrack && activeSub) {
    let depsMap = targetMap.get(target);
    if (!depsMap) {
      targetMap.set(target, depsMap = /* @__PURE__ */ new Map());
    }
    let dep = depsMap.get(key);
    if (!dep) {
      depsMap.set(key, dep = new Dep());
      dep.map = depsMap;
      dep.key = key;
    }
    {
      dep.track();
    }
  }
}
function trigger(target, type, key, newValue, oldValue, oldTarget) {
  const depsMap = targetMap.get(target);
  if (!depsMap) {
    globalVersion++;
    return;
  }
  const run = (dep) => {
    if (dep) {
      {
        dep.trigger();
      }
    }
  };
  startBatch();
  if (type === "clear") {
    depsMap.forEach(run);
  } else {
    const targetIsArray = isArray$1(target);
    const isArrayIndex = targetIsArray && isIntegerKey(key);
    if (targetIsArray && key === "length") {
      const newLength = Number(newValue);
      depsMap.forEach((dep, key2) => {
        if (key2 === "length" || key2 === ARRAY_ITERATE_KEY || !isSymbol$1(key2) && key2 >= newLength) {
          run(dep);
        }
      });
    } else {
      if (key !== void 0 || depsMap.has(void 0)) {
        run(depsMap.get(key));
      }
      if (isArrayIndex) {
        run(depsMap.get(ARRAY_ITERATE_KEY));
      }
      switch (type) {
        case "add":
          if (!targetIsArray) {
            run(depsMap.get(ITERATE_KEY));
            if (isMap(target)) {
              run(depsMap.get(MAP_KEY_ITERATE_KEY));
            }
          } else if (isArrayIndex) {
            run(depsMap.get("length"));
          }
          break;
        case "delete":
          if (!targetIsArray) {
            run(depsMap.get(ITERATE_KEY));
            if (isMap(target)) {
              run(depsMap.get(MAP_KEY_ITERATE_KEY));
            }
          }
          break;
        case "set":
          if (isMap(target)) {
            run(depsMap.get(ITERATE_KEY));
          }
          break;
      }
    }
  }
  endBatch();
}
function getDepFromReactive(object, key) {
  const depMap = targetMap.get(object);
  return depMap && depMap.get(key);
}
function reactiveReadArray(array) {
  const raw = /* @__PURE__ */ toRaw(array);
  if (raw === array) return raw;
  track(raw, "iterate", ARRAY_ITERATE_KEY);
  return /* @__PURE__ */ isShallow(array) ? raw : raw.map(toReactive$1);
}
function shallowReadArray(arr) {
  track(arr = /* @__PURE__ */ toRaw(arr), "iterate", ARRAY_ITERATE_KEY);
  return arr;
}
function toWrapped(target, item) {
  if (/* @__PURE__ */ isReadonly(target)) {
    return /* @__PURE__ */ isReactive(target) ? toReadonly(toReactive$1(item)) : toReadonly(item);
  }
  return toReactive$1(item);
}
const arrayInstrumentations = {
  __proto__: null,
  [Symbol.iterator]() {
    return iterator(this, Symbol.iterator, (item) => toWrapped(this, item));
  },
  concat(...args) {
    return reactiveReadArray(this).concat(
      ...args.map((x) => isArray$1(x) ? reactiveReadArray(x) : x)
    );
  },
  entries() {
    return iterator(this, "entries", (value) => {
      value[1] = toWrapped(this, value[1]);
      return value;
    });
  },
  every(fn, thisArg) {
    return apply$1(this, "every", fn, thisArg, void 0, arguments);
  },
  filter(fn, thisArg) {
    return apply$1(
      this,
      "filter",
      fn,
      thisArg,
      (v) => v.map((item) => toWrapped(this, item)),
      arguments
    );
  },
  find(fn, thisArg) {
    return apply$1(
      this,
      "find",
      fn,
      thisArg,
      (item) => toWrapped(this, item),
      arguments
    );
  },
  findIndex(fn, thisArg) {
    return apply$1(this, "findIndex", fn, thisArg, void 0, arguments);
  },
  findLast(fn, thisArg) {
    return apply$1(
      this,
      "findLast",
      fn,
      thisArg,
      (item) => toWrapped(this, item),
      arguments
    );
  },
  findLastIndex(fn, thisArg) {
    return apply$1(this, "findLastIndex", fn, thisArg, void 0, arguments);
  },
  // flat, flatMap could benefit from ARRAY_ITERATE but are not straight-forward to implement
  forEach(fn, thisArg) {
    return apply$1(this, "forEach", fn, thisArg, void 0, arguments);
  },
  includes(...args) {
    return searchProxy(this, "includes", args);
  },
  indexOf(...args) {
    return searchProxy(this, "indexOf", args);
  },
  join(separator) {
    return reactiveReadArray(this).join(separator);
  },
  // keys() iterator only reads `length`, no optimization required
  lastIndexOf(...args) {
    return searchProxy(this, "lastIndexOf", args);
  },
  map(fn, thisArg) {
    return apply$1(this, "map", fn, thisArg, void 0, arguments);
  },
  pop() {
    return noTracking(this, "pop");
  },
  push(...args) {
    return noTracking(this, "push", args);
  },
  reduce(fn, ...args) {
    return reduce(this, "reduce", fn, args);
  },
  reduceRight(fn, ...args) {
    return reduce(this, "reduceRight", fn, args);
  },
  shift() {
    return noTracking(this, "shift");
  },
  // slice could use ARRAY_ITERATE but also seems to beg for range tracking
  some(fn, thisArg) {
    return apply$1(this, "some", fn, thisArg, void 0, arguments);
  },
  splice(...args) {
    return noTracking(this, "splice", args);
  },
  toReversed() {
    return reactiveReadArray(this).toReversed();
  },
  toSorted(comparer) {
    return reactiveReadArray(this).toSorted(comparer);
  },
  toSpliced(...args) {
    return reactiveReadArray(this).toSpliced(...args);
  },
  unshift(...args) {
    return noTracking(this, "unshift", args);
  },
  values() {
    return iterator(this, "values", (item) => toWrapped(this, item));
  }
};
function iterator(self2, method, wrapValue) {
  const arr = shallowReadArray(self2);
  const iter = arr[method]();
  if (arr !== self2 && !/* @__PURE__ */ isShallow(self2)) {
    iter._next = iter.next;
    iter.next = () => {
      const result = iter._next();
      if (!result.done) {
        result.value = wrapValue(result.value);
      }
      return result;
    };
  }
  return iter;
}
const arrayProto$1 = Array.prototype;
function apply$1(self2, method, fn, thisArg, wrappedRetFn, args) {
  const arr = shallowReadArray(self2);
  const needsWrap = arr !== self2 && !/* @__PURE__ */ isShallow(self2);
  const methodFn = arr[method];
  if (methodFn !== arrayProto$1[method]) {
    const result2 = methodFn.apply(self2, args);
    return needsWrap ? toReactive$1(result2) : result2;
  }
  let wrappedFn = fn;
  if (arr !== self2) {
    if (needsWrap) {
      wrappedFn = function(item, index) {
        return fn.call(this, toWrapped(self2, item), index, self2);
      };
    } else if (fn.length > 2) {
      wrappedFn = function(item, index) {
        return fn.call(this, item, index, self2);
      };
    }
  }
  const result = methodFn.call(arr, wrappedFn, thisArg);
  return needsWrap && wrappedRetFn ? wrappedRetFn(result) : result;
}
function reduce(self2, method, fn, args) {
  const arr = shallowReadArray(self2);
  const needsWrap = arr !== self2 && !/* @__PURE__ */ isShallow(self2);
  let wrappedFn = fn;
  let wrapInitialAccumulator = false;
  if (arr !== self2) {
    if (needsWrap) {
      wrapInitialAccumulator = args.length === 0;
      wrappedFn = function(acc, item, index) {
        if (wrapInitialAccumulator) {
          wrapInitialAccumulator = false;
          acc = toWrapped(self2, acc);
        }
        return fn.call(this, acc, toWrapped(self2, item), index, self2);
      };
    } else if (fn.length > 3) {
      wrappedFn = function(acc, item, index) {
        return fn.call(this, acc, item, index, self2);
      };
    }
  }
  const result = arr[method](wrappedFn, ...args);
  return wrapInitialAccumulator ? toWrapped(self2, result) : result;
}
function searchProxy(self2, method, args) {
  const arr = /* @__PURE__ */ toRaw(self2);
  track(arr, "iterate", ARRAY_ITERATE_KEY);
  const res = arr[method](...args);
  if ((res === -1 || res === false) && /* @__PURE__ */ isProxy(args[0])) {
    args[0] = /* @__PURE__ */ toRaw(args[0]);
    return arr[method](...args);
  }
  return res;
}
function noTracking(self2, method, args = []) {
  pauseTracking();
  startBatch();
  const res = (/* @__PURE__ */ toRaw(self2))[method].apply(self2, args);
  endBatch();
  resetTracking();
  return res;
}
const isNonTrackableKeys = /* @__PURE__ */ makeMap(`__proto__,__v_isRef,__isVue`);
const builtInSymbols = new Set(
  /* @__PURE__ */ Object.getOwnPropertyNames(Symbol).filter((key) => key !== "arguments" && key !== "caller").map((key) => Symbol[key]).filter(isSymbol$1)
);
function hasOwnProperty$b(key) {
  if (!isSymbol$1(key)) key = String(key);
  const obj = /* @__PURE__ */ toRaw(this);
  track(obj, "has", key);
  return obj.hasOwnProperty(key);
}
class BaseReactiveHandler {
  constructor(_isReadonly = false, _isShallow = false) {
    this._isReadonly = _isReadonly;
    this._isShallow = _isShallow;
  }
  get(target, key, receiver) {
    if (key === "__v_skip") return target["__v_skip"];
    const isReadonly2 = this._isReadonly, isShallow2 = this._isShallow;
    if (key === "__v_isReactive") {
      return !isReadonly2;
    } else if (key === "__v_isReadonly") {
      return isReadonly2;
    } else if (key === "__v_isShallow") {
      return isShallow2;
    } else if (key === "__v_raw") {
      if (receiver === (isReadonly2 ? isShallow2 ? shallowReadonlyMap : readonlyMap : isShallow2 ? shallowReactiveMap : reactiveMap).get(target) || // receiver is not the reactive proxy, but has the same prototype
      // this means the receiver is a user proxy of the reactive proxy
      Object.getPrototypeOf(target) === Object.getPrototypeOf(receiver)) {
        return target;
      }
      return;
    }
    const targetIsArray = isArray$1(target);
    if (!isReadonly2) {
      let fn;
      if (targetIsArray && (fn = arrayInstrumentations[key])) {
        return fn;
      }
      if (key === "hasOwnProperty") {
        return hasOwnProperty$b;
      }
    }
    const res = Reflect.get(
      target,
      key,
      // if this is a proxy wrapping a ref, return methods using the raw ref
      // as receiver so that we don't have to call `toRaw` on the ref in all
      // its class methods
      /* @__PURE__ */ isRef(target) ? target : receiver
    );
    if (isSymbol$1(key) ? builtInSymbols.has(key) : isNonTrackableKeys(key)) {
      return res;
    }
    if (!isReadonly2) {
      track(target, "get", key);
    }
    if (isShallow2) {
      return res;
    }
    if (/* @__PURE__ */ isRef(res)) {
      const value = targetIsArray && isIntegerKey(key) ? res : res.value;
      return isReadonly2 && isObject$2(value) ? /* @__PURE__ */ readonly(value) : value;
    }
    if (isObject$2(res)) {
      return isReadonly2 ? /* @__PURE__ */ readonly(res) : /* @__PURE__ */ reactive(res);
    }
    return res;
  }
}
class MutableReactiveHandler extends BaseReactiveHandler {
  constructor(isShallow2 = false) {
    super(false, isShallow2);
  }
  set(target, key, value, receiver) {
    let oldValue = target[key];
    const isArrayWithIntegerKey = isArray$1(target) && isIntegerKey(key);
    if (!this._isShallow) {
      const isOldValueReadonly = /* @__PURE__ */ isReadonly(oldValue);
      if (!/* @__PURE__ */ isShallow(value) && !/* @__PURE__ */ isReadonly(value)) {
        oldValue = /* @__PURE__ */ toRaw(oldValue);
        value = /* @__PURE__ */ toRaw(value);
      }
      if (!isArrayWithIntegerKey && /* @__PURE__ */ isRef(oldValue) && !/* @__PURE__ */ isRef(value)) {
        if (isOldValueReadonly) {
          return true;
        } else {
          oldValue.value = value;
          return true;
        }
      }
    }
    const hadKey = isArrayWithIntegerKey ? Number(key) < target.length : hasOwn(target, key);
    const result = Reflect.set(
      target,
      key,
      value,
      /* @__PURE__ */ isRef(target) ? target : receiver
    );
    if (target === /* @__PURE__ */ toRaw(receiver)) {
      if (!hadKey) {
        trigger(target, "add", key, value);
      } else if (hasChanged(value, oldValue)) {
        trigger(target, "set", key, value);
      }
    }
    return result;
  }
  deleteProperty(target, key) {
    const hadKey = hasOwn(target, key);
    target[key];
    const result = Reflect.deleteProperty(target, key);
    if (result && hadKey) {
      trigger(target, "delete", key, void 0);
    }
    return result;
  }
  has(target, key) {
    const result = Reflect.has(target, key);
    if (!isSymbol$1(key) || !builtInSymbols.has(key)) {
      track(target, "has", key);
    }
    return result;
  }
  ownKeys(target) {
    track(
      target,
      "iterate",
      isArray$1(target) ? "length" : ITERATE_KEY
    );
    return Reflect.ownKeys(target);
  }
}
class ReadonlyReactiveHandler extends BaseReactiveHandler {
  constructor(isShallow2 = false) {
    super(true, isShallow2);
  }
  set(target, key) {
    return true;
  }
  deleteProperty(target, key) {
    return true;
  }
}
const mutableHandlers = /* @__PURE__ */ new MutableReactiveHandler();
const readonlyHandlers = /* @__PURE__ */ new ReadonlyReactiveHandler();
const shallowReactiveHandlers = /* @__PURE__ */ new MutableReactiveHandler(true);
const shallowReadonlyHandlers = /* @__PURE__ */ new ReadonlyReactiveHandler(true);
const toShallow = (value) => value;
const getProto = (v) => Reflect.getPrototypeOf(v);
function createIterableMethod(method, isReadonly2, isShallow2) {
  return function(...args) {
    const target = this["__v_raw"];
    const rawTarget = /* @__PURE__ */ toRaw(target);
    const targetIsMap = isMap(rawTarget);
    const isPair = method === "entries" || method === Symbol.iterator && targetIsMap;
    const isKeyOnly = method === "keys" && targetIsMap;
    const innerIterator = target[method](...args);
    const wrap = isShallow2 ? toShallow : isReadonly2 ? toReadonly : toReactive$1;
    !isReadonly2 && track(
      rawTarget,
      "iterate",
      isKeyOnly ? MAP_KEY_ITERATE_KEY : ITERATE_KEY
    );
    return extend(
      // inheriting all iterator properties
      Object.create(innerIterator),
      {
        // iterator protocol
        next() {
          const { value, done } = innerIterator.next();
          return done ? { value, done } : {
            value: isPair ? [wrap(value[0]), wrap(value[1])] : wrap(value),
            done
          };
        }
      }
    );
  };
}
function createReadonlyMethod(type) {
  return function(...args) {
    return type === "delete" ? false : type === "clear" ? void 0 : this;
  };
}
function createInstrumentations(readonly2, shallow) {
  const instrumentations = {
    get(key) {
      const target = this["__v_raw"];
      const rawTarget = /* @__PURE__ */ toRaw(target);
      const rawKey = /* @__PURE__ */ toRaw(key);
      if (!readonly2) {
        if (hasChanged(key, rawKey)) {
          track(rawTarget, "get", key);
        }
        track(rawTarget, "get", rawKey);
      }
      const { has } = getProto(rawTarget);
      const wrap = shallow ? toShallow : readonly2 ? toReadonly : toReactive$1;
      if (has.call(rawTarget, key)) {
        return wrap(target.get(key));
      } else if (has.call(rawTarget, rawKey)) {
        return wrap(target.get(rawKey));
      } else if (target !== rawTarget) {
        target.get(key);
      }
    },
    get size() {
      const target = this["__v_raw"];
      !readonly2 && track(/* @__PURE__ */ toRaw(target), "iterate", ITERATE_KEY);
      return target.size;
    },
    has(key) {
      const target = this["__v_raw"];
      const rawTarget = /* @__PURE__ */ toRaw(target);
      const rawKey = /* @__PURE__ */ toRaw(key);
      if (!readonly2) {
        if (hasChanged(key, rawKey)) {
          track(rawTarget, "has", key);
        }
        track(rawTarget, "has", rawKey);
      }
      return key === rawKey ? target.has(key) : target.has(key) || target.has(rawKey);
    },
    forEach(callback, thisArg) {
      const observed = this;
      const target = observed["__v_raw"];
      const rawTarget = /* @__PURE__ */ toRaw(target);
      const wrap = shallow ? toShallow : readonly2 ? toReadonly : toReactive$1;
      !readonly2 && track(rawTarget, "iterate", ITERATE_KEY);
      return target.forEach((value, key) => {
        return callback.call(thisArg, wrap(value), wrap(key), observed);
      });
    }
  };
  extend(
    instrumentations,
    readonly2 ? {
      add: createReadonlyMethod("add"),
      set: createReadonlyMethod("set"),
      delete: createReadonlyMethod("delete"),
      clear: createReadonlyMethod("clear")
    } : {
      add(value) {
        const target = /* @__PURE__ */ toRaw(this);
        const proto = getProto(target);
        const rawValue = /* @__PURE__ */ toRaw(value);
        const valueToAdd = !shallow && !/* @__PURE__ */ isShallow(value) && !/* @__PURE__ */ isReadonly(value) ? rawValue : value;
        const hadKey = proto.has.call(target, valueToAdd) || hasChanged(value, valueToAdd) && proto.has.call(target, value) || hasChanged(rawValue, valueToAdd) && proto.has.call(target, rawValue);
        if (!hadKey) {
          target.add(valueToAdd);
          trigger(target, "add", valueToAdd, valueToAdd);
        }
        return this;
      },
      set(key, value) {
        if (!shallow && !/* @__PURE__ */ isShallow(value) && !/* @__PURE__ */ isReadonly(value)) {
          value = /* @__PURE__ */ toRaw(value);
        }
        const target = /* @__PURE__ */ toRaw(this);
        const { has, get: get2 } = getProto(target);
        let hadKey = has.call(target, key);
        if (!hadKey) {
          key = /* @__PURE__ */ toRaw(key);
          hadKey = has.call(target, key);
        }
        const oldValue = get2.call(target, key);
        target.set(key, value);
        if (!hadKey) {
          trigger(target, "add", key, value);
        } else if (hasChanged(value, oldValue)) {
          trigger(target, "set", key, value);
        }
        return this;
      },
      delete(key) {
        const target = /* @__PURE__ */ toRaw(this);
        const { has, get: get2 } = getProto(target);
        let hadKey = has.call(target, key);
        if (!hadKey) {
          key = /* @__PURE__ */ toRaw(key);
          hadKey = has.call(target, key);
        }
        get2 ? get2.call(target, key) : void 0;
        const result = target.delete(key);
        if (hadKey) {
          trigger(target, "delete", key, void 0);
        }
        return result;
      },
      clear() {
        const target = /* @__PURE__ */ toRaw(this);
        const hadItems = target.size !== 0;
        const result = target.clear();
        if (hadItems) {
          trigger(
            target,
            "clear",
            void 0,
            void 0
          );
        }
        return result;
      }
    }
  );
  const iteratorMethods = [
    "keys",
    "values",
    "entries",
    Symbol.iterator
  ];
  iteratorMethods.forEach((method) => {
    instrumentations[method] = createIterableMethod(method, readonly2, shallow);
  });
  return instrumentations;
}
function createInstrumentationGetter(isReadonly2, shallow) {
  const instrumentations = createInstrumentations(isReadonly2, shallow);
  return (target, key, receiver) => {
    if (key === "__v_isReactive") {
      return !isReadonly2;
    } else if (key === "__v_isReadonly") {
      return isReadonly2;
    } else if (key === "__v_raw") {
      return target;
    }
    return Reflect.get(
      hasOwn(instrumentations, key) && key in target ? instrumentations : target,
      key,
      receiver
    );
  };
}
const mutableCollectionHandlers = {
  get: /* @__PURE__ */ createInstrumentationGetter(false, false)
};
const shallowCollectionHandlers = {
  get: /* @__PURE__ */ createInstrumentationGetter(false, true)
};
const readonlyCollectionHandlers = {
  get: /* @__PURE__ */ createInstrumentationGetter(true, false)
};
const shallowReadonlyCollectionHandlers = {
  get: /* @__PURE__ */ createInstrumentationGetter(true, true)
};
const reactiveMap = /* @__PURE__ */ new WeakMap();
const shallowReactiveMap = /* @__PURE__ */ new WeakMap();
const readonlyMap = /* @__PURE__ */ new WeakMap();
const shallowReadonlyMap = /* @__PURE__ */ new WeakMap();
function targetTypeMap(rawType) {
  switch (rawType) {
    case "Object":
    case "Array":
      return 1;
    case "Map":
    case "Set":
    case "WeakMap":
    case "WeakSet":
      return 2;
    default:
      return 0;
  }
}
function getTargetType(value) {
  return value["__v_skip"] || !Object.isExtensible(value) ? 0 : targetTypeMap(toRawType(value));
}
// @__NO_SIDE_EFFECTS__
function reactive(target) {
  if (/* @__PURE__ */ isReadonly(target)) {
    return target;
  }
  return createReactiveObject(
    target,
    false,
    mutableHandlers,
    mutableCollectionHandlers,
    reactiveMap
  );
}
// @__NO_SIDE_EFFECTS__
function shallowReactive(target) {
  return createReactiveObject(
    target,
    false,
    shallowReactiveHandlers,
    shallowCollectionHandlers,
    shallowReactiveMap
  );
}
// @__NO_SIDE_EFFECTS__
function readonly(target) {
  return createReactiveObject(
    target,
    true,
    readonlyHandlers,
    readonlyCollectionHandlers,
    readonlyMap
  );
}
// @__NO_SIDE_EFFECTS__
function shallowReadonly(target) {
  return createReactiveObject(
    target,
    true,
    shallowReadonlyHandlers,
    shallowReadonlyCollectionHandlers,
    shallowReadonlyMap
  );
}
function createReactiveObject(target, isReadonly2, baseHandlers, collectionHandlers, proxyMap) {
  if (!isObject$2(target)) {
    return target;
  }
  if (target["__v_raw"] && !(isReadonly2 && target["__v_isReactive"])) {
    return target;
  }
  const targetType = getTargetType(target);
  if (targetType === 0) {
    return target;
  }
  const existingProxy = proxyMap.get(target);
  if (existingProxy) {
    return existingProxy;
  }
  const proxy = new Proxy(
    target,
    targetType === 2 ? collectionHandlers : baseHandlers
  );
  proxyMap.set(target, proxy);
  return proxy;
}
// @__NO_SIDE_EFFECTS__
function isReactive(value) {
  if (/* @__PURE__ */ isReadonly(value)) {
    return /* @__PURE__ */ isReactive(value["__v_raw"]);
  }
  return !!(value && value["__v_isReactive"]);
}
// @__NO_SIDE_EFFECTS__
function isReadonly(value) {
  return !!(value && value["__v_isReadonly"]);
}
// @__NO_SIDE_EFFECTS__
function isShallow(value) {
  return !!(value && value["__v_isShallow"]);
}
// @__NO_SIDE_EFFECTS__
function isProxy(value) {
  return value ? !!value["__v_raw"] : false;
}
// @__NO_SIDE_EFFECTS__
function toRaw(observed) {
  const raw = observed && observed["__v_raw"];
  return raw ? /* @__PURE__ */ toRaw(raw) : observed;
}
function markRaw(value) {
  if (!hasOwn(value, "__v_skip") && Object.isExtensible(value)) {
    def(value, "__v_skip", true);
  }
  return value;
}
const toReactive$1 = (value) => isObject$2(value) ? /* @__PURE__ */ reactive(value) : value;
const toReadonly = (value) => isObject$2(value) ? /* @__PURE__ */ readonly(value) : value;
// @__NO_SIDE_EFFECTS__
function isRef(r) {
  return r ? r["__v_isRef"] === true : false;
}
// @__NO_SIDE_EFFECTS__
function ref(value) {
  return createRef(value, false);
}
// @__NO_SIDE_EFFECTS__
function shallowRef(value) {
  return createRef(value, true);
}
function createRef(rawValue, shallow) {
  if (/* @__PURE__ */ isRef(rawValue)) {
    return rawValue;
  }
  return new RefImpl(rawValue, shallow);
}
class RefImpl {
  constructor(value, isShallow2) {
    this.dep = new Dep();
    this["__v_isRef"] = true;
    this["__v_isShallow"] = false;
    this._rawValue = isShallow2 ? value : /* @__PURE__ */ toRaw(value);
    this._value = isShallow2 ? value : toReactive$1(value);
    this["__v_isShallow"] = isShallow2;
  }
  get value() {
    {
      this.dep.track();
    }
    return this._value;
  }
  set value(newValue) {
    const oldValue = this._rawValue;
    const useDirectValue = this["__v_isShallow"] || /* @__PURE__ */ isShallow(newValue) || /* @__PURE__ */ isReadonly(newValue);
    newValue = useDirectValue ? newValue : /* @__PURE__ */ toRaw(newValue);
    if (hasChanged(newValue, oldValue)) {
      this._rawValue = newValue;
      this._value = useDirectValue ? newValue : toReactive$1(newValue);
      {
        this.dep.trigger();
      }
    }
  }
}
function triggerRef(ref2) {
  if (ref2.dep) {
    {
      ref2.dep.trigger();
    }
  }
}
function unref(ref2) {
  return /* @__PURE__ */ isRef(ref2) ? ref2.value : ref2;
}
function toValue(source) {
  return isFunction$1(source) ? source() : unref(source);
}
const shallowUnwrapHandlers = {
  get: (target, key, receiver) => key === "__v_raw" ? target : unref(Reflect.get(target, key, receiver)),
  set: (target, key, value, receiver) => {
    const oldValue = target[key];
    if (/* @__PURE__ */ isRef(oldValue) && !/* @__PURE__ */ isRef(value)) {
      oldValue.value = value;
      return true;
    } else {
      return Reflect.set(target, key, value, receiver);
    }
  }
};
function proxyRefs(objectWithRefs) {
  return /* @__PURE__ */ isReactive(objectWithRefs) ? objectWithRefs : new Proxy(objectWithRefs, shallowUnwrapHandlers);
}
// @__NO_SIDE_EFFECTS__
function toRefs(object) {
  const ret = isArray$1(object) ? new Array(object.length) : {};
  for (const key in object) {
    ret[key] = propertyToRef(object, key);
  }
  return ret;
}
class ObjectRefImpl {
  constructor(_object, key, _defaultValue) {
    this._object = _object;
    this._defaultValue = _defaultValue;
    this["__v_isRef"] = true;
    this._value = void 0;
    this._key = isSymbol$1(key) ? key : String(key);
    this._raw = /* @__PURE__ */ toRaw(_object);
    let shallow = true;
    let obj = _object;
    if (!isArray$1(_object) || isSymbol$1(this._key) || !isIntegerKey(this._key)) {
      do {
        shallow = !/* @__PURE__ */ isProxy(obj) || /* @__PURE__ */ isShallow(obj);
      } while (shallow && (obj = obj["__v_raw"]));
    }
    this._shallow = shallow;
  }
  get value() {
    let val = this._object[this._key];
    if (this._shallow) {
      val = unref(val);
    }
    return this._value = val === void 0 ? this._defaultValue : val;
  }
  set value(newVal) {
    if (this._shallow && /* @__PURE__ */ isRef(this._raw[this._key])) {
      const nestedRef = this._object[this._key];
      if (/* @__PURE__ */ isRef(nestedRef)) {
        nestedRef.value = newVal;
        return;
      }
    }
    this._object[this._key] = newVal;
  }
  get dep() {
    return getDepFromReactive(this._raw, this._key);
  }
}
class GetterRefImpl {
  constructor(_getter) {
    this._getter = _getter;
    this["__v_isRef"] = true;
    this["__v_isReadonly"] = true;
    this._value = void 0;
  }
  get value() {
    return this._value = this._getter();
  }
}
// @__NO_SIDE_EFFECTS__
function toRef(source, key, defaultValue) {
  if (/* @__PURE__ */ isRef(source)) {
    return source;
  } else if (isFunction$1(source)) {
    return new GetterRefImpl(source);
  } else if (isObject$2(source) && arguments.length > 1) {
    return propertyToRef(source, key, defaultValue);
  } else {
    return /* @__PURE__ */ ref(source);
  }
}
function propertyToRef(source, key, defaultValue) {
  return new ObjectRefImpl(source, key, defaultValue);
}
class ComputedRefImpl {
  constructor(fn, setter, isSSR) {
    this.fn = fn;
    this.setter = setter;
    this._value = void 0;
    this.dep = new Dep(this);
    this.__v_isRef = true;
    this.deps = void 0;
    this.depsTail = void 0;
    this.flags = 16;
    this.globalVersion = globalVersion - 1;
    this.next = void 0;
    this.effect = this;
    this["__v_isReadonly"] = !setter;
    this.isSSR = isSSR;
  }
  /**
   * @internal
   */
  notify() {
    this.flags |= 16;
    if (!(this.flags & 8) && // avoid infinite self recursion
    activeSub !== this) {
      batch(this, true);
      return true;
    }
  }
  get value() {
    const link = this.dep.track();
    refreshComputed(this);
    if (link) {
      link.version = this.dep.version;
    }
    return this._value;
  }
  set value(newValue) {
    if (this.setter) {
      this.setter(newValue);
    }
  }
}
// @__NO_SIDE_EFFECTS__
function computed$1(getterOrOptions, debugOptions, isSSR = false) {
  let getter;
  let setter;
  if (isFunction$1(getterOrOptions)) {
    getter = getterOrOptions;
  } else {
    getter = getterOrOptions.get;
    setter = getterOrOptions.set;
  }
  const cRef = new ComputedRefImpl(getter, setter, isSSR);
  return cRef;
}
const INITIAL_WATCHER_VALUE = {};
const cleanupMap = /* @__PURE__ */ new WeakMap();
let activeWatcher = void 0;
function onWatcherCleanup(cleanupFn, failSilently = false, owner = activeWatcher) {
  if (owner) {
    let cleanups = cleanupMap.get(owner);
    if (!cleanups) cleanupMap.set(owner, cleanups = []);
    cleanups.push(cleanupFn);
  }
}
function watch$1(source, cb, options = EMPTY_OBJ) {
  const { immediate, deep, once, scheduler, augmentJob, call } = options;
  const reactiveGetter = (source2) => {
    if (deep) return source2;
    if (/* @__PURE__ */ isShallow(source2) || deep === false || deep === 0)
      return traverse(source2, 1);
    return traverse(source2);
  };
  let effect2;
  let getter;
  let cleanup;
  let boundCleanup;
  let forceTrigger = false;
  let isMultiSource = false;
  if (/* @__PURE__ */ isRef(source)) {
    getter = () => source.value;
    forceTrigger = /* @__PURE__ */ isShallow(source);
  } else if (/* @__PURE__ */ isReactive(source)) {
    getter = () => reactiveGetter(source);
    forceTrigger = true;
  } else if (isArray$1(source)) {
    isMultiSource = true;
    forceTrigger = source.some((s) => /* @__PURE__ */ isReactive(s) || /* @__PURE__ */ isShallow(s));
    getter = () => source.map((s) => {
      if (/* @__PURE__ */ isRef(s)) {
        return s.value;
      } else if (/* @__PURE__ */ isReactive(s)) {
        return reactiveGetter(s);
      } else if (isFunction$1(s)) {
        return call ? call(s, 2) : s();
      } else ;
    });
  } else if (isFunction$1(source)) {
    if (cb) {
      getter = call ? () => call(source, 2) : source;
    } else {
      getter = () => {
        if (cleanup) {
          pauseTracking();
          try {
            cleanup();
          } finally {
            resetTracking();
          }
        }
        const currentEffect = activeWatcher;
        activeWatcher = effect2;
        try {
          return call ? call(source, 3, [boundCleanup]) : source(boundCleanup);
        } finally {
          activeWatcher = currentEffect;
        }
      };
    }
  } else {
    getter = NOOP;
  }
  if (cb && deep) {
    const baseGetter = getter;
    const depth = deep === true ? Infinity : deep;
    getter = () => traverse(baseGetter(), depth);
  }
  const scope = getCurrentScope();
  const watchHandle = () => {
    effect2.stop();
    if (scope && scope.active) {
      remove(scope.effects, effect2);
    }
  };
  if (once && cb) {
    const _cb = cb;
    cb = (...args) => {
      _cb(...args);
      watchHandle();
    };
  }
  let oldValue = isMultiSource ? new Array(source.length).fill(INITIAL_WATCHER_VALUE) : INITIAL_WATCHER_VALUE;
  const job = (immediateFirstRun) => {
    if (!(effect2.flags & 1) || !effect2.dirty && !immediateFirstRun) {
      return;
    }
    if (cb) {
      const newValue = effect2.run();
      if (deep || forceTrigger || (isMultiSource ? newValue.some((v, i) => hasChanged(v, oldValue[i])) : hasChanged(newValue, oldValue))) {
        if (cleanup) {
          cleanup();
        }
        const currentWatcher = activeWatcher;
        activeWatcher = effect2;
        try {
          const args = [
            newValue,
            // pass undefined as the old value when it's changed for the first time
            oldValue === INITIAL_WATCHER_VALUE ? void 0 : isMultiSource && oldValue[0] === INITIAL_WATCHER_VALUE ? [] : oldValue,
            boundCleanup
          ];
          oldValue = newValue;
          call ? call(cb, 3, args) : (
            // @ts-expect-error
            cb(...args)
          );
        } finally {
          activeWatcher = currentWatcher;
        }
      }
    } else {
      effect2.run();
    }
  };
  if (augmentJob) {
    augmentJob(job);
  }
  effect2 = new ReactiveEffect(getter);
  effect2.scheduler = scheduler ? () => scheduler(job, false) : job;
  boundCleanup = (fn) => onWatcherCleanup(fn, false, effect2);
  cleanup = effect2.onStop = () => {
    const cleanups = cleanupMap.get(effect2);
    if (cleanups) {
      if (call) {
        call(cleanups, 4);
      } else {
        for (const cleanup2 of cleanups) cleanup2();
      }
      cleanupMap.delete(effect2);
    }
  };
  if (cb) {
    if (immediate) {
      job(true);
    } else {
      oldValue = effect2.run();
    }
  } else if (scheduler) {
    scheduler(job.bind(null, true), true);
  } else {
    effect2.run();
  }
  watchHandle.pause = effect2.pause.bind(effect2);
  watchHandle.resume = effect2.resume.bind(effect2);
  watchHandle.stop = watchHandle;
  return watchHandle;
}
function traverse(value, depth = Infinity, seen) {
  if (depth <= 0 || !isObject$2(value) || value["__v_skip"]) {
    return value;
  }
  seen = seen || /* @__PURE__ */ new Map();
  if ((seen.get(value) || 0) >= depth) {
    return value;
  }
  seen.set(value, depth);
  depth--;
  if (/* @__PURE__ */ isRef(value)) {
    traverse(value.value, depth, seen);
  } else if (isArray$1(value)) {
    for (let i = 0; i < value.length; i++) {
      traverse(value[i], depth, seen);
    }
  } else if (isSet(value) || isMap(value)) {
    value.forEach((v) => {
      traverse(v, depth, seen);
    });
  } else if (isPlainObject$1(value)) {
    for (const key in value) {
      traverse(value[key], depth, seen);
    }
    for (const key of Object.getOwnPropertySymbols(value)) {
      if (Object.prototype.propertyIsEnumerable.call(value, key)) {
        traverse(value[key], depth, seen);
      }
    }
  }
  return value;
}
const stack = [];
let isWarning = false;
function warn$1(msg, ...args) {
  if (isWarning) return;
  isWarning = true;
  pauseTracking();
  const instance = stack.length ? stack[stack.length - 1].component : null;
  const appWarnHandler = instance && instance.appContext.config.warnHandler;
  const trace = getComponentTrace();
  if (appWarnHandler) {
    callWithErrorHandling(
      appWarnHandler,
      instance,
      11,
      [
        // eslint-disable-next-line no-restricted-syntax
        msg + args.map((a) => {
          var _a, _b;
          return (_b = (_a = a.toString) == null ? void 0 : _a.call(a)) != null ? _b : JSON.stringify(a);
        }).join(""),
        instance && instance.proxy,
        trace.map(
          ({ vnode }) => `at <${formatComponentName(instance, vnode.type)}>`
        ).join("\n"),
        trace
      ]
    );
  } else {
    const warnArgs = [`[Vue warn]: ${msg}`, ...args];
    if (trace.length && // avoid spamming console during tests
    true) {
      warnArgs.push(`
`, ...formatTrace(trace));
    }
    console.warn(...warnArgs);
  }
  resetTracking();
  isWarning = false;
}
function getComponentTrace() {
  let currentVNode = stack[stack.length - 1];
  if (!currentVNode) {
    return [];
  }
  const normalizedStack = [];
  while (currentVNode) {
    const last = normalizedStack[0];
    if (last && last.vnode === currentVNode) {
      last.recurseCount++;
    } else {
      normalizedStack.push({
        vnode: currentVNode,
        recurseCount: 0
      });
    }
    const parentInstance = currentVNode.component && currentVNode.component.parent;
    currentVNode = parentInstance && parentInstance.vnode;
  }
  return normalizedStack;
}
function formatTrace(trace) {
  const logs = [];
  trace.forEach((entry, i) => {
    logs.push(...i === 0 ? [] : [`
`], ...formatTraceEntry(entry));
  });
  return logs;
}
function formatTraceEntry({ vnode, recurseCount }) {
  const postfix = recurseCount > 0 ? `... (${recurseCount} recursive calls)` : ``;
  const isRoot = vnode.component ? vnode.component.parent == null : false;
  const open = ` at <${formatComponentName(
    vnode.component,
    vnode.type,
    isRoot
  )}`;
  const close = `>` + postfix;
  return vnode.props ? [open, ...formatProps(vnode.props), close] : [open + close];
}
function formatProps(props) {
  const res = [];
  const keys2 = Object.keys(props);
  keys2.slice(0, 3).forEach((key) => {
    res.push(...formatProp(key, props[key]));
  });
  if (keys2.length > 3) {
    res.push(` ...`);
  }
  return res;
}
function formatProp(key, value, raw) {
  if (isString(value)) {
    value = JSON.stringify(value);
    return raw ? value : [`${key}=${value}`];
  } else if (typeof value === "number" || typeof value === "boolean" || value == null) {
    return raw ? value : [`${key}=${value}`];
  } else if (/* @__PURE__ */ isRef(value)) {
    value = formatProp(key, /* @__PURE__ */ toRaw(value.value), true);
    return raw ? value : [`${key}=Ref<`, value, `>`];
  } else if (isFunction$1(value)) {
    return [`${key}=fn${value.name ? `<${value.name}>` : ``}`];
  } else {
    value = /* @__PURE__ */ toRaw(value);
    return raw ? value : [`${key}=`, value];
  }
}
function callWithErrorHandling(fn, instance, type, args) {
  try {
    return args ? fn(...args) : fn();
  } catch (err) {
    handleError(err, instance, type);
  }
}
function callWithAsyncErrorHandling(fn, instance, type, args) {
  if (isFunction$1(fn)) {
    const res = callWithErrorHandling(fn, instance, type, args);
    if (res && isPromise(res)) {
      res.catch((err) => {
        handleError(err, instance, type);
      });
    }
    return res;
  }
  if (isArray$1(fn)) {
    const values = [];
    for (let i = 0; i < fn.length; i++) {
      values.push(callWithAsyncErrorHandling(fn[i], instance, type, args));
    }
    return values;
  }
}
function handleError(err, instance, type, throwInDev = true) {
  const contextVNode = instance ? instance.vnode : null;
  const { errorHandler, throwUnhandledErrorInProduction } = instance && instance.appContext.config || EMPTY_OBJ;
  if (instance) {
    let cur = instance.parent;
    const exposedInstance = instance.proxy;
    const errorInfo = `https://vuejs.org/error-reference/#runtime-${type}`;
    while (cur) {
      const errorCapturedHooks = cur.ec;
      if (errorCapturedHooks) {
        for (let i = 0; i < errorCapturedHooks.length; i++) {
          if (errorCapturedHooks[i](err, exposedInstance, errorInfo) === false) {
            return;
          }
        }
      }
      cur = cur.parent;
    }
    if (errorHandler) {
      pauseTracking();
      callWithErrorHandling(errorHandler, null, 10, [
        err,
        exposedInstance,
        errorInfo
      ]);
      resetTracking();
      return;
    }
  }
  logError(err, type, contextVNode, throwInDev, throwUnhandledErrorInProduction);
}
function logError(err, type, contextVNode, throwInDev = true, throwInProd = false) {
  if (throwInProd) {
    throw err;
  } else {
    console.error(err);
  }
}
const queue = [];
let flushIndex = -1;
const pendingPostFlushCbs = [];
let activePostFlushCbs = null;
let postFlushIndex = 0;
const resolvedPromise = /* @__PURE__ */ Promise.resolve();
let currentFlushPromise = null;
function nextTick(fn) {
  const p2 = currentFlushPromise || resolvedPromise;
  return fn ? p2.then(this ? fn.bind(this) : fn) : p2;
}
function findInsertionIndex(id) {
  let start = flushIndex + 1;
  let end = queue.length;
  while (start < end) {
    const middle = start + end >>> 1;
    const middleJob = queue[middle];
    const middleJobId = getId(middleJob);
    if (middleJobId < id || middleJobId === id && middleJob.flags & 2) {
      start = middle + 1;
    } else {
      end = middle;
    }
  }
  return start;
}
function queueJob(job) {
  if (!(job.flags & 1)) {
    const jobId = getId(job);
    const lastJob = queue[queue.length - 1];
    if (!lastJob || // fast path when the job id is larger than the tail
    !(job.flags & 2) && jobId >= getId(lastJob)) {
      queue.push(job);
    } else {
      queue.splice(findInsertionIndex(jobId), 0, job);
    }
    job.flags |= 1;
    queueFlush();
  }
}
function queueFlush() {
  if (!currentFlushPromise) {
    currentFlushPromise = resolvedPromise.then(flushJobs);
  }
}
function queuePostFlushCb(cb) {
  if (!isArray$1(cb)) {
    if (activePostFlushCbs && cb.id === -1) {
      activePostFlushCbs.splice(postFlushIndex + 1, 0, cb);
    } else if (!(cb.flags & 1)) {
      pendingPostFlushCbs.push(cb);
      cb.flags |= 1;
    }
  } else {
    pendingPostFlushCbs.push(...cb);
  }
  queueFlush();
}
function flushPreFlushCbs(instance, seen, i = flushIndex + 1) {
  for (; i < queue.length; i++) {
    const cb = queue[i];
    if (cb && cb.flags & 2) {
      if (instance && cb.id !== instance.uid) {
        continue;
      }
      queue.splice(i, 1);
      i--;
      if (cb.flags & 4) {
        cb.flags &= -2;
      }
      cb();
      if (!(cb.flags & 4)) {
        cb.flags &= -2;
      }
    }
  }
}
function flushPostFlushCbs(seen) {
  if (pendingPostFlushCbs.length) {
    const deduped = [...new Set(pendingPostFlushCbs)].sort(
      (a, b) => getId(a) - getId(b)
    );
    pendingPostFlushCbs.length = 0;
    if (activePostFlushCbs) {
      activePostFlushCbs.push(...deduped);
      return;
    }
    activePostFlushCbs = deduped;
    for (postFlushIndex = 0; postFlushIndex < activePostFlushCbs.length; postFlushIndex++) {
      const cb = activePostFlushCbs[postFlushIndex];
      if (cb.flags & 4) {
        cb.flags &= -2;
      }
      if (!(cb.flags & 8)) cb();
      cb.flags &= -2;
    }
    activePostFlushCbs = null;
    postFlushIndex = 0;
  }
}
const getId = (job) => job.id == null ? job.flags & 2 ? -1 : Infinity : job.id;
function flushJobs(seen) {
  try {
    for (flushIndex = 0; flushIndex < queue.length; flushIndex++) {
      const job = queue[flushIndex];
      if (job && !(job.flags & 8)) {
        if (false) ;
        if (job.flags & 4) {
          job.flags &= ~1;
        }
        callWithErrorHandling(
          job,
          job.i,
          job.i ? 15 : 14
        );
        if (!(job.flags & 4)) {
          job.flags &= ~1;
        }
      }
    }
  } finally {
    for (; flushIndex < queue.length; flushIndex++) {
      const job = queue[flushIndex];
      if (job) {
        job.flags &= -2;
      }
    }
    flushIndex = -1;
    queue.length = 0;
    flushPostFlushCbs();
    currentFlushPromise = null;
    if (queue.length || pendingPostFlushCbs.length) {
      flushJobs();
    }
  }
}
let currentRenderingInstance = null;
let currentScopeId = null;
function setCurrentRenderingInstance(instance) {
  const prev = currentRenderingInstance;
  currentRenderingInstance = instance;
  currentScopeId = instance && instance.type.__scopeId || null;
  return prev;
}
function withCtx(fn, ctx = currentRenderingInstance, isNonScopedSlot) {
  if (!ctx) return fn;
  if (fn._n) {
    return fn;
  }
  const renderFnWithContext = (...args) => {
    if (renderFnWithContext._d) {
      setBlockTracking(-1);
    }
    const prevInstance = setCurrentRenderingInstance(ctx);
    let res;
    try {
      res = fn(...args);
    } finally {
      setCurrentRenderingInstance(prevInstance);
      if (renderFnWithContext._d) {
        setBlockTracking(1);
      }
    }
    return res;
  };
  renderFnWithContext._n = true;
  renderFnWithContext._c = true;
  renderFnWithContext._d = true;
  return renderFnWithContext;
}
function withDirectives(vnode, directives) {
  if (currentRenderingInstance === null) {
    return vnode;
  }
  const instance = getComponentPublicInstance(currentRenderingInstance);
  const bindings = vnode.dirs || (vnode.dirs = []);
  for (let i = 0; i < directives.length; i++) {
    let [dir, value, arg, modifiers = EMPTY_OBJ] = directives[i];
    if (dir) {
      if (isFunction$1(dir)) {
        dir = {
          mounted: dir,
          updated: dir
        };
      }
      if (dir.deep) {
        traverse(value);
      }
      bindings.push({
        dir,
        instance,
        value,
        oldValue: void 0,
        arg,
        modifiers
      });
    }
  }
  return vnode;
}
function invokeDirectiveHook(vnode, prevVNode, instance, name) {
  const bindings = vnode.dirs;
  const oldBindings = prevVNode && prevVNode.dirs;
  for (let i = 0; i < bindings.length; i++) {
    const binding = bindings[i];
    if (oldBindings) {
      binding.oldValue = oldBindings[i].value;
    }
    let hook = binding.dir[name];
    if (hook) {
      pauseTracking();
      callWithAsyncErrorHandling(hook, instance, 8, [
        vnode.el,
        binding,
        vnode,
        prevVNode
      ]);
      resetTracking();
    }
  }
}
function provide(key, value) {
  if (currentInstance) {
    let provides = currentInstance.provides;
    const parentProvides = currentInstance.parent && currentInstance.parent.provides;
    if (parentProvides === provides) {
      provides = currentInstance.provides = Object.create(parentProvides);
    }
    provides[key] = value;
  }
}
function inject(key, defaultValue, treatDefaultAsFactory = false) {
  const instance = getCurrentInstance();
  if (instance || currentApp) {
    let provides = currentApp ? currentApp._context.provides : instance ? instance.parent == null || instance.ce ? instance.vnode.appContext && instance.vnode.appContext.provides : instance.parent.provides : void 0;
    if (provides && key in provides) {
      return provides[key];
    } else if (arguments.length > 1) {
      return treatDefaultAsFactory && isFunction$1(defaultValue) ? defaultValue.call(instance && instance.proxy) : defaultValue;
    } else ;
  }
}
function hasInjectionContext() {
  return !!(getCurrentInstance() || currentApp);
}
const ssrContextKey = /* @__PURE__ */ Symbol.for("v-scx");
const useSSRContext = () => {
  {
    const ctx = inject(ssrContextKey);
    return ctx;
  }
};
function watchEffect(effect2, options) {
  return doWatch(effect2, null, options);
}
function watch(source, cb, options) {
  return doWatch(source, cb, options);
}
function doWatch(source, cb, options = EMPTY_OBJ) {
  const { immediate, deep, flush, once } = options;
  const baseWatchOptions = extend({}, options);
  const runsImmediately = cb && immediate || !cb && flush !== "post";
  let ssrCleanup;
  if (isInSSRComponentSetup) {
    if (flush === "sync") {
      const ctx = useSSRContext();
      ssrCleanup = ctx.__watcherHandles || (ctx.__watcherHandles = []);
    } else if (!runsImmediately) {
      const watchStopHandle = () => {
      };
      watchStopHandle.stop = NOOP;
      watchStopHandle.resume = NOOP;
      watchStopHandle.pause = NOOP;
      return watchStopHandle;
    }
  }
  const instance = currentInstance;
  baseWatchOptions.call = (fn, type, args) => callWithAsyncErrorHandling(fn, instance, type, args);
  let isPre = false;
  if (flush === "post") {
    baseWatchOptions.scheduler = (job) => {
      queuePostRenderEffect(job, instance && instance.suspense);
    };
  } else if (flush !== "sync") {
    isPre = true;
    baseWatchOptions.scheduler = (job, isFirstRun) => {
      if (isFirstRun) {
        job();
      } else {
        queueJob(job);
      }
    };
  }
  baseWatchOptions.augmentJob = (job) => {
    if (cb) {
      job.flags |= 4;
    }
    if (isPre) {
      job.flags |= 2;
      if (instance) {
        job.id = instance.uid;
        job.i = instance;
      }
    }
  };
  const watchHandle = watch$1(source, cb, baseWatchOptions);
  if (isInSSRComponentSetup) {
    if (ssrCleanup) {
      ssrCleanup.push(watchHandle);
    } else if (runsImmediately) {
      watchHandle();
    }
  }
  return watchHandle;
}
function instanceWatch(source, value, options) {
  const publicThis = this.proxy;
  const getter = isString(source) ? source.includes(".") ? createPathGetter(publicThis, source) : () => publicThis[source] : source.bind(publicThis, publicThis);
  let cb;
  if (isFunction$1(value)) {
    cb = value;
  } else {
    cb = value.handler;
    options = value;
  }
  const reset = setCurrentInstance(this);
  const res = doWatch(getter, cb.bind(publicThis), options);
  reset();
  return res;
}
function createPathGetter(ctx, path) {
  const segments = path.split(".");
  return () => {
    let cur = ctx;
    for (let i = 0; i < segments.length && cur; i++) {
      cur = cur[segments[i]];
    }
    return cur;
  };
}
const pendingMounts = /* @__PURE__ */ new WeakMap();
const TeleportEndKey = /* @__PURE__ */ Symbol("_vte");
const isTeleport = (type) => type.__isTeleport;
const isTeleportDisabled = (props) => props && (props.disabled || props.disabled === "");
const isTeleportDeferred = (props) => props && (props.defer || props.defer === "");
const isTargetSVG = (target) => typeof SVGElement !== "undefined" && target instanceof SVGElement;
const isTargetMathML = (target) => typeof MathMLElement === "function" && target instanceof MathMLElement;
const resolveTarget = (props, select) => {
  const targetSelector = props && props.to;
  if (isString(targetSelector)) {
    if (!select) {
      return null;
    } else {
      const target = select(targetSelector);
      return target;
    }
  } else {
    return targetSelector;
  }
};
const TeleportImpl = {
  name: "Teleport",
  __isTeleport: true,
  process(n1, n2, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized, internals) {
    const {
      mc: mountChildren,
      pc: patchChildren,
      pbc: patchBlockChildren,
      o: { insert, querySelector, createText, createComment, parentNode }
    } = internals;
    const disabled = isTeleportDisabled(n2.props);
    let { dynamicChildren } = n2;
    const mount = (vnode, container2, anchor2) => {
      if (vnode.shapeFlag & 16) {
        mountChildren(
          vnode.children,
          container2,
          anchor2,
          parentComponent,
          parentSuspense,
          namespace,
          slotScopeIds,
          optimized
        );
      }
    };
    const mountToTarget = (vnode = n2) => {
      const disabled2 = isTeleportDisabled(vnode.props);
      const target = vnode.target = resolveTarget(vnode.props, querySelector);
      const targetAnchor = prepareAnchor(target, vnode, createText, insert);
      if (target) {
        if (namespace !== "svg" && isTargetSVG(target)) {
          namespace = "svg";
        } else if (namespace !== "mathml" && isTargetMathML(target)) {
          namespace = "mathml";
        }
        if (parentComponent && parentComponent.isCE) {
          (parentComponent.ce._teleportTargets || (parentComponent.ce._teleportTargets = /* @__PURE__ */ new Set())).add(target);
        }
        if (!disabled2) {
          mount(vnode, target, targetAnchor);
          updateCssVars(vnode, false);
        }
      }
    };
    const queuePendingMount = (vnode) => {
      const mountJob = () => {
        if (pendingMounts.get(vnode) !== mountJob) return;
        pendingMounts.delete(vnode);
        if (isTeleportDisabled(vnode.props)) {
          const mountContainer = parentNode(vnode.el) || container;
          mount(vnode, mountContainer, vnode.anchor);
          updateCssVars(vnode, true);
        }
        mountToTarget(vnode);
      };
      pendingMounts.set(vnode, mountJob);
      queuePostRenderEffect(mountJob, parentSuspense);
    };
    if (n1 == null) {
      const placeholder = n2.el = createText("");
      const mainAnchor = n2.anchor = createText("");
      insert(placeholder, container, anchor);
      insert(mainAnchor, container, anchor);
      if (isTeleportDeferred(n2.props) || parentSuspense && parentSuspense.pendingBranch) {
        queuePendingMount(n2);
        return;
      }
      if (disabled) {
        mount(n2, container, mainAnchor);
        updateCssVars(n2, true);
      }
      mountToTarget();
    } else {
      n2.el = n1.el;
      const mainAnchor = n2.anchor = n1.anchor;
      const pendingMount = pendingMounts.get(n1);
      if (pendingMount) {
        pendingMount.flags |= 8;
        pendingMounts.delete(n1);
        queuePendingMount(n2);
        return;
      }
      n2.targetStart = n1.targetStart;
      const target = n2.target = n1.target;
      const targetAnchor = n2.targetAnchor = n1.targetAnchor;
      const wasDisabled = isTeleportDisabled(n1.props);
      const currentContainer = wasDisabled ? container : target;
      const currentAnchor = wasDisabled ? mainAnchor : targetAnchor;
      if (namespace === "svg" || isTargetSVG(target)) {
        namespace = "svg";
      } else if (namespace === "mathml" || isTargetMathML(target)) {
        namespace = "mathml";
      }
      if (dynamicChildren) {
        patchBlockChildren(
          n1.dynamicChildren,
          dynamicChildren,
          currentContainer,
          parentComponent,
          parentSuspense,
          namespace,
          slotScopeIds
        );
        traverseStaticChildren(n1, n2, true);
      } else if (!optimized) {
        patchChildren(
          n1,
          n2,
          currentContainer,
          currentAnchor,
          parentComponent,
          parentSuspense,
          namespace,
          slotScopeIds,
          false
        );
      }
      if (disabled) {
        if (!wasDisabled) {
          moveTeleport(
            n2,
            container,
            mainAnchor,
            internals,
            1
          );
        } else {
          if (n2.props && n1.props && n2.props.to !== n1.props.to) {
            n2.props.to = n1.props.to;
          }
        }
      } else {
        if ((n2.props && n2.props.to) !== (n1.props && n1.props.to)) {
          const nextTarget = n2.target = resolveTarget(
            n2.props,
            querySelector
          );
          if (nextTarget) {
            moveTeleport(
              n2,
              nextTarget,
              null,
              internals,
              0
            );
          }
        } else if (wasDisabled) {
          moveTeleport(
            n2,
            target,
            targetAnchor,
            internals,
            1
          );
        }
      }
      updateCssVars(n2, disabled);
    }
  },
  remove(vnode, parentComponent, parentSuspense, { um: unmount, o: { remove: hostRemove } }, doRemove) {
    const {
      shapeFlag,
      children,
      anchor,
      targetStart,
      targetAnchor,
      target,
      props
    } = vnode;
    let shouldRemove = doRemove || !isTeleportDisabled(props);
    const pendingMount = pendingMounts.get(vnode);
    if (pendingMount) {
      pendingMount.flags |= 8;
      pendingMounts.delete(vnode);
      shouldRemove = false;
    }
    if (target) {
      hostRemove(targetStart);
      hostRemove(targetAnchor);
    }
    doRemove && hostRemove(anchor);
    if (shapeFlag & 16) {
      for (let i = 0; i < children.length; i++) {
        const child = children[i];
        unmount(
          child,
          parentComponent,
          parentSuspense,
          shouldRemove,
          !!child.dynamicChildren
        );
      }
    }
  },
  move: moveTeleport,
  hydrate: hydrateTeleport
};
function moveTeleport(vnode, container, parentAnchor, { o: { insert }, m: move }, moveType = 2) {
  if (moveType === 0) {
    insert(vnode.targetAnchor, container, parentAnchor);
  }
  const { el, anchor, shapeFlag, children, props } = vnode;
  const isReorder = moveType === 2;
  if (isReorder) {
    insert(el, container, parentAnchor);
  }
  if (!pendingMounts.has(vnode) && (!isReorder || isTeleportDisabled(props))) {
    if (shapeFlag & 16) {
      for (let i = 0; i < children.length; i++) {
        move(
          children[i],
          container,
          parentAnchor,
          2
        );
      }
    }
  }
  if (isReorder) {
    insert(anchor, container, parentAnchor);
  }
}
function hydrateTeleport(node, vnode, parentComponent, parentSuspense, slotScopeIds, optimized, {
  o: { nextSibling, parentNode, querySelector, insert, createText }
}, hydrateChildren) {
  function hydrateAnchor(target2, targetNode) {
    let targetAnchor = targetNode;
    while (targetAnchor) {
      if (targetAnchor && targetAnchor.nodeType === 8) {
        if (targetAnchor.data === "teleport start anchor") {
          vnode.targetStart = targetAnchor;
        } else if (targetAnchor.data === "teleport anchor") {
          vnode.targetAnchor = targetAnchor;
          target2._lpa = vnode.targetAnchor && nextSibling(vnode.targetAnchor);
          break;
        }
      }
      targetAnchor = nextSibling(targetAnchor);
    }
  }
  function hydrateDisabledTeleport(node2, vnode2) {
    vnode2.anchor = hydrateChildren(
      nextSibling(node2),
      vnode2,
      parentNode(node2),
      parentComponent,
      parentSuspense,
      slotScopeIds,
      optimized
    );
  }
  const target = vnode.target = resolveTarget(
    vnode.props,
    querySelector
  );
  const disabled = isTeleportDisabled(vnode.props);
  if (target) {
    const targetNode = target._lpa || target.firstChild;
    if (vnode.shapeFlag & 16) {
      if (disabled) {
        hydrateDisabledTeleport(node, vnode);
        hydrateAnchor(target, targetNode);
        if (!vnode.targetAnchor) {
          prepareAnchor(
            target,
            vnode,
            createText,
            insert,
            // if target is the same as the main view, insert anchors before current node
            // to avoid hydrating mismatch
            parentNode(node) === target ? node : null
          );
        }
      } else {
        vnode.anchor = nextSibling(node);
        hydrateAnchor(target, targetNode);
        if (!vnode.targetAnchor) {
          prepareAnchor(target, vnode, createText, insert);
        }
        hydrateChildren(
          targetNode && nextSibling(targetNode),
          vnode,
          target,
          parentComponent,
          parentSuspense,
          slotScopeIds,
          optimized
        );
      }
    }
    updateCssVars(vnode, disabled);
  } else if (disabled) {
    if (vnode.shapeFlag & 16) {
      hydrateDisabledTeleport(node, vnode);
      vnode.targetStart = node;
      vnode.targetAnchor = nextSibling(node);
    }
  }
  return vnode.anchor && nextSibling(vnode.anchor);
}
const Teleport = TeleportImpl;
function updateCssVars(vnode, isDisabled) {
  const ctx = vnode.ctx;
  if (ctx && ctx.ut) {
    let node, anchor;
    if (isDisabled) {
      node = vnode.el;
      anchor = vnode.anchor;
    } else {
      node = vnode.targetStart;
      anchor = vnode.targetAnchor;
    }
    while (node && node !== anchor) {
      if (node.nodeType === 1) node.setAttribute("data-v-owner", ctx.uid);
      node = node.nextSibling;
    }
    ctx.ut();
  }
}
function prepareAnchor(target, vnode, createText, insert, anchor = null) {
  const targetStart = vnode.targetStart = createText("");
  const targetAnchor = vnode.targetAnchor = createText("");
  targetStart[TeleportEndKey] = targetAnchor;
  if (target) {
    insert(targetStart, target, anchor);
    insert(targetAnchor, target, anchor);
  }
  return targetAnchor;
}
const leaveCbKey = /* @__PURE__ */ Symbol("_leaveCb");
const enterCbKey$1 = /* @__PURE__ */ Symbol("_enterCb");
function useTransitionState() {
  const state = {
    isMounted: false,
    isLeaving: false,
    isUnmounting: false,
    leavingVNodes: /* @__PURE__ */ new Map()
  };
  onMounted(() => {
    state.isMounted = true;
  });
  onBeforeUnmount(() => {
    state.isUnmounting = true;
  });
  return state;
}
const TransitionHookValidator = [Function, Array];
const BaseTransitionPropsValidators = {
  mode: String,
  appear: Boolean,
  persisted: Boolean,
  // enter
  onBeforeEnter: TransitionHookValidator,
  onEnter: TransitionHookValidator,
  onAfterEnter: TransitionHookValidator,
  onEnterCancelled: TransitionHookValidator,
  // leave
  onBeforeLeave: TransitionHookValidator,
  onLeave: TransitionHookValidator,
  onAfterLeave: TransitionHookValidator,
  onLeaveCancelled: TransitionHookValidator,
  // appear
  onBeforeAppear: TransitionHookValidator,
  onAppear: TransitionHookValidator,
  onAfterAppear: TransitionHookValidator,
  onAppearCancelled: TransitionHookValidator
};
const recursiveGetSubtree = (instance) => {
  const subTree = instance.subTree;
  return subTree.component ? recursiveGetSubtree(subTree.component) : subTree;
};
const BaseTransitionImpl = {
  name: `BaseTransition`,
  props: BaseTransitionPropsValidators,
  setup(props, { slots }) {
    const instance = getCurrentInstance();
    const state = useTransitionState();
    return () => {
      const children = slots.default && getTransitionRawChildren(slots.default(), true);
      const child = children && children.length ? findNonCommentChild(children) : (
        // Keep explicit default-slot conditionals on the same transition path
        // as regular v-if branches, which render a comment placeholder.
        instance.subTree ? createCommentVNode() : void 0
      );
      if (!child) {
        return;
      }
      const rawProps = /* @__PURE__ */ toRaw(props);
      const { mode } = rawProps;
      if (state.isLeaving) {
        return emptyPlaceholder(child);
      }
      const innerChild = getInnerChild$1(child);
      if (!innerChild) {
        return emptyPlaceholder(child);
      }
      let enterHooks = resolveTransitionHooks(
        innerChild,
        rawProps,
        state,
        instance,
        // #11061, ensure enterHooks is fresh after clone
        (hooks) => enterHooks = hooks
      );
      if (innerChild.type !== Comment) {
        setTransitionHooks(innerChild, enterHooks);
      }
      let oldInnerChild = instance.subTree && getInnerChild$1(instance.subTree);
      if (oldInnerChild && oldInnerChild.type !== Comment && !isSameVNodeType(oldInnerChild, innerChild) && recursiveGetSubtree(instance).type !== Comment) {
        let leavingHooks = resolveTransitionHooks(
          oldInnerChild,
          rawProps,
          state,
          instance
        );
        setTransitionHooks(oldInnerChild, leavingHooks);
        if (mode === "out-in" && innerChild.type !== Comment) {
          state.isLeaving = true;
          leavingHooks.afterLeave = () => {
            state.isLeaving = false;
            if (!(instance.job.flags & 8)) {
              instance.update();
            }
            delete leavingHooks.afterLeave;
            oldInnerChild = void 0;
          };
          return emptyPlaceholder(child);
        } else if (mode === "in-out" && innerChild.type !== Comment) {
          leavingHooks.delayLeave = (el, earlyRemove, delayedLeave) => {
            const leavingVNodesCache = getLeavingNodesForType(
              state,
              oldInnerChild
            );
            leavingVNodesCache[String(oldInnerChild.key)] = oldInnerChild;
            el[leaveCbKey] = () => {
              earlyRemove();
              el[leaveCbKey] = void 0;
              delete enterHooks.delayedLeave;
              oldInnerChild = void 0;
            };
            enterHooks.delayedLeave = () => {
              delayedLeave();
              delete enterHooks.delayedLeave;
              oldInnerChild = void 0;
            };
          };
        } else {
          oldInnerChild = void 0;
        }
      } else if (oldInnerChild) {
        oldInnerChild = void 0;
      }
      return child;
    };
  }
};
function findNonCommentChild(children) {
  let child = children[0];
  if (children.length > 1) {
    for (const c of children) {
      if (c.type !== Comment) {
        child = c;
        break;
      }
    }
  }
  return child;
}
const BaseTransition = BaseTransitionImpl;
function getLeavingNodesForType(state, vnode) {
  const { leavingVNodes } = state;
  let leavingVNodesCache = leavingVNodes.get(vnode.type);
  if (!leavingVNodesCache) {
    leavingVNodesCache = /* @__PURE__ */ Object.create(null);
    leavingVNodes.set(vnode.type, leavingVNodesCache);
  }
  return leavingVNodesCache;
}
function resolveTransitionHooks(vnode, props, state, instance, postClone) {
  const {
    appear,
    mode,
    persisted = false,
    onBeforeEnter,
    onEnter,
    onAfterEnter,
    onEnterCancelled,
    onBeforeLeave,
    onLeave,
    onAfterLeave,
    onLeaveCancelled,
    onBeforeAppear,
    onAppear,
    onAfterAppear,
    onAppearCancelled
  } = props;
  const key = String(vnode.key);
  const leavingVNodesCache = getLeavingNodesForType(state, vnode);
  const callHook2 = (hook, args) => {
    hook && callWithAsyncErrorHandling(
      hook,
      instance,
      9,
      args
    );
  };
  const callAsyncHook = (hook, args) => {
    const done = args[1];
    callHook2(hook, args);
    if (isArray$1(hook)) {
      if (hook.every((hook2) => hook2.length <= 1)) done();
    } else if (hook.length <= 1) {
      done();
    }
  };
  const hooks = {
    mode,
    persisted,
    beforeEnter(el) {
      let hook = onBeforeEnter;
      if (!state.isMounted) {
        if (appear) {
          hook = onBeforeAppear || onBeforeEnter;
        } else {
          return;
        }
      }
      if (el[leaveCbKey]) {
        el[leaveCbKey](
          true
          /* cancelled */
        );
      }
      const leavingVNode = leavingVNodesCache[key];
      if (leavingVNode && isSameVNodeType(vnode, leavingVNode) && leavingVNode.el[leaveCbKey]) {
        leavingVNode.el[leaveCbKey]();
      }
      callHook2(hook, [el]);
    },
    enter(el) {
      if (leavingVNodesCache[key] === vnode) return;
      let hook = onEnter;
      let afterHook = onAfterEnter;
      let cancelHook = onEnterCancelled;
      if (!state.isMounted) {
        if (appear) {
          hook = onAppear || onEnter;
          afterHook = onAfterAppear || onAfterEnter;
          cancelHook = onAppearCancelled || onEnterCancelled;
        } else {
          return;
        }
      }
      let called = false;
      el[enterCbKey$1] = (cancelled) => {
        if (called) return;
        called = true;
        if (cancelled) {
          callHook2(cancelHook, [el]);
        } else {
          callHook2(afterHook, [el]);
        }
        if (hooks.delayedLeave) {
          hooks.delayedLeave();
        }
        el[enterCbKey$1] = void 0;
      };
      const done = el[enterCbKey$1].bind(null, false);
      if (hook) {
        callAsyncHook(hook, [el, done]);
      } else {
        done();
      }
    },
    leave(el, remove2) {
      const key2 = String(vnode.key);
      if (el[enterCbKey$1]) {
        el[enterCbKey$1](
          true
          /* cancelled */
        );
      }
      if (state.isUnmounting) {
        return remove2();
      }
      callHook2(onBeforeLeave, [el]);
      let called = false;
      el[leaveCbKey] = (cancelled) => {
        if (called) return;
        called = true;
        remove2();
        if (cancelled) {
          callHook2(onLeaveCancelled, [el]);
        } else {
          callHook2(onAfterLeave, [el]);
        }
        el[leaveCbKey] = void 0;
        if (leavingVNodesCache[key2] === vnode) {
          delete leavingVNodesCache[key2];
        }
      };
      const done = el[leaveCbKey].bind(null, false);
      leavingVNodesCache[key2] = vnode;
      if (onLeave) {
        callAsyncHook(onLeave, [el, done]);
      } else {
        done();
      }
    },
    clone(vnode2) {
      const hooks2 = resolveTransitionHooks(
        vnode2,
        props,
        state,
        instance,
        postClone
      );
      if (postClone) postClone(hooks2);
      return hooks2;
    }
  };
  return hooks;
}
function emptyPlaceholder(vnode) {
  if (isKeepAlive(vnode)) {
    vnode = cloneVNode(vnode);
    vnode.children = null;
    return vnode;
  }
}
function getInnerChild$1(vnode) {
  if (!isKeepAlive(vnode)) {
    if (isTeleport(vnode.type) && vnode.children) {
      return findNonCommentChild(vnode.children);
    }
    return vnode;
  }
  if (vnode.component) {
    return vnode.component.subTree;
  }
  const { shapeFlag, children } = vnode;
  if (children) {
    if (shapeFlag & 16) {
      return children[0];
    }
    if (shapeFlag & 32 && isFunction$1(children.default)) {
      return children.default();
    }
  }
}
function setTransitionHooks(vnode, hooks) {
  if (vnode.shapeFlag & 6 && vnode.component) {
    vnode.transition = hooks;
    setTransitionHooks(vnode.component.subTree, hooks);
  } else if (vnode.shapeFlag & 128) {
    vnode.ssContent.transition = hooks.clone(vnode.ssContent);
    vnode.ssFallback.transition = hooks.clone(vnode.ssFallback);
  } else {
    vnode.transition = hooks;
  }
}
function getTransitionRawChildren(children, keepComment = false, parentKey) {
  let ret = [];
  let keyedFragmentCount = 0;
  for (let i = 0; i < children.length; i++) {
    let child = children[i];
    const key = parentKey == null ? child.key : String(parentKey) + String(child.key != null ? child.key : i);
    if (child.type === Fragment) {
      if (child.patchFlag & 128) keyedFragmentCount++;
      ret = ret.concat(
        getTransitionRawChildren(child.children, keepComment, key)
      );
    } else if (keepComment || child.type !== Comment) {
      ret.push(key != null ? cloneVNode(child, { key }) : child);
    }
  }
  if (keyedFragmentCount > 1) {
    for (let i = 0; i < ret.length; i++) {
      ret[i].patchFlag = -2;
    }
  }
  return ret;
}
// @__NO_SIDE_EFFECTS__
function defineComponent(options, extraOptions) {
  return isFunction$1(options) ? (
    // #8236: extend call and options.name access are considered side-effects
    // by Rollup, so we have to wrap it in a pure-annotated IIFE.
    /* @__PURE__ */ (() => extend({ name: options.name }, extraOptions, { setup: options }))()
  ) : options;
}
function markAsyncBoundary(instance) {
  instance.ids = [instance.ids[0] + instance.ids[2]++ + "-", 0, 0];
}
function isTemplateRefKey(refs, key) {
  let desc;
  return !!((desc = Object.getOwnPropertyDescriptor(refs, key)) && !desc.configurable);
}
const pendingSetRefMap = /* @__PURE__ */ new WeakMap();
function setRef(rawRef, oldRawRef, parentSuspense, vnode, isUnmount = false) {
  if (isArray$1(rawRef)) {
    rawRef.forEach(
      (r, i) => setRef(
        r,
        oldRawRef && (isArray$1(oldRawRef) ? oldRawRef[i] : oldRawRef),
        parentSuspense,
        vnode,
        isUnmount
      )
    );
    return;
  }
  if (isAsyncWrapper(vnode) && !isUnmount) {
    if (vnode.shapeFlag & 512 && vnode.type.__asyncResolved && vnode.component.subTree.component) {
      setRef(rawRef, oldRawRef, parentSuspense, vnode.component.subTree);
    }
    return;
  }
  const refValue = vnode.shapeFlag & 4 ? getComponentPublicInstance(vnode.component) : vnode.el;
  const value = isUnmount ? null : refValue;
  const { i: owner, r: ref3 } = rawRef;
  const oldRef = oldRawRef && oldRawRef.r;
  const refs = owner.refs === EMPTY_OBJ ? owner.refs = {} : owner.refs;
  const setupState = owner.setupState;
  const rawSetupState = /* @__PURE__ */ toRaw(setupState);
  const canSetSetupRef = setupState === EMPTY_OBJ ? NO : (key) => {
    if (isTemplateRefKey(refs, key)) {
      return false;
    }
    return hasOwn(rawSetupState, key);
  };
  const canSetRef = (ref22, key) => {
    if (key && isTemplateRefKey(refs, key)) {
      return false;
    }
    return true;
  };
  if (oldRef != null && oldRef !== ref3) {
    invalidatePendingSetRef(oldRawRef);
    if (isString(oldRef)) {
      refs[oldRef] = null;
      if (canSetSetupRef(oldRef)) {
        setupState[oldRef] = null;
      }
    } else if (/* @__PURE__ */ isRef(oldRef)) {
      const oldRawRefAtom = oldRawRef;
      if (canSetRef(oldRef, oldRawRefAtom.k)) {
        oldRef.value = null;
      }
      if (oldRawRefAtom.k) refs[oldRawRefAtom.k] = null;
    }
  }
  if (isFunction$1(ref3)) {
    callWithErrorHandling(ref3, owner, 12, [value, refs]);
  } else {
    const _isString = isString(ref3);
    const _isRef = /* @__PURE__ */ isRef(ref3);
    if (_isString || _isRef) {
      const doSet = () => {
        if (rawRef.f) {
          const existing = _isString ? canSetSetupRef(ref3) ? setupState[ref3] : refs[ref3] : canSetRef() || !rawRef.k ? ref3.value : refs[rawRef.k];
          if (isUnmount) {
            isArray$1(existing) && remove(existing, refValue);
          } else {
            if (!isArray$1(existing)) {
              if (_isString) {
                refs[ref3] = [refValue];
                if (canSetSetupRef(ref3)) {
                  setupState[ref3] = refs[ref3];
                }
              } else {
                const newVal = [refValue];
                if (canSetRef(ref3, rawRef.k)) {
                  ref3.value = newVal;
                }
                if (rawRef.k) refs[rawRef.k] = newVal;
              }
            } else if (!existing.includes(refValue)) {
              existing.push(refValue);
            }
          }
        } else if (_isString) {
          refs[ref3] = value;
          if (canSetSetupRef(ref3)) {
            setupState[ref3] = value;
          }
        } else if (_isRef) {
          if (canSetRef(ref3, rawRef.k)) {
            ref3.value = value;
          }
          if (rawRef.k) refs[rawRef.k] = value;
        } else ;
      };
      if (value) {
        const job = () => {
          doSet();
          pendingSetRefMap.delete(rawRef);
        };
        job.id = -1;
        pendingSetRefMap.set(rawRef, job);
        queuePostRenderEffect(job, parentSuspense);
      } else {
        invalidatePendingSetRef(rawRef);
        doSet();
      }
    }
  }
}
function invalidatePendingSetRef(rawRef) {
  const pendingSetRef = pendingSetRefMap.get(rawRef);
  if (pendingSetRef) {
    pendingSetRef.flags |= 8;
    pendingSetRefMap.delete(rawRef);
  }
}
getGlobalThis().requestIdleCallback || ((cb) => setTimeout(cb, 1));
getGlobalThis().cancelIdleCallback || ((id) => clearTimeout(id));
const isAsyncWrapper = (i) => !!i.type.__asyncLoader;
const isKeepAlive = (vnode) => vnode.type.__isKeepAlive;
function onActivated(hook, target) {
  registerKeepAliveHook(hook, "a", target);
}
function onDeactivated(hook, target) {
  registerKeepAliveHook(hook, "da", target);
}
function registerKeepAliveHook(hook, type, target = currentInstance) {
  const wrappedHook = hook.__wdc || (hook.__wdc = () => {
    let current = target;
    while (current) {
      if (current.isDeactivated) {
        return;
      }
      current = current.parent;
    }
    return hook();
  });
  injectHook(type, wrappedHook, target);
  if (target) {
    let current = target.parent;
    while (current && current.parent) {
      if (isKeepAlive(current.parent.vnode)) {
        injectToKeepAliveRoot(wrappedHook, type, target, current);
      }
      current = current.parent;
    }
  }
}
function injectToKeepAliveRoot(hook, type, target, keepAliveRoot) {
  const injected = injectHook(
    type,
    hook,
    keepAliveRoot,
    true
    /* prepend */
  );
  onUnmounted(() => {
    remove(keepAliveRoot[type], injected);
  }, target);
}
function injectHook(type, hook, target = currentInstance, prepend = false) {
  if (target) {
    const hooks = target[type] || (target[type] = []);
    const wrappedHook = hook.__weh || (hook.__weh = (...args) => {
      pauseTracking();
      const reset = setCurrentInstance(target);
      const res = callWithAsyncErrorHandling(hook, target, type, args);
      reset();
      resetTracking();
      return res;
    });
    if (prepend) {
      hooks.unshift(wrappedHook);
    } else {
      hooks.push(wrappedHook);
    }
    return wrappedHook;
  }
}
const createHook = (lifecycle) => (hook, target = currentInstance) => {
  if (!isInSSRComponentSetup || lifecycle === "sp") {
    injectHook(lifecycle, (...args) => hook(...args), target);
  }
};
const onBeforeMount = createHook("bm");
const onMounted = createHook("m");
const onBeforeUpdate = createHook(
  "bu"
);
const onUpdated = createHook("u");
const onBeforeUnmount = createHook(
  "bum"
);
const onUnmounted = createHook("um");
const onServerPrefetch = createHook(
  "sp"
);
const onRenderTriggered = createHook("rtg");
const onRenderTracked = createHook("rtc");
function onErrorCaptured(hook, target = currentInstance) {
  injectHook("ec", hook, target);
}
const COMPONENTS = "components";
const DIRECTIVES = "directives";
function resolveComponent(name, maybeSelfReference) {
  return resolveAsset(COMPONENTS, name, true, maybeSelfReference) || name;
}
const NULL_DYNAMIC_COMPONENT = /* @__PURE__ */ Symbol.for("v-ndc");
function resolveDynamicComponent(component) {
  if (isString(component)) {
    return resolveAsset(COMPONENTS, component, false) || component;
  } else {
    return component || NULL_DYNAMIC_COMPONENT;
  }
}
function resolveDirective(name) {
  return resolveAsset(DIRECTIVES, name);
}
function resolveAsset(type, name, warnMissing = true, maybeSelfReference = false) {
  const instance = currentRenderingInstance || currentInstance;
  if (instance) {
    const Component = instance.type;
    if (type === COMPONENTS) {
      const selfName = getComponentName(
        Component,
        false
      );
      if (selfName && (selfName === name || selfName === camelize(name) || selfName === capitalize(camelize(name)))) {
        return Component;
      }
    }
    const res = (
      // local registration
      // check instance[type] first which is resolved for options API
      resolve(instance[type] || Component[type], name) || // global registration
      resolve(instance.appContext[type], name)
    );
    if (!res && maybeSelfReference) {
      return Component;
    }
    return res;
  }
}
function resolve(registry, name) {
  return registry && (registry[name] || registry[camelize(name)] || registry[capitalize(camelize(name))]);
}
function renderList(source, renderItem, cache, index) {
  let ret;
  const cached = cache;
  const sourceIsArray = isArray$1(source);
  if (sourceIsArray || isString(source)) {
    const sourceIsReactiveArray = sourceIsArray && /* @__PURE__ */ isReactive(source);
    let needsWrap = false;
    let isReadonlySource = false;
    if (sourceIsReactiveArray) {
      needsWrap = !/* @__PURE__ */ isShallow(source);
      isReadonlySource = /* @__PURE__ */ isReadonly(source);
      source = shallowReadArray(source);
    }
    ret = new Array(source.length);
    for (let i = 0, l = source.length; i < l; i++) {
      ret[i] = renderItem(
        needsWrap ? isReadonlySource ? toReadonly(toReactive$1(source[i])) : toReactive$1(source[i]) : source[i],
        i,
        void 0,
        cached
      );
    }
  } else if (typeof source === "number") {
    {
      ret = new Array(source);
      for (let i = 0; i < source; i++) {
        ret[i] = renderItem(i + 1, i, void 0, cached);
      }
    }
  } else if (isObject$2(source)) {
    if (source[Symbol.iterator]) {
      ret = Array.from(
        source,
        (item, i) => renderItem(item, i, void 0, cached)
      );
    } else {
      const keys2 = Object.keys(source);
      ret = new Array(keys2.length);
      for (let i = 0, l = keys2.length; i < l; i++) {
        const key = keys2[i];
        ret[i] = renderItem(source[key], key, i, cached);
      }
    }
  } else {
    ret = [];
  }
  return ret;
}
function createSlots(slots, dynamicSlots) {
  for (let i = 0; i < dynamicSlots.length; i++) {
    const slot = dynamicSlots[i];
    if (isArray$1(slot)) {
      for (let j = 0; j < slot.length; j++) {
        slots[slot[j].name] = slot[j].fn;
      }
    } else if (slot) {
      slots[slot.name] = slot.key ? (...args) => {
        const res = slot.fn(...args);
        if (res) res.key = slot.key;
        return res;
      } : slot.fn;
    }
  }
  return slots;
}
function renderSlot(slots, name, props = {}, fallback, noSlotted) {
  if (currentRenderingInstance.ce || currentRenderingInstance.parent && isAsyncWrapper(currentRenderingInstance.parent) && currentRenderingInstance.parent.ce) {
    const hasProps = Object.keys(props).length > 0;
    if (name !== "default") props.name = name;
    return openBlock(), createBlock(
      Fragment,
      null,
      [createVNode("slot", props, fallback && fallback())],
      hasProps ? -2 : 64
    );
  }
  let slot = slots[name];
  if (slot && slot._c) {
    slot._d = false;
  }
  openBlock();
  const validSlotContent = slot && ensureValidVNode(slot(props));
  const slotKey = props.key || // slot content array of a dynamic conditional slot may have a branch
  // key attached in the `createSlots` helper, respect that
  validSlotContent && validSlotContent.key;
  const rendered = createBlock(
    Fragment,
    {
      key: (slotKey && !isSymbol$1(slotKey) ? slotKey : `_${name}`) + // #7256 force differentiate fallback content from actual content
      (!validSlotContent && fallback ? "_fb" : "")
    },
    validSlotContent || (fallback ? fallback() : []),
    validSlotContent && slots._ === 1 ? 64 : -2
  );
  if (rendered.scopeId) {
    rendered.slotScopeIds = [rendered.scopeId + "-s"];
  }
  if (slot && slot._c) {
    slot._d = true;
  }
  return rendered;
}
function ensureValidVNode(vnodes) {
  return vnodes.some((child) => {
    if (!isVNode(child)) return true;
    if (child.type === Comment) return false;
    if (child.type === Fragment && !ensureValidVNode(child.children))
      return false;
    return true;
  }) ? vnodes : null;
}
function toHandlers(obj, preserveCaseIfNecessary) {
  const ret = {};
  for (const key in obj) {
    ret[toHandlerKey(key)] = obj[key];
  }
  return ret;
}
const getPublicInstance = (i) => {
  if (!i) return null;
  if (isStatefulComponent(i)) return getComponentPublicInstance(i);
  return getPublicInstance(i.parent);
};
const publicPropertiesMap = (
  // Move PURE marker to new line to workaround compiler discarding it
  // due to type annotation
  /* @__PURE__ */ extend(/* @__PURE__ */ Object.create(null), {
    $: (i) => i,
    $el: (i) => i.vnode.el,
    $data: (i) => i.data,
    $props: (i) => i.props,
    $attrs: (i) => i.attrs,
    $slots: (i) => i.slots,
    $refs: (i) => i.refs,
    $parent: (i) => getPublicInstance(i.parent),
    $root: (i) => getPublicInstance(i.root),
    $host: (i) => i.ce,
    $emit: (i) => i.emit,
    $options: (i) => resolveMergedOptions(i),
    $forceUpdate: (i) => i.f || (i.f = () => {
      queueJob(i.update);
    }),
    $nextTick: (i) => i.n || (i.n = nextTick.bind(i.proxy)),
    $watch: (i) => instanceWatch.bind(i)
  })
);
const hasSetupBinding = (state, key) => state !== EMPTY_OBJ && !state.__isScriptSetup && hasOwn(state, key);
const PublicInstanceProxyHandlers = {
  get({ _: instance }, key) {
    if (key === "__v_skip") {
      return true;
    }
    const { ctx, setupState, data, props, accessCache, type, appContext } = instance;
    if (key[0] !== "$") {
      const n = accessCache[key];
      if (n !== void 0) {
        switch (n) {
          case 1:
            return setupState[key];
          case 2:
            return data[key];
          case 4:
            return ctx[key];
          case 3:
            return props[key];
        }
      } else if (hasSetupBinding(setupState, key)) {
        accessCache[key] = 1;
        return setupState[key];
      } else if (data !== EMPTY_OBJ && hasOwn(data, key)) {
        accessCache[key] = 2;
        return data[key];
      } else if (hasOwn(props, key)) {
        accessCache[key] = 3;
        return props[key];
      } else if (ctx !== EMPTY_OBJ && hasOwn(ctx, key)) {
        accessCache[key] = 4;
        return ctx[key];
      } else if (shouldCacheAccess) {
        accessCache[key] = 0;
      }
    }
    const publicGetter = publicPropertiesMap[key];
    let cssModule, globalProperties;
    if (publicGetter) {
      if (key === "$attrs") {
        track(instance.attrs, "get", "");
      }
      return publicGetter(instance);
    } else if (
      // css module (injected by vue-loader)
      (cssModule = type.__cssModules) && (cssModule = cssModule[key])
    ) {
      return cssModule;
    } else if (ctx !== EMPTY_OBJ && hasOwn(ctx, key)) {
      accessCache[key] = 4;
      return ctx[key];
    } else if (
      // global properties
      globalProperties = appContext.config.globalProperties, hasOwn(globalProperties, key)
    ) {
      {
        return globalProperties[key];
      }
    } else ;
  },
  set({ _: instance }, key, value) {
    const { data, setupState, ctx } = instance;
    if (hasSetupBinding(setupState, key)) {
      setupState[key] = value;
      return true;
    } else if (data !== EMPTY_OBJ && hasOwn(data, key)) {
      data[key] = value;
      return true;
    } else if (hasOwn(instance.props, key)) {
      return false;
    }
    if (key[0] === "$" && key.slice(1) in instance) {
      return false;
    } else {
      {
        ctx[key] = value;
      }
    }
    return true;
  },
  has({
    _: { data, setupState, accessCache, ctx, appContext, props, type }
  }, key) {
    let cssModules;
    return !!(accessCache[key] || data !== EMPTY_OBJ && key[0] !== "$" && hasOwn(data, key) || hasSetupBinding(setupState, key) || hasOwn(props, key) || hasOwn(ctx, key) || hasOwn(publicPropertiesMap, key) || hasOwn(appContext.config.globalProperties, key) || (cssModules = type.__cssModules) && cssModules[key]);
  },
  defineProperty(target, key, descriptor) {
    if (descriptor.get != null) {
      target._.accessCache[key] = 0;
    } else if (hasOwn(descriptor, "value")) {
      this.set(target, key, descriptor.value, null);
    }
    return Reflect.defineProperty(target, key, descriptor);
  }
};
function useSlots() {
  return getContext().slots;
}
function useAttrs() {
  return getContext().attrs;
}
function getContext(calledFunctionName) {
  const i = getCurrentInstance();
  return i.setupContext || (i.setupContext = createSetupContext(i));
}
function normalizePropsOrEmits(props) {
  return isArray$1(props) ? props.reduce(
    (normalized, p2) => (normalized[p2] = null, normalized),
    {}
  ) : props;
}
let shouldCacheAccess = true;
function applyOptions(instance) {
  const options = resolveMergedOptions(instance);
  const publicThis = instance.proxy;
  const ctx = instance.ctx;
  shouldCacheAccess = false;
  if (options.beforeCreate) {
    callHook$1(options.beforeCreate, instance, "bc");
  }
  const {
    // state
    data: dataOptions,
    computed: computedOptions,
    methods,
    watch: watchOptions,
    provide: provideOptions,
    inject: injectOptions,
    // lifecycle
    created,
    beforeMount,
    mounted,
    beforeUpdate,
    updated,
    activated,
    deactivated,
    beforeDestroy,
    beforeUnmount,
    destroyed,
    unmounted,
    render: render2,
    renderTracked,
    renderTriggered,
    errorCaptured,
    serverPrefetch,
    // public API
    expose,
    inheritAttrs,
    // assets
    components,
    directives,
    filters
  } = options;
  const checkDuplicateProperties = null;
  if (injectOptions) {
    resolveInjections(injectOptions, ctx, checkDuplicateProperties);
  }
  if (methods) {
    for (const key in methods) {
      const methodHandler = methods[key];
      if (isFunction$1(methodHandler)) {
        {
          ctx[key] = methodHandler.bind(publicThis);
        }
      }
    }
  }
  if (dataOptions) {
    const data = dataOptions.call(publicThis, publicThis);
    if (!isObject$2(data)) ;
    else {
      instance.data = /* @__PURE__ */ reactive(data);
    }
  }
  shouldCacheAccess = true;
  if (computedOptions) {
    for (const key in computedOptions) {
      const opt = computedOptions[key];
      const get2 = isFunction$1(opt) ? opt.bind(publicThis, publicThis) : isFunction$1(opt.get) ? opt.get.bind(publicThis, publicThis) : NOOP;
      const set2 = !isFunction$1(opt) && isFunction$1(opt.set) ? opt.set.bind(publicThis) : NOOP;
      const c = computed({
        get: get2,
        set: set2
      });
      Object.defineProperty(ctx, key, {
        enumerable: true,
        configurable: true,
        get: () => c.value,
        set: (v) => c.value = v
      });
    }
  }
  if (watchOptions) {
    for (const key in watchOptions) {
      createWatcher(watchOptions[key], ctx, publicThis, key);
    }
  }
  if (provideOptions) {
    const provides = isFunction$1(provideOptions) ? provideOptions.call(publicThis) : provideOptions;
    Reflect.ownKeys(provides).forEach((key) => {
      provide(key, provides[key]);
    });
  }
  if (created) {
    callHook$1(created, instance, "c");
  }
  function registerLifecycleHook(register, hook) {
    if (isArray$1(hook)) {
      hook.forEach((_hook) => register(_hook.bind(publicThis)));
    } else if (hook) {
      register(hook.bind(publicThis));
    }
  }
  registerLifecycleHook(onBeforeMount, beforeMount);
  registerLifecycleHook(onMounted, mounted);
  registerLifecycleHook(onBeforeUpdate, beforeUpdate);
  registerLifecycleHook(onUpdated, updated);
  registerLifecycleHook(onActivated, activated);
  registerLifecycleHook(onDeactivated, deactivated);
  registerLifecycleHook(onErrorCaptured, errorCaptured);
  registerLifecycleHook(onRenderTracked, renderTracked);
  registerLifecycleHook(onRenderTriggered, renderTriggered);
  registerLifecycleHook(onBeforeUnmount, beforeUnmount);
  registerLifecycleHook(onUnmounted, unmounted);
  registerLifecycleHook(onServerPrefetch, serverPrefetch);
  if (isArray$1(expose)) {
    if (expose.length) {
      const exposed = instance.exposed || (instance.exposed = {});
      expose.forEach((key) => {
        Object.defineProperty(exposed, key, {
          get: () => publicThis[key],
          set: (val) => publicThis[key] = val,
          enumerable: true
        });
      });
    } else if (!instance.exposed) {
      instance.exposed = {};
    }
  }
  if (render2 && instance.render === NOOP) {
    instance.render = render2;
  }
  if (inheritAttrs != null) {
    instance.inheritAttrs = inheritAttrs;
  }
  if (components) instance.components = components;
  if (directives) instance.directives = directives;
  if (serverPrefetch) {
    markAsyncBoundary(instance);
  }
}
function resolveInjections(injectOptions, ctx, checkDuplicateProperties = NOOP) {
  if (isArray$1(injectOptions)) {
    injectOptions = normalizeInject(injectOptions);
  }
  for (const key in injectOptions) {
    const opt = injectOptions[key];
    let injected;
    if (isObject$2(opt)) {
      if ("default" in opt) {
        injected = inject(
          opt.from || key,
          opt.default,
          true
        );
      } else {
        injected = inject(opt.from || key);
      }
    } else {
      injected = inject(opt);
    }
    if (/* @__PURE__ */ isRef(injected)) {
      Object.defineProperty(ctx, key, {
        enumerable: true,
        configurable: true,
        get: () => injected.value,
        set: (v) => injected.value = v
      });
    } else {
      ctx[key] = injected;
    }
  }
}
function callHook$1(hook, instance, type) {
  callWithAsyncErrorHandling(
    isArray$1(hook) ? hook.map((h2) => h2.bind(instance.proxy)) : hook.bind(instance.proxy),
    instance,
    type
  );
}
function createWatcher(raw, ctx, publicThis, key) {
  let getter = key.includes(".") ? createPathGetter(publicThis, key) : () => publicThis[key];
  if (isString(raw)) {
    const handler = ctx[raw];
    if (isFunction$1(handler)) {
      {
        watch(getter, handler);
      }
    }
  } else if (isFunction$1(raw)) {
    {
      watch(getter, raw.bind(publicThis));
    }
  } else if (isObject$2(raw)) {
    if (isArray$1(raw)) {
      raw.forEach((r) => createWatcher(r, ctx, publicThis, key));
    } else {
      const handler = isFunction$1(raw.handler) ? raw.handler.bind(publicThis) : ctx[raw.handler];
      if (isFunction$1(handler)) {
        watch(getter, handler, raw);
      }
    }
  } else ;
}
function resolveMergedOptions(instance) {
  const base = instance.type;
  const { mixins, extends: extendsOptions } = base;
  const {
    mixins: globalMixins,
    optionsCache: cache,
    config: { optionMergeStrategies }
  } = instance.appContext;
  const cached = cache.get(base);
  let resolved;
  if (cached) {
    resolved = cached;
  } else if (!globalMixins.length && !mixins && !extendsOptions) {
    {
      resolved = base;
    }
  } else {
    resolved = {};
    if (globalMixins.length) {
      globalMixins.forEach(
        (m) => mergeOptions(resolved, m, optionMergeStrategies, true)
      );
    }
    mergeOptions(resolved, base, optionMergeStrategies);
  }
  if (isObject$2(base)) {
    cache.set(base, resolved);
  }
  return resolved;
}
function mergeOptions(to, from, strats, asMixin = false) {
  const { mixins, extends: extendsOptions } = from;
  if (extendsOptions) {
    mergeOptions(to, extendsOptions, strats, true);
  }
  if (mixins) {
    mixins.forEach(
      (m) => mergeOptions(to, m, strats, true)
    );
  }
  for (const key in from) {
    if (asMixin && key === "expose") ;
    else {
      const strat = internalOptionMergeStrats[key] || strats && strats[key];
      to[key] = strat ? strat(to[key], from[key]) : from[key];
    }
  }
  return to;
}
const internalOptionMergeStrats = {
  data: mergeDataFn,
  props: mergeEmitsOrPropsOptions,
  emits: mergeEmitsOrPropsOptions,
  // objects
  methods: mergeObjectOptions,
  computed: mergeObjectOptions,
  // lifecycle
  beforeCreate: mergeAsArray,
  created: mergeAsArray,
  beforeMount: mergeAsArray,
  mounted: mergeAsArray,
  beforeUpdate: mergeAsArray,
  updated: mergeAsArray,
  beforeDestroy: mergeAsArray,
  beforeUnmount: mergeAsArray,
  destroyed: mergeAsArray,
  unmounted: mergeAsArray,
  activated: mergeAsArray,
  deactivated: mergeAsArray,
  errorCaptured: mergeAsArray,
  serverPrefetch: mergeAsArray,
  // assets
  components: mergeObjectOptions,
  directives: mergeObjectOptions,
  // watch
  watch: mergeWatchOptions,
  // provide / inject
  provide: mergeDataFn,
  inject: mergeInject
};
function mergeDataFn(to, from) {
  if (!from) {
    return to;
  }
  if (!to) {
    return from;
  }
  return function mergedDataFn() {
    return extend(
      isFunction$1(to) ? to.call(this, this) : to,
      isFunction$1(from) ? from.call(this, this) : from
    );
  };
}
function mergeInject(to, from) {
  return mergeObjectOptions(normalizeInject(to), normalizeInject(from));
}
function normalizeInject(raw) {
  if (isArray$1(raw)) {
    const res = {};
    for (let i = 0; i < raw.length; i++) {
      res[raw[i]] = raw[i];
    }
    return res;
  }
  return raw;
}
function mergeAsArray(to, from) {
  return to ? [...new Set([].concat(to, from))] : from;
}
function mergeObjectOptions(to, from) {
  return to ? extend(/* @__PURE__ */ Object.create(null), to, from) : from;
}
function mergeEmitsOrPropsOptions(to, from) {
  if (to) {
    if (isArray$1(to) && isArray$1(from)) {
      return [.../* @__PURE__ */ new Set([...to, ...from])];
    }
    return extend(
      /* @__PURE__ */ Object.create(null),
      normalizePropsOrEmits(to),
      normalizePropsOrEmits(from != null ? from : {})
    );
  } else {
    return from;
  }
}
function mergeWatchOptions(to, from) {
  if (!to) return from;
  if (!from) return to;
  const merged = extend(/* @__PURE__ */ Object.create(null), to);
  for (const key in from) {
    merged[key] = mergeAsArray(to[key], from[key]);
  }
  return merged;
}
function createAppContext() {
  return {
    app: null,
    config: {
      isNativeTag: NO,
      performance: false,
      globalProperties: {},
      optionMergeStrategies: {},
      errorHandler: void 0,
      warnHandler: void 0,
      compilerOptions: {}
    },
    mixins: [],
    components: {},
    directives: {},
    provides: /* @__PURE__ */ Object.create(null),
    optionsCache: /* @__PURE__ */ new WeakMap(),
    propsCache: /* @__PURE__ */ new WeakMap(),
    emitsCache: /* @__PURE__ */ new WeakMap()
  };
}
let uid$1 = 0;
function createAppAPI(render2, hydrate) {
  return function createApp2(rootComponent, rootProps = null) {
    if (!isFunction$1(rootComponent)) {
      rootComponent = extend({}, rootComponent);
    }
    if (rootProps != null && !isObject$2(rootProps)) {
      rootProps = null;
    }
    const context = createAppContext();
    const installedPlugins = /* @__PURE__ */ new WeakSet();
    const pluginCleanupFns = [];
    let isMounted = false;
    const app = context.app = {
      _uid: uid$1++,
      _component: rootComponent,
      _props: rootProps,
      _container: null,
      _context: context,
      _instance: null,
      version,
      get config() {
        return context.config;
      },
      set config(v) {
      },
      use(plugin, ...options) {
        if (installedPlugins.has(plugin)) ;
        else if (plugin && isFunction$1(plugin.install)) {
          installedPlugins.add(plugin);
          plugin.install(app, ...options);
        } else if (isFunction$1(plugin)) {
          installedPlugins.add(plugin);
          plugin(app, ...options);
        } else ;
        return app;
      },
      mixin(mixin) {
        {
          if (!context.mixins.includes(mixin)) {
            context.mixins.push(mixin);
          }
        }
        return app;
      },
      component(name, component) {
        if (!component) {
          return context.components[name];
        }
        context.components[name] = component;
        return app;
      },
      directive(name, directive) {
        if (!directive) {
          return context.directives[name];
        }
        context.directives[name] = directive;
        return app;
      },
      mount(rootContainer, isHydrate, namespace) {
        if (!isMounted) {
          const vnode = app._ceVNode || createVNode(rootComponent, rootProps);
          vnode.appContext = context;
          if (namespace === true) {
            namespace = "svg";
          } else if (namespace === false) {
            namespace = void 0;
          }
          {
            render2(vnode, rootContainer, namespace);
          }
          isMounted = true;
          app._container = rootContainer;
          rootContainer.__vue_app__ = app;
          return getComponentPublicInstance(vnode.component);
        }
      },
      onUnmount(cleanupFn) {
        pluginCleanupFns.push(cleanupFn);
      },
      unmount() {
        if (isMounted) {
          callWithAsyncErrorHandling(
            pluginCleanupFns,
            app._instance,
            16
          );
          render2(null, app._container);
          delete app._container.__vue_app__;
        }
      },
      provide(key, value) {
        context.provides[key] = value;
        return app;
      },
      runWithContext(fn) {
        const lastApp = currentApp;
        currentApp = app;
        try {
          return fn();
        } finally {
          currentApp = lastApp;
        }
      }
    };
    return app;
  };
}
let currentApp = null;
const getModelModifiers = (props, modelName) => {
  return modelName === "modelValue" || modelName === "model-value" ? props.modelModifiers : props[`${modelName}Modifiers`] || props[`${camelize(modelName)}Modifiers`] || props[`${hyphenate(modelName)}Modifiers`];
};
function emit(instance, event, ...rawArgs) {
  if (instance.isUnmounted) return;
  const props = instance.vnode.props || EMPTY_OBJ;
  let args = rawArgs;
  const isModelListener2 = event.startsWith("update:");
  const modifiers = isModelListener2 && getModelModifiers(props, event.slice(7));
  if (modifiers) {
    if (modifiers.trim) {
      args = rawArgs.map((a) => isString(a) ? a.trim() : a);
    }
    if (modifiers.number) {
      args = rawArgs.map(looseToNumber);
    }
  }
  let handlerName;
  let handler = props[handlerName = toHandlerKey(event)] || // also try camelCase event handler (#2249)
  props[handlerName = toHandlerKey(camelize(event))];
  if (!handler && isModelListener2) {
    handler = props[handlerName = toHandlerKey(hyphenate(event))];
  }
  if (handler) {
    callWithAsyncErrorHandling(
      handler,
      instance,
      6,
      args
    );
  }
  const onceHandler = props[handlerName + `Once`];
  if (onceHandler) {
    if (!instance.emitted) {
      instance.emitted = {};
    } else if (instance.emitted[handlerName]) {
      return;
    }
    instance.emitted[handlerName] = true;
    callWithAsyncErrorHandling(
      onceHandler,
      instance,
      6,
      args
    );
  }
}
const mixinEmitsCache = /* @__PURE__ */ new WeakMap();
function normalizeEmitsOptions(comp, appContext, asMixin = false) {
  const cache = asMixin ? mixinEmitsCache : appContext.emitsCache;
  const cached = cache.get(comp);
  if (cached !== void 0) {
    return cached;
  }
  const raw = comp.emits;
  let normalized = {};
  let hasExtends = false;
  if (!isFunction$1(comp)) {
    const extendEmits = (raw2) => {
      const normalizedFromExtend = normalizeEmitsOptions(raw2, appContext, true);
      if (normalizedFromExtend) {
        hasExtends = true;
        extend(normalized, normalizedFromExtend);
      }
    };
    if (!asMixin && appContext.mixins.length) {
      appContext.mixins.forEach(extendEmits);
    }
    if (comp.extends) {
      extendEmits(comp.extends);
    }
    if (comp.mixins) {
      comp.mixins.forEach(extendEmits);
    }
  }
  if (!raw && !hasExtends) {
    if (isObject$2(comp)) {
      cache.set(comp, null);
    }
    return null;
  }
  if (isArray$1(raw)) {
    raw.forEach((key) => normalized[key] = null);
  } else {
    extend(normalized, raw);
  }
  if (isObject$2(comp)) {
    cache.set(comp, normalized);
  }
  return normalized;
}
function isEmitListener(options, key) {
  if (!options || !isOn(key)) {
    return false;
  }
  key = key.slice(2).replace(/Once$/, "");
  return hasOwn(options, key[0].toLowerCase() + key.slice(1)) || hasOwn(options, hyphenate(key)) || hasOwn(options, key);
}
function markAttrsAccessed() {
}
function renderComponentRoot(instance) {
  const {
    type: Component,
    vnode,
    proxy,
    withProxy,
    propsOptions: [propsOptions],
    slots,
    attrs,
    emit: emit2,
    render: render2,
    renderCache,
    props,
    data,
    setupState,
    ctx,
    inheritAttrs
  } = instance;
  const prev = setCurrentRenderingInstance(instance);
  let result;
  let fallthroughAttrs;
  try {
    if (vnode.shapeFlag & 4) {
      const proxyToUse = withProxy || proxy;
      const thisProxy = false ? new Proxy(proxyToUse, {
        get(target, key, receiver) {
          warn$1(
            `Property '${String(
              key
            )}' was accessed via 'this'. Avoid using 'this' in templates.`
          );
          return Reflect.get(target, key, receiver);
        }
      }) : proxyToUse;
      result = normalizeVNode(
        render2.call(
          thisProxy,
          proxyToUse,
          renderCache,
          false ? /* @__PURE__ */ shallowReadonly(props) : props,
          setupState,
          data,
          ctx
        )
      );
      fallthroughAttrs = attrs;
    } else {
      const render22 = Component;
      if (false) ;
      result = normalizeVNode(
        render22.length > 1 ? render22(
          false ? /* @__PURE__ */ shallowReadonly(props) : props,
          false ? {
            get attrs() {
              markAttrsAccessed();
              return /* @__PURE__ */ shallowReadonly(attrs);
            },
            slots,
            emit: emit2
          } : { attrs, slots, emit: emit2 }
        ) : render22(
          false ? /* @__PURE__ */ shallowReadonly(props) : props,
          null
        )
      );
      fallthroughAttrs = Component.props ? attrs : getFunctionalFallthrough(attrs);
    }
  } catch (err) {
    blockStack.length = 0;
    handleError(err, instance, 1);
    result = createVNode(Comment);
  }
  let root2 = result;
  if (fallthroughAttrs && inheritAttrs !== false) {
    const keys2 = Object.keys(fallthroughAttrs);
    const { shapeFlag } = root2;
    if (keys2.length) {
      if (shapeFlag & (1 | 6)) {
        if (propsOptions && keys2.some(isModelListener)) {
          fallthroughAttrs = filterModelListeners(
            fallthroughAttrs,
            propsOptions
          );
        }
        root2 = cloneVNode(root2, fallthroughAttrs, false, true);
      }
    }
  }
  if (vnode.dirs) {
    root2 = cloneVNode(root2, null, false, true);
    root2.dirs = root2.dirs ? root2.dirs.concat(vnode.dirs) : vnode.dirs;
  }
  if (vnode.transition) {
    setTransitionHooks(root2, vnode.transition);
  }
  {
    result = root2;
  }
  setCurrentRenderingInstance(prev);
  return result;
}
const getFunctionalFallthrough = (attrs) => {
  let res;
  for (const key in attrs) {
    if (key === "class" || key === "style" || isOn(key)) {
      (res || (res = {}))[key] = attrs[key];
    }
  }
  return res;
};
const filterModelListeners = (attrs, props) => {
  const res = {};
  for (const key in attrs) {
    if (!isModelListener(key) || !(key.slice(9) in props)) {
      res[key] = attrs[key];
    }
  }
  return res;
};
function shouldUpdateComponent(prevVNode, nextVNode, optimized) {
  const { props: prevProps, children: prevChildren, component } = prevVNode;
  const { props: nextProps, children: nextChildren, patchFlag } = nextVNode;
  const emits = component.emitsOptions;
  if (nextVNode.dirs || nextVNode.transition) {
    return true;
  }
  if (optimized && patchFlag >= 0) {
    if (patchFlag & 1024) {
      return true;
    }
    if (patchFlag & 16) {
      if (!prevProps) {
        return !!nextProps;
      }
      return hasPropsChanged(prevProps, nextProps, emits);
    } else if (patchFlag & 8) {
      const dynamicProps = nextVNode.dynamicProps;
      for (let i = 0; i < dynamicProps.length; i++) {
        const key = dynamicProps[i];
        if (hasPropValueChanged(nextProps, prevProps, key) && !isEmitListener(emits, key)) {
          return true;
        }
      }
    }
  } else {
    if (prevChildren || nextChildren) {
      if (!nextChildren || !nextChildren.$stable) {
        return true;
      }
    }
    if (prevProps === nextProps) {
      return false;
    }
    if (!prevProps) {
      return !!nextProps;
    }
    if (!nextProps) {
      return true;
    }
    return hasPropsChanged(prevProps, nextProps, emits);
  }
  return false;
}
function hasPropsChanged(prevProps, nextProps, emitsOptions) {
  const nextKeys = Object.keys(nextProps);
  if (nextKeys.length !== Object.keys(prevProps).length) {
    return true;
  }
  for (let i = 0; i < nextKeys.length; i++) {
    const key = nextKeys[i];
    if (hasPropValueChanged(nextProps, prevProps, key) && !isEmitListener(emitsOptions, key)) {
      return true;
    }
  }
  return false;
}
function hasPropValueChanged(nextProps, prevProps, key) {
  const nextProp = nextProps[key];
  const prevProp = prevProps[key];
  if (key === "style" && isObject$2(nextProp) && isObject$2(prevProp)) {
    return !looseEqual(nextProp, prevProp);
  }
  return nextProp !== prevProp;
}
function updateHOCHostEl({ vnode, parent, suspense }, el) {
  while (parent) {
    const root2 = parent.subTree;
    if (root2.suspense && root2.suspense.activeBranch === vnode) {
      root2.suspense.vnode.el = root2.el = el;
      vnode = root2;
    }
    if (root2 === vnode) {
      (vnode = parent.vnode).el = el;
      parent = parent.parent;
    } else {
      break;
    }
  }
  if (suspense && suspense.activeBranch === vnode) {
    suspense.vnode.el = el;
  }
}
const internalObjectProto = {};
const createInternalObject = () => Object.create(internalObjectProto);
const isInternalObject = (obj) => Object.getPrototypeOf(obj) === internalObjectProto;
function initProps(instance, rawProps, isStateful, isSSR = false) {
  const props = {};
  const attrs = createInternalObject();
  instance.propsDefaults = /* @__PURE__ */ Object.create(null);
  setFullProps(instance, rawProps, props, attrs);
  for (const key in instance.propsOptions[0]) {
    if (!(key in props)) {
      props[key] = void 0;
    }
  }
  if (isStateful) {
    instance.props = isSSR ? props : /* @__PURE__ */ shallowReactive(props);
  } else {
    if (!instance.type.props) {
      instance.props = attrs;
    } else {
      instance.props = props;
    }
  }
  instance.attrs = attrs;
}
function updateProps(instance, rawProps, rawPrevProps, optimized) {
  const {
    props,
    attrs,
    vnode: { patchFlag }
  } = instance;
  const rawCurrentProps = /* @__PURE__ */ toRaw(props);
  const [options] = instance.propsOptions;
  let hasAttrsChanged = false;
  if (
    // always force full diff in dev
    // - #1942 if hmr is enabled with sfc component
    // - vite#872 non-sfc component used by sfc component
    (optimized || patchFlag > 0) && !(patchFlag & 16)
  ) {
    if (patchFlag & 8) {
      const propsToUpdate = instance.vnode.dynamicProps;
      for (let i = 0; i < propsToUpdate.length; i++) {
        let key = propsToUpdate[i];
        if (isEmitListener(instance.emitsOptions, key)) {
          continue;
        }
        const value = rawProps[key];
        if (options) {
          if (hasOwn(attrs, key)) {
            if (value !== attrs[key]) {
              attrs[key] = value;
              hasAttrsChanged = true;
            }
          } else {
            const camelizedKey = camelize(key);
            props[camelizedKey] = resolvePropValue(
              options,
              rawCurrentProps,
              camelizedKey,
              value,
              instance,
              false
            );
          }
        } else {
          if (value !== attrs[key]) {
            attrs[key] = value;
            hasAttrsChanged = true;
          }
        }
      }
    }
  } else {
    if (setFullProps(instance, rawProps, props, attrs)) {
      hasAttrsChanged = true;
    }
    let kebabKey;
    for (const key in rawCurrentProps) {
      if (!rawProps || // for camelCase
      !hasOwn(rawProps, key) && // it's possible the original props was passed in as kebab-case
      // and converted to camelCase (#955)
      ((kebabKey = hyphenate(key)) === key || !hasOwn(rawProps, kebabKey))) {
        if (options) {
          if (rawPrevProps && // for camelCase
          (rawPrevProps[key] !== void 0 || // for kebab-case
          rawPrevProps[kebabKey] !== void 0)) {
            props[key] = resolvePropValue(
              options,
              rawCurrentProps,
              key,
              void 0,
              instance,
              true
            );
          }
        } else {
          delete props[key];
        }
      }
    }
    if (attrs !== rawCurrentProps) {
      for (const key in attrs) {
        if (!rawProps || !hasOwn(rawProps, key) && true) {
          delete attrs[key];
          hasAttrsChanged = true;
        }
      }
    }
  }
  if (hasAttrsChanged) {
    trigger(instance.attrs, "set", "");
  }
}
function setFullProps(instance, rawProps, props, attrs) {
  const [options, needCastKeys] = instance.propsOptions;
  let hasAttrsChanged = false;
  let rawCastValues;
  if (rawProps) {
    for (let key in rawProps) {
      if (isReservedProp(key)) {
        continue;
      }
      const value = rawProps[key];
      let camelKey;
      if (options && hasOwn(options, camelKey = camelize(key))) {
        if (!needCastKeys || !needCastKeys.includes(camelKey)) {
          props[camelKey] = value;
        } else {
          (rawCastValues || (rawCastValues = {}))[camelKey] = value;
        }
      } else if (!isEmitListener(instance.emitsOptions, key)) {
        if (!(key in attrs) || value !== attrs[key]) {
          attrs[key] = value;
          hasAttrsChanged = true;
        }
      }
    }
  }
  if (needCastKeys) {
    const rawCurrentProps = /* @__PURE__ */ toRaw(props);
    const castValues = rawCastValues || EMPTY_OBJ;
    for (let i = 0; i < needCastKeys.length; i++) {
      const key = needCastKeys[i];
      props[key] = resolvePropValue(
        options,
        rawCurrentProps,
        key,
        castValues[key],
        instance,
        !hasOwn(castValues, key)
      );
    }
  }
  return hasAttrsChanged;
}
function resolvePropValue(options, props, key, value, instance, isAbsent) {
  const opt = options[key];
  if (opt != null) {
    const hasDefault = hasOwn(opt, "default");
    if (hasDefault && value === void 0) {
      const defaultValue = opt.default;
      if (opt.type !== Function && !opt.skipFactory && isFunction$1(defaultValue)) {
        const { propsDefaults } = instance;
        if (key in propsDefaults) {
          value = propsDefaults[key];
        } else {
          const reset = setCurrentInstance(instance);
          value = propsDefaults[key] = defaultValue.call(
            null,
            props
          );
          reset();
        }
      } else {
        value = defaultValue;
      }
      if (instance.ce) {
        instance.ce._setProp(key, value);
      }
    }
    if (opt[
      0
      /* shouldCast */
    ]) {
      if (isAbsent && !hasDefault) {
        value = false;
      } else if (opt[
        1
        /* shouldCastTrue */
      ] && (value === "" || value === hyphenate(key))) {
        value = true;
      }
    }
  }
  return value;
}
const mixinPropsCache = /* @__PURE__ */ new WeakMap();
function normalizePropsOptions(comp, appContext, asMixin = false) {
  const cache = asMixin ? mixinPropsCache : appContext.propsCache;
  const cached = cache.get(comp);
  if (cached) {
    return cached;
  }
  const raw = comp.props;
  const normalized = {};
  const needCastKeys = [];
  let hasExtends = false;
  if (!isFunction$1(comp)) {
    const extendProps = (raw2) => {
      hasExtends = true;
      const [props, keys2] = normalizePropsOptions(raw2, appContext, true);
      extend(normalized, props);
      if (keys2) needCastKeys.push(...keys2);
    };
    if (!asMixin && appContext.mixins.length) {
      appContext.mixins.forEach(extendProps);
    }
    if (comp.extends) {
      extendProps(comp.extends);
    }
    if (comp.mixins) {
      comp.mixins.forEach(extendProps);
    }
  }
  if (!raw && !hasExtends) {
    if (isObject$2(comp)) {
      cache.set(comp, EMPTY_ARR);
    }
    return EMPTY_ARR;
  }
  if (isArray$1(raw)) {
    for (let i = 0; i < raw.length; i++) {
      const normalizedKey = camelize(raw[i]);
      if (validatePropName(normalizedKey)) {
        normalized[normalizedKey] = EMPTY_OBJ;
      }
    }
  } else if (raw) {
    for (const key in raw) {
      const normalizedKey = camelize(key);
      if (validatePropName(normalizedKey)) {
        const opt = raw[key];
        const prop = normalized[normalizedKey] = isArray$1(opt) || isFunction$1(opt) ? { type: opt } : extend({}, opt);
        const propType = prop.type;
        let shouldCast = false;
        let shouldCastTrue = true;
        if (isArray$1(propType)) {
          for (let index = 0; index < propType.length; ++index) {
            const type = propType[index];
            const typeName = isFunction$1(type) && type.name;
            if (typeName === "Boolean") {
              shouldCast = true;
              break;
            } else if (typeName === "String") {
              shouldCastTrue = false;
            }
          }
        } else {
          shouldCast = isFunction$1(propType) && propType.name === "Boolean";
        }
        prop[
          0
          /* shouldCast */
        ] = shouldCast;
        prop[
          1
          /* shouldCastTrue */
        ] = shouldCastTrue;
        if (shouldCast || hasOwn(prop, "default")) {
          needCastKeys.push(normalizedKey);
        }
      }
    }
  }
  const res = [normalized, needCastKeys];
  if (isObject$2(comp)) {
    cache.set(comp, res);
  }
  return res;
}
function validatePropName(key) {
  if (key[0] !== "$" && !isReservedProp(key)) {
    return true;
  }
  return false;
}
const isInternalKey = (key) => key === "_" || key === "_ctx" || key === "$stable";
const normalizeSlotValue = (value) => isArray$1(value) ? value.map(normalizeVNode) : [normalizeVNode(value)];
const normalizeSlot = (key, rawSlot, ctx) => {
  if (rawSlot._n) {
    return rawSlot;
  }
  const normalized = withCtx((...args) => {
    if (false) ;
    return normalizeSlotValue(rawSlot(...args));
  }, ctx);
  normalized._c = false;
  return normalized;
};
const normalizeObjectSlots = (rawSlots, slots, instance) => {
  const ctx = rawSlots._ctx;
  for (const key in rawSlots) {
    if (isInternalKey(key)) continue;
    const value = rawSlots[key];
    if (isFunction$1(value)) {
      slots[key] = normalizeSlot(key, value, ctx);
    } else if (value != null) {
      const normalized = normalizeSlotValue(value);
      slots[key] = () => normalized;
    }
  }
};
const normalizeVNodeSlots = (instance, children) => {
  const normalized = normalizeSlotValue(children);
  instance.slots.default = () => normalized;
};
const assignSlots = (slots, children, optimized) => {
  for (const key in children) {
    if (optimized || !isInternalKey(key)) {
      slots[key] = children[key];
    }
  }
};
const initSlots = (instance, children, optimized) => {
  const slots = instance.slots = createInternalObject();
  if (instance.vnode.shapeFlag & 32) {
    const type = children._;
    if (type) {
      assignSlots(slots, children, optimized);
      if (optimized) {
        def(slots, "_", type, true);
      }
    } else {
      normalizeObjectSlots(children, slots);
    }
  } else if (children) {
    normalizeVNodeSlots(instance, children);
  }
};
const updateSlots = (instance, children, optimized) => {
  const { vnode, slots } = instance;
  let needDeletionCheck = true;
  let deletionComparisonTarget = EMPTY_OBJ;
  if (vnode.shapeFlag & 32) {
    const type = children._;
    if (type) {
      if (optimized && type === 1) {
        needDeletionCheck = false;
      } else {
        assignSlots(slots, children, optimized);
      }
    } else {
      needDeletionCheck = !children.$stable;
      normalizeObjectSlots(children, slots);
    }
    deletionComparisonTarget = children;
  } else if (children) {
    normalizeVNodeSlots(instance, children);
    deletionComparisonTarget = { default: 1 };
  }
  if (needDeletionCheck) {
    for (const key in slots) {
      if (!isInternalKey(key) && deletionComparisonTarget[key] == null) {
        delete slots[key];
      }
    }
  }
};
const queuePostRenderEffect = queueEffectWithSuspense;
function createRenderer(options) {
  return baseCreateRenderer(options);
}
function baseCreateRenderer(options, createHydrationFns) {
  const target = getGlobalThis();
  target.__VUE__ = true;
  const {
    insert: hostInsert,
    remove: hostRemove,
    patchProp: hostPatchProp,
    createElement: hostCreateElement,
    createText: hostCreateText,
    createComment: hostCreateComment,
    setText: hostSetText,
    setElementText: hostSetElementText,
    parentNode: hostParentNode,
    nextSibling: hostNextSibling,
    setScopeId: hostSetScopeId = NOOP,
    insertStaticContent: hostInsertStaticContent
  } = options;
  const patch = (n1, n2, container, anchor = null, parentComponent = null, parentSuspense = null, namespace = void 0, slotScopeIds = null, optimized = !!n2.dynamicChildren) => {
    if (n1 === n2) {
      return;
    }
    if (n1 && !isSameVNodeType(n1, n2)) {
      anchor = getNextHostNode(n1);
      unmount(n1, parentComponent, parentSuspense, true);
      n1 = null;
    }
    if (n2.patchFlag === -2) {
      optimized = false;
      n2.dynamicChildren = null;
    }
    const { type, ref: ref3, shapeFlag } = n2;
    switch (type) {
      case Text:
        processText(n1, n2, container, anchor);
        break;
      case Comment:
        processCommentNode(n1, n2, container, anchor);
        break;
      case Static:
        if (n1 == null) {
          mountStaticNode(n2, container, anchor, namespace);
        }
        break;
      case Fragment:
        processFragment(
          n1,
          n2,
          container,
          anchor,
          parentComponent,
          parentSuspense,
          namespace,
          slotScopeIds,
          optimized
        );
        break;
      default:
        if (shapeFlag & 1) {
          processElement(
            n1,
            n2,
            container,
            anchor,
            parentComponent,
            parentSuspense,
            namespace,
            slotScopeIds,
            optimized
          );
        } else if (shapeFlag & 6) {
          processComponent(
            n1,
            n2,
            container,
            anchor,
            parentComponent,
            parentSuspense,
            namespace,
            slotScopeIds,
            optimized
          );
        } else if (shapeFlag & 64) {
          type.process(
            n1,
            n2,
            container,
            anchor,
            parentComponent,
            parentSuspense,
            namespace,
            slotScopeIds,
            optimized,
            internals
          );
        } else if (shapeFlag & 128) {
          type.process(
            n1,
            n2,
            container,
            anchor,
            parentComponent,
            parentSuspense,
            namespace,
            slotScopeIds,
            optimized,
            internals
          );
        } else ;
    }
    if (ref3 != null && parentComponent) {
      setRef(ref3, n1 && n1.ref, parentSuspense, n2 || n1, !n2);
    } else if (ref3 == null && n1 && n1.ref != null) {
      setRef(n1.ref, null, parentSuspense, n1, true);
    }
  };
  const processText = (n1, n2, container, anchor) => {
    if (n1 == null) {
      hostInsert(
        n2.el = hostCreateText(n2.children),
        container,
        anchor
      );
    } else {
      const el = n2.el = n1.el;
      if (n2.children !== n1.children) {
        hostSetText(el, n2.children);
      }
    }
  };
  const processCommentNode = (n1, n2, container, anchor) => {
    if (n1 == null) {
      hostInsert(
        n2.el = hostCreateComment(n2.children || ""),
        container,
        anchor
      );
    } else {
      n2.el = n1.el;
    }
  };
  const mountStaticNode = (n2, container, anchor, namespace) => {
    [n2.el, n2.anchor] = hostInsertStaticContent(
      n2.children,
      container,
      anchor,
      namespace,
      n2.el,
      n2.anchor
    );
  };
  const moveStaticNode = ({ el, anchor }, container, nextSibling) => {
    let next;
    while (el && el !== anchor) {
      next = hostNextSibling(el);
      hostInsert(el, container, nextSibling);
      el = next;
    }
    hostInsert(anchor, container, nextSibling);
  };
  const removeStaticNode = ({ el, anchor }) => {
    let next;
    while (el && el !== anchor) {
      next = hostNextSibling(el);
      hostRemove(el);
      el = next;
    }
    hostRemove(anchor);
  };
  const processElement = (n1, n2, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized) => {
    if (n2.type === "svg") {
      namespace = "svg";
    } else if (n2.type === "math") {
      namespace = "mathml";
    }
    if (n1 == null) {
      mountElement(
        n2,
        container,
        anchor,
        parentComponent,
        parentSuspense,
        namespace,
        slotScopeIds,
        optimized
      );
    } else {
      const customElement = n1.el && n1.el._isVueCE ? n1.el : null;
      try {
        if (customElement) {
          customElement._beginPatch();
        }
        patchElement(
          n1,
          n2,
          parentComponent,
          parentSuspense,
          namespace,
          slotScopeIds,
          optimized
        );
      } finally {
        if (customElement) {
          customElement._endPatch();
        }
      }
    }
  };
  const mountElement = (vnode, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized) => {
    let el;
    let vnodeHook;
    const { props, shapeFlag, transition, dirs } = vnode;
    el = vnode.el = hostCreateElement(
      vnode.type,
      namespace,
      props && props.is,
      props
    );
    if (shapeFlag & 8) {
      hostSetElementText(el, vnode.children);
    } else if (shapeFlag & 16) {
      mountChildren(
        vnode.children,
        el,
        null,
        parentComponent,
        parentSuspense,
        resolveChildrenNamespace(vnode, namespace),
        slotScopeIds,
        optimized
      );
    }
    if (dirs) {
      invokeDirectiveHook(vnode, null, parentComponent, "created");
    }
    setScopeId(el, vnode, vnode.scopeId, slotScopeIds, parentComponent);
    if (props) {
      for (const key in props) {
        if (key !== "value" && !isReservedProp(key)) {
          hostPatchProp(el, key, null, props[key], namespace, parentComponent);
        }
      }
      if ("value" in props) {
        hostPatchProp(el, "value", null, props.value, namespace);
      }
      if (vnodeHook = props.onVnodeBeforeMount) {
        invokeVNodeHook(vnodeHook, parentComponent, vnode);
      }
    }
    if (dirs) {
      invokeDirectiveHook(vnode, null, parentComponent, "beforeMount");
    }
    const needCallTransitionHooks = needTransition(parentSuspense, transition);
    if (needCallTransitionHooks) {
      transition.beforeEnter(el);
    }
    hostInsert(el, container, anchor);
    if ((vnodeHook = props && props.onVnodeMounted) || needCallTransitionHooks || dirs) {
      queuePostRenderEffect(() => {
        try {
          vnodeHook && invokeVNodeHook(vnodeHook, parentComponent, vnode);
          needCallTransitionHooks && transition.enter(el);
          dirs && invokeDirectiveHook(vnode, null, parentComponent, "mounted");
        } finally {
        }
      }, parentSuspense);
    }
  };
  const setScopeId = (el, vnode, scopeId, slotScopeIds, parentComponent) => {
    if (scopeId) {
      hostSetScopeId(el, scopeId);
    }
    if (slotScopeIds) {
      for (let i = 0; i < slotScopeIds.length; i++) {
        hostSetScopeId(el, slotScopeIds[i]);
      }
    }
    if (parentComponent) {
      let subTree = parentComponent.subTree;
      if (vnode === subTree || isSuspense(subTree.type) && (subTree.ssContent === vnode || subTree.ssFallback === vnode)) {
        const parentVNode = parentComponent.vnode;
        setScopeId(
          el,
          parentVNode,
          parentVNode.scopeId,
          parentVNode.slotScopeIds,
          parentComponent.parent
        );
      }
    }
  };
  const mountChildren = (children, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized, start = 0) => {
    for (let i = start; i < children.length; i++) {
      const child = children[i] = optimized ? cloneIfMounted(children[i]) : normalizeVNode(children[i]);
      patch(
        null,
        child,
        container,
        anchor,
        parentComponent,
        parentSuspense,
        namespace,
        slotScopeIds,
        optimized
      );
    }
  };
  const patchElement = (n1, n2, parentComponent, parentSuspense, namespace, slotScopeIds, optimized) => {
    const el = n2.el = n1.el;
    let { patchFlag, dynamicChildren, dirs } = n2;
    patchFlag |= n1.patchFlag & 16;
    const oldProps = n1.props || EMPTY_OBJ;
    const newProps = n2.props || EMPTY_OBJ;
    let vnodeHook;
    parentComponent && toggleRecurse(parentComponent, false);
    if (vnodeHook = newProps.onVnodeBeforeUpdate) {
      invokeVNodeHook(vnodeHook, parentComponent, n2, n1);
    }
    if (dirs) {
      invokeDirectiveHook(n2, n1, parentComponent, "beforeUpdate");
    }
    parentComponent && toggleRecurse(parentComponent, true);
    if (oldProps.innerHTML && newProps.innerHTML == null || oldProps.textContent && newProps.textContent == null) {
      hostSetElementText(el, "");
    }
    if (dynamicChildren) {
      patchBlockChildren(
        n1.dynamicChildren,
        dynamicChildren,
        el,
        parentComponent,
        parentSuspense,
        resolveChildrenNamespace(n2, namespace),
        slotScopeIds
      );
    } else if (!optimized) {
      patchChildren(
        n1,
        n2,
        el,
        null,
        parentComponent,
        parentSuspense,
        resolveChildrenNamespace(n2, namespace),
        slotScopeIds,
        false
      );
    }
    if (patchFlag > 0) {
      if (patchFlag & 16) {
        patchProps(el, oldProps, newProps, parentComponent, namespace);
      } else {
        if (patchFlag & 2) {
          if (oldProps.class !== newProps.class) {
            hostPatchProp(el, "class", null, newProps.class, namespace);
          }
        }
        if (patchFlag & 4) {
          hostPatchProp(el, "style", oldProps.style, newProps.style, namespace);
        }
        if (patchFlag & 8) {
          const propsToUpdate = n2.dynamicProps;
          for (let i = 0; i < propsToUpdate.length; i++) {
            const key = propsToUpdate[i];
            const prev = oldProps[key];
            const next = newProps[key];
            if (next !== prev || key === "value") {
              hostPatchProp(el, key, prev, next, namespace, parentComponent);
            }
          }
        }
      }
      if (patchFlag & 1) {
        if (n1.children !== n2.children) {
          hostSetElementText(el, n2.children);
        }
      }
    } else if (!optimized && dynamicChildren == null) {
      patchProps(el, oldProps, newProps, parentComponent, namespace);
    }
    if ((vnodeHook = newProps.onVnodeUpdated) || dirs) {
      queuePostRenderEffect(() => {
        vnodeHook && invokeVNodeHook(vnodeHook, parentComponent, n2, n1);
        dirs && invokeDirectiveHook(n2, n1, parentComponent, "updated");
      }, parentSuspense);
    }
  };
  const patchBlockChildren = (oldChildren, newChildren, fallbackContainer, parentComponent, parentSuspense, namespace, slotScopeIds) => {
    for (let i = 0; i < newChildren.length; i++) {
      const oldVNode = oldChildren[i];
      const newVNode = newChildren[i];
      const container = (
        // oldVNode may be an errored async setup() component inside Suspense
        // which will not have a mounted element
        oldVNode.el && // - In the case of a Fragment, we need to provide the actual parent
        // of the Fragment itself so it can move its children.
        (oldVNode.type === Fragment || // - In the case of different nodes, there is going to be a replacement
        // which also requires the correct parent container
        !isSameVNodeType(oldVNode, newVNode) || // - In the case of a component, it could contain anything.
        oldVNode.shapeFlag & (6 | 64 | 128)) ? hostParentNode(oldVNode.el) : (
          // In other cases, the parent container is not actually used so we
          // just pass the block element here to avoid a DOM parentNode call.
          fallbackContainer
        )
      );
      patch(
        oldVNode,
        newVNode,
        container,
        null,
        parentComponent,
        parentSuspense,
        namespace,
        slotScopeIds,
        true
      );
    }
  };
  const patchProps = (el, oldProps, newProps, parentComponent, namespace) => {
    if (oldProps !== newProps) {
      if (oldProps !== EMPTY_OBJ) {
        for (const key in oldProps) {
          if (!isReservedProp(key) && !(key in newProps)) {
            hostPatchProp(
              el,
              key,
              oldProps[key],
              null,
              namespace,
              parentComponent
            );
          }
        }
      }
      for (const key in newProps) {
        if (isReservedProp(key)) continue;
        const next = newProps[key];
        const prev = oldProps[key];
        if (next !== prev && key !== "value") {
          hostPatchProp(el, key, prev, next, namespace, parentComponent);
        }
      }
      if ("value" in newProps) {
        hostPatchProp(el, "value", oldProps.value, newProps.value, namespace);
      }
    }
  };
  const processFragment = (n1, n2, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized) => {
    const fragmentStartAnchor = n2.el = n1 ? n1.el : hostCreateText("");
    const fragmentEndAnchor = n2.anchor = n1 ? n1.anchor : hostCreateText("");
    let { patchFlag, dynamicChildren, slotScopeIds: fragmentSlotScopeIds } = n2;
    if (fragmentSlotScopeIds) {
      slotScopeIds = slotScopeIds ? slotScopeIds.concat(fragmentSlotScopeIds) : fragmentSlotScopeIds;
    }
    if (n1 == null) {
      hostInsert(fragmentStartAnchor, container, anchor);
      hostInsert(fragmentEndAnchor, container, anchor);
      mountChildren(
        // #10007
        // such fragment like `<></>` will be compiled into
        // a fragment which doesn't have a children.
        // In this case fallback to an empty array
        n2.children || [],
        container,
        fragmentEndAnchor,
        parentComponent,
        parentSuspense,
        namespace,
        slotScopeIds,
        optimized
      );
    } else {
      if (patchFlag > 0 && patchFlag & 64 && dynamicChildren && // #2715 the previous fragment could've been a BAILed one as a result
      // of renderSlot() with no valid children
      n1.dynamicChildren && n1.dynamicChildren.length === dynamicChildren.length) {
        patchBlockChildren(
          n1.dynamicChildren,
          dynamicChildren,
          container,
          parentComponent,
          parentSuspense,
          namespace,
          slotScopeIds
        );
        if (
          // #2080 if the stable fragment has a key, it's a <template v-for> that may
          //  get moved around. Make sure all root level vnodes inherit el.
          // #2134 or if it's a component root, it may also get moved around
          // as the component is being moved.
          n2.key != null || parentComponent && n2 === parentComponent.subTree
        ) {
          traverseStaticChildren(
            n1,
            n2,
            true
            /* shallow */
          );
        }
      } else {
        patchChildren(
          n1,
          n2,
          container,
          fragmentEndAnchor,
          parentComponent,
          parentSuspense,
          namespace,
          slotScopeIds,
          optimized
        );
      }
    }
  };
  const processComponent = (n1, n2, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized) => {
    n2.slotScopeIds = slotScopeIds;
    if (n1 == null) {
      if (n2.shapeFlag & 512) {
        parentComponent.ctx.activate(
          n2,
          container,
          anchor,
          namespace,
          optimized
        );
      } else {
        mountComponent(
          n2,
          container,
          anchor,
          parentComponent,
          parentSuspense,
          namespace,
          optimized
        );
      }
    } else {
      updateComponent(n1, n2, optimized);
    }
  };
  const mountComponent = (initialVNode, container, anchor, parentComponent, parentSuspense, namespace, optimized) => {
    const instance = initialVNode.component = createComponentInstance(
      initialVNode,
      parentComponent,
      parentSuspense
    );
    if (isKeepAlive(initialVNode)) {
      instance.ctx.renderer = internals;
    }
    {
      setupComponent(instance, false, optimized);
    }
    if (instance.asyncDep) {
      parentSuspense && parentSuspense.registerDep(instance, setupRenderEffect, optimized);
      if (!initialVNode.el) {
        const placeholder = instance.subTree = createVNode(Comment);
        processCommentNode(null, placeholder, container, anchor);
        initialVNode.placeholder = placeholder.el;
      }
    } else {
      setupRenderEffect(
        instance,
        initialVNode,
        container,
        anchor,
        parentSuspense,
        namespace,
        optimized
      );
    }
  };
  const updateComponent = (n1, n2, optimized) => {
    const instance = n2.component = n1.component;
    if (shouldUpdateComponent(n1, n2, optimized)) {
      if (instance.asyncDep && !instance.asyncResolved) {
        updateComponentPreRender(instance, n2, optimized);
        return;
      } else {
        instance.next = n2;
        instance.update();
      }
    } else {
      n2.el = n1.el;
      instance.vnode = n2;
    }
  };
  const setupRenderEffect = (instance, initialVNode, container, anchor, parentSuspense, namespace, optimized) => {
    const componentUpdateFn = () => {
      if (!instance.isMounted) {
        let vnodeHook;
        const { el, props } = initialVNode;
        const { bm, m, parent, root: root2, type } = instance;
        const isAsyncWrapperVNode = isAsyncWrapper(initialVNode);
        toggleRecurse(instance, false);
        if (bm) {
          invokeArrayFns(bm);
        }
        if (!isAsyncWrapperVNode && (vnodeHook = props && props.onVnodeBeforeMount)) {
          invokeVNodeHook(vnodeHook, parent, initialVNode);
        }
        toggleRecurse(instance, true);
        {
          if (root2.ce && root2.ce._hasShadowRoot()) {
            root2.ce._injectChildStyle(
              type,
              instance.parent ? instance.parent.type : void 0
            );
          }
          const subTree = instance.subTree = renderComponentRoot(instance);
          patch(
            null,
            subTree,
            container,
            anchor,
            instance,
            parentSuspense,
            namespace
          );
          initialVNode.el = subTree.el;
        }
        if (m) {
          queuePostRenderEffect(m, parentSuspense);
        }
        if (!isAsyncWrapperVNode && (vnodeHook = props && props.onVnodeMounted)) {
          const scopedInitialVNode = initialVNode;
          queuePostRenderEffect(
            () => invokeVNodeHook(vnodeHook, parent, scopedInitialVNode),
            parentSuspense
          );
        }
        if (initialVNode.shapeFlag & 256 || parent && isAsyncWrapper(parent.vnode) && parent.vnode.shapeFlag & 256) {
          instance.a && queuePostRenderEffect(instance.a, parentSuspense);
        }
        instance.isMounted = true;
        initialVNode = container = anchor = null;
      } else {
        let { next, bu, u, parent, vnode } = instance;
        {
          const nonHydratedAsyncRoot = locateNonHydratedAsyncRoot(instance);
          if (nonHydratedAsyncRoot) {
            if (next) {
              next.el = vnode.el;
              updateComponentPreRender(instance, next, optimized);
            }
            nonHydratedAsyncRoot.asyncDep.then(() => {
              queuePostRenderEffect(() => {
                if (!instance.isUnmounted) update();
              }, parentSuspense);
            });
            return;
          }
        }
        let originNext = next;
        let vnodeHook;
        toggleRecurse(instance, false);
        if (next) {
          next.el = vnode.el;
          updateComponentPreRender(instance, next, optimized);
        } else {
          next = vnode;
        }
        if (bu) {
          invokeArrayFns(bu);
        }
        if (vnodeHook = next.props && next.props.onVnodeBeforeUpdate) {
          invokeVNodeHook(vnodeHook, parent, next, vnode);
        }
        toggleRecurse(instance, true);
        const nextTree = renderComponentRoot(instance);
        const prevTree = instance.subTree;
        instance.subTree = nextTree;
        patch(
          prevTree,
          nextTree,
          // parent may have changed if it's in a teleport
          hostParentNode(prevTree.el),
          // anchor may have changed if it's in a fragment
          getNextHostNode(prevTree),
          instance,
          parentSuspense,
          namespace
        );
        next.el = nextTree.el;
        if (originNext === null) {
          updateHOCHostEl(instance, nextTree.el);
        }
        if (u) {
          queuePostRenderEffect(u, parentSuspense);
        }
        if (vnodeHook = next.props && next.props.onVnodeUpdated) {
          queuePostRenderEffect(
            () => invokeVNodeHook(vnodeHook, parent, next, vnode),
            parentSuspense
          );
        }
      }
    };
    instance.scope.on();
    const effect2 = instance.effect = new ReactiveEffect(componentUpdateFn);
    instance.scope.off();
    const update = instance.update = effect2.run.bind(effect2);
    const job = instance.job = effect2.runIfDirty.bind(effect2);
    job.i = instance;
    job.id = instance.uid;
    effect2.scheduler = () => queueJob(job);
    toggleRecurse(instance, true);
    update();
  };
  const updateComponentPreRender = (instance, nextVNode, optimized) => {
    nextVNode.component = instance;
    const prevProps = instance.vnode.props;
    instance.vnode = nextVNode;
    instance.next = null;
    updateProps(instance, nextVNode.props, prevProps, optimized);
    updateSlots(instance, nextVNode.children, optimized);
    pauseTracking();
    flushPreFlushCbs(instance);
    resetTracking();
  };
  const patchChildren = (n1, n2, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized = false) => {
    const c1 = n1 && n1.children;
    const prevShapeFlag = n1 ? n1.shapeFlag : 0;
    const c2 = n2.children;
    const { patchFlag, shapeFlag } = n2;
    if (patchFlag > 0) {
      if (patchFlag & 128) {
        patchKeyedChildren(
          c1,
          c2,
          container,
          anchor,
          parentComponent,
          parentSuspense,
          namespace,
          slotScopeIds,
          optimized
        );
        return;
      } else if (patchFlag & 256) {
        patchUnkeyedChildren(
          c1,
          c2,
          container,
          anchor,
          parentComponent,
          parentSuspense,
          namespace,
          slotScopeIds,
          optimized
        );
        return;
      }
    }
    if (shapeFlag & 8) {
      if (prevShapeFlag & 16) {
        unmountChildren(c1, parentComponent, parentSuspense);
      }
      if (c2 !== c1) {
        hostSetElementText(container, c2);
      }
    } else {
      if (prevShapeFlag & 16) {
        if (shapeFlag & 16) {
          patchKeyedChildren(
            c1,
            c2,
            container,
            anchor,
            parentComponent,
            parentSuspense,
            namespace,
            slotScopeIds,
            optimized
          );
        } else {
          unmountChildren(c1, parentComponent, parentSuspense, true);
        }
      } else {
        if (prevShapeFlag & 8) {
          hostSetElementText(container, "");
        }
        if (shapeFlag & 16) {
          mountChildren(
            c2,
            container,
            anchor,
            parentComponent,
            parentSuspense,
            namespace,
            slotScopeIds,
            optimized
          );
        }
      }
    }
  };
  const patchUnkeyedChildren = (c1, c2, container, anchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized) => {
    c1 = c1 || EMPTY_ARR;
    c2 = c2 || EMPTY_ARR;
    const oldLength = c1.length;
    const newLength = c2.length;
    const commonLength = Math.min(oldLength, newLength);
    let i;
    for (i = 0; i < commonLength; i++) {
      const nextChild = c2[i] = optimized ? cloneIfMounted(c2[i]) : normalizeVNode(c2[i]);
      patch(
        c1[i],
        nextChild,
        container,
        null,
        parentComponent,
        parentSuspense,
        namespace,
        slotScopeIds,
        optimized
      );
    }
    if (oldLength > newLength) {
      unmountChildren(
        c1,
        parentComponent,
        parentSuspense,
        true,
        false,
        commonLength
      );
    } else {
      mountChildren(
        c2,
        container,
        anchor,
        parentComponent,
        parentSuspense,
        namespace,
        slotScopeIds,
        optimized,
        commonLength
      );
    }
  };
  const patchKeyedChildren = (c1, c2, container, parentAnchor, parentComponent, parentSuspense, namespace, slotScopeIds, optimized) => {
    let i = 0;
    const l2 = c2.length;
    let e1 = c1.length - 1;
    let e2 = l2 - 1;
    while (i <= e1 && i <= e2) {
      const n1 = c1[i];
      const n2 = c2[i] = optimized ? cloneIfMounted(c2[i]) : normalizeVNode(c2[i]);
      if (isSameVNodeType(n1, n2)) {
        patch(
          n1,
          n2,
          container,
          null,
          parentComponent,
          parentSuspense,
          namespace,
          slotScopeIds,
          optimized
        );
      } else {
        break;
      }
      i++;
    }
    while (i <= e1 && i <= e2) {
      const n1 = c1[e1];
      const n2 = c2[e2] = optimized ? cloneIfMounted(c2[e2]) : normalizeVNode(c2[e2]);
      if (isSameVNodeType(n1, n2)) {
        patch(
          n1,
          n2,
          container,
          null,
          parentComponent,
          parentSuspense,
          namespace,
          slotScopeIds,
          optimized
        );
      } else {
        break;
      }
      e1--;
      e2--;
    }
    if (i > e1) {
      if (i <= e2) {
        const nextPos = e2 + 1;
        const anchor = nextPos < l2 ? c2[nextPos].el : parentAnchor;
        while (i <= e2) {
          patch(
            null,
            c2[i] = optimized ? cloneIfMounted(c2[i]) : normalizeVNode(c2[i]),
            container,
            anchor,
            parentComponent,
            parentSuspense,
            namespace,
            slotScopeIds,
            optimized
          );
          i++;
        }
      }
    } else if (i > e2) {
      while (i <= e1) {
        unmount(c1[i], parentComponent, parentSuspense, true);
        i++;
      }
    } else {
      const s1 = i;
      const s2 = i;
      const keyToNewIndexMap = /* @__PURE__ */ new Map();
      for (i = s2; i <= e2; i++) {
        const nextChild = c2[i] = optimized ? cloneIfMounted(c2[i]) : normalizeVNode(c2[i]);
        if (nextChild.key != null) {
          keyToNewIndexMap.set(nextChild.key, i);
        }
      }
      let j;
      let patched = 0;
      const toBePatched = e2 - s2 + 1;
      let moved = false;
      let maxNewIndexSoFar = 0;
      const newIndexToOldIndexMap = new Array(toBePatched);
      for (i = 0; i < toBePatched; i++) newIndexToOldIndexMap[i] = 0;
      for (i = s1; i <= e1; i++) {
        const prevChild = c1[i];
        if (patched >= toBePatched) {
          unmount(prevChild, parentComponent, parentSuspense, true);
          continue;
        }
        let newIndex;
        if (prevChild.key != null) {
          newIndex = keyToNewIndexMap.get(prevChild.key);
        } else {
          for (j = s2; j <= e2; j++) {
            if (newIndexToOldIndexMap[j - s2] === 0 && isSameVNodeType(prevChild, c2[j])) {
              newIndex = j;
              break;
            }
          }
        }
        if (newIndex === void 0) {
          unmount(prevChild, parentComponent, parentSuspense, true);
        } else {
          newIndexToOldIndexMap[newIndex - s2] = i + 1;
          if (newIndex >= maxNewIndexSoFar) {
            maxNewIndexSoFar = newIndex;
          } else {
            moved = true;
          }
          patch(
            prevChild,
            c2[newIndex],
            container,
            null,
            parentComponent,
            parentSuspense,
            namespace,
            slotScopeIds,
            optimized
          );
          patched++;
        }
      }
      const increasingNewIndexSequence = moved ? getSequence(newIndexToOldIndexMap) : EMPTY_ARR;
      j = increasingNewIndexSequence.length - 1;
      for (i = toBePatched - 1; i >= 0; i--) {
        const nextIndex = s2 + i;
        const nextChild = c2[nextIndex];
        const anchorVNode = c2[nextIndex + 1];
        const anchor = nextIndex + 1 < l2 ? (
          // #13559, #14173 fallback to el placeholder for unresolved async component
          anchorVNode.el || resolveAsyncComponentPlaceholder(anchorVNode)
        ) : parentAnchor;
        if (newIndexToOldIndexMap[i] === 0) {
          patch(
            null,
            nextChild,
            container,
            anchor,
            parentComponent,
            parentSuspense,
            namespace,
            slotScopeIds,
            optimized
          );
        } else if (moved) {
          if (j < 0 || i !== increasingNewIndexSequence[j]) {
            move(nextChild, container, anchor, 2);
          } else {
            j--;
          }
        }
      }
    }
  };
  const move = (vnode, container, anchor, moveType, parentSuspense = null) => {
    const { el, type, transition, children, shapeFlag } = vnode;
    if (shapeFlag & 6) {
      move(vnode.component.subTree, container, anchor, moveType);
      return;
    }
    if (shapeFlag & 128) {
      vnode.suspense.move(container, anchor, moveType);
      return;
    }
    if (shapeFlag & 64) {
      type.move(vnode, container, anchor, internals);
      return;
    }
    if (type === Fragment) {
      hostInsert(el, container, anchor);
      for (let i = 0; i < children.length; i++) {
        move(children[i], container, anchor, moveType);
      }
      hostInsert(vnode.anchor, container, anchor);
      return;
    }
    if (type === Static) {
      moveStaticNode(vnode, container, anchor);
      return;
    }
    const needTransition2 = moveType !== 2 && shapeFlag & 1 && transition;
    if (needTransition2) {
      if (moveType === 0) {
        transition.beforeEnter(el);
        hostInsert(el, container, anchor);
        queuePostRenderEffect(() => transition.enter(el), parentSuspense);
      } else {
        const { leave, delayLeave, afterLeave } = transition;
        const remove22 = () => {
          if (vnode.ctx.isUnmounted) {
            hostRemove(el);
          } else {
            hostInsert(el, container, anchor);
          }
        };
        const performLeave = () => {
          if (el._isLeaving) {
            el[leaveCbKey](
              true
              /* cancelled */
            );
          }
          leave(el, () => {
            remove22();
            afterLeave && afterLeave();
          });
        };
        if (delayLeave) {
          delayLeave(el, remove22, performLeave);
        } else {
          performLeave();
        }
      }
    } else {
      hostInsert(el, container, anchor);
    }
  };
  const unmount = (vnode, parentComponent, parentSuspense, doRemove = false, optimized = false) => {
    const {
      type,
      props,
      ref: ref3,
      children,
      dynamicChildren,
      shapeFlag,
      patchFlag,
      dirs,
      cacheIndex,
      memo
    } = vnode;
    if (patchFlag === -2) {
      optimized = false;
    }
    if (ref3 != null) {
      pauseTracking();
      setRef(ref3, null, parentSuspense, vnode, true);
      resetTracking();
    }
    if (cacheIndex != null) {
      parentComponent.renderCache[cacheIndex] = void 0;
    }
    if (shapeFlag & 256) {
      parentComponent.ctx.deactivate(vnode);
      return;
    }
    const shouldInvokeDirs = shapeFlag & 1 && dirs;
    const shouldInvokeVnodeHook = !isAsyncWrapper(vnode);
    let vnodeHook;
    if (shouldInvokeVnodeHook && (vnodeHook = props && props.onVnodeBeforeUnmount)) {
      invokeVNodeHook(vnodeHook, parentComponent, vnode);
    }
    if (shapeFlag & 6) {
      unmountComponent(vnode.component, parentSuspense, doRemove);
    } else {
      if (shapeFlag & 128) {
        vnode.suspense.unmount(parentSuspense, doRemove);
        return;
      }
      if (shouldInvokeDirs) {
        invokeDirectiveHook(vnode, null, parentComponent, "beforeUnmount");
      }
      if (shapeFlag & 64) {
        vnode.type.remove(
          vnode,
          parentComponent,
          parentSuspense,
          internals,
          doRemove
        );
      } else if (dynamicChildren && // #5154
      // when v-once is used inside a block, setBlockTracking(-1) marks the
      // parent block with hasOnce: true
      // so that it doesn't take the fast path during unmount - otherwise
      // components nested in v-once are never unmounted.
      !dynamicChildren.hasOnce && // #1153: fast path should not be taken for non-stable (v-for) fragments
      (type !== Fragment || patchFlag > 0 && patchFlag & 64)) {
        unmountChildren(
          dynamicChildren,
          parentComponent,
          parentSuspense,
          false,
          true
        );
      } else if (type === Fragment && patchFlag & (128 | 256) || !optimized && shapeFlag & 16) {
        unmountChildren(children, parentComponent, parentSuspense);
      }
      if (doRemove) {
        remove2(vnode);
      }
    }
    const shouldInvalidateMemo = memo != null && cacheIndex == null;
    if (shouldInvokeVnodeHook && (vnodeHook = props && props.onVnodeUnmounted) || shouldInvokeDirs || shouldInvalidateMemo) {
      queuePostRenderEffect(() => {
        vnodeHook && invokeVNodeHook(vnodeHook, parentComponent, vnode);
        shouldInvokeDirs && invokeDirectiveHook(vnode, null, parentComponent, "unmounted");
        if (shouldInvalidateMemo) {
          vnode.el = null;
        }
      }, parentSuspense);
    }
  };
  const remove2 = (vnode) => {
    const { type, el, anchor, transition } = vnode;
    if (type === Fragment) {
      {
        removeFragment(el, anchor);
      }
      return;
    }
    if (type === Static) {
      removeStaticNode(vnode);
      return;
    }
    const performRemove = () => {
      hostRemove(el);
      if (transition && !transition.persisted && transition.afterLeave) {
        transition.afterLeave();
      }
    };
    if (vnode.shapeFlag & 1 && transition && !transition.persisted) {
      const { leave, delayLeave } = transition;
      const performLeave = () => leave(el, performRemove);
      if (delayLeave) {
        delayLeave(vnode.el, performRemove, performLeave);
      } else {
        performLeave();
      }
    } else {
      performRemove();
    }
  };
  const removeFragment = (cur, end) => {
    let next;
    while (cur !== end) {
      next = hostNextSibling(cur);
      hostRemove(cur);
      cur = next;
    }
    hostRemove(end);
  };
  const unmountComponent = (instance, parentSuspense, doRemove) => {
    const { bum, scope, job, subTree, um, m, a } = instance;
    invalidateMount(m);
    invalidateMount(a);
    if (bum) {
      invokeArrayFns(bum);
    }
    scope.stop();
    if (job) {
      job.flags |= 8;
      unmount(subTree, instance, parentSuspense, doRemove);
    }
    if (um) {
      queuePostRenderEffect(um, parentSuspense);
    }
    queuePostRenderEffect(() => {
      instance.isUnmounted = true;
    }, parentSuspense);
  };
  const unmountChildren = (children, parentComponent, parentSuspense, doRemove = false, optimized = false, start = 0) => {
    for (let i = start; i < children.length; i++) {
      unmount(children[i], parentComponent, parentSuspense, doRemove, optimized);
    }
  };
  const getNextHostNode = (vnode) => {
    if (vnode.shapeFlag & 6) {
      return getNextHostNode(vnode.component.subTree);
    }
    if (vnode.shapeFlag & 128) {
      return vnode.suspense.next();
    }
    const el = hostNextSibling(vnode.anchor || vnode.el);
    const teleportEnd = el && el[TeleportEndKey];
    return teleportEnd ? hostNextSibling(teleportEnd) : el;
  };
  let isFlushing = false;
  const render2 = (vnode, container, namespace) => {
    let instance;
    if (vnode == null) {
      if (container._vnode) {
        unmount(container._vnode, null, null, true);
        instance = container._vnode.component;
      }
    } else {
      patch(
        container._vnode || null,
        vnode,
        container,
        null,
        null,
        null,
        namespace
      );
    }
    container._vnode = vnode;
    if (!isFlushing) {
      isFlushing = true;
      flushPreFlushCbs(instance);
      flushPostFlushCbs();
      isFlushing = false;
    }
  };
  const internals = {
    p: patch,
    um: unmount,
    m: move,
    r: remove2,
    mt: mountComponent,
    mc: mountChildren,
    pc: patchChildren,
    pbc: patchBlockChildren,
    n: getNextHostNode,
    o: options
  };
  let hydrate;
  return {
    render: render2,
    hydrate,
    createApp: createAppAPI(render2)
  };
}
function resolveChildrenNamespace({ type, props }, currentNamespace) {
  return currentNamespace === "svg" && type === "foreignObject" || currentNamespace === "mathml" && type === "annotation-xml" && props && props.encoding && props.encoding.includes("html") ? void 0 : currentNamespace;
}
function toggleRecurse({ effect: effect2, job }, allowed) {
  if (allowed) {
    effect2.flags |= 32;
    job.flags |= 4;
  } else {
    effect2.flags &= -33;
    job.flags &= -5;
  }
}
function needTransition(parentSuspense, transition) {
  return (!parentSuspense || parentSuspense && !parentSuspense.pendingBranch) && transition && !transition.persisted;
}
function traverseStaticChildren(n1, n2, shallow = false) {
  const ch1 = n1.children;
  const ch2 = n2.children;
  if (isArray$1(ch1) && isArray$1(ch2)) {
    for (let i = 0; i < ch1.length; i++) {
      const c1 = ch1[i];
      let c2 = ch2[i];
      if (c2.shapeFlag & 1 && !c2.dynamicChildren) {
        if (c2.patchFlag <= 0 || c2.patchFlag === 32) {
          c2 = ch2[i] = cloneIfMounted(ch2[i]);
          c2.el = c1.el;
        }
        if (!shallow && c2.patchFlag !== -2)
          traverseStaticChildren(c1, c2);
      }
      if (c2.type === Text) {
        if (c2.patchFlag === -1) {
          c2 = ch2[i] = cloneIfMounted(c2);
        }
        c2.el = c1.el;
      }
      if (c2.type === Comment && !c2.el) {
        c2.el = c1.el;
      }
    }
  }
}
function getSequence(arr) {
  const p2 = arr.slice();
  const result = [0];
  let i, j, u, v, c;
  const len = arr.length;
  for (i = 0; i < len; i++) {
    const arrI = arr[i];
    if (arrI !== 0) {
      j = result[result.length - 1];
      if (arr[j] < arrI) {
        p2[i] = j;
        result.push(i);
        continue;
      }
      u = 0;
      v = result.length - 1;
      while (u < v) {
        c = u + v >> 1;
        if (arr[result[c]] < arrI) {
          u = c + 1;
        } else {
          v = c;
        }
      }
      if (arrI < arr[result[u]]) {
        if (u > 0) {
          p2[i] = result[u - 1];
        }
        result[u] = i;
      }
    }
  }
  u = result.length;
  v = result[u - 1];
  while (u-- > 0) {
    result[u] = v;
    v = p2[v];
  }
  return result;
}
function locateNonHydratedAsyncRoot(instance) {
  const subComponent = instance.subTree.component;
  if (subComponent) {
    if (subComponent.asyncDep && !subComponent.asyncResolved) {
      return subComponent;
    } else {
      return locateNonHydratedAsyncRoot(subComponent);
    }
  }
}
function invalidateMount(hooks) {
  if (hooks) {
    for (let i = 0; i < hooks.length; i++)
      hooks[i].flags |= 8;
  }
}
function resolveAsyncComponentPlaceholder(anchorVnode) {
  if (anchorVnode.placeholder) {
    return anchorVnode.placeholder;
  }
  const instance = anchorVnode.component;
  if (instance) {
    return resolveAsyncComponentPlaceholder(instance.subTree);
  }
  return null;
}
const isSuspense = (type) => type.__isSuspense;
function queueEffectWithSuspense(fn, suspense) {
  if (suspense && suspense.pendingBranch) {
    if (isArray$1(fn)) {
      suspense.effects.push(...fn);
    } else {
      suspense.effects.push(fn);
    }
  } else {
    queuePostFlushCb(fn);
  }
}
const Fragment = /* @__PURE__ */ Symbol.for("v-fgt");
const Text = /* @__PURE__ */ Symbol.for("v-txt");
const Comment = /* @__PURE__ */ Symbol.for("v-cmt");
const Static = /* @__PURE__ */ Symbol.for("v-stc");
const blockStack = [];
let currentBlock = null;
function openBlock(disableTracking = false) {
  blockStack.push(currentBlock = disableTracking ? null : []);
}
function closeBlock() {
  blockStack.pop();
  currentBlock = blockStack[blockStack.length - 1] || null;
}
let isBlockTreeEnabled = 1;
function setBlockTracking(value, inVOnce = false) {
  isBlockTreeEnabled += value;
  if (value < 0 && currentBlock && inVOnce) {
    currentBlock.hasOnce = true;
  }
}
function setupBlock(vnode) {
  vnode.dynamicChildren = isBlockTreeEnabled > 0 ? currentBlock || EMPTY_ARR : null;
  closeBlock();
  if (isBlockTreeEnabled > 0 && currentBlock) {
    currentBlock.push(vnode);
  }
  return vnode;
}
function createElementBlock(type, props, children, patchFlag, dynamicProps, shapeFlag) {
  return setupBlock(
    createBaseVNode(
      type,
      props,
      children,
      patchFlag,
      dynamicProps,
      shapeFlag,
      true
    )
  );
}
function createBlock(type, props, children, patchFlag, dynamicProps) {
  return setupBlock(
    createVNode(
      type,
      props,
      children,
      patchFlag,
      dynamicProps,
      true
    )
  );
}
function isVNode(value) {
  return value ? value.__v_isVNode === true : false;
}
function isSameVNodeType(n1, n2) {
  return n1.type === n2.type && n1.key === n2.key;
}
const normalizeKey = ({ key }) => key != null ? key : null;
const normalizeRef = ({
  ref: ref3,
  ref_key,
  ref_for
}) => {
  if (typeof ref3 === "number") {
    ref3 = "" + ref3;
  }
  return ref3 != null ? isString(ref3) || /* @__PURE__ */ isRef(ref3) || isFunction$1(ref3) ? { i: currentRenderingInstance, r: ref3, k: ref_key, f: !!ref_for } : ref3 : null;
};
function createBaseVNode(type, props = null, children = null, patchFlag = 0, dynamicProps = null, shapeFlag = type === Fragment ? 0 : 1, isBlockNode = false, needFullChildrenNormalization = false) {
  const vnode = {
    __v_isVNode: true,
    __v_skip: true,
    type,
    props,
    key: props && normalizeKey(props),
    ref: props && normalizeRef(props),
    scopeId: currentScopeId,
    slotScopeIds: null,
    children,
    component: null,
    suspense: null,
    ssContent: null,
    ssFallback: null,
    dirs: null,
    transition: null,
    el: null,
    anchor: null,
    target: null,
    targetStart: null,
    targetAnchor: null,
    staticCount: 0,
    shapeFlag,
    patchFlag,
    dynamicProps,
    dynamicChildren: null,
    appContext: null,
    ctx: currentRenderingInstance
  };
  if (needFullChildrenNormalization) {
    normalizeChildren(vnode, children);
    if (shapeFlag & 128) {
      type.normalize(vnode);
    }
  } else if (children) {
    vnode.shapeFlag |= isString(children) ? 8 : 16;
  }
  if (isBlockTreeEnabled > 0 && // avoid a block node from tracking itself
  !isBlockNode && // has current parent block
  currentBlock && // presence of a patch flag indicates this node needs patching on updates.
  // component nodes also should always be patched, because even if the
  // component doesn't need to update, it needs to persist the instance on to
  // the next vnode so that it can be properly unmounted later.
  (vnode.patchFlag > 0 || shapeFlag & 6) && // the EVENTS flag is only for hydration and if it is the only flag, the
  // vnode should not be considered dynamic due to handler caching.
  vnode.patchFlag !== 32) {
    currentBlock.push(vnode);
  }
  return vnode;
}
const createVNode = _createVNode;
function _createVNode(type, props = null, children = null, patchFlag = 0, dynamicProps = null, isBlockNode = false) {
  if (!type || type === NULL_DYNAMIC_COMPONENT) {
    type = Comment;
  }
  if (isVNode(type)) {
    const cloned = cloneVNode(
      type,
      props,
      true
      /* mergeRef: true */
    );
    if (children) {
      normalizeChildren(cloned, children);
    }
    if (isBlockTreeEnabled > 0 && !isBlockNode && currentBlock) {
      if (cloned.shapeFlag & 6) {
        currentBlock[currentBlock.indexOf(type)] = cloned;
      } else {
        currentBlock.push(cloned);
      }
    }
    cloned.patchFlag = -2;
    return cloned;
  }
  if (isClassComponent(type)) {
    type = type.__vccOpts;
  }
  if (props) {
    props = guardReactiveProps(props);
    let { class: klass, style } = props;
    if (klass && !isString(klass)) {
      props.class = normalizeClass(klass);
    }
    if (isObject$2(style)) {
      if (/* @__PURE__ */ isProxy(style) && !isArray$1(style)) {
        style = extend({}, style);
      }
      props.style = normalizeStyle(style);
    }
  }
  const shapeFlag = isString(type) ? 1 : isSuspense(type) ? 128 : isTeleport(type) ? 64 : isObject$2(type) ? 4 : isFunction$1(type) ? 2 : 0;
  return createBaseVNode(
    type,
    props,
    children,
    patchFlag,
    dynamicProps,
    shapeFlag,
    isBlockNode,
    true
  );
}
function guardReactiveProps(props) {
  if (!props) return null;
  return /* @__PURE__ */ isProxy(props) || isInternalObject(props) ? extend({}, props) : props;
}
function cloneVNode(vnode, extraProps, mergeRef = false, cloneTransition = false) {
  const { props, ref: ref3, patchFlag, children, transition } = vnode;
  const mergedProps = extraProps ? mergeProps(props || {}, extraProps) : props;
  const cloned = {
    __v_isVNode: true,
    __v_skip: true,
    type: vnode.type,
    props: mergedProps,
    key: mergedProps && normalizeKey(mergedProps),
    ref: extraProps && extraProps.ref ? (
      // #2078 in the case of <component :is="vnode" ref="extra"/>
      // if the vnode itself already has a ref, cloneVNode will need to merge
      // the refs so the single vnode can be set on multiple refs
      mergeRef && ref3 ? isArray$1(ref3) ? ref3.concat(normalizeRef(extraProps)) : [ref3, normalizeRef(extraProps)] : normalizeRef(extraProps)
    ) : ref3,
    scopeId: vnode.scopeId,
    slotScopeIds: vnode.slotScopeIds,
    children,
    target: vnode.target,
    targetStart: vnode.targetStart,
    targetAnchor: vnode.targetAnchor,
    staticCount: vnode.staticCount,
    shapeFlag: vnode.shapeFlag,
    // if the vnode is cloned with extra props, we can no longer assume its
    // existing patch flag to be reliable and need to add the FULL_PROPS flag.
    // note: preserve flag for fragments since they use the flag for children
    // fast paths only.
    patchFlag: extraProps && vnode.type !== Fragment ? patchFlag === -1 ? 16 : patchFlag | 16 : patchFlag,
    dynamicProps: vnode.dynamicProps,
    dynamicChildren: vnode.dynamicChildren,
    appContext: vnode.appContext,
    dirs: vnode.dirs,
    transition,
    // These should technically only be non-null on mounted VNodes. However,
    // they *should* be copied for kept-alive vnodes. So we just always copy
    // them since them being non-null during a mount doesn't affect the logic as
    // they will simply be overwritten.
    component: vnode.component,
    suspense: vnode.suspense,
    ssContent: vnode.ssContent && cloneVNode(vnode.ssContent),
    ssFallback: vnode.ssFallback && cloneVNode(vnode.ssFallback),
    placeholder: vnode.placeholder,
    el: vnode.el,
    anchor: vnode.anchor,
    ctx: vnode.ctx,
    ce: vnode.ce
  };
  if (transition && cloneTransition) {
    setTransitionHooks(
      cloned,
      transition.clone(cloned)
    );
  }
  return cloned;
}
function createTextVNode(text = " ", flag = 0) {
  return createVNode(Text, null, text, flag);
}
function createStaticVNode(content, numberOfNodes) {
  const vnode = createVNode(Static, null, content);
  vnode.staticCount = numberOfNodes;
  return vnode;
}
function createCommentVNode(text = "", asBlock = false) {
  return asBlock ? (openBlock(), createBlock(Comment, null, text)) : createVNode(Comment, null, text);
}
function normalizeVNode(child) {
  if (child == null || typeof child === "boolean") {
    return createVNode(Comment);
  } else if (isArray$1(child)) {
    return createVNode(
      Fragment,
      null,
      // #3666, avoid reference pollution when reusing vnode
      child.slice()
    );
  } else if (isVNode(child)) {
    return cloneIfMounted(child);
  } else {
    return createVNode(Text, null, String(child));
  }
}
function cloneIfMounted(child) {
  return child.el === null && child.patchFlag !== -1 || child.memo ? child : cloneVNode(child);
}
function normalizeChildren(vnode, children) {
  let type = 0;
  const { shapeFlag } = vnode;
  if (children == null) {
    children = null;
  } else if (isArray$1(children)) {
    type = 16;
  } else if (typeof children === "object") {
    if (shapeFlag & (1 | 64)) {
      const slot = children.default;
      if (slot) {
        slot._c && (slot._d = false);
        normalizeChildren(vnode, slot());
        slot._c && (slot._d = true);
      }
      return;
    } else {
      type = 32;
      const slotFlag = children._;
      if (!slotFlag && !isInternalObject(children)) {
        children._ctx = currentRenderingInstance;
      } else if (slotFlag === 3 && currentRenderingInstance) {
        if (currentRenderingInstance.slots._ === 1) {
          children._ = 1;
        } else {
          children._ = 2;
          vnode.patchFlag |= 1024;
        }
      }
    }
  } else if (isFunction$1(children)) {
    children = { default: children, _ctx: currentRenderingInstance };
    type = 32;
  } else {
    children = String(children);
    if (shapeFlag & 64) {
      type = 16;
      children = [createTextVNode(children)];
    } else {
      type = 8;
    }
  }
  vnode.children = children;
  vnode.shapeFlag |= type;
}
function mergeProps(...args) {
  const ret = {};
  for (let i = 0; i < args.length; i++) {
    const toMerge = args[i];
    for (const key in toMerge) {
      if (key === "class") {
        if (ret.class !== toMerge.class) {
          ret.class = normalizeClass([ret.class, toMerge.class]);
        }
      } else if (key === "style") {
        ret.style = normalizeStyle([ret.style, toMerge.style]);
      } else if (isOn(key)) {
        const existing = ret[key];
        const incoming = toMerge[key];
        if (incoming && existing !== incoming && !(isArray$1(existing) && existing.includes(incoming))) {
          ret[key] = existing ? [].concat(existing, incoming) : incoming;
        } else if (incoming == null && existing == null && // mergeProps({ 'onUpdate:modelValue': undefined }) should not retain
        // the model listener.
        !isModelListener(key)) {
          ret[key] = incoming;
        }
      } else if (key !== "") {
        ret[key] = toMerge[key];
      }
    }
  }
  return ret;
}
function invokeVNodeHook(hook, instance, vnode, prevVNode = null) {
  callWithAsyncErrorHandling(hook, instance, 7, [
    vnode,
    prevVNode
  ]);
}
const emptyAppContext = createAppContext();
let uid = 0;
function createComponentInstance(vnode, parent, suspense) {
  const type = vnode.type;
  const appContext = (parent ? parent.appContext : vnode.appContext) || emptyAppContext;
  const instance = {
    uid: uid++,
    vnode,
    type,
    parent,
    appContext,
    root: null,
    // to be immediately set
    next: null,
    subTree: null,
    // will be set synchronously right after creation
    effect: null,
    update: null,
    // will be set synchronously right after creation
    job: null,
    scope: new EffectScope(
      true
      /* detached */
    ),
    render: null,
    proxy: null,
    exposed: null,
    exposeProxy: null,
    withProxy: null,
    provides: parent ? parent.provides : Object.create(appContext.provides),
    ids: parent ? parent.ids : ["", 0, 0],
    accessCache: null,
    renderCache: [],
    // local resolved assets
    components: null,
    directives: null,
    // resolved props and emits options
    propsOptions: normalizePropsOptions(type, appContext),
    emitsOptions: normalizeEmitsOptions(type, appContext),
    // emit
    emit: null,
    // to be set immediately
    emitted: null,
    // props default value
    propsDefaults: EMPTY_OBJ,
    // inheritAttrs
    inheritAttrs: type.inheritAttrs,
    // state
    ctx: EMPTY_OBJ,
    data: EMPTY_OBJ,
    props: EMPTY_OBJ,
    attrs: EMPTY_OBJ,
    slots: EMPTY_OBJ,
    refs: EMPTY_OBJ,
    setupState: EMPTY_OBJ,
    setupContext: null,
    // suspense related
    suspense,
    suspenseId: suspense ? suspense.pendingId : 0,
    asyncDep: null,
    asyncResolved: false,
    // lifecycle hooks
    // not using enums here because it results in computed properties
    isMounted: false,
    isUnmounted: false,
    isDeactivated: false,
    bc: null,
    c: null,
    bm: null,
    m: null,
    bu: null,
    u: null,
    um: null,
    bum: null,
    da: null,
    a: null,
    rtg: null,
    rtc: null,
    ec: null,
    sp: null
  };
  {
    instance.ctx = { _: instance };
  }
  instance.root = parent ? parent.root : instance;
  instance.emit = emit.bind(null, instance);
  if (vnode.ce) {
    vnode.ce(instance);
  }
  return instance;
}
let currentInstance = null;
const getCurrentInstance = () => currentInstance || currentRenderingInstance;
let internalSetCurrentInstance;
let setInSSRSetupState;
{
  const g = getGlobalThis();
  const registerGlobalSetter = (key, setter) => {
    let setters;
    if (!(setters = g[key])) setters = g[key] = [];
    setters.push(setter);
    return (v) => {
      if (setters.length > 1) setters.forEach((set2) => set2(v));
      else setters[0](v);
    };
  };
  internalSetCurrentInstance = registerGlobalSetter(
    `__VUE_INSTANCE_SETTERS__`,
    (v) => currentInstance = v
  );
  setInSSRSetupState = registerGlobalSetter(
    `__VUE_SSR_SETTERS__`,
    (v) => isInSSRComponentSetup = v
  );
}
const setCurrentInstance = (instance) => {
  const prev = currentInstance;
  internalSetCurrentInstance(instance);
  instance.scope.on();
  return () => {
    instance.scope.off();
    internalSetCurrentInstance(prev);
  };
};
const unsetCurrentInstance = () => {
  currentInstance && currentInstance.scope.off();
  internalSetCurrentInstance(null);
};
function isStatefulComponent(instance) {
  return instance.vnode.shapeFlag & 4;
}
let isInSSRComponentSetup = false;
function setupComponent(instance, isSSR = false, optimized = false) {
  isSSR && setInSSRSetupState(isSSR);
  const { props, children } = instance.vnode;
  const isStateful = isStatefulComponent(instance);
  initProps(instance, props, isStateful, isSSR);
  initSlots(instance, children, optimized || isSSR);
  const setupResult = isStateful ? setupStatefulComponent(instance, isSSR) : void 0;
  isSSR && setInSSRSetupState(false);
  return setupResult;
}
function setupStatefulComponent(instance, isSSR) {
  const Component = instance.type;
  instance.accessCache = /* @__PURE__ */ Object.create(null);
  instance.proxy = new Proxy(instance.ctx, PublicInstanceProxyHandlers);
  const { setup } = Component;
  if (setup) {
    pauseTracking();
    const setupContext = instance.setupContext = setup.length > 1 ? createSetupContext(instance) : null;
    const reset = setCurrentInstance(instance);
    const setupResult = callWithErrorHandling(
      setup,
      instance,
      0,
      [
        instance.props,
        setupContext
      ]
    );
    const isAsyncSetup = isPromise(setupResult);
    resetTracking();
    reset();
    if ((isAsyncSetup || instance.sp) && !isAsyncWrapper(instance)) {
      markAsyncBoundary(instance);
    }
    if (isAsyncSetup) {
      setupResult.then(unsetCurrentInstance, unsetCurrentInstance);
      if (isSSR) {
        return setupResult.then((resolvedResult) => {
          handleSetupResult(instance, resolvedResult);
        }).catch((e) => {
          handleError(e, instance, 0);
        });
      } else {
        instance.asyncDep = setupResult;
      }
    } else {
      handleSetupResult(instance, setupResult);
    }
  } else {
    finishComponentSetup(instance);
  }
}
function handleSetupResult(instance, setupResult, isSSR) {
  if (isFunction$1(setupResult)) {
    if (instance.type.__ssrInlineRender) {
      instance.ssrRender = setupResult;
    } else {
      instance.render = setupResult;
    }
  } else if (isObject$2(setupResult)) {
    instance.setupState = proxyRefs(setupResult);
  } else ;
  finishComponentSetup(instance);
}
function finishComponentSetup(instance, isSSR, skipOptions) {
  const Component = instance.type;
  if (!instance.render) {
    instance.render = Component.render || NOOP;
  }
  {
    const reset = setCurrentInstance(instance);
    pauseTracking();
    try {
      applyOptions(instance);
    } finally {
      resetTracking();
      reset();
    }
  }
}
const attrsProxyHandlers = {
  get(target, key) {
    track(target, "get", "");
    return target[key];
  }
};
function createSetupContext(instance) {
  const expose = (exposed) => {
    instance.exposed = exposed || {};
  };
  {
    return {
      attrs: new Proxy(instance.attrs, attrsProxyHandlers),
      slots: instance.slots,
      emit: instance.emit,
      expose
    };
  }
}
function getComponentPublicInstance(instance) {
  if (instance.exposed) {
    return instance.exposeProxy || (instance.exposeProxy = new Proxy(proxyRefs(markRaw(instance.exposed)), {
      get(target, key) {
        if (key in target) {
          return target[key];
        } else if (key in publicPropertiesMap) {
          return publicPropertiesMap[key](instance);
        }
      },
      has(target, key) {
        return key in target || key in publicPropertiesMap;
      }
    }));
  } else {
    return instance.proxy;
  }
}
const classifyRE = /(?:^|[-_])\w/g;
const classify = (str) => str.replace(classifyRE, (c) => c.toUpperCase()).replace(/[-_]/g, "");
function getComponentName(Component, includeInferred = true) {
  return isFunction$1(Component) ? Component.displayName || Component.name : Component.name || includeInferred && Component.__name;
}
function formatComponentName(instance, Component, isRoot = false) {
  let name = getComponentName(Component);
  if (!name && Component.__file) {
    const match = Component.__file.match(/([^/\\]+)\.\w+$/);
    if (match) {
      name = match[1];
    }
  }
  if (!name && instance) {
    const inferFromRegistry = (registry) => {
      for (const key in registry) {
        if (registry[key] === Component) {
          return key;
        }
      }
    };
    name = inferFromRegistry(instance.components) || instance.parent && inferFromRegistry(
      instance.parent.type.components
    ) || inferFromRegistry(instance.appContext.components);
  }
  return name ? classify(name) : isRoot ? `App` : `Anonymous`;
}
function isClassComponent(value) {
  return isFunction$1(value) && "__vccOpts" in value;
}
const computed = (getterOrOptions, debugOptions) => {
  const c = /* @__PURE__ */ computed$1(getterOrOptions, debugOptions, isInSSRComponentSetup);
  return c;
};
function h(type, propsOrChildren, children) {
  try {
    setBlockTracking(-1);
    const l = arguments.length;
    if (l === 2) {
      if (isObject$2(propsOrChildren) && !isArray$1(propsOrChildren)) {
        if (isVNode(propsOrChildren)) {
          return createVNode(type, null, [propsOrChildren]);
        }
        return createVNode(type, propsOrChildren);
      } else {
        return createVNode(type, null, propsOrChildren);
      }
    } else {
      if (l > 3) {
        children = Array.prototype.slice.call(arguments, 2);
      } else if (l === 3 && isVNode(children)) {
        children = [children];
      }
      return createVNode(type, propsOrChildren, children);
    }
  } finally {
    setBlockTracking(1);
  }
}
const version = "3.5.34";
const warn = NOOP;
let policy = void 0;
const tt = typeof window !== "undefined" && window.trustedTypes;
if (tt) {
  try {
    policy = /* @__PURE__ */ tt.createPolicy("vue", {
      createHTML: (val) => val
    });
  } catch (e) {
  }
}
const unsafeToTrustedHTML = policy ? (val) => policy.createHTML(val) : (val) => val;
const svgNS = "http://www.w3.org/2000/svg";
const mathmlNS = "http://www.w3.org/1998/Math/MathML";
const doc = typeof document !== "undefined" ? document : null;
const templateContainer = doc && /* @__PURE__ */ doc.createElement("template");
const nodeOps = {
  insert: (child, parent, anchor) => {
    parent.insertBefore(child, anchor || null);
  },
  remove: (child) => {
    const parent = child.parentNode;
    if (parent) {
      parent.removeChild(child);
    }
  },
  createElement: (tag, namespace, is, props) => {
    const el = namespace === "svg" ? doc.createElementNS(svgNS, tag) : namespace === "mathml" ? doc.createElementNS(mathmlNS, tag) : is ? doc.createElement(tag, { is }) : doc.createElement(tag);
    if (tag === "select" && props && props.multiple != null) {
      el.setAttribute("multiple", props.multiple);
    }
    return el;
  },
  createText: (text) => doc.createTextNode(text),
  createComment: (text) => doc.createComment(text),
  setText: (node, text) => {
    node.nodeValue = text;
  },
  setElementText: (el, text) => {
    el.textContent = text;
  },
  parentNode: (node) => node.parentNode,
  nextSibling: (node) => node.nextSibling,
  querySelector: (selector) => doc.querySelector(selector),
  setScopeId(el, id) {
    el.setAttribute(id, "");
  },
  // __UNSAFE__
  // Reason: innerHTML.
  // Static content here can only come from compiled templates.
  // As long as the user only uses trusted templates, this is safe.
  insertStaticContent(content, parent, anchor, namespace, start, end) {
    const before = anchor ? anchor.previousSibling : parent.lastChild;
    if (start && (start === end || start.nextSibling)) {
      while (true) {
        parent.insertBefore(start.cloneNode(true), anchor);
        if (start === end || !(start = start.nextSibling)) break;
      }
    } else {
      templateContainer.innerHTML = unsafeToTrustedHTML(
        namespace === "svg" ? `<svg>${content}</svg>` : namespace === "mathml" ? `<math>${content}</math>` : content
      );
      const template = templateContainer.content;
      if (namespace === "svg" || namespace === "mathml") {
        const wrapper = template.firstChild;
        while (wrapper.firstChild) {
          template.appendChild(wrapper.firstChild);
        }
        template.removeChild(wrapper);
      }
      parent.insertBefore(template, anchor);
    }
    return [
      // first
      before ? before.nextSibling : parent.firstChild,
      // last
      anchor ? anchor.previousSibling : parent.lastChild
    ];
  }
};
const TRANSITION = "transition";
const ANIMATION = "animation";
const vtcKey = /* @__PURE__ */ Symbol("_vtc");
const DOMTransitionPropsValidators = {
  name: String,
  type: String,
  css: {
    type: Boolean,
    default: true
  },
  duration: [String, Number, Object],
  enterFromClass: String,
  enterActiveClass: String,
  enterToClass: String,
  appearFromClass: String,
  appearActiveClass: String,
  appearToClass: String,
  leaveFromClass: String,
  leaveActiveClass: String,
  leaveToClass: String
};
const TransitionPropsValidators = /* @__PURE__ */ extend(
  {},
  BaseTransitionPropsValidators,
  DOMTransitionPropsValidators
);
const decorate$1 = (t) => {
  t.displayName = "Transition";
  t.props = TransitionPropsValidators;
  return t;
};
const Transition = /* @__PURE__ */ decorate$1(
  (props, { slots }) => h(BaseTransition, resolveTransitionProps(props), slots)
);
const callHook = (hook, args = []) => {
  if (isArray$1(hook)) {
    hook.forEach((h2) => h2(...args));
  } else if (hook) {
    hook(...args);
  }
};
const hasExplicitCallback = (hook) => {
  return hook ? isArray$1(hook) ? hook.some((h2) => h2.length > 1) : hook.length > 1 : false;
};
function resolveTransitionProps(rawProps) {
  const baseProps = {};
  for (const key in rawProps) {
    if (!(key in DOMTransitionPropsValidators)) {
      baseProps[key] = rawProps[key];
    }
  }
  if (rawProps.css === false) {
    return baseProps;
  }
  const {
    name = "v",
    type,
    duration,
    enterFromClass = `${name}-enter-from`,
    enterActiveClass = `${name}-enter-active`,
    enterToClass = `${name}-enter-to`,
    appearFromClass = enterFromClass,
    appearActiveClass = enterActiveClass,
    appearToClass = enterToClass,
    leaveFromClass = `${name}-leave-from`,
    leaveActiveClass = `${name}-leave-active`,
    leaveToClass = `${name}-leave-to`
  } = rawProps;
  const durations = normalizeDuration(duration);
  const enterDuration = durations && durations[0];
  const leaveDuration = durations && durations[1];
  const {
    onBeforeEnter,
    onEnter,
    onEnterCancelled,
    onLeave,
    onLeaveCancelled,
    onBeforeAppear = onBeforeEnter,
    onAppear = onEnter,
    onAppearCancelled = onEnterCancelled
  } = baseProps;
  const finishEnter = (el, isAppear, done, isCancelled) => {
    el._enterCancelled = isCancelled;
    removeTransitionClass(el, isAppear ? appearToClass : enterToClass);
    removeTransitionClass(el, isAppear ? appearActiveClass : enterActiveClass);
    done && done();
  };
  const finishLeave = (el, done) => {
    el._isLeaving = false;
    removeTransitionClass(el, leaveFromClass);
    removeTransitionClass(el, leaveToClass);
    removeTransitionClass(el, leaveActiveClass);
    done && done();
  };
  const makeEnterHook = (isAppear) => {
    return (el, done) => {
      const hook = isAppear ? onAppear : onEnter;
      const resolve2 = () => finishEnter(el, isAppear, done);
      callHook(hook, [el, resolve2]);
      nextFrame(() => {
        removeTransitionClass(el, isAppear ? appearFromClass : enterFromClass);
        addTransitionClass(el, isAppear ? appearToClass : enterToClass);
        if (!hasExplicitCallback(hook)) {
          whenTransitionEnds(el, type, enterDuration, resolve2);
        }
      });
    };
  };
  return extend(baseProps, {
    onBeforeEnter(el) {
      callHook(onBeforeEnter, [el]);
      addTransitionClass(el, enterFromClass);
      addTransitionClass(el, enterActiveClass);
    },
    onBeforeAppear(el) {
      callHook(onBeforeAppear, [el]);
      addTransitionClass(el, appearFromClass);
      addTransitionClass(el, appearActiveClass);
    },
    onEnter: makeEnterHook(false),
    onAppear: makeEnterHook(true),
    onLeave(el, done) {
      el._isLeaving = true;
      const resolve2 = () => finishLeave(el, done);
      addTransitionClass(el, leaveFromClass);
      if (!el._enterCancelled) {
        forceReflow(el);
        addTransitionClass(el, leaveActiveClass);
      } else {
        addTransitionClass(el, leaveActiveClass);
        forceReflow(el);
      }
      nextFrame(() => {
        if (!el._isLeaving) {
          return;
        }
        removeTransitionClass(el, leaveFromClass);
        addTransitionClass(el, leaveToClass);
        if (!hasExplicitCallback(onLeave)) {
          whenTransitionEnds(el, type, leaveDuration, resolve2);
        }
      });
      callHook(onLeave, [el, resolve2]);
    },
    onEnterCancelled(el) {
      finishEnter(el, false, void 0, true);
      callHook(onEnterCancelled, [el]);
    },
    onAppearCancelled(el) {
      finishEnter(el, true, void 0, true);
      callHook(onAppearCancelled, [el]);
    },
    onLeaveCancelled(el) {
      finishLeave(el);
      callHook(onLeaveCancelled, [el]);
    }
  });
}
function normalizeDuration(duration) {
  if (duration == null) {
    return null;
  } else if (isObject$2(duration)) {
    return [NumberOf(duration.enter), NumberOf(duration.leave)];
  } else {
    const n = NumberOf(duration);
    return [n, n];
  }
}
function NumberOf(val) {
  const res = toNumber(val);
  return res;
}
function addTransitionClass(el, cls) {
  cls.split(/\s+/).forEach((c) => c && el.classList.add(c));
  (el[vtcKey] || (el[vtcKey] = /* @__PURE__ */ new Set())).add(cls);
}
function removeTransitionClass(el, cls) {
  cls.split(/\s+/).forEach((c) => c && el.classList.remove(c));
  const _vtc = el[vtcKey];
  if (_vtc) {
    _vtc.delete(cls);
    if (!_vtc.size) {
      el[vtcKey] = void 0;
    }
  }
}
function nextFrame(cb) {
  requestAnimationFrame(() => {
    requestAnimationFrame(cb);
  });
}
let endId = 0;
function whenTransitionEnds(el, expectedType, explicitTimeout, resolve2) {
  const id = el._endId = ++endId;
  const resolveIfNotStale = () => {
    if (id === el._endId) {
      resolve2();
    }
  };
  if (explicitTimeout != null) {
    return setTimeout(resolveIfNotStale, explicitTimeout);
  }
  const { type, timeout, propCount } = getTransitionInfo(el, expectedType);
  if (!type) {
    return resolve2();
  }
  const endEvent = type + "end";
  let ended = 0;
  const end = () => {
    el.removeEventListener(endEvent, onEnd);
    resolveIfNotStale();
  };
  const onEnd = (e) => {
    if (e.target === el && ++ended >= propCount) {
      end();
    }
  };
  setTimeout(() => {
    if (ended < propCount) {
      end();
    }
  }, timeout + 1);
  el.addEventListener(endEvent, onEnd);
}
function getTransitionInfo(el, expectedType) {
  const styles = window.getComputedStyle(el);
  const getStyleProperties = (key) => (styles[key] || "").split(", ");
  const transitionDelays = getStyleProperties(`${TRANSITION}Delay`);
  const transitionDurations = getStyleProperties(`${TRANSITION}Duration`);
  const transitionTimeout = getTimeout(transitionDelays, transitionDurations);
  const animationDelays = getStyleProperties(`${ANIMATION}Delay`);
  const animationDurations = getStyleProperties(`${ANIMATION}Duration`);
  const animationTimeout = getTimeout(animationDelays, animationDurations);
  let type = null;
  let timeout = 0;
  let propCount = 0;
  if (expectedType === TRANSITION) {
    if (transitionTimeout > 0) {
      type = TRANSITION;
      timeout = transitionTimeout;
      propCount = transitionDurations.length;
    }
  } else if (expectedType === ANIMATION) {
    if (animationTimeout > 0) {
      type = ANIMATION;
      timeout = animationTimeout;
      propCount = animationDurations.length;
    }
  } else {
    timeout = Math.max(transitionTimeout, animationTimeout);
    type = timeout > 0 ? transitionTimeout > animationTimeout ? TRANSITION : ANIMATION : null;
    propCount = type ? type === TRANSITION ? transitionDurations.length : animationDurations.length : 0;
  }
  const hasTransform = type === TRANSITION && /\b(?:transform|all)(?:,|$)/.test(
    getStyleProperties(`${TRANSITION}Property`).toString()
  );
  return {
    type,
    timeout,
    propCount,
    hasTransform
  };
}
function getTimeout(delays, durations) {
  while (delays.length < durations.length) {
    delays = delays.concat(delays);
  }
  return Math.max(...durations.map((d, i) => toMs(d) + toMs(delays[i])));
}
function toMs(s) {
  if (s === "auto") return 0;
  return Number(s.slice(0, -1).replace(",", ".")) * 1e3;
}
function forceReflow(el) {
  const targetDocument = el ? el.ownerDocument : document;
  return targetDocument.body.offsetHeight;
}
function patchClass(el, value, isSVG) {
  const transitionClasses = el[vtcKey];
  if (transitionClasses) {
    value = (value ? [value, ...transitionClasses] : [...transitionClasses]).join(" ");
  }
  if (value == null) {
    el.removeAttribute("class");
  } else if (isSVG) {
    el.setAttribute("class", value);
  } else {
    el.className = value;
  }
}
const vShowOriginalDisplay = /* @__PURE__ */ Symbol("_vod");
const vShowHidden = /* @__PURE__ */ Symbol("_vsh");
const vShow = {
  // used for prop mismatch check during hydration
  name: "show",
  beforeMount(el, { value }, { transition }) {
    el[vShowOriginalDisplay] = el.style.display === "none" ? "" : el.style.display;
    if (transition && value) {
      transition.beforeEnter(el);
    } else {
      setDisplay(el, value);
    }
  },
  mounted(el, { value }, { transition }) {
    if (transition && value) {
      transition.enter(el);
    }
  },
  updated(el, { value, oldValue }, { transition }) {
    if (!value === !oldValue) return;
    if (transition) {
      if (value) {
        transition.beforeEnter(el);
        setDisplay(el, true);
        transition.enter(el);
      } else {
        transition.leave(el, () => {
          setDisplay(el, false);
        });
      }
    } else {
      setDisplay(el, value);
    }
  },
  beforeUnmount(el, { value }) {
    setDisplay(el, value);
  }
};
function setDisplay(el, value) {
  el.style.display = value ? el[vShowOriginalDisplay] : "none";
  el[vShowHidden] = !value;
}
const CSS_VAR_TEXT = /* @__PURE__ */ Symbol("");
const displayRE = /(?:^|;)\s*display\s*:/;
function patchStyle(el, prev, next) {
  const style = el.style;
  const isCssString = isString(next);
  let hasControlledDisplay = false;
  if (next && !isCssString) {
    if (prev) {
      if (!isString(prev)) {
        for (const key in prev) {
          if (next[key] == null) {
            setStyle$1(style, key, "");
          }
        }
      } else {
        for (const prevStyle of prev.split(";")) {
          const key = prevStyle.slice(0, prevStyle.indexOf(":")).trim();
          if (next[key] == null) {
            setStyle$1(style, key, "");
          }
        }
      }
    }
    for (const key in next) {
      if (key === "display") {
        hasControlledDisplay = true;
      }
      const value = next[key];
      if (value != null) {
        if (!shouldPreserveTextareaResizeStyle(
          el,
          key,
          !isString(prev) && prev ? prev[key] : void 0,
          value
        )) {
          setStyle$1(style, key, value);
        }
      } else {
        setStyle$1(style, key, "");
      }
    }
  } else {
    if (isCssString) {
      if (prev !== next) {
        const cssVarText = style[CSS_VAR_TEXT];
        if (cssVarText) {
          next += ";" + cssVarText;
        }
        style.cssText = next;
        hasControlledDisplay = displayRE.test(next);
      }
    } else if (prev) {
      el.removeAttribute("style");
    }
  }
  if (vShowOriginalDisplay in el) {
    el[vShowOriginalDisplay] = hasControlledDisplay ? style.display : "";
    if (el[vShowHidden]) {
      style.display = "none";
    }
  }
}
const importantRE = /\s*!important$/;
function setStyle$1(style, name, val) {
  if (isArray$1(val)) {
    val.forEach((v) => setStyle$1(style, name, v));
  } else {
    if (val == null) val = "";
    if (name.startsWith("--")) {
      style.setProperty(name, val);
    } else {
      const prefixed = autoPrefix(style, name);
      if (importantRE.test(val)) {
        style.setProperty(
          hyphenate(prefixed),
          val.replace(importantRE, ""),
          "important"
        );
      } else {
        style[prefixed] = val;
      }
    }
  }
}
const prefixes = ["Webkit", "Moz", "ms"];
const prefixCache = {};
function autoPrefix(style, rawName) {
  const cached = prefixCache[rawName];
  if (cached) {
    return cached;
  }
  let name = camelize(rawName);
  if (name !== "filter" && name in style) {
    return prefixCache[rawName] = name;
  }
  name = capitalize(name);
  for (let i = 0; i < prefixes.length; i++) {
    const prefixed = prefixes[i] + name;
    if (prefixed in style) {
      return prefixCache[rawName] = prefixed;
    }
  }
  return rawName;
}
function shouldPreserveTextareaResizeStyle(el, key, prev, next) {
  return el.tagName === "TEXTAREA" && (key === "width" || key === "height") && isString(next) && prev === next;
}
const xlinkNS = "http://www.w3.org/1999/xlink";
function patchAttr(el, key, value, isSVG, instance, isBoolean2 = isSpecialBooleanAttr(key)) {
  if (isSVG && key.startsWith("xlink:")) {
    if (value == null) {
      el.removeAttributeNS(xlinkNS, key.slice(6, key.length));
    } else {
      el.setAttributeNS(xlinkNS, key, value);
    }
  } else {
    if (value == null || isBoolean2 && !includeBooleanAttr(value)) {
      el.removeAttribute(key);
    } else {
      el.setAttribute(
        key,
        isBoolean2 ? "" : isSymbol$1(value) ? String(value) : value
      );
    }
  }
}
function patchDOMProp(el, key, value, parentComponent, attrName) {
  if (key === "innerHTML" || key === "textContent") {
    if (value != null) {
      el[key] = key === "innerHTML" ? unsafeToTrustedHTML(value) : value;
    }
    return;
  }
  const tag = el.tagName;
  if (key === "value" && tag !== "PROGRESS" && // custom elements may use _value internally
  !tag.includes("-")) {
    const oldValue = tag === "OPTION" ? el.getAttribute("value") || "" : el.value;
    const newValue = value == null ? (
      // #11647: value should be set as empty string for null and undefined,
      // but <input type="checkbox"> should be set as 'on'.
      el.type === "checkbox" ? "on" : ""
    ) : String(value);
    if (oldValue !== newValue || !("_value" in el)) {
      el.value = newValue;
    }
    if (value == null) {
      el.removeAttribute(key);
    }
    el._value = value;
    return;
  }
  let needRemove = false;
  if (value === "" || value == null) {
    const type = typeof el[key];
    if (type === "boolean") {
      value = includeBooleanAttr(value);
    } else if (value == null && type === "string") {
      value = "";
      needRemove = true;
    } else if (type === "number") {
      value = 0;
      needRemove = true;
    }
  }
  try {
    el[key] = value;
  } catch (e) {
  }
  needRemove && el.removeAttribute(attrName || key);
}
function addEventListener(el, event, handler, options) {
  el.addEventListener(event, handler, options);
}
function removeEventListener(el, event, handler, options) {
  el.removeEventListener(event, handler, options);
}
const veiKey = /* @__PURE__ */ Symbol("_vei");
function patchEvent(el, rawName, prevValue, nextValue, instance = null) {
  const invokers = el[veiKey] || (el[veiKey] = {});
  const existingInvoker = invokers[rawName];
  if (nextValue && existingInvoker) {
    existingInvoker.value = nextValue;
  } else {
    const [name, options] = parseName(rawName);
    if (nextValue) {
      const invoker = invokers[rawName] = createInvoker(
        nextValue,
        instance
      );
      addEventListener(el, name, invoker, options);
    } else if (existingInvoker) {
      removeEventListener(el, name, existingInvoker, options);
      invokers[rawName] = void 0;
    }
  }
}
const optionsModifierRE = /(?:Once|Passive|Capture)$/;
function parseName(name) {
  let options;
  if (optionsModifierRE.test(name)) {
    options = {};
    let m;
    while (m = name.match(optionsModifierRE)) {
      name = name.slice(0, name.length - m[0].length);
      options[m[0].toLowerCase()] = true;
    }
  }
  const event = name[2] === ":" ? name.slice(3) : hyphenate(name.slice(2));
  return [event, options];
}
let cachedNow = 0;
const p = /* @__PURE__ */ Promise.resolve();
const getNow = () => cachedNow || (p.then(() => cachedNow = 0), cachedNow = Date.now());
function createInvoker(initialValue, instance) {
  const invoker = (e) => {
    if (!e._vts) {
      e._vts = Date.now();
    } else if (e._vts <= invoker.attached) {
      return;
    }
    callWithAsyncErrorHandling(
      patchStopImmediatePropagation(e, invoker.value),
      instance,
      5,
      [e]
    );
  };
  invoker.value = initialValue;
  invoker.attached = getNow();
  return invoker;
}
function patchStopImmediatePropagation(e, value) {
  if (isArray$1(value)) {
    const originalStop = e.stopImmediatePropagation;
    e.stopImmediatePropagation = () => {
      originalStop.call(e);
      e._stopped = true;
    };
    return value.map(
      (fn) => (e2) => !e2._stopped && fn && fn(e2)
    );
  } else {
    return value;
  }
}
const isNativeOn = (key) => key.charCodeAt(0) === 111 && key.charCodeAt(1) === 110 && // lowercase letter
key.charCodeAt(2) > 96 && key.charCodeAt(2) < 123;
const patchProp = (el, key, prevValue, nextValue, namespace, parentComponent) => {
  const isSVG = namespace === "svg";
  if (key === "class") {
    patchClass(el, nextValue, isSVG);
  } else if (key === "style") {
    patchStyle(el, prevValue, nextValue);
  } else if (isOn(key)) {
    if (!isModelListener(key)) {
      patchEvent(el, key, prevValue, nextValue, parentComponent);
    }
  } else if (key[0] === "." ? (key = key.slice(1), true) : key[0] === "^" ? (key = key.slice(1), false) : shouldSetAsProp(el, key, nextValue, isSVG)) {
    patchDOMProp(el, key, nextValue);
    if (!el.tagName.includes("-") && (key === "value" || key === "checked" || key === "selected")) {
      patchAttr(el, key, nextValue, isSVG, parentComponent, key !== "value");
    }
  } else if (
    // #11081 force set props for possible async custom element
    el._isVueCE && // #12408 check if it's declared prop or it's async custom element
    (shouldSetAsPropForVueCE(el, key) || // @ts-expect-error _def is private
    el._def.__asyncLoader && (/[A-Z]/.test(key) || !isString(nextValue)))
  ) {
    patchDOMProp(el, camelize(key), nextValue, parentComponent, key);
  } else {
    if (key === "true-value") {
      el._trueValue = nextValue;
    } else if (key === "false-value") {
      el._falseValue = nextValue;
    }
    patchAttr(el, key, nextValue, isSVG);
  }
};
function shouldSetAsProp(el, key, value, isSVG) {
  if (isSVG) {
    if (key === "innerHTML" || key === "textContent") {
      return true;
    }
    if (key in el && isNativeOn(key) && isFunction$1(value)) {
      return true;
    }
    return false;
  }
  if (key === "spellcheck" || key === "draggable" || key === "translate" || key === "autocorrect") {
    return false;
  }
  if (key === "sandbox" && el.tagName === "IFRAME") {
    return false;
  }
  if (key === "form") {
    return false;
  }
  if (key === "list" && el.tagName === "INPUT") {
    return false;
  }
  if (key === "type" && el.tagName === "TEXTAREA") {
    return false;
  }
  if (key === "width" || key === "height") {
    const tag = el.tagName;
    if (tag === "IMG" || tag === "VIDEO" || tag === "CANVAS" || tag === "SOURCE") {
      return false;
    }
  }
  if (isNativeOn(key) && isString(value)) {
    return false;
  }
  return key in el;
}
function shouldSetAsPropForVueCE(el, key) {
  const props = (
    // @ts-expect-error _def is private
    el._def.props
  );
  if (!props) {
    return false;
  }
  const camelKey = camelize(key);
  return Array.isArray(props) ? props.some((prop) => camelize(prop) === camelKey) : Object.keys(props).some((prop) => camelize(prop) === camelKey);
}
const positionMap = /* @__PURE__ */ new WeakMap();
const newPositionMap = /* @__PURE__ */ new WeakMap();
const moveCbKey = /* @__PURE__ */ Symbol("_moveCb");
const enterCbKey = /* @__PURE__ */ Symbol("_enterCb");
const decorate = (t) => {
  delete t.props.mode;
  return t;
};
const TransitionGroupImpl = /* @__PURE__ */ decorate({
  name: "TransitionGroup",
  props: /* @__PURE__ */ extend({}, TransitionPropsValidators, {
    tag: String,
    moveClass: String
  }),
  setup(props, { slots }) {
    const instance = getCurrentInstance();
    const state = useTransitionState();
    let prevChildren;
    let children;
    onUpdated(() => {
      if (!prevChildren.length) {
        return;
      }
      const moveClass = props.moveClass || `${props.name || "v"}-move`;
      if (!hasCSSTransform(
        prevChildren[0].el,
        instance.vnode.el,
        moveClass
      )) {
        prevChildren = [];
        return;
      }
      prevChildren.forEach(callPendingCbs);
      prevChildren.forEach(recordPosition);
      const movedChildren = prevChildren.filter(applyTranslation);
      forceReflow(instance.vnode.el);
      movedChildren.forEach((c) => {
        const el = c.el;
        const style = el.style;
        addTransitionClass(el, moveClass);
        style.transform = style.webkitTransform = style.transitionDuration = "";
        const cb = el[moveCbKey] = (e) => {
          if (e && e.target !== el) {
            return;
          }
          if (!e || e.propertyName.endsWith("transform")) {
            el.removeEventListener("transitionend", cb);
            el[moveCbKey] = null;
            removeTransitionClass(el, moveClass);
          }
        };
        el.addEventListener("transitionend", cb);
      });
      prevChildren = [];
    });
    return () => {
      const rawProps = /* @__PURE__ */ toRaw(props);
      const cssTransitionProps = resolveTransitionProps(rawProps);
      let tag = rawProps.tag || Fragment;
      prevChildren = [];
      if (children) {
        for (let i = 0; i < children.length; i++) {
          const child = children[i];
          if (child.el && child.el instanceof Element) {
            prevChildren.push(child);
            setTransitionHooks(
              child,
              resolveTransitionHooks(
                child,
                cssTransitionProps,
                state,
                instance
              )
            );
            positionMap.set(child, getPosition(child.el));
          }
        }
      }
      children = slots.default ? getTransitionRawChildren(slots.default()) : [];
      for (let i = 0; i < children.length; i++) {
        const child = children[i];
        if (child.key != null) {
          setTransitionHooks(
            child,
            resolveTransitionHooks(child, cssTransitionProps, state, instance)
          );
        }
      }
      return createVNode(tag, null, children);
    };
  }
});
const TransitionGroup = TransitionGroupImpl;
function callPendingCbs(c) {
  const el = c.el;
  if (el[moveCbKey]) {
    el[moveCbKey]();
  }
  if (el[enterCbKey]) {
    el[enterCbKey]();
  }
}
function recordPosition(c) {
  newPositionMap.set(c, getPosition(c.el));
}
function applyTranslation(c) {
  const oldPos = positionMap.get(c);
  const newPos = newPositionMap.get(c);
  const dx = oldPos.left - newPos.left;
  const dy = oldPos.top - newPos.top;
  if (dx || dy) {
    const el = c.el;
    const s = el.style;
    const rect = el.getBoundingClientRect();
    let scaleX = 1;
    let scaleY = 1;
    if (el.offsetWidth) scaleX = rect.width / el.offsetWidth;
    if (el.offsetHeight) scaleY = rect.height / el.offsetHeight;
    if (!Number.isFinite(scaleX) || scaleX === 0) scaleX = 1;
    if (!Number.isFinite(scaleY) || scaleY === 0) scaleY = 1;
    if (Math.abs(scaleX - 1) < 0.01) scaleX = 1;
    if (Math.abs(scaleY - 1) < 0.01) scaleY = 1;
    s.transform = s.webkitTransform = `translate(${dx / scaleX}px,${dy / scaleY}px)`;
    s.transitionDuration = "0s";
    return c;
  }
}
function getPosition(el) {
  const rect = el.getBoundingClientRect();
  return {
    left: rect.left,
    top: rect.top
  };
}
function hasCSSTransform(el, root2, moveClass) {
  const clone = el.cloneNode();
  const _vtc = el[vtcKey];
  if (_vtc) {
    _vtc.forEach((cls) => {
      cls.split(/\s+/).forEach((c) => c && clone.classList.remove(c));
    });
  }
  moveClass.split(/\s+/).forEach((c) => c && clone.classList.add(c));
  clone.style.display = "none";
  const container = root2.nodeType === 1 ? root2 : root2.parentNode;
  container.appendChild(clone);
  const { hasTransform } = getTransitionInfo(clone);
  container.removeChild(clone);
  return hasTransform;
}
const getModelAssigner = (vnode) => {
  const fn = vnode.props["onUpdate:modelValue"] || false;
  return isArray$1(fn) ? (value) => invokeArrayFns(fn, value) : fn;
};
function onCompositionStart(e) {
  e.target.composing = true;
}
function onCompositionEnd(e) {
  const target = e.target;
  if (target.composing) {
    target.composing = false;
    target.dispatchEvent(new Event("input"));
  }
}
const assignKey = /* @__PURE__ */ Symbol("_assign");
function castValue(value, trim, number) {
  if (trim) value = value.trim();
  if (number) value = looseToNumber(value);
  return value;
}
const vModelText = {
  created(el, { modifiers: { lazy, trim, number } }, vnode) {
    el[assignKey] = getModelAssigner(vnode);
    const castToNumber = number || vnode.props && vnode.props.type === "number";
    addEventListener(el, lazy ? "change" : "input", (e) => {
      if (e.target.composing) return;
      el[assignKey](castValue(el.value, trim, castToNumber));
    });
    if (trim || castToNumber) {
      addEventListener(el, "change", () => {
        el.value = castValue(el.value, trim, castToNumber);
      });
    }
    if (!lazy) {
      addEventListener(el, "compositionstart", onCompositionStart);
      addEventListener(el, "compositionend", onCompositionEnd);
      addEventListener(el, "change", onCompositionEnd);
    }
  },
  // set value on mounted so it's after min/max for type="range"
  mounted(el, { value }) {
    el.value = value == null ? "" : value;
  },
  beforeUpdate(el, { value, oldValue, modifiers: { lazy, trim, number } }, vnode) {
    el[assignKey] = getModelAssigner(vnode);
    if (el.composing) return;
    const elValue = (number || el.type === "number") && !/^0\d/.test(el.value) ? looseToNumber(el.value) : el.value;
    const newValue = value == null ? "" : value;
    if (elValue === newValue) {
      return;
    }
    const rootNode = el.getRootNode();
    if ((rootNode instanceof Document || rootNode instanceof ShadowRoot) && rootNode.activeElement === el && el.type !== "range") {
      if (lazy && value === oldValue) {
        return;
      }
      if (trim && el.value.trim() === newValue) {
        return;
      }
    }
    el.value = newValue;
  }
};
const vModelCheckbox = {
  // #4096 array checkboxes need to be deep traversed
  deep: true,
  created(el, _, vnode) {
    el[assignKey] = getModelAssigner(vnode);
    addEventListener(el, "change", () => {
      const modelValue = el._modelValue;
      const elementValue = getValue$1(el);
      const checked = el.checked;
      const assign = el[assignKey];
      if (isArray$1(modelValue)) {
        const index = looseIndexOf(modelValue, elementValue);
        const found = index !== -1;
        if (checked && !found) {
          assign(modelValue.concat(elementValue));
        } else if (!checked && found) {
          const filtered = [...modelValue];
          filtered.splice(index, 1);
          assign(filtered);
        }
      } else if (isSet(modelValue)) {
        const cloned = new Set(modelValue);
        if (checked) {
          cloned.add(elementValue);
        } else {
          cloned.delete(elementValue);
        }
        assign(cloned);
      } else {
        assign(getCheckboxValue(el, checked));
      }
    });
  },
  // set initial checked on mount to wait for true-value/false-value
  mounted: setChecked,
  beforeUpdate(el, binding, vnode) {
    el[assignKey] = getModelAssigner(vnode);
    setChecked(el, binding, vnode);
  }
};
function setChecked(el, { value, oldValue }, vnode) {
  el._modelValue = value;
  let checked;
  if (isArray$1(value)) {
    checked = looseIndexOf(value, vnode.props.value) > -1;
  } else if (isSet(value)) {
    checked = value.has(vnode.props.value);
  } else {
    if (value === oldValue) return;
    checked = looseEqual(value, getCheckboxValue(el, true));
  }
  if (el.checked !== checked) {
    el.checked = checked;
  }
}
const vModelRadio = {
  created(el, { value }, vnode) {
    el.checked = looseEqual(value, vnode.props.value);
    el[assignKey] = getModelAssigner(vnode);
    addEventListener(el, "change", () => {
      el[assignKey](getValue$1(el));
    });
  },
  beforeUpdate(el, { value, oldValue }, vnode) {
    el[assignKey] = getModelAssigner(vnode);
    if (value !== oldValue) {
      el.checked = looseEqual(value, vnode.props.value);
    }
  }
};
const vModelSelect = {
  // <select multiple> value need to be deep traversed
  deep: true,
  created(el, { value, modifiers: { number } }, vnode) {
    const isSetModel = isSet(value);
    addEventListener(el, "change", () => {
      const selectedVal = Array.prototype.filter.call(el.options, (o) => o.selected).map(
        (o) => number ? looseToNumber(getValue$1(o)) : getValue$1(o)
      );
      el[assignKey](
        el.multiple ? isSetModel ? new Set(selectedVal) : selectedVal : selectedVal[0]
      );
      el._assigning = true;
      nextTick(() => {
        el._assigning = false;
      });
    });
    el[assignKey] = getModelAssigner(vnode);
  },
  // set value in mounted & updated because <select> relies on its children
  // <option>s.
  mounted(el, { value }) {
    setSelected(el, value);
  },
  beforeUpdate(el, _binding, vnode) {
    el[assignKey] = getModelAssigner(vnode);
  },
  updated(el, { value }) {
    if (!el._assigning) {
      setSelected(el, value);
    }
  }
};
function setSelected(el, value) {
  const isMultiple = el.multiple;
  const isArrayValue = isArray$1(value);
  if (isMultiple && !isArrayValue && !isSet(value)) {
    return;
  }
  for (let i = 0, l = el.options.length; i < l; i++) {
    const option = el.options[i];
    const optionValue = getValue$1(option);
    if (isMultiple) {
      if (isArrayValue) {
        const optionType = typeof optionValue;
        if (optionType === "string" || optionType === "number") {
          option.selected = value.some((v) => String(v) === String(optionValue));
        } else {
          option.selected = looseIndexOf(value, optionValue) > -1;
        }
      } else {
        option.selected = value.has(optionValue);
      }
    } else if (looseEqual(getValue$1(option), value)) {
      if (el.selectedIndex !== i) el.selectedIndex = i;
      return;
    }
  }
  if (!isMultiple && el.selectedIndex !== -1) {
    el.selectedIndex = -1;
  }
}
function getValue$1(el) {
  return "_value" in el ? el._value : el.value;
}
function getCheckboxValue(el, checked) {
  const key = checked ? "_trueValue" : "_falseValue";
  return key in el ? el[key] : checked;
}
const systemModifiers = ["ctrl", "shift", "alt", "meta"];
const modifierGuards = {
  stop: (e) => e.stopPropagation(),
  prevent: (e) => e.preventDefault(),
  self: (e) => e.target !== e.currentTarget,
  ctrl: (e) => !e.ctrlKey,
  shift: (e) => !e.shiftKey,
  alt: (e) => !e.altKey,
  meta: (e) => !e.metaKey,
  left: (e) => "button" in e && e.button !== 0,
  middle: (e) => "button" in e && e.button !== 1,
  right: (e) => "button" in e && e.button !== 2,
  exact: (e, modifiers) => systemModifiers.some((m) => e[`${m}Key`] && !modifiers.includes(m))
};
const withModifiers = (fn, modifiers) => {
  if (!fn) return fn;
  const cache = fn._withMods || (fn._withMods = {});
  const cacheKey = modifiers.join(".");
  return cache[cacheKey] || (cache[cacheKey] = ((event, ...args) => {
    for (let i = 0; i < modifiers.length; i++) {
      const guard = modifierGuards[modifiers[i]];
      if (guard && guard(event, modifiers)) return;
    }
    return fn(event, ...args);
  }));
};
const keyNames = {
  esc: "escape",
  space: " ",
  up: "arrow-up",
  left: "arrow-left",
  right: "arrow-right",
  down: "arrow-down",
  delete: "backspace"
};
const withKeys = (fn, modifiers) => {
  const cache = fn._withKeys || (fn._withKeys = {});
  const cacheKey = modifiers.join(".");
  return cache[cacheKey] || (cache[cacheKey] = ((event) => {
    if (!("key" in event)) {
      return;
    }
    const eventKey = hyphenate(event.key);
    if (modifiers.some(
      (k) => k === eventKey || keyNames[k] === eventKey
    )) {
      return fn(event);
    }
  }));
};
const rendererOptions = /* @__PURE__ */ extend({ patchProp }, nodeOps);
let renderer;
function ensureRenderer() {
  return renderer || (renderer = createRenderer(rendererOptions));
}
const render = ((...args) => {
  ensureRenderer().render(...args);
});
const createApp = ((...args) => {
  const app = ensureRenderer().createApp(...args);
  const { mount } = app;
  app.mount = (containerOrSelector) => {
    const container = normalizeContainer(containerOrSelector);
    if (!container) return;
    const component = app._component;
    if (!isFunction$1(component) && !component.render && !component.template) {
      component.template = container.innerHTML;
    }
    if (container.nodeType === 1) {
      container.textContent = "";
    }
    const proxy = mount(container, false, resolveRootNamespace(container));
    if (container instanceof Element) {
      container.removeAttribute("v-cloak");
      container.setAttribute("data-v-app", "");
    }
    return proxy;
  };
  return app;
});
function resolveRootNamespace(container) {
  if (container instanceof SVGElement) {
    return "svg";
  }
  if (typeof MathMLElement === "function" && container instanceof MathMLElement) {
    return "mathml";
  }
}
function normalizeContainer(container) {
  if (isString(container)) {
    const res = document.querySelector(container);
    return res;
  }
  return container;
}
var _sfc_main6 = /* @__PURE__ */ defineComponent({
  name: "ArrowDown",
  __name: "arrow-down",
  setup(__props) {
    return (_ctx, _cache) => (openBlock(), createElementBlock("svg", {
      xmlns: "http://www.w3.org/2000/svg",
      viewBox: "0 0 1024 1024"
    }, [
      createBaseVNode("path", {
        fill: "currentColor",
        d: "M831.872 340.864 512 652.672 192.128 340.864a30.59 30.59 0 0 0-42.752 0 29.12 29.12 0 0 0 0 41.6L489.664 714.24a32 32 0 0 0 44.672 0l340.288-331.712a29.12 29.12 0 0 0 0-41.728 30.59 30.59 0 0 0-42.752 0z"
      })
    ]));
  }
}), arrow_down_default = _sfc_main6;
var _sfc_main8 = /* @__PURE__ */ defineComponent({
  name: "ArrowLeft",
  __name: "arrow-left",
  setup(__props) {
    return (_ctx, _cache) => (openBlock(), createElementBlock("svg", {
      xmlns: "http://www.w3.org/2000/svg",
      viewBox: "0 0 1024 1024"
    }, [
      createBaseVNode("path", {
        fill: "currentColor",
        d: "M609.408 149.376 277.76 489.6a32 32 0 0 0 0 44.672l331.648 340.352a29.12 29.12 0 0 0 41.728 0 30.59 30.59 0 0 0 0-42.752L339.264 511.936l311.872-319.872a30.59 30.59 0 0 0 0-42.688 29.12 29.12 0 0 0-41.728 0"
      })
    ]));
  }
}), arrow_left_default = _sfc_main8;
var _sfc_main10 = /* @__PURE__ */ defineComponent({
  name: "ArrowRight",
  __name: "arrow-right",
  setup(__props) {
    return (_ctx, _cache) => (openBlock(), createElementBlock("svg", {
      xmlns: "http://www.w3.org/2000/svg",
      viewBox: "0 0 1024 1024"
    }, [
      createBaseVNode("path", {
        fill: "currentColor",
        d: "M340.864 149.312a30.59 30.59 0 0 0 0 42.752L652.736 512 340.864 831.872a30.59 30.59 0 0 0 0 42.752 29.12 29.12 0 0 0 41.728 0L714.24 534.336a32 32 0 0 0 0-44.672L382.592 149.376a29.12 29.12 0 0 0-41.728 0z"
      })
    ]));
  }
}), arrow_right_default = _sfc_main10;
var _sfc_main12 = /* @__PURE__ */ defineComponent({
  name: "ArrowUp",
  __name: "arrow-up",
  setup(__props) {
    return (_ctx, _cache) => (openBlock(), createElementBlock("svg", {
      xmlns: "http://www.w3.org/2000/svg",
      viewBox: "0 0 1024 1024"
    }, [
      createBaseVNode("path", {
        fill: "currentColor",
        d: "m488.832 344.32-339.84 356.672a32 32 0 0 0 0 44.16l.384.384a29.44 29.44 0 0 0 42.688 0l320-335.872 319.872 335.872a29.44 29.44 0 0 0 42.688 0l.384-.384a32 32 0 0 0 0-44.16L535.168 344.32a32 32 0 0 0-46.336 0"
      })
    ]));
  }
}), arrow_up_default = _sfc_main12;
var _sfc_main14 = /* @__PURE__ */ defineComponent({
  name: "Back",
  __name: "back",
  setup(__props) {
    return (_ctx, _cache) => (openBlock(), createElementBlock("svg", {
      xmlns: "http://www.w3.org/2000/svg",
      viewBox: "0 0 1024 1024"
    }, [
      createBaseVNode("path", {
        fill: "currentColor",
        d: "M224 480h640a32 32 0 1 1 0 64H224a32 32 0 0 1 0-64"
      }),
      createBaseVNode("path", {
        fill: "currentColor",
        d: "m237.248 512 265.408 265.344a32 32 0 0 1-45.312 45.312l-288-288a32 32 0 0 1 0-45.312l288-288a32 32 0 1 1 45.312 45.312z"
      })
    ]));
  }
}), back_default = _sfc_main14;
var _sfc_main29 = /* @__PURE__ */ defineComponent({
  name: "Calendar",
  __name: "calendar",
  setup(__props) {
    return (_ctx, _cache) => (openBlock(), createElementBlock("svg", {
      xmlns: "http://www.w3.org/2000/svg",
      viewBox: "0 0 1024 1024"
    }, [
      createBaseVNode("path", {
        fill: "currentColor",
        d: "M128 384v512h768V192H768v32a32 32 0 1 1-64 0v-32H320v32a32 32 0 0 1-64 0v-32H128v128h768v64zm192-256h384V96a32 32 0 1 1 64 0v32h160a32 32 0 0 1 32 32v768a32 32 0 0 1-32 32H96a32 32 0 0 1-32-32V160a32 32 0 0 1 32-32h160V96a32 32 0 0 1 64 0zm-32 384h64a32 32 0 0 1 0 64h-64a32 32 0 0 1 0-64m0 192h64a32 32 0 1 1 0 64h-64a32 32 0 1 1 0-64m192-192h64a32 32 0 0 1 0 64h-64a32 32 0 0 1 0-64m0 192h64a32 32 0 1 1 0 64h-64a32 32 0 1 1 0-64m192-192h64a32 32 0 1 1 0 64h-64a32 32 0 1 1 0-64m0 192h64a32 32 0 1 1 0 64h-64a32 32 0 1 1 0-64"
      })
    ]));
  }
}), calendar_default = _sfc_main29;
var _sfc_main34 = /* @__PURE__ */ defineComponent({
  name: "CaretRight",
  __name: "caret-right",
  setup(__props) {
    return (_ctx, _cache) => (openBlock(), createElementBlock("svg", {
      xmlns: "http://www.w3.org/2000/svg",
      viewBox: "0 0 1024 1024"
    }, [
      createBaseVNode("path", {
        fill: "currentColor",
        d: "M384 192v640l384-320.064z"
      })
    ]));
  }
}), caret_right_default = _sfc_main34;
var _sfc_main35 = /* @__PURE__ */ defineComponent({
  name: "CaretTop",
  __name: "caret-top",
  setup(__props) {
    return (_ctx, _cache) => (openBlock(), createElementBlock("svg", {
      xmlns: "http://www.w3.org/2000/svg",
      viewBox: "0 0 1024 1024"
    }, [
      createBaseVNode("path", {
        fill: "currentColor",
        d: "M512 320 192 704h639.936z"
      })
    ]));
  }
}), caret_top_default = _sfc_main35;
var _sfc_main37 = /* @__PURE__ */ defineComponent({
  name: "ChatDotRound",
  __name: "chat-dot-round",
  setup(__props) {
    return (_ctx, _cache) => (openBlock(), createElementBlock("svg", {
      xmlns: "http://www.w3.org/2000/svg",
      viewBox: "0 0 1024 1024"
    }, [
      createBaseVNode("path", {
        fill: "currentColor",
        d: "m174.72 855.68 135.296-45.12 23.68 11.84C388.096 849.536 448.576 864 512 864c211.84 0 384-166.784 384-352S723.84 160 512 160 128 326.784 128 512c0 69.12 24.96 139.264 70.848 199.232l22.08 28.8-46.272 115.584zm-45.248 82.56A32 32 0 0 1 89.6 896l58.368-145.92C94.72 680.32 64 596.864 64 512 64 299.904 256 96 512 96s448 203.904 448 416-192 416-448 416a461.06 461.06 0 0 1-206.912-48.384l-175.616 58.56z"
      }),
      createBaseVNode("path", {
        fill: "currentColor",
        d: "M512 563.2a51.2 51.2 0 1 1 0-102.4 51.2 51.2 0 0 1 0 102.4m192 0a51.2 51.2 0 1 1 0-102.4 51.2 51.2 0 0 1 0 102.4m-384 0a51.2 51.2 0 1 1 0-102.4 51.2 51.2 0 0 1 0 102.4"
      })
    ]));
  }
}), chat_dot_round_default = _sfc_main37;
var _sfc_main43 = /* @__PURE__ */ defineComponent({
  name: "Check",
  __name: "check",
  setup(__props) {
    return (_ctx, _cache) => (openBlock(), createElementBlock("svg", {
      xmlns: "http://www.w3.org/2000/svg",
      viewBox: "0 0 1024 1024"
    }, [
      createBaseVNode("path", {
        fill: "currentColor",
        d: "M406.656 706.944 195.84 496.256a32 32 0 1 0-45.248 45.248l256 256 512-512a32 32 0 0 0-45.248-45.248L406.592 706.944z"
      })
    ]));
  }
}), check_default = _sfc_main43;
var _sfc_main48 = /* @__PURE__ */ defineComponent({
  name: "CircleCheckFilled",
  __name: "circle-check-filled",
  setup(__props) {
    return (_ctx, _cache) => (openBlock(), createElementBlock("svg", {
      xmlns: "http://www.w3.org/2000/svg",
      viewBox: "0 0 1024 1024"
    }, [
      createBaseVNode("path", {
        fill: "currentColor",
        d: "M512 64a448 448 0 1 1 0 896 448 448 0 0 1 0-896m-55.808 536.384-99.52-99.584a38.4 38.4 0 1 0-54.336 54.336l126.72 126.72a38.27 38.27 0 0 0 54.336 0l262.4-262.464a38.4 38.4 0 1 0-54.272-54.336z"
      })
    ]));
  }
}), circle_check_filled_default = _sfc_main48;
var _sfc_main49 = /* @__PURE__ */ defineComponent({
  name: "CircleCheck",
  __name: "circle-check",
  setup(__props) {
    return (_ctx, _cache) => (openBlock(), createElementBlock("svg", {
      xmlns: "http://www.w3.org/2000/svg",
      viewBox: "0 0 1024 1024"
    }, [
      createBaseVNode("path", {
        fill: "currentColor",
        d: "M512 896a384 384 0 1 0 0-768 384 384 0 0 0 0 768m0 64a448 448 0 1 1 0-896 448 448 0 0 1 0 896"
      }),
      createBaseVNode("path", {
        fill: "currentColor",
        d: "M745.344 361.344a32 32 0 0 1 45.312 45.312l-288 288a32 32 0 0 1-45.312 0l-160-160a32 32 0 1 1 45.312-45.312L480 626.752z"
      })
    ]));
  }
}), circle_check_default = _sfc_main49;
var _sfc_main50 = /* @__PURE__ */ defineComponent({
  name: "CircleCloseFilled",
  __name: "circle-close-filled",
  setup(__props) {
    return (_ctx, _cache) => (openBlock(), createElementBlock("svg", {
      xmlns: "http://www.w3.org/2000/svg",
      viewBox: "0 0 1024 1024"
    }, [
      createBaseVNode("path", {
        fill: "currentColor",
        d: "M512 64a448 448 0 1 1 0 896 448 448 0 0 1 0-896m0 393.664L407.936 353.6a38.4 38.4 0 1 0-54.336 54.336L457.664 512 353.6 616.064a38.4 38.4 0 1 0 54.336 54.336L512 566.336 616.064 670.4a38.4 38.4 0 1 0 54.336-54.336L566.336 512 670.4 407.936a38.4 38.4 0 1 0-54.336-54.336z"
      })
    ]));
  }
}), circle_close_filled_default = _sfc_main50;
var _sfc_main51 = /* @__PURE__ */ defineComponent({
  name: "CircleClose",
  __name: "circle-close",
  setup(__props) {
    return (_ctx, _cache) => (openBlock(), createElementBlock("svg", {
      xmlns: "http://www.w3.org/2000/svg",
      viewBox: "0 0 1024 1024"
    }, [
      createBaseVNode("path", {
        fill: "currentColor",
        d: "m466.752 512-90.496-90.496a32 32 0 0 1 45.248-45.248L512 466.752l90.496-90.496a32 32 0 1 1 45.248 45.248L557.248 512l90.496 90.496a32 32 0 1 1-45.248 45.248L512 557.248l-90.496 90.496a32 32 0 0 1-45.248-45.248z"
      }),
      createBaseVNode("path", {
        fill: "currentColor",
        d: "M512 896a384 384 0 1 0 0-768 384 384 0 0 0 0 768m0 64a448 448 0 1 1 0-896 448 448 0 0 1 0 896"
      })
    ]));
  }
}), circle_close_default = _sfc_main51;
var _sfc_main54 = /* @__PURE__ */ defineComponent({
  name: "Clock",
  __name: "clock",
  setup(__props) {
    return (_ctx, _cache) => (openBlock(), createElementBlock("svg", {
      xmlns: "http://www.w3.org/2000/svg",
      viewBox: "0 0 1024 1024"
    }, [
      createBaseVNode("path", {
        fill: "currentColor",
        d: "M512 896a384 384 0 1 0 0-768 384 384 0 0 0 0 768m0 64a448 448 0 1 1 0-896 448 448 0 0 1 0 896"
      }),
      createBaseVNode("path", {
        fill: "currentColor",
        d: "M480 256a32 32 0 0 1 32 32v256a32 32 0 0 1-64 0V288a32 32 0 0 1 32-32"
      }),
      createBaseVNode("path", {
        fill: "currentColor",
        d: "M480 512h256q32 0 32 32t-32 32H480q-32 0-32-32t32-32"
      })
    ]));
  }
}), clock_default = _sfc_main54;
var _sfc_main56 = /* @__PURE__ */ defineComponent({
  name: "Close",
  __name: "close",
  setup(__props) {
    return (_ctx, _cache) => (openBlock(), createElementBlock("svg", {
      xmlns: "http://www.w3.org/2000/svg",
      viewBox: "0 0 1024 1024"
    }, [
      createBaseVNode("path", {
        fill: "currentColor",
        d: "M764.288 214.592 512 466.88 259.712 214.592a31.936 31.936 0 0 0-45.12 45.12L466.752 512 214.528 764.224a31.936 31.936 0 1 0 45.12 45.184L512 557.184l252.288 252.288a31.936 31.936 0 0 0 45.12-45.12L557.12 512.064l252.288-252.352a31.936 31.936 0 1 0-45.12-45.184z"
      })
    ]));
  }
}), close_default = _sfc_main56;
var _sfc_main72 = /* @__PURE__ */ defineComponent({
  name: "DArrowLeft",
  __name: "d-arrow-left",
  setup(__props) {
    return (_ctx, _cache) => (openBlock(), createElementBlock("svg", {
      xmlns: "http://www.w3.org/2000/svg",
      viewBox: "0 0 1024 1024"
    }, [
      createBaseVNode("path", {
        fill: "currentColor",
        d: "M529.408 149.376a29.12 29.12 0 0 1 41.728 0 30.59 30.59 0 0 1 0 42.688L259.264 511.936l311.872 319.936a30.59 30.59 0 0 1-.512 43.264 29.12 29.12 0 0 1-41.216-.512L197.76 534.272a32 32 0 0 1 0-44.672zm256 0a29.12 29.12 0 0 1 41.728 0 30.59 30.59 0 0 1 0 42.688L515.264 511.936l311.872 319.936a30.59 30.59 0 0 1-.512 43.264 29.12 29.12 0 0 1-41.216-.512L453.76 534.272a32 32 0 0 1 0-44.672z"
      })
    ]));
  }
}), d_arrow_left_default = _sfc_main72;
var _sfc_main73 = /* @__PURE__ */ defineComponent({
  name: "DArrowRight",
  __name: "d-arrow-right",
  setup(__props) {
    return (_ctx, _cache) => (openBlock(), createElementBlock("svg", {
      xmlns: "http://www.w3.org/2000/svg",
      viewBox: "0 0 1024 1024"
    }, [
      createBaseVNode("path", {
        fill: "currentColor",
        d: "M452.864 149.312a29.12 29.12 0 0 1 41.728.064L826.24 489.664a32 32 0 0 1 0 44.672L494.592 874.624a29.12 29.12 0 0 1-41.728 0 30.59 30.59 0 0 1 0-42.752L764.736 512 452.864 192a30.59 30.59 0 0 1 0-42.688m-256 0a29.12 29.12 0 0 1 41.728.064L570.24 489.664a32 32 0 0 1 0 44.672L238.592 874.624a29.12 29.12 0 0 1-41.728 0 30.59 30.59 0 0 1 0-42.752L508.736 512 196.864 192a30.59 30.59 0 0 1 0-42.688"
      })
    ]));
  }
}), d_arrow_right_default = _sfc_main73;
var _sfc_main80 = /* @__PURE__ */ defineComponent({
  name: "Delete",
  __name: "delete",
  setup(__props) {
    return (_ctx, _cache) => (openBlock(), createElementBlock("svg", {
      xmlns: "http://www.w3.org/2000/svg",
      viewBox: "0 0 1024 1024"
    }, [
      createBaseVNode("path", {
        fill: "currentColor",
        d: "M160 256H96a32 32 0 0 1 0-64h256V95.936a32 32 0 0 1 32-32h256a32 32 0 0 1 32 32V192h256a32 32 0 1 1 0 64h-64v672a32 32 0 0 1-32 32H192a32 32 0 0 1-32-32zm448-64v-64H416v64zM224 896h576V256H224zm192-128a32 32 0 0 1-32-32V416a32 32 0 0 1 64 0v320a32 32 0 0 1-32 32m192 0a32 32 0 0 1-32-32V416a32 32 0 0 1 64 0v320a32 32 0 0 1-32 32"
      })
    ]));
  }
}), delete_default = _sfc_main80;
var _sfc_main90 = /* @__PURE__ */ defineComponent({
  name: "Document",
  __name: "document",
  setup(__props) {
    return (_ctx, _cache) => (openBlock(), createElementBlock("svg", {
      xmlns: "http://www.w3.org/2000/svg",
      viewBox: "0 0 1024 1024"
    }, [
      createBaseVNode("path", {
        fill: "currentColor",
        d: "M832 384H576V128H192v768h640zm-26.496-64L640 154.496V320zM160 64h480l256 256v608a32 32 0 0 1-32 32H160a32 32 0 0 1-32-32V96a32 32 0 0 1 32-32m160 448h384v64H320zm0-192h160v64H320zm0 384h384v64H320z"
      })
    ]));
  }
}), document_default = _sfc_main90;
var _sfc_main93 = /* @__PURE__ */ defineComponent({
  name: "EditPen",
  __name: "edit-pen",
  setup(__props) {
    return (_ctx, _cache) => (openBlock(), createElementBlock("svg", {
      xmlns: "http://www.w3.org/2000/svg",
      viewBox: "0 0 1024 1024"
    }, [
      createBaseVNode("path", {
        fill: "currentColor",
        d: "m199.04 672.64 193.984 112 224-387.968-193.92-112-224 388.032zm-23.872 60.16 32.896 148.288 144.896-45.696zM455.04 229.248l193.92 112 56.704-98.112-193.984-112zM104.32 708.8l384-665.024 304.768 175.936L409.152 884.8h.064l-248.448 78.336zm384 254.272v-64h448v64z"
      })
    ]));
  }
}), edit_pen_default = _sfc_main93;
var _sfc_main94 = /* @__PURE__ */ defineComponent({
  name: "Edit",
  __name: "edit",
  setup(__props) {
    return (_ctx, _cache) => (openBlock(), createElementBlock("svg", {
      xmlns: "http://www.w3.org/2000/svg",
      viewBox: "0 0 1024 1024"
    }, [
      createBaseVNode("path", {
        fill: "currentColor",
        d: "M832 512a32 32 0 1 1 64 0v352a32 32 0 0 1-32 32H160a32 32 0 0 1-32-32V160a32 32 0 0 1 32-32h352a32 32 0 0 1 0 64H192v640h640z"
      }),
      createBaseVNode("path", {
        fill: "currentColor",
        d: "m469.952 554.24 52.8-7.552L847.104 222.4a32 32 0 1 0-45.248-45.248L477.44 501.44l-7.552 52.8zm422.4-422.4a96 96 0 0 1 0 135.808l-331.84 331.84a32 32 0 0 1-18.112 9.088L436.8 623.68a32 32 0 0 1-36.224-36.224l15.104-105.6a32 32 0 0 1 9.024-18.112l331.904-331.84a96 96 0 0 1 135.744 0z"
      })
    ]));
  }
}), edit_default = _sfc_main94;
var _sfc_main118 = /* @__PURE__ */ defineComponent({
  name: "FullScreen",
  __name: "full-screen",
  setup(__props) {
    return (_ctx, _cache) => (openBlock(), createElementBlock("svg", {
      xmlns: "http://www.w3.org/2000/svg",
      viewBox: "0 0 1024 1024"
    }, [
      createBaseVNode("path", {
        fill: "currentColor",
        d: "m160 96.064 192 .192a32 32 0 0 1 0 64l-192-.192V352a32 32 0 0 1-64 0V96h64zm0 831.872V928H96V672a32 32 0 1 1 64 0v191.936l192-.192a32 32 0 1 1 0 64zM864 96.064V96h64v256a32 32 0 1 1-64 0V160.064l-192 .192a32 32 0 1 1 0-64zm0 831.872-192-.192a32 32 0 0 1 0-64l192 .192V672a32 32 0 1 1 64 0v256h-64z"
      })
    ]));
  }
}), full_screen_default = _sfc_main118;
var _sfc_main133 = /* @__PURE__ */ defineComponent({
  name: "Hide",
  __name: "hide",
  setup(__props) {
    return (_ctx, _cache) => (openBlock(), createElementBlock("svg", {
      xmlns: "http://www.w3.org/2000/svg",
      viewBox: "0 0 1024 1024"
    }, [
      createBaseVNode("path", {
        fill: "currentColor",
        d: "M876.8 156.8c0-9.6-3.2-16-9.6-22.4s-12.8-9.6-22.4-9.6-16 3.2-22.4 9.6L736 220.8c-64-32-137.6-51.2-224-60.8-160 16-288 73.6-377.6 176S0 496 0 512s48 73.6 134.4 176c22.4 25.6 44.8 48 73.6 67.2l-86.4 89.6c-6.4 6.4-9.6 12.8-9.6 22.4s3.2 16 9.6 22.4 12.8 9.6 22.4 9.6 16-3.2 22.4-9.6l704-710.4c3.2-6.4 6.4-12.8 6.4-22.4m-646.4 528Q115.2 579.2 76.8 512q43.2-72 153.6-172.8C304 272 400 230.4 512 224c64 3.2 124.8 19.2 176 44.8l-54.4 54.4C598.4 300.8 560 288 512 288c-64 0-115.2 22.4-160 64s-64 96-64 160c0 48 12.8 89.6 35.2 124.8L256 707.2c-9.6-6.4-19.2-16-25.6-22.4m140.8-96Q352 555.2 352 512c0-44.8 16-83.2 48-112s67.2-48 112-48c28.8 0 54.4 6.4 73.6 19.2zM889.599 336c-12.8-16-28.8-28.8-41.6-41.6l-48 48c73.6 67.2 124.8 124.8 150.4 169.6q-43.2 72-153.6 172.8c-73.6 67.2-172.8 108.8-284.8 115.2-51.2-3.2-99.2-12.8-140.8-28.8l-48 48c57.6 22.4 118.4 38.4 188.8 44.8 160-16 288-73.6 377.6-176S1024 528 1024 512s-48.001-73.6-134.401-176"
      }),
      createBaseVNode("path", {
        fill: "currentColor",
        d: "M511.998 672c-12.8 0-25.6-3.2-38.4-6.4l-51.2 51.2c28.8 12.8 57.6 19.2 89.6 19.2 64 0 115.2-22.4 160-64 41.6-41.6 64-96 64-160 0-32-6.4-64-19.2-89.6l-51.2 51.2c3.2 12.8 6.4 25.6 6.4 38.4 0 44.8-16 83.2-48 112s-67.2 48-112 48"
      })
    ]));
  }
}), hide_default = _sfc_main133;
var _sfc_main143 = /* @__PURE__ */ defineComponent({
  name: "InfoFilled",
  __name: "info-filled",
  setup(__props) {
    return (_ctx, _cache) => (openBlock(), createElementBlock("svg", {
      xmlns: "http://www.w3.org/2000/svg",
      viewBox: "0 0 1024 1024"
    }, [
      createBaseVNode("path", {
        fill: "currentColor",
        d: "M512 64a448 448 0 1 1 0 896.064A448 448 0 0 1 512 64m67.2 275.072c33.28 0 60.288-23.104 60.288-57.344s-27.072-57.344-60.288-57.344c-33.28 0-60.16 23.104-60.16 57.344s26.88 57.344 60.16 57.344M590.912 699.2c0-6.848 2.368-24.64 1.024-34.752l-52.608 60.544c-10.88 11.456-24.512 19.392-30.912 17.28a12.99 12.99 0 0 1-8.256-14.72l87.68-276.992c7.168-35.136-12.544-67.2-54.336-71.296-44.096 0-108.992 44.736-148.48 101.504 0 6.784-1.28 23.68.064 33.792l52.544-60.608c10.88-11.328 23.552-19.328 29.952-17.152a12.8 12.8 0 0 1 7.808 16.128L388.48 728.576c-10.048 32.256 8.96 63.872 55.04 71.04 67.84 0 107.904-43.648 147.456-100.416z"
      })
    ]));
  }
}), info_filled_default = _sfc_main143;
var _sfc_main150 = /* @__PURE__ */ defineComponent({
  name: "Loading",
  __name: "loading",
  setup(__props) {
    return (_ctx, _cache) => (openBlock(), createElementBlock("svg", {
      xmlns: "http://www.w3.org/2000/svg",
      viewBox: "0 0 1024 1024"
    }, [
      createBaseVNode("path", {
        fill: "currentColor",
        d: "M512 64a32 32 0 0 1 32 32v192a32 32 0 0 1-64 0V96a32 32 0 0 1 32-32m0 640a32 32 0 0 1 32 32v192a32 32 0 1 1-64 0V736a32 32 0 0 1 32-32m448-192a32 32 0 0 1-32 32H736a32 32 0 1 1 0-64h192a32 32 0 0 1 32 32m-640 0a32 32 0 0 1-32 32H96a32 32 0 0 1 0-64h192a32 32 0 0 1 32 32M195.2 195.2a32 32 0 0 1 45.248 0L376.32 331.008a32 32 0 0 1-45.248 45.248L195.2 240.448a32 32 0 0 1 0-45.248m452.544 452.544a32 32 0 0 1 45.248 0L828.8 783.552a32 32 0 0 1-45.248 45.248L647.744 692.992a32 32 0 0 1 0-45.248M828.8 195.264a32 32 0 0 1 0 45.184L692.992 376.32a32 32 0 0 1-45.248-45.248l135.808-135.808a32 32 0 0 1 45.248 0m-452.544 452.48a32 32 0 0 1 0 45.248L240.448 828.8a32 32 0 0 1-45.248-45.248l135.808-135.808a32 32 0 0 1 45.248 0"
      })
    ]));
  }
}), loading_default = _sfc_main150;
var _sfc_main156 = /* @__PURE__ */ defineComponent({
  name: "MagicStick",
  __name: "magic-stick",
  setup(__props) {
    return (_ctx, _cache) => (openBlock(), createElementBlock("svg", {
      xmlns: "http://www.w3.org/2000/svg",
      viewBox: "0 0 1024 1024"
    }, [
      createBaseVNode("path", {
        fill: "currentColor",
        d: "M512 64h64v192h-64zm0 576h64v192h-64zM160 480v-64h192v64zm576 0v-64h192v64zM249.856 199.04l45.248-45.184L430.848 289.6 385.6 334.848 249.856 199.104zM657.152 606.4l45.248-45.248 135.744 135.744-45.248 45.248zM114.048 923.2 68.8 877.952l316.8-316.8 45.248 45.248zM702.4 334.848 657.152 289.6l135.744-135.744 45.248 45.248z"
      })
    ]));
  }
}), magic_stick_default = _sfc_main156;
var _sfc_main167 = /* @__PURE__ */ defineComponent({
  name: "Microphone",
  __name: "microphone",
  setup(__props) {
    return (_ctx, _cache) => (openBlock(), createElementBlock("svg", {
      xmlns: "http://www.w3.org/2000/svg",
      viewBox: "0 0 1024 1024"
    }, [
      createBaseVNode("path", {
        fill: "currentColor",
        d: "M512 128a128 128 0 0 0-128 128v256a128 128 0 1 0 256 0V256a128 128 0 0 0-128-128m0-64a192 192 0 0 1 192 192v256a192 192 0 1 1-384 0V256A192 192 0 0 1 512 64m-32 832v-64a288 288 0 0 1-288-288v-32a32 32 0 0 1 64 0v32a224 224 0 0 0 224 224h64a224 224 0 0 0 224-224v-32a32 32 0 1 1 64 0v32a288 288 0 0 1-288 288v64h64a32 32 0 1 1 0 64H416a32 32 0 1 1 0-64z"
      })
    ]));
  }
}), microphone_default = _sfc_main167;
var _sfc_main169 = /* @__PURE__ */ defineComponent({
  name: "Minus",
  __name: "minus",
  setup(__props) {
    return (_ctx, _cache) => (openBlock(), createElementBlock("svg", {
      xmlns: "http://www.w3.org/2000/svg",
      viewBox: "0 0 1024 1024"
    }, [
      createBaseVNode("path", {
        fill: "currentColor",
        d: "M128 544h768a32 32 0 1 0 0-64H128a32 32 0 0 0 0 64"
      })
    ]));
  }
}), minus_default = _sfc_main169;
var _sfc_main174 = /* @__PURE__ */ defineComponent({
  name: "MoreFilled",
  __name: "more-filled",
  setup(__props) {
    return (_ctx, _cache) => (openBlock(), createElementBlock("svg", {
      xmlns: "http://www.w3.org/2000/svg",
      viewBox: "0 0 1024 1024"
    }, [
      createBaseVNode("path", {
        fill: "currentColor",
        d: "M176 416a112 112 0 1 1 0 224 112 112 0 0 1 0-224m336 0a112 112 0 1 1 0 224 112 112 0 0 1 0-224m336 0a112 112 0 1 1 0 224 112 112 0 0 1 0-224"
      })
    ]));
  }
}), more_filled_default = _sfc_main174;
var _sfc_main175 = /* @__PURE__ */ defineComponent({
  name: "More",
  __name: "more",
  setup(__props) {
    return (_ctx, _cache) => (openBlock(), createElementBlock("svg", {
      xmlns: "http://www.w3.org/2000/svg",
      viewBox: "0 0 1024 1024"
    }, [
      createBaseVNode("path", {
        fill: "currentColor",
        d: "M176 416a112 112 0 1 0 0 224 112 112 0 0 0 0-224m0 64a48 48 0 1 1 0 96 48 48 0 0 1 0-96m336-64a112 112 0 1 1 0 224 112 112 0 0 1 0-224m0 64a48 48 0 1 0 0 96 48 48 0 0 0 0-96m336-64a112 112 0 1 1 0 224 112 112 0 0 1 0-224m0 64a48 48 0 1 0 0 96 48 48 0 0 0 0-96"
      })
    ]));
  }
}), more_default = _sfc_main175;
var _sfc_main195 = /* @__PURE__ */ defineComponent({
  name: "PictureFilled",
  __name: "picture-filled",
  setup(__props) {
    return (_ctx, _cache) => (openBlock(), createElementBlock("svg", {
      xmlns: "http://www.w3.org/2000/svg",
      viewBox: "0 0 1024 1024"
    }, [
      createBaseVNode("path", {
        fill: "currentColor",
        d: "M96 896a32 32 0 0 1-32-32V160a32 32 0 0 1 32-32h832a32 32 0 0 1 32 32v704a32 32 0 0 1-32 32zm315.52-228.48-68.928-68.928a32 32 0 0 0-45.248 0L128 768.064h778.688l-242.112-290.56a32 32 0 0 0-49.216 0L458.752 665.408a32 32 0 0 1-47.232 2.112M256 384a96 96 0 1 0 192.064-.064A96 96 0 0 0 256 384"
      })
    ]));
  }
}), picture_filled_default = _sfc_main195;
var _sfc_main197 = /* @__PURE__ */ defineComponent({
  name: "Picture",
  __name: "picture",
  setup(__props) {
    return (_ctx, _cache) => (openBlock(), createElementBlock("svg", {
      xmlns: "http://www.w3.org/2000/svg",
      viewBox: "0 0 1024 1024"
    }, [
      createBaseVNode("path", {
        fill: "currentColor",
        d: "M160 160v704h704V160zm-32-64h768a32 32 0 0 1 32 32v768a32 32 0 0 1-32 32H128a32 32 0 0 1-32-32V128a32 32 0 0 1 32-32"
      }),
      createBaseVNode("path", {
        fill: "currentColor",
        d: "M384 288q64 0 64 64t-64 64-64-64 64-64M185.408 876.992l-50.816-38.912L350.72 556.032a96 96 0 0 1 134.592-17.856l1.856 1.472 122.88 99.136a32 32 0 0 0 44.992-4.864l216-269.888 49.92 39.936-215.808 269.824-.256.32a96 96 0 0 1-135.04 14.464l-122.88-99.072-.64-.512a32 32 0 0 0-44.8 5.952z"
      })
    ]));
  }
}), picture_default = _sfc_main197;
var _sfc_main201 = /* @__PURE__ */ defineComponent({
  name: "Plus",
  __name: "plus",
  setup(__props) {
    return (_ctx, _cache) => (openBlock(), createElementBlock("svg", {
      xmlns: "http://www.w3.org/2000/svg",
      viewBox: "0 0 1024 1024"
    }, [
      createBaseVNode("path", {
        fill: "currentColor",
        d: "M480 480V128a32 32 0 0 1 64 0v352h352a32 32 0 1 1 0 64H544v352a32 32 0 1 1-64 0V544H128a32 32 0 0 1 0-64z"
      })
    ]));
  }
}), plus_default = _sfc_main201;
var _sfc_main211 = /* @__PURE__ */ defineComponent({
  name: "QuestionFilled",
  __name: "question-filled",
  setup(__props) {
    return (_ctx, _cache) => (openBlock(), createElementBlock("svg", {
      xmlns: "http://www.w3.org/2000/svg",
      viewBox: "0 0 1024 1024"
    }, [
      createBaseVNode("path", {
        fill: "currentColor",
        d: "M512 64a448 448 0 1 1 0 896 448 448 0 0 1 0-896m23.744 191.488c-52.096 0-92.928 14.784-123.2 44.352-30.976 29.568-45.76 70.4-45.76 122.496h80.256c0-29.568 5.632-52.8 17.6-68.992 13.376-19.712 35.2-28.864 66.176-28.864 23.936 0 42.944 6.336 56.32 19.712 12.672 13.376 19.712 31.68 19.712 54.912 0 17.6-6.336 34.496-19.008 49.984l-8.448 9.856c-45.76 40.832-73.216 70.4-82.368 89.408-9.856 19.008-14.08 42.24-14.08 68.992v9.856h80.96v-9.856c0-16.896 3.52-31.68 10.56-45.76 6.336-12.672 15.488-24.64 28.16-35.2 33.792-29.568 54.208-48.576 60.544-55.616 16.896-22.528 26.048-51.392 26.048-86.592q0-64.416-42.24-101.376c-28.16-25.344-65.472-37.312-111.232-37.312m-12.672 406.208a54.27 54.27 0 0 0-38.72 14.784 49.4 49.4 0 0 0-15.488 38.016c0 15.488 4.928 28.16 15.488 38.016A54.85 54.85 0 0 0 523.072 768c15.488 0 28.16-4.928 38.72-14.784a51.52 51.52 0 0 0 16.192-38.72 51.97 51.97 0 0 0-15.488-38.016 55.94 55.94 0 0 0-39.424-14.784"
      })
    ]));
  }
}), question_filled_default = _sfc_main211;
var _sfc_main215 = /* @__PURE__ */ defineComponent({
  name: "RefreshLeft",
  __name: "refresh-left",
  setup(__props) {
    return (_ctx, _cache) => (openBlock(), createElementBlock("svg", {
      xmlns: "http://www.w3.org/2000/svg",
      viewBox: "0 0 1024 1024"
    }, [
      createBaseVNode("path", {
        fill: "currentColor",
        d: "M289.088 296.704h92.992a32 32 0 0 1 0 64H232.96a32 32 0 0 1-32-32V179.712a32 32 0 0 1 64 0v50.56a384 384 0 0 1 643.84 282.88 384 384 0 0 1-383.936 384 384 384 0 0 1-384-384h64a320 320 0 1 0 640 0 320 320 0 0 0-555.712-216.448z"
      })
    ]));
  }
}), refresh_left_default = _sfc_main215;
var _sfc_main216 = /* @__PURE__ */ defineComponent({
  name: "RefreshRight",
  __name: "refresh-right",
  setup(__props) {
    return (_ctx, _cache) => (openBlock(), createElementBlock("svg", {
      xmlns: "http://www.w3.org/2000/svg",
      viewBox: "0 0 1024 1024"
    }, [
      createBaseVNode("path", {
        fill: "currentColor",
        d: "M784.512 230.272v-50.56a32 32 0 1 1 64 0v149.056a32 32 0 0 1-32 32H667.52a32 32 0 1 1 0-64h92.992A320 320 0 1 0 524.8 833.152a320 320 0 0 0 320-320h64a384 384 0 0 1-384 384 384 384 0 0 1-384-384 384 384 0 0 1 643.712-282.88"
      })
    ]));
  }
}), refresh_right_default = _sfc_main216;
var _sfc_main217 = /* @__PURE__ */ defineComponent({
  name: "Refresh",
  __name: "refresh",
  setup(__props) {
    return (_ctx, _cache) => (openBlock(), createElementBlock("svg", {
      xmlns: "http://www.w3.org/2000/svg",
      viewBox: "0 0 1024 1024"
    }, [
      createBaseVNode("path", {
        fill: "currentColor",
        d: "M771.776 794.88A384 384 0 0 1 128 512h64a320 320 0 0 0 555.712 216.448H654.72a32 32 0 1 1 0-64h149.056a32 32 0 0 1 32 32v148.928a32 32 0 1 1-64 0v-50.56zM276.288 295.616h92.992a32 32 0 0 1 0 64H220.16a32 32 0 0 1-32-32V178.56a32 32 0 0 1 64 0v50.56A384 384 0 0 1 896.128 512h-64a320 320 0 0 0-555.776-216.384z"
      })
    ]));
  }
}), refresh_default = _sfc_main217;
var _sfc_main222 = /* @__PURE__ */ defineComponent({
  name: "ScaleToOriginal",
  __name: "scale-to-original",
  setup(__props) {
    return (_ctx, _cache) => (openBlock(), createElementBlock("svg", {
      xmlns: "http://www.w3.org/2000/svg",
      viewBox: "0 0 1024 1024"
    }, [
      createBaseVNode("path", {
        fill: "currentColor",
        d: "M813.176 180.706a60.235 60.235 0 0 1 60.236 60.235v481.883a60.235 60.235 0 0 1-60.236 60.235H210.824a60.235 60.235 0 0 1-60.236-60.235V240.94a60.235 60.235 0 0 1 60.236-60.235h602.352zm0-60.235H210.824A120.47 120.47 0 0 0 90.353 240.94v481.883a120.47 120.47 0 0 0 120.47 120.47h602.353a120.47 120.47 0 0 0 120.471-120.47V240.94a120.47 120.47 0 0 0-120.47-120.47zm-120.47 180.705a30.12 30.12 0 0 0-30.118 30.118v301.177a30.118 30.118 0 0 0 60.236 0V331.294a30.12 30.12 0 0 0-30.118-30.118m-361.412 0a30.12 30.12 0 0 0-30.118 30.118v301.177a30.118 30.118 0 1 0 60.236 0V331.294a30.12 30.12 0 0 0-30.118-30.118M512 361.412a30.12 30.12 0 0 0-30.118 30.117v30.118a30.118 30.118 0 0 0 60.236 0V391.53A30.12 30.12 0 0 0 512 361.412M512 512a30.12 30.12 0 0 0-30.118 30.118v30.117a30.118 30.118 0 0 0 60.236 0v-30.117A30.12 30.12 0 0 0 512 512"
      })
    ]));
  }
}), scale_to_original_default = _sfc_main222;
var _sfc_main225 = /* @__PURE__ */ defineComponent({
  name: "Search",
  __name: "search",
  setup(__props) {
    return (_ctx, _cache) => (openBlock(), createElementBlock("svg", {
      xmlns: "http://www.w3.org/2000/svg",
      viewBox: "0 0 1024 1024"
    }, [
      createBaseVNode("path", {
        fill: "currentColor",
        d: "m795.904 750.72 124.992 124.928a32 32 0 0 1-45.248 45.248L750.656 795.904a416 416 0 1 1 45.248-45.248zM480 832a352 352 0 1 0 0-704 352 352 0 0 0 0 704"
      })
    ]));
  }
}), search_default = _sfc_main225;
var _sfc_main231 = /* @__PURE__ */ defineComponent({
  name: "Setting",
  __name: "setting",
  setup(__props) {
    return (_ctx, _cache) => (openBlock(), createElementBlock("svg", {
      xmlns: "http://www.w3.org/2000/svg",
      viewBox: "0 0 1024 1024"
    }, [
      createBaseVNode("path", {
        fill: "currentColor",
        d: "M600.704 64a32 32 0 0 1 30.464 22.208l35.2 109.376c14.784 7.232 28.928 15.36 42.432 24.512l112.384-24.192a32 32 0 0 1 34.432 15.36L944.32 364.8a32 32 0 0 1-4.032 37.504l-77.12 85.12a357 357 0 0 1 0 49.024l77.12 85.248a32 32 0 0 1 4.032 37.504l-88.704 153.6a32 32 0 0 1-34.432 15.296L708.8 803.904c-13.44 9.088-27.648 17.28-42.368 24.512l-35.264 109.376A32 32 0 0 1 600.704 960H423.296a32 32 0 0 1-30.464-22.208L357.696 828.48a352 352 0 0 1-42.56-24.64l-112.32 24.256a32 32 0 0 1-34.432-15.36L79.68 659.2a32 32 0 0 1 4.032-37.504l77.12-85.248a357 357 0 0 1 0-48.896l-77.12-85.248A32 32 0 0 1 79.68 364.8l88.704-153.6a32 32 0 0 1 34.432-15.296l112.32 24.256c13.568-9.152 27.776-17.408 42.56-24.64l35.2-109.312A32 32 0 0 1 423.232 64H600.64zm-23.424 64H446.72l-36.352 113.088-24.512 11.968a294 294 0 0 0-34.816 20.096l-22.656 15.36-116.224-25.088-65.28 113.152 79.68 88.192-1.92 27.136a293 293 0 0 0 0 40.192l1.92 27.136-79.808 88.192 65.344 113.152 116.224-25.024 22.656 15.296a294 294 0 0 0 34.816 20.096l24.512 11.968L446.72 896h130.688l36.48-113.152 24.448-11.904a288 288 0 0 0 34.752-20.096l22.592-15.296 116.288 25.024 65.28-113.152-79.744-88.192 1.92-27.136a293 293 0 0 0 0-40.256l-1.92-27.136 79.808-88.128-65.344-113.152-116.288 24.96-22.592-15.232a288 288 0 0 0-34.752-20.096l-24.448-11.904L577.344 128zM512 320a192 192 0 1 1 0 384 192 192 0 0 1 0-384m0 64a128 128 0 1 0 0 256 128 128 0 0 0 0-256"
      })
    ]));
  }
}), setting_default = _sfc_main231;
var _sfc_main242 = /* @__PURE__ */ defineComponent({
  name: "SortDown",
  __name: "sort-down",
  setup(__props) {
    return (_ctx, _cache) => (openBlock(), createElementBlock("svg", {
      xmlns: "http://www.w3.org/2000/svg",
      viewBox: "0 0 1024 1024"
    }, [
      createBaseVNode("path", {
        fill: "currentColor",
        d: "M576 96v709.568L333.312 562.816A32 32 0 1 0 288 608l297.408 297.344A32 32 0 0 0 640 882.688V96a32 32 0 0 0-64 0"
      })
    ]));
  }
}), sort_down_default = _sfc_main242;
var _sfc_main243 = /* @__PURE__ */ defineComponent({
  name: "SortUp",
  __name: "sort-up",
  setup(__props) {
    return (_ctx, _cache) => (openBlock(), createElementBlock("svg", {
      xmlns: "http://www.w3.org/2000/svg",
      viewBox: "0 0 1024 1024"
    }, [
      createBaseVNode("path", {
        fill: "currentColor",
        d: "M384 141.248V928a32 32 0 1 0 64 0V218.56l242.688 242.688A32 32 0 1 0 736 416L438.592 118.656A32 32 0 0 0 384 141.248"
      })
    ]));
  }
}), sort_up_default = _sfc_main243;
var _sfc_main246 = /* @__PURE__ */ defineComponent({
  name: "StarFilled",
  __name: "star-filled",
  setup(__props) {
    return (_ctx, _cache) => (openBlock(), createElementBlock("svg", {
      xmlns: "http://www.w3.org/2000/svg",
      viewBox: "0 0 1024 1024"
    }, [
      createBaseVNode("path", {
        fill: "currentColor",
        d: "M313.6 924.48a70.4 70.4 0 0 1-74.152-5.365 70.4 70.4 0 0 1-27.992-68.875l37.888-220.928L88.96 472.96a70.4 70.4 0 0 1 3.788-104.225A70.4 70.4 0 0 1 128 352.896l221.76-32.256 99.2-200.96a70.4 70.4 0 0 1 100.246-28.595 70.4 70.4 0 0 1 25.962 28.595l99.2 200.96 221.824 32.256a70.4 70.4 0 0 1 39.04 120.064L774.72 629.376l37.888 220.928a70.4 70.4 0 0 1-102.144 74.24L512 820.096l-198.4 104.32z"
      })
    ]));
  }
}), star_filled_default = _sfc_main246;
var _sfc_main247 = /* @__PURE__ */ defineComponent({
  name: "Star",
  __name: "star",
  setup(__props) {
    return (_ctx, _cache) => (openBlock(), createElementBlock("svg", {
      xmlns: "http://www.w3.org/2000/svg",
      viewBox: "0 0 1024 1024"
    }, [
      createBaseVNode("path", {
        fill: "currentColor",
        d: "m512 747.84 228.16 119.936a6.4 6.4 0 0 0 9.28-6.72l-43.52-254.08 184.512-179.904a6.4 6.4 0 0 0-3.52-10.88l-255.104-37.12L517.76 147.904a6.4 6.4 0 0 0-11.52 0L392.192 379.072l-255.104 37.12a6.4 6.4 0 0 0-3.52 10.88L318.08 606.976l-43.584 254.08a6.4 6.4 0 0 0 9.28 6.72zM313.6 924.48a70.4 70.4 0 0 1-102.144-74.24l37.888-220.928L88.96 472.96A70.4 70.4 0 0 1 128 352.896l221.76-32.256 99.2-200.96a70.4 70.4 0 0 1 126.208 0l99.2 200.96 221.824 32.256a70.4 70.4 0 0 1 39.04 120.064L774.72 629.376l37.888 220.928a70.4 70.4 0 0 1-102.144 74.24L512 820.096l-198.4 104.32z"
      })
    ]));
  }
}), star_default = _sfc_main247;
var _sfc_main248 = /* @__PURE__ */ defineComponent({
  name: "Stopwatch",
  __name: "stopwatch",
  setup(__props) {
    return (_ctx, _cache) => (openBlock(), createElementBlock("svg", {
      xmlns: "http://www.w3.org/2000/svg",
      viewBox: "0 0 1024 1024"
    }, [
      createBaseVNode("path", {
        fill: "currentColor",
        d: "M512 896a384 384 0 1 0 0-768 384 384 0 0 0 0 768m0 64a448 448 0 1 1 0-896 448 448 0 0 1 0 896"
      }),
      createBaseVNode("path", {
        fill: "currentColor",
        d: "M672 234.88c-39.168 174.464-80 298.624-122.688 372.48-64 110.848-202.624 30.848-138.624-80C453.376 453.44 540.48 355.968 672 234.816z"
      })
    ]));
  }
}), stopwatch_default = _sfc_main248;
var _sfc_main249 = /* @__PURE__ */ defineComponent({
  name: "SuccessFilled",
  __name: "success-filled",
  setup(__props) {
    return (_ctx, _cache) => (openBlock(), createElementBlock("svg", {
      xmlns: "http://www.w3.org/2000/svg",
      viewBox: "0 0 1024 1024"
    }, [
      createBaseVNode("path", {
        fill: "currentColor",
        d: "M512 64a448 448 0 1 1 0 896 448 448 0 0 1 0-896m-55.808 536.384-99.52-99.584a38.4 38.4 0 1 0-54.336 54.336l126.72 126.72a38.27 38.27 0 0 0 54.336 0l262.4-262.464a38.4 38.4 0 1 0-54.272-54.336z"
      })
    ]));
  }
}), success_filled_default = _sfc_main249;
var _sfc_main261 = /* @__PURE__ */ defineComponent({
  name: "Tickets",
  __name: "tickets",
  setup(__props) {
    return (_ctx, _cache) => (openBlock(), createElementBlock("svg", {
      xmlns: "http://www.w3.org/2000/svg",
      viewBox: "0 0 1024 1024"
    }, [
      createBaseVNode("path", {
        fill: "currentColor",
        d: "M192 128v768h640V128zm-32-64h704a32 32 0 0 1 32 32v832a32 32 0 0 1-32 32H160a32 32 0 0 1-32-32V96a32 32 0 0 1 32-32m160 448h384v64H320zm0-192h192v64H320zm0 384h384v64H320z"
      })
    ]));
  }
}), tickets_default = _sfc_main261;
var _sfc_main275 = /* @__PURE__ */ defineComponent({
  name: "Upload",
  __name: "upload",
  setup(__props) {
    return (_ctx, _cache) => (openBlock(), createElementBlock("svg", {
      xmlns: "http://www.w3.org/2000/svg",
      viewBox: "0 0 1024 1024"
    }, [
      createBaseVNode("path", {
        fill: "currentColor",
        d: "M160 832h704a32 32 0 1 1 0 64H160a32 32 0 1 1 0-64m384-578.304V704h-64V247.296L237.248 490.048 192 444.8 508.8 128l316.8 316.8-45.312 45.248z"
      })
    ]));
  }
}), upload_default = _sfc_main275;
var _sfc_main280 = /* @__PURE__ */ defineComponent({
  name: "VideoCamera",
  __name: "video-camera",
  setup(__props) {
    return (_ctx, _cache) => (openBlock(), createElementBlock("svg", {
      xmlns: "http://www.w3.org/2000/svg",
      viewBox: "0 0 1024 1024"
    }, [
      createBaseVNode("path", {
        fill: "currentColor",
        d: "M704 768V256H128v512zm64-416 192-96v512l-192-96v128a32 32 0 0 1-32 32H96a32 32 0 0 1-32-32V224a32 32 0 0 1 32-32h640a32 32 0 0 1 32 32zm0 71.552v176.896l128 64V359.552zM192 320h192v64H192z"
      })
    ]));
  }
}), video_camera_default = _sfc_main280;
var _sfc_main281 = /* @__PURE__ */ defineComponent({
  name: "VideoPause",
  __name: "video-pause",
  setup(__props) {
    return (_ctx, _cache) => (openBlock(), createElementBlock("svg", {
      xmlns: "http://www.w3.org/2000/svg",
      viewBox: "0 0 1024 1024"
    }, [
      createBaseVNode("path", {
        fill: "currentColor",
        d: "M512 64a448 448 0 1 1 0 896 448 448 0 0 1 0-896m0 832a384 384 0 0 0 0-768 384 384 0 0 0 0 768m-96-544q32 0 32 32v256q0 32-32 32t-32-32V384q0-32 32-32m192 0q32 0 32 32v256q0 32-32 32t-32-32V384q0-32 32-32"
      })
    ]));
  }
}), video_pause_default = _sfc_main281;
var _sfc_main282 = /* @__PURE__ */ defineComponent({
  name: "VideoPlay",
  __name: "video-play",
  setup(__props) {
    return (_ctx, _cache) => (openBlock(), createElementBlock("svg", {
      xmlns: "http://www.w3.org/2000/svg",
      viewBox: "0 0 1024 1024"
    }, [
      createBaseVNode("path", {
        fill: "currentColor",
        d: "M512 64a448 448 0 1 1 0 896 448 448 0 0 1 0-896m0 832a384 384 0 0 0 0-768 384 384 0 0 0 0 768m-48-247.616L668.608 512 464 375.616zm10.624-342.656 249.472 166.336a48 48 0 0 1 0 79.872L474.624 718.272A48 48 0 0 1 400 678.336V345.6a48 48 0 0 1 74.624-39.936z"
      })
    ]));
  }
}), video_play_default = _sfc_main282;
var _sfc_main283 = /* @__PURE__ */ defineComponent({
  name: "View",
  __name: "view",
  setup(__props) {
    return (_ctx, _cache) => (openBlock(), createElementBlock("svg", {
      xmlns: "http://www.w3.org/2000/svg",
      viewBox: "0 0 1024 1024"
    }, [
      createBaseVNode("path", {
        fill: "currentColor",
        d: "M512 160c320 0 512 352 512 352S832 864 512 864 0 512 0 512s192-352 512-352m0 64c-225.28 0-384.128 208.064-436.8 288 52.608 79.872 211.456 288 436.8 288 225.28 0 384.128-208.064 436.8-288-52.608-79.872-211.456-288-436.8-288m0 64a224 224 0 1 1 0 448 224 224 0 0 1 0-448m0 64a160.19 160.19 0 0 0-160 160c0 88.192 71.744 160 160 160s160-71.808 160-160-71.744-160-160-160"
      })
    ]));
  }
}), view_default = _sfc_main283;
var _sfc_main287 = /* @__PURE__ */ defineComponent({
  name: "WarningFilled",
  __name: "warning-filled",
  setup(__props) {
    return (_ctx, _cache) => (openBlock(), createElementBlock("svg", {
      xmlns: "http://www.w3.org/2000/svg",
      viewBox: "0 0 1024 1024"
    }, [
      createBaseVNode("path", {
        fill: "currentColor",
        d: "M512 64a448 448 0 1 1 0 896 448 448 0 0 1 0-896m0 192a58.43 58.43 0 0 0-58.24 63.744l23.36 256.384a35.072 35.072 0 0 0 69.76 0l23.296-256.384A58.43 58.43 0 0 0 512 256m0 512a51.2 51.2 0 1 0 0-102.4 51.2 51.2 0 0 0 0 102.4"
      })
    ]));
  }
}), warning_filled_default = _sfc_main287;
var _sfc_main292 = /* @__PURE__ */ defineComponent({
  name: "ZoomIn",
  __name: "zoom-in",
  setup(__props) {
    return (_ctx, _cache) => (openBlock(), createElementBlock("svg", {
      xmlns: "http://www.w3.org/2000/svg",
      viewBox: "0 0 1024 1024"
    }, [
      createBaseVNode("path", {
        fill: "currentColor",
        d: "m795.904 750.72 124.992 124.928a32 32 0 0 1-45.248 45.248L750.656 795.904a416 416 0 1 1 45.248-45.248zM480 832a352 352 0 1 0 0-704 352 352 0 0 0 0 704m-32-384v-96a32 32 0 0 1 64 0v96h96a32 32 0 0 1 0 64h-96v96a32 32 0 0 1-64 0v-96h-96a32 32 0 0 1 0-64z"
      })
    ]));
  }
}), zoom_in_default = _sfc_main292;
var _sfc_main293 = /* @__PURE__ */ defineComponent({
  name: "ZoomOut",
  __name: "zoom-out",
  setup(__props) {
    return (_ctx, _cache) => (openBlock(), createElementBlock("svg", {
      xmlns: "http://www.w3.org/2000/svg",
      viewBox: "0 0 1024 1024"
    }, [
      createBaseVNode("path", {
        fill: "currentColor",
        d: "m795.904 750.72 124.992 124.928a32 32 0 0 1-45.248 45.248L750.656 795.904a416 416 0 1 1 45.248-45.248zM480 832a352 352 0 1 0 0-704 352 352 0 0 0 0 704M352 448h256a32 32 0 0 1 0 64H352a32 32 0 0 1 0-64"
      })
    ]));
  }
}), zoom_out_default = _sfc_main293;
const EVENT_CODE = {
  tab: "Tab",
  enter: "Enter",
  space: "Space",
  left: "ArrowLeft",
  up: "ArrowUp",
  right: "ArrowRight",
  down: "ArrowDown",
  esc: "Escape",
  delete: "Delete",
  backspace: "Backspace",
  numpadEnter: "NumpadEnter",
  pageUp: "PageUp",
  pageDown: "PageDown",
  home: "Home",
  end: "End"
};
const UPDATE_MODEL_EVENT = "update:modelValue";
const CHANGE_EVENT = "change";
const INPUT_EVENT = "input";
const componentSizes = [
  "",
  "default",
  "small",
  "large"
];
var freeGlobal = typeof global == "object" && global && global.Object === Object && global;
var freeSelf = typeof self == "object" && self && self.Object === Object && self;
var root = freeGlobal || freeSelf || Function("return this")();
var Symbol$1 = root.Symbol;
var objectProto$d = Object.prototype;
var hasOwnProperty$a = objectProto$d.hasOwnProperty;
var nativeObjectToString$1 = objectProto$d.toString;
var symToStringTag$1 = Symbol$1 ? Symbol$1.toStringTag : void 0;
function getRawTag(value) {
  var isOwn = hasOwnProperty$a.call(value, symToStringTag$1), tag = value[symToStringTag$1];
  try {
    value[symToStringTag$1] = void 0;
    var unmasked = true;
  } catch (e) {
  }
  var result = nativeObjectToString$1.call(value);
  if (unmasked) {
    if (isOwn) {
      value[symToStringTag$1] = tag;
    } else {
      delete value[symToStringTag$1];
    }
  }
  return result;
}
var objectProto$c = Object.prototype;
var nativeObjectToString = objectProto$c.toString;
function objectToString(value) {
  return nativeObjectToString.call(value);
}
var nullTag = "[object Null]", undefinedTag = "[object Undefined]";
var symToStringTag = Symbol$1 ? Symbol$1.toStringTag : void 0;
function baseGetTag(value) {
  if (value == null) {
    return value === void 0 ? undefinedTag : nullTag;
  }
  return symToStringTag && symToStringTag in Object(value) ? getRawTag(value) : objectToString(value);
}
function isObjectLike(value) {
  return value != null && typeof value == "object";
}
var symbolTag$1 = "[object Symbol]";
function isSymbol(value) {
  return typeof value == "symbol" || isObjectLike(value) && baseGetTag(value) == symbolTag$1;
}
function arrayMap(array, iteratee) {
  var index = -1, length = array == null ? 0 : array.length, result = Array(length);
  while (++index < length) {
    result[index] = iteratee(array[index], index, array);
  }
  return result;
}
var isArray = Array.isArray;
var symbolProto$1 = Symbol$1 ? Symbol$1.prototype : void 0, symbolToString = symbolProto$1 ? symbolProto$1.toString : void 0;
function baseToString(value) {
  if (typeof value == "string") {
    return value;
  }
  if (isArray(value)) {
    return arrayMap(value, baseToString) + "";
  }
  if (isSymbol(value)) {
    return symbolToString ? symbolToString.call(value) : "";
  }
  var result = value + "";
  return result == "0" && 1 / value == -Infinity ? "-0" : result;
}
function isObject$1(value) {
  var type = typeof value;
  return value != null && (type == "object" || type == "function");
}
function identity(value) {
  return value;
}
var asyncTag = "[object AsyncFunction]", funcTag$1 = "[object Function]", genTag = "[object GeneratorFunction]", proxyTag = "[object Proxy]";
function isFunction(value) {
  if (!isObject$1(value)) {
    return false;
  }
  var tag = baseGetTag(value);
  return tag == funcTag$1 || tag == genTag || tag == asyncTag || tag == proxyTag;
}
var coreJsData = root["__core-js_shared__"];
var maskSrcKey = (function() {
  var uid2 = /[^.]+$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || "");
  return uid2 ? "Symbol(src)_1." + uid2 : "";
})();
function isMasked(func) {
  return !!maskSrcKey && maskSrcKey in func;
}
var funcProto$2 = Function.prototype;
var funcToString$2 = funcProto$2.toString;
function toSource(func) {
  if (func != null) {
    try {
      return funcToString$2.call(func);
    } catch (e) {
    }
    try {
      return func + "";
    } catch (e) {
    }
  }
  return "";
}
var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;
var reIsHostCtor = /^\[object .+?Constructor\]$/;
var funcProto$1 = Function.prototype, objectProto$b = Object.prototype;
var funcToString$1 = funcProto$1.toString;
var hasOwnProperty$9 = objectProto$b.hasOwnProperty;
var reIsNative = RegExp(
  "^" + funcToString$1.call(hasOwnProperty$9).replace(reRegExpChar, "\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, "$1.*?") + "$"
);
function baseIsNative(value) {
  if (!isObject$1(value) || isMasked(value)) {
    return false;
  }
  var pattern = isFunction(value) ? reIsNative : reIsHostCtor;
  return pattern.test(toSource(value));
}
function getValue(object, key) {
  return object == null ? void 0 : object[key];
}
function getNative(object, key) {
  var value = getValue(object, key);
  return baseIsNative(value) ? value : void 0;
}
var WeakMap$1 = getNative(root, "WeakMap");
function apply(func, thisArg, args) {
  switch (args.length) {
    case 0:
      return func.call(thisArg);
    case 1:
      return func.call(thisArg, args[0]);
    case 2:
      return func.call(thisArg, args[0], args[1]);
    case 3:
      return func.call(thisArg, args[0], args[1], args[2]);
  }
  return func.apply(thisArg, args);
}
var HOT_COUNT = 800, HOT_SPAN = 16;
var nativeNow = Date.now;
function shortOut(func) {
  var count = 0, lastCalled = 0;
  return function() {
    var stamp = nativeNow(), remaining = HOT_SPAN - (stamp - lastCalled);
    lastCalled = stamp;
    if (remaining > 0) {
      if (++count >= HOT_COUNT) {
        return arguments[0];
      }
    } else {
      count = 0;
    }
    return func.apply(void 0, arguments);
  };
}
function constant(value) {
  return function() {
    return value;
  };
}
var defineProperty = (function() {
  try {
    var func = getNative(Object, "defineProperty");
    func({}, "", {});
    return func;
  } catch (e) {
  }
})();
var baseSetToString = !defineProperty ? identity : function(func, string) {
  return defineProperty(func, "toString", {
    "configurable": true,
    "enumerable": false,
    "value": constant(string),
    "writable": true
  });
};
var setToString = shortOut(baseSetToString);
var MAX_SAFE_INTEGER$1 = 9007199254740991;
var reIsUint = /^(?:0|[1-9]\d*)$/;
function isIndex(value, length) {
  var type = typeof value;
  length = length == null ? MAX_SAFE_INTEGER$1 : length;
  return !!length && (type == "number" || type != "symbol" && reIsUint.test(value)) && (value > -1 && value % 1 == 0 && value < length);
}
function baseAssignValue(object, key, value) {
  if (key == "__proto__" && defineProperty) {
    defineProperty(object, key, {
      "configurable": true,
      "enumerable": true,
      "value": value,
      "writable": true
    });
  } else {
    object[key] = value;
  }
}
function eq(value, other) {
  return value === other || value !== value && other !== other;
}
var objectProto$a = Object.prototype;
var hasOwnProperty$8 = objectProto$a.hasOwnProperty;
function assignValue(object, key, value) {
  var objValue = object[key];
  if (!(hasOwnProperty$8.call(object, key) && eq(objValue, value)) || value === void 0 && !(key in object)) {
    baseAssignValue(object, key, value);
  }
}
var nativeMax = Math.max;
function overRest(func, start, transform) {
  start = nativeMax(start === void 0 ? func.length - 1 : start, 0);
  return function() {
    var args = arguments, index = -1, length = nativeMax(args.length - start, 0), array = Array(length);
    while (++index < length) {
      array[index] = args[start + index];
    }
    index = -1;
    var otherArgs = Array(start + 1);
    while (++index < start) {
      otherArgs[index] = args[index];
    }
    otherArgs[start] = transform(array);
    return apply(func, this, otherArgs);
  };
}
var MAX_SAFE_INTEGER = 9007199254740991;
function isLength(value) {
  return typeof value == "number" && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
}
function isArrayLike(value) {
  return value != null && isLength(value.length) && !isFunction(value);
}
var objectProto$9 = Object.prototype;
function isPrototype(value) {
  var Ctor = value && value.constructor, proto = typeof Ctor == "function" && Ctor.prototype || objectProto$9;
  return value === proto;
}
function baseTimes(n, iteratee) {
  var index = -1, result = Array(n);
  while (++index < n) {
    result[index] = iteratee(index);
  }
  return result;
}
var argsTag$2 = "[object Arguments]";
function baseIsArguments(value) {
  return isObjectLike(value) && baseGetTag(value) == argsTag$2;
}
var objectProto$8 = Object.prototype;
var hasOwnProperty$7 = objectProto$8.hasOwnProperty;
var propertyIsEnumerable$1 = objectProto$8.propertyIsEnumerable;
var isArguments = baseIsArguments(/* @__PURE__ */ (function() {
  return arguments;
})()) ? baseIsArguments : function(value) {
  return isObjectLike(value) && hasOwnProperty$7.call(value, "callee") && !propertyIsEnumerable$1.call(value, "callee");
};
function stubFalse() {
  return false;
}
var freeExports$1 = typeof exports == "object" && exports && !exports.nodeType && exports;
var freeModule$1 = freeExports$1 && typeof module == "object" && module && !module.nodeType && module;
var moduleExports$1 = freeModule$1 && freeModule$1.exports === freeExports$1;
var Buffer = moduleExports$1 ? root.Buffer : void 0;
var nativeIsBuffer = Buffer ? Buffer.isBuffer : void 0;
var isBuffer = nativeIsBuffer || stubFalse;
var argsTag$1 = "[object Arguments]", arrayTag$1 = "[object Array]", boolTag$1 = "[object Boolean]", dateTag$1 = "[object Date]", errorTag$1 = "[object Error]", funcTag = "[object Function]", mapTag$2 = "[object Map]", numberTag$1 = "[object Number]", objectTag$3 = "[object Object]", regexpTag$1 = "[object RegExp]", setTag$2 = "[object Set]", stringTag$1 = "[object String]", weakMapTag$1 = "[object WeakMap]";
var arrayBufferTag$1 = "[object ArrayBuffer]", dataViewTag$2 = "[object DataView]", float32Tag = "[object Float32Array]", float64Tag = "[object Float64Array]", int8Tag = "[object Int8Array]", int16Tag = "[object Int16Array]", int32Tag = "[object Int32Array]", uint8Tag = "[object Uint8Array]", uint8ClampedTag = "[object Uint8ClampedArray]", uint16Tag = "[object Uint16Array]", uint32Tag = "[object Uint32Array]";
var typedArrayTags = {};
typedArrayTags[float32Tag] = typedArrayTags[float64Tag] = typedArrayTags[int8Tag] = typedArrayTags[int16Tag] = typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] = typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] = typedArrayTags[uint32Tag] = true;
typedArrayTags[argsTag$1] = typedArrayTags[arrayTag$1] = typedArrayTags[arrayBufferTag$1] = typedArrayTags[boolTag$1] = typedArrayTags[dataViewTag$2] = typedArrayTags[dateTag$1] = typedArrayTags[errorTag$1] = typedArrayTags[funcTag] = typedArrayTags[mapTag$2] = typedArrayTags[numberTag$1] = typedArrayTags[objectTag$3] = typedArrayTags[regexpTag$1] = typedArrayTags[setTag$2] = typedArrayTags[stringTag$1] = typedArrayTags[weakMapTag$1] = false;
function baseIsTypedArray(value) {
  return isObjectLike(value) && isLength(value.length) && !!typedArrayTags[baseGetTag(value)];
}
function baseUnary(func) {
  return function(value) {
    return func(value);
  };
}
var freeExports = typeof exports == "object" && exports && !exports.nodeType && exports;
var freeModule = freeExports && typeof module == "object" && module && !module.nodeType && module;
var moduleExports = freeModule && freeModule.exports === freeExports;
var freeProcess = moduleExports && freeGlobal.process;
var nodeUtil = (function() {
  try {
    var types = freeModule && freeModule.require && freeModule.require("util").types;
    if (types) {
      return types;
    }
    return freeProcess && freeProcess.binding && freeProcess.binding("util");
  } catch (e) {
  }
})();
var nodeIsTypedArray = nodeUtil && nodeUtil.isTypedArray;
var isTypedArray = nodeIsTypedArray ? baseUnary(nodeIsTypedArray) : baseIsTypedArray;
var objectProto$7 = Object.prototype;
var hasOwnProperty$6 = objectProto$7.hasOwnProperty;
function arrayLikeKeys(value, inherited) {
  var isArr = isArray(value), isArg = !isArr && isArguments(value), isBuff = !isArr && !isArg && isBuffer(value), isType = !isArr && !isArg && !isBuff && isTypedArray(value), skipIndexes = isArr || isArg || isBuff || isType, result = skipIndexes ? baseTimes(value.length, String) : [], length = result.length;
  for (var key in value) {
    if ((inherited || hasOwnProperty$6.call(value, key)) && !(skipIndexes && // Safari 9 has enumerable `arguments.length` in strict mode.
    (key == "length" || // Node.js 0.10 has enumerable non-index properties on buffers.
    isBuff && (key == "offset" || key == "parent") || // PhantomJS 2 has enumerable non-index properties on typed arrays.
    isType && (key == "buffer" || key == "byteLength" || key == "byteOffset") || // Skip index properties.
    isIndex(key, length)))) {
      result.push(key);
    }
  }
  return result;
}
function overArg(func, transform) {
  return function(arg) {
    return func(transform(arg));
  };
}
var nativeKeys = overArg(Object.keys, Object);
var objectProto$6 = Object.prototype;
var hasOwnProperty$5 = objectProto$6.hasOwnProperty;
function baseKeys(object) {
  if (!isPrototype(object)) {
    return nativeKeys(object);
  }
  var result = [];
  for (var key in Object(object)) {
    if (hasOwnProperty$5.call(object, key) && key != "constructor") {
      result.push(key);
    }
  }
  return result;
}
function keys(object) {
  return isArrayLike(object) ? arrayLikeKeys(object) : baseKeys(object);
}
var reIsDeepProp = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/, reIsPlainProp = /^\w*$/;
function isKey(value, object) {
  if (isArray(value)) {
    return false;
  }
  var type = typeof value;
  if (type == "number" || type == "symbol" || type == "boolean" || value == null || isSymbol(value)) {
    return true;
  }
  return reIsPlainProp.test(value) || !reIsDeepProp.test(value) || object != null && value in Object(object);
}
var nativeCreate = getNative(Object, "create");
function hashClear() {
  this.__data__ = nativeCreate ? nativeCreate(null) : {};
  this.size = 0;
}
function hashDelete(key) {
  var result = this.has(key) && delete this.__data__[key];
  this.size -= result ? 1 : 0;
  return result;
}
var HASH_UNDEFINED$2 = "__lodash_hash_undefined__";
var objectProto$5 = Object.prototype;
var hasOwnProperty$4 = objectProto$5.hasOwnProperty;
function hashGet(key) {
  var data = this.__data__;
  if (nativeCreate) {
    var result = data[key];
    return result === HASH_UNDEFINED$2 ? void 0 : result;
  }
  return hasOwnProperty$4.call(data, key) ? data[key] : void 0;
}
var objectProto$4 = Object.prototype;
var hasOwnProperty$3 = objectProto$4.hasOwnProperty;
function hashHas(key) {
  var data = this.__data__;
  return nativeCreate ? data[key] !== void 0 : hasOwnProperty$3.call(data, key);
}
var HASH_UNDEFINED$1 = "__lodash_hash_undefined__";
function hashSet(key, value) {
  var data = this.__data__;
  this.size += this.has(key) ? 0 : 1;
  data[key] = nativeCreate && value === void 0 ? HASH_UNDEFINED$1 : value;
  return this;
}
function Hash(entries) {
  var index = -1, length = entries == null ? 0 : entries.length;
  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}
Hash.prototype.clear = hashClear;
Hash.prototype["delete"] = hashDelete;
Hash.prototype.get = hashGet;
Hash.prototype.has = hashHas;
Hash.prototype.set = hashSet;
function listCacheClear() {
  this.__data__ = [];
  this.size = 0;
}
function assocIndexOf(array, key) {
  var length = array.length;
  while (length--) {
    if (eq(array[length][0], key)) {
      return length;
    }
  }
  return -1;
}
var arrayProto = Array.prototype;
var splice = arrayProto.splice;
function listCacheDelete(key) {
  var data = this.__data__, index = assocIndexOf(data, key);
  if (index < 0) {
    return false;
  }
  var lastIndex = data.length - 1;
  if (index == lastIndex) {
    data.pop();
  } else {
    splice.call(data, index, 1);
  }
  --this.size;
  return true;
}
function listCacheGet(key) {
  var data = this.__data__, index = assocIndexOf(data, key);
  return index < 0 ? void 0 : data[index][1];
}
function listCacheHas(key) {
  return assocIndexOf(this.__data__, key) > -1;
}
function listCacheSet(key, value) {
  var data = this.__data__, index = assocIndexOf(data, key);
  if (index < 0) {
    ++this.size;
    data.push([key, value]);
  } else {
    data[index][1] = value;
  }
  return this;
}
function ListCache(entries) {
  var index = -1, length = entries == null ? 0 : entries.length;
  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}
ListCache.prototype.clear = listCacheClear;
ListCache.prototype["delete"] = listCacheDelete;
ListCache.prototype.get = listCacheGet;
ListCache.prototype.has = listCacheHas;
ListCache.prototype.set = listCacheSet;
var Map$1 = getNative(root, "Map");
function mapCacheClear() {
  this.size = 0;
  this.__data__ = {
    "hash": new Hash(),
    "map": new (Map$1 || ListCache)(),
    "string": new Hash()
  };
}
function isKeyable(value) {
  var type = typeof value;
  return type == "string" || type == "number" || type == "symbol" || type == "boolean" ? value !== "__proto__" : value === null;
}
function getMapData(map, key) {
  var data = map.__data__;
  return isKeyable(key) ? data[typeof key == "string" ? "string" : "hash"] : data.map;
}
function mapCacheDelete(key) {
  var result = getMapData(this, key)["delete"](key);
  this.size -= result ? 1 : 0;
  return result;
}
function mapCacheGet(key) {
  return getMapData(this, key).get(key);
}
function mapCacheHas(key) {
  return getMapData(this, key).has(key);
}
function mapCacheSet(key, value) {
  var data = getMapData(this, key), size = data.size;
  data.set(key, value);
  this.size += data.size == size ? 0 : 1;
  return this;
}
function MapCache(entries) {
  var index = -1, length = entries == null ? 0 : entries.length;
  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}
MapCache.prototype.clear = mapCacheClear;
MapCache.prototype["delete"] = mapCacheDelete;
MapCache.prototype.get = mapCacheGet;
MapCache.prototype.has = mapCacheHas;
MapCache.prototype.set = mapCacheSet;
var FUNC_ERROR_TEXT = "Expected a function";
function memoize(func, resolver) {
  if (typeof func != "function" || resolver != null && typeof resolver != "function") {
    throw new TypeError(FUNC_ERROR_TEXT);
  }
  var memoized = function() {
    var args = arguments, key = resolver ? resolver.apply(this, args) : args[0], cache = memoized.cache;
    if (cache.has(key)) {
      return cache.get(key);
    }
    var result = func.apply(this, args);
    memoized.cache = cache.set(key, result) || cache;
    return result;
  };
  memoized.cache = new (memoize.Cache || MapCache)();
  return memoized;
}
memoize.Cache = MapCache;
var MAX_MEMOIZE_SIZE = 500;
function memoizeCapped(func) {
  var result = memoize(func, function(key) {
    if (cache.size === MAX_MEMOIZE_SIZE) {
      cache.clear();
    }
    return key;
  });
  var cache = result.cache;
  return result;
}
var rePropName = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g;
var reEscapeChar = /\\(\\)?/g;
var stringToPath = memoizeCapped(function(string) {
  var result = [];
  if (string.charCodeAt(0) === 46) {
    result.push("");
  }
  string.replace(rePropName, function(match, number, quote, subString) {
    result.push(quote ? subString.replace(reEscapeChar, "$1") : number || match);
  });
  return result;
});
function toString$1(value) {
  return value == null ? "" : baseToString(value);
}
function castPath(value, object) {
  if (isArray(value)) {
    return value;
  }
  return isKey(value, object) ? [value] : stringToPath(toString$1(value));
}
function toKey(value) {
  if (typeof value == "string" || isSymbol(value)) {
    return value;
  }
  var result = value + "";
  return result == "0" && 1 / value == -Infinity ? "-0" : result;
}
function baseGet(object, path) {
  path = castPath(path, object);
  var index = 0, length = path.length;
  while (object != null && index < length) {
    object = object[toKey(path[index++])];
  }
  return index && index == length ? object : void 0;
}
function get(object, path, defaultValue) {
  var result = object == null ? void 0 : baseGet(object, path);
  return result === void 0 ? defaultValue : result;
}
function arrayPush(array, values) {
  var index = -1, length = values.length, offset = array.length;
  while (++index < length) {
    array[offset + index] = values[index];
  }
  return array;
}
var spreadableSymbol = Symbol$1 ? Symbol$1.isConcatSpreadable : void 0;
function isFlattenable(value) {
  return isArray(value) || isArguments(value) || !!(spreadableSymbol && value && value[spreadableSymbol]);
}
function baseFlatten(array, depth, predicate, isStrict, result) {
  var index = -1, length = array.length;
  predicate || (predicate = isFlattenable);
  result || (result = []);
  while (++index < length) {
    var value = array[index];
    if (depth > 0 && predicate(value)) {
      if (depth > 1) {
        baseFlatten(value, depth - 1, predicate, isStrict, result);
      } else {
        arrayPush(result, value);
      }
    } else if (!isStrict) {
      result[result.length] = value;
    }
  }
  return result;
}
function flatten(array) {
  var length = array == null ? 0 : array.length;
  return length ? baseFlatten(array, 1) : [];
}
function flatRest(func) {
  return setToString(overRest(func, void 0, flatten), func + "");
}
var getPrototype = overArg(Object.getPrototypeOf, Object);
var objectTag$2 = "[object Object]";
var funcProto = Function.prototype, objectProto$3 = Object.prototype;
var funcToString = funcProto.toString;
var hasOwnProperty$2 = objectProto$3.hasOwnProperty;
var objectCtorString = funcToString.call(Object);
function isPlainObject(value) {
  if (!isObjectLike(value) || baseGetTag(value) != objectTag$2) {
    return false;
  }
  var proto = getPrototype(value);
  if (proto === null) {
    return true;
  }
  var Ctor = hasOwnProperty$2.call(proto, "constructor") && proto.constructor;
  return typeof Ctor == "function" && Ctor instanceof Ctor && funcToString.call(Ctor) == objectCtorString;
}
function stackClear() {
  this.__data__ = new ListCache();
  this.size = 0;
}
function stackDelete(key) {
  var data = this.__data__, result = data["delete"](key);
  this.size = data.size;
  return result;
}
function stackGet(key) {
  return this.__data__.get(key);
}
function stackHas(key) {
  return this.__data__.has(key);
}
var LARGE_ARRAY_SIZE = 200;
function stackSet(key, value) {
  var data = this.__data__;
  if (data instanceof ListCache) {
    var pairs = data.__data__;
    if (!Map$1 || pairs.length < LARGE_ARRAY_SIZE - 1) {
      pairs.push([key, value]);
      this.size = ++data.size;
      return this;
    }
    data = this.__data__ = new MapCache(pairs);
  }
  data.set(key, value);
  this.size = data.size;
  return this;
}
function Stack(entries) {
  var data = this.__data__ = new ListCache(entries);
  this.size = data.size;
}
Stack.prototype.clear = stackClear;
Stack.prototype["delete"] = stackDelete;
Stack.prototype.get = stackGet;
Stack.prototype.has = stackHas;
Stack.prototype.set = stackSet;
function arrayFilter(array, predicate) {
  var index = -1, length = array == null ? 0 : array.length, resIndex = 0, result = [];
  while (++index < length) {
    var value = array[index];
    if (predicate(value, index, array)) {
      result[resIndex++] = value;
    }
  }
  return result;
}
function stubArray() {
  return [];
}
var objectProto$2 = Object.prototype;
var propertyIsEnumerable = objectProto$2.propertyIsEnumerable;
var nativeGetSymbols = Object.getOwnPropertySymbols;
var getSymbols = !nativeGetSymbols ? stubArray : function(object) {
  if (object == null) {
    return [];
  }
  object = Object(object);
  return arrayFilter(nativeGetSymbols(object), function(symbol) {
    return propertyIsEnumerable.call(object, symbol);
  });
};
function baseGetAllKeys(object, keysFunc, symbolsFunc) {
  var result = keysFunc(object);
  return isArray(object) ? result : arrayPush(result, symbolsFunc(object));
}
function getAllKeys(object) {
  return baseGetAllKeys(object, keys, getSymbols);
}
var DataView = getNative(root, "DataView");
var Promise$1 = getNative(root, "Promise");
var Set$1 = getNative(root, "Set");
var mapTag$1 = "[object Map]", objectTag$1 = "[object Object]", promiseTag = "[object Promise]", setTag$1 = "[object Set]", weakMapTag = "[object WeakMap]";
var dataViewTag$1 = "[object DataView]";
var dataViewCtorString = toSource(DataView), mapCtorString = toSource(Map$1), promiseCtorString = toSource(Promise$1), setCtorString = toSource(Set$1), weakMapCtorString = toSource(WeakMap$1);
var getTag = baseGetTag;
if (DataView && getTag(new DataView(new ArrayBuffer(1))) != dataViewTag$1 || Map$1 && getTag(new Map$1()) != mapTag$1 || Promise$1 && getTag(Promise$1.resolve()) != promiseTag || Set$1 && getTag(new Set$1()) != setTag$1 || WeakMap$1 && getTag(new WeakMap$1()) != weakMapTag) {
  getTag = function(value) {
    var result = baseGetTag(value), Ctor = result == objectTag$1 ? value.constructor : void 0, ctorString = Ctor ? toSource(Ctor) : "";
    if (ctorString) {
      switch (ctorString) {
        case dataViewCtorString:
          return dataViewTag$1;
        case mapCtorString:
          return mapTag$1;
        case promiseCtorString:
          return promiseTag;
        case setCtorString:
          return setTag$1;
        case weakMapCtorString:
          return weakMapTag;
      }
    }
    return result;
  };
}
var Uint8Array = root.Uint8Array;
var HASH_UNDEFINED = "__lodash_hash_undefined__";
function setCacheAdd(value) {
  this.__data__.set(value, HASH_UNDEFINED);
  return this;
}
function setCacheHas(value) {
  return this.__data__.has(value);
}
function SetCache(values) {
  var index = -1, length = values == null ? 0 : values.length;
  this.__data__ = new MapCache();
  while (++index < length) {
    this.add(values[index]);
  }
}
SetCache.prototype.add = SetCache.prototype.push = setCacheAdd;
SetCache.prototype.has = setCacheHas;
function arraySome(array, predicate) {
  var index = -1, length = array == null ? 0 : array.length;
  while (++index < length) {
    if (predicate(array[index], index, array)) {
      return true;
    }
  }
  return false;
}
function cacheHas(cache, key) {
  return cache.has(key);
}
var COMPARE_PARTIAL_FLAG$3 = 1, COMPARE_UNORDERED_FLAG$1 = 2;
function equalArrays(array, other, bitmask, customizer, equalFunc, stack2) {
  var isPartial = bitmask & COMPARE_PARTIAL_FLAG$3, arrLength = array.length, othLength = other.length;
  if (arrLength != othLength && !(isPartial && othLength > arrLength)) {
    return false;
  }
  var arrStacked = stack2.get(array);
  var othStacked = stack2.get(other);
  if (arrStacked && othStacked) {
    return arrStacked == other && othStacked == array;
  }
  var index = -1, result = true, seen = bitmask & COMPARE_UNORDERED_FLAG$1 ? new SetCache() : void 0;
  stack2.set(array, other);
  stack2.set(other, array);
  while (++index < arrLength) {
    var arrValue = array[index], othValue = other[index];
    if (customizer) {
      var compared = isPartial ? customizer(othValue, arrValue, index, other, array, stack2) : customizer(arrValue, othValue, index, array, other, stack2);
    }
    if (compared !== void 0) {
      if (compared) {
        continue;
      }
      result = false;
      break;
    }
    if (seen) {
      if (!arraySome(other, function(othValue2, othIndex) {
        if (!cacheHas(seen, othIndex) && (arrValue === othValue2 || equalFunc(arrValue, othValue2, bitmask, customizer, stack2))) {
          return seen.push(othIndex);
        }
      })) {
        result = false;
        break;
      }
    } else if (!(arrValue === othValue || equalFunc(arrValue, othValue, bitmask, customizer, stack2))) {
      result = false;
      break;
    }
  }
  stack2["delete"](array);
  stack2["delete"](other);
  return result;
}
function mapToArray(map) {
  var index = -1, result = Array(map.size);
  map.forEach(function(value, key) {
    result[++index] = [key, value];
  });
  return result;
}
function setToArray(set2) {
  var index = -1, result = Array(set2.size);
  set2.forEach(function(value) {
    result[++index] = value;
  });
  return result;
}
var COMPARE_PARTIAL_FLAG$2 = 1, COMPARE_UNORDERED_FLAG = 2;
var boolTag = "[object Boolean]", dateTag = "[object Date]", errorTag = "[object Error]", mapTag = "[object Map]", numberTag = "[object Number]", regexpTag = "[object RegExp]", setTag = "[object Set]", stringTag = "[object String]", symbolTag = "[object Symbol]";
var arrayBufferTag = "[object ArrayBuffer]", dataViewTag = "[object DataView]";
var symbolProto = Symbol$1 ? Symbol$1.prototype : void 0, symbolValueOf = symbolProto ? symbolProto.valueOf : void 0;
function equalByTag(object, other, tag, bitmask, customizer, equalFunc, stack2) {
  switch (tag) {
    case dataViewTag:
      if (object.byteLength != other.byteLength || object.byteOffset != other.byteOffset) {
        return false;
      }
      object = object.buffer;
      other = other.buffer;
    case arrayBufferTag:
      if (object.byteLength != other.byteLength || !equalFunc(new Uint8Array(object), new Uint8Array(other))) {
        return false;
      }
      return true;
    case boolTag:
    case dateTag:
    case numberTag:
      return eq(+object, +other);
    case errorTag:
      return object.name == other.name && object.message == other.message;
    case regexpTag:
    case stringTag:
      return object == other + "";
    case mapTag:
      var convert = mapToArray;
    case setTag:
      var isPartial = bitmask & COMPARE_PARTIAL_FLAG$2;
      convert || (convert = setToArray);
      if (object.size != other.size && !isPartial) {
        return false;
      }
      var stacked = stack2.get(object);
      if (stacked) {
        return stacked == other;
      }
      bitmask |= COMPARE_UNORDERED_FLAG;
      stack2.set(object, other);
      var result = equalArrays(convert(object), convert(other), bitmask, customizer, equalFunc, stack2);
      stack2["delete"](object);
      return result;
    case symbolTag:
      if (symbolValueOf) {
        return symbolValueOf.call(object) == symbolValueOf.call(other);
      }
  }
  return false;
}
var COMPARE_PARTIAL_FLAG$1 = 1;
var objectProto$1 = Object.prototype;
var hasOwnProperty$1 = objectProto$1.hasOwnProperty;
function equalObjects(object, other, bitmask, customizer, equalFunc, stack2) {
  var isPartial = bitmask & COMPARE_PARTIAL_FLAG$1, objProps = getAllKeys(object), objLength = objProps.length, othProps = getAllKeys(other), othLength = othProps.length;
  if (objLength != othLength && !isPartial) {
    return false;
  }
  var index = objLength;
  while (index--) {
    var key = objProps[index];
    if (!(isPartial ? key in other : hasOwnProperty$1.call(other, key))) {
      return false;
    }
  }
  var objStacked = stack2.get(object);
  var othStacked = stack2.get(other);
  if (objStacked && othStacked) {
    return objStacked == other && othStacked == object;
  }
  var result = true;
  stack2.set(object, other);
  stack2.set(other, object);
  var skipCtor = isPartial;
  while (++index < objLength) {
    key = objProps[index];
    var objValue = object[key], othValue = other[key];
    if (customizer) {
      var compared = isPartial ? customizer(othValue, objValue, key, other, object, stack2) : customizer(objValue, othValue, key, object, other, stack2);
    }
    if (!(compared === void 0 ? objValue === othValue || equalFunc(objValue, othValue, bitmask, customizer, stack2) : compared)) {
      result = false;
      break;
    }
    skipCtor || (skipCtor = key == "constructor");
  }
  if (result && !skipCtor) {
    var objCtor = object.constructor, othCtor = other.constructor;
    if (objCtor != othCtor && ("constructor" in object && "constructor" in other) && !(typeof objCtor == "function" && objCtor instanceof objCtor && typeof othCtor == "function" && othCtor instanceof othCtor)) {
      result = false;
    }
  }
  stack2["delete"](object);
  stack2["delete"](other);
  return result;
}
var COMPARE_PARTIAL_FLAG = 1;
var argsTag = "[object Arguments]", arrayTag = "[object Array]", objectTag = "[object Object]";
var objectProto = Object.prototype;
var hasOwnProperty = objectProto.hasOwnProperty;
function baseIsEqualDeep(object, other, bitmask, customizer, equalFunc, stack2) {
  var objIsArr = isArray(object), othIsArr = isArray(other), objTag = objIsArr ? arrayTag : getTag(object), othTag = othIsArr ? arrayTag : getTag(other);
  objTag = objTag == argsTag ? objectTag : objTag;
  othTag = othTag == argsTag ? objectTag : othTag;
  var objIsObj = objTag == objectTag, othIsObj = othTag == objectTag, isSameTag = objTag == othTag;
  if (isSameTag && isBuffer(object)) {
    if (!isBuffer(other)) {
      return false;
    }
    objIsArr = true;
    objIsObj = false;
  }
  if (isSameTag && !objIsObj) {
    stack2 || (stack2 = new Stack());
    return objIsArr || isTypedArray(object) ? equalArrays(object, other, bitmask, customizer, equalFunc, stack2) : equalByTag(object, other, objTag, bitmask, customizer, equalFunc, stack2);
  }
  if (!(bitmask & COMPARE_PARTIAL_FLAG)) {
    var objIsWrapped = objIsObj && hasOwnProperty.call(object, "__wrapped__"), othIsWrapped = othIsObj && hasOwnProperty.call(other, "__wrapped__");
    if (objIsWrapped || othIsWrapped) {
      var objUnwrapped = objIsWrapped ? object.value() : object, othUnwrapped = othIsWrapped ? other.value() : other;
      stack2 || (stack2 = new Stack());
      return equalFunc(objUnwrapped, othUnwrapped, bitmask, customizer, stack2);
    }
  }
  if (!isSameTag) {
    return false;
  }
  stack2 || (stack2 = new Stack());
  return equalObjects(object, other, bitmask, customizer, equalFunc, stack2);
}
function baseIsEqual(value, other, bitmask, customizer, stack2) {
  if (value === other) {
    return true;
  }
  if (value == null || other == null || !isObjectLike(value) && !isObjectLike(other)) {
    return value !== value && other !== other;
  }
  return baseIsEqualDeep(value, other, bitmask, customizer, baseIsEqual, stack2);
}
function baseHasIn(object, key) {
  return object != null && key in Object(object);
}
function hasPath(object, path, hasFunc) {
  path = castPath(path, object);
  var index = -1, length = path.length, result = false;
  while (++index < length) {
    var key = toKey(path[index]);
    if (!(result = object != null && hasFunc(object, key))) {
      break;
    }
    object = object[key];
  }
  if (result || ++index != length) {
    return result;
  }
  length = object == null ? 0 : object.length;
  return !!length && isLength(length) && isIndex(key, length) && (isArray(object) || isArguments(object));
}
function hasIn(object, path) {
  return object != null && hasPath(object, path, baseHasIn);
}
function fromPairs(pairs) {
  var index = -1, length = pairs == null ? 0 : pairs.length, result = {};
  while (++index < length) {
    var pair = pairs[index];
    baseAssignValue(result, pair[0], pair[1]);
  }
  return result;
}
function isEqual(value, other) {
  return baseIsEqual(value, other);
}
function isNil(value) {
  return value == null;
}
function baseSet(object, path, value, customizer) {
  if (!isObject$1(object)) {
    return object;
  }
  path = castPath(path, object);
  var index = -1, length = path.length, lastIndex = length - 1, nested = object;
  while (nested != null && ++index < length) {
    var key = toKey(path[index]), newValue = value;
    if (key === "__proto__" || key === "constructor" || key === "prototype") {
      return object;
    }
    if (index != lastIndex) {
      var objValue = nested[key];
      newValue = void 0;
      if (newValue === void 0) {
        newValue = isObject$1(objValue) ? objValue : isIndex(path[index + 1]) ? [] : {};
      }
    }
    assignValue(nested, key, newValue);
    nested = nested[key];
  }
  return object;
}
function basePickBy(object, paths, predicate) {
  var index = -1, length = paths.length, result = {};
  while (++index < length) {
    var path = paths[index], value = baseGet(object, path);
    if (predicate(value, path)) {
      baseSet(result, castPath(path, object), value);
    }
  }
  return result;
}
function basePick(object, paths) {
  return basePickBy(object, paths, function(value, path) {
    return hasIn(object, path);
  });
}
var pick = flatRest(function(object, paths) {
  return object == null ? {} : basePick(object, paths);
});
function set(object, path, value) {
  return object == null ? object : baseSet(object, path, value);
}
const isUndefined = (val) => val === void 0;
const isBoolean = (val) => typeof val === "boolean";
const isNumber = (val) => typeof val === "number";
const isEmpty = (val) => !val && val !== 0 || isArray$1(val) && val.length === 0 || isObject$2(val) && !Object.keys(val).length;
const isElement = (e) => {
  if (typeof Element === "undefined") return false;
  return e instanceof Element;
};
const isPropAbsent = (prop) => isNil(prop);
const isStringNumber = (val) => {
  if (!isString(val)) return false;
  return !Number.isNaN(Number(val));
};
const isWindow = (val) => val === window;
const keysOf = (arr) => Object.keys(arr);
const entriesOf = (arr) => Object.entries(arr);
const getProp = (obj, path, defaultValue) => {
  return {
    get value() {
      return get(obj, path, defaultValue);
    },
    set value(val) {
      set(obj, path, val);
    }
  };
};
const epPropKey = "__epPropKey";
const definePropType = (val) => val;
const isEpProp = (val) => isObject$2(val) && !!val["__epPropKey"];
const buildProp = (prop, key) => {
  if (!isObject$2(prop) || isEpProp(prop)) return prop;
  const { values, required, default: defaultValue, type, validator } = prop;
  const epProp = {
    type,
    required: !!required,
    validator: values || validator ? (val) => {
      let valid = false;
      let allowedValues = [];
      if (values) {
        allowedValues = Array.from(values);
        if (hasOwn(prop, "default")) allowedValues.push(defaultValue);
        valid ||= allowedValues.includes(val);
      }
      if (validator) valid ||= validator(val);
      if (!valid && allowedValues.length > 0) {
        const allowValuesText = [...new Set(allowedValues)].map((value) => JSON.stringify(value)).join(", ");
        warn(`Invalid prop: validation failed${key ? ` for prop "${key}"` : ""}. Expected one of [${allowValuesText}], got value ${JSON.stringify(val)}.`);
      }
      return valid;
    } : void 0,
    [epPropKey]: true
  };
  if (hasOwn(prop, "default")) epProp.default = defaultValue;
  return epProp;
};
const buildProps = (props) => fromPairs(Object.entries(props).map(([key, option]) => [key, buildProp(option, key)]));
var ElementPlusError = class extends Error {
  constructor(m) {
    super(m);
    this.name = "ElementPlusError";
  }
};
function throwError(scope, m) {
  throw new ElementPlusError(`[${scope}] ${m}`);
}
function debugWarn(scope, message2) {
  {
    const error = isString(scope) ? new ElementPlusError(`[${scope}] ${message2}`) : scope;
    console.warn(error);
  }
}
function computedEager(fn, options) {
  var _options$flush;
  const result = /* @__PURE__ */ shallowRef();
  watchEffect(() => {
    result.value = fn();
  }, {
    ...options,
    flush: (_options$flush = options === null || options === void 0 ? void 0 : options.flush) !== null && _options$flush !== void 0 ? _options$flush : "sync"
  });
  return /* @__PURE__ */ readonly(result);
}
function tryOnScopeDispose(fn, failSilently) {
  if (getCurrentScope()) {
    onScopeDispose(fn, failSilently);
    return true;
  }
  return false;
}
const localProvidedStateMap = /* @__PURE__ */ new WeakMap();
const injectLocal = /* @__NO_SIDE_EFFECTS__ */ (...args) => {
  var _getCurrentInstance;
  const key = args[0];
  const instance = (_getCurrentInstance = getCurrentInstance()) === null || _getCurrentInstance === void 0 ? void 0 : _getCurrentInstance.proxy;
  const owner = instance !== null && instance !== void 0 ? instance : getCurrentScope();
  if (owner == null && !hasInjectionContext()) throw new Error("injectLocal must be called in setup");
  if (owner && localProvidedStateMap.has(owner) && key in localProvidedStateMap.get(owner)) return localProvidedStateMap.get(owner)[key];
  return inject(...args);
};
const isClient = typeof window !== "undefined" && typeof document !== "undefined";
typeof WorkerGlobalScope !== "undefined" && globalThis instanceof WorkerGlobalScope;
const isDef = (val) => typeof val !== "undefined";
const notNullish = (val) => val != null;
const toString = Object.prototype.toString;
const isObject = (val) => toString.call(val) === "[object Object]";
const clamp = (n, min, max) => Math.min(max, Math.max(min, n));
const noop = () => {
};
const isIOS = /* @__PURE__ */ getIsIOS();
function getIsIOS() {
  var _window, _window2, _window3;
  return isClient && !!((_window = window) === null || _window === void 0 || (_window = _window.navigator) === null || _window === void 0 ? void 0 : _window.userAgent) && (/iP(?:ad|hone|od)/.test(window.navigator.userAgent) || ((_window2 = window) === null || _window2 === void 0 || (_window2 = _window2.navigator) === null || _window2 === void 0 ? void 0 : _window2.maxTouchPoints) > 2 && /iPad|Macintosh/.test((_window3 = window) === null || _window3 === void 0 ? void 0 : _window3.navigator.userAgent));
}
function createFilterWrapper(filter, fn) {
  function wrapper(...args) {
    return new Promise((resolve2, reject) => {
      Promise.resolve(filter(() => fn.apply(this, args), {
        fn,
        thisArg: this,
        args
      })).then(resolve2).catch(reject);
    });
  }
  return wrapper;
}
function debounceFilter(ms, options = {}) {
  let timer;
  let maxTimer;
  let lastRejector = noop;
  const _clearTimeout = (timer2) => {
    clearTimeout(timer2);
    lastRejector();
    lastRejector = noop;
  };
  let lastInvoker;
  const filter = (invoke) => {
    const duration = toValue(ms);
    const maxDuration = toValue(options.maxWait);
    if (timer) _clearTimeout(timer);
    if (duration <= 0 || maxDuration !== void 0 && maxDuration <= 0) {
      if (maxTimer) {
        _clearTimeout(maxTimer);
        maxTimer = void 0;
      }
      return Promise.resolve(invoke());
    }
    return new Promise((resolve2, reject) => {
      lastRejector = options.rejectOnCancel ? reject : resolve2;
      lastInvoker = invoke;
      if (maxDuration && !maxTimer) maxTimer = setTimeout(() => {
        if (timer) _clearTimeout(timer);
        maxTimer = void 0;
        resolve2(lastInvoker());
      }, maxDuration);
      timer = setTimeout(() => {
        if (maxTimer) _clearTimeout(maxTimer);
        maxTimer = void 0;
        resolve2(invoke());
      }, duration);
    });
  };
  return filter;
}
function throttleFilter(...args) {
  let lastExec = 0;
  let timer;
  let isLeading = true;
  let lastRejector = noop;
  let lastValue;
  let ms;
  let trailing;
  let leading;
  let rejectOnCancel;
  if (!/* @__PURE__ */ isRef(args[0]) && typeof args[0] === "object") ({ delay: ms, trailing = true, leading = true, rejectOnCancel = false } = args[0]);
  else [ms, trailing = true, leading = true, rejectOnCancel = false] = args;
  const clear = () => {
    if (timer) {
      clearTimeout(timer);
      timer = void 0;
      lastRejector();
      lastRejector = noop;
    }
  };
  const filter = (_invoke) => {
    const duration = toValue(ms);
    const elapsed = Date.now() - lastExec;
    const invoke = () => {
      return lastValue = _invoke();
    };
    clear();
    if (duration <= 0) {
      lastExec = Date.now();
      return invoke();
    }
    if (elapsed > duration) {
      lastExec = Date.now();
      if (leading || !isLeading) invoke();
    } else if (trailing) lastValue = new Promise((resolve2, reject) => {
      lastRejector = rejectOnCancel ? reject : resolve2;
      timer = setTimeout(() => {
        lastExec = Date.now();
        isLeading = true;
        resolve2(invoke());
        clear();
      }, Math.max(0, duration - elapsed));
    });
    if (!leading && !timer) timer = setTimeout(() => isLeading = true, duration);
    isLeading = false;
    return lastValue;
  };
  return filter;
}
function pxValue(px) {
  return px.endsWith("rem") ? Number.parseFloat(px) * 16 : Number.parseFloat(px);
}
function toArray(value) {
  return Array.isArray(value) ? value : [value];
}
function getLifeCycleTarget(target) {
  return getCurrentInstance();
}
function toReactive(objectRef) {
  if (!/* @__PURE__ */ isRef(objectRef)) return /* @__PURE__ */ reactive(objectRef);
  return /* @__PURE__ */ reactive(new Proxy({}, {
    get(_, p2, receiver) {
      return unref(Reflect.get(objectRef.value, p2, receiver));
    },
    set(_, p2, value) {
      if (/* @__PURE__ */ isRef(objectRef.value[p2]) && !/* @__PURE__ */ isRef(value)) objectRef.value[p2].value = value;
      else objectRef.value[p2] = value;
      return true;
    },
    deleteProperty(_, p2) {
      return Reflect.deleteProperty(objectRef.value, p2);
    },
    has(_, p2) {
      return Reflect.has(objectRef.value, p2);
    },
    ownKeys() {
      return Object.keys(objectRef.value);
    },
    getOwnPropertyDescriptor() {
      return {
        enumerable: true,
        configurable: true
      };
    }
  }));
}
function reactiveComputed(fn) {
  return toReactive(computed(fn));
}
// @__NO_SIDE_EFFECTS__
function useDebounceFn(fn, ms = 200, options = {}) {
  return createFilterWrapper(debounceFilter(ms, options), fn);
}
function refDebounced(value, ms = 200, options = {}) {
  const debounced = /* @__PURE__ */ ref(toValue(value));
  const updater = /* @__PURE__ */ useDebounceFn(() => {
    debounced.value = value.value;
  }, ms, options);
  watch(value, () => updater());
  return /* @__PURE__ */ shallowReadonly(debounced);
}
// @__NO_SIDE_EFFECTS__
function useThrottleFn(fn, ms = 200, trailing = false, leading = true, rejectOnCancel = false) {
  return createFilterWrapper(throttleFilter(ms, trailing, leading, rejectOnCancel), fn);
}
function tryOnMounted(fn, sync = true, target) {
  if (getLifeCycleTarget()) onMounted(fn, target);
  else if (sync) fn();
  else nextTick(fn);
}
function useTimeoutFn(cb, interval, options = {}) {
  const { immediate = true, immediateCallback = false } = options;
  const isPending = /* @__PURE__ */ shallowRef(false);
  let timer;
  function clear() {
    if (timer) {
      clearTimeout(timer);
      timer = void 0;
    }
  }
  function stop() {
    isPending.value = false;
    clear();
  }
  function start(...args) {
    if (immediateCallback) cb();
    clear();
    isPending.value = true;
    timer = setTimeout(() => {
      isPending.value = false;
      timer = void 0;
      cb(...args);
    }, toValue(interval));
  }
  if (immediate) {
    isPending.value = true;
    if (isClient) start();
  }
  tryOnScopeDispose(stop);
  return {
    isPending: /* @__PURE__ */ shallowReadonly(isPending),
    start,
    stop
  };
}
function watchImmediate(source, cb, options) {
  return watch(source, cb, {
    ...options,
    immediate: true
  });
}
const defaultWindow = isClient ? window : void 0;
const defaultDocument = isClient ? window.document : void 0;
function unrefElement(elRef) {
  var _$el;
  const plain = toValue(elRef);
  return (_$el = plain === null || plain === void 0 ? void 0 : plain.$el) !== null && _$el !== void 0 ? _$el : plain;
}
function useEventListener(...args) {
  const register = (el, event, listener, options) => {
    el.addEventListener(event, listener, options);
    return () => el.removeEventListener(event, listener, options);
  };
  const firstParamTargets = computed(() => {
    const test = toArray(toValue(args[0])).filter((e) => e != null);
    return test.every((e) => typeof e !== "string") ? test : void 0;
  });
  return watchImmediate(() => {
    var _firstParamTargets$va, _firstParamTargets$va2;
    return [
      (_firstParamTargets$va = (_firstParamTargets$va2 = firstParamTargets.value) === null || _firstParamTargets$va2 === void 0 ? void 0 : _firstParamTargets$va2.map((e) => unrefElement(e))) !== null && _firstParamTargets$va !== void 0 ? _firstParamTargets$va : [defaultWindow].filter((e) => e != null),
      toArray(toValue(firstParamTargets.value ? args[1] : args[0])),
      toArray(unref(firstParamTargets.value ? args[2] : args[1])),
      toValue(firstParamTargets.value ? args[3] : args[2])
    ];
  }, ([raw_targets, raw_events, raw_listeners, raw_options], _, onCleanup) => {
    if (!(raw_targets === null || raw_targets === void 0 ? void 0 : raw_targets.length) || !(raw_events === null || raw_events === void 0 ? void 0 : raw_events.length) || !(raw_listeners === null || raw_listeners === void 0 ? void 0 : raw_listeners.length)) return;
    const optionsClone = isObject(raw_options) ? { ...raw_options } : raw_options;
    const cleanups = raw_targets.flatMap((el) => raw_events.flatMap((event) => raw_listeners.map((listener) => register(el, event, listener, optionsClone))));
    onCleanup(() => {
      cleanups.forEach((fn) => fn());
    });
  }, { flush: "post" });
}
let _iOSWorkaround = false;
function onClickOutside(target, handler, options = {}) {
  const { window: window2 = defaultWindow, ignore = [], capture = true, detectIframe = false, controls = false } = options;
  if (!window2) return controls ? {
    stop: noop,
    cancel: noop,
    trigger: noop
  } : noop;
  if (isIOS && !_iOSWorkaround) {
    _iOSWorkaround = true;
    const listenerOptions = { passive: true };
    Array.from(window2.document.body.children).forEach((el) => el.addEventListener("click", noop, listenerOptions));
    window2.document.documentElement.addEventListener("click", noop, listenerOptions);
  }
  let shouldListen = true;
  const shouldIgnore = (event) => {
    return toValue(ignore).some((target2) => {
      if (typeof target2 === "string") return Array.from(window2.document.querySelectorAll(target2)).some((el) => el === event.target || event.composedPath().includes(el));
      else {
        const el = unrefElement(target2);
        return el && (event.target === el || event.composedPath().includes(el));
      }
    });
  };
  function hasMultipleRoots(target2) {
    const vm = toValue(target2);
    return vm && vm.$.subTree.shapeFlag === 16;
  }
  function checkMultipleRoots(target2, event) {
    const vm = toValue(target2);
    const children = vm.$.subTree && vm.$.subTree.children;
    if (children == null || !Array.isArray(children)) return false;
    return children.some((child) => child.el === event.target || event.composedPath().includes(child.el));
  }
  const listener = (event) => {
    const el = unrefElement(target);
    if (event.target == null) return;
    if (!(el instanceof Element) && hasMultipleRoots(target) && checkMultipleRoots(target, event)) return;
    if (!el || el === event.target || event.composedPath().includes(el)) return;
    if ("detail" in event && event.detail === 0) shouldListen = !shouldIgnore(event);
    if (!shouldListen) {
      shouldListen = true;
      return;
    }
    handler(event);
  };
  let isProcessingClick = false;
  const cleanup = [
    useEventListener(window2, "click", (event) => {
      if (!isProcessingClick) {
        isProcessingClick = true;
        setTimeout(() => {
          isProcessingClick = false;
        }, 0);
        listener(event);
      }
    }, {
      passive: true,
      capture
    }),
    useEventListener(window2, "pointerdown", (e) => {
      const el = unrefElement(target);
      shouldListen = !shouldIgnore(e) && !!(el && !e.composedPath().includes(el));
    }, { passive: true }),
    detectIframe && useEventListener(window2, "blur", (event) => {
      setTimeout(() => {
        const el = unrefElement(target);
        let activeEl = window2.document.activeElement;
        while (activeEl === null || activeEl === void 0 ? void 0 : activeEl.shadowRoot) activeEl = activeEl.shadowRoot.activeElement;
        if ((activeEl === null || activeEl === void 0 ? void 0 : activeEl.tagName) === "IFRAME" && !(el === null || el === void 0 ? void 0 : el.contains(window2.document.activeElement))) handler(event);
      }, 0);
    }, { passive: true })
  ].filter(Boolean);
  const stop = () => cleanup.forEach((fn) => fn());
  if (controls) return {
    stop,
    cancel: () => {
      shouldListen = false;
    },
    trigger: (event) => {
      shouldListen = true;
      listener(event);
      shouldListen = false;
    }
  };
  return stop;
}
// @__NO_SIDE_EFFECTS__
function useMounted() {
  const isMounted = /* @__PURE__ */ shallowRef(false);
  const instance = getCurrentInstance();
  if (instance) onMounted(() => {
    isMounted.value = true;
  }, instance);
  return isMounted;
}
// @__NO_SIDE_EFFECTS__
function useSupported(callback) {
  const isMounted = /* @__PURE__ */ useMounted();
  return computed(() => {
    isMounted.value;
    return Boolean(callback());
  });
}
function useMutationObserver(target, callback, options = {}) {
  const { window: window2 = defaultWindow, ...mutationOptions } = options;
  let observer;
  const isSupported = /* @__PURE__ */ useSupported(() => window2 && "MutationObserver" in window2);
  const cleanup = () => {
    if (observer) {
      observer.disconnect();
      observer = void 0;
    }
  };
  const stopWatch = watch(computed(() => {
    const items = toArray(toValue(target)).map(unrefElement).filter(notNullish);
    return new Set(items);
  }), (newTargets) => {
    cleanup();
    if (isSupported.value && newTargets.size) {
      observer = new MutationObserver(callback);
      newTargets.forEach((el) => observer.observe(el, mutationOptions));
    }
  }, {
    immediate: true,
    flush: "post"
  });
  const takeRecords = () => {
    return observer === null || observer === void 0 ? void 0 : observer.takeRecords();
  };
  const stop = () => {
    stopWatch();
    cleanup();
  };
  tryOnScopeDispose(stop);
  return {
    isSupported,
    stop,
    takeRecords
  };
}
function onElementRemoval(target, callback, options = {}) {
  const { window: window2 = defaultWindow, document: document2 = window2 === null || window2 === void 0 ? void 0 : window2.document, flush = "sync" } = options;
  if (!window2 || !document2) return noop;
  let stopFn;
  const cleanupAndUpdate = (fn) => {
    stopFn === null || stopFn === void 0 || stopFn();
    stopFn = fn;
  };
  const stopWatch = watchEffect(() => {
    const el = unrefElement(target);
    if (el) {
      const { stop } = useMutationObserver(document2, (mutationsList) => {
        if (mutationsList.map((mutation) => [...mutation.removedNodes]).flat().some((node) => node === el || node.contains(el))) callback(mutationsList);
      }, {
        window: window2,
        childList: true,
        subtree: true
      });
      cleanupAndUpdate(stop);
    }
  }, { flush });
  const stopHandle = () => {
    stopWatch();
    cleanupAndUpdate();
  };
  tryOnScopeDispose(stopHandle);
  return stopHandle;
}
// @__NO_SIDE_EFFECTS__
function useActiveElement(options = {}) {
  var _options$document;
  const { window: window2 = defaultWindow, deep = true, triggerOnRemoval = false } = options;
  const document2 = (_options$document = options.document) !== null && _options$document !== void 0 ? _options$document : window2 === null || window2 === void 0 ? void 0 : window2.document;
  const getDeepActiveElement = () => {
    let element = document2 === null || document2 === void 0 ? void 0 : document2.activeElement;
    if (deep) {
      var _element$shadowRoot;
      while (element === null || element === void 0 ? void 0 : element.shadowRoot) element = element === null || element === void 0 || (_element$shadowRoot = element.shadowRoot) === null || _element$shadowRoot === void 0 ? void 0 : _element$shadowRoot.activeElement;
    }
    return element;
  };
  const activeElement = /* @__PURE__ */ shallowRef();
  const trigger2 = () => {
    activeElement.value = getDeepActiveElement();
  };
  if (window2) {
    const listenerOptions = {
      capture: true,
      passive: true
    };
    useEventListener(window2, "blur", (event) => {
      if (event.relatedTarget !== null) return;
      trigger2();
    }, listenerOptions);
    useEventListener(window2, "focus", trigger2, listenerOptions);
  }
  if (triggerOnRemoval) onElementRemoval(activeElement, trigger2, { document: document2 });
  trigger2();
  return activeElement;
}
const ssrWidthSymbol = /* @__PURE__ */ Symbol("vueuse-ssr-width");
// @__NO_SIDE_EFFECTS__
function useSSRWidth() {
  const ssrWidth = hasInjectionContext() ? /* @__PURE__ */ injectLocal(ssrWidthSymbol, null) : null;
  return typeof ssrWidth === "number" ? ssrWidth : void 0;
}
function useMediaQuery(query, options = {}) {
  const { window: window2 = defaultWindow, ssrWidth = /* @__PURE__ */ useSSRWidth() } = options;
  const isSupported = /* @__PURE__ */ useSupported(() => window2 && "matchMedia" in window2 && typeof window2.matchMedia === "function");
  const ssrSupport = /* @__PURE__ */ shallowRef(typeof ssrWidth === "number");
  const mediaQuery = /* @__PURE__ */ shallowRef();
  const matches = /* @__PURE__ */ shallowRef(false);
  const handler = (event) => {
    matches.value = event.matches;
  };
  watchEffect(() => {
    if (ssrSupport.value) {
      ssrSupport.value = !isSupported.value;
      matches.value = toValue(query).split(",").some((queryString) => {
        const not = queryString.includes("not all");
        const minWidth = queryString.match(/\(\s*min-width:\s*(-?\d+(?:\.\d*)?[a-z]+\s*)\)/);
        const maxWidth = queryString.match(/\(\s*max-width:\s*(-?\d+(?:\.\d*)?[a-z]+\s*)\)/);
        let res = Boolean(minWidth || maxWidth);
        if (minWidth && res) res = ssrWidth >= pxValue(minWidth[1]);
        if (maxWidth && res) res = ssrWidth <= pxValue(maxWidth[1]);
        return not ? !res : res;
      });
      return;
    }
    if (!isSupported.value) return;
    mediaQuery.value = window2.matchMedia(toValue(query));
    matches.value = mediaQuery.value.matches;
  });
  useEventListener(mediaQuery, "change", handler, { passive: true });
  return computed(() => matches.value);
}
function cloneFnJSON(source) {
  return JSON.parse(JSON.stringify(source));
}
function useCssVar(prop, target, options = {}) {
  const { window: window2 = defaultWindow, initialValue, observe = false } = options;
  const variable = /* @__PURE__ */ shallowRef(initialValue);
  const elRef = computed(() => {
    var _window$document;
    return unrefElement(target) || (window2 === null || window2 === void 0 || (_window$document = window2.document) === null || _window$document === void 0 ? void 0 : _window$document.documentElement);
  });
  function updateCssVar() {
    const key = toValue(prop);
    const el = toValue(elRef);
    if (el && window2 && key) {
      var _window$getComputedSt;
      variable.value = ((_window$getComputedSt = window2.getComputedStyle(el).getPropertyValue(key)) === null || _window$getComputedSt === void 0 ? void 0 : _window$getComputedSt.trim()) || variable.value || initialValue;
    }
  }
  if (observe) useMutationObserver(elRef, updateCssVar, {
    attributeFilter: ["style", "class"],
    window: window2
  });
  watch([elRef, () => toValue(prop)], (_, old) => {
    if (old[0] && old[1]) old[0].style.removeProperty(old[1]);
    updateCssVar();
  }, { immediate: true });
  watch([variable, elRef], ([val, el]) => {
    const raw_prop = toValue(prop);
    if ((el === null || el === void 0 ? void 0 : el.style) && raw_prop) if (val == null) el.style.removeProperty(raw_prop);
    else el.style.setProperty(raw_prop, val);
  }, { immediate: true });
  return variable;
}
// @__NO_SIDE_EFFECTS__
function useDocumentVisibility(options = {}) {
  const { document: document2 = defaultDocument } = options;
  if (!document2) return /* @__PURE__ */ shallowRef("visible");
  const visibility = /* @__PURE__ */ shallowRef(document2.visibilityState);
  useEventListener(document2, "visibilitychange", () => {
    visibility.value = document2.visibilityState;
  }, { passive: true });
  return visibility;
}
function useResizeObserver(target, callback, options = {}) {
  const { window: window2 = defaultWindow, ...observerOptions } = options;
  let observer;
  const isSupported = /* @__PURE__ */ useSupported(() => window2 && "ResizeObserver" in window2);
  const cleanup = () => {
    if (observer) {
      observer.disconnect();
      observer = void 0;
    }
  };
  const stopWatch = watch(computed(() => {
    const _targets = toValue(target);
    return Array.isArray(_targets) ? _targets.map((el) => unrefElement(el)) : [unrefElement(_targets)];
  }), (els) => {
    cleanup();
    if (isSupported.value && window2) {
      observer = new ResizeObserver(callback);
      for (const _el of els) if (_el) observer.observe(_el, observerOptions);
    }
  }, {
    immediate: true,
    flush: "post"
  });
  const stop = () => {
    cleanup();
    stopWatch();
  };
  tryOnScopeDispose(stop);
  return {
    isSupported,
    stop
  };
}
function useElementBounding(target, options = {}) {
  const { reset = true, windowResize = true, windowScroll = true, immediate = true, updateTiming = "sync" } = options;
  const height = /* @__PURE__ */ shallowRef(0);
  const bottom = /* @__PURE__ */ shallowRef(0);
  const left = /* @__PURE__ */ shallowRef(0);
  const right = /* @__PURE__ */ shallowRef(0);
  const top = /* @__PURE__ */ shallowRef(0);
  const width = /* @__PURE__ */ shallowRef(0);
  const x = /* @__PURE__ */ shallowRef(0);
  const y = /* @__PURE__ */ shallowRef(0);
  function recalculate() {
    const el = unrefElement(target);
    if (!el) {
      if (reset) {
        height.value = 0;
        bottom.value = 0;
        left.value = 0;
        right.value = 0;
        top.value = 0;
        width.value = 0;
        x.value = 0;
        y.value = 0;
      }
      return;
    }
    const rect = el.getBoundingClientRect();
    height.value = rect.height;
    bottom.value = rect.bottom;
    left.value = rect.left;
    right.value = rect.right;
    top.value = rect.top;
    width.value = rect.width;
    x.value = rect.x;
    y.value = rect.y;
  }
  function update() {
    if (updateTiming === "sync") recalculate();
    else if (updateTiming === "next-frame") requestAnimationFrame(() => recalculate());
  }
  useResizeObserver(target, update);
  watch(() => unrefElement(target), (ele) => !ele && update());
  useMutationObserver(target, update, { attributeFilter: ["style", "class"] });
  if (windowScroll) useEventListener("scroll", update, {
    capture: true,
    passive: true
  });
  if (windowResize) useEventListener("resize", update, { passive: true });
  tryOnMounted(() => {
    if (immediate) update();
  });
  return {
    height,
    bottom,
    left,
    right,
    top,
    width,
    x,
    y,
    update
  };
}
function useElementSize(target, initialSize = {
  width: 0,
  height: 0
}, options = {}) {
  const { window: window2 = defaultWindow, box = "content-box" } = options;
  const isSVG = computed(() => {
    var _unrefElement;
    return (_unrefElement = unrefElement(target)) === null || _unrefElement === void 0 || (_unrefElement = _unrefElement.namespaceURI) === null || _unrefElement === void 0 ? void 0 : _unrefElement.includes("svg");
  });
  const width = /* @__PURE__ */ shallowRef(initialSize.width);
  const height = /* @__PURE__ */ shallowRef(initialSize.height);
  const { stop: stop1 } = useResizeObserver(target, ([entry]) => {
    const boxSize = box === "border-box" ? entry.borderBoxSize : box === "content-box" ? entry.contentBoxSize : entry.devicePixelContentBoxSize;
    if (window2 && isSVG.value) {
      const $elem = unrefElement(target);
      if ($elem) {
        const rect = $elem.getBoundingClientRect();
        width.value = rect.width;
        height.value = rect.height;
      }
    } else if (boxSize) {
      const formatBoxSize = toArray(boxSize);
      width.value = formatBoxSize.reduce((acc, { inlineSize }) => acc + inlineSize, 0);
      height.value = formatBoxSize.reduce((acc, { blockSize }) => acc + blockSize, 0);
    } else {
      width.value = entry.contentRect.width;
      height.value = entry.contentRect.height;
    }
  }, options);
  tryOnMounted(() => {
    const ele = unrefElement(target);
    if (ele) {
      width.value = "offsetWidth" in ele ? ele.offsetWidth : initialSize.width;
      height.value = "offsetHeight" in ele ? ele.offsetHeight : initialSize.height;
    }
  });
  const stop2 = watch(() => unrefElement(target), (ele) => {
    width.value = ele ? initialSize.width : 0;
    height.value = ele ? initialSize.height : 0;
  });
  function stop() {
    stop1();
    stop2();
  }
  return {
    width,
    height,
    stop
  };
}
function useIntersectionObserver(target, callback, options = {}) {
  const { root: root2, rootMargin, threshold = 0, window: window2 = defaultWindow, immediate = true } = options;
  const isSupported = /* @__PURE__ */ useSupported(() => window2 && "IntersectionObserver" in window2);
  const targets = computed(() => {
    return toArray(toValue(target)).map(unrefElement).filter(notNullish);
  });
  let cleanup = noop;
  const isActive = /* @__PURE__ */ shallowRef(immediate);
  const stopWatch = isSupported.value ? watch(() => [
    targets.value,
    unrefElement(root2),
    toValue(rootMargin),
    isActive.value
  ], ([targets2, root3, rootMargin2]) => {
    cleanup();
    if (!isActive.value) return;
    if (!targets2.length) return;
    const observer = new IntersectionObserver(callback, {
      root: unrefElement(root3),
      rootMargin: rootMargin2,
      threshold
    });
    targets2.forEach((el) => el && observer.observe(el));
    cleanup = () => {
      observer.disconnect();
      cleanup = noop;
    };
  }, {
    immediate,
    flush: "post"
  }) : noop;
  const stop = () => {
    cleanup();
    stopWatch();
    isActive.value = false;
  };
  tryOnScopeDispose(stop);
  return {
    isSupported,
    isActive,
    pause() {
      cleanup();
      isActive.value = false;
    },
    resume() {
      isActive.value = true;
    },
    stop
  };
}
// @__NO_SIDE_EFFECTS__
function useVModel(props, key, emit2, options = {}) {
  var _vm$$emit, _vm$proxy;
  const { clone = false, passive = false, eventName, deep = false, defaultValue, shouldEmit } = options;
  const vm = getCurrentInstance();
  const _emit = emit2 || (vm === null || vm === void 0 ? void 0 : vm.emit) || (vm === null || vm === void 0 || (_vm$$emit = vm.$emit) === null || _vm$$emit === void 0 ? void 0 : _vm$$emit.bind(vm)) || (vm === null || vm === void 0 || (_vm$proxy = vm.proxy) === null || _vm$proxy === void 0 || (_vm$proxy = _vm$proxy.$emit) === null || _vm$proxy === void 0 ? void 0 : _vm$proxy.bind(vm === null || vm === void 0 ? void 0 : vm.proxy));
  let event = eventName;
  if (!key) key = "modelValue";
  event = event || `update:${key.toString()}`;
  const cloneFn = (val) => !clone ? val : typeof clone === "function" ? clone(val) : cloneFnJSON(val);
  const getValue2 = () => isDef(props[key]) ? cloneFn(props[key]) : defaultValue;
  const triggerEmit = (value) => {
    if (shouldEmit) {
      if (shouldEmit(value)) _emit(event, value);
    } else _emit(event, value);
  };
  if (passive) {
    const proxy = /* @__PURE__ */ ref(getValue2());
    let isUpdating = false;
    watch(() => props[key], (v) => {
      if (!isUpdating) {
        isUpdating = true;
        proxy.value = cloneFn(v);
        nextTick(() => isUpdating = false);
      }
    });
    watch(proxy, (v) => {
      if (!isUpdating && (v !== props[key] || deep)) triggerEmit(v);
    }, { deep });
    return proxy;
  } else return computed({
    get() {
      return getValue2();
    },
    set(value) {
      triggerEmit(value);
    }
  });
}
// @__NO_SIDE_EFFECTS__
function useWindowFocus(options = {}) {
  const { window: window2 = defaultWindow } = options;
  if (!window2) return /* @__PURE__ */ shallowRef(false);
  const focused = /* @__PURE__ */ shallowRef(window2.document.hasFocus());
  const listenerOptions = { passive: true };
  useEventListener(window2, "blur", () => {
    focused.value = false;
  }, listenerOptions);
  useEventListener(window2, "focus", () => {
    focused.value = true;
  }, listenerOptions);
  return focused;
}
// @__NO_SIDE_EFFECTS__
function useWindowSize(options = {}) {
  const { window: window2 = defaultWindow, initialWidth = Number.POSITIVE_INFINITY, initialHeight = Number.POSITIVE_INFINITY, listenOrientation = true, includeScrollbar = true, type = "inner" } = options;
  const width = /* @__PURE__ */ shallowRef(initialWidth);
  const height = /* @__PURE__ */ shallowRef(initialHeight);
  const update = () => {
    if (window2) if (type === "outer") {
      width.value = window2.outerWidth;
      height.value = window2.outerHeight;
    } else if (type === "visual" && window2.visualViewport) {
      const { width: visualViewportWidth, height: visualViewportHeight, scale } = window2.visualViewport;
      width.value = Math.round(visualViewportWidth * scale);
      height.value = Math.round(visualViewportHeight * scale);
    } else if (includeScrollbar) {
      width.value = window2.innerWidth;
      height.value = window2.innerHeight;
    } else {
      width.value = window2.document.documentElement.clientWidth;
      height.value = window2.document.documentElement.clientHeight;
    }
  };
  update();
  tryOnMounted(update);
  const listenerOptions = { passive: true };
  useEventListener("resize", update, listenerOptions);
  if (window2 && type === "visual" && window2.visualViewport) useEventListener(window2.visualViewport, "resize", update, listenerOptions);
  if (listenOrientation) watch(useMediaQuery("(orientation: portrait)"), () => update());
  return {
    width,
    height
  };
}
const FOCUSABLE_ELEMENT_SELECTORS = `a[href],button:not([disabled]),button:not([hidden]),:not([tabindex="-1"]),input:not([disabled]),input:not([type="hidden"]),select:not([disabled]),textarea:not([disabled])`;
const isShadowRoot = (e) => {
  if (typeof ShadowRoot === "undefined") return false;
  return e instanceof ShadowRoot;
};
const isHTMLElement = (e) => {
  if (typeof Element === "undefined") return false;
  return e instanceof Element;
};
const isVisible = (element) => {
  return getComputedStyle(element).position === "fixed" ? false : element.offsetParent !== null;
};
const obtainAllFocusableElements = (element) => {
  return Array.from(element.querySelectorAll(FOCUSABLE_ELEMENT_SELECTORS)).filter((item) => isFocusable(item) && isVisible(item));
};
const isFocusable = (element) => {
  if (element.tabIndex > 0 || element.tabIndex === 0 && element.getAttribute("tabIndex") !== null) return true;
  if (element.tabIndex < 0 || element.hasAttribute("disabled") || element.getAttribute("aria-disabled") === "true") return false;
  switch (element.nodeName) {
    case "A":
      return !!element.href && element.rel !== "ignore";
    case "INPUT":
      return !(element.type === "hidden" || element.type === "file");
    case "BUTTON":
    case "SELECT":
    case "TEXTAREA":
      return true;
    default:
      return false;
  }
};
const triggerEvent = function(elm, name, ...opts) {
  let eventName;
  if (name.includes("mouse") || name.includes("click")) eventName = "MouseEvents";
  else if (name.includes("key")) eventName = "KeyboardEvent";
  else eventName = "HTMLEvents";
  const evt = document.createEvent(eventName);
  evt.initEvent(name, ...opts);
  elm.dispatchEvent(evt);
  return elm;
};
const isLeaf = (el) => !el.getAttribute("aria-owns");
const getSibling = (el, distance, elClass) => {
  const { parentNode } = el;
  if (!parentNode) return null;
  const siblings = parentNode.querySelectorAll(elClass);
  return siblings[Array.prototype.indexOf.call(siblings, el) + distance] || null;
};
const focusElement = (el, options) => {
  if (!el || !el.focus) return;
  let cleanup = false;
  if (isHTMLElement(el) && !isFocusable(el) && !el.getAttribute("tabindex")) {
    el.setAttribute("tabindex", "-1");
    cleanup = true;
  }
  el.focus(options);
  if (isHTMLElement(el) && cleanup) el.removeAttribute("tabindex");
};
const focusNode = (el) => {
  if (!el) return;
  focusElement(el);
  !isLeaf(el) && el.click();
};
const isFirefox = () => isClient && /firefox/i.test(window.navigator.userAgent);
const isAndroid = () => isClient && /android/i.test(window.navigator.userAgent);
const SCOPE$1 = "utils/dom/style";
const classNameToArray = (cls = "") => cls.split(" ").filter((item) => !!item.trim());
const hasClass = (el, cls) => {
  if (!el || !cls) return false;
  if (cls.includes(" ")) throw new Error("className should not contain space.");
  return el.classList.contains(cls);
};
const addClass = (el, cls) => {
  if (!el || !cls.trim()) return;
  el.classList.add(...classNameToArray(cls));
};
const removeClass = (el, cls) => {
  if (!el || !cls.trim()) return;
  el.classList.remove(...classNameToArray(cls));
};
const getStyle = (element, styleName) => {
  if (!isClient || !element || !styleName || isShadowRoot(element)) return "";
  let key = camelize(styleName);
  if (key === "float") key = "cssFloat";
  try {
    const style = element.style[key];
    if (style) return style;
    const computed2 = document.defaultView?.getComputedStyle(element, "");
    return computed2 ? computed2[key] : "";
  } catch {
    return element.style[key];
  }
};
const setStyle = (element, styleName, value) => {
  if (!element || !styleName) return;
  if (isObject$2(styleName)) entriesOf(styleName).forEach(([prop, value2]) => setStyle(element, prop, value2));
  else {
    const key = camelize(styleName);
    element.style[key] = value;
  }
};
function addUnit(value, defaultUnit = "px") {
  if (!value && value !== 0) return "";
  if (isNumber(value) || isStringNumber(value)) return `${value}${defaultUnit}`;
  else if (isString(value)) return value;
  debugWarn(SCOPE$1, "binding value must be a string or number");
}
var en_default = {
  name: "en",
  el: {
    breadcrumb: { label: "Breadcrumb" },
    colorpicker: {
      confirm: "OK",
      clear: "Clear",
      defaultLabel: "color picker",
      description: "current color is {color}. press enter to select a new color.",
      alphaLabel: "pick alpha value",
      alphaDescription: "alpha {alpha}, current color is {color}",
      hueLabel: "pick hue value",
      hueDescription: "hue {hue}, current color is {color}",
      svLabel: "pick saturation and brightness value",
      svDescription: "saturation {saturation}, brightness {brightness}, current color is {color}",
      predefineDescription: "select {value} as the color"
    },
    datepicker: {
      now: "Now",
      today: "Today",
      cancel: "Cancel",
      clear: "Clear",
      confirm: "OK",
      dateTablePrompt: "Use the arrow keys and enter to select the day of the month",
      monthTablePrompt: "Use the arrow keys and enter to select the month",
      yearTablePrompt: "Use the arrow keys and enter to select the year",
      selectedDate: "Selected date",
      selectDate: "Select date",
      selectTime: "Select time",
      startDate: "Start Date",
      startTime: "Start Time",
      endDate: "End Date",
      endTime: "End Time",
      prevYear: "Previous Year",
      nextYear: "Next Year",
      prevMonth: "Previous Month",
      nextMonth: "Next Month",
      year: "",
      month1: "January",
      month2: "February",
      month3: "March",
      month4: "April",
      month5: "May",
      month6: "June",
      month7: "July",
      month8: "August",
      month9: "September",
      month10: "October",
      month11: "November",
      month12: "December",
      weeks: {
        sun: "Sun",
        mon: "Mon",
        tue: "Tue",
        wed: "Wed",
        thu: "Thu",
        fri: "Fri",
        sat: "Sat"
      },
      weeksFull: {
        sun: "Sunday",
        mon: "Monday",
        tue: "Tuesday",
        wed: "Wednesday",
        thu: "Thursday",
        fri: "Friday",
        sat: "Saturday"
      },
      months: {
        jan: "Jan",
        feb: "Feb",
        mar: "Mar",
        apr: "Apr",
        may: "May",
        jun: "Jun",
        jul: "Jul",
        aug: "Aug",
        sep: "Sep",
        oct: "Oct",
        nov: "Nov",
        dec: "Dec"
      }
    },
    inputNumber: {
      decrease: "decrease number",
      increase: "increase number"
    },
    select: {
      loading: "Loading",
      noMatch: "No matching data",
      noData: "No data",
      placeholder: "Select"
    },
    mention: { loading: "Loading" },
    dropdown: { toggleDropdown: "Toggle Dropdown" },
    cascader: {
      noMatch: "No matching data",
      loading: "Loading",
      placeholder: "Select",
      noData: "No data"
    },
    pagination: {
      goto: "Go to",
      pagesize: "/page",
      total: "Total {total}",
      pageClassifier: "",
      page: "Page",
      prev: "Go to previous page",
      next: "Go to next page",
      currentPage: "page {pager}",
      prevPages: "Previous {pager} pages",
      nextPages: "Next {pager} pages",
      deprecationWarning: "Deprecated usages detected, please refer to the el-pagination documentation for more details"
    },
    dialog: { close: "Close this dialog" },
    drawer: { close: "Close this dialog" },
    messagebox: {
      title: "Message",
      confirm: "OK",
      cancel: "Cancel",
      error: "Illegal input",
      close: "Close this dialog"
    },
    upload: {
      deleteTip: "press delete to remove",
      delete: "Delete",
      preview: "Preview",
      continue: "Continue"
    },
    slider: {
      defaultLabel: "slider between {min} and {max}",
      defaultRangeStartLabel: "pick start value",
      defaultRangeEndLabel: "pick end value"
    },
    table: {
      emptyText: "No Data",
      confirmFilter: "Confirm",
      resetFilter: "Reset",
      clearFilter: "All",
      sumText: "Sum",
      selectAllLabel: "Select all rows",
      selectRowLabel: "Select this row",
      expandRowLabel: "Expand this row",
      collapseRowLabel: "Collapse this row",
      sortLabel: "Sort by {column}",
      filterLabel: "Filter by {column}"
    },
    tag: { close: "Close this tag" },
    tour: {
      next: "Next",
      previous: "Previous",
      finish: "Finish",
      close: "Close this dialog"
    },
    tree: { emptyText: "No Data" },
    transfer: {
      noMatch: "No matching data",
      noData: "No data",
      titles: ["List 1", "List 2"],
      filterPlaceholder: "Enter keyword",
      noCheckedFormat: "{total} items",
      hasCheckedFormat: "{checked}/{total} checked"
    },
    image: { error: "FAILED" },
    pageHeader: { title: "Back" },
    popconfirm: {
      confirmButtonText: "Yes",
      cancelButtonText: "No"
    },
    carousel: {
      leftArrow: "Carousel arrow left",
      rightArrow: "Carousel arrow right",
      indicator: "Carousel switch to index {index}"
    },
    inputOTP: {
      groupLabel: "OTP Input",
      defaultLabel: "Please enter OTP character {index}"
    }
  }
};
const buildTranslator = (locale) => (path, option) => translate(path, option, unref(locale));
const translate = (path, option, locale) => get(locale, path, path).replace(/\{(\w+)\}/g, (_, key) => `${option?.[key] ?? `{${key}}`}`);
const buildLocaleContext = (locale) => {
  return {
    lang: computed(() => unref(locale).name),
    locale: /* @__PURE__ */ isRef(locale) ? locale : /* @__PURE__ */ ref(locale),
    t: buildTranslator(locale)
  };
};
const localeContextKey = /* @__PURE__ */ Symbol("localeContextKey");
const useLocale = (localeOverrides) => {
  const locale = localeOverrides || inject(localeContextKey, /* @__PURE__ */ ref());
  return buildLocaleContext(computed(() => locale.value || en_default));
};
const statePrefix = "is-";
const _bem = (namespace, block, blockSuffix, element, modifier) => {
  let cls = `${namespace}-${block}`;
  if (blockSuffix) cls += `-${blockSuffix}`;
  if (element) cls += `__${element}`;
  if (modifier) cls += `--${modifier}`;
  return cls;
};
const namespaceContextKey = /* @__PURE__ */ Symbol("namespaceContextKey");
const useGetDerivedNamespace = (namespaceOverrides) => {
  const derivedNamespace = namespaceOverrides || (getCurrentInstance() ? inject(namespaceContextKey, /* @__PURE__ */ ref("el")) : /* @__PURE__ */ ref("el"));
  return computed(() => {
    return unref(derivedNamespace) || "el";
  });
};
const useNamespace = (block, namespaceOverrides) => {
  const namespace = useGetDerivedNamespace(namespaceOverrides);
  const b = (blockSuffix = "") => _bem(namespace.value, block, blockSuffix, "", "");
  const e = (element) => element ? _bem(namespace.value, block, "", element, "") : "";
  const m = (modifier) => modifier ? _bem(namespace.value, block, "", "", modifier) : "";
  const be = (blockSuffix, element) => blockSuffix && element ? _bem(namespace.value, block, blockSuffix, element, "") : "";
  const em = (element, modifier) => element && modifier ? _bem(namespace.value, block, "", element, modifier) : "";
  const bm = (blockSuffix, modifier) => blockSuffix && modifier ? _bem(namespace.value, block, blockSuffix, "", modifier) : "";
  const bem = (blockSuffix, element, modifier) => blockSuffix && element && modifier ? _bem(namespace.value, block, blockSuffix, element, modifier) : "";
  const is = (name, ...args) => {
    const state = args.length >= 1 ? args[0] : true;
    return name && state ? `${statePrefix}${name}` : "";
  };
  const cssVar = (object) => {
    const styles = {};
    for (const key in object) if (object[key]) styles[`--${namespace.value}-${key}`] = object[key];
    return styles;
  };
  const cssVarBlock = (object) => {
    const styles = {};
    for (const key in object) if (object[key]) styles[`--${namespace.value}-${block}-${key}`] = object[key];
    return styles;
  };
  const cssVarName = (name) => `--${namespace.value}-${name}`;
  const cssVarBlockName = (name) => `--${namespace.value}-${block}-${name}`;
  return {
    namespace,
    b,
    e,
    m,
    be,
    em,
    bm,
    bem,
    is,
    cssVar,
    cssVarName,
    cssVarBlock,
    cssVarBlockName
  };
};
const composeEventHandlers = (theirsHandler, oursHandler, { checkForDefaultPrevented = true } = {}) => {
  const handleEvent = (event) => {
    const shouldPrevent = theirsHandler?.(event);
    if (checkForDefaultPrevented === false || !shouldPrevent) return oursHandler?.(event);
  };
  return handleEvent;
};
const whenMouse = (handler) => {
  return (e) => e.pointerType === "mouse" ? handler(e) : void 0;
};
const getEventCode = (event) => {
  if (event.code && event.code !== "Unidentified") return event.code;
  const key = getEventKey(event);
  if (key) {
    if (Object.values(EVENT_CODE).includes(key)) return key;
    switch (key) {
      case " ":
        return EVENT_CODE.space;
      default:
        return "";
    }
  }
  return "";
};
const getEventKey = (event) => {
  let key = event.key && event.key !== "Unidentified" ? event.key : "";
  if (!key && event.type === "keyup" && isAndroid()) {
    const target = event.target;
    key = target.value.charAt(target.selectionStart - 1);
  }
  return key;
};
const useProp = (name) => {
  const vm = getCurrentInstance();
  return computed(() => vm?.proxy?.$props?.[name]);
};
const defaultIdInjection = {
  prefix: Math.floor(Math.random() * 1e4),
  current: 0
};
const ID_INJECTION_KEY = /* @__PURE__ */ Symbol("elIdInjection");
const useIdInjection = () => {
  return getCurrentInstance() ? inject(ID_INJECTION_KEY, defaultIdInjection) : defaultIdInjection;
};
const useId = (deterministicId) => {
  const idInjection = useIdInjection();
  if (!isClient && idInjection === defaultIdInjection) debugWarn("IdInjection", `Looks like you are using server rendering, you must provide a id provider to ensure the hydration process to be succeed
usage: app.provide(ID_INJECTION_KEY, {
  prefix: number,
  current: number,
})`);
  const namespace = useGetDerivedNamespace();
  return computedEager(() => unref(deterministicId) || `${namespace.value}-id-${idInjection.prefix}-${idInjection.current++}`);
};
const initial = { current: 0 };
const zIndex = /* @__PURE__ */ ref(0);
const defaultInitialZIndex = 2e3;
const ZINDEX_INJECTION_KEY = /* @__PURE__ */ Symbol("elZIndexContextKey");
const zIndexContextKey = /* @__PURE__ */ Symbol("zIndexContextKey");
const useZIndex = (zIndexOverrides) => {
  const increasingInjection = getCurrentInstance() ? inject(ZINDEX_INJECTION_KEY, initial) : initial;
  const zIndexInjection = zIndexOverrides || (getCurrentInstance() ? inject(zIndexContextKey, void 0) : void 0);
  const initialZIndex = computed(() => {
    const zIndexFromInjection = unref(zIndexInjection);
    return isNumber(zIndexFromInjection) ? zIndexFromInjection : defaultInitialZIndex;
  });
  const currentZIndex = computed(() => initialZIndex.value + zIndex.value);
  const nextZIndex = () => {
    increasingInjection.current++;
    zIndex.value = increasingInjection.current;
    return currentZIndex.value;
  };
  if (!isClient && !inject(ZINDEX_INJECTION_KEY)) debugWarn("ZIndexInjection", `Looks like you are using server rendering, you must provide a z-index provider to ensure the hydration process to be succeed
usage: app.provide(ZINDEX_INJECTION_KEY, { current: 0 })`);
  return {
    initialZIndex,
    currentZIndex,
    nextZIndex
  };
};
const useSizeProp = buildProp({
  type: String,
  values: componentSizes,
  required: false
});
const SIZE_INJECTION_KEY = /* @__PURE__ */ Symbol("size");
const useGlobalSize = () => {
  const injectedSize = inject(SIZE_INJECTION_KEY, {});
  return computed(() => {
    return unref(injectedSize.size) || "";
  });
};
const emptyValuesContextKey = /* @__PURE__ */ Symbol("emptyValuesContextKey");
const SCOPE = "use-empty-values";
const DEFAULT_EMPTY_VALUES = [
  "",
  void 0,
  null
];
const useEmptyValuesProps = buildProps({
  /**
  * @description empty values supported by the component
  */
  emptyValues: Array,
  /**
  * @description return value when cleared, if you want to set `undefined`, use `() => undefined`
  */
  valueOnClear: {
    type: definePropType([
      String,
      Number,
      Boolean,
      Function
    ]),
    default: void 0,
    validator: (val) => {
      val = isFunction$1(val) ? val() : val;
      if (isArray$1(val)) return val.every((item) => !item);
      return !val;
    }
  }
});
const useEmptyValues = (props, defaultValue) => {
  const config = getCurrentInstance() ? inject(emptyValuesContextKey, /* @__PURE__ */ ref({})) : /* @__PURE__ */ ref({});
  const emptyValues = computed(() => props.emptyValues || config.value.emptyValues || DEFAULT_EMPTY_VALUES);
  const valueOnClear = computed(() => {
    if (isFunction$1(props.valueOnClear)) return props.valueOnClear();
    else if (props.valueOnClear !== void 0) return props.valueOnClear;
    else if (isFunction$1(config.value.valueOnClear)) return config.value.valueOnClear();
    else if (config.value.valueOnClear !== void 0) return config.value.valueOnClear;
    return defaultValue !== void 0 ? defaultValue : void 0;
  });
  const isEmptyValue = (value) => {
    let result = true;
    if (isArray$1(value)) result = emptyValues.value.some((emptyValue) => {
      return isEqual(value, emptyValue);
    });
    else result = emptyValues.value.includes(value);
    return result;
  };
  if (!isEmptyValue(valueOnClear.value)) debugWarn(SCOPE, "value-on-clear should be a value of empty-values");
  return {
    emptyValues,
    valueOnClear,
    isEmptyValue
  };
};
const ariaProps = buildProps({
  /**
  * @description native `aria-label` attribute
  */
  ariaLabel: String,
  /**
  * @description native `aria-orientation` attribute
  */
  ariaOrientation: {
    type: String,
    values: [
      "horizontal",
      "vertical",
      "undefined"
    ]
  },
  /**
  * @description native `aria-controls` attribute
  */
  ariaControls: String
});
const useAriaProps = (arias) => {
  return pick(ariaProps, arias);
};
const withPropsDefaultsSetter = (target) => {
  const _p = target.props;
  const props = isArray$1(_p) ? fromPairs(_p.map((key) => [key, {}])) : _p;
  target.setPropsDefaults = (defaults) => {
    if (!props) return;
    for (const [key, value] of Object.entries(defaults)) {
      const prop = props[key];
      if (!hasOwn(props, key)) continue;
      if (isPlainObject(prop)) {
        props[key] = {
          ...prop,
          default: value
        };
        continue;
      }
      props[key] = {
        type: prop,
        default: value
      };
    }
    target.props = props;
  };
};
const withInstall = (main, extra) => {
  main.install = (app) => {
    for (const comp of [main, ...Object.values(extra ?? {})]) app.component(comp.name, comp);
  };
  if (extra) for (const [key, comp] of Object.entries(extra)) main[key] = comp;
  withPropsDefaultsSetter(main);
  return main;
};
const withInstallFunction = (fn, name) => {
  fn.install = (app) => {
    fn._context = app._context;
    app.config.globalProperties[name] = fn;
  };
  return fn;
};
const withInstallDirective = (directive, name) => {
  directive.install = (app) => {
    app.directive(name, directive);
  };
  return directive;
};
const withNoopInstall = (component) => {
  component.install = NOOP;
  withPropsDefaultsSetter(component);
  return component;
};
const iconPropType = definePropType([
  String,
  Object,
  Function
]);
const CloseComponents = { Close: close_default };
const TypeComponents = {
  Close: close_default,
  SuccessFilled: success_filled_default,
  InfoFilled: info_filled_default,
  WarningFilled: warning_filled_default,
  CircleCloseFilled: circle_close_filled_default
};
const TypeComponentsMap = {
  primary: info_filled_default,
  success: success_filled_default,
  warning: warning_filled_default,
  error: circle_close_filled_default,
  info: info_filled_default
};
const ValidateComponentsMap = {
  validating: loading_default,
  success: circle_check_default,
  error: circle_close_default
};
const iconProps = buildProps({
  /**
  * @description SVG icon size, size x size
  */
  size: { type: definePropType([Number, String]) },
  /**
  * @description SVG tag's fill attribute
  */
  color: { type: String }
});
var icon_vue_vue_type_script_setup_true_lang_default = /* @__PURE__ */ defineComponent({
  name: "ElIcon",
  inheritAttrs: false,
  __name: "icon",
  props: iconProps,
  setup(__props) {
    const props = __props;
    const ns = useNamespace("icon");
    const style = computed(() => {
      const { size, color } = props;
      const fontSize = addUnit(size);
      if (!fontSize && !color) return {};
      return {
        fontSize,
        "--color": color
      };
    });
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("i", mergeProps({
        class: unref(ns).b(),
        style: style.value
      }, _ctx.$attrs), [renderSlot(_ctx.$slots, "default")], 16);
    };
  }
});
var icon_default = icon_vue_vue_type_script_setup_true_lang_default;
const ElIcon = withInstall(icon_default);
const formContextKey = /* @__PURE__ */ Symbol("formContextKey");
const formItemContextKey = /* @__PURE__ */ Symbol("formItemContextKey");
const useFormSize = (fallback, ignore = {}) => {
  const emptyRef = /* @__PURE__ */ ref(void 0);
  const size = ignore.prop ? emptyRef : useProp("size");
  const globalConfig2 = ignore.global ? emptyRef : useGlobalSize();
  const form = ignore.form ? { size: void 0 } : inject(formContextKey, void 0);
  const formItem = ignore.formItem ? { size: void 0 } : inject(formItemContextKey, void 0);
  return computed(() => size.value || unref(fallback) || formItem?.size || form?.size || globalConfig2.value || "");
};
const useFormDisabled = (fallback) => {
  const disabled = useProp("disabled");
  const form = inject(formContextKey, void 0);
  return computed(() => {
    return disabled.value ?? unref(fallback) ?? form?.disabled ?? false;
  });
};
const useFormItem = () => {
  return {
    form: inject(formContextKey, void 0),
    formItem: inject(formItemContextKey, void 0)
  };
};
const useFormItemInputId = (props, { formItemContext, disableIdGeneration, disableIdManagement }) => {
  if (!disableIdGeneration) disableIdGeneration = /* @__PURE__ */ ref(false);
  if (!disableIdManagement) disableIdManagement = /* @__PURE__ */ ref(false);
  const instance = getCurrentInstance();
  const inLabel = () => {
    let parent = instance?.parent;
    while (parent) {
      if (parent.type.name === "ElFormItem") return false;
      if (parent.type.name === "ElLabelWrap") return true;
      parent = parent.parent;
    }
    return false;
  };
  const inputId = /* @__PURE__ */ ref();
  let idUnwatch = void 0;
  const isLabeledByFormItem = computed(() => {
    return !!(!(props.label || props.ariaLabel) && formItemContext && formItemContext.inputIds && formItemContext.inputIds?.length <= 1);
  });
  onMounted(() => {
    idUnwatch = watch([/* @__PURE__ */ toRef(props, "id"), disableIdGeneration], ([id, disableIdGeneration2]) => {
      const newId = id ?? (!disableIdGeneration2 ? useId().value : void 0);
      if (newId !== inputId.value) {
        if (formItemContext?.removeInputId && !inLabel()) {
          inputId.value && formItemContext.removeInputId(inputId.value);
          if (!disableIdManagement?.value && !disableIdGeneration2 && newId) formItemContext.addInputId(newId);
        }
        inputId.value = newId;
      }
    }, { immediate: true });
  });
  onUnmounted(() => {
    idUnwatch && idUnwatch();
    if (formItemContext?.removeInputId) inputId.value && formItemContext.removeInputId(inputId.value);
  });
  return {
    isLabeledByFormItem,
    inputId
  };
};
const mutable = (val) => val;
const badgeProps = buildProps({
  /**
  * @description display value.
  */
  value: {
    type: [String, Number],
    default: ""
  },
  /**
  * @description maximum value, shows `{max}+` when exceeded. Only works if value is a number.
  */
  max: {
    type: Number,
    default: 99
  },
  /**
  * @description if a little dot is displayed.
  */
  isDot: Boolean,
  /**
  * @description hidden badge.
  */
  hidden: Boolean,
  /**
  * @description badge type.
  */
  type: {
    type: String,
    values: [
      "primary",
      "success",
      "warning",
      "info",
      "danger"
    ],
    default: "danger"
  },
  /**
  * @description whether to show badge when value is zero.
  */
  showZero: {
    type: Boolean,
    default: true
  },
  /**
  * @description customize dot background color
  */
  color: String,
  /**
  * @description CSS style of badge
  */
  badgeStyle: {
    type: definePropType([
      String,
      Object,
      Array,
      Boolean
    ]),
    default: void 0
  },
  /**
  * @description set offset of the badge
  */
  offset: {
    type: definePropType(Array),
    default: () => [0, 0]
  },
  /**
  * @description custom class name of badge
  */
  badgeClass: { type: String }
});
var badge_vue_vue_type_script_setup_true_lang_default = /* @__PURE__ */ defineComponent({
  name: "ElBadge",
  __name: "badge",
  props: badgeProps,
  setup(__props, { expose: __expose }) {
    const props = __props;
    const ns = useNamespace("badge");
    const content = computed(() => {
      if (props.isDot) return "";
      if (isNumber(props.value) && isNumber(props.max)) return props.max < props.value ? `${props.max}+` : `${props.value}`;
      return `${props.value}`;
    });
    const style = computed(() => {
      return [{
        backgroundColor: props.color,
        marginRight: addUnit(-props.offset[0]),
        marginTop: addUnit(props.offset[1])
      }, props.badgeStyle ?? {}];
    });
    __expose({
      /** @description badge content */
      content
    });
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", { class: normalizeClass(unref(ns).b()) }, [renderSlot(_ctx.$slots, "default"), createVNode(Transition, { name: `${unref(ns).namespace.value}-zoom-in-center` }, {
        default: withCtx(() => [!__props.hidden && (content.value || __props.isDot || _ctx.$slots.content) ? (openBlock(), createElementBlock("sup", {
          key: 0,
          class: normalizeClass([
            unref(ns).e("content"),
            unref(ns).em("content", __props.type),
            unref(ns).is("fixed", !!_ctx.$slots.default),
            unref(ns).is("dot", __props.isDot),
            unref(ns).is("hide-zero", !__props.showZero && __props.value === 0),
            __props.badgeClass
          ]),
          style: normalizeStyle(style.value)
        }, [renderSlot(_ctx.$slots, "content", { value: content.value }, () => [createTextVNode(toDisplayString(content.value), 1)])], 6)) : createCommentVNode("v-if", true)]),
        _: 3
      }, 8, ["name"])], 2);
    };
  }
});
var badge_default = badge_vue_vue_type_script_setup_true_lang_default;
const ElBadge = withInstall(badge_default);
const configProviderContextKey = /* @__PURE__ */ Symbol();
const globalConfig = /* @__PURE__ */ ref();
function useGlobalConfig(key, defaultValue = void 0) {
  const config = getCurrentInstance() ? inject(configProviderContextKey, globalConfig) : globalConfig;
  if (key) return computed(() => config.value?.[key] ?? defaultValue);
  else return config;
}
function useGlobalComponentSettings(block, sizeFallback) {
  const config = useGlobalConfig();
  const ns = useNamespace(block, computed(() => config.value?.namespace || "el"));
  const locale = useLocale(computed(() => config.value?.locale));
  const zIndex2 = useZIndex(computed(() => config.value?.zIndex || 2e3));
  const size = computed(() => unref(sizeFallback) || config.value?.size || "");
  provideGlobalConfig(computed(() => unref(config) || {}));
  return {
    ns,
    locale,
    zIndex: zIndex2,
    size
  };
}
const provideGlobalConfig = (config, app, global2 = false) => {
  const inSetup = !!getCurrentInstance();
  const oldConfig = inSetup ? useGlobalConfig() : void 0;
  const provideFn = inSetup ? provide : void 0;
  if (!provideFn) {
    debugWarn("provideGlobalConfig", "provideGlobalConfig() can only be used inside setup().");
    return;
  }
  const context = computed(() => {
    const cfg = unref(config);
    if (!oldConfig?.value) return cfg;
    return mergeConfig(oldConfig.value, cfg);
  });
  provideFn(configProviderContextKey, context);
  provideFn(localeContextKey, computed(() => context.value.locale));
  provideFn(namespaceContextKey, computed(() => context.value.namespace));
  provideFn(zIndexContextKey, computed(() => context.value.zIndex));
  provideFn(SIZE_INJECTION_KEY, { size: computed(() => context.value.size || "") });
  provideFn(emptyValuesContextKey, computed(() => ({
    emptyValues: context.value.emptyValues,
    valueOnClear: context.value.valueOnClear
  })));
  if (global2 || !globalConfig.value) globalConfig.value = context.value;
  return context;
};
const mergeConfig = (a, b) => {
  const keys2 = [.../* @__PURE__ */ new Set([...keysOf(a), ...keysOf(b)])];
  const obj = {};
  for (const key of keys2) obj[key] = b[key] !== void 0 ? b[key] : a[key];
  return obj;
};
const configProviderProps = buildProps({
  /**
  * @description Controlling if the users want a11y features
  */
  a11y: {
    type: Boolean,
    default: true
  },
  /**
  * @description Locale Object
  */
  locale: { type: definePropType(Object) },
  /**
  * @description global component size
  */
  size: useSizeProp,
  /**
  * @description button related configuration, [see the following table](https://element-plus.org/en-US/component/config-provider.html#button-attribute)
  */
  button: { type: definePropType(Object) },
  /**
  * @description card related configuration, [see the following table](https://element-plus.org/en-US/component/config-provider.html#card-attribute)
  */
  card: { type: definePropType(Object) },
  /**
  * @description dialog related configuration, [see the following table](https://element-plus.org/en-US/component/config-provider.html#dialog-attribute)
  */
  dialog: { type: definePropType(Object) },
  /**
  * @description link related configuration, [see the following table](https://element-plus.org/en-US/component/config-provider.html#link-attribute)
  */
  link: { type: definePropType(Object) },
  /**
  * @description features at experimental stage to be added, all features are default to be set to false, [see the following table](https://element-plus.org/en-US/component/config-provider.html#experimental-features)                                                                            | ^[object]
  */
  experimentalFeatures: { type: definePropType(Object) },
  /**
  * @description Controls if we should handle keyboard navigation
  */
  keyboardNavigation: {
    type: Boolean,
    default: true
  },
  /**
  * @description message related configuration, [see the following table](https://element-plus.org/en-US/component/config-provider.html#message-attribute)
  */
  message: { type: definePropType(Object) },
  /**
  * @description global Initial zIndex
  */
  zIndex: Number,
  /**
  * @description global component className prefix (cooperated with [$namespace](https://github.com/element-plus/element-plus/blob/dev/packages/theme-chalk/src/mixins/config.scss#L1)) | ^[string]
  */
  namespace: {
    type: String,
    default: "el"
  },
  /**
  * @description table related configuration, [see the following table](https://element-plus.org/en-US/component/config-provider.html#table-attribute)
  */
  table: { type: definePropType(Object) },
  ...useEmptyValuesProps
});
const messageConfig = { placement: "top" };
const ConfigProvider = /* @__PURE__ */ defineComponent({
  name: "ElConfigProvider",
  props: configProviderProps,
  setup(props, { slots }) {
    const config = provideGlobalConfig(props);
    watch(() => props.message, (val) => {
      Object.assign(messageConfig, config?.value?.message ?? {}, val ?? {});
    }, {
      immediate: true,
      deep: true
    });
    return () => renderSlot(slots, "default", { config: config?.value });
  }
});
function getDefaultExportFromCjs(x) {
  return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, "default") ? x["default"] : x;
}
var dayjs_min$1 = { exports: {} };
var dayjs_min = dayjs_min$1.exports;
var hasRequiredDayjs_min;
function requireDayjs_min() {
  if (hasRequiredDayjs_min) return dayjs_min$1.exports;
  hasRequiredDayjs_min = 1;
  (function(module2, exports2) {
    !(function(t, e) {
      module2.exports = e();
    })(dayjs_min, (function() {
      var t = 1e3, e = 6e4, n = 36e5, r = "millisecond", i = "second", s = "minute", u = "hour", a = "day", o = "week", c = "month", f = "quarter", h2 = "year", d = "date", l = "Invalid Date", $ = /^(\d{4})[-/]?(\d{1,2})?[-/]?(\d{0,2})[Tt\s]*(\d{1,2})?:?(\d{1,2})?:?(\d{1,2})?[.:]?(\d+)?$/, y = /\[([^\]]+)]|Y{1,4}|M{1,4}|D{1,2}|d{1,4}|H{1,2}|h{1,2}|a|A|m{1,2}|s{1,2}|Z{1,2}|SSS/g, M = { name: "en", weekdays: "Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_"), months: "January_February_March_April_May_June_July_August_September_October_November_December".split("_"), ordinal: function(t2) {
        var e2 = ["th", "st", "nd", "rd"], n2 = t2 % 100;
        return "[" + t2 + (e2[(n2 - 20) % 10] || e2[n2] || e2[0]) + "]";
      } }, m = function(t2, e2, n2) {
        var r2 = String(t2);
        return !r2 || r2.length >= e2 ? t2 : "" + Array(e2 + 1 - r2.length).join(n2) + t2;
      }, v = { s: m, z: function(t2) {
        var e2 = -t2.utcOffset(), n2 = Math.abs(e2), r2 = Math.floor(n2 / 60), i2 = n2 % 60;
        return (e2 <= 0 ? "+" : "-") + m(r2, 2, "0") + ":" + m(i2, 2, "0");
      }, m: function t2(e2, n2) {
        if (e2.date() < n2.date()) return -t2(n2, e2);
        var r2 = 12 * (n2.year() - e2.year()) + (n2.month() - e2.month()), i2 = e2.clone().add(r2, c), s2 = n2 - i2 < 0, u2 = e2.clone().add(r2 + (s2 ? -1 : 1), c);
        return +(-(r2 + (n2 - i2) / (s2 ? i2 - u2 : u2 - i2)) || 0);
      }, a: function(t2) {
        return t2 < 0 ? Math.ceil(t2) || 0 : Math.floor(t2);
      }, p: function(t2) {
        return { M: c, y: h2, w: o, d: a, D: d, h: u, m: s, s: i, ms: r, Q: f }[t2] || String(t2 || "").toLowerCase().replace(/s$/, "");
      }, u: function(t2) {
        return void 0 === t2;
      } }, g = "en", D = {};
      D[g] = M;
      var p2 = "$isDayjsObject", S = function(t2) {
        return t2 instanceof _ || !(!t2 || !t2[p2]);
      }, w = function t2(e2, n2, r2) {
        var i2;
        if (!e2) return g;
        if ("string" == typeof e2) {
          var s2 = e2.toLowerCase();
          D[s2] && (i2 = s2), n2 && (D[s2] = n2, i2 = s2);
          var u2 = e2.split("-");
          if (!i2 && u2.length > 1) return t2(u2[0]);
        } else {
          var a2 = e2.name;
          D[a2] = e2, i2 = a2;
        }
        return !r2 && i2 && (g = i2), i2 || !r2 && g;
      }, O = function(t2, e2) {
        if (S(t2)) return t2.clone();
        var n2 = "object" == typeof e2 ? e2 : {};
        return n2.date = t2, n2.args = arguments, new _(n2);
      }, b = v;
      b.l = w, b.i = S, b.w = function(t2, e2) {
        return O(t2, { locale: e2.$L, utc: e2.$u, x: e2.$x, $offset: e2.$offset });
      };
      var _ = (function() {
        function M2(t2) {
          this.$L = w(t2.locale, null, true), this.parse(t2), this.$x = this.$x || t2.x || {}, this[p2] = true;
        }
        var m2 = M2.prototype;
        return m2.parse = function(t2) {
          this.$d = (function(t3) {
            var e2 = t3.date, n2 = t3.utc;
            if (null === e2) return /* @__PURE__ */ new Date(NaN);
            if (b.u(e2)) return /* @__PURE__ */ new Date();
            if (e2 instanceof Date) return new Date(e2);
            if ("string" == typeof e2 && !/Z$/i.test(e2)) {
              var r2 = e2.match($);
              if (r2) {
                var i2 = r2[2] - 1 || 0, s2 = (r2[7] || "0").substring(0, 3);
                return n2 ? new Date(Date.UTC(r2[1], i2, r2[3] || 1, r2[4] || 0, r2[5] || 0, r2[6] || 0, s2)) : new Date(r2[1], i2, r2[3] || 1, r2[4] || 0, r2[5] || 0, r2[6] || 0, s2);
              }
            }
            return new Date(e2);
          })(t2), this.init();
        }, m2.init = function() {
          var t2 = this.$d;
          this.$y = t2.getFullYear(), this.$M = t2.getMonth(), this.$D = t2.getDate(), this.$W = t2.getDay(), this.$H = t2.getHours(), this.$m = t2.getMinutes(), this.$s = t2.getSeconds(), this.$ms = t2.getMilliseconds();
        }, m2.$utils = function() {
          return b;
        }, m2.isValid = function() {
          return !(this.$d.toString() === l);
        }, m2.isSame = function(t2, e2) {
          var n2 = O(t2);
          return this.startOf(e2) <= n2 && n2 <= this.endOf(e2);
        }, m2.isAfter = function(t2, e2) {
          return O(t2) < this.startOf(e2);
        }, m2.isBefore = function(t2, e2) {
          return this.endOf(e2) < O(t2);
        }, m2.$g = function(t2, e2, n2) {
          return b.u(t2) ? this[e2] : this.set(n2, t2);
        }, m2.unix = function() {
          return Math.floor(this.valueOf() / 1e3);
        }, m2.valueOf = function() {
          return this.$d.getTime();
        }, m2.startOf = function(t2, e2) {
          var n2 = this, r2 = !!b.u(e2) || e2, f2 = b.p(t2), l2 = function(t3, e3) {
            var i2 = b.w(n2.$u ? Date.UTC(n2.$y, e3, t3) : new Date(n2.$y, e3, t3), n2);
            return r2 ? i2 : i2.endOf(a);
          }, $2 = function(t3, e3) {
            return b.w(n2.toDate()[t3].apply(n2.toDate("s"), (r2 ? [0, 0, 0, 0] : [23, 59, 59, 999]).slice(e3)), n2);
          }, y2 = this.$W, M3 = this.$M, m3 = this.$D, v2 = "set" + (this.$u ? "UTC" : "");
          switch (f2) {
            case h2:
              return r2 ? l2(1, 0) : l2(31, 11);
            case c:
              return r2 ? l2(1, M3) : l2(0, M3 + 1);
            case o:
              var g2 = this.$locale().weekStart || 0, D2 = (y2 < g2 ? y2 + 7 : y2) - g2;
              return l2(r2 ? m3 - D2 : m3 + (6 - D2), M3);
            case a:
            case d:
              return $2(v2 + "Hours", 0);
            case u:
              return $2(v2 + "Minutes", 1);
            case s:
              return $2(v2 + "Seconds", 2);
            case i:
              return $2(v2 + "Milliseconds", 3);
            default:
              return this.clone();
          }
        }, m2.endOf = function(t2) {
          return this.startOf(t2, false);
        }, m2.$set = function(t2, e2) {
          var n2, o2 = b.p(t2), f2 = "set" + (this.$u ? "UTC" : ""), l2 = (n2 = {}, n2[a] = f2 + "Date", n2[d] = f2 + "Date", n2[c] = f2 + "Month", n2[h2] = f2 + "FullYear", n2[u] = f2 + "Hours", n2[s] = f2 + "Minutes", n2[i] = f2 + "Seconds", n2[r] = f2 + "Milliseconds", n2)[o2], $2 = o2 === a ? this.$D + (e2 - this.$W) : e2;
          if (o2 === c || o2 === h2) {
            var y2 = this.clone().set(d, 1);
            y2.$d[l2]($2), y2.init(), this.$d = y2.set(d, Math.min(this.$D, y2.daysInMonth())).$d;
          } else l2 && this.$d[l2]($2);
          return this.init(), this;
        }, m2.set = function(t2, e2) {
          return this.clone().$set(t2, e2);
        }, m2.get = function(t2) {
          return this[b.p(t2)]();
        }, m2.add = function(r2, f2) {
          var d2, l2 = this;
          r2 = Number(r2);
          var $2 = b.p(f2), y2 = function(t2) {
            var e2 = O(l2);
            return b.w(e2.date(e2.date() + Math.round(t2 * r2)), l2);
          };
          if ($2 === c) return this.set(c, this.$M + r2);
          if ($2 === h2) return this.set(h2, this.$y + r2);
          if ($2 === a) return y2(1);
          if ($2 === o) return y2(7);
          var M3 = (d2 = {}, d2[s] = e, d2[u] = n, d2[i] = t, d2)[$2] || 1, m3 = this.$d.getTime() + r2 * M3;
          return b.w(m3, this);
        }, m2.subtract = function(t2, e2) {
          return this.add(-1 * t2, e2);
        }, m2.format = function(t2) {
          var e2 = this, n2 = this.$locale();
          if (!this.isValid()) return n2.invalidDate || l;
          var r2 = t2 || "YYYY-MM-DDTHH:mm:ssZ", i2 = b.z(this), s2 = this.$H, u2 = this.$m, a2 = this.$M, o2 = n2.weekdays, c2 = n2.months, f2 = n2.meridiem, h3 = function(t3, n3, i3, s3) {
            return t3 && (t3[n3] || t3(e2, r2)) || i3[n3].slice(0, s3);
          }, d2 = function(t3) {
            return b.s(s2 % 12 || 12, t3, "0");
          }, $2 = f2 || function(t3, e3, n3) {
            var r3 = t3 < 12 ? "AM" : "PM";
            return n3 ? r3.toLowerCase() : r3;
          };
          return r2.replace(y, (function(t3, r3) {
            return r3 || (function(t4) {
              switch (t4) {
                case "YY":
                  return String(e2.$y).slice(-2);
                case "YYYY":
                  return b.s(e2.$y, 4, "0");
                case "M":
                  return a2 + 1;
                case "MM":
                  return b.s(a2 + 1, 2, "0");
                case "MMM":
                  return h3(n2.monthsShort, a2, c2, 3);
                case "MMMM":
                  return h3(c2, a2);
                case "D":
                  return e2.$D;
                case "DD":
                  return b.s(e2.$D, 2, "0");
                case "d":
                  return String(e2.$W);
                case "dd":
                  return h3(n2.weekdaysMin, e2.$W, o2, 2);
                case "ddd":
                  return h3(n2.weekdaysShort, e2.$W, o2, 3);
                case "dddd":
                  return o2[e2.$W];
                case "H":
                  return String(s2);
                case "HH":
                  return b.s(s2, 2, "0");
                case "h":
                  return d2(1);
                case "hh":
                  return d2(2);
                case "a":
                  return $2(s2, u2, true);
                case "A":
                  return $2(s2, u2, false);
                case "m":
                  return String(u2);
                case "mm":
                  return b.s(u2, 2, "0");
                case "s":
                  return String(e2.$s);
                case "ss":
                  return b.s(e2.$s, 2, "0");
                case "SSS":
                  return b.s(e2.$ms, 3, "0");
                case "Z":
                  return i2;
              }
              return null;
            })(t3) || i2.replace(":", "");
          }));
        }, m2.utcOffset = function() {
          return 15 * -Math.round(this.$d.getTimezoneOffset() / 15);
        }, m2.diff = function(r2, d2, l2) {
          var $2, y2 = this, M3 = b.p(d2), m3 = O(r2), v2 = (m3.utcOffset() - this.utcOffset()) * e, g2 = this - m3, D2 = function() {
            return b.m(y2, m3);
          };
          switch (M3) {
            case h2:
              $2 = D2() / 12;
              break;
            case c:
              $2 = D2();
              break;
            case f:
              $2 = D2() / 3;
              break;
            case o:
              $2 = (g2 - v2) / 6048e5;
              break;
            case a:
              $2 = (g2 - v2) / 864e5;
              break;
            case u:
              $2 = g2 / n;
              break;
            case s:
              $2 = g2 / e;
              break;
            case i:
              $2 = g2 / t;
              break;
            default:
              $2 = g2;
          }
          return l2 ? $2 : b.a($2);
        }, m2.daysInMonth = function() {
          return this.endOf(c).$D;
        }, m2.$locale = function() {
          return D[this.$L];
        }, m2.locale = function(t2, e2) {
          if (!t2) return this.$L;
          var n2 = this.clone(), r2 = w(t2, e2, true);
          return r2 && (n2.$L = r2), n2;
        }, m2.clone = function() {
          return b.w(this.$d, this);
        }, m2.toDate = function() {
          return new Date(this.valueOf());
        }, m2.toJSON = function() {
          return this.isValid() ? this.toISOString() : null;
        }, m2.toISOString = function() {
          return this.$d.toISOString();
        }, m2.toString = function() {
          return this.$d.toUTCString();
        }, M2;
      })(), k = _.prototype;
      return O.prototype = k, [["$ms", r], ["$s", i], ["$m", s], ["$H", u], ["$W", a], ["$M", c], ["$y", h2], ["$D", d]].forEach((function(t2) {
        k[t2[1]] = function(e2) {
          return this.$g(e2, t2[0], t2[1]);
        };
      })), O.extend = function(t2, e2) {
        return t2.$i || (t2(e2, _, O), t2.$i = true), O;
      }, O.locale = w, O.isDayjs = S, O.unix = function(t2) {
        return O(1e3 * t2);
      }, O.en = D[g], O.Ls = D, O.p = {}, O;
    }));
  })(dayjs_min$1);
  return dayjs_min$1.exports;
}
var dayjs_minExports = requireDayjs_min();
const dayjs = /* @__PURE__ */ getDefaultExportFromCjs(dayjs_minExports);
const dividerProps = buildProps({
  /**
  * @description Set divider's direction
  */
  direction: {
    type: String,
    values: ["horizontal", "vertical"],
    default: "horizontal"
  },
  /**
  * @description Set the style of divider
  */
  contentPosition: {
    type: String,
    values: [
      "left",
      "center",
      "right"
    ],
    default: "center"
  },
  /**
  * @description the position of the customized content on the divider line
  */
  borderStyle: {
    type: definePropType(String),
    default: "solid"
  }
});
var divider_vue_vue_type_script_setup_true_lang_default = /* @__PURE__ */ defineComponent({
  name: "ElDivider",
  __name: "divider",
  props: dividerProps,
  setup(__props) {
    const props = __props;
    const ns = useNamespace("divider");
    const dividerStyle = computed(() => {
      return ns.cssVar({ "border-style": props.borderStyle });
    });
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", {
        class: normalizeClass([unref(ns).b(), unref(ns).m(__props.direction)]),
        style: normalizeStyle(dividerStyle.value),
        role: "separator"
      }, [_ctx.$slots.default && __props.direction !== "vertical" ? (openBlock(), createElementBlock("div", {
        key: 0,
        class: normalizeClass([unref(ns).e("text"), unref(ns).is(__props.contentPosition)])
      }, [renderSlot(_ctx.$slots, "default")], 2)) : createCommentVNode("v-if", true)], 6);
    };
  }
});
var divider_default = divider_vue_vue_type_script_setup_true_lang_default;
const ElDivider = withInstall(divider_default);
const isValidComponentSize = (val) => ["", ...componentSizes].includes(val);
const switchProps = buildProps({
  /**
  * @description binding value, it should be equivalent to either `active-value` or `inactive-value`, by default it's `boolean` type
  */
  modelValue: {
    type: [
      Boolean,
      String,
      Number
    ],
    default: false
  },
  /**
  * @description whether Switch is disabled
  */
  disabled: {
    type: Boolean,
    default: void 0
  },
  /**
  * @description whether Switch is in loading state
  */
  loading: Boolean,
  /**
  * @description size of Switch
  */
  size: {
    type: String,
    validator: isValidComponentSize
  },
  /**
  * @description width of Switch
  */
  width: {
    type: [String, Number],
    default: ""
  },
  /**
  * @description whether icon or text is displayed inside dot, only the first character will be rendered for text
  */
  inlinePrompt: Boolean,
  /**
  * @description component of the icon displayed in action when in `off` state
  */
  inactiveActionIcon: { type: iconPropType },
  /**
  * @description component of the icon displayed in action when in `on` state
  */
  activeActionIcon: { type: iconPropType },
  /**
  * @description component of the icon displayed when in `on` state, overrides `active-text`
  */
  activeIcon: { type: iconPropType },
  /**
  * @description component of the icon displayed when in `off` state, overrides `inactive-text`
  */
  inactiveIcon: { type: iconPropType },
  /**
  * @description text displayed when in `on` state
  */
  activeText: {
    type: String,
    default: ""
  },
  /**
  * @description text displayed when in `off` state
  */
  inactiveText: {
    type: String,
    default: ""
  },
  /**
  * @description switch value when in `on` state
  */
  activeValue: {
    type: [
      Boolean,
      String,
      Number
    ],
    default: true
  },
  /**
  * @description switch value when in `off` state
  */
  inactiveValue: {
    type: [
      Boolean,
      String,
      Number
    ],
    default: false
  },
  /**
  * @description input name of Switch
  */
  name: {
    type: String,
    default: ""
  },
  /**
  * @description whether to trigger form validation
  */
  validateEvent: {
    type: Boolean,
    default: true
  },
  /**
  * @description before-change hook before the switch state changes. If `false` is returned or a `Promise` is returned and then is rejected, will stop switching
  */
  beforeChange: { type: definePropType(Function) },
  /**
  * @description id for input
  */
  id: String,
  /**
  * @description tabindex for input
  */
  tabindex: { type: [String, Number] },
  ...useAriaProps(["ariaLabel"])
});
const switchEmits = {
  [UPDATE_MODEL_EVENT]: (val) => isBoolean(val) || isString(val) || isNumber(val),
  [CHANGE_EVENT]: (val) => isBoolean(val) || isString(val) || isNumber(val),
  [INPUT_EVENT]: (val) => isBoolean(val) || isString(val) || isNumber(val)
};
const _hoisted_1$h = [
  "id",
  "aria-checked",
  "aria-disabled",
  "aria-label",
  "name",
  "true-value",
  "false-value",
  "disabled",
  "tabindex"
];
const _hoisted_2$g = ["aria-hidden"];
const _hoisted_3$d = { key: 1 };
const _hoisted_4$a = { key: 1 };
const _hoisted_5$9 = ["aria-hidden"];
const COMPONENT_NAME = "ElSwitch";
var switch_vue_vue_type_script_setup_true_lang_default = /* @__PURE__ */ defineComponent({
  name: COMPONENT_NAME,
  __name: "switch",
  props: switchProps,
  emits: switchEmits,
  setup(__props, { expose: __expose, emit: __emit }) {
    const props = __props;
    const emit2 = __emit;
    const { formItem } = useFormItem();
    const switchSize = useFormSize();
    const ns = useNamespace("switch");
    const { inputId } = useFormItemInputId(props, { formItemContext: formItem });
    const switchDisabled = useFormDisabled(computed(() => {
      if (props.loading) return true;
    }));
    const isControlled = /* @__PURE__ */ ref(props.modelValue !== false);
    const input = /* @__PURE__ */ shallowRef();
    const switchKls = computed(() => [
      ns.b(),
      ns.m(switchSize.value),
      ns.is("disabled", switchDisabled.value),
      ns.is("checked", checked.value)
    ]);
    const labelLeftKls = computed(() => [
      ns.e("label"),
      ns.em("label", "left"),
      ns.is("active", !checked.value)
    ]);
    const labelRightKls = computed(() => [
      ns.e("label"),
      ns.em("label", "right"),
      ns.is("active", checked.value)
    ]);
    const coreStyle = computed(() => ({ width: addUnit(props.width) }));
    watch(() => props.modelValue, () => {
      isControlled.value = true;
    });
    const actualValue = computed(() => {
      return isControlled.value ? props.modelValue : false;
    });
    const checked = computed(() => actualValue.value === props.activeValue);
    if (![props.activeValue, props.inactiveValue].includes(actualValue.value)) {
      emit2(UPDATE_MODEL_EVENT, props.inactiveValue);
      emit2(CHANGE_EVENT, props.inactiveValue);
      emit2(INPUT_EVENT, props.inactiveValue);
    }
    watch(checked, (val) => {
      input.value.checked = val;
      if (props.validateEvent) formItem?.validate?.("change").catch(NOOP);
    });
    const handleChange = () => {
      const val = checked.value ? props.inactiveValue : props.activeValue;
      emit2(UPDATE_MODEL_EVENT, val);
      emit2(CHANGE_EVENT, val);
      emit2(INPUT_EVENT, val);
      nextTick(() => {
        input.value.checked = checked.value;
      });
    };
    const switchValue = () => {
      if (switchDisabled.value) return;
      const { beforeChange } = props;
      if (!beforeChange) {
        handleChange();
        return;
      }
      const shouldChange = beforeChange();
      if (![isPromise(shouldChange), isBoolean(shouldChange)].includes(true)) throwError(COMPONENT_NAME, "beforeChange must return type `Promise<boolean>` or `boolean`");
      if (isPromise(shouldChange)) shouldChange.then((result) => {
        if (result) handleChange();
      }).catch((e) => {
        debugWarn(COMPONENT_NAME, `some error occurred: ${e}`);
      });
      else if (shouldChange) handleChange();
    };
    const focus = () => {
      input.value?.focus?.();
    };
    onMounted(() => {
      input.value.checked = checked.value;
    });
    __expose({
      /**
      *  @description manual focus to the switch component
      **/
      focus,
      /**
      * @description whether Switch is checked
      */
      checked
    });
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", {
        class: normalizeClass(switchKls.value),
        onClick: withModifiers(switchValue, ["prevent"])
      }, [
        createBaseVNode("input", {
          id: unref(inputId),
          ref_key: "input",
          ref: input,
          class: normalizeClass(unref(ns).e("input")),
          type: "checkbox",
          role: "switch",
          "aria-checked": checked.value,
          "aria-disabled": unref(switchDisabled),
          "aria-label": __props.ariaLabel,
          name: __props.name,
          "true-value": __props.activeValue,
          "false-value": __props.inactiveValue,
          disabled: unref(switchDisabled),
          tabindex: __props.tabindex,
          onChange: handleChange,
          onKeydown: withKeys(switchValue, ["enter"])
        }, null, 42, _hoisted_1$h),
        !__props.inlinePrompt && (__props.inactiveIcon || __props.inactiveText || _ctx.$slots.inactive) ? (openBlock(), createElementBlock("span", {
          key: 0,
          class: normalizeClass(labelLeftKls.value)
        }, [renderSlot(_ctx.$slots, "inactive", {}, () => [__props.inactiveIcon ? (openBlock(), createBlock(unref(ElIcon), { key: 0 }, {
          default: withCtx(() => [(openBlock(), createBlock(resolveDynamicComponent(__props.inactiveIcon)))]),
          _: 1
        })) : createCommentVNode("v-if", true), !__props.inactiveIcon && __props.inactiveText ? (openBlock(), createElementBlock("span", {
          key: 1,
          "aria-hidden": checked.value
        }, toDisplayString(__props.inactiveText), 9, _hoisted_2$g)) : createCommentVNode("v-if", true)])], 2)) : createCommentVNode("v-if", true),
        createBaseVNode("span", {
          class: normalizeClass(unref(ns).e("core")),
          style: normalizeStyle(coreStyle.value)
        }, [__props.inlinePrompt ? (openBlock(), createElementBlock("div", {
          key: 0,
          class: normalizeClass(unref(ns).e("inner"))
        }, [!checked.value ? (openBlock(), createElementBlock("div", {
          key: 0,
          class: normalizeClass(unref(ns).e("inner-wrapper"))
        }, [renderSlot(_ctx.$slots, "inactive", {}, () => [__props.inactiveIcon ? (openBlock(), createBlock(unref(ElIcon), { key: 0 }, {
          default: withCtx(() => [(openBlock(), createBlock(resolveDynamicComponent(__props.inactiveIcon)))]),
          _: 1
        })) : createCommentVNode("v-if", true), !__props.inactiveIcon && __props.inactiveText ? (openBlock(), createElementBlock("span", _hoisted_3$d, toDisplayString(__props.inactiveText), 1)) : createCommentVNode("v-if", true)])], 2)) : (openBlock(), createElementBlock("div", {
          key: 1,
          class: normalizeClass(unref(ns).e("inner-wrapper"))
        }, [renderSlot(_ctx.$slots, "active", {}, () => [__props.activeIcon ? (openBlock(), createBlock(unref(ElIcon), { key: 0 }, {
          default: withCtx(() => [(openBlock(), createBlock(resolveDynamicComponent(__props.activeIcon)))]),
          _: 1
        })) : createCommentVNode("v-if", true), !__props.activeIcon && __props.activeText ? (openBlock(), createElementBlock("span", _hoisted_4$a, toDisplayString(__props.activeText), 1)) : createCommentVNode("v-if", true)])], 2))], 2)) : createCommentVNode("v-if", true), createBaseVNode("div", { class: normalizeClass(unref(ns).e("action")) }, [__props.loading ? (openBlock(), createBlock(unref(ElIcon), {
          key: 0,
          class: normalizeClass(unref(ns).is("loading"))
        }, {
          default: withCtx(() => [createVNode(unref(loading_default))]),
          _: 1
        }, 8, ["class"])) : checked.value ? renderSlot(_ctx.$slots, "active-action", { key: 1 }, () => [__props.activeActionIcon ? (openBlock(), createBlock(unref(ElIcon), { key: 0 }, {
          default: withCtx(() => [(openBlock(), createBlock(resolveDynamicComponent(__props.activeActionIcon)))]),
          _: 1
        })) : createCommentVNode("v-if", true)]) : !checked.value ? renderSlot(_ctx.$slots, "inactive-action", { key: 2 }, () => [__props.inactiveActionIcon ? (openBlock(), createBlock(unref(ElIcon), { key: 0 }, {
          default: withCtx(() => [(openBlock(), createBlock(resolveDynamicComponent(__props.inactiveActionIcon)))]),
          _: 1
        })) : createCommentVNode("v-if", true)]) : createCommentVNode("v-if", true)], 2)], 6),
        !__props.inlinePrompt && (__props.activeIcon || __props.activeText || _ctx.$slots.active) ? (openBlock(), createElementBlock("span", {
          key: 1,
          class: normalizeClass(labelRightKls.value)
        }, [renderSlot(_ctx.$slots, "active", {}, () => [__props.activeIcon ? (openBlock(), createBlock(unref(ElIcon), { key: 0 }, {
          default: withCtx(() => [(openBlock(), createBlock(resolveDynamicComponent(__props.activeIcon)))]),
          _: 1
        })) : createCommentVNode("v-if", true), !__props.activeIcon && __props.activeText ? (openBlock(), createElementBlock("span", {
          key: 1,
          "aria-hidden": !checked.value
        }, toDisplayString(__props.activeText), 9, _hoisted_5$9)) : createCommentVNode("v-if", true)])], 2)) : createCommentVNode("v-if", true)
      ], 2);
    };
  }
});
var switch_default = switch_vue_vue_type_script_setup_true_lang_default;
const ElSwitch = withInstall(switch_default);
const messageTypes = [
  "primary",
  "success",
  "info",
  "warning",
  "error"
];
const messagePlacement = [
  "top",
  "top-left",
  "top-right",
  "bottom",
  "bottom-left",
  "bottom-right"
];
const messageDefaults = mutable({
  customClass: "",
  dangerouslyUseHTMLString: false,
  duration: 3e3,
  icon: void 0,
  id: "",
  message: "",
  onClose: void 0,
  showClose: false,
  type: "info",
  plain: false,
  offset: 16,
  placement: void 0,
  zIndex: 0,
  grouping: false,
  repeatNum: 1,
  appendTo: isClient ? document.body : void 0
});
const messageProps = buildProps({
  /**
  * @description custom class name for Message
  */
  customClass: {
    type: String,
    default: messageDefaults.customClass
  },
  /**
  * @description whether `message` is treated as HTML string
  */
  dangerouslyUseHTMLString: {
    type: Boolean,
    default: messageDefaults.dangerouslyUseHTMLString
  },
  /**
  * @description display duration, millisecond. If set to 0, it will not turn off automatically
  */
  duration: {
    type: Number,
    default: messageDefaults.duration
  },
  /**
  * @description custom icon component, overrides `type`
  */
  icon: {
    type: iconPropType,
    default: messageDefaults.icon
  },
  /**
  * @description message dom id
  */
  id: {
    type: String,
    default: messageDefaults.id
  },
  /**
  * @description message text
  */
  message: {
    type: definePropType([
      String,
      Object,
      Function
    ]),
    default: messageDefaults.message
  },
  /**
  * @description callback function when closed with the message instance as the parameter
  */
  onClose: {
    type: definePropType(Function),
    default: messageDefaults.onClose
  },
  /**
  * @description whether to show a close button
  */
  showClose: {
    type: Boolean,
    default: messageDefaults.showClose
  },
  /**
  * @description message type
  */
  type: {
    type: String,
    values: messageTypes,
    default: messageDefaults.type
  },
  /**
  * @description whether message is plain
  */
  plain: {
    type: Boolean,
    default: messageDefaults.plain
  },
  /**
  * @description set the distance to the top of viewport
  */
  offset: {
    type: Number,
    default: messageDefaults.offset
  },
  /**
  * @description message placement position
  */
  placement: {
    type: String,
    values: messagePlacement,
    default: messageDefaults.placement
  },
  /**
  * @description message element zIndex value
  */
  zIndex: {
    type: Number,
    default: messageDefaults.zIndex
  },
  /**
  * @description merge messages with the same content, type of VNode message is not supported
  */
  grouping: {
    type: Boolean,
    default: messageDefaults.grouping
  },
  /**
  * @description The number of repetitions, similar to badge, is used as the initial number when used with `grouping`
  */
  repeatNum: {
    type: Number,
    default: messageDefaults.repeatNum
  }
});
const messageEmits = { destroy: () => true };
const placementInstances = /* @__PURE__ */ shallowReactive({});
const getOrCreatePlacementInstances = (placement) => {
  if (!placementInstances[placement]) placementInstances[placement] = /* @__PURE__ */ shallowReactive([]);
  return placementInstances[placement];
};
const getInstance = (id, placement) => {
  const instances = placementInstances[placement] || [];
  const idx = instances.findIndex((instance) => instance.id === id);
  const current = instances[idx];
  let prev;
  if (idx > 0) prev = instances[idx - 1];
  return {
    current,
    prev
  };
};
const getLastOffset = (id, placement) => {
  const { prev } = getInstance(id, placement);
  if (!prev) return 0;
  return prev.vm.exposed.bottom.value;
};
const getOffsetOrSpace = (id, offset, placement) => {
  return (placementInstances[placement] || []).findIndex((instance) => instance.id === id) > 0 ? 16 : offset;
};
const _hoisted_1$g = ["id"];
const _hoisted_2$f = ["innerHTML"];
var message_vue_vue_type_script_setup_true_lang_default = /* @__PURE__ */ defineComponent({
  name: "ElMessage",
  __name: "message",
  props: messageProps,
  emits: messageEmits,
  setup(__props, { expose: __expose, emit: __emit }) {
    const { Close } = TypeComponents;
    const props = __props;
    const emit2 = __emit;
    const isStartTransition = /* @__PURE__ */ ref(false);
    const { ns, zIndex: zIndex2 } = useGlobalComponentSettings("message");
    const { currentZIndex, nextZIndex } = zIndex2;
    const messageRef = /* @__PURE__ */ ref();
    const visible = /* @__PURE__ */ ref(false);
    const height = /* @__PURE__ */ ref(0);
    let stopTimer = void 0;
    const badgeType = computed(() => props.type ? props.type === "error" ? "danger" : props.type : "info");
    const typeClass = computed(() => {
      const type = props.type;
      return { [ns.bm("icon", type)]: type && TypeComponentsMap[type] };
    });
    const iconComponent = computed(() => props.icon || TypeComponentsMap[props.type] || "");
    const placement = computed(() => props.placement || "top");
    const lastOffset = computed(() => getLastOffset(props.id, placement.value));
    const offset = computed(() => {
      return Math.max(getOffsetOrSpace(props.id, props.offset, placement.value) + lastOffset.value, props.offset);
    });
    const bottom = computed(() => height.value + offset.value);
    const horizontalClass = computed(() => {
      if (placement.value.includes("left")) return ns.is("left");
      if (placement.value.includes("right")) return ns.is("right");
      return ns.is("center");
    });
    const verticalProperty = computed(() => placement.value.startsWith("top") ? "top" : "bottom");
    const customStyle = computed(() => ({
      [verticalProperty.value]: `${offset.value}px`,
      zIndex: currentZIndex.value
    }));
    function startTimer() {
      if (props.duration === 0) return;
      ({ stop: stopTimer } = useTimeoutFn(() => {
        close();
      }, props.duration));
    }
    function clearTimer() {
      stopTimer?.();
    }
    function close() {
      visible.value = false;
      nextTick(() => {
        if (!isStartTransition.value) {
          props.onClose?.();
          emit2("destroy");
        }
      });
    }
    function keydown(event) {
      if (getEventCode(event) === EVENT_CODE.esc) close();
    }
    onMounted(() => {
      startTimer();
      nextZIndex();
      visible.value = true;
    });
    watch(() => props.repeatNum, () => {
      clearTimer();
      startTimer();
    });
    useEventListener(document, "keydown", keydown);
    useResizeObserver(messageRef, () => {
      height.value = messageRef.value.getBoundingClientRect().height;
    });
    __expose({
      visible,
      bottom,
      close
    });
    return (_ctx, _cache) => {
      return openBlock(), createBlock(Transition, {
        name: unref(ns).b("fade"),
        onBeforeEnter: _cache[0] || (_cache[0] = ($event) => isStartTransition.value = true),
        onBeforeLeave: __props.onClose,
        onAfterLeave: _cache[1] || (_cache[1] = ($event) => _ctx.$emit("destroy")),
        persisted: ""
      }, {
        default: withCtx(() => [withDirectives(createBaseVNode("div", {
          id: __props.id,
          ref_key: "messageRef",
          ref: messageRef,
          class: normalizeClass([
            unref(ns).b(),
            { [unref(ns).m(__props.type)]: __props.type },
            unref(ns).is("closable", __props.showClose),
            unref(ns).is("plain", __props.plain),
            unref(ns).is("bottom", verticalProperty.value === "bottom"),
            horizontalClass.value,
            __props.customClass
          ]),
          style: normalizeStyle(customStyle.value),
          role: "alert",
          onMouseenter: clearTimer,
          onMouseleave: startTimer
        }, [
          __props.repeatNum > 1 ? (openBlock(), createBlock(unref(ElBadge), {
            key: 0,
            value: __props.repeatNum,
            type: badgeType.value,
            class: normalizeClass(unref(ns).e("badge"))
          }, null, 8, [
            "value",
            "type",
            "class"
          ])) : createCommentVNode("v-if", true),
          iconComponent.value ? (openBlock(), createBlock(unref(ElIcon), {
            key: 1,
            class: normalizeClass([unref(ns).e("icon"), typeClass.value])
          }, {
            default: withCtx(() => [(openBlock(), createBlock(resolveDynamicComponent(iconComponent.value)))]),
            _: 1
          }, 8, ["class"])) : createCommentVNode("v-if", true),
          !__props.dangerouslyUseHTMLString || _ctx.$slots.default ? (openBlock(), createElementBlock("p", {
            key: 2,
            class: normalizeClass(unref(ns).e("content"))
          }, [renderSlot(_ctx.$slots, "default", {}, () => [createTextVNode(toDisplayString(__props.message), 1)])], 2)) : (openBlock(), createElementBlock(Fragment, { key: 3 }, [createCommentVNode(" Caution here, message could've been compromised, never use user's input as message "), createBaseVNode("p", {
            class: normalizeClass(unref(ns).e("content")),
            innerHTML: __props.message
          }, null, 10, _hoisted_2$f)], 2112)),
          __props.showClose ? (openBlock(), createBlock(unref(ElIcon), {
            key: 4,
            class: normalizeClass(unref(ns).e("closeBtn")),
            onClick: withModifiers(close, ["stop"])
          }, {
            default: withCtx(() => [createVNode(unref(Close))]),
            _: 1
          }, 8, ["class"])) : createCommentVNode("v-if", true)
        ], 46, _hoisted_1$g), [[vShow, visible.value]])]),
        _: 3
      }, 8, ["name", "onBeforeLeave"]);
    };
  }
});
var message_default = message_vue_vue_type_script_setup_true_lang_default;
let seed = 1;
const normalizeAppendTo = (normalized) => {
  if (!normalized.appendTo) normalized.appendTo = document.body;
  else if (isString(normalized.appendTo)) {
    let appendTo = document.querySelector(normalized.appendTo);
    if (!isElement(appendTo)) {
      debugWarn("ElMessage", "the appendTo option is not an HTMLElement. Falling back to document.body.");
      appendTo = document.body;
    }
    normalized.appendTo = appendTo;
  }
};
const normalizePlacement = (normalized) => {
  if (!normalized.placement && isString(messageConfig.placement) && messageConfig.placement) normalized.placement = messageConfig.placement;
  if (!normalized.placement) normalized.placement = "top";
  if (!messagePlacement.includes(normalized.placement)) {
    debugWarn("ElMessage", `Invalid placement: ${normalized.placement}. Falling back to 'top'.`);
    normalized.placement = "top";
  }
};
const normalizeOptions = (params) => {
  const options = !params || isString(params) || isVNode(params) || isFunction$1(params) ? { message: params } : params;
  const normalized = {
    ...messageDefaults,
    ...options
  };
  normalizeAppendTo(normalized);
  normalizePlacement(normalized);
  if (isBoolean(messageConfig.grouping) && !normalized.grouping) normalized.grouping = messageConfig.grouping;
  if (isNumber(messageConfig.duration) && normalized.duration === 3e3) normalized.duration = messageConfig.duration;
  if (isNumber(messageConfig.offset) && normalized.offset === 16) normalized.offset = messageConfig.offset;
  if (isBoolean(messageConfig.showClose) && !normalized.showClose) normalized.showClose = messageConfig.showClose;
  if (isBoolean(messageConfig.plain) && !normalized.plain) normalized.plain = messageConfig.plain;
  return normalized;
};
const closeMessage = (instance) => {
  const instances = placementInstances[instance.props.placement || "top"];
  const idx = instances.indexOf(instance);
  if (idx === -1) return;
  instances.splice(idx, 1);
  const { handler } = instance;
  handler.close();
};
const createMessage = ({ appendTo, ...options }, context) => {
  const id = `message_${seed++}`;
  const userOnClose = options.onClose;
  const container = document.createElement("div");
  const props = {
    ...options,
    id,
    onClose: () => {
      userOnClose?.();
      closeMessage(instance);
    },
    onDestroy: () => {
      render(null, container);
    }
  };
  const vnode = createVNode(message_default, props, isFunction$1(props.message) || isVNode(props.message) ? { default: isFunction$1(props.message) ? props.message : () => props.message } : null);
  vnode.appContext = context || message._context;
  render(vnode, container);
  appendTo.appendChild(container.firstElementChild);
  const vm = vnode.component;
  const instance = {
    id,
    vnode,
    vm,
    handler: { close: () => {
      vm.exposed.close();
    } },
    props: vnode.component.props
  };
  return instance;
};
const message = (options = {}, context) => {
  if (!isClient) return { close: () => void 0 };
  const normalized = normalizeOptions(options);
  const instances = getOrCreatePlacementInstances(normalized.placement || "top");
  if (normalized.grouping && instances.length) {
    const instance2 = instances.find(({ vnode: vm }) => vm.props?.message === normalized.message);
    if (instance2) {
      instance2.props.repeatNum += 1;
      instance2.props.type = normalized.type;
      return instance2.handler;
    }
  }
  if (isNumber(messageConfig.max) && instances.length >= messageConfig.max) return { close: () => void 0 };
  const instance = createMessage(normalized, context);
  instances.push(instance);
  return instance.handler;
};
messageTypes.forEach((type) => {
  message[type] = (options = {}, appContext) => {
    return message({
      ...normalizeOptions(options),
      type
    }, appContext);
  };
});
function closeAll(type) {
  for (const placement in placementInstances) if (hasOwn(placementInstances, placement)) {
    const instances = [...placementInstances[placement]];
    for (const instance of instances) if (!type || type === instance.props.type) instance.handler.close();
  }
}
function closeAllByPlacement(placement) {
  if (!placementInstances[placement]) return;
  [...placementInstances[placement]].forEach((instance) => instance.handler.close());
}
message.closeAll = closeAll;
message.closeAllByPlacement = closeAllByPlacement;
message._context = null;
const ElMessage = withInstallFunction(message, "$message");
const _hoisted_1$f = { class: "app-footer" };
const _hoisted_2$e = {
  target: "_blank",
  rel: "noreferrer"
};
const _hoisted_3$c = {
  target: "_blank",
  rel: "noreferrer"
};
const _sfc_main$f = /* @__PURE__ */ defineComponent({
  __name: "AppFooter",
  setup(__props) {
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("footer", _hoisted_1$f, [
        _cache[2] || (_cache[2] = createBaseVNode("span", { class: "footer-author" }, "", -1)),
        _cache[3] || (_cache[3] = createBaseVNode("span", { class: "footer-separator" }, "|", -1)),
        createBaseVNode("a", _hoisted_2$e, [
          createVNode(unref(ElIcon), null, {
            default: withCtx(() => [
              createVNode(unref(chat_dot_round_default))
            ]),
            _: 1
          }),
          _cache[0] || (_cache[0] = createTextVNode(" ", -1))
        ]),
        _cache[4] || (_cache[4] = createBaseVNode("span", { class: "footer-separator" }, "|", -1)),
        createBaseVNode("a", _hoisted_3$c, [
          createVNode(unref(ElIcon), null, {
            default: withCtx(() => [
              createVNode(unref(chat_dot_round_default))
            ]),
            _: 1
          }),
          _cache[1] || (_cache[1] = createTextVNode(" ", -1))
        ]),
        _cache[5] || (_cache[5] = createBaseVNode("span", { class: "footer-separator" }, "|", -1)),
        _cache[6] || (_cache[6] = createBaseVNode("a", {
          target: "_blank",
          href: "https://5x-class.feishu.cn/wiki/SEbcwBFO0iS98ekvBwHc0KTzndf"
        }, " 操作文档 https://5x-class.feishu.cn/wiki/SEbcwBFO0iS98ekvBwHc0KTzndf ", -1))
      ]);
    };
  }
});
const _export_sfc = (sfc, props) => {
  const target = sfc.__vccOpts || sfc;
  for (const [key, val] of props) {
    target[key] = val;
  }
  return target;
};
const AppFooter = /* @__PURE__ */ _export_sfc(_sfc_main$f, [["__scopeId", "data-v-5f0f9db6"]]);
const _sfc_main$e = {};
const _hoisted_1$e = { class: "app-header" };
function _sfc_render(_ctx, _cache) {
  return openBlock(), createElementBlock("header", _hoisted_1$e, [..._cache[0] || (_cache[0] = [
    createStaticVNode('<div class="project-brand" aria-label="AI数字人口播助手" data-v-67663027><span class="brand-mark" data-v-67663027>IP</span><div class="brand-copy" data-v-67663027><div class="project-name" data-v-67663027>AI数字人口播助手</div></div></div><div class="beta-notice" data-v-67663027><p class="beta-title" data-v-67663027>📺 AI数字人口播视频制作</p><p class="beta-desc" data-v-67663027>一键生成高质量数字人口播视频，支持抖音文案提取、AI改写、语音克隆、视频对口型。</p></div>', 2)
  ])]);
}
const AppHeader = /* @__PURE__ */ _export_sfc(_sfc_main$e, [["render", _sfc_render], ["__scopeId", "data-v-67663027"]]);
const createdCopyText = /* @__PURE__ */ ref("");
function useWorkflowState() {
  return {
    createdCopyText
  };
}
function isCopyCreationResult(value) {
  return typeof value === "object" && value !== null && "text" in value && typeof value.text === "string";
}
let sharedCopyCreationState = null;
function useCopyCreationImpl() {
  const rewriteRequirements = /* @__PURE__ */ ref("");
  const { createdCopyText: createdCopy } = useWorkflowState();
  const copyCreationModelConfig = /* @__PURE__ */ reactive({
    activeProvider: "moark",
    apiKey: "",
    modelName: "deepseek-v4-flash",
    moark: {
      apiKey: "",
      modelName: "DeepSeek-V4-Flash"
    }
  });
  const isCopyCreationConfigOpen = /* @__PURE__ */ ref(false);
  const isCreatingCopy = /* @__PURE__ */ ref(false);
  const isSavingCopyCreationConfig = /* @__PURE__ */ ref(false);
  const isCopyCreationCancelled = /* @__PURE__ */ ref(false);
  const creationElapsedMs = /* @__PURE__ */ ref(0);
  let creationStartedAt = 0;
  let creationTimer;
  const creationElapsedText = computed(
    () => `${(creationElapsedMs.value / 1e3).toFixed(2)}秒`
  );
  const hasCopyCreationModelConfig = computed(() => {
    if (copyCreationModelConfig.activeProvider === "moark") {
      return Boolean(
        copyCreationModelConfig.moark.apiKey.trim() && copyCreationModelConfig.moark.modelName.trim()
      );
    }
    return Boolean(
      copyCreationModelConfig.apiKey.trim() && copyCreationModelConfig.modelName.trim()
    );
  });
  function isCopyCreationConfigStore(value) {
    return typeof value === "object" && value !== null;
  }
  function applyStoredConfig(storedConfig) {
    if (!isCopyCreationConfigStore(storedConfig)) {
      return;
    }
    if (typeof storedConfig.apiKey === "string") {
      copyCreationModelConfig.apiKey = storedConfig.apiKey;
    }
    if (typeof storedConfig.modelName === "string") {
      copyCreationModelConfig.modelName = storedConfig.modelName;
    }
    const provider = storedConfig.activeProvider;
    if (provider === "custom" || provider === "ali" || provider === "moark") {
      copyCreationModelConfig.activeProvider = provider;
    }
    const moark = storedConfig.moark;
    if (typeof moark === "object" && moark !== null) {
      const m = moark;
      if (typeof m.apiKey === "string") {
        copyCreationModelConfig.moark.apiKey = m.apiKey;
      }
      if (typeof m.modelName === "string") {
        copyCreationModelConfig.moark.modelName = m.modelName;
      }
    }
  }
  function openCopyCreationConfig() {
    isCopyCreationConfigOpen.value = true;
  }
  function closeCopyCreationConfig() {
    isCopyCreationConfigOpen.value = false;
  }
  function ensureCopyCreationConfig() {
    if (hasCopyCreationModelConfig.value) {
      return true;
    }
    openCopyCreationConfig();
    ElMessage.warning("请先配置文案创作模型");
    return false;
  }
  async function refreshCopyCreationConfig() {
    const storedConfig = await window.desktopApi.loadCopyCreationConfig();
    applyStoredConfig(storedConfig);
  }
  async function saveCopyCreationConfig() {
    isSavingCopyCreationConfig.value = true;
    try {
      await window.desktopApi.saveCopyCreationConfig({
        activeProvider: copyCreationModelConfig.activeProvider,
        apiKey: copyCreationModelConfig.apiKey,
        modelName: copyCreationModelConfig.modelName,
        moark: {
          apiKey: copyCreationModelConfig.moark.apiKey,
          modelName: copyCreationModelConfig.moark.modelName
        }
      });
      closeCopyCreationConfig();
      ElMessage.success("配置保存成功");
    } finally {
      isSavingCopyCreationConfig.value = false;
    }
  }
  function startCreationTimer() {
    creationStartedAt = Date.now();
    creationElapsedMs.value = 0;
    if (creationTimer) {
      window.clearInterval(creationTimer);
    }
    creationTimer = window.setInterval(() => {
      creationElapsedMs.value = Date.now() - creationStartedAt;
    }, 100);
  }
  function stopCreationTimer() {
    if (creationStartedAt > 0) {
      creationElapsedMs.value = Date.now() - creationStartedAt;
    }
    if (creationTimer) {
      window.clearInterval(creationTimer);
      creationTimer = void 0;
    }
  }
  function getPayload(sourceCopy) {
    return {
      rewriteRequirements: rewriteRequirements.value,
      sourceCopy
    };
  }
  async function createRewriteCopy(sourceCopy) {
    if (isCreatingCopy.value) {
      return;
    }
    if (!ensureCopyCreationConfig()) {
      return;
    }
    if (!sourceCopy.trim()) {
      ElMessage.warning("请先完成第一步提取文案");
      return;
    }
    isCopyCreationCancelled.value = false;
    isCreatingCopy.value = true;
    createdCopy.value = "";
    startCreationTimer();
    try {
      const result = await window.desktopApi.createRewriteCopy(
        getPayload(sourceCopy)
      );
      if (isCopyCreationCancelled.value) {
        return;
      }
      if (!isCopyCreationResult(result)) {
        throw new Error("Invalid copy creation result");
      }
      createdCopy.value = result.text;
      ElMessage.success("文案创作完成");
    } catch (error) {
      if (!isCopyCreationCancelled.value) {
        ElMessage.error(
          error instanceof Error ? error.message : "文案创作失败"
        );
      }
    } finally {
      isCreatingCopy.value = false;
      stopCreationTimer();
    }
  }
  async function stopCopyCreation() {
    if (!isCreatingCopy.value) {
      return;
    }
    isCopyCreationCancelled.value = true;
    await window.desktopApi.cancelCopyCreation();
    isCreatingCopy.value = false;
    stopCreationTimer();
    ElMessage.info("已停止创作");
  }
  onMounted(() => {
    void refreshCopyCreationConfig();
  });
  onUnmounted(() => {
    if (creationTimer) {
      window.clearInterval(creationTimer);
    }
  });
  return {
    closeCopyCreationConfig,
    createdCopy,
    creationElapsedText,
    copyCreationModelConfig,
    createRewriteCopy,
    isCopyCreationConfigOpen,
    isCreatingCopy,
    isSavingCopyCreationConfig,
    openCopyCreationConfig,
    rewriteRequirements,
    saveCopyCreationConfig,
    stopCopyCreation
  };
}
function useCopyCreation() {
  if (!sharedCopyCreationState) {
    sharedCopyCreationState = useCopyCreationImpl();
  }
  return sharedCopyCreationState;
}
function isDouyinExtractionResult(value) {
  return typeof value === "object" && value !== null && "videoUrl" in value && "text" in value && typeof value.videoUrl === "string" && typeof value.text === "string";
}
let sharedDouyinExtractionState = null;
function useDouyinExtractionImpl() {
  const douyinUrl = /* @__PURE__ */ ref("https://www.douyin.com/video/7398511343432715546");
  const activeExtractionProvider = /* @__PURE__ */ ref("moark");
  const isExtractionConfigOpen = /* @__PURE__ */ ref(false);
  const isSavingExtractionConfig = /* @__PURE__ */ ref(false);
  const isExtractingDouyin = /* @__PURE__ */ ref(false);
  const isDouyinCancelled = /* @__PURE__ */ ref(false);
  const extractedVideoUrl = /* @__PURE__ */ ref("");
  const extractedCopy = /* @__PURE__ */ ref("");
  const extractionElapsedMs = /* @__PURE__ */ ref(0);
  const extractionModelConfig = /* @__PURE__ */ reactive({
    activeProvider: "moark",
    ali: {
      apiKey: "",
      modelName: "",
      serviceUrl: ""
    },
    moark: {
      apiKey: ""
    },
    custom: {
      note: ""
    }
  });
  let extractionStartedAt = 0;
  let extractionTimer;
  const extractionElapsedText = computed(
    () => `${(extractionElapsedMs.value / 1e3).toFixed(2)}秒`
  );
  const hasExtractionModelConfig = computed(() => {
    if (activeExtractionProvider.value === "moark") {
      return Boolean(extractionModelConfig.moark.apiKey.trim());
    }
    if (activeExtractionProvider.value === "ali") {
      return Boolean(extractionModelConfig.ali.apiKey.trim());
    }
    return false;
  });
  function isDouyinExtractionConfigStore(value) {
    return typeof value === "object" && value !== null;
  }
  function applyStoredConfig(storedConfig) {
    if (!isDouyinExtractionConfigStore(storedConfig)) {
      return;
    }
    const provider = storedConfig.activeProvider;
    if (provider === "custom" || provider === "moark") {
      activeExtractionProvider.value = provider;
    } else {
      activeExtractionProvider.value = "ali";
    }
    extractionModelConfig.activeProvider = activeExtractionProvider.value;
    if (typeof storedConfig.ali?.apiKey === "string") {
      extractionModelConfig.ali.apiKey = storedConfig.ali.apiKey;
    }
    if (typeof storedConfig.ali?.serviceUrl === "string") {
      extractionModelConfig.ali.serviceUrl = storedConfig.ali.serviceUrl;
    }
    if (typeof storedConfig.ali?.modelName === "string") {
      extractionModelConfig.ali.modelName = storedConfig.ali.modelName;
    }
    const moark = storedConfig.moark;
    if (typeof moark === "object" && moark !== null) {
      const m = moark;
      if (typeof m.apiKey === "string") {
        extractionModelConfig.moark.apiKey = m.apiKey;
      }
    }
    if (typeof storedConfig.custom?.note === "string") {
      extractionModelConfig.custom.note = storedConfig.custom.note;
    }
  }
  function openExtractionConfig() {
    isExtractionConfigOpen.value = true;
  }
  function closeExtractionConfig() {
    isExtractionConfigOpen.value = false;
  }
  function ensureExtractionConfig() {
    if (hasExtractionModelConfig.value) {
      return true;
    }
    openExtractionConfig();
    ElMessage.warning("请先配置提取文案模型");
    return false;
  }
  async function refreshExtractionConfig() {
    const storedConfig = await window.desktopApi.loadDouyinExtractionConfig();
    applyStoredConfig(storedConfig);
  }
  async function saveExtractionConfig() {
    isSavingExtractionConfig.value = true;
    try {
      activeExtractionProvider.value = extractionModelConfig.activeProvider;
      await window.desktopApi.saveDouyinExtractionConfig({
        activeProvider: extractionModelConfig.activeProvider,
        ali: {
          apiKey: extractionModelConfig.ali.apiKey,
          modelName: extractionModelConfig.ali.modelName,
          serviceUrl: extractionModelConfig.ali.serviceUrl
        },
        moark: {
          apiKey: extractionModelConfig.moark.apiKey
        },
        custom: {
          note: extractionModelConfig.custom.note
        }
      });
      closeExtractionConfig();
      ElMessage.success("配置保存成功");
    } finally {
      isSavingExtractionConfig.value = false;
    }
  }
  function startExtractionTimer() {
    extractionStartedAt = Date.now();
    extractionElapsedMs.value = 0;
    if (extractionTimer) {
      window.clearInterval(extractionTimer);
    }
    extractionTimer = window.setInterval(() => {
      extractionElapsedMs.value = Date.now() - extractionStartedAt;
    }, 100);
  }
  function stopExtractionTimer() {
    if (extractionStartedAt > 0) {
      extractionElapsedMs.value = Date.now() - extractionStartedAt;
    }
    if (extractionTimer) {
      window.clearInterval(extractionTimer);
      extractionTimer = void 0;
    }
  }
  async function extractDouyinCopy() {
    if (isExtractingDouyin.value) {
      return;
    }
    if (!ensureExtractionConfig()) {
      return;
    }
    const url = douyinUrl.value.trim();
    if (!url) {
      ElMessage.warning("请输入抖音地址");
      return;
    }
    isDouyinCancelled.value = false;
    isExtractingDouyin.value = true;
    extractedVideoUrl.value = "";
    extractedCopy.value = "";
    startExtractionTimer();
    try {
      const result = await window.desktopApi.extractDouyinCopy(url);
      if (isDouyinCancelled.value) {
        return;
      }
      if (!isDouyinExtractionResult(result)) {
        throw new Error("Invalid extraction result");
      }
      extractedVideoUrl.value = result.videoUrl;
      extractedCopy.value = result.text;
      ElMessage.success("文案提取完成");
    } catch (error) {
      if (!isDouyinCancelled.value) {
        ElMessage.error(
          error instanceof Error ? error.message : "文案提取失败"
        );
      }
    } finally {
      isExtractingDouyin.value = false;
      stopExtractionTimer();
    }
  }
  async function stopDouyinExtraction() {
    if (!isExtractingDouyin.value) {
      return;
    }
    isDouyinCancelled.value = true;
    await window.desktopApi.cancelDouyinExtraction();
    isExtractingDouyin.value = false;
    stopExtractionTimer();
    ElMessage.info("已停止提取");
  }
  onMounted(() => {
    void refreshExtractionConfig();
  });
  onUnmounted(() => {
    if (extractionTimer) {
      window.clearInterval(extractionTimer);
    }
  });
  return {
    activeExtractionProvider,
    closeExtractionConfig,
    douyinUrl,
    extractionModelConfig,
    extractionElapsedText,
    extractedCopy,
    extractedVideoUrl,
    extractDouyinCopy,
    isExtractionConfigOpen,
    isExtractingDouyin,
    isSavingExtractionConfig,
    openExtractionConfig,
    saveExtractionConfig,
    stopDouyinExtraction
  };
}
function useDouyinExtraction() {
  if (!sharedDouyinExtractionState) {
    sharedDouyinExtractionState = useDouyinExtractionImpl();
  }
  return sharedDouyinExtractionState;
}
const _hoisted_1$d = { class: "feature-column" };
const _hoisted_2$d = { class: "column-body douyin-tool" };
const _hoisted_3$b = { class: "tool-field" };
const _hoisted_4$9 = ["disabled"];
const _hoisted_5$8 = { class: "tool-actions extraction-actions" };
const _hoisted_6$8 = ["disabled"];
const _hoisted_7$7 = ["disabled"];
const _hoisted_8$7 = { class: "result-panel copy-panel" };
const _hoisted_9$7 = { class: "result-title-row" };
const _hoisted_10$8 = { class: "title-actions" };
const _hoisted_11$7 = ["disabled"];
const _hoisted_12$7 = {
  class: "elapsed-badge",
  "aria-label": "提取耗时"
};
const _hoisted_13$6 = { class: "copy-creation-tool" };
const _hoisted_14$6 = { class: "tool-field other-requirements-field" };
const _hoisted_15$6 = ["disabled"];
const _hoisted_16$5 = { class: "tool-actions creation-actions" };
const _hoisted_17$4 = ["disabled"];
const _hoisted_18$4 = ["disabled"];
const _hoisted_19$4 = { class: "result-panel copy-panel created-copy-panel" };
const _hoisted_20$4 = { class: "result-title-row" };
const _hoisted_21$4 = {
  class: "elapsed-badge",
  "aria-label": "创作耗时"
};
const _hoisted_22$4 = {
  key: 0,
  class: "modal-backdrop"
};
const _hoisted_23$4 = {
  class: "config-modal",
  role: "dialog",
  "aria-modal": "true",
  "aria-labelledby": "douyin-config-title"
};
const _hoisted_24$4 = { class: "modal-header" };
const _hoisted_25$4 = { class: "config-modal-body" };
const _hoisted_26$4 = { class: "provider-select-field" };
const _hoisted_27$4 = { class: "config-field" };
const _hoisted_28$4 = { class: "config-field" };
const _hoisted_29$4 = { class: "modal-actions" };
const _hoisted_30$4 = ["disabled"];
const _hoisted_31$4 = ["disabled"];
const _hoisted_32$3 = {
  key: 1,
  class: "modal-backdrop"
};
const _hoisted_33$3 = {
  class: "config-modal",
  role: "dialog",
  "aria-modal": "true",
  "aria-labelledby": "copy-creation-config-title"
};
const _hoisted_34$3 = { class: "modal-header" };
const _hoisted_35$3 = { class: "config-modal-body" };
const _hoisted_36$3 = { class: "provider-select-field" };
const _hoisted_37$3 = { class: "config-field" };
const _hoisted_38$3 = { class: "config-field" };
const _hoisted_39$3 = { class: "config-field" };
const _hoisted_40$3 = { class: "config-field" };
const _hoisted_41$3 = { class: "modal-actions" };
const _hoisted_42$3 = ["disabled"];
const _hoisted_43$3 = ["disabled"];
const _hoisted_44$3 = {
  key: 2,
  class: "modal-backdrop"
};
const _hoisted_45$3 = {
  class: "video-preview-modal",
  role: "dialog",
  "aria-modal": "true",
  "aria-labelledby": "video-preview-title"
};
const _hoisted_46$3 = { class: "video-preview-body" };
const _hoisted_47$2 = ["src"];
const _sfc_main$d = /* @__PURE__ */ defineComponent({
  __name: "DouyinExtractionColumn",
  setup(__props) {
    const {
      closeExtractionConfig,
      douyinUrl,
      extractionModelConfig,
      extractionElapsedText,
      extractedCopy,
      extractedVideoUrl,
      extractDouyinCopy,
      isExtractionConfigOpen,
      isExtractingDouyin,
      isSavingExtractionConfig,
      openExtractionConfig,
      saveExtractionConfig,
      stopDouyinExtraction
    } = useDouyinExtraction();
    const {
      closeCopyCreationConfig,
      createdCopy,
      creationElapsedText,
      copyCreationModelConfig,
      createRewriteCopy,
      isCopyCreationConfigOpen,
      isCreatingCopy,
      isSavingCopyCreationConfig,
      openCopyCreationConfig,
      rewriteRequirements,
      saveCopyCreationConfig,
      stopCopyCreation
    } = useCopyCreation();
    const isVideoPreviewOpen = /* @__PURE__ */ ref(false);
    function openVideoPreview() {
      if (!extractedVideoUrl.value) {
        return;
      }
      isVideoPreviewOpen.value = true;
    }
    function closeVideoPreview() {
      isVideoPreviewOpen.value = false;
    }
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("article", _hoisted_1$d, [
        createBaseVNode("div", _hoisted_2$d, [
          createVNode(unref(ElDivider), { class: "step-divider" }, {
            default: withCtx(() => [..._cache[24] || (_cache[24] = [
              createTextVNode("第一步：提取抖音文案", -1)
            ])]),
            _: 1
          }),
          createBaseVNode("label", _hoisted_3$b, [
            _cache[25] || (_cache[25] = createBaseVNode("span", null, "抖音地址", -1)),
            withDirectives(createBaseVNode("input", {
              "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => /* @__PURE__ */ isRef(douyinUrl) ? douyinUrl.value = $event : null),
              type: "text",
              placeholder: "请输入抖音分享地址",
              disabled: unref(isExtractingDouyin)
            }, null, 8, _hoisted_4$9), [
              [vModelText, unref(douyinUrl)]
            ])
          ]),
          createBaseVNode("div", _hoisted_5$8, [
            createBaseVNode("button", {
              class: "primary-button",
              type: "button",
              disabled: unref(isExtractingDouyin),
              onClick: _cache[1] || (_cache[1] = //@ts-ignore
              (...args) => unref(extractDouyinCopy) && unref(extractDouyinCopy)(...args))
            }, toDisplayString(unref(isExtractingDouyin) ? "提取中..." : "提取文案"), 9, _hoisted_6$8),
            createBaseVNode("button", {
              class: "secondary-button",
              type: "button",
              disabled: !unref(isExtractingDouyin),
              onClick: _cache[2] || (_cache[2] = //@ts-ignore
              (...args) => unref(stopDouyinExtraction) && unref(stopDouyinExtraction)(...args))
            }, " 停止中断 ", 8, _hoisted_7$7),
            createBaseVNode("button", {
              class: "secondary-button model-config-button",
              type: "button",
              title: "模型配置",
              onClick: _cache[3] || (_cache[3] = //@ts-ignore
              (...args) => unref(openExtractionConfig) && unref(openExtractionConfig)(...args))
            }, [
              createVNode(unref(setting_default)),
              _cache[26] || (_cache[26] = createTextVNode(" 模型配置 ", -1))
            ])
          ]),
          createBaseVNode("section", _hoisted_8$7, [
            createBaseVNode("div", _hoisted_9$7, [
              _cache[27] || (_cache[27] = createBaseVNode("h3", null, "提取文案", -1)),
              createBaseVNode("div", _hoisted_10$8, [
                createBaseVNode("button", {
                  class: "text-link-button",
                  type: "button",
                  disabled: !unref(extractedVideoUrl),
                  onClick: openVideoPreview
                }, " 无水印视频预览 ", 8, _hoisted_11$7),
                createBaseVNode("span", _hoisted_12$7, [
                  createVNode(unref(stopwatch_default), {
                    class: "elapsed-icon",
                    "aria-hidden": "true"
                  }),
                  createTextVNode(" " + toDisplayString(unref(extractionElapsedText)), 1)
                ])
              ])
            ]),
            withDirectives(createBaseVNode("textarea", {
              "onUpdate:modelValue": _cache[4] || (_cache[4] = ($event) => /* @__PURE__ */ isRef(extractedCopy) ? extractedCopy.value = $event : null),
              rows: "8",
              placeholder: "提取完成后显示文案，可在这里修改"
            }, null, 512), [
              [vModelText, unref(extractedCopy)]
            ])
          ]),
          createVNode(unref(ElDivider), { class: "step-divider" }, {
            default: withCtx(() => [..._cache[28] || (_cache[28] = [
              createTextVNode("第二步：文案创作改写", -1)
            ])]),
            _: 1
          }),
          createBaseVNode("section", _hoisted_13$6, [
            createBaseVNode("label", _hoisted_14$6, [
              _cache[29] || (_cache[29] = createBaseVNode("span", null, "改写要求", -1)),
              withDirectives(createBaseVNode("textarea", {
                "onUpdate:modelValue": _cache[5] || (_cache[5] = ($event) => /* @__PURE__ */ isRef(rewriteRequirements) ? rewriteRequirements.value = $event : null),
                rows: "3",
                placeholder: "例如：更适合女性用户，开头三秒更强的钩子。",
                disabled: unref(isCreatingCopy)
              }, null, 8, _hoisted_15$6), [
                [vModelText, unref(rewriteRequirements)]
              ])
            ]),
            createBaseVNode("div", _hoisted_16$5, [
              createBaseVNode("button", {
                class: "primary-button",
                type: "button",
                disabled: unref(isCreatingCopy),
                onClick: _cache[6] || (_cache[6] = ($event) => unref(createRewriteCopy)(unref(extractedCopy)))
              }, toDisplayString(unref(isCreatingCopy) ? "创作中..." : "文案创作"), 9, _hoisted_17$4),
              createBaseVNode("button", {
                class: "secondary-button",
                type: "button",
                disabled: !unref(isCreatingCopy),
                onClick: _cache[7] || (_cache[7] = //@ts-ignore
                (...args) => unref(stopCopyCreation) && unref(stopCopyCreation)(...args))
              }, " 停止中断 ", 8, _hoisted_18$4),
              createBaseVNode("button", {
                class: "secondary-button model-config-button",
                type: "button",
                title: "模型配置",
                onClick: _cache[8] || (_cache[8] = //@ts-ignore
                (...args) => unref(openCopyCreationConfig) && unref(openCopyCreationConfig)(...args))
              }, [
                createVNode(unref(setting_default)),
                _cache[30] || (_cache[30] = createTextVNode(" 模型配置 ", -1))
              ])
            ]),
            createBaseVNode("section", _hoisted_19$4, [
              createBaseVNode("div", _hoisted_20$4, [
                _cache[31] || (_cache[31] = createBaseVNode("h3", null, "文案创作", -1)),
                createBaseVNode("span", _hoisted_21$4, [
                  createVNode(unref(stopwatch_default), {
                    class: "elapsed-icon",
                    "aria-hidden": "true"
                  }),
                  createTextVNode(" " + toDisplayString(unref(creationElapsedText)), 1)
                ])
              ]),
              withDirectives(createBaseVNode("textarea", {
                "onUpdate:modelValue": _cache[9] || (_cache[9] = ($event) => /* @__PURE__ */ isRef(createdCopy) ? createdCopy.value = $event : null),
                rows: "8",
                placeholder: "创造完成后显示文案，可在这里修改"
              }, null, 512), [
                [vModelText, unref(createdCopy)]
              ])
            ])
          ])
        ]),
        (openBlock(), createBlock(Teleport, { to: "body" }, [
          unref(isExtractionConfigOpen) ? (openBlock(), createElementBlock("div", _hoisted_22$4, [
            createBaseVNode("section", _hoisted_23$4, [
              createBaseVNode("header", _hoisted_24$4, [
                _cache[32] || (_cache[32] = createBaseVNode("h2", { id: "douyin-config-title" }, "提取文案模型配置", -1)),
                createBaseVNode("button", {
                  class: "icon-button",
                  type: "button",
                  "aria-label": "关闭提取文案模型配置",
                  onClick: _cache[10] || (_cache[10] = //@ts-ignore
                  (...args) => unref(closeExtractionConfig) && unref(closeExtractionConfig)(...args))
                }, " × ")
              ]),
              createBaseVNode("div", _hoisted_25$4, [
                createBaseVNode("label", _hoisted_26$4, [
                  _cache[34] || (_cache[34] = createBaseVNode("span", null, "模型方", -1)),
                  withDirectives(createBaseVNode("select", {
                    "onUpdate:modelValue": _cache[11] || (_cache[11] = ($event) => unref(extractionModelConfig).activeProvider = $event)
                  }, [..._cache[33] || (_cache[33] = [
                    createBaseVNode("option", { value: "moark" }, "模力方舟（在线模型）", -1),
                    createBaseVNode("option", { value: "ali" }, "阿里云（在线模型）", -1)
                  ])], 512), [
                    [vModelSelect, unref(extractionModelConfig).activeProvider]
                  ])
                ]),
                unref(extractionModelConfig).activeProvider === "ali" ? (openBlock(), createElementBlock(Fragment, { key: 0 }, [
                  _cache[36] || (_cache[36] = createBaseVNode("p", { class: "config-tip" }, [
                    createTextVNode(" 官方注册 "),
                    createBaseVNode("a", {
                      href: "https://bailian.console.aliyun.com/",
                      target: "_blank",
                      rel: "noreferrer"
                    }, "阿里云百炼"),
                    createTextVNode(" 会赠送 36000 Token，不花钱白嫖。 ")
                  ], -1)),
                  createBaseVNode("label", _hoisted_27$4, [
                    _cache[35] || (_cache[35] = createBaseVNode("span", null, "API KEY", -1)),
                    withDirectives(createBaseVNode("input", {
                      "onUpdate:modelValue": _cache[12] || (_cache[12] = ($event) => unref(extractionModelConfig).ali.apiKey = $event),
                      type: "text",
                      placeholder: "请输入阿里云 API KEY"
                    }, null, 512), [
                      [vModelText, unref(extractionModelConfig).ali.apiKey]
                    ])
                  ])
                ], 64)) : unref(extractionModelConfig).activeProvider === "moark" ? (openBlock(), createElementBlock(Fragment, { key: 1 }, [
                  _cache[38] || (_cache[38] = createBaseVNode("p", { class: "config-tip" }, [
                    createTextVNode(" 前往 "),
                    createBaseVNode("a", {
                      href: "https://moark.com/",
                      target: "_blank",
                      rel: "noreferrer"
                    }, "https://moark.com/"),
                    createTextVNode(" 注册账号，"),
                    createBaseVNode("strong", { class: "highlight-red" }, "每天赠送 100次"),
                    createTextVNode(" 免费调用机会。 ")
                  ], -1)),
                  createBaseVNode("label", _hoisted_28$4, [
                    _cache[37] || (_cache[37] = createBaseVNode("span", null, "API KEY", -1)),
                    withDirectives(createBaseVNode("input", {
                      "onUpdate:modelValue": _cache[13] || (_cache[13] = ($event) => unref(extractionModelConfig).moark.apiKey = $event),
                      type: "text",
                      placeholder: "请输入模力方舟 API Key"
                    }, null, 512), [
                      [vModelText, unref(extractionModelConfig).moark.apiKey]
                    ])
                  ])
                ], 64)) : createCommentVNode("", true)
              ]),
              createBaseVNode("footer", _hoisted_29$4, [
                createBaseVNode("button", {
                  class: "secondary-button",
                  type: "button",
                  disabled: unref(isSavingExtractionConfig),
                  onClick: _cache[14] || (_cache[14] = //@ts-ignore
                  (...args) => unref(closeExtractionConfig) && unref(closeExtractionConfig)(...args))
                }, " 取消 ", 8, _hoisted_30$4),
                createBaseVNode("button", {
                  class: "primary-button",
                  type: "button",
                  disabled: unref(isSavingExtractionConfig),
                  onClick: _cache[15] || (_cache[15] = //@ts-ignore
                  (...args) => unref(saveExtractionConfig) && unref(saveExtractionConfig)(...args))
                }, toDisplayString(unref(isSavingExtractionConfig) ? "保存中..." : "保存配置"), 9, _hoisted_31$4)
              ])
            ])
          ])) : createCommentVNode("", true),
          unref(isCopyCreationConfigOpen) ? (openBlock(), createElementBlock("div", _hoisted_32$3, [
            createBaseVNode("section", _hoisted_33$3, [
              createBaseVNode("header", _hoisted_34$3, [
                _cache[39] || (_cache[39] = createBaseVNode("h2", { id: "copy-creation-config-title" }, "文案创作模型配置", -1)),
                createBaseVNode("button", {
                  class: "icon-button",
                  type: "button",
                  "aria-label": "关闭文案创作模型配置",
                  onClick: _cache[16] || (_cache[16] = //@ts-ignore
                  (...args) => unref(closeCopyCreationConfig) && unref(closeCopyCreationConfig)(...args))
                }, " × ")
              ]),
              createBaseVNode("div", _hoisted_35$3, [
                createBaseVNode("label", _hoisted_36$3, [
                  _cache[41] || (_cache[41] = createBaseVNode("span", null, "模型方", -1)),
                  withDirectives(createBaseVNode("select", {
                    "onUpdate:modelValue": _cache[17] || (_cache[17] = ($event) => unref(copyCreationModelConfig).activeProvider = $event)
                  }, [..._cache[40] || (_cache[40] = [
                    createBaseVNode("option", { value: "moark" }, "模力方舟（在线模型）", -1),
                    createBaseVNode("option", { value: "ali" }, "阿里云（在线模型）", -1)
                  ])], 512), [
                    [vModelSelect, unref(copyCreationModelConfig).activeProvider]
                  ])
                ]),
                unref(copyCreationModelConfig).activeProvider === "ali" ? (openBlock(), createElementBlock(Fragment, { key: 0 }, [
                  _cache[45] || (_cache[45] = createBaseVNode("p", { class: "config-tip" }, [
                    createTextVNode(" 官方注册 "),
                    createBaseVNode("a", {
                      href: "https://bailian.console.aliyun.com/",
                      target: "_blank",
                      rel: "noreferrer"
                    }, "阿里云百炼"),
                    createTextVNode(" 会赠送 1000000 Token，不花钱白嫖。 ")
                  ], -1)),
                  createBaseVNode("label", _hoisted_37$3, [
                    _cache[42] || (_cache[42] = createBaseVNode("span", null, "API KEY", -1)),
                    withDirectives(createBaseVNode("input", {
                      "onUpdate:modelValue": _cache[18] || (_cache[18] = ($event) => unref(copyCreationModelConfig).apiKey = $event),
                      type: "text",
                      placeholder: "请输入阿里云 API KEY"
                    }, null, 512), [
                      [vModelText, unref(copyCreationModelConfig).apiKey]
                    ])
                  ]),
                  createBaseVNode("label", _hoisted_38$3, [
                    _cache[44] || (_cache[44] = createBaseVNode("span", null, "模型名称", -1)),
                    withDirectives(createBaseVNode("select", {
                      "onUpdate:modelValue": _cache[19] || (_cache[19] = ($event) => unref(copyCreationModelConfig).modelName = $event)
                    }, [..._cache[43] || (_cache[43] = [
                      createBaseVNode("option", { value: "deepseek-v4-flash" }, "deepseek-v4-flash", -1),
                      createBaseVNode("option", { value: "deepseek-v4-pro" }, "deepseek-v4-pro", -1)
                    ])], 512), [
                      [vModelSelect, unref(copyCreationModelConfig).modelName]
                    ])
                  ])
                ], 64)) : unref(copyCreationModelConfig).activeProvider === "moark" ? (openBlock(), createElementBlock(Fragment, { key: 1 }, [
                  _cache[49] || (_cache[49] = createBaseVNode("p", { class: "config-tip" }, [
                    createTextVNode(" 前往 "),
                    createBaseVNode("a", {
                      href: "https://moark.com/",
                      target: "_blank",
                      rel: "noreferrer"
                    }, "https://moark.com/"),
                    createTextVNode(" 注册账号，"),
                    createBaseVNode("strong", { class: "highlight-red" }, "每天赠送 100次"),
                    createTextVNode(" 免费调用机会。 ")
                  ], -1)),
                  createBaseVNode("label", _hoisted_39$3, [
                    _cache[46] || (_cache[46] = createBaseVNode("span", null, "API KEY", -1)),
                    withDirectives(createBaseVNode("input", {
                      "onUpdate:modelValue": _cache[20] || (_cache[20] = ($event) => unref(copyCreationModelConfig).moark.apiKey = $event),
                      type: "text",
                      placeholder: "请输入模力方舟 API Key"
                    }, null, 512), [
                      [vModelText, unref(copyCreationModelConfig).moark.apiKey]
                    ])
                  ]),
                  createBaseVNode("label", _hoisted_40$3, [
                    _cache[48] || (_cache[48] = createBaseVNode("span", null, "模型名称", -1)),
                    withDirectives(createBaseVNode("select", {
                      "onUpdate:modelValue": _cache[21] || (_cache[21] = ($event) => unref(copyCreationModelConfig).moark.modelName = $event)
                    }, [..._cache[47] || (_cache[47] = [
                      createBaseVNode("option", { value: "DeepSeek-V4-Flash" }, "DeepSeek-V4-Flash", -1),
                      createBaseVNode("option", { value: "DeepSeek-V4-Pro" }, "DeepSeek-V4-Pro", -1)
                    ])], 512), [
                      [vModelSelect, unref(copyCreationModelConfig).moark.modelName]
                    ])
                  ])
                ], 64)) : createCommentVNode("", true)
              ]),
              createBaseVNode("footer", _hoisted_41$3, [
                createBaseVNode("button", {
                  class: "secondary-button",
                  type: "button",
                  disabled: unref(isSavingCopyCreationConfig),
                  onClick: _cache[22] || (_cache[22] = //@ts-ignore
                  (...args) => unref(closeCopyCreationConfig) && unref(closeCopyCreationConfig)(...args))
                }, " 取消 ", 8, _hoisted_42$3),
                createBaseVNode("button", {
                  class: "primary-button",
                  type: "button",
                  disabled: unref(isSavingCopyCreationConfig),
                  onClick: _cache[23] || (_cache[23] = //@ts-ignore
                  (...args) => unref(saveCopyCreationConfig) && unref(saveCopyCreationConfig)(...args))
                }, toDisplayString(unref(isSavingCopyCreationConfig) ? "保存中..." : "保存配置"), 9, _hoisted_43$3)
              ])
            ])
          ])) : createCommentVNode("", true),
          isVideoPreviewOpen.value ? (openBlock(), createElementBlock("div", _hoisted_44$3, [
            createBaseVNode("section", _hoisted_45$3, [
              createBaseVNode("header", { class: "modal-header" }, [
                _cache[50] || (_cache[50] = createBaseVNode("h2", { id: "video-preview-title" }, "无水印视频预览", -1)),
                createBaseVNode("button", {
                  class: "icon-button",
                  type: "button",
                  "aria-label": "关闭无水印视频预览",
                  onClick: closeVideoPreview
                }, " × ")
              ]),
              createBaseVNode("div", _hoisted_46$3, [
                createBaseVNode("video", {
                  class: "preview-video",
                  src: unref(extractedVideoUrl),
                  controls: "",
                  autoplay: ""
                }, null, 8, _hoisted_47$2)
              ])
            ])
          ])) : createCommentVNode("", true)
        ]))
      ]);
    };
  }
});
const DouyinExtractionColumn = /* @__PURE__ */ _export_sfc(_sfc_main$d, [["__scopeId", "data-v-bc36efd3"]]);
let sharedActiveProvider$1 = null;
function useImpl$2() {
  const activeProvider = /* @__PURE__ */ ref("wavespeed");
  const isConfigModalOpen = /* @__PURE__ */ ref(false);
  let loaded = false;
  async function loadActive() {
    if (loaded) return;
    loaded = true;
    try {
      const stored = await window.desktopApi.loadLipSyncActive();
      if (typeof stored === "object" && stored !== null) {
        const obj = stored;
        activeProvider.value = obj.activeProvider === "sourcecode" ? "sourcecode" : "wavespeed";
      }
    } catch {
    }
  }
  async function saveActive(provider) {
    activeProvider.value = provider;
    await window.desktopApi.saveLipSyncActive({ activeProvider: provider });
  }
  function openConfigModal() {
    isConfigModalOpen.value = true;
  }
  function closeConfigModal() {
    isConfigModalOpen.value = false;
  }
  void loadActive();
  return {
    activeProvider,
    saveActive,
    loadActive,
    isConfigModalOpen,
    openConfigModal,
    closeConfigModal
  };
}
function useLipSyncActive() {
  if (!sharedActiveProvider$1) {
    sharedActiveProvider$1 = useImpl$2();
  }
  return sharedActiveProvider$1;
}
const POLL_INTERVAL_MS = 1e4;
function isSubmitResult(value) {
  return typeof value === "object" && value !== null && "taskId" in value && typeof value.taskId === "string";
}
function isTaskResult(value) {
  return typeof value === "object" && value !== null && "status" in value && typeof value.status === "string";
}
let sharedSourceCodeState = null;
function useImpl$1() {
  const config = /* @__PURE__ */ reactive({ apiKey: "" });
  const isSavingConfig = /* @__PURE__ */ ref(false);
  const taskStatus = /* @__PURE__ */ ref("未开始");
  const elapsedMs = /* @__PURE__ */ ref(0);
  const isSubmitting = /* @__PURE__ */ ref(false);
  const isPolling = /* @__PURE__ */ ref(false);
  const resultVideoUrl = /* @__PURE__ */ ref("");
  const videoPreviewUrl = /* @__PURE__ */ ref("");
  const videoStatus = /* @__PURE__ */ ref("未上传");
  let selectedVideoFile = null;
  let ownsVideoPreviewUrl = false;
  let pollTimer;
  let elapsedTimer;
  let startedAt = 0;
  let currentTaskId = "";
  const hasConfig = computed(() => Boolean(config.apiKey.trim()));
  const hasResult = computed(() => Boolean(resultVideoUrl.value));
  const elapsedText = computed(
    () => `${(elapsedMs.value / 1e3).toFixed(2)}秒`
  );
  async function refreshConfig() {
    const stored = await window.desktopApi.loadLipSyncSourceCodeConfig();
    if (typeof stored === "object" && stored !== null) {
      const obj = stored;
      if (typeof obj.apiKey === "string") config.apiKey = obj.apiKey;
    }
  }
  async function saveConfig() {
    isSavingConfig.value = true;
    try {
      await window.desktopApi.saveLipSyncSourceCodeConfig({
        apiKey: config.apiKey
      });
      ElMessage.success("配置保存成功");
    } finally {
      isSavingConfig.value = false;
    }
  }
  function ensureConfig() {
    if (hasConfig.value) return true;
    ElMessage.warning("请先配置模力方舟的 API KEY");
    return false;
  }
  function revokeVideoPreviewUrl() {
    if (ownsVideoPreviewUrl && videoPreviewUrl.value.startsWith("blob:")) {
      URL.revokeObjectURL(videoPreviewUrl.value);
    }
    ownsVideoPreviewUrl = false;
    videoPreviewUrl.value = "";
  }
  async function uploadVideoFile(event) {
    const input = event.target;
    const file = input.files?.[0];
    input.value = "";
    if (!file) return;
    videoStatus.value = "上传中...";
    try {
      revokeVideoPreviewUrl();
      selectedVideoFile = file;
      videoPreviewUrl.value = URL.createObjectURL(file);
      ownsVideoPreviewUrl = true;
      videoStatus.value = "已上传";
      ElMessage.success("视频已就绪");
    } catch (error) {
      selectedVideoFile = null;
      videoStatus.value = "上传失败";
      ElMessage.error("视频读取失败");
      console.error("视频读取失败:", error);
    }
  }
  function stopTimers() {
    if (pollTimer) {
      window.clearInterval(pollTimer);
      pollTimer = void 0;
    }
    if (elapsedTimer) {
      window.clearInterval(elapsedTimer);
      elapsedTimer = void 0;
    }
  }
  function startElapsedTimer() {
    startedAt = Date.now();
    elapsedMs.value = 0;
    if (elapsedTimer) window.clearInterval(elapsedTimer);
    elapsedTimer = window.setInterval(() => {
      elapsedMs.value = Date.now() - startedAt;
    }, 100);
  }
  function stopElapsedTimer() {
    if (startedAt > 0) elapsedMs.value = Date.now() - startedAt;
    if (elapsedTimer) {
      window.clearInterval(elapsedTimer);
      elapsedTimer = void 0;
    }
  }
  async function buildAudioSource(audioUrl, audioBlob) {
    if (audioBlob) {
      const mimeType2 = audioBlob.type || "audio/mpeg";
      const fileName2 = mimeType2.includes("wav") ? "voice-clone-audio.wav" : "voice-clone-audio.mp3";
      return {
        arrayBuffer: await audioBlob.arrayBuffer(),
        fileName: fileName2,
        mimeType: mimeType2
      };
    }
    if (!audioUrl) {
      throw new Error("请先完成第三步语音生成");
    }
    if (/^https?:\/\//i.test(audioUrl)) {
      return { url: audioUrl };
    }
    const response = await fetch(audioUrl);
    if (!response.ok) throw new Error("获取第三步音频失败");
    const blob = await response.blob();
    const mimeType = blob.type || "audio/mpeg";
    const fileName = mimeType.includes("wav") ? "voice-clone-audio.wav" : "voice-clone-audio.mp3";
    return { arrayBuffer: await blob.arrayBuffer(), fileName, mimeType };
  }
  async function pollTaskResult() {
    if (!currentTaskId || !isPolling.value) return;
    try {
      const result = await window.desktopApi.getLipSyncSourceCodeResult(currentTaskId);
      if (!isTaskResult(result)) {
        throw new Error("模力方舟返回结果格式不正确");
      }
      taskStatus.value = result.status;
      if (result.status === "success") {
        if (result.outputUrl) {
          resultVideoUrl.value = result.outputUrl;
          ElMessage.success("视频对口型完成");
        } else {
          ElMessage.warning("任务成功但未返回视频地址");
        }
        stopElapsedTimer();
        stopPolling();
      } else if (result.status === "failed" || result.status === "cancelled") {
        ElMessage.error(
          `任务${result.status === "failed" ? "失败" : "已取消"}`
        );
        stopElapsedTimer();
        stopPolling();
      }
    } catch (error) {
      stopElapsedTimer();
      stopPolling();
      ElMessage.error(error instanceof Error ? error.message : "结果查询失败");
    }
  }
  function stopPolling() {
    if (pollTimer) {
      window.clearInterval(pollTimer);
      pollTimer = void 0;
    }
    isPolling.value = false;
  }
  async function submitTask(audioUrl, audioBlob) {
    if (isSubmitting.value || isPolling.value) return;
    if (!ensureConfig()) return;
    if (!selectedVideoFile) {
      ElMessage.warning("请先上传视频文件");
      return;
    }
    isSubmitting.value = true;
    resultVideoUrl.value = "";
    taskStatus.value = "准备中...";
    startElapsedTimer();
    try {
      const audio = await buildAudioSource(audioUrl, audioBlob);
      taskStatus.value = "提交中...";
      const submitResult = await window.desktopApi.submitLipSyncSourceCodeTask({
        audio,
        video: {
          arrayBuffer: await selectedVideoFile.arrayBuffer(),
          fileName: selectedVideoFile.name,
          mimeType: selectedVideoFile.type || "video/mp4"
        }
      });
      if (!isSubmitResult(submitResult)) {
        throw new Error("模力方舟提交结果格式不正确");
      }
      currentTaskId = submitResult.taskId;
      taskStatus.value = submitResult.status;
      isPolling.value = true;
      await pollTaskResult();
      if (isPolling.value && !pollTimer) {
        pollTimer = window.setInterval(() => {
          void pollTaskResult();
        }, POLL_INTERVAL_MS);
      }
    } catch (error) {
      stopElapsedTimer();
      stopPolling();
      taskStatus.value = "提交失败";
      ElMessage.error(
        error instanceof Error ? error.message : "视频对口型失败"
      );
    } finally {
      isSubmitting.value = false;
    }
  }
  async function stopTask() {
    if (!isPolling.value) return;
    stopElapsedTimer();
    stopPolling();
    taskStatus.value = "已停止轮询";
    ElMessage.info("已停止查询任务状态");
  }
  onMounted(() => {
    void refreshConfig();
  });
  onUnmounted(() => {
    stopTimers();
    revokeVideoPreviewUrl();
  });
  return {
    config,
    hasConfig,
    hasResult,
    isSavingConfig,
    taskStatus,
    elapsedText,
    isSubmitting,
    isPolling,
    resultVideoUrl,
    videoPreviewUrl,
    videoStatus,
    refreshConfig,
    saveConfig,
    submitTask,
    stopTask,
    uploadVideoFile
  };
}
function useLipSyncSourceCode() {
  if (!sharedSourceCodeState) {
    sharedSourceCodeState = useImpl$1();
  }
  return sharedSourceCodeState;
}
function isUploadedWaveSpeedMedia(value) {
  return typeof value === "object" && value !== null && "downloadUrl" in value && "filename" in value && "size" in value && "type" in value && typeof value.downloadUrl === "string" && typeof value.filename === "string" && typeof value.size === "number" && (value.type === "audio" || value.type === "video");
}
function isWaveSpeedPriceResult(value) {
  return typeof value === "object" && value !== null && "priceText" in value && typeof value.priceText === "string";
}
function isWaveSpeedSubmitResult(value) {
  return typeof value === "object" && value !== null && "requestId" in value && "resultUrl" in value && typeof value.requestId === "string" && typeof value.resultUrl === "string";
}
function isWaveSpeedTaskResult(value) {
  return typeof value === "object" && value !== null && "status" in value && typeof value.status === "string";
}
let sharedVideoLipSyncState = null;
const defaultWaveSpeedModelName = "wavespeed-ai/latentsync";
function useVideoLipSyncImpl() {
  const activeProvider = /* @__PURE__ */ ref("wavespeed");
  const isConfigOpen = /* @__PURE__ */ ref(false);
  const isSavingConfig = /* @__PURE__ */ ref(false);
  const wavespeedApiKey = /* @__PURE__ */ ref("");
  const wavespeedModelName = /* @__PURE__ */ ref(defaultWaveSpeedModelName);
  const customModelNote = /* @__PURE__ */ ref("暂未开发");
  const waveSpeedAudioFileName = /* @__PURE__ */ ref("");
  const waveSpeedVideoFileName = /* @__PURE__ */ ref("");
  const waveSpeedAudioPreviewUrl = /* @__PURE__ */ ref("");
  const waveSpeedVideoPreviewUrl = /* @__PURE__ */ ref("");
  const waveSpeedAudioRemoteUrl = /* @__PURE__ */ ref("");
  const waveSpeedVideoRemoteUrl = /* @__PURE__ */ ref("");
  const waveSpeedAudioStatus = /* @__PURE__ */ ref("");
  const waveSpeedVideoStatus = /* @__PURE__ */ ref("");
  const waveSpeedPriceText = /* @__PURE__ */ ref("");
  const waveSpeedPriceValue = /* @__PURE__ */ ref(0);
  const waveSpeedRequestId = /* @__PURE__ */ ref("");
  const waveSpeedResultUrl = /* @__PURE__ */ ref("");
  const waveSpeedResultVideoUrl = /* @__PURE__ */ ref("");
  const waveSpeedTaskStatus = /* @__PURE__ */ ref("未开始");
  const waveSpeedElapsedMs = /* @__PURE__ */ ref(0);
  const isWaveSpeedUploadingAudio = /* @__PURE__ */ ref(false);
  const isWaveSpeedUploadingVideo = /* @__PURE__ */ ref(false);
  const isWaveSpeedEvaluatingPrice = /* @__PURE__ */ ref(false);
  const isWaveSpeedSubmitting = /* @__PURE__ */ ref(false);
  const isWaveSpeedPolling = /* @__PURE__ */ ref(false);
  let waveSpeedTimer;
  let waveSpeedPollTimer;
  let waveSpeedStartedAt = 0;
  let waveSpeedAudioToken = 0;
  let ownsWaveSpeedAudioPreviewUrl = false;
  let ownsWaveSpeedVideoPreviewUrl = false;
  const waveSpeedElapsedText = computed(
    () => `${(waveSpeedElapsedMs.value / 1e3).toFixed(2)}秒`
  );
  const canStartWaveSpeed = computed(
    () => Boolean(waveSpeedAudioRemoteUrl.value && waveSpeedVideoRemoteUrl.value)
  );
  const hasWaveSpeedApiKey = computed(
    () => Boolean(wavespeedApiKey.value.trim())
  );
  const hasWaveSpeedResult = computed(
    () => Boolean(waveSpeedResultVideoUrl.value)
  );
  function startWaveSpeedTimer() {
    waveSpeedStartedAt = Date.now();
    waveSpeedElapsedMs.value = 0;
    if (waveSpeedTimer) {
      window.clearInterval(waveSpeedTimer);
    }
    waveSpeedTimer = window.setInterval(() => {
      waveSpeedElapsedMs.value = Date.now() - waveSpeedStartedAt;
    }, 100);
  }
  function stopWaveSpeedTimer() {
    if (waveSpeedStartedAt > 0) {
      waveSpeedElapsedMs.value = Date.now() - waveSpeedStartedAt;
    }
    if (waveSpeedTimer) {
      window.clearInterval(waveSpeedTimer);
      waveSpeedTimer = void 0;
    }
  }
  function stopWaveSpeedPolling() {
    if (waveSpeedPollTimer) {
      window.clearInterval(waveSpeedPollTimer);
      waveSpeedPollTimer = void 0;
    }
    isWaveSpeedPolling.value = false;
  }
  function revokeWaveSpeedAudioPreviewUrl() {
    if (ownsWaveSpeedAudioPreviewUrl && waveSpeedAudioPreviewUrl.value.startsWith("blob:")) {
      URL.revokeObjectURL(waveSpeedAudioPreviewUrl.value);
    }
    ownsWaveSpeedAudioPreviewUrl = false;
    waveSpeedAudioPreviewUrl.value = "";
  }
  function revokeWaveSpeedVideoPreviewUrl() {
    if (ownsWaveSpeedVideoPreviewUrl && waveSpeedVideoPreviewUrl.value.startsWith("blob:")) {
      URL.revokeObjectURL(waveSpeedVideoPreviewUrl.value);
    }
    ownsWaveSpeedVideoPreviewUrl = false;
    waveSpeedVideoPreviewUrl.value = "";
  }
  function resetWaveSpeedPrice() {
    waveSpeedPriceText.value = "";
    waveSpeedPriceValue.value = 0;
    isWaveSpeedEvaluatingPrice.value = false;
  }
  function applyStoredConfig(storedConfig) {
    if (typeof storedConfig !== "object" || storedConfig === null) {
      return;
    }
    const config = storedConfig;
    if (typeof config.apiKey === "string") {
      wavespeedApiKey.value = config.apiKey;
    }
    if (typeof config.modelName === "string" && config.modelName.trim()) {
      wavespeedModelName.value = config.modelName.trim();
    }
  }
  async function refreshConfig() {
    const storedConfig = await window.desktopApi.loadWaveSpeedConfig();
    applyStoredConfig(storedConfig);
  }
  function openConfig() {
    isConfigOpen.value = true;
  }
  function closeConfig() {
    isConfigOpen.value = false;
  }
  function ensureWaveSpeedConfig() {
    if (hasWaveSpeedApiKey.value) {
      return true;
    }
    useLipSyncActive().openConfigModal();
    ElMessage.warning("请先配置 WaveSpeed API Key");
    return false;
  }
  async function saveConfig() {
    isSavingConfig.value = true;
    try {
      await window.desktopApi.saveWaveSpeedConfig({
        apiKey: wavespeedApiKey.value,
        modelName: wavespeedModelName.value.trim() || defaultWaveSpeedModelName
      });
      ElMessage.success("配置保存成功");
    } finally {
      isSavingConfig.value = false;
    }
  }
  async function useWaveSpeedVoiceAudio(audioUrl, audioBlob) {
    waveSpeedAudioToken += 1;
    const currentToken = waveSpeedAudioToken;
    resetWaveSpeedPrice();
    revokeWaveSpeedAudioPreviewUrl();
    waveSpeedAudioFileName.value = "";
    waveSpeedAudioRemoteUrl.value = "";
    waveSpeedAudioStatus.value = "";
    isWaveSpeedUploadingAudio.value = false;
    if (!audioUrl) {
      ElMessage.warning("请先完成第三步语音生成");
      await maybeEvaluateWaveSpeedPrice();
      return;
    }
    waveSpeedAudioFileName.value = "第三步生成音频";
    if (/^https?:\/\//i.test(audioUrl)) {
      waveSpeedAudioRemoteUrl.value = audioUrl;
      waveSpeedAudioPreviewUrl.value = audioUrl;
      waveSpeedAudioStatus.value = "已上传";
      await maybeEvaluateWaveSpeedPrice();
      return;
    }
    if (!ensureWaveSpeedConfig()) {
      waveSpeedAudioStatus.value = "等待配置";
      return;
    }
    waveSpeedAudioStatus.value = "上传中...";
    isWaveSpeedUploadingAudio.value = true;
    try {
      if (!audioBlob) {
        throw new Error("变速音频数据不存在，请重新保存语速后再同步");
      }
      if (audioBlob.size > 50 * 1024 * 1024) {
        throw new Error("WaveSpeed 音频文件不能超过 50MB");
      }
      const result = await window.desktopApi.uploadWaveSpeedMedia({
        arrayBuffer: await audioBlob.arrayBuffer(),
        fileName: "voice-clone-audio.mp3",
        mimeType: audioBlob.type || "audio/mpeg"
      });
      if (currentToken !== waveSpeedAudioToken) {
        return;
      }
      if (!isUploadedWaveSpeedMedia(result)) {
        throw new Error("Invalid WaveSpeed audio upload result");
      }
      waveSpeedAudioRemoteUrl.value = result.downloadUrl;
      waveSpeedAudioPreviewUrl.value = result.downloadUrl;
      waveSpeedAudioStatus.value = "已上传";
      await maybeEvaluateWaveSpeedPrice();
      ElMessage.success("第三步音频已同步到视频对口型");
    } catch (error) {
      if (currentToken === waveSpeedAudioToken) {
        waveSpeedAudioStatus.value = "上传失败";
        ElMessage.error(
          error instanceof Error ? error.message : "第三步音频同步失败"
        );
      }
    } finally {
      if (currentToken === waveSpeedAudioToken) {
        isWaveSpeedUploadingAudio.value = false;
      }
    }
  }
  async function uploadWaveSpeedVideoFile(event) {
    if (!ensureWaveSpeedConfig()) {
      return;
    }
    const input = event.target;
    const file = input.files?.[0];
    input.value = "";
    if (!file) {
      return;
    }
    if (!file.type.startsWith("video/")) {
      ElMessage.warning("请上传视频文件");
      return;
    }
    if (file.size > 100 * 1024 * 1024) {
      ElMessage.warning("WaveSpeed 视频文件不能超过 100MB");
      return;
    }
    revokeWaveSpeedVideoPreviewUrl();
    resetWaveSpeedPrice();
    waveSpeedVideoFileName.value = file.name;
    waveSpeedVideoRemoteUrl.value = "";
    waveSpeedVideoStatus.value = "上传中...";
    isWaveSpeedUploadingVideo.value = true;
    try {
      const result = await window.desktopApi.uploadWaveSpeedMedia({
        arrayBuffer: await file.arrayBuffer(),
        fileName: file.name,
        mimeType: file.type || "video/mp4"
      });
      if (!isUploadedWaveSpeedMedia(result)) {
        throw new Error("Invalid WaveSpeed video upload result");
      }
      waveSpeedVideoRemoteUrl.value = result.downloadUrl;
      waveSpeedVideoPreviewUrl.value = URL.createObjectURL(file);
      ownsWaveSpeedVideoPreviewUrl = true;
      waveSpeedVideoStatus.value = "已上传";
      await maybeEvaluateWaveSpeedPrice();
      ElMessage.success("视频上传成功");
    } catch (error) {
      waveSpeedVideoStatus.value = "上传失败";
      ElMessage.error(error instanceof Error ? error.message : "视频上传失败");
    } finally {
      isWaveSpeedUploadingVideo.value = false;
    }
  }
  async function maybeEvaluateWaveSpeedPrice() {
    if (!waveSpeedAudioRemoteUrl.value || !waveSpeedVideoRemoteUrl.value) {
      return;
    }
    isWaveSpeedEvaluatingPrice.value = true;
    try {
      const result = await window.desktopApi.calculateWaveSpeedPrice(
        waveSpeedAudioRemoteUrl.value,
        waveSpeedVideoRemoteUrl.value,
        wavespeedModelName.value.trim() || defaultWaveSpeedModelName
      );
      if (!isWaveSpeedPriceResult(result)) {
        throw new Error("Invalid WaveSpeed price result");
      }
      waveSpeedPriceText.value = result.priceText;
      waveSpeedPriceValue.value = result.priceValue;
    } catch (error) {
      ElMessage.error(error instanceof Error ? error.message : "价格评估失败");
    } finally {
      isWaveSpeedEvaluatingPrice.value = false;
    }
  }
  async function pollWaveSpeedTaskResult() {
    if (!waveSpeedRequestId.value || !isWaveSpeedPolling.value) {
      return;
    }
    try {
      const result = await window.desktopApi.getWaveSpeedTaskResult(
        waveSpeedRequestId.value
      );
      if (!isWaveSpeedTaskResult(result)) {
        throw new Error("Invalid WaveSpeed task result");
      }
      waveSpeedTaskStatus.value = result.status;
      if (result.outputUrl) {
        waveSpeedResultVideoUrl.value = result.outputUrl;
      }
      if (result.status === "completed" && result.outputUrl) {
        waveSpeedResultUrl.value = result.outputUrl;
        stopWaveSpeedTimer();
        stopWaveSpeedPolling();
        ElMessage.success("视频对口型完成");
      }
    } catch (error) {
      stopWaveSpeedTimer();
      stopWaveSpeedPolling();
      ElMessage.error(error instanceof Error ? error.message : "结果查询失败");
    }
  }
  async function startWaveSpeedLipSync() {
    if (isWaveSpeedSubmitting.value || isWaveSpeedPolling.value) {
      return;
    }
    if (!ensureWaveSpeedConfig()) {
      return;
    }
    if (!canStartWaveSpeed.value) {
      ElMessage.warning("请先上传音频和视频");
      return;
    }
    clearWaveSpeedResult();
    isWaveSpeedSubmitting.value = true;
    try {
      const result = await window.desktopApi.submitWaveSpeedTask(
        waveSpeedAudioRemoteUrl.value,
        waveSpeedVideoRemoteUrl.value,
        wavespeedModelName.value.trim() || defaultWaveSpeedModelName
      );
      if (!isWaveSpeedSubmitResult(result)) {
        throw new Error("Invalid WaveSpeed submit result");
      }
      waveSpeedRequestId.value = result.requestId;
      waveSpeedResultUrl.value = result.resultUrl;
      waveSpeedTaskStatus.value = result.status;
      isWaveSpeedPolling.value = true;
      startWaveSpeedTimer();
      await pollWaveSpeedTaskResult();
      if (isWaveSpeedPolling.value && !waveSpeedPollTimer) {
        waveSpeedPollTimer = window.setInterval(() => {
          void pollWaveSpeedTaskResult();
        }, 5e3);
      }
    } catch (error) {
      stopWaveSpeedTimer();
      stopWaveSpeedPolling();
      ElMessage.error(
        error instanceof Error ? error.message : "视频对口型失败"
      );
    } finally {
      isWaveSpeedSubmitting.value = false;
    }
  }
  function clearWaveSpeedResult() {
    waveSpeedRequestId.value = "";
    waveSpeedResultUrl.value = "";
    waveSpeedResultVideoUrl.value = "";
    waveSpeedTaskStatus.value = "created";
    waveSpeedElapsedMs.value = 0;
  }
  async function stopWaveSpeedLipSync() {
    if (!isWaveSpeedPolling.value) {
      return;
    }
    stopWaveSpeedTimer();
    stopWaveSpeedPolling();
    waveSpeedTaskStatus.value = "已停止轮询";
    ElMessage.info("已停止查询任务状态");
  }
  function useCustomModelPlaceholder() {
    ElMessage.info("自定制模型暂未开发");
  }
  onMounted(() => {
    void refreshConfig();
  });
  onUnmounted(() => {
    stopWaveSpeedTimer();
    stopWaveSpeedPolling();
    revokeWaveSpeedAudioPreviewUrl();
    revokeWaveSpeedVideoPreviewUrl();
  });
  return {
    activeProvider,
    canStartWaveSpeed,
    closeConfig,
    customModelNote,
    ensureWaveSpeedConfig,
    hasWaveSpeedResult,
    hasWaveSpeedApiKey,
    isConfigOpen,
    isSavingConfig,
    isWaveSpeedEvaluatingPrice,
    isWaveSpeedPolling,
    isWaveSpeedSubmitting,
    isWaveSpeedUploadingAudio,
    isWaveSpeedUploadingVideo,
    openConfig,
    saveConfig,
    stopWaveSpeedLipSync,
    submitWaveSpeedTask: startWaveSpeedLipSync,
    uploadWaveSpeedVideoFile,
    useWaveSpeedVoiceAudio,
    useCustomModelPlaceholder,
    waveSpeedAudioFileName,
    waveSpeedAudioPreviewUrl,
    waveSpeedAudioRemoteUrl,
    waveSpeedAudioStatus,
    waveSpeedElapsedText,
    waveSpeedPriceText,
    waveSpeedRequestId,
    waveSpeedResultUrl,
    waveSpeedResultVideoUrl,
    waveSpeedTaskStatus,
    waveSpeedVideoFileName,
    waveSpeedVideoPreviewUrl,
    waveSpeedVideoRemoteUrl,
    waveSpeedVideoStatus,
    wavespeedApiKey,
    wavespeedModelName
  };
}
function useVideoLipSync() {
  if (!sharedVideoLipSyncState) {
    sharedVideoLipSyncState = useVideoLipSyncImpl();
  }
  return sharedVideoLipSyncState;
}
let sharedActiveProvider = null;
function useImpl() {
  const activeProvider = /* @__PURE__ */ ref("ali");
  const isConfigModalOpen = /* @__PURE__ */ ref(false);
  const synthesizedAudioUrl = /* @__PURE__ */ ref("");
  let loaded = false;
  async function loadActive() {
    if (loaded) return;
    loaded = true;
    try {
      const stored = await window.desktopApi.loadVoiceCloneActive();
      if (typeof stored === "object" && stored !== null) {
        const obj = stored;
        if (obj.activeProvider === "custom" || obj.activeProvider === "moark") {
          activeProvider.value = obj.activeProvider;
        } else {
          activeProvider.value = "ali";
        }
      }
    } catch {
    }
  }
  async function saveActive(provider) {
    activeProvider.value = provider;
    await window.desktopApi.saveVoiceCloneActive({ activeProvider: provider });
  }
  function openConfigModal() {
    isConfigModalOpen.value = true;
  }
  function closeConfigModal() {
    isConfigModalOpen.value = false;
  }
  void loadActive();
  return {
    activeProvider,
    synthesizedAudioUrl,
    saveActive,
    loadActive,
    isConfigModalOpen,
    openConfigModal,
    closeConfigModal
  };
}
function useVoiceCloneActive() {
  if (!sharedActiveProvider) {
    sharedActiveProvider = useImpl();
  }
  return sharedActiveProvider;
}
const defaultSubtitleModelName = "wavespeed-ai/openai-whisper";
function isSubtitleRecognitionConfigStore(value) {
  return typeof value === "object" && value !== null;
}
function isSubtitleSegment(value) {
  return typeof value === "object" && value !== null && "id" in value && "start" in value && "end" in value && "text" in value && typeof value.id === "string" && typeof value.start === "number" && typeof value.end === "number" && typeof value.text === "string";
}
function isSubtitleRecognitionResult(value) {
  return typeof value === "object" && value !== null && "status" in value && "subtitles" in value && Array.isArray(value.subtitles) && value.subtitles.every(isSubtitleSegment);
}
let sharedSubtitleRecognitionState = null;
function useSubtitleRecognitionImpl() {
  const { waveSpeedAudioRemoteUrl, waveSpeedResultVideoUrl } = useVideoLipSync();
  const { activeProvider: lipSyncActiveProvider } = useLipSyncActive();
  const sourceCodeState = useLipSyncSourceCode();
  const { synthesizedAudioUrl: voiceCloneAudioUrl } = useVoiceCloneActive();
  const activeProvider = /* @__PURE__ */ ref("wavespeed");
  const isConfigOpen = /* @__PURE__ */ ref(false);
  const isSavingConfig = /* @__PURE__ */ ref(false);
  const isRecognizing = /* @__PURE__ */ ref(false);
  const subtitleTaskStatus = /* @__PURE__ */ ref("未开始");
  const subtitleElapsedMs = /* @__PURE__ */ ref(0);
  const subtitleList = /* @__PURE__ */ ref([]);
  const subtitleMergedText = /* @__PURE__ */ ref("");
  const subtitleRequestId = /* @__PURE__ */ ref("");
  const subtitleSrt = /* @__PURE__ */ ref("");
  const audioInputMode = /* @__PURE__ */ ref("auto");
  const manualAudioUrl = /* @__PURE__ */ ref("");
  const videoInputMode = /* @__PURE__ */ ref("auto");
  const manualVideoUrl = /* @__PURE__ */ ref("");
  const wavespeedSubtitleApiKey = /* @__PURE__ */ ref("");
  const wavespeedSubtitleModelName = /* @__PURE__ */ ref(defaultSubtitleModelName);
  const sourcecodeSubtitleApiKey = /* @__PURE__ */ ref("");
  const sourcecodeSubtitleModelName = /* @__PURE__ */ ref("whisper-large");
  let subtitleStartedAt = 0;
  let subtitleTimer;
  let isCancelledByUser = false;
  const subtitleElapsedText = computed(
    () => `${(subtitleElapsedMs.value / 1e3).toFixed(2)}秒`
  );
  const hasSubtitleModelConfig = computed(() => {
    if (activeProvider.value === "sourcecode") {
      return Boolean(sourcecodeSubtitleApiKey.value.trim());
    }
    return Boolean(wavespeedSubtitleApiKey.value.trim());
  });
  const audioSourceUrl = computed(() => {
    if (waveSpeedAudioRemoteUrl.value) {
      return waveSpeedAudioRemoteUrl.value;
    }
    if (voiceCloneAudioUrl.value && /^https?:\/\//i.test(voiceCloneAudioUrl.value)) {
      return voiceCloneAudioUrl.value;
    }
    return "";
  });
  const effectiveAudioSourceUrl = computed(() => {
    if (audioInputMode.value === "manual") {
      return manualAudioUrl.value.trim();
    }
    return audioSourceUrl.value;
  });
  const videoSourceUrl = computed(() => {
    const effectiveLipSyncProvider = lipSyncActiveProvider.value === "wavespeed" ? "sourcecode" : lipSyncActiveProvider.value;
    if (effectiveLipSyncProvider === "sourcecode" && sourceCodeState.resultVideoUrl.value) {
      return sourceCodeState.resultVideoUrl.value;
    }
    return waveSpeedResultVideoUrl.value;
  });
  const effectiveVideoSourceUrl = computed(() => {
    let url;
    if (videoInputMode.value === "manual") {
      url = manualVideoUrl.value.trim();
    } else {
      url = videoSourceUrl.value;
    }
    if (url && !url.startsWith("http") && !url.startsWith("blob:") && !url.startsWith("local-")) {
      return `local-video://local-file/${encodeURIComponent(url)}`;
    }
    return url;
  });
  function formatSubtitlesText(subtitles) {
    return subtitles.map((item) => item.text.trim()).filter(Boolean).join("");
  }
  function startSubtitleTimer() {
    subtitleStartedAt = Date.now();
    subtitleElapsedMs.value = 0;
    if (subtitleTimer) {
      window.clearInterval(subtitleTimer);
    }
    subtitleTimer = window.setInterval(() => {
      subtitleElapsedMs.value = Date.now() - subtitleStartedAt;
    }, 100);
  }
  function stopSubtitleTimer() {
    if (subtitleStartedAt > 0) {
      subtitleElapsedMs.value = Date.now() - subtitleStartedAt;
    }
    if (subtitleTimer) {
      window.clearInterval(subtitleTimer);
      subtitleTimer = void 0;
    }
  }
  function openConfig() {
    isConfigOpen.value = true;
  }
  function closeConfig() {
    isConfigOpen.value = false;
  }
  function ensureConfig() {
    if (hasSubtitleModelConfig.value) {
      return true;
    }
    openConfig();
    ElMessage.warning("请先配置字幕识别模型 API Key");
    return false;
  }
  function applyStoredConfig(storedConfig) {
    if (!isSubtitleRecognitionConfigStore(storedConfig)) {
      return;
    }
    activeProvider.value = storedConfig.activeProvider === "sourcecode" ? "sourcecode" : "wavespeed";
    if (typeof storedConfig.wavespeed?.apiKey === "string") {
      wavespeedSubtitleApiKey.value = storedConfig.wavespeed.apiKey;
    }
    if (typeof storedConfig.wavespeed?.modelName === "string" && storedConfig.wavespeed.modelName.trim()) {
      wavespeedSubtitleModelName.value = storedConfig.wavespeed.modelName.trim();
    }
    if (typeof storedConfig.sourcecode?.apiKey === "string") {
      sourcecodeSubtitleApiKey.value = storedConfig.sourcecode.apiKey;
    }
    if (typeof storedConfig.sourcecode?.modelName === "string" && storedConfig.sourcecode.modelName.trim()) {
      sourcecodeSubtitleModelName.value = storedConfig.sourcecode.modelName.trim();
    }
  }
  async function refreshConfig() {
    const storedConfig = await window.desktopApi.loadSubtitleRecognitionConfig();
    applyStoredConfig(storedConfig);
  }
  async function saveConfig() {
    isSavingConfig.value = true;
    try {
      await window.desktopApi.saveSubtitleRecognitionConfig({
        activeProvider: activeProvider.value,
        sourcecode: {
          apiKey: sourcecodeSubtitleApiKey.value,
          modelName: sourcecodeSubtitleModelName.value.trim() || "whisper-large"
        },
        wavespeed: {
          apiKey: wavespeedSubtitleApiKey.value,
          modelName: wavespeedSubtitleModelName.value.trim() || defaultSubtitleModelName
        }
      });
      closeConfig();
      ElMessage.success("模型配置已保存");
    } finally {
      isSavingConfig.value = false;
    }
  }
  function updateSubtitleText(id, text) {
    const targetItem = subtitleList.value.find((item) => item.id === id);
    if (!targetItem) {
      return;
    }
    targetItem.text = text;
    subtitleMergedText.value = formatSubtitlesText(subtitleList.value);
  }
  async function startSubtitleRecognition() {
    if (isRecognizing.value) {
      return;
    }
    if (!effectiveAudioSourceUrl.value) {
      ElMessage.warning(
        audioInputMode.value === "manual" ? "请输入需要识别的音频 URL" : "请先在第四步完成音频同步，或切换为手动输入音频 URL"
      );
      return;
    }
    if (!ensureConfig()) {
      return;
    }
    isRecognizing.value = true;
    isCancelledByUser = false;
    subtitleTaskStatus.value = "识别中";
    subtitleList.value = [];
    subtitleMergedText.value = "";
    subtitleRequestId.value = "";
    subtitleSrt.value = "";
    startSubtitleTimer();
    try {
      const audioUrlForRecognition = effectiveAudioSourceUrl.value;
      const rawResult = await window.desktopApi.recognizeSubtitles(
        audioUrlForRecognition,
        activeProvider.value,
        wavespeedSubtitleModelName.value.trim() || defaultSubtitleModelName
      );
      if (!isSubtitleRecognitionResult(rawResult)) {
        throw new Error("字幕识别返回格式无效");
      }
      const result = rawResult;
      subtitleTaskStatus.value = result.status || "completed";
      subtitleList.value = result.subtitles.map((item, index) => ({
        id: item.id || `segment-${index + 1}`,
        start: item.start,
        end: item.end,
        text: item.text
      }));
      subtitleMergedText.value = formatSubtitlesText(subtitleList.value);
      subtitleRequestId.value = result.requestId;
      subtitleSrt.value = result.srt;
      ElMessage.success("字幕识别完成");
    } catch (error) {
      if (isCancelledByUser) {
        return;
      }
      const isAbortError = error instanceof Error && /abort|aborted|canceled|cancelled/i.test(error.message);
      if (isAbortError) {
        subtitleTaskStatus.value = "已中断";
        ElMessage.info("已停止字幕识别");
      } else {
        subtitleTaskStatus.value = "识别失败";
        ElMessage.error(
          error instanceof Error ? error.message : "字幕识别失败"
        );
      }
    } finally {
      isRecognizing.value = false;
      stopSubtitleTimer();
    }
  }
  async function stopSubtitleRecognition() {
    if (!isRecognizing.value) {
      return;
    }
    isCancelledByUser = true;
    await window.desktopApi.cancelSubtitleRecognition();
    isRecognizing.value = false;
    subtitleTaskStatus.value = "已中断";
    stopSubtitleTimer();
    ElMessage.info("已停止字幕识别");
  }
  const audioInputStorageKey = "ai-digital-avatar.subtitle-audio-input";
  try {
    const stored = window.localStorage.getItem(audioInputStorageKey);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.mode === "manual" || parsed.mode === "auto") {
        audioInputMode.value = parsed.mode;
      }
      if (typeof parsed.manualUrl === "string" && parsed.manualUrl) {
        manualAudioUrl.value = parsed.manualUrl;
      }
      if (parsed.videoMode === "manual" || parsed.videoMode === "auto") {
        videoInputMode.value = parsed.videoMode;
      }
      if (typeof parsed.manualVideoUrl === "string" && parsed.manualVideoUrl) {
        manualVideoUrl.value = parsed.manualVideoUrl;
      }
    }
  } catch {
    window.localStorage.removeItem(audioInputStorageKey);
  }
  watch(
    [audioInputMode, manualAudioUrl, videoInputMode, manualVideoUrl],
    () => {
      window.localStorage.setItem(
        audioInputStorageKey,
        JSON.stringify({
          mode: audioInputMode.value,
          manualUrl: manualAudioUrl.value,
          videoMode: videoInputMode.value,
          manualVideoUrl: manualVideoUrl.value
        })
      );
    }
  );
  onMounted(() => {
    void refreshConfig();
  });
  onUnmounted(() => {
    stopSubtitleTimer();
  });
  return {
    activeProvider,
    audioInputMode,
    audioSourceUrl,
    effectiveAudioSourceUrl,
    effectiveVideoSourceUrl,
    closeConfig,
    hasSubtitleModelConfig,
    isConfigOpen,
    isRecognizing,
    isSavingConfig,
    manualAudioUrl,
    manualVideoUrl,
    openConfig,
    saveConfig,
    sourcecodeSubtitleApiKey,
    sourcecodeSubtitleModelName,
    startSubtitleRecognition,
    stopSubtitleRecognition,
    subtitleElapsedText,
    subtitleList,
    subtitleMergedText,
    subtitleRequestId,
    subtitleSrt,
    subtitleTaskStatus,
    updateSubtitleText,
    videoInputMode,
    videoSourceUrl,
    wavespeedSubtitleApiKey,
    wavespeedSubtitleModelName
  };
}
function useSubtitleRecognition() {
  if (!sharedSubtitleRecognitionState) {
    sharedSubtitleRecognitionState = useSubtitleRecognitionImpl();
  }
  return sharedSubtitleRecognitionState;
}
const PIP_IMAGE_MODEL_OPTIONS = [
  {
    id: "moark",
    label: "模力方舟",
    defaultModelName: "FLUX.2-dev",
    modelNames: ["FLUX.2-dev"],
    description: "模力方舟文生图模型"
  },
  {
    id: "aliyun-dashscope",
    label: "阿里云",
    defaultModelName: "qwen-image-2.0-pro",
    modelNames: ["qwen-image-2.0-pro", "qwen-image-2.0"],
    description: "阿里云·通义万相文生图模型"
  }
];
const PIP_VIDEO_MODEL_OPTIONS = [];
const DEFAULT_PIP_IMAGE_MODEL_ID = "moark";
const DEFAULT_PIP_VIDEO_MODEL_ID = "";
function getPipImageModelOption(id) {
  return PIP_IMAGE_MODEL_OPTIONS.find((option) => option.id === id) ?? PIP_IMAGE_MODEL_OPTIONS.find(
    (option) => option.id === DEFAULT_PIP_IMAGE_MODEL_ID
  );
}
let sharedState = null;
const PIP_IMAGE_SIZE_MIN = 512;
const PIP_IMAGE_SIZE_MAX = 2048;
function clampPipImageSize(value) {
  if (!Number.isFinite(value)) {
    return PIP_IMAGE_SIZE_MIN;
  }
  return Math.min(
    PIP_IMAGE_SIZE_MAX,
    Math.max(PIP_IMAGE_SIZE_MIN, Math.round(value))
  );
}
function createDefaultModelConfig() {
  const defaultImageModel = PIP_IMAGE_MODEL_OPTIONS.find(
    (option) => option.id === DEFAULT_PIP_IMAGE_MODEL_ID
  ) ?? PIP_IMAGE_MODEL_OPTIONS[0];
  const defaultVideoModel = PIP_VIDEO_MODEL_OPTIONS.find(
    (option) => option.id === DEFAULT_PIP_VIDEO_MODEL_ID
  ) ?? PIP_VIDEO_MODEL_OPTIONS[0];
  return {
    imageProvider: defaultImageModel?.id ?? "",
    imageApiKey: "",
    imageModelName: defaultImageModel?.defaultModelName ?? "",
    videoProvider: defaultVideoModel?.id ?? "",
    videoApiKey: "",
    videoModelName: defaultVideoModel?.defaultModelName ?? ""
  };
}
function generatePipAssetId() {
  return `pip-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
function getDefaultRegion(kind) {
  if (kind === "video") {
    return { x: 60, y: 35, width: 32, height: 28 };
  }
  return { x: 8, y: 35, width: 32, height: 28 };
}
function usePictureInPictureImpl() {
  const assets = /* @__PURE__ */ ref([]);
  const selectedAssetId = /* @__PURE__ */ ref("");
  const isPipModalOpen = /* @__PURE__ */ ref(false);
  const isPipModelConfigOpen = /* @__PURE__ */ ref(false);
  const pipModelConfigKind = /* @__PURE__ */ ref("");
  const editingSubtitleIds = /* @__PURE__ */ ref([]);
  const modelConfig = /* @__PURE__ */ ref(createDefaultModelConfig());
  const isGeneratingImage = /* @__PURE__ */ ref(false);
  const isGeneratingVideo = /* @__PURE__ */ ref(false);
  const historyEntries = /* @__PURE__ */ ref([]);
  void (async () => {
    try {
      const stored = await window.desktopApi.loadPipModelConfig();
      if (stored && typeof stored === "object") {
        modelConfig.value = {
          ...modelConfig.value,
          ...stored
        };
      }
    } catch {
    }
  })();
  const assetsBySubtitleId = computed(() => {
    const grouped = /* @__PURE__ */ new Map();
    assets.value.forEach((asset) => {
      asset.subtitleIds.forEach((subtitleId) => {
        const list = grouped.get(subtitleId) ?? [];
        list.push(asset);
        grouped.set(subtitleId, list);
      });
    });
    return grouped;
  });
  const editingAssets = computed(() => {
    if (editingSubtitleIds.value.length === 0) {
      return [];
    }
    const editingSet = new Set(editingSubtitleIds.value);
    return assets.value.filter(
      (asset) => asset.subtitleIds.some((id) => editingSet.has(id))
    );
  });
  function openPipModal(initialSubtitleId = "") {
    editingSubtitleIds.value = initialSubtitleId ? [initialSubtitleId] : [];
    selectedAssetId.value = "";
    isPipModalOpen.value = true;
  }
  function closePipModal() {
    isPipModalOpen.value = false;
  }
  function openPipModelConfig(kind = "image") {
    pipModelConfigKind.value = kind;
    isPipModelConfigOpen.value = true;
  }
  function closePipModelConfig() {
    isPipModelConfigOpen.value = false;
    pipModelConfigKind.value = "";
  }
  function toggleSubtitleSelection(subtitleId) {
    const index = editingSubtitleIds.value.indexOf(subtitleId);
    if (index === -1) {
      editingSubtitleIds.value.push(subtitleId);
    } else {
      editingSubtitleIds.value.splice(index, 1);
    }
    selectedAssetId.value = "";
  }
  function setSubtitleSelection(subtitleIds) {
    editingSubtitleIds.value = [...subtitleIds];
    selectedAssetId.value = "";
  }
  function selectAsset(assetId) {
    selectedAssetId.value = assetId;
  }
  function ensureEditingSelection() {
    if (editingSubtitleIds.value.length === 0) {
      ElMessage.warning("请先在左侧勾选需要编辑的字幕段（可以多选）");
      return false;
    }
    return true;
  }
  async function refreshHistory() {
    try {
      const list = await window.desktopApi.listPipHistory();
      historyEntries.value = Array.isArray(list) ? list : [];
    } catch {
    }
  }
  async function persistAssetToHistory(payload) {
    try {
      const entry = await window.desktopApi.savePipHistory(
        payload
      );
      historyEntries.value = [entry, ...historyEntries.value];
      return entry;
    } catch (error) {
      ElMessage.error(
        error instanceof Error ? error.message : "保存历史素材失败"
      );
      return null;
    }
  }
  function reuseHistoryEntry(entry) {
    if (!ensureEditingSelection()) {
      return;
    }
    const asset = {
      id: generatePipAssetId(),
      kind: entry.kind,
      origin: entry.origin,
      url: entry.url,
      naturalSize: entry.naturalSize,
      region: getDefaultRegion(entry.kind),
      subtitleIds: [...editingSubtitleIds.value],
      label: entry.fileName
    };
    assets.value.push(asset);
    selectedAssetId.value = asset.id;
  }
  async function deleteHistoryEntry(id) {
    try {
      await window.desktopApi.deletePipHistory(id);
      historyEntries.value = historyEntries.value.filter(
        (entry) => entry.id !== id
      );
    } catch (error) {
      ElMessage.error(
        error instanceof Error ? error.message : "删除历史素材失败"
      );
    }
  }
  async function addUploadedAsset(file) {
    if (!ensureEditingSelection()) {
      return;
    }
    const isImage = file.type.startsWith("image/");
    const isVideo = file.type.startsWith("video/");
    if (!isImage && !isVideo) {
      ElMessage.warning("仅支持图片或视频文件");
      return;
    }
    const kind = isImage ? "image" : "video";
    const arrayBuffer = await file.arrayBuffer();
    const entry = await persistAssetToHistory({
      kind,
      origin: "upload",
      fileName: file.name,
      mimeType: file.type || (kind === "image" ? "image/png" : "video/mp4"),
      arrayBuffer
    });
    if (!entry) {
      return;
    }
    const asset = {
      id: generatePipAssetId(),
      kind,
      origin: "upload",
      url: entry.url,
      region: getDefaultRegion(kind),
      subtitleIds: [...editingSubtitleIds.value],
      label: file.name
    };
    assets.value.push(asset);
    selectedAssetId.value = asset.id;
  }
  async function generateImageByAi(prompt, options = {
    width: 1024,
    height: 1024
  }) {
    if (!ensureEditingSelection()) {
      return;
    }
    if (!prompt.trim()) {
      ElMessage.warning("请输入用于生成图片的提示词");
      return;
    }
    if (!modelConfig.value.imageApiKey.trim()) {
      ElMessage.warning("请先在模型配置中填写文生图 API Key");
      openPipModelConfig();
      return;
    }
    const width = clampPipImageSize(options.width);
    const height = clampPipImageSize(options.height);
    isGeneratingImage.value = true;
    try {
      const result = await window.desktopApi.generatePipImage({
        provider: modelConfig.value.imageProvider,
        apiKey: modelConfig.value.imageApiKey,
        modelName: modelConfig.value.imageModelName,
        prompt,
        width,
        height
      });
      const entry = await persistAssetToHistory({
        kind: "image",
        origin: "ai",
        fileName: result.fileName,
        mimeType: result.mimeType,
        arrayBuffer: result.arrayBuffer,
        prompt,
        modelId: modelConfig.value.imageProvider
      });
      if (!entry) {
        return;
      }
      const asset = {
        id: generatePipAssetId(),
        kind: "image",
        origin: "ai",
        url: entry.url,
        naturalSize: {
          width: result.width || width,
          height: result.height || height
        },
        region: getDefaultRegion("image"),
        subtitleIds: [...editingSubtitleIds.value],
        label: `AI 图片：${prompt.slice(0, 16)}`
      };
      assets.value.push(asset);
      selectedAssetId.value = asset.id;
      ElMessage.success("AI 文生图成功");
    } catch (error) {
      ElMessage.error(error instanceof Error ? error.message : "AI 文生图失败");
    } finally {
      isGeneratingImage.value = false;
    }
  }
  async function generateVideoByAi(prompt) {
    if (!ensureEditingSelection()) {
      return;
    }
    if (!prompt.trim()) {
      ElMessage.warning("请输入用于生成视频的提示词");
      return;
    }
    if (!modelConfig.value.videoApiKey.trim()) {
      ElMessage.warning("请先在模型配置中填写文生视频 API Key");
      openPipModelConfig();
      return;
    }
    isGeneratingVideo.value = true;
    try {
      ElMessage.info("AI 文生视频能力正在接入中，请稍后再试");
    } finally {
      isGeneratingVideo.value = false;
    }
  }
  function updateAssetRegion(assetId, region) {
    const target = assets.value.find((asset) => asset.id === assetId);
    if (!target) {
      return;
    }
    target.region = region;
  }
  function applyAssetNaturalSize(assetId, naturalWidth, naturalHeight, canvasWidth, canvasHeight) {
    const target = assets.value.find((asset) => asset.id === assetId);
    if (!target || !canvasWidth || !canvasHeight || !naturalWidth || !naturalHeight) {
      return;
    }
    if (target.naturalSize && target.naturalSize.width === naturalWidth && target.naturalSize.height === naturalHeight) {
      return;
    }
    target.naturalSize = { width: naturalWidth, height: naturalHeight };
    const assetAspect = naturalWidth / naturalHeight;
    const desiredHeight = target.region.width * canvasWidth / (canvasHeight * assetAspect);
    const clampedHeight = Math.min(desiredHeight, 100 - target.region.y);
    target.region = {
      ...target.region,
      height: clampedHeight
    };
  }
  function updateAssetSubtitles(assetId, subtitleIds) {
    const target = assets.value.find((asset) => asset.id === assetId);
    if (!target) {
      return;
    }
    target.subtitleIds = [...subtitleIds];
  }
  function removeAsset(assetId) {
    const index = assets.value.findIndex((asset2) => asset2.id === assetId);
    if (index === -1) {
      return;
    }
    const asset = assets.value[index];
    if (asset.url.startsWith("blob:")) {
      URL.revokeObjectURL(asset.url);
    }
    assets.value.splice(index, 1);
    if (selectedAssetId.value === assetId) {
      selectedAssetId.value = "";
    }
  }
  function clearAssets() {
    assets.value.forEach((asset) => {
      if (asset.url.startsWith("blob:")) {
        URL.revokeObjectURL(asset.url);
      }
    });
    assets.value = [];
    selectedAssetId.value = "";
  }
  async function saveModelConfig(next) {
    modelConfig.value = { ...next };
    try {
      await window.desktopApi.savePipModelConfig({ ...next });
      ElMessage.success("画中画模型配置已保存");
    } catch (error) {
      ElMessage.error(
        error instanceof Error ? error.message : "画中画模型配置保存失败"
      );
      return;
    }
    closePipModelConfig();
  }
  return {
    addUploadedAsset,
    applyAssetNaturalSize,
    assets,
    assetsBySubtitleId,
    clearAssets,
    closePipModal,
    closePipModelConfig,
    deleteHistoryEntry,
    editingAssets,
    editingSubtitleIds,
    generateImageByAi,
    generateVideoByAi,
    historyEntries,
    isGeneratingImage,
    isGeneratingVideo,
    isPipModalOpen,
    isPipModelConfigOpen,
    modelConfig,
    openPipModal,
    openPipModelConfig,
    pipModelConfigKind,
    refreshHistory,
    removeAsset,
    reuseHistoryEntry,
    saveModelConfig,
    selectAsset,
    selectedAssetId,
    setSubtitleSelection,
    toggleSubtitleSelection,
    updateAssetRegion,
    updateAssetSubtitles
  };
}
function usePictureInPicture() {
  if (!sharedState) {
    sharedState = usePictureInPictureImpl();
  }
  return sharedState;
}
const msyhFontUrl = "" + new URL("MSYH-DVYoY81E.TTC", import.meta.url).href;
const msyhbdFontUrl = "" + new URL("MSYHBD-Yx315AyL.TTC", import.meta.url).href;
const simyouFontUrl = "" + new URL("SIMYOU-Bo8vlaf3.TTF", import.meta.url).href;
const SUBTITLE_FONT_OPTIONS = [
  {
    id: "msyh",
    label: "微软雅黑（常规）",
    fileName: "MSYH.TTC",
    fontFamily: "subtitle-font-msyh",
    url: msyhFontUrl
  },
  {
    id: "msyhbd",
    label: "微软雅黑（粗体）",
    fileName: "MSYHBD.TTC",
    fontFamily: "subtitle-font-msyhbd",
    url: msyhbdFontUrl
  },
  {
    id: "simyou",
    label: "幼圆（常规）",
    fileName: "SIMYOU.TTF",
    fontFamily: "subtitle-font-simyou",
    url: simyouFontUrl
  }
];
const DEFAULT_SUBTITLE_FONT_ID = "msyh";
function getSubtitleFontOption(id) {
  const matched = SUBTITLE_FONT_OPTIONS.find((option) => option.id === id);
  if (matched) {
    return matched;
  }
  const fallback = SUBTITLE_FONT_OPTIONS.find(
    (option) => option.id === DEFAULT_SUBTITLE_FONT_ID
  );
  return fallback ?? SUBTITLE_FONT_OPTIONS[0];
}
const _hoisted_1$c = { class: "feature-column" };
const _hoisted_2$c = { class: "column-body export-tool" };
const _hoisted_3$a = { class: "cover-style-previews" };
const _hoisted_4$8 = ["title", "onClick"];
const _hoisted_5$7 = {
  key: 0,
  class: "cover-preview-empty"
};
const _hoisted_6$7 = {
  key: 1,
  class: "cover-style-selected-badge"
};
const _hoisted_7$6 = {
  key: 2,
  class: "cover-style1-band"
};
const _hoisted_8$6 = {
  key: 3,
  class: "cover-style2-band"
};
const _hoisted_9$6 = {
  key: 4,
  class: "cover-style3-band"
};
const _hoisted_10$7 = { class: "cover-frame-section" };
const _hoisted_11$6 = { class: "cover-frame-controls" };
const _hoisted_12$6 = { class: "cover-field-label" };
const _hoisted_13$5 = {
  key: 0,
  class: "cover-capturing-hint"
};
const _hoisted_14$5 = { class: "cover-frame-range" };
const _hoisted_15$5 = { class: "cover-range-val" };
const _hoisted_16$4 = { class: "cover-font-row" };
const _hoisted_17$3 = { class: "cover-font-field" };
const _hoisted_18$3 = ["value"];
const _hoisted_19$3 = { class: "cover-font-field" };
const _hoisted_20$3 = { class: "cover-field-label" };
const _hoisted_21$3 = { class: "cover-font-size-val" };
const _hoisted_22$3 = { class: "cover-field" };
const _hoisted_23$3 = { class: "render-section" };
const _hoisted_24$3 = ["disabled", "title"];
const _hoisted_25$3 = { class: "render-progress-area" };
const _hoisted_26$3 = {
  key: 0,
  class: "render-success-row"
};
const _hoisted_27$3 = { class: "render-progress-bar" };
const _hoisted_28$3 = { class: "render-progress-info" };
const _hoisted_29$3 = { class: "render-progress-percent" };
const _hoisted_30$3 = { class: "render-progress-status" };
const _hoisted_31$3 = {
  key: 0,
  class: "render-success-area",
  style: { "display": "none" }
};
const subtitleStyleStorageKey$1 = "ai-digital-avatar.subtitle-style";
const _sfc_main$c = /* @__PURE__ */ defineComponent({
  __name: "ExportColumn",
  setup(__props) {
    const {
      effectiveVideoSourceUrl,
      subtitleList
    } = useSubtitleRecognition();
    const { assets: pipAssets } = usePictureInPicture();
    function readSubtitleStyle() {
      try {
        const stored = window.localStorage.getItem(subtitleStyleStorageKey$1);
        if (!stored) return null;
        return JSON.parse(stored);
      } catch {
        return null;
      }
    }
    const hasSubtitles = computed(() => subtitleList.value.length > 0);
    const hasVideo = computed(() => Boolean(effectiveVideoSourceUrl.value));
    const canRender = computed(() => hasSubtitles.value && hasVideo.value);
    const isRendering = /* @__PURE__ */ ref(false);
    const renderProgress = /* @__PURE__ */ ref(0);
    const renderOutputPath = /* @__PURE__ */ ref("");
    const renderSuccess = /* @__PURE__ */ ref(false);
    let unsubscribeProgress = null;
    onMounted(() => {
      if (!document.querySelector('style[data-cover-fonts="true"]')) {
        const styleEl = document.createElement("style");
        styleEl.dataset.coverFonts = "true";
        styleEl.textContent = SUBTITLE_FONT_OPTIONS.map(
          (f) => `@font-face { font-family: '${f.fontFamily}'; src: url('${f.url}'); font-display: swap; }`
        ).join("\n");
        document.head.appendChild(styleEl);
      }
    });
    onUnmounted(() => {
      unsubscribeProgress?.();
      unsubscribeProgress = null;
    });
    function handleShowInFolder() {
      if (renderOutputPath.value) void window.desktopApi.showVideoInFolder(renderOutputPath.value);
    }
    async function handleExportAll() {
      if (!hasSubtitles.value) {
        ElMessage.warning("请先在第五步完成字幕识别");
        return;
      }
      if (!hasVideo.value) {
        ElMessage.warning("请先配置视频 URL");
        return;
      }
      if (!coverFrameDataUrl.value) {
        ElMessage.warning("请先在第六步截取封面帧");
        return;
      }
      isRendering.value = true;
      renderProgress.value = 0;
      renderSuccess.value = false;
      renderOutputPath.value = "";
      unsubscribeProgress?.();
      unsubscribeProgress = window.desktopApi.onVideoRenderProgress((progress) => {
        renderProgress.value = progress;
      });
      try {
        const style = readSubtitleStyle();
        const fontOption = getSubtitleFontOption(style?.fontId ?? "");
        let videoUrl = effectiveVideoSourceUrl.value;
        if (videoUrl.startsWith("local-video://local-file/")) {
          videoUrl = decodeURIComponent(videoUrl.replace("local-video://local-file/", ""));
        }
        const videoPayload = {
          videoUrl,
          subtitles: subtitleList.value.map((item) => ({ start: item.start, end: item.end, text: item.text })),
          subtitleStyle: {
            fontFileName: fontOption.fileName,
            fontSize: style?.fontSize ?? 10,
            color: style?.fontColor ?? "#ffffff",
            strokeSize: style?.strokeSize ?? 0,
            strokeColor: style?.strokeColor ?? "#000000"
          },
          pipItems: pipAssets.value.map((asset) => {
            const matched = subtitleList.value.filter((sub) => asset.subtitleIds.includes(sub.id));
            return {
              url: asset.url,
              kind: asset.kind,
              region: asset.region,
              startTime: matched.length ? Math.min(...matched.map((s) => s.start)) : 0,
              endTime: matched.length ? Math.max(...matched.map((s) => s.end)) : 0
            };
          }),
          outputPath: ""
        };
        const ts = Date.now();
        const composedCoverDataUrl = await buildCoverDataUrl();
        const result = await window.desktopApi.exportAll(
          JSON.parse(JSON.stringify({
            videoPayload,
            coverBase64: composedCoverDataUrl ?? void 0,
            coverFileName: `封面_${ts}.jpg`
          }))
        );
        if (result.canceled) {
          return;
        }
        if (result.success && result.outputDir) {
          renderSuccess.value = true;
          renderOutputPath.value = result.outputDir;
          ElMessage.success("渲染导出完成");
        } else {
          ElMessage.error(result.error || "导出失败");
        }
      } catch (error) {
        ElMessage.error(error instanceof Error ? error.message : "导出失败");
      } finally {
        isRendering.value = false;
        unsubscribeProgress?.();
        unsubscribeProgress = null;
      }
    }
    const coverFontFamily = computed(() => {
      const opt = SUBTITLE_FONT_OPTIONS.find((f) => f.id === coverFontId.value);
      return opt ? `'${opt.fontFamily}', sans-serif` : "sans-serif";
    });
    const coverStyles = [
      { id: "bottom-gradient", label: "黄底标题", description: "黄色色带，白字黑描边居中" },
      { id: "center-emphasis", label: "居中强调", description: "半透明遮罩，大字居中" },
      { id: "top-banner", label: "蓝调渐变", description: "蓝色渐变条，左侧橙色竖线" }
    ];
    const selectedStyleId = /* @__PURE__ */ ref("bottom-gradient");
    const coverTitle = /* @__PURE__ */ ref("");
    const coverFontId = /* @__PURE__ */ ref("msyhbd");
    const coverFontSize = /* @__PURE__ */ ref(10);
    const coverFrameDataUrl = /* @__PURE__ */ ref("");
    const frameTimePercent = /* @__PURE__ */ ref(10);
    const isCapturing = /* @__PURE__ */ ref(false);
    const coverPreviewRef = /* @__PURE__ */ ref(null);
    watch(subtitleList, (list) => {
      if (list.length && !coverTitle.value) {
        coverTitle.value = list.map((s) => s.text.replace(/\n/g, "")).join("").slice(0, 16).trim();
      }
    }, { immediate: true });
    watch(effectiveVideoSourceUrl, () => {
      coverFrameDataUrl.value = "";
      scheduleCapture();
    });
    let captureTimer = null;
    function scheduleCapture() {
      if (captureTimer) clearTimeout(captureTimer);
      captureTimer = setTimeout(() => {
        void captureFrame();
      }, 400);
    }
    watch(frameTimePercent, () => {
      scheduleCapture();
    });
    async function captureFrame() {
      if (!hasVideo.value) return;
      isCapturing.value = true;
      try {
        const result = await window.desktopApi.captureVideoFrame(
          effectiveVideoSourceUrl.value,
          frameTimePercent.value
        );
        const blob = new Blob([result.arrayBuffer], { type: result.mimeType });
        const reader = new FileReader();
        const dataUrl = await new Promise((resolve2, reject) => {
          reader.onload = () => resolve2(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
        coverFrameDataUrl.value = dataUrl;
      } catch {
      } finally {
        isCapturing.value = false;
      }
    }
    function wrapTextLines(ctx, text, maxWidth) {
      const result = [];
      for (const rawLine of text.split("\n")) {
        if (rawLine.length === 0) {
          result.push("");
          continue;
        }
        let current = "";
        for (const char of rawLine) {
          const test = current + char;
          if (ctx.measureText(test).width > maxWidth && current.length > 0) {
            result.push(current);
            current = char;
          } else {
            current = test;
          }
        }
        if (current) result.push(current);
      }
      return result.filter((l) => l.length > 0);
    }
    async function buildCoverDataUrl() {
      if (!coverFrameDataUrl.value) {
        return null;
      }
      const W = 1080, H = 1920;
      const canvas = document.createElement("canvas");
      canvas.width = W;
      canvas.height = H;
      const ctx = canvas.getContext("2d");
      const img = new Image();
      img.src = coverFrameDataUrl.value;
      await new Promise((resolve2) => {
        img.onload = () => resolve2();
      });
      ctx.drawImage(img, 0, 0, W, H);
      const title = coverTitle.value || "封面标题";
      const style = selectedStyleId.value;
      await document.fonts.ready;
      const previewW = coverPreviewRef.value?.getBoundingClientRect().width || 160;
      const scaleW = W / previewW;
      const exportFontSize = Math.round(coverFontSize.value * scaleW);
      const fontFamily = coverFontFamily.value;
      function drawBand(gradColors, accentColor) {
        const padding = exportFontSize * 0.4;
        const accentW = 4 * scaleW;
        const gapW = exportFontSize * 0.5;
        const fontSize = exportFontSize;
        ctx.font = `bold ${fontSize}px ${fontFamily}`;
        ctx.letterSpacing = `${exportFontSize * 0.08}px`;
        const textMaxWidth = W * 0.88 - accentW - gapW;
        const lines = wrapTextLines(ctx, title, textMaxWidth);
        const lineH = fontSize * 1.5;
        const textBlockH = lines.length * lineH;
        const bandH = textBlockH + padding * 2;
        const bandY = (H - bandH) / 2;
        const grad = ctx.createLinearGradient(0, 0, W, 0);
        grad.addColorStop(0, gradColors[0]);
        grad.addColorStop(1, gradColors[1]);
        ctx.fillStyle = grad;
        ctx.fillRect(0, bandY, W, bandH);
        ctx.fillStyle = accentColor;
        ctx.fillRect(0, bandY + padding, accentW, textBlockH);
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "#ffffff";
        lines.forEach((line, i) => {
          const x = accentW + gapW;
          const y = bandY + padding + lineH * i + lineH / 2;
          ctx.save();
          ctx.shadowColor = "rgba(0,0,0,0.4)";
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 1 * scaleW;
          ctx.shadowBlur = 4 * scaleW;
          ctx.fillText(line, x, y);
          ctx.restore();
        });
      }
      if (style === "bottom-gradient") {
        drawBand(["rgba(180,130,10,0.92)", "rgba(248,179,0,0.88)"], "#c0392b");
      } else if (style === "center-emphasis") {
        drawBand(["rgba(26,26,46,0.94)", "rgba(45,45,78,0.90)"], "#00b894");
      } else {
        drawBand(["rgba(26,58,92,0.92)", "rgba(42,111,151,0.85)"], "#ff6b2b");
      }
      return canvas.toDataURL("image/jpeg", 0.95);
    }
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("article", _hoisted_1$c, [
        createBaseVNode("div", _hoisted_2$c, [
          createVNode(unref(ElDivider), { class: "step-divider" }, {
            default: withCtx(() => [..._cache[4] || (_cache[4] = [
              createTextVNode("第六步：封面设计", -1)
            ])]),
            _: 1
          }),
          createBaseVNode("div", _hoisted_3$a, [
            (openBlock(), createElementBlock(Fragment, null, renderList(coverStyles, (style, idx) => {
              return createBaseVNode("button", {
                key: style.id,
                type: "button",
                class: normalizeClass(["cover-style-preview-card", { "is-active": selectedStyleId.value === style.id }]),
                title: style.label,
                onClick: ($event) => selectedStyleId.value = style.id
              }, [
                createBaseVNode("div", {
                  ref_for: true,
                  ref: idx === 0 ? (el) => {
                    coverPreviewRef.value = el;
                  } : void 0,
                  class: "cover-style-preview-inner",
                  style: normalizeStyle(coverFrameDataUrl.value ? { backgroundImage: `url(${coverFrameDataUrl.value})` } : {})
                }, [
                  !coverFrameDataUrl.value ? (openBlock(), createElementBlock("div", _hoisted_5$7)) : createCommentVNode("", true),
                  selectedStyleId.value === style.id ? (openBlock(), createElementBlock("div", _hoisted_6$7, [..._cache[5] || (_cache[5] = [
                    createBaseVNode("svg", {
                      viewBox: "0 0 16 16",
                      fill: "none",
                      xmlns: "http://www.w3.org/2000/svg"
                    }, [
                      createBaseVNode("circle", {
                        cx: "8",
                        cy: "8",
                        r: "8",
                        fill: "#2a6f97"
                      }),
                      createBaseVNode("path", {
                        d: "M4.5 8.5l2.5 2.5 4.5-5",
                        stroke: "#ffffff",
                        "stroke-width": "1.6",
                        "stroke-linecap": "round",
                        "stroke-linejoin": "round"
                      })
                    ], -1)
                  ])])) : createCommentVNode("", true),
                  style.id === "bottom-gradient" ? (openBlock(), createElementBlock("div", _hoisted_7$6, [
                    _cache[6] || (_cache[6] = createBaseVNode("span", { class: "cover-style1-accent" }, null, -1)),
                    createBaseVNode("span", {
                      class: "cover-style-text",
                      style: normalizeStyle({ fontFamily: coverFontFamily.value, fontSize: `${coverFontSize.value}px` })
                    }, toDisplayString(coverTitle.value || "封面标题"), 5)
                  ])) : style.id === "center-emphasis" ? (openBlock(), createElementBlock("div", _hoisted_8$6, [
                    _cache[7] || (_cache[7] = createBaseVNode("span", { class: "cover-style2-accent" }, null, -1)),
                    createBaseVNode("span", {
                      class: "cover-style-text",
                      style: normalizeStyle({ fontFamily: coverFontFamily.value, fontSize: `${coverFontSize.value}px` })
                    }, toDisplayString(coverTitle.value || "封面标题"), 5)
                  ])) : (openBlock(), createElementBlock("div", _hoisted_9$6, [
                    _cache[8] || (_cache[8] = createBaseVNode("span", { class: "cover-style3-accent" }, null, -1)),
                    createBaseVNode("span", {
                      class: "cover-style-text",
                      style: normalizeStyle({ fontFamily: coverFontFamily.value, fontSize: `${coverFontSize.value}px` })
                    }, toDisplayString(coverTitle.value || "封面标题"), 5)
                  ]))
                ], 4)
              ], 10, _hoisted_4$8);
            }), 64))
          ]),
          createBaseVNode("section", _hoisted_10$7, [
            createBaseVNode("div", _hoisted_11$6, [
              createBaseVNode("span", _hoisted_12$6, [
                _cache[9] || (_cache[9] = createTextVNode(" 截取位置 ", -1)),
                isCapturing.value ? (openBlock(), createElementBlock("span", _hoisted_13$5, "截取中...")) : createCommentVNode("", true)
              ]),
              createBaseVNode("div", _hoisted_14$5, [
                withDirectives(createBaseVNode("input", {
                  "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => frameTimePercent.value = $event),
                  type: "range",
                  min: "0",
                  max: "100",
                  step: "1",
                  class: "cover-range-input"
                }, null, 512), [
                  [
                    vModelText,
                    frameTimePercent.value,
                    void 0,
                    { number: true }
                  ]
                ]),
                createBaseVNode("span", _hoisted_15$5, toDisplayString(frameTimePercent.value) + "%", 1)
              ])
            ])
          ]),
          createBaseVNode("div", _hoisted_16$4, [
            createBaseVNode("label", _hoisted_17$3, [
              _cache[10] || (_cache[10] = createBaseVNode("span", { class: "cover-field-label" }, "字体", -1)),
              withDirectives(createBaseVNode("select", {
                "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => coverFontId.value = $event),
                class: "cover-input"
              }, [
                (openBlock(true), createElementBlock(Fragment, null, renderList(unref(SUBTITLE_FONT_OPTIONS), (font) => {
                  return openBlock(), createElementBlock("option", {
                    key: font.id,
                    value: font.id
                  }, toDisplayString(font.label), 9, _hoisted_18$3);
                }), 128))
              ], 512), [
                [vModelSelect, coverFontId.value]
              ])
            ]),
            createBaseVNode("label", _hoisted_19$3, [
              createBaseVNode("span", _hoisted_20$3, [
                _cache[11] || (_cache[11] = createTextVNode("字号 ", -1)),
                createBaseVNode("span", _hoisted_21$3, toDisplayString(coverFontSize.value) + "px", 1)
              ]),
              withDirectives(createBaseVNode("input", {
                "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => coverFontSize.value = $event),
                type: "range",
                min: "6",
                max: "64",
                step: "0.5",
                class: "cover-range-input"
              }, null, 512), [
                [
                  vModelText,
                  coverFontSize.value,
                  void 0,
                  { number: true }
                ]
              ])
            ])
          ]),
          createBaseVNode("label", _hoisted_22$3, [
            _cache[12] || (_cache[12] = createBaseVNode("span", { class: "cover-field-label" }, "封面标题", -1)),
            withDirectives(createBaseVNode("textarea", {
              "onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => coverTitle.value = $event),
              class: "cover-input cover-title-textarea",
              rows: "2",
              placeholder: "输入封面标题（支持换行）"
            }, null, 512), [
              [vModelText, coverTitle.value]
            ])
          ]),
          createVNode(unref(ElDivider), { class: "step-divider" }, {
            default: withCtx(() => [..._cache[13] || (_cache[13] = [
              createTextVNode("第七步：导出", -1)
            ])]),
            _: 1
          }),
          createBaseVNode("section", _hoisted_23$3, [
            createBaseVNode("button", {
              class: "primary-button render-video-button",
              type: "button",
              disabled: !canRender.value || isRendering.value,
              title: canRender.value ? "一键导出" : "请先完成字幕识别并配置视频 URL",
              onClick: handleExportAll
            }, toDisplayString(isRendering.value ? "导出中..." : "一键导出"), 9, _hoisted_24$3),
            createBaseVNode("div", _hoisted_25$3, [
              renderSuccess.value && !isRendering.value ? (openBlock(), createElementBlock("div", _hoisted_26$3, [
                _cache[14] || (_cache[14] = createBaseVNode("span", { class: "render-success-text" }, "✓ 导出完成", -1)),
                createBaseVNode("button", {
                  type: "button",
                  class: "render-open-folder",
                  onClick: handleShowInFolder
                }, " 打开文件夹 ")
              ])) : (openBlock(), createElementBlock(Fragment, { key: 1 }, [
                createBaseVNode("div", _hoisted_27$3, [
                  createBaseVNode("div", {
                    class: "render-progress-fill",
                    style: normalizeStyle({ width: `${renderProgress.value}%` })
                  }, null, 4)
                ]),
                createBaseVNode("div", _hoisted_28$3, [
                  createBaseVNode("span", _hoisted_29$3, toDisplayString(renderProgress.value) + "%", 1),
                  createBaseVNode("span", _hoisted_30$3, toDisplayString(!isRendering.value && renderProgress.value === 0 ? "等待导出" : renderProgress.value < 30 ? "下载视频中..." : renderProgress.value < 40 ? "准备渲染..." : renderProgress.value < 100 ? "编码中..." : "完成"), 1)
                ])
              ], 64))
            ]),
            renderSuccess.value && !isRendering.value ? (openBlock(), createElementBlock("div", _hoisted_31$3)) : createCommentVNode("", true)
          ]),
          _cache[15] || (_cache[15] = createBaseVNode("div", { class: "reserved-area" }, [
            createBaseVNode("span", { class: "reserved-area-text" }, "预留区域，加点什么功能呢？ 🤔")
          ], -1))
        ])
      ]);
    };
  }
});
const ExportColumn = /* @__PURE__ */ _export_sfc(_sfc_main$c, [["__scopeId", "data-v-1147914f"]]);
const _hoisted_1$b = {
  key: 0,
  class: "modal-backdrop"
};
const _hoisted_2$b = {
  class: "pip-modal",
  role: "dialog",
  "aria-modal": "true",
  "aria-labelledby": "pip-modal-title"
};
const _hoisted_3$9 = { class: "modal-header" };
const _hoisted_4$7 = { class: "pip-modal-body" };
const _hoisted_5$6 = {
  class: "pip-subtitle-list",
  "aria-label": "字幕列表"
};
const _hoisted_6$6 = { class: "pip-subtitle-list-head" };
const _hoisted_7$5 = {
  key: 0,
  class: "pip-subtitle-list-scroll"
};
const _hoisted_8$5 = ["onClick"];
const _hoisted_9$5 = ["checked", "aria-label", "onChange"];
const _hoisted_10$6 = { class: "pip-subtitle-row-main" };
const _hoisted_11$5 = { class: "pip-subtitle-time" };
const _hoisted_12$5 = { class: "pip-subtitle-text" };
const _hoisted_13$4 = ["title"];
const _hoisted_14$4 = {
  key: 1,
  class: "pip-empty"
};
const _hoisted_15$4 = {
  class: "pip-editor",
  "aria-label": "画中画编辑"
};
const _hoisted_16$3 = { class: "pip-toolbar" };
const _hoisted_17$2 = { class: "pip-toolbar-tip" };
const _hoisted_18$2 = { class: "pip-editor-stage" };
const _hoisted_19$2 = ["src"];
const _hoisted_20$2 = ["onMousedown"];
const _hoisted_21$2 = ["src", "onLoad"];
const _hoisted_22$2 = ["src", "onLoadedmetadata"];
const _hoisted_23$2 = ["onClick"];
const _hoisted_24$2 = ["onMousedown"];
const _hoisted_25$2 = {
  key: 1,
  class: "pip-editor-subtitle"
};
const _hoisted_26$2 = {
  key: 0,
  class: "pip-editor-empty"
};
const _hoisted_27$2 = {
  class: "pip-ai-side",
  "aria-label": "AI 工作台"
};
const _hoisted_28$2 = { class: "pip-ai-form" };
const _hoisted_29$2 = { class: "pip-ai-section is-flat" };
const _hoisted_30$2 = { class: "pip-ai-field" };
const _hoisted_31$2 = { class: "pip-ai-field-label" };
const _hoisted_32$2 = ["value"];
const _hoisted_33$2 = { class: "pip-ai-field" };
const _hoisted_34$2 = { class: "pip-ai-field-label" };
const _hoisted_35$2 = { class: "pip-ai-field-hint" };
const _hoisted_36$2 = { class: "pip-ai-size" };
const _hoisted_37$2 = { class: "pip-ai-size-cell" };
const _hoisted_38$2 = ["min", "max", "value"];
const _hoisted_39$2 = { class: "pip-ai-size-cell" };
const _hoisted_40$2 = ["min", "max", "value"];
const _hoisted_41$2 = { class: "pip-ai-row pip-ai-action-row" };
const _hoisted_42$2 = ["disabled"];
const _hoisted_43$2 = { class: "pip-history" };
const _hoisted_44$2 = {
  key: 0,
  class: "pip-history-list"
};
const _hoisted_45$2 = ["title", "onClick"];
const _hoisted_46$2 = ["src", "alt"];
const _hoisted_47$1 = ["src"];
const _hoisted_48$1 = { class: "pip-history-meta" };
const _hoisted_49$1 = { class: "pip-history-meta-kind" };
const _hoisted_50$1 = { class: "pip-history-meta-time" };
const _hoisted_51$1 = ["onClick"];
const _hoisted_52$1 = {
  key: 1,
  class: "pip-history-empty"
};
const _hoisted_53 = {
  key: 1,
  class: "modal-backdrop"
};
const _hoisted_54$1 = {
  class: "pip-model-config-modal",
  role: "dialog",
  "aria-modal": "true"
};
const _hoisted_55$1 = { class: "modal-header" };
const _hoisted_56$1 = {
  key: 0,
  class: "config-modal-body"
};
const _hoisted_57$1 = { class: "provider-select-field" };
const _hoisted_58$1 = ["value"];
const _hoisted_59$1 = {
  key: 0,
  class: "config-tip"
};
const _hoisted_60$1 = {
  key: 1,
  class: "config-tip"
};
const _hoisted_61$1 = { class: "config-field" };
const _hoisted_62$1 = { class: "config-field" };
const _hoisted_63$1 = ["value"];
const _hoisted_64$1 = { class: "modal-actions" };
const _hoisted_65$1 = {
  key: 2,
  class: "modal-backdrop"
};
const _hoisted_66$1 = {
  class: "pip-prompt-modal",
  role: "dialog",
  "aria-modal": "true"
};
const _hoisted_67$1 = { class: "pip-prompt-modal-body" };
const _hoisted_68$1 = { class: "pip-prompt-edit" };
const _hoisted_69$1 = { class: "pip-prompt-edit-head" };
const _sfc_main$b = /* @__PURE__ */ defineComponent({
  __name: "PictureInPictureModal",
  props: {
    videoSrc: {},
    subtitleRows: {},
    subtitleStyle: {},
    initialActiveSubtitleId: {}
  },
  setup(__props) {
    const props = __props;
    const {
      addUploadedAsset,
      applyAssetNaturalSize,
      assetsBySubtitleId,
      closePipModal,
      closePipModelConfig,
      deleteHistoryEntry,
      editingAssets,
      editingSubtitleIds,
      generateImageByAi,
      historyEntries,
      isGeneratingImage,
      isPipModalOpen,
      isPipModelConfigOpen,
      modelConfig,
      openPipModelConfig,
      pipModelConfigKind,
      refreshHistory,
      removeAsset,
      reuseHistoryEntry,
      saveModelConfig,
      selectAsset,
      selectedAssetId,
      setSubtitleSelection,
      toggleSubtitleSelection
    } = usePictureInPicture();
    const editorCanvasRef = /* @__PURE__ */ ref(null);
    const aiImagePrompt = /* @__PURE__ */ ref("");
    const aiImageWidth = /* @__PURE__ */ ref(512);
    const aiImageHeight = /* @__PURE__ */ ref(512);
    const userEditedImagePrompt = /* @__PURE__ */ ref(false);
    const expandedPromptKind = /* @__PURE__ */ ref(null);
    const subtitleForCanvas = computed(() => {
      if (editingSubtitleIds.value.length === 0) {
        return null;
      }
      const firstId = editingSubtitleIds.value[0];
      return props.subtitleRows.find((row) => row.id === firstId) ?? null;
    });
    const subtitleFontFamily = computed(
      () => `'${getSubtitleFontOption(props.subtitleStyle.fontId).fontFamily}', sans-serif`
    );
    const subtitleBaseStyle = computed(() => ({
      fontFamily: subtitleFontFamily.value,
      fontSize: `${props.subtitleStyle.fontSize}px`,
      whiteSpace: "pre-line"
    }));
    const subtitleFillStyle = computed(() => ({
      ...subtitleBaseStyle.value,
      color: props.subtitleStyle.color,
      WebkitTextFillColor: props.subtitleStyle.color,
      WebkitTextStrokeWidth: "0px"
    }));
    const subtitleStrokeStyle = computed(() => ({
      ...subtitleBaseStyle.value,
      color: "transparent",
      WebkitTextFillColor: "transparent",
      WebkitTextStrokeColor: props.subtitleStyle.strokeColor,
      WebkitTextStrokeWidth: `${props.subtitleStyle.strokeSize}px`
    }));
    watch(
      () => isPipModalOpen.value,
      (open) => {
        if (!open) {
          return;
        }
        if (editingSubtitleIds.value.length === 0) {
          const initialId = props.initialActiveSubtitleId || props.subtitleRows[0]?.id || "";
          if (initialId) {
            setSubtitleSelection([initialId]);
          }
        }
        void nextTick();
        void refreshHistory();
      }
    );
    const fullSubtitleText = computed(
      () => props.subtitleRows.map((row) => row.text.trim()).filter(Boolean).join("")
    );
    const selectedSubtitleText = computed(() => {
      const selectedSet = new Set(editingSubtitleIds.value);
      return props.subtitleRows.filter((row) => selectedSet.has(row.id)).map((row) => row.text.trim()).filter(Boolean).join("、");
    });
    function buildDefaultPrompt() {
      const fullText = fullSubtitleText.value || "（暂无字幕）";
      const selectedText = selectedSubtitleText.value || "（请先选择字幕）";
      return `文案全文内容是：${fullText}。 请根据：${selectedText}，生成一张图片。`;
    }
    const defaultImagePrompt = computed(() => buildDefaultPrompt());
    watch(
      defaultImagePrompt,
      (next) => {
        if (!userEditedImagePrompt.value) {
          aiImagePrompt.value = next;
        }
      },
      { immediate: true }
    );
    function handlePromptInput(kind, event) {
      const input = event.target;
      aiImagePrompt.value = input.value;
      userEditedImagePrompt.value = input.value.length > 0;
    }
    function resetPromptToDefault(kind) {
      if (kind !== "image") {
        return;
      }
      aiImagePrompt.value = defaultImagePrompt.value;
      userEditedImagePrompt.value = false;
    }
    function openExpandedPrompt(kind) {
      expandedPromptKind.value = kind;
    }
    function closeExpandedPrompt() {
      expandedPromptKind.value = null;
    }
    watch(
      () => props.subtitleRows.length,
      (length) => {
        if (length === 0) {
          setSubtitleSelection([]);
        }
      }
    );
    const allSubtitleSelected = computed(() => {
      if (props.subtitleRows.length === 0) {
        return false;
      }
      return editingSubtitleIds.value.length === props.subtitleRows.length;
    });
    function isSubtitleSelected(id) {
      return editingSubtitleIds.value.includes(id);
    }
    function getSubtitleAssetCount(subtitleId) {
      return assetsBySubtitleId.value.get(subtitleId)?.length ?? 0;
    }
    function handleSelectAllSubtitles() {
      if (allSubtitleSelected.value) {
        setSubtitleSelection([]);
      } else {
        setSubtitleSelection(props.subtitleRows.map((row) => row.id));
      }
    }
    function handleSubtitleClick(row, event) {
      if (event.ctrlKey || event.metaKey || event.shiftKey) {
        toggleSubtitleSelection(row.id);
        return;
      }
      setSubtitleSelection([row.id]);
    }
    function handleSubtitleCheckboxChange(row, event) {
      event.stopPropagation();
      toggleSubtitleSelection(row.id);
    }
    function handleUpload(event, kindHint) {
      const input = event.target;
      const file = input.files?.[0];
      input.value = "";
      if (!file) {
        return;
      }
      if (!file.type.startsWith("image/")) {
        return;
      }
      addUploadedAsset(file);
    }
    async function handleGenerateImage() {
      await generateImageByAi(aiImagePrompt.value, {
        width: aiImageWidth.value,
        height: aiImageHeight.value
      });
    }
    let dragContext = null;
    function getCanvasSize() {
      const rect = editorCanvasRef.value?.getBoundingClientRect();
      return {
        width: rect?.width ?? 0,
        height: rect?.height ?? 0
      };
    }
    function clamp2(value, min, max) {
      return Math.min(Math.max(value, min), max);
    }
    function startDrag(event, asset, mode) {
      event.preventDefault();
      event.stopPropagation();
      selectAsset(asset.id);
      const size = getCanvasSize();
      if (size.width === 0 || size.height === 0) {
        return;
      }
      dragContext = {
        mode,
        asset,
        startX: event.clientX,
        startY: event.clientY,
        initialRegion: { ...asset.region },
        canvasWidth: size.width,
        canvasHeight: size.height
      };
      window.addEventListener("mousemove", handleDrag);
      window.addEventListener("mouseup", endDrag);
    }
    function handleDrag(event) {
      if (!dragContext) {
        return;
      }
      const { mode, asset, startX, startY, initialRegion, canvasWidth, canvasHeight } = dragContext;
      const deltaXPercent = (event.clientX - startX) / canvasWidth * 100;
      const deltaYPercent = (event.clientY - startY) / canvasHeight * 100;
      if (mode === "move") {
        const nextX = clamp2(initialRegion.x + deltaXPercent, 0, 100 - initialRegion.width);
        const nextY = clamp2(initialRegion.y + deltaYPercent, 0, 100 - initialRegion.height);
        asset.region = { ...initialRegion, x: nextX, y: nextY };
        return;
      }
      const initialPxWidth = initialRegion.width / 100 * canvasWidth;
      const initialPxHeight = initialRegion.height / 100 * canvasHeight;
      if (initialPxWidth <= 0 || initialPxHeight <= 0) {
        return;
      }
      const aspectRatio = initialPxWidth / initialPxHeight;
      const deltaXPx = deltaXPercent / 100 * canvasWidth;
      const deltaYPx = deltaYPercent / 100 * canvasHeight;
      const widthCandidate = initialPxWidth + deltaXPx;
      const heightCandidate = initialPxHeight + deltaYPx;
      const widthFromHeight = heightCandidate * aspectRatio;
      const heightFromWidth = widthCandidate / aspectRatio;
      let nextPxWidth;
      let nextPxHeight;
      if (Math.abs(deltaXPx) >= Math.abs(deltaYPx)) {
        nextPxWidth = widthCandidate;
        nextPxHeight = heightFromWidth;
      } else {
        nextPxWidth = widthFromHeight;
        nextPxHeight = heightCandidate;
      }
      const minPxWidth = 8 / 100 * canvasWidth;
      const minPxHeight = 8 / 100 * canvasHeight;
      if (nextPxWidth < minPxWidth) {
        nextPxWidth = minPxWidth;
        nextPxHeight = nextPxWidth / aspectRatio;
      }
      if (nextPxHeight < minPxHeight) {
        nextPxHeight = minPxHeight;
        nextPxWidth = nextPxHeight * aspectRatio;
      }
      const maxPxWidth = canvasWidth - initialRegion.x / 100 * canvasWidth;
      const maxPxHeight = canvasHeight - initialRegion.y / 100 * canvasHeight;
      if (nextPxWidth > maxPxWidth) {
        nextPxWidth = maxPxWidth;
        nextPxHeight = nextPxWidth / aspectRatio;
      }
      if (nextPxHeight > maxPxHeight) {
        nextPxHeight = maxPxHeight;
        nextPxWidth = nextPxHeight * aspectRatio;
      }
      asset.region = {
        ...initialRegion,
        width: nextPxWidth / canvasWidth * 100,
        height: nextPxHeight / canvasHeight * 100
      };
    }
    function endDrag() {
      dragContext = null;
      window.removeEventListener("mousemove", handleDrag);
      window.removeEventListener("mouseup", endDrag);
    }
    function handleRemove(asset, event) {
      event.stopPropagation();
      removeAsset(asset.id);
    }
    async function handleSaveModelConfig() {
      await saveModelConfig({ ...modelConfig.value });
    }
    const availableImageModelNames = computed(() => {
      const option = getPipImageModelOption(modelConfig.value.imageProvider);
      return option?.modelNames ?? [];
    });
    watch(
      () => modelConfig.value.imageProvider,
      () => {
        const option = getPipImageModelOption(modelConfig.value.imageProvider);
        if (!option) {
          return;
        }
        if (!option.modelNames.includes(modelConfig.value.imageModelName)) {
          modelConfig.value.imageModelName = option.defaultModelName;
        }
      }
    );
    function handleImageSizeInput(field, event) {
      const input = event.target;
      const next = clampPipImageSize(Number.parseInt(input.value, 10));
      if (field === "width") {
        aiImageWidth.value = next;
      } else {
        aiImageHeight.value = next;
      }
      input.value = String(next);
    }
    function formatHistoryTime(timestamp) {
      const d = new Date(timestamp);
      const pad = (n) => `${n}`.padStart(2, "0");
      return `${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
    }
    function reuseHistory(entry) {
      const target = historyEntries.value.find((item) => item.id === entry.id);
      if (target) {
        reuseHistoryEntry(target);
      }
    }
    async function deleteHistory(id, event) {
      event.stopPropagation();
      await deleteHistoryEntry(id);
    }
    function handleAssetImageLoaded(asset, event) {
      const img = event.target;
      const size = getCanvasSize();
      applyAssetNaturalSize(asset.id, img.naturalWidth, img.naturalHeight, size.width, size.height);
    }
    function handleAssetVideoLoaded(asset, event) {
      const video = event.target;
      const size = getCanvasSize();
      applyAssetNaturalSize(asset.id, video.videoWidth, video.videoHeight, size.width, size.height);
    }
    return (_ctx, _cache) => {
      return openBlock(), createBlock(Teleport, { to: "body" }, [
        unref(isPipModalOpen) ? (openBlock(), createElementBlock("div", _hoisted_1$b, [
          createBaseVNode("section", _hoisted_2$b, [
            createBaseVNode("header", _hoisted_3$9, [
              _cache[16] || (_cache[16] = createBaseVNode("div", null, [
                createBaseVNode("h2", { id: "pip-modal-title" }, "画中画配置"),
                createBaseVNode("p", { class: "pip-modal-subtitle" }, "勾选字幕段后，上传或生成的画中画会同时绑定到所选字幕")
              ], -1)),
              createBaseVNode("button", {
                class: "icon-button",
                type: "button",
                "aria-label": "关闭画中画",
                onClick: _cache[0] || (_cache[0] = //@ts-ignore
                (...args) => unref(closePipModal) && unref(closePipModal)(...args))
              }, "×")
            ]),
            createBaseVNode("div", _hoisted_4$7, [
              createBaseVNode("section", _hoisted_5$6, [
                createBaseVNode("div", _hoisted_6$6, [
                  _cache[17] || (_cache[17] = createBaseVNode("h3", null, "字幕列表", -1)),
                  __props.subtitleRows.length ? (openBlock(), createElementBlock("button", {
                    key: 0,
                    type: "button",
                    class: "pip-subtitle-toggle-all",
                    onClick: handleSelectAllSubtitles
                  }, toDisplayString(allSubtitleSelected.value ? "取消全选" : "全选"), 1)) : createCommentVNode("", true)
                ]),
                _cache[18] || (_cache[18] = createBaseVNode("p", { class: "pip-subtitle-tip" }, [
                  createBaseVNode("span", null, "勾选多段可让它们共享同一份画中画素材")
                ], -1)),
                __props.subtitleRows.length ? (openBlock(), createElementBlock("div", _hoisted_7$5, [
                  (openBlock(true), createElementBlock(Fragment, null, renderList(__props.subtitleRows, (row) => {
                    return openBlock(), createElementBlock("article", {
                      key: row.id,
                      class: normalizeClass(["pip-subtitle-row", { "is-active": isSubtitleSelected(row.id) }]),
                      onClick: ($event) => handleSubtitleClick(row, $event)
                    }, [
                      createBaseVNode("input", {
                        type: "checkbox",
                        class: "pip-subtitle-checkbox",
                        checked: isSubtitleSelected(row.id),
                        "aria-label": `选择字幕：${row.text}`,
                        onClick: _cache[1] || (_cache[1] = withModifiers(() => {
                        }, ["stop"])),
                        onChange: ($event) => handleSubtitleCheckboxChange(row, $event)
                      }, null, 40, _hoisted_9$5),
                      createBaseVNode("div", _hoisted_10$6, [
                        createBaseVNode("span", _hoisted_11$5, toDisplayString(row.timeRange), 1),
                        createBaseVNode("span", _hoisted_12$5, toDisplayString(row.text), 1)
                      ]),
                      getSubtitleAssetCount(row.id) > 0 ? (openBlock(), createElementBlock("span", {
                        key: 0,
                        class: "pip-subtitle-asset-badge",
                        title: `已配置 ${getSubtitleAssetCount(row.id)} 个画中画素材`
                      }, toDisplayString(getSubtitleAssetCount(row.id)), 9, _hoisted_13$4)) : createCommentVNode("", true)
                    ], 10, _hoisted_8$5);
                  }), 128))
                ])) : (openBlock(), createElementBlock("div", _hoisted_14$4, "暂无字幕，请先在第五步完成识别"))
              ]),
              createBaseVNode("section", _hoisted_15$4, [
                createBaseVNode("div", _hoisted_16$3, [
                  createBaseVNode("label", {
                    class: normalizeClass(["pip-tool-button", { "is-disabled": unref(editingSubtitleIds).length === 0 }])
                  }, [
                    createBaseVNode("input", {
                      type: "file",
                      accept: "image/*",
                      onChange: _cache[2] || (_cache[2] = ($event) => handleUpload($event))
                    }, null, 32),
                    createVNode(unref(picture_default)),
                    _cache[19] || (_cache[19] = createBaseVNode("span", null, "上传图片", -1))
                  ], 2),
                  createBaseVNode("span", _hoisted_17$2, " 当前已选 " + toDisplayString(unref(editingSubtitleIds).length) + " 段字幕 ", 1)
                ]),
                createBaseVNode("div", _hoisted_18$2, [
                  createBaseVNode("div", {
                    ref_key: "editorCanvasRef",
                    ref: editorCanvasRef,
                    class: "pip-editor-canvas"
                  }, [
                    __props.videoSrc ? (openBlock(), createElementBlock("video", {
                      key: 0,
                      class: "pip-editor-base-video",
                      src: __props.videoSrc,
                      muted: "",
                      playsinline: ""
                    }, null, 8, _hoisted_19$2)) : createCommentVNode("", true),
                    (openBlock(true), createElementBlock(Fragment, null, renderList(unref(editingAssets), (asset) => {
                      return openBlock(), createElementBlock("div", {
                        key: asset.id,
                        class: normalizeClass(["pip-asset-frame", { "is-selected": asset.id === unref(selectedAssetId) }]),
                        style: normalizeStyle({
                          left: `${asset.region.x}%`,
                          top: `${asset.region.y}%`,
                          width: `${asset.region.width}%`,
                          height: `${asset.region.height}%`
                        }),
                        onMousedown: ($event) => startDrag($event, asset, "move")
                      }, [
                        asset.kind === "image" ? (openBlock(), createElementBlock("img", {
                          key: 0,
                          src: asset.url,
                          alt: "画中画图片",
                          draggable: "false",
                          onLoad: ($event) => handleAssetImageLoaded(asset, $event)
                        }, null, 40, _hoisted_21$2)) : (openBlock(), createElementBlock("video", {
                          key: 1,
                          class: "pip-asset-video",
                          src: asset.url,
                          muted: "",
                          playsinline: "",
                          onLoadedmetadata: ($event) => handleAssetVideoLoaded(asset, $event)
                        }, null, 40, _hoisted_22$2)),
                        createBaseVNode("button", {
                          type: "button",
                          class: "pip-asset-remove",
                          "aria-label": "移除画中画素材",
                          onClick: ($event) => handleRemove(asset, $event)
                        }, " × ", 8, _hoisted_23$2),
                        createBaseVNode("span", {
                          class: "pip-asset-resize-handle",
                          "aria-label": "调整画中画素材大小",
                          onMousedown: ($event) => startDrag($event, asset, "resize")
                        }, null, 40, _hoisted_24$2)
                      ], 46, _hoisted_20$2);
                    }), 128)),
                    subtitleForCanvas.value ? (openBlock(), createElementBlock("div", _hoisted_25$2, [
                      createBaseVNode("div", {
                        class: "pip-editor-subtitle-stroke",
                        style: normalizeStyle(subtitleStrokeStyle.value)
                      }, toDisplayString(subtitleForCanvas.value.text), 5),
                      createBaseVNode("div", {
                        class: "pip-editor-subtitle-fill",
                        style: normalizeStyle(subtitleFillStyle.value)
                      }, toDisplayString(subtitleForCanvas.value.text), 5)
                    ])) : createCommentVNode("", true)
                  ], 512),
                  unref(editingSubtitleIds).length === 0 ? (openBlock(), createElementBlock("div", _hoisted_26$2, " 请先在左侧勾选字幕段 ")) : createCommentVNode("", true)
                ])
              ]),
              createBaseVNode("section", _hoisted_27$2, [
                createBaseVNode("div", _hoisted_28$2, [
                  createBaseVNode("div", _hoisted_29$2, [
                    createBaseVNode("div", _hoisted_30$2, [
                      createBaseVNode("span", _hoisted_31$2, [
                        _cache[20] || (_cache[20] = createTextVNode(" AI 生图提示词 ", -1)),
                        createBaseVNode("button", {
                          type: "button",
                          class: "pip-ai-field-icon",
                          title: "查看 / 编辑提示词",
                          "aria-label": "查看 / 编辑图片提示词",
                          onClick: _cache[3] || (_cache[3] = ($event) => openExpandedPrompt("image"))
                        }, [
                          createVNode(unref(view_default))
                        ])
                      ]),
                      createBaseVNode("textarea", {
                        value: aiImagePrompt.value,
                        class: "pip-ai-input pip-ai-textarea",
                        placeholder: "输入提示词，AI 生成画中画图片",
                        rows: "5",
                        onInput: _cache[4] || (_cache[4] = ($event) => handlePromptInput("image", $event))
                      }, null, 40, _hoisted_32$2)
                    ]),
                    createBaseVNode("div", _hoisted_33$2, [
                      createBaseVNode("span", _hoisted_34$2, [
                        _cache[21] || (_cache[21] = createTextVNode(" 分辨率 ", -1)),
                        createBaseVNode("span", _hoisted_35$2, toDisplayString(unref(PIP_IMAGE_SIZE_MIN)) + "~" + toDisplayString(unref(PIP_IMAGE_SIZE_MAX)) + "px", 1)
                      ]),
                      createBaseVNode("div", _hoisted_36$2, [
                        createBaseVNode("label", _hoisted_37$2, [
                          _cache[22] || (_cache[22] = createBaseVNode("span", null, "宽", -1)),
                          createBaseVNode("input", {
                            type: "number",
                            class: "pip-ai-size-input",
                            min: unref(PIP_IMAGE_SIZE_MIN),
                            max: unref(PIP_IMAGE_SIZE_MAX),
                            step: "64",
                            value: aiImageWidth.value,
                            "aria-label": "生成图片宽度",
                            onChange: _cache[5] || (_cache[5] = ($event) => handleImageSizeInput("width", $event))
                          }, null, 40, _hoisted_38$2),
                          _cache[23] || (_cache[23] = createBaseVNode("span", { class: "pip-ai-size-unit" }, "px", -1))
                        ]),
                        createBaseVNode("label", _hoisted_39$2, [
                          _cache[24] || (_cache[24] = createBaseVNode("span", null, "高", -1)),
                          createBaseVNode("input", {
                            type: "number",
                            class: "pip-ai-size-input",
                            min: unref(PIP_IMAGE_SIZE_MIN),
                            max: unref(PIP_IMAGE_SIZE_MAX),
                            step: "64",
                            value: aiImageHeight.value,
                            "aria-label": "生成图片高度",
                            onChange: _cache[6] || (_cache[6] = ($event) => handleImageSizeInput("height", $event))
                          }, null, 40, _hoisted_40$2),
                          _cache[25] || (_cache[25] = createBaseVNode("span", { class: "pip-ai-size-unit" }, "px", -1))
                        ])
                      ])
                    ]),
                    createBaseVNode("div", _hoisted_41$2, [
                      createBaseVNode("button", {
                        class: "primary-button pip-ai-generate",
                        type: "button",
                        disabled: unref(isGeneratingImage),
                        onClick: handleGenerateImage
                      }, [
                        createVNode(unref(ElIcon), { class: "pip-btn-icon" }, {
                          default: withCtx(() => [
                            createVNode(unref(magic_stick_default))
                          ]),
                          _: 1
                        }),
                        createTextVNode(" " + toDisplayString(unref(isGeneratingImage) ? "生成中..." : "AI 生图"), 1)
                      ], 8, _hoisted_42$2),
                      createBaseVNode("button", {
                        type: "button",
                        class: "pip-ai-section-config",
                        title: "文生图模型配置",
                        "aria-label": "文生图模型配置",
                        onClick: _cache[7] || (_cache[7] = ($event) => unref(openPipModelConfig)("image"))
                      }, [
                        createVNode(unref(setting_default)),
                        _cache[26] || (_cache[26] = createTextVNode(" 模型配置 ", -1))
                      ])
                    ])
                  ])
                ]),
                _cache[28] || (_cache[28] = createBaseVNode("div", {
                  class: "pip-ai-divider",
                  "aria-hidden": "true"
                }, null, -1)),
                createBaseVNode("div", _hoisted_43$2, [
                  _cache[27] || (_cache[27] = createBaseVNode("div", { class: "pip-history-head" }, [
                    createBaseVNode("span", { class: "pip-history-title" }, "历史素材"),
                    createBaseVNode("span", { class: "pip-history-tip" }, "点击复用，悬停可删除")
                  ], -1)),
                  unref(historyEntries).length ? (openBlock(), createElementBlock("div", _hoisted_44$2, [
                    (openBlock(true), createElementBlock(Fragment, null, renderList(unref(historyEntries), (entry) => {
                      return openBlock(), createElementBlock("article", {
                        key: entry.id,
                        class: "pip-history-item",
                        title: entry.prompt || entry.fileName,
                        onClick: ($event) => reuseHistory(entry)
                      }, [
                        entry.kind === "image" ? (openBlock(), createElementBlock("img", {
                          key: 0,
                          class: "pip-history-thumb",
                          src: entry.url,
                          alt: entry.fileName
                        }, null, 8, _hoisted_46$2)) : (openBlock(), createElementBlock("video", {
                          key: 1,
                          class: "pip-history-thumb",
                          src: entry.url,
                          muted: "",
                          preload: "metadata"
                        }, null, 8, _hoisted_47$1)),
                        createBaseVNode("span", _hoisted_48$1, [
                          createBaseVNode("span", _hoisted_49$1, toDisplayString(entry.kind === "image" ? "图片" : "视频") + "·" + toDisplayString(entry.origin === "ai" ? "AI" : "上传"), 1),
                          createBaseVNode("span", _hoisted_50$1, toDisplayString(formatHistoryTime(entry.createdAt)), 1)
                        ]),
                        createBaseVNode("button", {
                          type: "button",
                          class: "pip-history-remove",
                          "aria-label": "删除该历史素材",
                          onClick: ($event) => deleteHistory(entry.id, $event)
                        }, " × ", 8, _hoisted_51$1)
                      ], 8, _hoisted_45$2);
                    }), 128))
                  ])) : (openBlock(), createElementBlock("div", _hoisted_52$1, "暂无历史素材"))
                ])
              ])
            ])
          ])
        ])) : createCommentVNode("", true),
        unref(isPipModelConfigOpen) ? (openBlock(), createElementBlock("div", _hoisted_53, [
          createBaseVNode("section", _hoisted_54$1, [
            createBaseVNode("header", _hoisted_55$1, [
              _cache[29] || (_cache[29] = createBaseVNode("h2", null, "文生图模型配置", -1)),
              createBaseVNode("button", {
                class: "icon-button",
                type: "button",
                "aria-label": "关闭画中画模型配置",
                onClick: _cache[8] || (_cache[8] = //@ts-ignore
                (...args) => unref(closePipModelConfig) && unref(closePipModelConfig)(...args))
              }, " × ")
            ]),
            unref(pipModelConfigKind) === "image" ? (openBlock(), createElementBlock("div", _hoisted_56$1, [
              createBaseVNode("label", _hoisted_57$1, [
                _cache[30] || (_cache[30] = createBaseVNode("span", null, "模型方", -1)),
                withDirectives(createBaseVNode("select", {
                  "onUpdate:modelValue": _cache[9] || (_cache[9] = ($event) => unref(modelConfig).imageProvider = $event)
                }, [
                  (openBlock(true), createElementBlock(Fragment, null, renderList(unref(PIP_IMAGE_MODEL_OPTIONS), (option) => {
                    return openBlock(), createElementBlock("option", {
                      key: option.id,
                      value: option.id
                    }, toDisplayString(option.label) + "（在线模型） ", 9, _hoisted_58$1);
                  }), 128))
                ], 512), [
                  [vModelSelect, unref(modelConfig).imageProvider]
                ])
              ]),
              unref(modelConfig).imageProvider === "moark" ? (openBlock(), createElementBlock("p", _hoisted_59$1, [..._cache[31] || (_cache[31] = [
                createTextVNode(" 前往 ", -1),
                createBaseVNode("a", {
                  href: "https://moark.com/",
                  target: "_blank",
                  rel: "noreferrer"
                }, "https://moark.com/", -1),
                createTextVNode(" 注册账号，", -1),
                createBaseVNode("strong", { class: "highlight-red" }, "每天赠送 100次", -1),
                createTextVNode(" 免费调用机会。 ", -1)
              ])])) : unref(modelConfig).imageProvider === "aliyun-dashscope" ? (openBlock(), createElementBlock("p", _hoisted_60$1, [..._cache[32] || (_cache[32] = [
                createTextVNode(" 前往 ", -1),
                createBaseVNode("a", {
                  href: "https://bailian.console.aliyun.com/",
                  target: "_blank",
                  rel: "noreferrer"
                }, "阿里云百炼", -1),
                createTextVNode(" 注册账号，赠送 100 次生图额度，不花钱白嫖。 ", -1)
              ])])) : createCommentVNode("", true),
              createBaseVNode("label", _hoisted_61$1, [
                _cache[33] || (_cache[33] = createBaseVNode("span", null, "API Key", -1)),
                withDirectives(createBaseVNode("input", {
                  "onUpdate:modelValue": _cache[10] || (_cache[10] = ($event) => unref(modelConfig).imageApiKey = $event),
                  type: "text",
                  placeholder: "请输入 API Key"
                }, null, 512), [
                  [vModelText, unref(modelConfig).imageApiKey]
                ])
              ]),
              createBaseVNode("label", _hoisted_62$1, [
                _cache[34] || (_cache[34] = createBaseVNode("span", null, "模型名称", -1)),
                withDirectives(createBaseVNode("select", {
                  "onUpdate:modelValue": _cache[11] || (_cache[11] = ($event) => unref(modelConfig).imageModelName = $event)
                }, [
                  (openBlock(true), createElementBlock(Fragment, null, renderList(availableImageModelNames.value, (modelName) => {
                    return openBlock(), createElementBlock("option", {
                      key: modelName,
                      value: modelName
                    }, toDisplayString(modelName), 9, _hoisted_63$1);
                  }), 128))
                ], 512), [
                  [vModelSelect, unref(modelConfig).imageModelName]
                ])
              ])
            ])) : createCommentVNode("", true),
            createBaseVNode("footer", _hoisted_64$1, [
              createBaseVNode("button", {
                class: "secondary-button",
                type: "button",
                onClick: _cache[12] || (_cache[12] = //@ts-ignore
                (...args) => unref(closePipModelConfig) && unref(closePipModelConfig)(...args))
              }, "取消"),
              createBaseVNode("button", {
                class: "primary-button",
                type: "button",
                onClick: handleSaveModelConfig
              }, "保存配置")
            ])
          ])
        ])) : createCommentVNode("", true),
        expandedPromptKind.value ? (openBlock(), createElementBlock("div", _hoisted_65$1, [
          createBaseVNode("section", _hoisted_66$1, [
            createBaseVNode("header", { class: "modal-header" }, [
              _cache[35] || (_cache[35] = createBaseVNode("div", null, [
                createBaseVNode("h2", null, "查看 / 编辑图片提示词"),
                createBaseVNode("p", { class: "pip-modal-subtitle" }, "直接在下方修改提示词；点击「恢复默认」可一键还原为系统模板")
              ], -1)),
              createBaseVNode("button", {
                class: "icon-button",
                type: "button",
                "aria-label": "关闭",
                onClick: closeExpandedPrompt
              }, "×")
            ]),
            createBaseVNode("div", _hoisted_67$1, [
              createBaseVNode("section", _hoisted_68$1, [
                createBaseVNode("div", _hoisted_69$1, [
                  _cache[36] || (_cache[36] = createBaseVNode("span", { class: "pip-prompt-edit-label" }, "提示词", -1)),
                  createBaseVNode("button", {
                    type: "button",
                    class: "pip-prompt-reset",
                    onClick: _cache[13] || (_cache[13] = ($event) => resetPromptToDefault(expandedPromptKind.value))
                  }, " 恢复默认 ")
                ]),
                expandedPromptKind.value === "image" ? withDirectives((openBlock(), createElementBlock("textarea", {
                  key: 0,
                  "onUpdate:modelValue": _cache[14] || (_cache[14] = ($event) => aiImagePrompt.value = $event),
                  class: "pip-prompt-modal-textarea",
                  placeholder: "输入提示词，AI 生成画中画图片",
                  onInput: _cache[15] || (_cache[15] = ($event) => userEditedImagePrompt.value = aiImagePrompt.value.length > 0)
                }, null, 544)), [
                  [vModelText, aiImagePrompt.value]
                ]) : createCommentVNode("", true)
              ])
            ]),
            createBaseVNode("footer", { class: "modal-actions" }, [
              createBaseVNode("button", {
                class: "secondary-button",
                type: "button",
                onClick: closeExpandedPrompt
              }, "关闭"),
              createBaseVNode("button", {
                class: "primary-button",
                type: "button",
                onClick: closeExpandedPrompt
              }, "完成")
            ])
          ])
        ])) : createCommentVNode("", true)
      ]);
    };
  }
});
const PictureInPictureModal = /* @__PURE__ */ _export_sfc(_sfc_main$b, [["__scopeId", "data-v-5d1c084c"]]);
const _hoisted_1$a = { class: "sc-config-form" };
const _hoisted_2$a = { class: "config-field" };
const _hoisted_3$8 = { class: "config-field" };
const _hoisted_4$6 = ["value"];
const _sfc_main$a = /* @__PURE__ */ defineComponent({
  __name: "SubtitleSourceCodeConfigForm",
  setup(__props) {
    const { sourcecodeSubtitleApiKey, sourcecodeSubtitleModelName } = useSubtitleRecognition();
    const modelOptions = [
      { value: "whisper-large", label: "whisper-large（默认）" },
      { value: "whisper-large-v3-turbo", label: "whisper-large-v3-turbo" },
      { value: "whisper-large-v3", label: "whisper-large-v3" },
      { value: "whisper-base", label: "whisper-base" }
    ];
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", _hoisted_1$a, [
        _cache[4] || (_cache[4] = createBaseVNode("p", { class: "config-tip" }, [
          createTextVNode(" 前往 "),
          createBaseVNode("a", {
            href: "https://moark.com/",
            target: "_blank",
            rel: "noreferrer"
          }, "https://moark.com/"),
          createTextVNode(" 注册账号，"),
          createBaseVNode("strong", { class: "highlight-red" }, "每天赠送 100次"),
          createTextVNode(" 免费调用机会。 ")
        ], -1)),
        createBaseVNode("label", _hoisted_2$a, [
          _cache[2] || (_cache[2] = createBaseVNode("span", null, "API KEY", -1)),
          withDirectives(createBaseVNode("input", {
            "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => /* @__PURE__ */ isRef(sourcecodeSubtitleApiKey) ? sourcecodeSubtitleApiKey.value = $event : null),
            type: "text",
            placeholder: "请输入您的 API KEY"
          }, null, 512), [
            [vModelText, unref(sourcecodeSubtitleApiKey)]
          ])
        ]),
        createBaseVNode("label", _hoisted_3$8, [
          _cache[3] || (_cache[3] = createBaseVNode("span", null, "识别模型", -1)),
          withDirectives(createBaseVNode("select", {
            "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => /* @__PURE__ */ isRef(sourcecodeSubtitleModelName) ? sourcecodeSubtitleModelName.value = $event : null)
          }, [
            (openBlock(), createElementBlock(Fragment, null, renderList(modelOptions, (opt) => {
              return createBaseVNode("option", {
                key: opt.value,
                value: opt.value
              }, toDisplayString(opt.label), 9, _hoisted_4$6);
            }), 64))
          ], 512), [
            [vModelSelect, unref(sourcecodeSubtitleModelName)]
          ])
        ])
      ]);
    };
  }
});
const SubtitleSourceCodeConfigForm = /* @__PURE__ */ _export_sfc(_sfc_main$a, [["__scopeId", "data-v-1a4d8345"]]);
const SUBTITLE_STYLE_PRESETS = [
  {
    id: "plain-white",
    label: "白色无描边",
    fontId: "msyh",
    fontSize: 10,
    color: "#ffffff",
    strokeSize: 0,
    strokeColor: "#000000"
  },
  {
    id: "white-black-stroke",
    label: "白字黑描边",
    fontId: "msyh",
    fontSize: 10,
    color: "#ffffff",
    strokeSize: 0.2,
    strokeColor: "#000000"
  },
  {
    id: "black-white-stroke",
    label: "黑字白描边",
    fontId: "msyh",
    fontSize: 10,
    color: "#000000",
    strokeSize: 0.2,
    strokeColor: "#ffffff"
  },
  {
    id: "yellow-black-stroke",
    label: "黄字黑描边",
    fontId: "msyh",
    fontSize: 10,
    color: "#ffde00",
    strokeSize: 0.5,
    strokeColor: "#000000"
  },
  {
    id: "yellow-only",
    label: "黄字无描边",
    fontId: "msyh",
    fontSize: 10,
    color: "#ffde00",
    strokeSize: 0,
    strokeColor: "#000000"
  },
  {
    id: "red-black-stroke",
    label: "红字黑描边",
    fontId: "msyh",
    fontSize: 10,
    color: "#ff3b30",
    strokeSize: 0.5,
    strokeColor: "#000000"
  },
  {
    id: "cyan-black-stroke",
    label: "青字黑描边",
    fontId: "msyh",
    fontSize: 10,
    color: "#00e0ff",
    strokeSize: 0.5,
    strokeColor: "#000000"
  },
  {
    id: "green-black-stroke",
    label: "绿字黑描边",
    fontId: "msyh",
    fontSize: 10,
    color: "#22c55e",
    strokeSize: 0.5,
    strokeColor: "#000000"
  }
];
const _hoisted_1$9 = { class: "feature-column" };
const _hoisted_2$9 = { class: "column-body subtitle-tool" };
const _hoisted_3$7 = { class: "tool-field audio-url-field" };
const _hoisted_4$5 = { class: "audio-url-label" };
const _hoisted_5$5 = { class: "audio-url-mode" };
const _hoisted_6$5 = { class: "audio-url-mode-text" };
const _hoisted_7$4 = {
  key: 0,
  class: "url-input-row"
};
const _hoisted_8$4 = ["disabled"];
const _hoisted_9$4 = ["value"];
const _hoisted_10$5 = { class: "tool-field audio-url-field" };
const _hoisted_11$4 = { class: "audio-url-label" };
const _hoisted_12$4 = { class: "audio-url-mode" };
const _hoisted_13$3 = { class: "audio-url-mode-text" };
const _hoisted_14$3 = {
  key: 0,
  class: "url-input-row"
};
const _hoisted_15$3 = ["value"];
const _hoisted_16$2 = { class: "tool-actions" };
const _hoisted_17$1 = ["disabled"];
const _hoisted_18$1 = ["disabled"];
const _hoisted_19$1 = { class: "subtitle-meta-row" };
const _hoisted_20$1 = { class: "task-status" };
const _hoisted_21$1 = {
  class: "elapsed-badge",
  "aria-label": "字幕识别耗时"
};
const _hoisted_22$1 = {
  class: "subtitle-list-panel",
  "aria-label": "字幕可编辑列表"
};
const _hoisted_23$1 = { class: "subtitle-list-frame" };
const _hoisted_24$1 = {
  key: 0,
  class: "subtitle-list"
};
const _hoisted_25$1 = { class: "subtitle-time" };
const _hoisted_26$1 = ["value", "onInput"];
const _hoisted_27$1 = {
  key: 1,
  class: "empty-subtitle-list"
};
const _hoisted_28$1 = ["title", "disabled"];
const _hoisted_29$1 = {
  class: "subtitle-style-summary",
  "aria-label": "当前字幕样式"
};
const _hoisted_30$1 = { class: "subtitle-style-summary-label" };
const _hoisted_31$1 = { class: "subtitle-style-summary-value" };
const _hoisted_32$1 = ["aria-label"];
const _hoisted_33$1 = {
  key: 1,
  class: "subtitle-style-summary-text"
};
const _hoisted_34$1 = ["title", "disabled"];
const _hoisted_35$1 = {
  class: "subtitle-style-summary subtitle-pip-summary",
  "aria-label": "画中画概览"
};
const _hoisted_36$1 = { class: "subtitle-style-summary-row" };
const _hoisted_37$1 = { class: "subtitle-style-summary-value" };
const _hoisted_38$1 = { class: "subtitle-style-summary-text" };
const _hoisted_39$1 = { class: "subtitle-style-summary-row" };
const _hoisted_40$1 = { class: "subtitle-style-summary-value" };
const _hoisted_41$1 = { class: "subtitle-style-summary-text" };
const _hoisted_42$1 = { class: "subtitle-style-summary-row" };
const _hoisted_43$1 = { class: "subtitle-style-summary-value" };
const _hoisted_44$1 = { class: "subtitle-style-summary-text" };
const _hoisted_45$1 = { class: "subtitle-style-summary-row" };
const _hoisted_46$1 = { class: "subtitle-style-summary-value" };
const _hoisted_47 = { class: "subtitle-style-summary-text" };
const _hoisted_48 = {
  key: 0,
  class: "modal-backdrop"
};
const _hoisted_49 = {
  class: "config-modal",
  role: "dialog",
  "aria-modal": "true",
  "aria-labelledby": "subtitle-config-title"
};
const _hoisted_50 = { class: "modal-header" };
const _hoisted_51 = { class: "config-modal-body" };
const _hoisted_52 = { class: "provider-select-field" };
const _hoisted_54 = { class: "modal-actions" };
const _hoisted_55 = ["disabled"];
const _hoisted_56 = ["disabled"];
const _hoisted_57 = {
  key: 1,
  class: "modal-backdrop"
};
const _hoisted_58 = {
  class: "style-modal",
  role: "dialog",
  "aria-modal": "true",
  "aria-labelledby": "subtitle-style-title"
};
const _hoisted_59 = { class: "style-modal-body" };
const _hoisted_60 = { class: "style-modal-config" };
const _hoisted_61 = { class: "style-panel" };
const _hoisted_62 = { class: "style-field style-field-inline style-preset-field" };
const _hoisted_63 = {
  class: "style-preset-row",
  role: "radiogroup",
  "aria-label": "字幕样式预设"
};
const _hoisted_64 = ["aria-checked", "title", "onClick"];
const _hoisted_65 = ["stroke-width", "stroke", "fill"];
const _hoisted_66 = { class: "style-field style-field-inline" };
const _hoisted_67 = ["value"];
const _hoisted_68 = { class: "style-field style-field-inline" };
const _hoisted_69 = { class: "range-control" };
const _hoisted_70 = { class: "style-field style-field-inline" };
const _hoisted_71 = { class: "color-control" };
const _hoisted_72 = { class: "style-field style-field-inline" };
const _hoisted_73 = { class: "color-control" };
const _hoisted_74 = { class: "style-field style-field-inline" };
const _hoisted_75 = { class: "range-control" };
const _hoisted_76 = { class: "style-panel style-subtitle-list-panel" };
const _hoisted_77 = {
  key: 0,
  class: "style-subtitle-list"
};
const _hoisted_78 = { class: "subtitle-time" };
const _hoisted_79 = ["value", "onInput"];
const _hoisted_80 = {
  key: 1,
  class: "style-subtitle-empty"
};
const _hoisted_81 = { class: "style-modal-preview" };
const _hoisted_82 = { class: "style-preview-stage" };
const _hoisted_83 = { class: "preview-canvas" };
const _hoisted_84 = ["src"];
const subtitleActualFontSize = 10;
const subtitleStyleStorageKey = "ai-digital-avatar.subtitle-style";
const stylePresetChipFontSize = 28;
const previewFallbackSubtitleText = "预设字幕参考文字";
const _sfc_main$9 = /* @__PURE__ */ defineComponent({
  __name: "SubtitleRecognitionColumn",
  setup(__props) {
    const {
      activeProvider,
      audioInputMode,
      audioSourceUrl,
      closeConfig,
      effectiveVideoSourceUrl,
      isConfigOpen,
      isRecognizing,
      isSavingConfig,
      manualAudioUrl,
      manualVideoUrl,
      openConfig,
      saveConfig,
      sourcecodeSubtitleApiKey,
      startSubtitleRecognition,
      stopSubtitleRecognition,
      subtitleElapsedText,
      subtitleList,
      subtitleTaskStatus,
      updateSubtitleText,
      videoInputMode,
      videoSourceUrl,
      wavespeedSubtitleApiKey,
      wavespeedSubtitleModelName
    } = useSubtitleRecognition();
    const pendingProvider = /* @__PURE__ */ ref("sourcecode");
    watch(isConfigOpen, (open) => {
      if (open) {
        pendingProvider.value = activeProvider.value === "wavespeed" ? "sourcecode" : activeProvider.value;
      }
    });
    async function saveConfigAndSwitchProvider() {
      if (pendingProvider.value === "wavespeed") {
        if (!wavespeedSubtitleApiKey.value.trim()) {
          ElMessage.warning("请填写 WaveSpeed API KEY");
          return;
        }
      } else {
        if (!sourcecodeSubtitleApiKey.value.trim()) {
          ElMessage.warning("请先填写模力方舟的 API KEY");
          return;
        }
      }
      if (pendingProvider.value !== activeProvider.value) {
        activeProvider.value = pendingProvider.value;
      }
      await saveConfig();
    }
    const previewVideoSrc = computed(() => effectiveVideoSourceUrl.value);
    function formatSubtitleTime(value) {
      if (!Number.isFinite(value)) {
        return "00:00";
      }
      const normalizedValue = Math.max(0, value);
      const [integerPart, decimalPart = ""] = String(normalizedValue).split(".");
      const leftPart = integerPart.padStart(2, "0");
      const rightPart = decimalPart.padEnd(2, "0").slice(0, 2);
      return `${leftPart}:${rightPart}`;
    }
    const subtitleRows = computed(
      () => subtitleList.value.map((item) => ({
        id: item.id,
        text: item.text,
        timeRange: `${formatSubtitleTime(item.start)} - ${formatSubtitleTime(item.end)}`
      }))
    );
    const fontOptions = SUBTITLE_FONT_OPTIONS;
    const subtitleFontSize = /* @__PURE__ */ ref(subtitleActualFontSize);
    const subtitleColor = /* @__PURE__ */ ref("#ffffff");
    const subtitleStrokeSize = /* @__PURE__ */ ref(1);
    const subtitleStrokeColor = /* @__PURE__ */ ref("#000000");
    const selectedFontId = /* @__PURE__ */ ref(DEFAULT_SUBTITLE_FONT_ID);
    const isStyleModalOpen = /* @__PURE__ */ ref(false);
    const selectedFont = computed(
      () => getSubtitleFontOption(selectedFontId.value)
    );
    const stylePresets = SUBTITLE_STYLE_PRESETS;
    const activeStylePresetId = computed(() => {
      const matched = stylePresets.find(
        (preset) => preset.fontId === selectedFontId.value && preset.fontSize === subtitleFontSize.value && preset.color.toLowerCase() === subtitleColor.value.toLowerCase() && preset.strokeSize === subtitleStrokeSize.value && preset.strokeColor.toLowerCase() === subtitleStrokeColor.value.toLowerCase()
      );
      return matched?.id ?? "";
    });
    function applyStylePreset(preset) {
      selectedFontId.value = preset.fontId;
      subtitleFontSize.value = preset.fontSize;
      subtitleColor.value = preset.color;
      subtitleStrokeSize.value = preset.strokeSize;
      subtitleStrokeColor.value = preset.strokeColor;
    }
    const subtitleStyleSummaryRows = computed(() => {
      const rows = [];
      rows.push({ label: "字体", text: selectedFont.value.label });
      rows.push({ label: "字号", text: `${subtitleFontSize.value}px` });
      rows.push({ label: "字色", colors: [subtitleColor.value] });
      if (subtitleStrokeSize.value > 0) {
        rows.push({
          label: "描边",
          text: `${subtitleStrokeSize.value.toFixed(1)}px`,
          colors: [subtitleStrokeColor.value]
        });
      } else {
        rows.push({ label: "描边", text: "无" });
      }
      return rows;
    });
    const { assets: pipAssets, openPipModal } = usePictureInPicture();
    const hasRecognizedSubtitles = computed(() => subtitleRows.value.length > 0);
    const isUploadingAudio = /* @__PURE__ */ ref(false);
    async function handleAudioFileSelect() {
      const filePath = await window.desktopApi.selectAudioFile();
      if (!filePath) {
        return;
      }
      manualAudioUrl.value = filePath;
      isUploadingAudio.value = true;
      try {
        const result = await window.desktopApi.uploadAudioFile(filePath);
        if (result?.downloadUrl) {
          manualAudioUrl.value = result.downloadUrl;
          ElMessage.success("音频上传成功");
        } else {
          ElMessage.warning(
            "音频上传失败，输入框已填入本地路径，请确认 WaveSpeed 配置"
          );
        }
      } catch (error) {
        ElMessage.error(error instanceof Error ? error.message : "音频上传失败");
      } finally {
        isUploadingAudio.value = false;
      }
    }
    async function handleVideoFileSelect() {
      const filePath = await window.desktopApi.selectVideoFile();
      if (!filePath) {
        return;
      }
      manualVideoUrl.value = filePath;
      ElMessage.success("视频文件已选择");
    }
    function ensureSubtitlesReady() {
      if (!hasRecognizedSubtitles.value) {
        ElMessage.warning("请先进行字幕识别");
        return false;
      }
      return true;
    }
    function handleOpenStyleModal() {
      if (!ensureSubtitlesReady()) {
        return;
      }
      openStyleModal();
    }
    function handleOpenPipModal() {
      if (!ensureSubtitlesReady()) {
        return;
      }
      openPipModal(activeSubtitleId.value);
    }
    const pipSubtitleStyleSnapshot = computed(() => ({
      fontId: selectedFontId.value,
      fontSize: subtitleFontSize.value,
      color: subtitleColor.value,
      strokeSize: subtitleStrokeSize.value,
      strokeColor: subtitleStrokeColor.value
    }));
    const pipImageCount = computed(
      () => pipAssets.value.filter((asset) => asset.kind === "image").length
    );
    const pipVideoCount = computed(
      () => pipAssets.value.filter((asset) => asset.kind === "video").length
    );
    const pipCoveredSubtitleCount = computed(() => {
      const subtitleIds = /* @__PURE__ */ new Set();
      pipAssets.value.forEach((asset) => {
        asset.subtitleIds.forEach((id) => {
          subtitleIds.add(id);
        });
      });
      return subtitleIds.size;
    });
    function getStylePresetChipStyle(preset) {
      if (preset.strokeSize <= 0) {
        return {
          fill: preset.color,
          stroke: "none",
          strokeWidth: 0
        };
      }
      const scaleRatio = stylePresetChipFontSize / preset.fontSize;
      return {
        fill: preset.color,
        stroke: preset.strokeColor,
        strokeWidth: preset.strokeSize * scaleRatio
      };
    }
    const previewCurrentTime = /* @__PURE__ */ ref(0);
    const previewVideoRef = /* @__PURE__ */ ref(null);
    const previewSubtitleText = computed(() => {
      const time = previewCurrentTime.value;
      const matched = subtitleList.value.find(
        (item) => time >= item.start && time <= item.end
      );
      if (matched) {
        return matched.text;
      }
      return previewFallbackSubtitleText;
    });
    const activeSubtitleId = computed(() => {
      const time = previewCurrentTime.value;
      return subtitleList.value.find((item) => time >= item.start && time <= item.end)?.id ?? "";
    });
    const previewSubtitleBaseStyle = computed(() => ({
      fontFamily: `'${selectedFont.value.fontFamily}', sans-serif`,
      fontSize: `${subtitleFontSize.value}px`,
      // 保留字幕中的换行（\n），多行内容按用户编辑结果在预览里逐行展示
      whiteSpace: "pre-line"
    }));
    const previewSubtitleFillStyle = computed(() => ({
      ...previewSubtitleBaseStyle.value,
      color: subtitleColor.value,
      WebkitTextFillColor: subtitleColor.value,
      WebkitTextStrokeWidth: "0px"
    }));
    const previewSubtitleStrokeStyle = computed(() => ({
      ...previewSubtitleBaseStyle.value,
      color: "transparent",
      WebkitTextFillColor: "transparent",
      WebkitTextStrokeColor: subtitleStrokeColor.value,
      WebkitTextStrokeWidth: `${subtitleStrokeSize.value}px`
    }));
    function openStyleModal() {
      previewCurrentTime.value = 0;
      isStyleModalOpen.value = true;
      void nextTick(() => {
        applySubtitleAutosize();
      });
    }
    function autosizeSubtitleTextarea(textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
    function onSubtitleTextInput(id, event) {
      const textarea = event.target;
      autosizeSubtitleTextarea(textarea);
      updateSubtitleText(id, textarea.value);
    }
    function applySubtitleAutosize() {
      const textareas = document.querySelectorAll(
        ".subtitle-list .subtitle-text-input, .style-subtitle-list .subtitle-text-input"
      );
      textareas.forEach((textarea) => autosizeSubtitleTextarea(textarea));
    }
    function closeStyleModal() {
      if (previewVideoRef.value) {
        previewVideoRef.value.pause();
      }
      isStyleModalOpen.value = false;
    }
    function handlePreviewTimeUpdate(event) {
      const videoElement = event.target;
      if (videoElement) {
        previewCurrentTime.value = videoElement.currentTime;
      }
    }
    function handlePreviewSeeked(event) {
      const videoElement = event.target;
      if (videoElement) {
        previewCurrentTime.value = videoElement.currentTime;
      }
    }
    onMounted(() => {
      const storedConfig = window.localStorage.getItem(subtitleStyleStorageKey);
      if (storedConfig) {
        try {
          const parsedConfig = JSON.parse(storedConfig);
          if (typeof parsedConfig.fontSize === "number") {
            subtitleFontSize.value = parsedConfig.fontSize;
          }
          if (typeof parsedConfig.fontColor === "string") {
            subtitleColor.value = parsedConfig.fontColor;
          }
          if (typeof parsedConfig.fontId === "string") {
            selectedFontId.value = parsedConfig.fontId;
          } else if (typeof parsedConfig.fontName === "string") {
            const matched = SUBTITLE_FONT_OPTIONS.find(
              (option) => option.fontFamily === parsedConfig.fontName
            );
            if (matched) {
              selectedFontId.value = matched.id;
            }
          }
          if (typeof parsedConfig.strokeColor === "string") {
            subtitleStrokeColor.value = parsedConfig.strokeColor;
          }
          if (typeof parsedConfig.strokeSize === "number") {
            subtitleStrokeSize.value = Math.min(
              1,
              Math.max(0, parsedConfig.strokeSize)
            );
          }
        } catch {
          window.localStorage.removeItem(subtitleStyleStorageKey);
        }
      }
      if (!fontOptions.length || document.querySelector('style[data-subtitle-fonts="true"]')) {
        return;
      }
      const styleElement = document.createElement("style");
      styleElement.dataset.subtitleFonts = "true";
      styleElement.textContent = fontOptions.map(
        (font) => `
@font-face {
  font-family: '${font.fontFamily}';
  src: url('${font.url}');
  font-display: swap;
}`
      ).join("\n");
      document.head.appendChild(styleElement);
    });
    watch(
      [
        subtitleFontSize,
        subtitleColor,
        selectedFontId,
        subtitleStrokeSize,
        subtitleStrokeColor
      ],
      () => {
        window.localStorage.setItem(
          subtitleStyleStorageKey,
          JSON.stringify({
            fontColor: subtitleColor.value,
            fontId: selectedFontId.value,
            fontSize: subtitleFontSize.value,
            strokeColor: subtitleStrokeColor.value,
            strokeSize: subtitleStrokeSize.value
          })
        );
      },
      { deep: false }
    );
    watch(
      subtitleRows,
      () => {
        void nextTick(() => {
          applySubtitleAutosize();
        });
      },
      { deep: true }
    );
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("article", _hoisted_1$9, [
        createBaseVNode("div", _hoisted_2$9, [
          createVNode(unref(ElDivider), { class: "step-divider" }, {
            default: withCtx(() => [..._cache[15] || (_cache[15] = [
              createTextVNode("第五步：字幕识别", -1)
            ])]),
            _: 1
          }),
          createBaseVNode("label", _hoisted_3$7, [
            createBaseVNode("span", _hoisted_4$5, [
              _cache[16] || (_cache[16] = createTextVNode(" 音频文件 ", -1)),
              createBaseVNode("span", _hoisted_5$5, [
                createBaseVNode("span", _hoisted_6$5, toDisplayString(unref(audioInputMode) === "auto" ? "自动" : "手动"), 1),
                createVNode(unref(ElSwitch), {
                  "model-value": unref(audioInputMode) === "manual",
                  size: "small",
                  "inline-prompt": "",
                  "active-text": "手动",
                  "inactive-text": "自动",
                  "onUpdate:modelValue": _cache[0] || (_cache[0] = (val) => audioInputMode.value = val ? "manual" : "auto")
                }, null, 8, ["model-value"])
              ])
            ]),
            unref(audioInputMode) === "manual" ? (openBlock(), createElementBlock("div", _hoisted_7$4, [
              withDirectives(createBaseVNode("input", {
                "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => /* @__PURE__ */ isRef(manualAudioUrl) ? manualAudioUrl.value = $event : null),
                type: "text",
                placeholder: "请输入自定义 URL 或上传文件"
              }, null, 512), [
                [vModelText, unref(manualAudioUrl)]
              ]),
              createBaseVNode("button", {
                type: "button",
                class: normalizeClass(["url-file-button", { "is-loading": isUploadingAudio.value }]),
                disabled: isUploadingAudio.value,
                onClick: handleAudioFileSelect
              }, toDisplayString(isUploadingAudio.value ? "上传中" : "选择文件"), 11, _hoisted_8$4)
            ])) : (openBlock(), createElementBlock("input", {
              key: 1,
              value: unref(audioSourceUrl),
              type: "text",
              readonly: "",
              placeholder: "将自动读取上一步同步的音频地址"
            }, null, 8, _hoisted_9$4))
          ]),
          createBaseVNode("label", _hoisted_10$5, [
            createBaseVNode("span", _hoisted_11$4, [
              _cache[17] || (_cache[17] = createTextVNode(" 视频文件 ", -1)),
              createBaseVNode("span", _hoisted_12$4, [
                createBaseVNode("span", _hoisted_13$3, toDisplayString(unref(videoInputMode) === "auto" ? "自动" : "手动"), 1),
                createVNode(unref(ElSwitch), {
                  "model-value": unref(videoInputMode) === "manual",
                  size: "small",
                  "inline-prompt": "",
                  "active-text": "手动",
                  "inactive-text": "自动",
                  "onUpdate:modelValue": _cache[2] || (_cache[2] = (val) => videoInputMode.value = val ? "manual" : "auto")
                }, null, 8, ["model-value"])
              ])
            ]),
            unref(videoInputMode) === "manual" ? (openBlock(), createElementBlock("div", _hoisted_14$3, [
              withDirectives(createBaseVNode("input", {
                "onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => /* @__PURE__ */ isRef(manualVideoUrl) ? manualVideoUrl.value = $event : null),
                type: "text",
                placeholder: "请输入自定义 URL 或上传文件"
              }, null, 512), [
                [vModelText, unref(manualVideoUrl)]
              ]),
              createBaseVNode("button", {
                type: "button",
                class: "url-file-button",
                onClick: handleVideoFileSelect
              }, " 选择文件 ")
            ])) : (openBlock(), createElementBlock("input", {
              key: 1,
              value: unref(videoSourceUrl),
              type: "text",
              readonly: "",
              placeholder: "将自动读取视频对口型生成的视频地址"
            }, null, 8, _hoisted_15$3))
          ]),
          createBaseVNode("section", _hoisted_16$2, [
            createBaseVNode("button", {
              class: "primary-button",
              type: "button",
              disabled: unref(isRecognizing),
              onClick: _cache[4] || (_cache[4] = //@ts-ignore
              (...args) => unref(startSubtitleRecognition) && unref(startSubtitleRecognition)(...args))
            }, toDisplayString(unref(isRecognizing) ? "识别中..." : "字幕识别"), 9, _hoisted_17$1),
            createBaseVNode("button", {
              class: "secondary-button",
              type: "button",
              disabled: !unref(isRecognizing),
              onClick: _cache[5] || (_cache[5] = //@ts-ignore
              (...args) => unref(stopSubtitleRecognition) && unref(stopSubtitleRecognition)(...args))
            }, " 停止中断 ", 8, _hoisted_18$1),
            createBaseVNode("button", {
              class: "secondary-button model-config-button",
              type: "button",
              title: "模型配置",
              onClick: _cache[6] || (_cache[6] = //@ts-ignore
              (...args) => unref(openConfig) && unref(openConfig)(...args))
            }, [
              createVNode(unref(setting_default)),
              _cache[18] || (_cache[18] = createTextVNode(" 模型配置 ", -1))
            ])
          ]),
          createBaseVNode("div", _hoisted_19$1, [
            createBaseVNode("div", _hoisted_20$1, "状态：" + toDisplayString(unref(subtitleTaskStatus)), 1),
            createBaseVNode("span", _hoisted_21$1, [
              createVNode(unref(stopwatch_default), {
                class: "elapsed-icon",
                "aria-hidden": "true"
              }),
              createTextVNode(" " + toDisplayString(unref(subtitleElapsedText)), 1)
            ])
          ]),
          createBaseVNode("section", _hoisted_22$1, [
            createBaseVNode("div", _hoisted_23$1, [
              subtitleRows.value.length ? (openBlock(), createElementBlock("div", _hoisted_24$1, [
                (openBlock(true), createElementBlock(Fragment, null, renderList(subtitleRows.value, (row) => {
                  return openBlock(), createElementBlock("article", {
                    key: row.id,
                    class: "subtitle-row"
                  }, [
                    createBaseVNode("span", _hoisted_25$1, toDisplayString(row.timeRange), 1),
                    createBaseVNode("textarea", {
                      class: "subtitle-text-input",
                      value: row.text,
                      rows: "1",
                      onInput: ($event) => onSubtitleTextInput(row.id, $event)
                    }, null, 40, _hoisted_26$1)
                  ]);
                }), 128))
              ])) : (openBlock(), createElementBlock("div", _hoisted_27$1, [
                createVNode(unref(ElIcon), {
                  class: "empty-subtitle-icon",
                  "aria-hidden": "true"
                }, {
                  default: withCtx(() => [
                    createVNode(unref(tickets_default))
                  ]),
                  _: 1
                }),
                _cache[19] || (_cache[19] = createBaseVNode("span", null, "识别字幕预览", -1))
              ]))
            ])
          ]),
          createBaseVNode("div", {
            class: normalizeClass(["subtitle-style-entry", { "is-disabled": !hasRecognizedSubtitles.value }])
          }, [
            createBaseVNode("button", {
              class: "subtitle-style-icon-button",
              type: "button",
              "aria-label": "字幕样式",
              title: hasRecognizedSubtitles.value ? "字幕样式" : "请先进行字幕识别",
              disabled: !hasRecognizedSubtitles.value,
              onClick: handleOpenStyleModal
            }, [
              createVNode(unref(edit_pen_default)),
              _cache[20] || (_cache[20] = createBaseVNode("span", null, "字幕样式", -1))
            ], 8, _hoisted_28$1),
            createBaseVNode("div", _hoisted_29$1, [
              (openBlock(true), createElementBlock(Fragment, null, renderList(subtitleStyleSummaryRows.value, (row) => {
                return openBlock(), createElementBlock("div", {
                  key: row.label,
                  class: "subtitle-style-summary-row"
                }, [
                  createBaseVNode("span", _hoisted_30$1, toDisplayString(row.label), 1),
                  createBaseVNode("span", _hoisted_31$1, [
                    row.colors ? (openBlock(true), createElementBlock(Fragment, { key: 0 }, renderList(row.colors, (color) => {
                      return openBlock(), createElementBlock("span", {
                        key: color,
                        class: "subtitle-style-summary-color",
                        style: normalizeStyle({ backgroundColor: color }),
                        "aria-label": color
                      }, null, 12, _hoisted_32$1);
                    }), 128)) : createCommentVNode("", true),
                    row.text ? (openBlock(), createElementBlock("span", _hoisted_33$1, toDisplayString(row.text), 1)) : createCommentVNode("", true)
                  ])
                ]);
              }), 128))
            ])
          ], 2),
          createBaseVNode("div", {
            class: normalizeClass(["subtitle-style-entry", { "is-disabled": !hasRecognizedSubtitles.value }])
          }, [
            createBaseVNode("button", {
              class: "subtitle-style-icon-button",
              type: "button",
              "aria-label": "画中画",
              title: hasRecognizedSubtitles.value ? "画中画" : "请先进行字幕识别",
              disabled: !hasRecognizedSubtitles.value,
              onClick: handleOpenPipModal
            }, [
              createVNode(unref(picture_default)),
              _cache[21] || (_cache[21] = createBaseVNode("span", null, "画中画", -1))
            ], 8, _hoisted_34$1),
            createBaseVNode("div", _hoisted_35$1, [
              createBaseVNode("div", _hoisted_36$1, [
                _cache[22] || (_cache[22] = createBaseVNode("span", { class: "subtitle-style-summary-label" }, "总数", -1)),
                createBaseVNode("span", _hoisted_37$1, [
                  createBaseVNode("span", _hoisted_38$1, toDisplayString(unref(pipAssets).length) + " 个素材", 1)
                ])
              ]),
              createBaseVNode("div", _hoisted_39$1, [
                _cache[23] || (_cache[23] = createBaseVNode("span", { class: "subtitle-style-summary-label" }, "图片", -1)),
                createBaseVNode("span", _hoisted_40$1, [
                  createBaseVNode("span", _hoisted_41$1, toDisplayString(pipImageCount.value), 1)
                ])
              ]),
              createBaseVNode("div", _hoisted_42$1, [
                _cache[24] || (_cache[24] = createBaseVNode("span", { class: "subtitle-style-summary-label" }, "视频", -1)),
                createBaseVNode("span", _hoisted_43$1, [
                  createBaseVNode("span", _hoisted_44$1, toDisplayString(pipVideoCount.value), 1)
                ])
              ]),
              createBaseVNode("div", _hoisted_45$1, [
                _cache[25] || (_cache[25] = createBaseVNode("span", { class: "subtitle-style-summary-label" }, "字幕", -1)),
                createBaseVNode("span", _hoisted_46$1, [
                  createBaseVNode("span", _hoisted_47, "已覆盖 " + toDisplayString(pipCoveredSubtitleCount.value) + " / " + toDisplayString(subtitleRows.value.length) + " 段", 1)
                ])
              ])
            ])
          ], 2)
        ]),
        createVNode(PictureInPictureModal, {
          "video-src": previewVideoSrc.value,
          "subtitle-rows": subtitleRows.value,
          "subtitle-style": pipSubtitleStyleSnapshot.value,
          "initial-active-subtitle-id": activeSubtitleId.value
        }, null, 8, ["video-src", "subtitle-rows", "subtitle-style", "initial-active-subtitle-id"]),
        (openBlock(), createBlock(Teleport, { to: "body" }, [
          unref(isConfigOpen) ? (openBlock(), createElementBlock("div", _hoisted_48, [
            createBaseVNode("section", _hoisted_49, [
              createBaseVNode("header", _hoisted_50, [
                _cache[26] || (_cache[26] = createBaseVNode("h2", { id: "subtitle-config-title" }, "字幕识别模型配置", -1)),
                createBaseVNode("button", {
                  class: "icon-button",
                  type: "button",
                  "aria-label": "关闭字幕识别模型配置",
                  onClick: _cache[7] || (_cache[7] = //@ts-ignore
                  (...args) => unref(closeConfig) && unref(closeConfig)(...args))
                }, " × ")
              ]),
              createBaseVNode("div", _hoisted_51, [
                createBaseVNode("label", _hoisted_52, [
                  _cache[28] || (_cache[28] = createBaseVNode("span", null, "模型方", -1)),
                  withDirectives(createBaseVNode("select", {
                    "onUpdate:modelValue": _cache[8] || (_cache[8] = ($event) => pendingProvider.value = $event)
                  }, [
                    createCommentVNode("", true),
                    _cache[27] || (_cache[27] = createBaseVNode("option", { value: "sourcecode" }, "模力方舟（在线模型）", -1))
                  ], 512), [
                    [vModelSelect, pendingProvider.value]
                  ])
                ]),
                (openBlock(), createBlock(SubtitleSourceCodeConfigForm, { key: 1 }))
              ]),
              createBaseVNode("footer", _hoisted_54, [
                createBaseVNode("button", {
                  class: "secondary-button",
                  type: "button",
                  disabled: unref(isSavingConfig),
                  onClick: _cache[9] || (_cache[9] = //@ts-ignore
                  (...args) => unref(closeConfig) && unref(closeConfig)(...args))
                }, " 取消 ", 8, _hoisted_55),
                createBaseVNode("button", {
                  class: "primary-button",
                  type: "button",
                  disabled: unref(isSavingConfig),
                  onClick: saveConfigAndSwitchProvider
                }, toDisplayString(unref(isSavingConfig) ? "保存中..." : "保存配置"), 9, _hoisted_56)
              ])
            ])
          ])) : createCommentVNode("", true),
          isStyleModalOpen.value ? (openBlock(), createElementBlock("div", _hoisted_57, [
            createBaseVNode("section", _hoisted_58, [
              createBaseVNode("header", { class: "modal-header" }, [
                _cache[29] || (_cache[29] = createBaseVNode("div", null, [
                  createBaseVNode("h2", { id: "subtitle-style-title" }, "字幕样式配置"),
                  createBaseVNode("p", { class: "style-modal-subtitle" }, " 在放大预览中直接调整字体、颜色和描边效果 ")
                ], -1)),
                createBaseVNode("button", {
                  class: "icon-button",
                  type: "button",
                  "aria-label": "关闭字幕样式配置",
                  onClick: closeStyleModal
                }, " × ")
              ]),
              createBaseVNode("div", _hoisted_59, [
                createBaseVNode("section", _hoisted_60, [
                  createBaseVNode("div", _hoisted_61, [
                    createBaseVNode("label", _hoisted_62, [
                      _cache[31] || (_cache[31] = createBaseVNode("span", null, "预设", -1)),
                      createBaseVNode("div", _hoisted_63, [
                        (openBlock(true), createElementBlock(Fragment, null, renderList(unref(stylePresets), (preset) => {
                          return openBlock(), createElementBlock("button", {
                            key: preset.id,
                            type: "button",
                            class: normalizeClass(["style-preset-chip", {
                              "is-active": activeStylePresetId.value === preset.id
                            }]),
                            role: "radio",
                            "aria-checked": activeStylePresetId.value === preset.id,
                            title: preset.label,
                            onClick: ($event) => applyStylePreset(preset)
                          }, [
                            (openBlock(), createElementBlock("svg", {
                              class: "style-preset-chip-icon",
                              viewBox: "0 0 24 24",
                              "aria-hidden": "true",
                              "stroke-width": getStylePresetChipStyle(preset).strokeWidth,
                              stroke: getStylePresetChipStyle(preset).stroke,
                              fill: getStylePresetChipStyle(preset).fill,
                              "stroke-linejoin": "round",
                              "stroke-linecap": "round"
                            }, [..._cache[30] || (_cache[30] = [
                              createBaseVNode("path", { d: "M3 3 H21 V9 H15 V21 H9 V9 H3 Z" }, null, -1)
                            ])], 8, _hoisted_65))
                          ], 10, _hoisted_64);
                        }), 128))
                      ])
                    ]),
                    createBaseVNode("label", _hoisted_66, [
                      _cache[32] || (_cache[32] = createBaseVNode("span", null, "字体", -1)),
                      withDirectives(createBaseVNode("select", {
                        "onUpdate:modelValue": _cache[10] || (_cache[10] = ($event) => selectedFontId.value = $event)
                      }, [
                        (openBlock(true), createElementBlock(Fragment, null, renderList(unref(fontOptions), (font) => {
                          return openBlock(), createElementBlock("option", {
                            key: font.id,
                            value: font.id
                          }, toDisplayString(font.label), 9, _hoisted_67);
                        }), 128))
                      ], 512), [
                        [vModelSelect, selectedFontId.value]
                      ])
                    ]),
                    createBaseVNode("label", _hoisted_68, [
                      _cache[33] || (_cache[33] = createBaseVNode("span", null, "字号", -1)),
                      createBaseVNode("div", _hoisted_69, [
                        withDirectives(createBaseVNode("input", {
                          "onUpdate:modelValue": _cache[11] || (_cache[11] = ($event) => subtitleFontSize.value = $event),
                          type: "range",
                          min: "10",
                          max: "64",
                          step: "1"
                        }, null, 512), [
                          [
                            vModelText,
                            subtitleFontSize.value,
                            void 0,
                            { number: true }
                          ]
                        ]),
                        createBaseVNode("strong", null, toDisplayString(subtitleFontSize.value) + "px", 1)
                      ])
                    ]),
                    createBaseVNode("label", _hoisted_70, [
                      _cache[34] || (_cache[34] = createBaseVNode("span", null, "颜色", -1)),
                      createBaseVNode("div", _hoisted_71, [
                        withDirectives(createBaseVNode("input", {
                          "onUpdate:modelValue": _cache[12] || (_cache[12] = ($event) => subtitleColor.value = $event),
                          type: "color"
                        }, null, 512), [
                          [vModelText, subtitleColor.value]
                        ]),
                        createBaseVNode("span", null, toDisplayString(subtitleColor.value), 1)
                      ])
                    ]),
                    createBaseVNode("label", _hoisted_72, [
                      _cache[35] || (_cache[35] = createBaseVNode("span", null, "描边", -1)),
                      createBaseVNode("div", _hoisted_73, [
                        withDirectives(createBaseVNode("input", {
                          "onUpdate:modelValue": _cache[13] || (_cache[13] = ($event) => subtitleStrokeColor.value = $event),
                          type: "color"
                        }, null, 512), [
                          [vModelText, subtitleStrokeColor.value]
                        ]),
                        createBaseVNode("span", null, toDisplayString(subtitleStrokeColor.value), 1)
                      ])
                    ]),
                    createBaseVNode("label", _hoisted_74, [
                      _cache[36] || (_cache[36] = createBaseVNode("span", null, "粗细", -1)),
                      createBaseVNode("div", _hoisted_75, [
                        withDirectives(createBaseVNode("input", {
                          "onUpdate:modelValue": _cache[14] || (_cache[14] = ($event) => subtitleStrokeSize.value = $event),
                          type: "range",
                          min: "0",
                          max: "1",
                          step: "0.1"
                        }, null, 512), [
                          [
                            vModelText,
                            subtitleStrokeSize.value,
                            void 0,
                            { number: true }
                          ]
                        ]),
                        createBaseVNode("strong", null, toDisplayString(subtitleStrokeSize.value.toFixed(1)) + "px", 1)
                      ])
                    ])
                  ]),
                  createBaseVNode("div", _hoisted_76, [
                    _cache[37] || (_cache[37] = createBaseVNode("h3", null, "字幕列表", -1)),
                    subtitleRows.value.length ? (openBlock(), createElementBlock("div", _hoisted_77, [
                      (openBlock(true), createElementBlock(Fragment, null, renderList(subtitleRows.value, (row) => {
                        return openBlock(), createElementBlock("article", {
                          key: row.id,
                          class: normalizeClass(["subtitle-row style-subtitle-row", { "is-active": row.id === activeSubtitleId.value }])
                        }, [
                          createBaseVNode("span", _hoisted_78, toDisplayString(row.timeRange), 1),
                          createBaseVNode("textarea", {
                            class: "subtitle-text-input",
                            value: row.text,
                            rows: "1",
                            onInput: ($event) => onSubtitleTextInput(row.id, $event)
                          }, null, 40, _hoisted_79)
                        ], 2);
                      }), 128))
                    ])) : (openBlock(), createElementBlock("div", _hoisted_80, " 暂无字幕数据，请先在第五步完成字幕识别 "))
                  ])
                ]),
                createBaseVNode("section", _hoisted_81, [
                  createBaseVNode("div", _hoisted_82, [
                    createBaseVNode("div", _hoisted_83, [
                      createBaseVNode("video", {
                        ref_key: "previewVideoRef",
                        ref: previewVideoRef,
                        class: "preview-video",
                        src: previewVideoSrc.value,
                        controls: "",
                        playsinline: "",
                        controlsList: "nodownload nofullscreen noplaybackrate noremoteplayback",
                        disablePictureInPicture: "",
                        onTimeupdate: handlePreviewTimeUpdate,
                        onSeeked: handlePreviewSeeked
                      }, null, 40, _hoisted_84),
                      previewSubtitleText.value ? (openBlock(), createElementBlock("div", {
                        key: 0,
                        class: "preview-subtitle preview-subtitle-stroke",
                        style: normalizeStyle(previewSubtitleStrokeStyle.value)
                      }, toDisplayString(previewSubtitleText.value), 5)) : createCommentVNode("", true),
                      previewSubtitleText.value ? (openBlock(), createElementBlock("div", {
                        key: 1,
                        class: "preview-subtitle preview-subtitle-fill",
                        style: normalizeStyle(previewSubtitleFillStyle.value)
                      }, toDisplayString(previewSubtitleText.value), 5)) : createCommentVNode("", true)
                    ])
                  ])
                ])
              ])
            ])
          ])) : createCommentVNode("", true)
        ]))
      ]);
    };
  }
});
const SubtitleRecognitionColumn = /* @__PURE__ */ _export_sfc(_sfc_main$9, [["__scopeId", "data-v-013b769e"]]);
function isMoarkVoiceProfile(value) {
  return typeof value === "object" && value !== null && "id" in value && "name" in value && "filePath" in value && "md5" in value && "audioUrl" in value;
}
function isMoarkVoiceProfileList(value) {
  return Array.isArray(value) && value.every(isMoarkVoiceProfile);
}
let sharedMoarkState = null;
function useVoiceCloneMoarkImpl() {
  const { createdCopyText: createdCopyText2 } = useWorkflowState();
  const { synthesizedAudioUrl: sharedSynthesizedAudioUrl } = useVoiceCloneActive();
  const config = /* @__PURE__ */ reactive({
    apiKey: "",
    cookies: ""
  });
  const isSavingConfig = /* @__PURE__ */ ref(false);
  const isLoggedIn = /* @__PURE__ */ ref(false);
  const isVerifyingLogin = /* @__PURE__ */ ref(false);
  const isLoggingIn = /* @__PURE__ */ ref(false);
  const voices = /* @__PURE__ */ ref([]);
  const selectedVoiceId = /* @__PURE__ */ ref("");
  const isLoadingVoices = /* @__PURE__ */ ref(false);
  const isSavingVoice = /* @__PURE__ */ ref(false);
  const voiceName = /* @__PURE__ */ ref("");
  const editingVoiceId = /* @__PURE__ */ ref("");
  const editingVoiceName = /* @__PURE__ */ ref("");
  const isSynthesizingVoice = /* @__PURE__ */ ref(false);
  const isVoiceSynthesisCancelled = /* @__PURE__ */ ref(false);
  const synthesisElapsedMs = /* @__PURE__ */ ref(0);
  const synthesizedAudioUrl = /* @__PURE__ */ ref("");
  let synthesisStartedAt = 0;
  let synthesisTimer;
  const hasConfig = computed(() => Boolean(config.apiKey.trim()));
  const selectedVoice = computed(
    () => voices.value.find((v) => v.id === selectedVoiceId.value)
  );
  async function refreshConfig() {
    const stored = await window.desktopApi.loadVoiceCloneMoarkConfig();
    if (typeof stored === "object" && stored !== null) {
      const obj = stored;
      if (typeof obj.apiKey === "string") config.apiKey = obj.apiKey;
      if (typeof obj.cookies === "string") config.cookies = obj.cookies;
    }
  }
  async function saveConfig() {
    isSavingConfig.value = true;
    try {
      await window.desktopApi.saveVoiceCloneMoarkConfig({
        apiKey: config.apiKey,
        cookies: config.cookies
      });
      ElMessage.success("配置保存成功");
    } finally {
      isSavingConfig.value = false;
    }
  }
  async function verifyCookie() {
    isVerifyingLogin.value = true;
    try {
      const result = await window.desktopApi.moarkVerifyCookie();
      isLoggedIn.value = result.valid;
      return result.valid;
    } catch {
      isLoggedIn.value = false;
      return false;
    } finally {
      isVerifyingLogin.value = false;
    }
  }
  async function login() {
    if (isLoggingIn.value) return false;
    isLoggingIn.value = true;
    try {
      const result = await window.desktopApi.moarkLogin();
      if (result.success) {
        config.cookies = result.cookies;
        isLoggedIn.value = true;
        ElMessage.success("登录成功");
        return true;
      }
      return false;
    } catch (error) {
      ElMessage.error(
        error instanceof Error ? error.message : "登录失败，请重试"
      );
      return false;
    } finally {
      isLoggingIn.value = false;
    }
  }
  async function refreshVoices() {
    isLoadingVoices.value = true;
    try {
      const result = await window.desktopApi.listMoarkVoices();
      if (!isMoarkVoiceProfileList(result))
        throw new Error("Invalid voice list");
      voices.value = result;
      if (!selectedVoiceId.value && voices.value[0]) {
        selectedVoiceId.value = voices.value[0].id;
      }
      if (selectedVoiceId.value && !voices.value.some((v) => v.id === selectedVoiceId.value)) {
        selectedVoiceId.value = voices.value[0]?.id ?? "";
      }
    } catch (error) {
      ElMessage.error(
        error instanceof Error ? error.message : "音色列表获取失败"
      );
    } finally {
      isLoadingVoices.value = false;
    }
  }
  async function saveVoice(sourceFilePath) {
    if (!sourceFilePath) {
      ElMessage.warning("请先选择音频文件");
      return false;
    }
    if (!voiceName.value.trim()) {
      ElMessage.warning("请输入音色名称");
      return false;
    }
    isSavingVoice.value = true;
    try {
      const result = await window.desktopApi.createMoarkVoice({
        name: voiceName.value,
        sourceFilePath
      });
      if (!isMoarkVoiceProfile(result)) throw new Error("保存失败");
      voices.value = [result, ...voices.value];
      selectedVoiceId.value = result.id;
      voiceName.value = "";
      ElMessage.success("音色保存成功");
      return true;
    } catch (error) {
      ElMessage.error(error instanceof Error ? error.message : "音色保存失败");
      return false;
    } finally {
      isSavingVoice.value = false;
    }
  }
  function startEditVoice(voice) {
    editingVoiceId.value = voice.id;
    editingVoiceName.value = voice.name;
  }
  async function saveEditVoice() {
    const result = await window.desktopApi.updateMoarkVoice({
      id: editingVoiceId.value,
      name: editingVoiceName.value
    });
    if (isMoarkVoiceProfileList(result)) voices.value = result;
    editingVoiceId.value = "";
    editingVoiceName.value = "";
  }
  async function deleteVoice(id) {
    const result = await window.desktopApi.deleteMoarkVoice(id);
    if (isMoarkVoiceProfileList(result)) voices.value = result;
    if (selectedVoiceId.value === id) {
      selectedVoiceId.value = voices.value[0]?.id ?? "";
    }
  }
  const synthesisElapsedText = computed(
    () => `${(synthesisElapsedMs.value / 1e3).toFixed(2)}秒`
  );
  function startSynthesisTimer() {
    synthesisStartedAt = Date.now();
    synthesisElapsedMs.value = 0;
    if (synthesisTimer) window.clearInterval(synthesisTimer);
    synthesisTimer = window.setInterval(() => {
      synthesisElapsedMs.value = Date.now() - synthesisStartedAt;
    }, 100);
  }
  function stopSynthesisTimer() {
    if (synthesisStartedAt > 0)
      synthesisElapsedMs.value = Date.now() - synthesisStartedAt;
    if (synthesisTimer) {
      window.clearInterval(synthesisTimer);
      synthesisTimer = void 0;
    }
  }
  async function synthesizeSelectedVoice() {
    if (isSynthesizingVoice.value) return;
    if (!selectedVoice.value) {
      ElMessage.warning("请先选择音色");
      return;
    }
    if (!createdCopyText2.value.trim()) {
      ElMessage.warning("请先完成文案创作");
      return;
    }
    if (!config.apiKey.trim()) {
      ElMessage.warning("请先配置模力方舟 API Key");
      return;
    }
    isVoiceSynthesisCancelled.value = false;
    isSynthesizingVoice.value = true;
    synthesizedAudioUrl.value = "";
    startSynthesisTimer();
    try {
      const result = await window.desktopApi.synthesizeMoarkVoice({
        text: createdCopyText2.value,
        voiceId: selectedVoice.value.id
      });
      if (isVoiceSynthesisCancelled.value) return;
      if (!result?.audioUrl) throw new Error("语音合成返回格式异常");
      synthesizedAudioUrl.value = result.audioUrl;
      sharedSynthesizedAudioUrl.value = result.audioUrl;
      ElMessage.success("语音生成完成");
    } catch (error) {
      if (!isVoiceSynthesisCancelled.value) {
        ElMessage.error(
          error instanceof Error ? error.message : "语音生成失败"
        );
      }
    } finally {
      isSynthesizingVoice.value = false;
      stopSynthesisTimer();
    }
  }
  async function stopVoiceSynthesis() {
    if (!isSynthesizingVoice.value) return;
    isVoiceSynthesisCancelled.value = true;
    await window.desktopApi.cancelMoarkVoiceSynthesis();
    isSynthesizingVoice.value = false;
    stopSynthesisTimer();
    ElMessage.info("已停止语音生成");
  }
  onMounted(() => {
    void refreshConfig();
    void refreshVoices();
  });
  onUnmounted(() => {
    if (synthesisTimer) window.clearInterval(synthesisTimer);
  });
  return {
    config,
    hasConfig,
    isSavingConfig,
    isLoggedIn,
    isVerifyingLogin,
    isLoggingIn,
    voices,
    selectedVoiceId,
    selectedVoice,
    isLoadingVoices,
    isSavingVoice,
    voiceName,
    editingVoiceId,
    editingVoiceName,
    isSynthesizingVoice,
    synthesisElapsedText,
    synthesizedAudioUrl,
    saveConfig,
    refreshConfig,
    verifyCookie,
    login,
    refreshVoices,
    saveVoice,
    startEditVoice,
    saveEditVoice,
    deleteVoice,
    synthesizeSelectedVoice,
    stopVoiceSynthesis
  };
}
function useVoiceCloneMoark() {
  if (!sharedMoarkState) {
    sharedMoarkState = useVoiceCloneMoarkImpl();
  }
  return sharedMoarkState;
}
const _hoisted_1$8 = { class: "tool-actions voice-actions" };
const _hoisted_2$8 = ["disabled"];
const _hoisted_3$6 = ["disabled"];
const _hoisted_4$4 = { class: "voice-select-section" };
const _hoisted_5$4 = { class: "voice-select-controls" };
const _hoisted_6$4 = ["value"];
const _hoisted_7$3 = ["disabled"];
const _hoisted_8$3 = { class: "voice-result-panel" };
const _hoisted_9$3 = { class: "result-title-row" };
const _hoisted_10$4 = {
  class: "elapsed-badge",
  "aria-label": "语音生成耗时"
};
const _hoisted_11$3 = ["src"];
const _hoisted_12$3 = {
  key: 1,
  class: "empty-audio"
};
const _hoisted_13$2 = {
  key: 0,
  class: "modal-backdrop"
};
const _hoisted_14$2 = {
  class: "voice-modal",
  role: "dialog",
  "aria-modal": "true"
};
const _hoisted_15$2 = { class: "voice-modal-body" };
const _hoisted_16$1 = {
  key: 0,
  class: "loading-overlay"
};
const _hoisted_17 = {
  key: 1,
  class: "login-overlay"
};
const _hoisted_18 = { class: "login-card" };
const _hoisted_19 = ["disabled"];
const _hoisted_20 = {
  key: 2,
  class: "voice-manage-layout"
};
const _hoisted_21 = { class: "voice-list-panel" };
const _hoisted_22 = { class: "panel-title-row" };
const _hoisted_23 = {
  key: 0,
  class: "voice-list"
};
const _hoisted_24 = { class: "voice-item-main" };
const _hoisted_25 = { key: 1 };
const _hoisted_26 = { class: "voice-item-actions" };
const _hoisted_27 = ["onClick"];
const _hoisted_28 = ["onClick"];
const _hoisted_29 = ["onClick"];
const _hoisted_30 = { class: "voice-progress-track" };
const _hoisted_31 = {
  key: 1,
  class: "empty-list"
};
const _hoisted_32 = { class: "voice-create-panel" };
const _hoisted_33 = { class: "tool-field" };
const _hoisted_34 = { class: "read-text" };
const _hoisted_35 = {
  key: 0,
  class: "read-text-content"
};
const _hoisted_36 = {
  key: 1,
  class: "read-text-empty"
};
const _hoisted_37 = { class: "record-panel" };
const _hoisted_38 = { class: "record-status" };
const _hoisted_39 = { class: "record-actions" };
const _hoisted_40 = ["disabled"];
const _hoisted_41 = ["disabled"];
const _hoisted_42 = { class: "recorded-audio-slot" };
const _hoisted_43 = ["src"];
const _hoisted_44 = { key: 1 };
const _hoisted_45 = { class: "voice-create-actions" };
const _hoisted_46 = ["disabled"];
const _sfc_main$8 = /* @__PURE__ */ defineComponent({
  __name: "VoiceCloneMoarkSection",
  setup(__props) {
    const { openConfigModal } = useVoiceCloneActive();
    const { createdCopyText: createdCopyText2 } = useWorkflowState();
    const {
      voices,
      selectedVoiceId,
      isLoadingVoices,
      isSavingVoice,
      isLoggedIn,
      isVerifyingLogin,
      isLoggingIn,
      isSynthesizingVoice,
      synthesisElapsedText,
      synthesizedAudioUrl,
      voiceName,
      editingVoiceId,
      editingVoiceName,
      verifyCookie,
      login,
      refreshVoices,
      saveVoice,
      startEditVoice,
      saveEditVoice,
      deleteVoice,
      synthesizeSelectedVoice,
      stopVoiceSynthesis
    } = useVoiceCloneMoark();
    const isVoiceModalOpen = /* @__PURE__ */ ref(false);
    const isCheckingLogin = /* @__PURE__ */ ref(false);
    const isRecording = /* @__PURE__ */ ref(false);
    const recordingElapsedSeconds = /* @__PURE__ */ ref(0);
    const recordedAudioUrl = /* @__PURE__ */ ref("");
    let selectedFilePath = "";
    let mediaRecorder;
    let recordingTimer;
    let recordedChunks = [];
    const playingVoiceId = /* @__PURE__ */ ref("");
    const voicePreviewProgress = /* @__PURE__ */ ref(0);
    let previewAudio;
    async function handleOpenVoiceModal() {
      isVoiceModalOpen.value = true;
      isCheckingLogin.value = true;
      try {
        await verifyCookie();
        if (isLoggedIn.value) {
          await refreshVoices();
        }
      } finally {
        isCheckingLogin.value = false;
      }
    }
    function closeVoiceModal() {
      stopVoicePreview();
      isVoiceModalOpen.value = false;
    }
    async function handleLogin() {
      const success = await login();
      if (success) {
        isCheckingLogin.value = true;
        try {
          await verifyCookie();
          if (isLoggedIn.value) {
            await refreshVoices();
          }
        } finally {
          isCheckingLogin.value = false;
        }
      }
    }
    async function startRecording() {
      if (isRecording.value) return;
      try {
        const accessStatus = await window.desktopApi.requestMicrophoneAccess();
        if (accessStatus === "denied") {
          ElMessage.error("麦克风权限被拒绝，请在系统设置中允许本应用访问麦克风");
          return;
        }
      } catch {
      }
      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      } catch (error) {
        const msg = error instanceof Error ? error.message : "";
        if (msg.includes("Permission") || msg.includes("NotAllowed")) {
          ElMessage.error("麦克风权限被拒绝，请在系统设置中允许本应用访问麦克风");
        } else {
          ElMessage.error("无法访问麦克风，请检查设备连接或系统权限设置");
        }
        return;
      }
      recordedChunks = [];
      selectedFilePath = "";
      if (recordedAudioUrl.value) {
        URL.revokeObjectURL(recordedAudioUrl.value);
        recordedAudioUrl.value = "";
      }
      mediaRecorder = new MediaRecorder(stream);
      mediaRecorder.addEventListener("dataavailable", (event) => {
        if (event.data.size > 0) recordedChunks.push(event.data);
      });
      mediaRecorder.addEventListener("stop", async () => {
        const blob = new Blob(recordedChunks, { type: mediaRecorder?.mimeType || "audio/webm" });
        recordedAudioUrl.value = URL.createObjectURL(blob);
        stream.getTracks().forEach((track2) => track2.stop());
        try {
          const arrayBuffer = await blob.arrayBuffer();
          const filePath = await window.desktopApi.saveMoarkRecording(
            arrayBuffer,
            blob.type
          );
          selectedFilePath = filePath;
        } catch {
        }
      });
      recordingElapsedSeconds.value = 0;
      isRecording.value = true;
      mediaRecorder.start();
      recordingTimer = window.setInterval(() => {
        recordingElapsedSeconds.value += 1;
        if (recordingElapsedSeconds.value >= 20) stopRecording();
      }, 1e3);
    }
    function stopRecording() {
      if (!isRecording.value) return;
      isRecording.value = false;
      if (recordingTimer) {
        window.clearInterval(recordingTimer);
        recordingTimer = void 0;
      }
      if (mediaRecorder && mediaRecorder.state !== "inactive") {
        mediaRecorder.stop();
      }
    }
    async function handleVoiceFileUpload() {
      const filePath = await window.desktopApi.selectAudioFile();
      if (!filePath) return;
      let fileResult;
      try {
        fileResult = await window.desktopApi.readCustomAudioFile(filePath);
      } catch {
        ElMessage.error("文件读取失败，请重新选择");
        return;
      }
      const maxSize = 100 * 1024 * 1024;
      if (fileResult.arrayBuffer.byteLength > maxSize) {
        ElMessage.warning("音频文件不能超过 100MB，请重新选择");
        return;
      }
      selectedFilePath = filePath;
      if (recordedAudioUrl.value) {
        URL.revokeObjectURL(recordedAudioUrl.value);
        recordedAudioUrl.value = "";
      }
      const blob = new Blob([fileResult.arrayBuffer], { type: fileResult.mimeType });
      recordedAudioUrl.value = URL.createObjectURL(blob);
    }
    async function handleSaveVoice() {
      const success = await saveVoice(selectedFilePath);
      if (success) {
        selectedFilePath = "";
        if (recordedAudioUrl.value) {
          URL.revokeObjectURL(recordedAudioUrl.value);
          recordedAudioUrl.value = "";
        }
      }
    }
    function stopVoicePreview() {
      if (previewAudio) {
        previewAudio.pause();
        previewAudio.src = "";
        previewAudio = void 0;
      }
      playingVoiceId.value = "";
      voicePreviewProgress.value = 0;
    }
    function toggleVoicePreview(voice) {
      if (playingVoiceId.value === voice.id) {
        stopVoicePreview();
        return;
      }
      stopVoicePreview();
      previewAudio = new Audio(voice.audioUrl);
      previewAudio.preload = "metadata";
      playingVoiceId.value = voice.id;
      previewAudio.addEventListener("timeupdate", () => {
        if (!previewAudio || !Number.isFinite(previewAudio.duration) || previewAudio.duration <= 0) {
          voicePreviewProgress.value = 0;
          return;
        }
        voicePreviewProgress.value = Math.min(100, previewAudio.currentTime / previewAudio.duration * 100);
      });
      previewAudio.addEventListener("ended", stopVoicePreview, { once: true });
      void previewAudio.play();
    }
    onUnmounted(() => {
      stopRecording();
      stopVoicePreview();
      if (recordedAudioUrl.value) URL.revokeObjectURL(recordedAudioUrl.value);
    });
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", null, [
        createBaseVNode("div", _hoisted_1$8, [
          createBaseVNode("button", {
            class: "primary-button",
            type: "button",
            disabled: unref(isSynthesizingVoice),
            onClick: _cache[0] || (_cache[0] = //@ts-ignore
            (...args) => unref(synthesizeSelectedVoice) && unref(synthesizeSelectedVoice)(...args))
          }, toDisplayString(unref(isSynthesizingVoice) ? "生成中..." : "语音生成"), 9, _hoisted_2$8),
          createBaseVNode("button", {
            class: "secondary-button",
            type: "button",
            disabled: !unref(isSynthesizingVoice),
            onClick: _cache[1] || (_cache[1] = //@ts-ignore
            (...args) => unref(stopVoiceSynthesis) && unref(stopVoiceSynthesis)(...args))
          }, " 停止中断 ", 8, _hoisted_3$6),
          createBaseVNode("button", {
            class: "secondary-button model-config-button",
            type: "button",
            title: "模型配置",
            onClick: _cache[2] || (_cache[2] = //@ts-ignore
            (...args) => unref(openConfigModal) && unref(openConfigModal)(...args))
          }, [
            createVNode(unref(setting_default)),
            _cache[9] || (_cache[9] = createTextVNode(" 模型配置 ", -1))
          ])
        ]),
        createBaseVNode("section", _hoisted_4$4, [
          _cache[12] || (_cache[12] = createBaseVNode("div", { class: "voice-select-title-row" }, [
            createBaseVNode("span", { class: "voice-select-title" }, "选择音色"),
            createBaseVNode("span", {
              class: "active-provider-pill",
              title: "当前使用的模型方"
            }, [
              createBaseVNode("span", { class: "active-provider-dot" }),
              createTextVNode(" 模力方舟 ")
            ])
          ], -1)),
          createBaseVNode("div", _hoisted_5$4, [
            withDirectives(createBaseVNode("select", {
              "onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => /* @__PURE__ */ isRef(selectedVoiceId) ? selectedVoiceId.value = $event : null),
              class: "voice-select-input"
            }, [
              _cache[10] || (_cache[10] = createBaseVNode("option", { value: "" }, "请选择音色", -1)),
              (openBlock(true), createElementBlock(Fragment, null, renderList(unref(voices), (voice) => {
                return openBlock(), createElementBlock("option", {
                  key: voice.id,
                  value: voice.id
                }, toDisplayString(voice.name), 9, _hoisted_6$4);
              }), 128))
            ], 512), [
              [vModelSelect, unref(selectedVoiceId)]
            ]),
            createBaseVNode("button", {
              class: "icon-action-button",
              type: "button",
              disabled: unref(isLoadingVoices),
              title: "刷新音色列表",
              onClick: _cache[4] || (_cache[4] = //@ts-ignore
              (...args) => unref(refreshVoices) && unref(refreshVoices)(...args))
            }, [
              createVNode(unref(refresh_default))
            ], 8, _hoisted_7$3),
            createBaseVNode("button", {
              class: "voice-manage-button",
              type: "button",
              title: "音色管理",
              onClick: handleOpenVoiceModal
            }, [
              createVNode(unref(microphone_default)),
              _cache[11] || (_cache[11] = createTextVNode(" 音色管理 ", -1))
            ])
          ])
        ]),
        createBaseVNode("section", _hoisted_8$3, [
          createBaseVNode("div", _hoisted_9$3, [
            _cache[13] || (_cache[13] = createBaseVNode("h3", null, "语音预览", -1)),
            createBaseVNode("span", _hoisted_10$4, [
              createVNode(unref(stopwatch_default), {
                class: "elapsed-icon",
                "aria-hidden": "true"
              }),
              createTextVNode(" " + toDisplayString(unref(synthesisElapsedText)), 1)
            ])
          ]),
          unref(synthesizedAudioUrl) ? (openBlock(), createElementBlock("audio", {
            key: 0,
            class: "synthesized-audio",
            src: unref(synthesizedAudioUrl),
            controls: ""
          }, null, 8, _hoisted_11$3)) : (openBlock(), createElementBlock("div", _hoisted_12$3, "生成后可在这里播放音频"))
        ]),
        (openBlock(), createBlock(Teleport, { to: "body" }, [
          isVoiceModalOpen.value ? (openBlock(), createElementBlock("div", _hoisted_13$2, [
            createBaseVNode("section", _hoisted_14$2, [
              createBaseVNode("header", { class: "modal-header" }, [
                _cache[14] || (_cache[14] = createBaseVNode("h2", null, "模力方舟音色管理", -1)),
                createBaseVNode("button", {
                  class: "icon-button",
                  type: "button",
                  "aria-label": "关闭",
                  onClick: closeVoiceModal
                }, "×")
              ]),
              createBaseVNode("div", _hoisted_15$2, [
                isCheckingLogin.value ? (openBlock(), createElementBlock("div", _hoisted_16$1, [..._cache[15] || (_cache[15] = [
                  createBaseVNode("div", { class: "loading-card" }, [
                    createBaseVNode("div", { class: "loading-spinner" }),
                    createBaseVNode("p", null, "正在验证登录状态...")
                  ], -1)
                ])])) : !unref(isLoggedIn) ? (openBlock(), createElementBlock("div", _hoisted_17, [
                  createBaseVNode("div", _hoisted_18, [
                    _cache[16] || (_cache[16] = createBaseVNode("div", { class: "login-icon" }, "🔐", -1)),
                    _cache[17] || (_cache[17] = createBaseVNode("h3", null, "需要登录模力方舟", -1)),
                    _cache[18] || (_cache[18] = createBaseVNode("p", null, "音色管理需要登录模力方舟账号，点击下方按钮将打开登录窗口。", -1)),
                    _cache[19] || (_cache[19] = createBaseVNode("p", { class: "login-tip" }, "登录成功后窗口将自动关闭。", -1)),
                    createBaseVNode("button", {
                      class: "primary-button login-button",
                      type: "button",
                      disabled: unref(isLoggingIn),
                      onClick: handleLogin
                    }, toDisplayString(unref(isLoggingIn) ? "登录中..." : "前往登录"), 9, _hoisted_19)
                  ])
                ])) : (openBlock(), createElementBlock("div", _hoisted_20, [
                  createBaseVNode("section", _hoisted_21, [
                    createBaseVNode("header", _hoisted_22, [
                      _cache[20] || (_cache[20] = createBaseVNode("h3", null, "音色列表", -1)),
                      createBaseVNode("button", {
                        class: "text-link-button",
                        type: "button",
                        onClick: _cache[5] || (_cache[5] = //@ts-ignore
                        (...args) => unref(refreshVoices) && unref(refreshVoices)(...args))
                      }, "刷新")
                    ]),
                    unref(voices).length ? (openBlock(), createElementBlock("div", _hoisted_23, [
                      (openBlock(true), createElementBlock(Fragment, null, renderList(unref(voices), (voice) => {
                        return openBlock(), createElementBlock("article", {
                          key: voice.id,
                          class: normalizeClass(["voice-item", { "is-playing": playingVoiceId.value === voice.id }])
                        }, [
                          createBaseVNode("div", _hoisted_24, [
                            unref(editingVoiceId) === voice.id ? withDirectives((openBlock(), createElementBlock("input", {
                              key: 0,
                              "onUpdate:modelValue": _cache[6] || (_cache[6] = ($event) => /* @__PURE__ */ isRef(editingVoiceName) ? editingVoiceName.value = $event : null),
                              class: "voice-edit-input",
                              type: "text"
                            }, null, 512)), [
                              [vModelText, unref(editingVoiceName)]
                            ]) : (openBlock(), createElementBlock("strong", _hoisted_25, toDisplayString(voice.name), 1)),
                            createBaseVNode("span", null, toDisplayString(voice.md5), 1)
                          ]),
                          createBaseVNode("div", _hoisted_26, [
                            createBaseVNode("button", {
                              class: "icon-action-button",
                              type: "button",
                              title: "试听",
                              onClick: ($event) => toggleVoicePreview(voice)
                            }, [
                              playingVoiceId.value === voice.id ? (openBlock(), createBlock(unref(video_pause_default), { key: 0 })) : (openBlock(), createBlock(unref(video_play_default), { key: 1 }))
                            ], 8, _hoisted_27),
                            unref(editingVoiceId) === voice.id ? (openBlock(), createElementBlock("button", {
                              key: 0,
                              class: "small-button primary",
                              type: "button",
                              onClick: _cache[7] || (_cache[7] = //@ts-ignore
                              (...args) => unref(saveEditVoice) && unref(saveEditVoice)(...args))
                            }, " 保存 ")) : (openBlock(), createElementBlock("button", {
                              key: 1,
                              class: "icon-action-button",
                              type: "button",
                              title: "编辑",
                              onClick: ($event) => unref(startEditVoice)(voice)
                            }, [
                              createVNode(unref(edit_default))
                            ], 8, _hoisted_28)),
                            createBaseVNode("button", {
                              class: "icon-action-button danger",
                              type: "button",
                              title: "删除",
                              onClick: ($event) => unref(deleteVoice)(voice.id)
                            }, [
                              createVNode(unref(delete_default))
                            ], 8, _hoisted_29)
                          ]),
                          createBaseVNode("div", _hoisted_30, [
                            createBaseVNode("div", {
                              class: "voice-progress-value",
                              style: normalizeStyle({ width: playingVoiceId.value === voice.id ? `${voicePreviewProgress.value}%` : "0%" })
                            }, null, 4)
                          ])
                        ], 2);
                      }), 128))
                    ])) : (openBlock(), createElementBlock("div", _hoisted_31, "暂无音色，请在右侧新增"))
                  ]),
                  createBaseVNode("section", _hoisted_32, [
                    _cache[24] || (_cache[24] = createBaseVNode("h3", null, "新增音色", -1)),
                    createBaseVNode("label", _hoisted_33, [
                      _cache[21] || (_cache[21] = createBaseVNode("span", null, "音色名称", -1)),
                      withDirectives(createBaseVNode("input", {
                        "onUpdate:modelValue": _cache[8] || (_cache[8] = ($event) => /* @__PURE__ */ isRef(voiceName) ? voiceName.value = $event : null),
                        class: "voice-name-input",
                        type: "text",
                        placeholder: "例如：我的口播音色"
                      }, null, 512), [
                        [vModelText, unref(voiceName)]
                      ])
                    ]),
                    createBaseVNode("div", _hoisted_34, [
                      _cache[22] || (_cache[22] = createBaseVNode("strong", null, "朗读文本", -1)),
                      unref(createdCopyText2).trim() ? (openBlock(), createElementBlock("p", _hoisted_35, toDisplayString(unref(createdCopyText2)), 1)) : (openBlock(), createElementBlock("p", _hoisted_36, "请先在第二步完成文案创作"))
                    ]),
                    createBaseVNode("div", _hoisted_37, [
                      createBaseVNode("div", _hoisted_38, [
                        createVNode(unref(microphone_default), { class: "record-icon" }),
                        createBaseVNode("span", null, toDisplayString(isRecording.value ? `录制中 ${recordingElapsedSeconds.value}s / 20s` : "录制时长建议最多 20s"), 1)
                      ]),
                      createBaseVNode("div", _hoisted_39, [
                        createBaseVNode("button", {
                          class: "primary-button",
                          type: "button",
                          disabled: isRecording.value,
                          onClick: startRecording
                        }, "开始录制", 8, _hoisted_40),
                        createBaseVNode("button", {
                          class: "secondary-button",
                          type: "button",
                          disabled: !isRecording.value,
                          onClick: stopRecording
                        }, "停止录制", 8, _hoisted_41)
                      ]),
                      createBaseVNode("button", {
                        class: "upload-voice-button",
                        type: "button",
                        onClick: handleVoiceFileUpload
                      }, " 上传音频文件 "),
                      _cache[23] || (_cache[23] = createBaseVNode("p", { class: "upload-tip" }, "支持任意音频格式，文件大小不超过 100MB", -1)),
                      createBaseVNode("div", _hoisted_42, [
                        recordedAudioUrl.value ? (openBlock(), createElementBlock("audio", {
                          key: 0,
                          class: "recorded-audio",
                          src: recordedAudioUrl.value,
                          controls: ""
                        }, null, 8, _hoisted_43)) : (openBlock(), createElementBlock("span", _hoisted_44, "录制完成后可在这里试听"))
                      ])
                    ]),
                    createBaseVNode("footer", _hoisted_45, [
                      createBaseVNode("button", {
                        class: "primary-button",
                        type: "button",
                        disabled: unref(isSavingVoice) || isRecording.value,
                        onClick: handleSaveVoice
                      }, toDisplayString(unref(isSavingVoice) ? "保存中..." : "保存音色"), 9, _hoisted_46)
                    ])
                  ])
                ]))
              ])
            ])
          ])) : createCommentVNode("", true)
        ]))
      ]);
    };
  }
});
const VoiceCloneMoarkSection = /* @__PURE__ */ _export_sfc(_sfc_main$8, [["__scopeId", "data-v-8bb19d73"]]);
const _hoisted_1$7 = { class: "moark-config-form" };
const _hoisted_2$7 = { class: "config-field" };
const _sfc_main$7 = /* @__PURE__ */ defineComponent({
  __name: "VoiceCloneMoarkConfigForm",
  setup(__props) {
    const { config } = useVoiceCloneMoark();
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", _hoisted_1$7, [
        _cache[2] || (_cache[2] = createBaseVNode("p", { class: "config-tip" }, [
          createTextVNode(" 前往 "),
          createBaseVNode("a", {
            href: "https://moark.com/",
            target: "_blank",
            rel: "noreferrer"
          }, "https://moark.com/"),
          createTextVNode(" 注册账号，"),
          createBaseVNode("strong", { class: "highlight-red" }, "每天赠送 100次"),
          createTextVNode(" 免费调用机会。 ")
        ], -1)),
        createBaseVNode("label", _hoisted_2$7, [
          _cache[1] || (_cache[1] = createBaseVNode("span", null, "API KEY", -1)),
          withDirectives(createBaseVNode("input", {
            "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => unref(config).apiKey = $event),
            type: "text",
            placeholder: "请输入模力方舟 API Key"
          }, null, 512), [
            [vModelText, unref(config).apiKey]
          ])
        ])
      ]);
    };
  }
});
const VoiceCloneMoarkConfigForm = /* @__PURE__ */ _export_sfc(_sfc_main$7, [["__scopeId", "data-v-5cd78d4e"]]);
const _hoisted_1$6 = { class: "ws-section" };
const _hoisted_2$6 = { class: "tool-actions" };
const _hoisted_3$5 = ["disabled"];
const _hoisted_4$3 = ["disabled"];
const _hoisted_5$3 = {
  class: "media-upload-panel",
  "aria-label": "对口型素材上传"
};
const _hoisted_6$3 = { class: "media-upload-head" };
const _hoisted_7$2 = { class: "media-upload-controls" };
const _hoisted_8$2 = { class: "media-preview-control" };
const _hoisted_9$2 = {
  key: 1,
  class: "preview-disabled",
  type: "button",
  disabled: ""
};
const _hoisted_10$3 = { class: "task-status-row" };
const _hoisted_11$2 = { class: "elapsed-badge" };
const _hoisted_12$2 = {
  key: 0,
  class: "modal-backdrop"
};
const _hoisted_13$1 = {
  class: "video-preview-modal",
  role: "dialog",
  "aria-modal": "true"
};
const _hoisted_14$1 = { class: "video-preview-body" };
const _hoisted_15$1 = ["src"];
const _sfc_main$6 = /* @__PURE__ */ defineComponent({
  __name: "LipSyncWaveSpeedSection",
  props: {
    voiceAudioBlob: {},
    voiceAudioUrl: {}
  },
  setup(__props) {
    const props = __props;
    const { openConfigModal } = useLipSyncActive();
    const {
      canStartWaveSpeed,
      ensureWaveSpeedConfig,
      isWaveSpeedPolling,
      isWaveSpeedSubmitting,
      stopWaveSpeedLipSync,
      submitWaveSpeedTask,
      uploadWaveSpeedVideoFile,
      useWaveSpeedVoiceAudio,
      waveSpeedElapsedText,
      waveSpeedTaskStatus,
      waveSpeedVideoPreviewUrl,
      waveSpeedVideoStatus
    } = useVideoLipSync();
    const isVideoPreviewOpen = /* @__PURE__ */ ref(false);
    const videoUploadHint = computed(() => {
      if (waveSpeedVideoStatus.value === "上传中...") return "文件正在上传，请稍候";
      if (waveSpeedVideoStatus.value === "上传失败") return "上传失败，请重新选择视频文件";
      return waveSpeedVideoPreviewUrl.value ? "视频已就绪，点击按钮弹出播放器预览" : "完成上传后才可以预览视频";
    });
    function handleVideoUploadClick(event) {
      if (!ensureWaveSpeedConfig()) {
        event.preventDefault();
        event.stopPropagation();
      }
    }
    watch(
      () => props.voiceAudioUrl,
      (url) => {
        if (url) {
          void useWaveSpeedVoiceAudio(url, props.voiceAudioBlob);
        }
      },
      { immediate: true }
    );
    function openVideoPreview() {
      if (!waveSpeedVideoPreviewUrl.value) return;
      isVideoPreviewOpen.value = true;
    }
    function closeVideoPreview() {
      isVideoPreviewOpen.value = false;
    }
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", _hoisted_1$6, [
        createBaseVNode("div", _hoisted_2$6, [
          createBaseVNode("button", {
            class: "primary-button",
            type: "button",
            disabled: !unref(canStartWaveSpeed) || unref(isWaveSpeedSubmitting) || unref(isWaveSpeedPolling),
            onClick: _cache[0] || (_cache[0] = //@ts-ignore
            (...args) => unref(submitWaveSpeedTask) && unref(submitWaveSpeedTask)(...args))
          }, toDisplayString(unref(isWaveSpeedSubmitting) || unref(isWaveSpeedPolling) ? "执行中..." : "视频对口型"), 9, _hoisted_3$5),
          createBaseVNode("button", {
            class: "secondary-button",
            type: "button",
            disabled: !unref(isWaveSpeedPolling),
            onClick: _cache[1] || (_cache[1] = //@ts-ignore
            (...args) => unref(stopWaveSpeedLipSync) && unref(stopWaveSpeedLipSync)(...args))
          }, " 停止中断 ", 8, _hoisted_4$3),
          createBaseVNode("button", {
            class: "secondary-button model-config-button",
            type: "button",
            title: "模型配置",
            onClick: _cache[2] || (_cache[2] = //@ts-ignore
            (...args) => unref(openConfigModal) && unref(openConfigModal)(...args))
          }, [
            createVNode(unref(setting_default)),
            _cache[4] || (_cache[4] = createTextVNode(" 模型配置 ", -1))
          ])
        ]),
        createBaseVNode("section", _hoisted_5$3, [
          createBaseVNode("article", {
            class: normalizeClass(["media-upload-item", {
              "is-error": unref(waveSpeedVideoStatus) === "上传失败",
              "is-ready": Boolean(unref(waveSpeedVideoPreviewUrl)),
              "is-uploading": unref(waveSpeedVideoStatus) === "上传中..."
            }])
          }, [
            createBaseVNode("div", _hoisted_6$3, [
              createBaseVNode("strong", null, [
                _cache[5] || (_cache[5] = createTextVNode("视频文件 ", -1)),
                createBaseVNode("span", null, "（" + toDisplayString(videoUploadHint.value) + "）", 1)
              ]),
              _cache[6] || (_cache[6] = createBaseVNode("span", {
                class: "active-provider-pill",
                title: "当前使用的对口型模型"
              }, [
                createBaseVNode("span", { class: "active-provider-dot" }),
                createTextVNode(" WaveSpeed ")
              ], -1))
            ]),
            createBaseVNode("div", _hoisted_7$2, [
              createBaseVNode("label", {
                class: "media-upload-action",
                onClick: handleVideoUploadClick
              }, [
                createBaseVNode("input", {
                  type: "file",
                  accept: ".mp4,.mov,.mkv,video/*",
                  onChange: _cache[3] || (_cache[3] = //@ts-ignore
                  (...args) => unref(uploadWaveSpeedVideoFile) && unref(uploadWaveSpeedVideoFile)(...args))
                }, null, 32),
                createVNode(unref(upload_default)),
                _cache[7] || (_cache[7] = createBaseVNode("span", null, "上传视频", -1))
              ]),
              createBaseVNode("div", _hoisted_8$2, [
                unref(waveSpeedVideoPreviewUrl) ? (openBlock(), createElementBlock("button", {
                  key: 0,
                  class: "video-preview-trigger",
                  type: "button",
                  onClick: openVideoPreview
                }, " 打开视频预览 ")) : (openBlock(), createElementBlock("button", _hoisted_9$2, "暂不可预览"))
              ])
            ])
          ], 2)
        ]),
        createBaseVNode("div", _hoisted_10$3, [
          createBaseVNode("span", null, "任务状态：" + toDisplayString(unref(waveSpeedTaskStatus)), 1),
          createBaseVNode("span", _hoisted_11$2, [
            createVNode(unref(stopwatch_default), {
              class: "elapsed-icon",
              "aria-hidden": "true"
            }),
            createTextVNode(" " + toDisplayString(unref(waveSpeedElapsedText)), 1)
          ])
        ]),
        (openBlock(), createBlock(Teleport, { to: "body" }, [
          isVideoPreviewOpen.value ? (openBlock(), createElementBlock("div", _hoisted_12$2, [
            createBaseVNode("section", _hoisted_13$1, [
              createBaseVNode("header", { class: "modal-header" }, [
                _cache[8] || (_cache[8] = createBaseVNode("h2", null, "视频预览", -1)),
                createBaseVNode("button", {
                  class: "icon-button",
                  type: "button",
                  "aria-label": "关闭视频预览",
                  onClick: closeVideoPreview
                }, "×")
              ]),
              createBaseVNode("div", _hoisted_14$1, [
                createBaseVNode("video", {
                  class: "modal-preview-video",
                  src: unref(waveSpeedVideoPreviewUrl),
                  controls: "",
                  autoplay: ""
                }, null, 8, _hoisted_15$1)
              ])
            ])
          ])) : createCommentVNode("", true)
        ]))
      ]);
    };
  }
});
const LipSyncWaveSpeedSection = /* @__PURE__ */ _export_sfc(_sfc_main$6, [["__scopeId", "data-v-38aa9403"]]);
const _hoisted_1$5 = { class: "sc-section" };
const _hoisted_2$5 = { class: "tool-actions" };
const _hoisted_3$4 = ["disabled"];
const _hoisted_4$2 = ["disabled"];
const _hoisted_5$2 = {
  class: "media-upload-panel",
  "aria-label": "对口型素材上传"
};
const _hoisted_6$2 = { class: "media-upload-head" };
const _hoisted_7$1 = { class: "media-upload-controls" };
const _hoisted_8$1 = { class: "media-upload-action" };
const _hoisted_9$1 = { class: "media-preview-control" };
const _hoisted_10$2 = {
  key: 1,
  class: "preview-disabled",
  type: "button",
  disabled: ""
};
const _hoisted_11$1 = { class: "task-status-row" };
const _hoisted_12$1 = { class: "elapsed-badge" };
const _hoisted_13 = {
  key: 0,
  class: "modal-backdrop"
};
const _hoisted_14 = {
  class: "video-preview-modal",
  role: "dialog",
  "aria-modal": "true"
};
const _hoisted_15 = { class: "video-preview-body" };
const _hoisted_16 = ["src"];
const _sfc_main$5 = /* @__PURE__ */ defineComponent({
  __name: "LipSyncSourceCodeSection",
  props: {
    voiceAudioBlob: {},
    voiceAudioUrl: {}
  },
  setup(__props) {
    const props = __props;
    const { openConfigModal } = useLipSyncActive();
    const {
      taskStatus,
      elapsedText,
      isSubmitting,
      isPolling,
      videoPreviewUrl,
      videoStatus,
      uploadVideoFile,
      submitTask,
      stopTask
    } = useLipSyncSourceCode();
    const isVideoPreviewOpen = /* @__PURE__ */ ref(false);
    function formatTaskStatus(status) {
      const statusMap = {
        waiting: "排队中",
        in_progress: "执行中",
        success: "成功",
        failure: "失败",
        cancelled: "取消"
      };
      return statusMap[status] ?? status;
    }
    function handleSubmit() {
      void submitTask(props.voiceAudioUrl ?? "", props.voiceAudioBlob ?? null);
    }
    const videoUploadHint = computed(() => {
      if (videoStatus.value === "上传中...") return "文件正在上传，请稍候";
      if (videoStatus.value === "上传失败") return "上传失败，请重新选择视频文件";
      return videoPreviewUrl.value ? "视频已就绪，点击按钮弹出播放器预览" : "完成上传后才可以预览视频";
    });
    function openVideoPreview() {
      if (!videoPreviewUrl.value) return;
      isVideoPreviewOpen.value = true;
    }
    function closeVideoPreview() {
      isVideoPreviewOpen.value = false;
    }
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", _hoisted_1$5, [
        createBaseVNode("div", _hoisted_2$5, [
          createBaseVNode("button", {
            class: "primary-button",
            type: "button",
            disabled: unref(isSubmitting) || unref(isPolling),
            onClick: handleSubmit
          }, toDisplayString(unref(isSubmitting) || unref(isPolling) ? "执行中..." : "视频对口型"), 9, _hoisted_3$4),
          createBaseVNode("button", {
            class: "secondary-button",
            type: "button",
            disabled: !unref(isPolling),
            onClick: _cache[0] || (_cache[0] = //@ts-ignore
            (...args) => unref(stopTask) && unref(stopTask)(...args))
          }, " 停止中断 ", 8, _hoisted_4$2),
          createBaseVNode("button", {
            class: "secondary-button model-config-button",
            type: "button",
            title: "模型配置",
            onClick: _cache[1] || (_cache[1] = //@ts-ignore
            (...args) => unref(openConfigModal) && unref(openConfigModal)(...args))
          }, [
            createVNode(unref(setting_default)),
            _cache[3] || (_cache[3] = createTextVNode(" 模型配置 ", -1))
          ])
        ]),
        createBaseVNode("section", _hoisted_5$2, [
          createBaseVNode("article", {
            class: normalizeClass(["media-upload-item", {
              "is-error": unref(videoStatus) === "上传失败",
              "is-ready": Boolean(unref(videoPreviewUrl)),
              "is-uploading": unref(videoStatus) === "上传中..."
            }])
          }, [
            createBaseVNode("div", _hoisted_6$2, [
              createBaseVNode("strong", null, [
                _cache[4] || (_cache[4] = createTextVNode("视频文件 ", -1)),
                createBaseVNode("span", null, "（" + toDisplayString(videoUploadHint.value) + "）", 1)
              ]),
              _cache[5] || (_cache[5] = createBaseVNode("span", {
                class: "active-provider-pill",
                title: "当前使用的对口型模型"
              }, [
                createBaseVNode("span", { class: "active-provider-dot" }),
                createTextVNode(" 模力方舟 ")
              ], -1))
            ]),
            createBaseVNode("div", _hoisted_7$1, [
              createBaseVNode("label", _hoisted_8$1, [
                createBaseVNode("input", {
                  type: "file",
                  accept: ".mp4,.mov,.mkv,video/*",
                  onChange: _cache[2] || (_cache[2] = //@ts-ignore
                  (...args) => unref(uploadVideoFile) && unref(uploadVideoFile)(...args))
                }, null, 32),
                createVNode(unref(upload_default)),
                _cache[6] || (_cache[6] = createBaseVNode("span", null, "上传视频", -1))
              ]),
              createBaseVNode("div", _hoisted_9$1, [
                unref(videoPreviewUrl) ? (openBlock(), createElementBlock("button", {
                  key: 0,
                  class: "video-preview-trigger",
                  type: "button",
                  onClick: openVideoPreview
                }, " 打开视频预览 ")) : (openBlock(), createElementBlock("button", _hoisted_10$2, "暂不可预览"))
              ])
            ])
          ], 2)
        ]),
        createBaseVNode("div", _hoisted_11$1, [
          createBaseVNode("span", null, "任务状态：" + toDisplayString(unref(isSubmitting) ? "执行中..." : formatTaskStatus(unref(taskStatus))), 1),
          createBaseVNode("span", _hoisted_12$1, [
            createVNode(unref(stopwatch_default), {
              class: "elapsed-icon",
              "aria-hidden": "true"
            }),
            createTextVNode(" " + toDisplayString(unref(elapsedText)), 1)
          ])
        ]),
        (openBlock(), createBlock(Teleport, { to: "body" }, [
          isVideoPreviewOpen.value ? (openBlock(), createElementBlock("div", _hoisted_13, [
            createBaseVNode("section", _hoisted_14, [
              createBaseVNode("header", { class: "modal-header" }, [
                _cache[7] || (_cache[7] = createBaseVNode("h2", null, "视频预览", -1)),
                createBaseVNode("button", {
                  class: "icon-button",
                  type: "button",
                  "aria-label": "关闭视频预览",
                  onClick: closeVideoPreview
                }, "×")
              ]),
              createBaseVNode("div", _hoisted_15, [
                createBaseVNode("video", {
                  class: "modal-preview-video",
                  src: unref(videoPreviewUrl),
                  controls: "",
                  autoplay: ""
                }, null, 8, _hoisted_16)
              ])
            ])
          ])) : createCommentVNode("", true)
        ]))
      ]);
    };
  }
});
const LipSyncSourceCodeSection = /* @__PURE__ */ _export_sfc(_sfc_main$5, [["__scopeId", "data-v-3535d576"]]);
const _hoisted_1$4 = { class: "sc-config-form" };
const _hoisted_2$4 = { class: "config-field" };
const _sfc_main$4 = /* @__PURE__ */ defineComponent({
  __name: "LipSyncSourceCodeConfigForm",
  setup(__props) {
    const { config } = useLipSyncSourceCode();
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", _hoisted_1$4, [
        _cache[2] || (_cache[2] = createBaseVNode("p", { class: "config-tip" }, [
          createTextVNode(" 前往 "),
          createBaseVNode("a", {
            href: "https://moark.com/",
            target: "_blank",
            rel: "noreferrer"
          }, "https://moark.com/"),
          createTextVNode(" 注册账号，"),
          createBaseVNode("strong", { class: "highlight-red" }, "每天赠送 100次"),
          createTextVNode(" 免费调用机会。 ")
        ], -1)),
        createBaseVNode("label", _hoisted_2$4, [
          _cache[1] || (_cache[1] = createBaseVNode("span", null, "API KEY", -1)),
          withDirectives(createBaseVNode("input", {
            "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => unref(config).apiKey = $event),
            type: "text",
            placeholder: "请输入您的 API KEY"
          }, null, 512), [
            [vModelText, unref(config).apiKey]
          ])
        ])
      ]);
    };
  }
});
const LipSyncSourceCodeConfigForm = /* @__PURE__ */ _export_sfc(_sfc_main$4, [["__scopeId", "data-v-2fc346dd"]]);
const _hoisted_1$3 = { class: "lip-sync-tool" };
const _hoisted_2$3 = {
  key: 0,
  class: "modal-backdrop"
};
const _hoisted_3$3 = {
  class: "config-modal",
  role: "dialog",
  "aria-modal": "true"
};
const _hoisted_4$1 = { class: "modal-header" };
const _hoisted_5$1 = { class: "config-modal-body" };
const _hoisted_6$1 = { class: "provider-select-field" };
const _hoisted_8 = { class: "modal-actions" };
const _hoisted_9 = ["disabled"];
const _hoisted_10$1 = ["disabled"];
const _sfc_main$3 = /* @__PURE__ */ defineComponent({
  __name: "WaveSpeedLipSyncSection",
  props: {
    voiceAudioBlob: {},
    voiceAudioUrl: {}
  },
  setup(__props) {
    const props = __props;
    const { activeProvider, saveActive, isConfigModalOpen, closeConfigModal } = useLipSyncActive();
    const waveSpeedState = useVideoLipSync();
    const sourceCodeState = useLipSyncSourceCode();
    const effectiveProvider = computed(
      () => activeProvider.value === "wavespeed" ? "sourcecode" : activeProvider.value
    );
    const pendingProvider = /* @__PURE__ */ ref(
      "sourcecode"
    );
    const isSavingConfig = computed(
      () => waveSpeedState.isSavingConfig.value || sourceCodeState.isSavingConfig.value
    );
    watch(isConfigModalOpen, (open) => {
      if (open) {
        pendingProvider.value = activeProvider.value === "wavespeed" ? "sourcecode" : activeProvider.value;
      }
    });
    async function saveConfigAndSwitchProvider() {
      if (pendingProvider.value === "wavespeed") {
        if (!waveSpeedState.wavespeedApiKey.value.trim()) {
          ElMessage.warning("请填写 WaveSpeed API KEY");
          return;
        }
        await waveSpeedState.saveConfig();
      } else {
        if (!sourceCodeState.config.apiKey.trim()) {
          ElMessage.warning("请先填写模力方舟的 API KEY");
          return;
        }
        await sourceCodeState.saveConfig();
      }
      if (pendingProvider.value !== activeProvider.value) {
        await saveActive(pendingProvider.value);
      }
      closeConfigModal();
    }
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", _hoisted_1$3, [
        createVNode(unref(ElDivider), {
          class: "step-divider",
          style: { "margin-bottom": "25px", "margin-top": "25px" }
        }, {
          default: withCtx(() => [..._cache[3] || (_cache[3] = [
            createTextVNode("第四步：视频对口型", -1)
          ])]),
          _: 1
        }),
        effectiveProvider.value === "wavespeed" ? (openBlock(), createBlock(LipSyncWaveSpeedSection, {
          key: 0,
          "voice-audio-url": props.voiceAudioUrl,
          "voice-audio-blob": props.voiceAudioBlob
        }, null, 8, ["voice-audio-url", "voice-audio-blob"])) : (openBlock(), createBlock(LipSyncSourceCodeSection, {
          key: 1,
          "voice-audio-url": props.voiceAudioUrl,
          "voice-audio-blob": props.voiceAudioBlob
        }, null, 8, ["voice-audio-url", "voice-audio-blob"])),
        (openBlock(), createBlock(Teleport, { to: "body" }, [
          unref(isConfigModalOpen) ? (openBlock(), createElementBlock("div", _hoisted_2$3, [
            createBaseVNode("section", _hoisted_3$3, [
              createBaseVNode("header", _hoisted_4$1, [
                _cache[4] || (_cache[4] = createBaseVNode("h2", null, "视频对口型模型配置", -1)),
                createBaseVNode("button", {
                  class: "icon-button",
                  type: "button",
                  "aria-label": "关闭配置",
                  onClick: _cache[0] || (_cache[0] = //@ts-ignore
                  (...args) => unref(closeConfigModal) && unref(closeConfigModal)(...args))
                }, "×")
              ]),
              createBaseVNode("div", _hoisted_5$1, [
                createBaseVNode("label", _hoisted_6$1, [
                  _cache[6] || (_cache[6] = createBaseVNode("span", null, "模型方", -1)),
                  withDirectives(createBaseVNode("select", {
                    "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => pendingProvider.value = $event)
                  }, [
                    createCommentVNode("", true),
                    _cache[5] || (_cache[5] = createBaseVNode("option", { value: "sourcecode" }, "模力方舟（在线模型）", -1))
                  ], 512), [
                    [vModelSelect, pendingProvider.value]
                  ])
                ]),
                (openBlock(), createBlock(LipSyncSourceCodeConfigForm, { key: 1 }))
              ]),
              createBaseVNode("footer", _hoisted_8, [
                createBaseVNode("button", {
                  class: "secondary-button",
                  type: "button",
                  disabled: isSavingConfig.value,
                  onClick: _cache[2] || (_cache[2] = //@ts-ignore
                  (...args) => unref(closeConfigModal) && unref(closeConfigModal)(...args))
                }, " 取消 ", 8, _hoisted_9),
                createBaseVNode("button", {
                  class: "primary-button",
                  type: "button",
                  disabled: isSavingConfig.value,
                  onClick: saveConfigAndSwitchProvider
                }, toDisplayString(isSavingConfig.value ? "保存中..." : "保存配置"), 9, _hoisted_10$1)
              ])
            ])
          ])) : createCommentVNode("", true)
        ]))
      ]);
    };
  }
});
const WaveSpeedLipSyncSection = /* @__PURE__ */ _export_sfc(_sfc_main$3, [["__scopeId", "data-v-6abe0ebc"]]);
const _hoisted_1$2 = { class: "lip-sync-result-section" };
const _hoisted_2$2 = ["src"];
const _hoisted_3$2 = {
  key: 1,
  class: "empty-result"
};
const _sfc_main$2 = /* @__PURE__ */ defineComponent({
  __name: "WaveSpeedLipSyncResultColumn",
  setup(__props) {
    const { activeProvider } = useLipSyncActive();
    const { hasWaveSpeedResult, waveSpeedResultVideoUrl } = useVideoLipSync();
    const sourceCodeState = useLipSyncSourceCode();
    const effectiveProvider = computed(
      () => activeProvider.value === "wavespeed" ? "sourcecode" : activeProvider.value
    );
    const hasResult = computed(
      () => effectiveProvider.value === "sourcecode" ? sourceCodeState.hasResult.value : hasWaveSpeedResult.value
    );
    const resultVideoUrl = computed(
      () => effectiveProvider.value === "sourcecode" ? sourceCodeState.resultVideoUrl.value : waveSpeedResultVideoUrl.value
    );
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("section", _hoisted_1$2, [
        hasResult.value ? (openBlock(), createElementBlock("video", {
          key: 0,
          class: "result-video",
          src: resultVideoUrl.value,
          controls: "",
          autoplay: ""
        }, null, 8, _hoisted_2$2)) : (openBlock(), createElementBlock("div", _hoisted_3$2, [
          createVNode(unref(video_camera_default), {
            class: "empty-result-icon",
            "aria-hidden": "true"
          }),
          _cache[0] || (_cache[0] = createBaseVNode("span", null, "对口型视频预览", -1))
        ]))
      ]);
    };
  }
});
const WaveSpeedLipSyncResultColumn = /* @__PURE__ */ _export_sfc(_sfc_main$2, [["__scopeId", "data-v-b639fd01"]]);
const _hoisted_1$1 = { class: "feature-column" };
const _hoisted_2$1 = { class: "column-body voice-tool" };
const _hoisted_3$1 = {
  key: 0,
  class: "modal-backdrop"
};
const _hoisted_4 = {
  class: "config-modal",
  role: "dialog",
  "aria-modal": "true"
};
const _hoisted_5 = { class: "modal-header" };
const _hoisted_6 = { class: "config-modal-body" };
const _hoisted_7 = { class: "provider-select-field" };
const _hoisted_10 = { class: "modal-actions" };
const _hoisted_11 = ["disabled"];
const _hoisted_12 = ["disabled"];
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "VoiceCloneColumn",
  setup(__props) {
    const { activeProvider, saveActive, isConfigModalOpen, closeConfigModal } = useVoiceCloneActive();
    const moarkState = useVoiceCloneMoark();
    const synthesizedAudioUrl = computed(() => moarkState.synthesizedAudioUrl.value);
    const synthesizedAudioBlob = computed(() => null);
    const pendingProvider = /* @__PURE__ */ ref("moark");
    const isSavingConfig = computed(() => moarkState.isSavingConfig.value);
    watch(isConfigModalOpen, (open) => {
      if (open) {
        pendingProvider.value = "moark";
      }
    });
    async function saveConfigAndSwitchProvider() {
      if (pendingProvider.value === "moark") {
        if (!moarkState.config.apiKey.trim()) {
          ElMessage.warning("请填写模力方舟 API KEY");
          return;
        }
        await moarkState.saveConfig();
      }
      if (pendingProvider.value !== activeProvider.value) {
        await saveActive(pendingProvider.value);
      }
      closeConfigModal();
    }
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("article", _hoisted_1$1, [
        createBaseVNode("div", _hoisted_2$1, [
          createVNode(unref(ElDivider), { class: "step-divider" }, {
            default: withCtx(() => [..._cache[3] || (_cache[3] = [
              createTextVNode("第三步：语音克隆合成", -1)
            ])]),
            _: 1
          }),
          createVNode(VoiceCloneMoarkSection),
          createVNode(WaveSpeedLipSyncSection, {
            "voice-audio-url": synthesizedAudioUrl.value,
            "voice-audio-blob": synthesizedAudioBlob.value
          }, null, 8, ["voice-audio-url", "voice-audio-blob"]),
          createVNode(WaveSpeedLipSyncResultColumn)
        ]),
        (openBlock(), createBlock(Teleport, { to: "body" }, [
          unref(isConfigModalOpen) ? (openBlock(), createElementBlock("div", _hoisted_3$1, [
            createBaseVNode("section", _hoisted_4, [
              createBaseVNode("header", _hoisted_5, [
                _cache[4] || (_cache[4] = createBaseVNode("h2", null, "语音克隆模型配置", -1)),
                createBaseVNode("button", {
                  class: "icon-button",
                  type: "button",
                  "aria-label": "关闭",
                  onClick: _cache[0] || (_cache[0] = //@ts-ignore
                  (...args) => unref(closeConfigModal) && unref(closeConfigModal)(...args))
                }, "×")
              ]),
              createBaseVNode("div", _hoisted_6, [
                createBaseVNode("label", _hoisted_7, [
                  _cache[6] || (_cache[6] = createBaseVNode("span", null, "模型方", -1)),
                  withDirectives(createBaseVNode("select", {
                    "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => pendingProvider.value = $event)
                  }, [
                    _cache[5] || (_cache[5] = createBaseVNode("option", { value: "moark" }, "模力方舟（在线模型）", -1)),
                    createCommentVNode("", true),
                    createCommentVNode("", true)
                  ], 512), [
                    [vModelSelect, pendingProvider.value]
                  ])
                ]),
                pendingProvider.value === "moark" ? (openBlock(), createBlock(VoiceCloneMoarkConfigForm, { key: 0 })) : createCommentVNode("", true)
              ]),
              createBaseVNode("footer", _hoisted_10, [
                createBaseVNode("button", {
                  class: "secondary-button",
                  type: "button",
                  disabled: isSavingConfig.value,
                  onClick: _cache[2] || (_cache[2] = //@ts-ignore
                  (...args) => unref(closeConfigModal) && unref(closeConfigModal)(...args))
                }, " 取消 ", 8, _hoisted_11),
                createBaseVNode("button", {
                  class: "primary-button",
                  type: "button",
                  disabled: isSavingConfig.value,
                  onClick: saveConfigAndSwitchProvider
                }, toDisplayString(isSavingConfig.value ? "保存中..." : "保存配置"), 9, _hoisted_12)
              ])
            ])
          ])) : createCommentVNode("", true)
        ]))
      ]);
    };
  }
});
const VoiceCloneColumn = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["__scopeId", "data-v-58a2ec28"]]);
const _hoisted_1 = { class: "app-frame" };
const _hoisted_2 = { class: "app-content" };
const _hoisted_3 = {
  class: "column-board",
  "aria-label": "功能模块区域"
};
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "App",
  setup(__props) {
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", _hoisted_1, [
        createVNode(AppHeader),
        createBaseVNode("main", _hoisted_2, [
          createBaseVNode("section", _hoisted_3, [
            createVNode(DouyinExtractionColumn),
            createVNode(VoiceCloneColumn),
            createVNode(SubtitleRecognitionColumn),
            createVNode(ExportColumn)
          ])
        ]),
        createVNode(AppFooter)
      ]);
    };
  }
});
createApp(_sfc_main).mount("#app");
