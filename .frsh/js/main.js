var L,
  d,
  $,
  rn,
  S,
  F,
  on,
  P = {},
  V = [],
  ln = /acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i;
function k(n, e) {
  for (var t in e) n[t] = e[t];
  return n;
}
function j(n) {
  var e = n.parentNode;
  e && e.removeChild(n);
}
function A(n, e, t) {
  var l, i, o, s = {};
  for (o in e) o == "key" ? l = e[o] : o == "ref" ? i = e[o] : s[o] = e[o];
  if (
    arguments.length > 2 &&
    (s.children = arguments.length > 3 ? L.call(arguments, 2) : t),
      typeof n == "function" && n.defaultProps != null
  ) for (o in n.defaultProps) s[o] === void 0 && (s[o] = n.defaultProps[o]);
  return E(n, s, l, i, null);
}
function E(n, e, t, l, i) {
  var o = {
    type: n,
    props: e,
    key: t,
    ref: l,
    __k: null,
    __: null,
    __b: 0,
    __e: null,
    __d: void 0,
    __c: null,
    __h: null,
    constructor: void 0,
    __v: i ?? ++$,
  };
  return i == null && d.vnode != null && d.vnode(o), o;
}
function W(n) {
  return n.children;
}
function w(n, e) {
  this.props = n, this.context = e;
}
function x(n, e) {
  if (e == null) return n.__ ? x(n.__, n.__.__k.indexOf(n) + 1) : null;
  for (var t; e < n.__k.length; e++) {
    if ((t = n.__k[e]) != null && t.__e != null) return t.__e;
  }
  return typeof n.type == "function" ? x(n) : null;
}
function G(n) {
  var e, t;
  if ((n = n.__) != null && n.__c != null) {
    for (n.__e = n.__c.base = null, e = 0; e < n.__k.length; e++) {
      if ((t = n.__k[e]) != null && t.__e != null) {
        n.__e = n.__c.base = t.__e;
        break;
      }
    }
    return G(n);
  }
}
function M(n) {
  (!n.__d && (n.__d = !0) && S.push(n) && !U.__r++ ||
    F !== d.debounceRendering) && ((F = d.debounceRendering) || setTimeout)(U);
}
function U() {
  for (var n; U.__r = S.length;) {
    n = S.sort(function (e, t) {
      return e.__v.__b - t.__v.__b;
    }),
      S = [],
      n.some(function (e) {
        var t, l, i, o, s, f;
        e.__d && (s = (o = (t = e).__v).__e,
          (f = t.__P) &&
          (l = [],
            (i = k({}, o)).__v = o.__v + 1,
            D(
              f,
              o,
              i,
              t.__n,
              f.ownerSVGElement !== void 0,
              o.__h != null ? [s] : null,
              l,
              s ?? x(o),
              o.__h,
            ),
            Y(l, o),
            o.__e != s && G(o)));
      });
  }
}
function z(n, e, t, l, i, o, s, f, a, p) {
  var r, h, u, _, c, b, m, v = l && l.__k || V, g = v.length;
  for (t.__k = [], r = 0; r < e.length; r++) {
    if (
      (_ = t.__k[r] = (_ = e[r]) == null || typeof _ == "boolean"
        ? null
        : typeof _ == "string" || typeof _ == "number" || typeof _ == "bigint"
        ? E(null, _, null, null, _)
        : Array.isArray(_)
        ? E(W, { children: _ }, null, null, null)
        : _.__b > 0
        ? E(_.type, _.props, _.key, _.ref ? _.ref : null, _.__v)
        : _) != null
    ) {
      if (
        _.__ = t,
          _.__b = t.__b + 1,
          (u = v[r]) === null || u && _.key == u.key && _.type === u.type
      ) v[r] = void 0;
      else {for (h = 0; h < g; h++) {
          if ((u = v[h]) && _.key == u.key && _.type === u.type) {
            v[h] = void 0;
            break;
          }
          u = null;
        }}
      D(n, _, u = u || P, i, o, s, f, a, p),
        c = _.__e,
        (h = _.ref) && u.ref != h &&
        (m || (m = []),
          u.ref && m.push(u.ref, null, _),
          m.push(h, _.__c || c, _)),
        c != null
          ? (b == null && (b = c),
            typeof _.type == "function" && _.__k === u.__k
              ? _.__d = a = K(_, a, n)
              : a = X(n, _, u, v, c, a),
            typeof t.type == "function" && (t.__d = a))
          : a && u.__e == a && a.parentNode != n && (a = x(u));
    }
  }
  for (t.__e = b, r = g; r--;) {
    v[r] != null &&
      (typeof t.type == "function" && v[r].__e != null && v[r].__e == t.__d &&
        (t.__d = x(l, r + 1)),
        J(v[r], v[r]));
  }
  if (m) for (r = 0; r < m.length; r++) q(m[r], m[++r], m[++r]);
}
function K(n, e, t) {
  for (var l, i = n.__k, o = 0; i && o < i.length; o++) {
    (l = i[o]) &&
      (l.__ = n,
        e = typeof l.type == "function" ? K(l, e, t) : X(t, l, l, i, l.__e, e));
  }
  return e;
}
function X(n, e, t, l, i, o) {
  var s, f, a;
  if (e.__d !== void 0) s = e.__d, e.__d = void 0;
  else if (t == null || i != o || i.parentNode == null) {
    n:
    if (o == null || o.parentNode !== n) n.appendChild(i), s = null;
    else {
      for (
        f = o, a = 0;
        (f = f.nextSibling) && a < l.length;
        a += 2
      ) if (f == i) break n;
      n.insertBefore(i, o), s = o;
    }
  }
  return s !== void 0 ? s : i.nextSibling;
}
function _n(n, e, t, l, i) {
  var o;
  for (o in t) {
    o === "children" || o === "key" || o in e || H(n, o, null, t[o], l);
  }
  for (o in e) {
    i && typeof e[o] != "function" || o === "children" || o === "key" ||
      o === "value" || o === "checked" || t[o] === e[o] ||
      H(n, o, e[o], t[o], l);
  }
}
function I(n, e, t) {
  e[0] === "-"
    ? n.setProperty(e, t)
    : n[e] = t == null ? "" : typeof t != "number" || ln.test(e) ? t : t + "px";
}
function H(n, e, t, l, i) {
  var o;
  n:
  if (e === "style") {
    if (typeof t == "string") n.style.cssText = t;
    else {
      if (typeof l == "string" && (n.style.cssText = l = ""), l) {
        for (e in l) t && e in t || I(n.style, e, "");
      }
      if (t) for (e in t) l && t[e] === l[e] || I(n.style, e, t[e]);
    }
  } else if (e[0] === "o" && e[1] === "n") {
    o = e !== (e = e.replace(/Capture$/, "")),
      e = e.toLowerCase() in n ? e.toLowerCase().slice(2) : e.slice(2),
      n.l || (n.l = {}),
      n.l[e + o] = t,
      t
        ? l || n.addEventListener(e, o ? O : B, o)
        : n.removeEventListener(e, o ? O : B, o);
  } else if (e !== "dangerouslySetInnerHTML") {
    if (i) e = e.replace(/xlink(H|:h)/, "h").replace(/sName$/, "s");
    else if (
      e !== "href" && e !== "list" && e !== "form" && e !== "tabIndex" &&
      e !== "download" && e in n
    ) {
      try {
        n[e] = t ?? "";
        break n;
      } catch {}
    }
    typeof t == "function" ||
      (t != null && (t !== !1 || e[0] === "a" && e[1] === "r")
        ? n.setAttribute(e, t)
        : n.removeAttribute(e));
  }
}
function B(n) {
  this.l[n.type + !1](d.event ? d.event(n) : n);
}
function O(n) {
  this.l[n.type + !0](d.event ? d.event(n) : n);
}
function D(n, e, t, l, i, o, s, f, a) {
  var p, r, h, u, _, c, b, m, v, g, C, R, N, y = e.type;
  if (e.constructor !== void 0) return null;
  t.__h != null && (a = t.__h, f = e.__e = t.__e, e.__h = null, o = [f]),
    (p = d.__b) && p(e);
  try {
    n:
    if (typeof y == "function") {
      if (
        m = e.props,
          v = (p = y.contextType) && l[p.__c],
          g = p ? v ? v.props.value : p.__ : l,
          t.__c
            ? b = (r = e.__c = t.__c).__ = r.__E
            : ("prototype" in y && y.prototype.render
              ? e.__c = r = new y(m, g)
              : (e.__c = r = new w(m, g), r.constructor = y, r.render = un),
              v && v.sub(r),
              r.props = m,
              r.state || (r.state = {}),
              r.context = g,
              r.__n = l,
              h = r.__d = !0,
              r.__h = []),
          r.__s == null && (r.__s = r.state),
          y.getDerivedStateFromProps != null &&
          (r.__s == r.state && (r.__s = k({}, r.__s)),
            k(r.__s, y.getDerivedStateFromProps(m, r.__s))),
          u = r.props,
          _ = r.state,
          h
      ) {
        y.getDerivedStateFromProps == null && r.componentWillMount != null &&
        r.componentWillMount(),
          r.componentDidMount != null && r.__h.push(r.componentDidMount);
      } else {
        if (
          y.getDerivedStateFromProps == null && m !== u &&
          r.componentWillReceiveProps != null &&
          r.componentWillReceiveProps(m, g),
            !r.__e && r.shouldComponentUpdate != null &&
              r.shouldComponentUpdate(m, r.__s, g) === !1 || e.__v === t.__v
        ) {
          r.props = m,
            r.state = r.__s,
            e.__v !== t.__v && (r.__d = !1),
            r.__v = e,
            e.__e = t.__e,
            e.__k = t.__k,
            e.__k.forEach(function (T) {
              T && (T.__ = e);
            }),
            r.__h.length && s.push(r);
          break n;
        }
        r.componentWillUpdate != null && r.componentWillUpdate(m, r.__s, g),
          r.componentDidUpdate != null && r.__h.push(function () {
            r.componentDidUpdate(u, _, c);
          });
      }
      if (
        r.context = g,
          r.props = m,
          r.__v = e,
          r.__P = n,
          C = d.__r,
          R = 0,
          "prototype" in y && y.prototype.render
      ) {
        r.state = r.__s,
          r.__d = !1,
          C && C(e),
          p = r.render(r.props, r.state, r.context);
      } else {do r.__d = !1,
          C && C(e),
          p = r.render(r.props, r.state, r.context),
          r.state = r.__s; while (r.__d && ++R < 25);}
      r.state = r.__s,
        r.getChildContext != null && (l = k(k({}, l), r.getChildContext())),
        h || r.getSnapshotBeforeUpdate == null ||
        (c = r.getSnapshotBeforeUpdate(u, _)),
        N = p != null && p.type === W && p.key == null ? p.props.children : p,
        z(n, Array.isArray(N) ? N : [N], e, t, l, i, o, s, f, a),
        r.base = e.__e,
        e.__h = null,
        r.__h.length && s.push(r),
        b && (r.__E = r.__ = null),
        r.__e = !1;
    } else {o == null && e.__v === t.__v
        ? (e.__k = t.__k, e.__e = t.__e)
        : e.__e = sn(t.__e, e, t, l, i, o, s, a);}
    (p = d.diffed) && p(e);
  } catch (T) {
    e.__v = null,
      (a || o != null) && (e.__e = f, e.__h = !!a, o[o.indexOf(f)] = null),
      d.__e(T, e, t);
  }
}
function Y(n, e) {
  d.__c && d.__c(e, n),
    n.some(function (t) {
      try {
        n = t.__h,
          t.__h = [],
          n.some(function (l) {
            l.call(t);
          });
      } catch (l) {
        d.__e(l, t.__v);
      }
    });
}
function sn(n, e, t, l, i, o, s, f) {
  var a, p, r, h = t.props, u = e.props, _ = e.type, c = 0;
  if (_ === "svg" && (i = !0), o != null) {
    for (; c < o.length; c++) {
      if (
        (a = o[c]) && "setAttribute" in a == !!_ &&
        (_ ? a.localName === _ : a.nodeType === 3)
      ) {
        n = a, o[c] = null;
        break;
      }
    }
  }
  if (n == null) {
    if (_ === null) return document.createTextNode(u);
    n = i
      ? document.createElementNS("http://www.w3.org/2000/svg", _)
      : document.createElement(_, u.is && u),
      o = null,
      f = !1;
  }
  if (_ === null) h === u || f && n.data === u || (n.data = u);
  else {
    if (
      o = o && L.call(n.childNodes),
        p = (h = t.props || P).dangerouslySetInnerHTML,
        r = u.dangerouslySetInnerHTML,
        !f
    ) {
      if (o != null) {
        for (
          h = {}, c = 0;
          c < n.attributes.length;
          c++
        ) h[n.attributes[c].name] = n.attributes[c].value;
      }
      (r || p) &&
        (r && (p && r.__html == p.__html || r.__html === n.innerHTML) ||
          (n.innerHTML = r && r.__html || ""));
    }
    if (_n(n, u, h, i, f), r) e.__k = [];
    else if (
      c = e.props.children,
        z(
          n,
          Array.isArray(c) ? c : [c],
          e,
          t,
          l,
          i && _ !== "foreignObject",
          o,
          s,
          o ? o[0] : t.__k && x(t, 0),
          f,
        ),
        o != null
    ) for (c = o.length; c--;) o[c] != null && j(o[c]);
    f ||
      ("value" in u && (c = u.value) !== void 0 &&
        (c !== n.value || _ === "progress" && !c ||
          _ === "option" && c !== h.value) &&
        H(n, "value", c, h.value, !1),
        "checked" in u && (c = u.checked) !== void 0 && c !== n.checked &&
        H(n, "checked", c, h.checked, !1));
  }
  return n;
}
function q(n, e, t) {
  try {
    typeof n == "function" ? n(e) : n.current = e;
  } catch (l) {
    d.__e(l, t);
  }
}
function J(n, e, t) {
  var l, i;
  if (
    d.unmount && d.unmount(n),
      (l = n.ref) && (l.current && l.current !== n.__e || q(l, null, e)),
      (l = n.__c) != null
  ) {
    if (l.componentWillUnmount) {
      try {
        l.componentWillUnmount();
      } catch (o) {
        d.__e(o, e);
      }
    }
    l.base = l.__P = null, n.__c = void 0;
  }
  if (l = n.__k) {
    for (i = 0; i < l.length; i++) {
      l[i] && J(l[i], e, typeof n.type != "function");
    }
  }
  t || n.__e == null || j(n.__e), n.__ = n.__e = n.__d = void 0;
}
function un(n, e, t) {
  return this.constructor(n, t);
}
function Q(n, e, t) {
  var l, i, o;
  d.__ && d.__(n, e),
    i = (l = typeof t == "function") ? null : t && t.__k || e.__k,
    o = [],
    D(
      e,
      n = (!l && t || e).__k = A(W, null, [n]),
      i || P,
      P,
      e.ownerSVGElement !== void 0,
      !l && t ? [t] : i ? null : e.firstChild ? L.call(e.childNodes) : null,
      o,
      !l && t ? t : i ? i.__e : e.firstChild,
      l,
    ),
    Y(o, n);
}
L = V.slice,
  d = {
    __e: function (n, e, t, l) {
      for (var i, o, s; e = e.__;) {
        if ((i = e.__c) && !i.__) {
          try {
            if (
              (o = i.constructor) && o.getDerivedStateFromError != null &&
              (i.setState(o.getDerivedStateFromError(n)), s = i.__d),
                i.componentDidCatch != null &&
                (i.componentDidCatch(n, l || {}), s = i.__d),
                s
            ) return i.__E = i;
          } catch (f) {
            n = f;
          }
        }
      }
      throw n;
    },
  },
  $ = 0,
  rn = function (n) {
    return n != null && n.constructor === void 0;
  },
  w.prototype.setState = function (n, e) {
    var t;
    t = this.__s != null && this.__s !== this.state
      ? this.__s
      : this.__s = k({}, this.state),
      typeof n == "function" && (n = n(k({}, t), this.props)),
      n && k(t, n),
      n != null && this.__v && (e && this.__h.push(e), M(this));
  },
  w.prototype.forceUpdate = function (n) {
    this.__v && (this.__e = !0, n && this.__h.push(n), M(this));
  },
  w.prototype.render = W,
  S = [],
  U.__r = 0,
  on = 0;
var Z = "__frsh_c";
function nn(n) {
  if (!n.startsWith("/") || n.startsWith("//")) return n;
  try {
    let e = new URL(n, "https://freshassetcache.local");
    return e.protocol !== "https:" || e.host !== "freshassetcache.local" ||
        e.searchParams.has(Z)
      ? n
      : (e.searchParams.set(Z, "5acec19f451c1e7d621cbb87dd7bff3ece3e6bb4"),
        e.pathname + e.search + e.hash);
  } catch (e) {
    return console.warn(
      `Failed to create asset() URL, falling back to regular path ('${n}'):`,
      e,
    ),
      n;
  }
}
function cn(n) {
  if (n.includes("(")) return n;
  let e = n.split(","), t = [];
  for (let l of e) {
    let i = l.trimStart(), o = l.length - i.length;
    if (i === "") return n;
    let s = i.indexOf(" ");
    s === -1 && (s = i.length);
    let f = l.substring(0, o), a = i.substring(0, s), p = i.substring(s);
    t.push(f + nn(a) + p);
  }
  return t.join(",");
}
function en(n) {
  if (n.type === "img" || n.type === "source") {
    let { props: e } = n;
    if (e["data-fresh-disable-lock"]) return;
    typeof e.src == "string" && (e.src = nn(e.src)),
      typeof e.srcset == "string" && (e.srcset = cn(e.srcset));
  }
}
function an(n, e) {
  e = [].concat(e);
  let t = e[e.length - 1].nextSibling;
  function l(i, o) {
    n.insertBefore(i, o || t);
  }
  return n.__k = {
    nodeType: 1,
    parentNode: n,
    firstChild: e[0],
    childNodes: e,
    insertBefore: l,
    appendChild: l,
    removeChild: function (i) {
      n.removeChild(i);
    },
  };
}
var fn = (n) => {
  "scheduler" in window ? window.scheduler.postTask(n) : setTimeout(n, 0);
};
function kn(n, e) {
  function t(l) {
    let i = l.nodeType === 8 && (l.data.match(/^\s*frsh-(.*)\s*$/) || [])[1],
      o = null;
    if (i) {
      let a = l, p = [], r = l.parentNode;
      for (; (l = l.nextSibling) && l.nodeType !== 8;) p.push(l);
      a.parentNode.removeChild(a);
      let [h, u] = i.split(":");
      fn(() => {
        performance.mark(i),
          Q(A(n[h], e[Number(u)]), an(r, p)),
          performance.measure(`hydrate: ${h}`, i);
      }), o = l;
    }
    let s = l.nextSibling, f = l.firstChild;
    o && o.parentNode?.removeChild(o), s && t(s), f && t(f);
  }
  performance.mark("revive-start"),
    t(document.body),
    performance.measure("revive", "revive-start");
}
var tn = d.vnode;
d.vnode = (n) => {
  en(n), tn && tn(n);
};
export { kn as revive };
