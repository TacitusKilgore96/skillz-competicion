(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/node_modules/next/dist/compiled/react/cjs/react-compiler-runtime.development.js [app-client] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
/**
 * @license React
 * react-compiler-runtime.development.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ "use strict";
"production" !== ("TURBOPACK compile-time value", "development") && function() {
    var ReactSharedInternals = __turbopack_context__.r("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)").__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;
    exports.c = function(size) {
        var dispatcher = ReactSharedInternals.H;
        null === dispatcher && console.error("Invalid hook call. Hooks can only be called inside of the body of a function component. This could happen for one of the following reasons:\n1. You might have mismatching versions of React and the renderer (such as React DOM)\n2. You might be breaking the Rules of Hooks\n3. You might have more than one copy of React in the same app\nSee https://react.dev/link/invalid-hook-call for tips about how to debug and fix this problem.");
        return dispatcher.useMemoCache(size);
    };
}();
}),
"[project]/node_modules/next/dist/compiled/react/cjs/react-jsx-dev-runtime.development.js [app-client] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
/**
 * @license React
 * react-jsx-dev-runtime.development.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ "use strict";
"production" !== ("TURBOPACK compile-time value", "development") && function() {
    function getComponentNameFromType(type) {
        if (null == type) return null;
        if ("function" === typeof type) return type.$$typeof === REACT_CLIENT_REFERENCE ? null : type.displayName || type.name || null;
        if ("string" === typeof type) return type;
        switch(type){
            case REACT_FRAGMENT_TYPE:
                return "Fragment";
            case REACT_PROFILER_TYPE:
                return "Profiler";
            case REACT_STRICT_MODE_TYPE:
                return "StrictMode";
            case REACT_SUSPENSE_TYPE:
                return "Suspense";
            case REACT_SUSPENSE_LIST_TYPE:
                return "SuspenseList";
            case REACT_ACTIVITY_TYPE:
                return "Activity";
            case REACT_VIEW_TRANSITION_TYPE:
                return "ViewTransition";
        }
        if ("object" === typeof type) switch("number" === typeof type.tag && console.error("Received an unexpected object in getComponentNameFromType(). This is likely a bug in React. Please file an issue."), type.$$typeof){
            case REACT_PORTAL_TYPE:
                return "Portal";
            case REACT_CONTEXT_TYPE:
                return type.displayName || "Context";
            case REACT_CONSUMER_TYPE:
                return (type._context.displayName || "Context") + ".Consumer";
            case REACT_FORWARD_REF_TYPE:
                var innerType = type.render;
                type = type.displayName;
                type || (type = innerType.displayName || innerType.name || "", type = "" !== type ? "ForwardRef(" + type + ")" : "ForwardRef");
                return type;
            case REACT_MEMO_TYPE:
                return innerType = type.displayName || null, null !== innerType ? innerType : getComponentNameFromType(type.type) || "Memo";
            case REACT_LAZY_TYPE:
                innerType = type._payload;
                type = type._init;
                try {
                    return getComponentNameFromType(type(innerType));
                } catch (x) {}
        }
        return null;
    }
    function testStringCoercion(value) {
        return "" + value;
    }
    function checkKeyStringCoercion(value) {
        try {
            testStringCoercion(value);
            var JSCompiler_inline_result = !1;
        } catch (e) {
            JSCompiler_inline_result = !0;
        }
        if (JSCompiler_inline_result) {
            JSCompiler_inline_result = console;
            var JSCompiler_temp_const = JSCompiler_inline_result.error;
            var JSCompiler_inline_result$jscomp$0 = "function" === typeof Symbol && Symbol.toStringTag && value[Symbol.toStringTag] || value.constructor.name || "Object";
            JSCompiler_temp_const.call(JSCompiler_inline_result, "The provided key is an unsupported type %s. This value must be coerced to a string before using it here.", JSCompiler_inline_result$jscomp$0);
            return testStringCoercion(value);
        }
    }
    function getTaskName(type) {
        if (type === REACT_FRAGMENT_TYPE) return "<>";
        if ("object" === typeof type && null !== type && type.$$typeof === REACT_LAZY_TYPE) return "<...>";
        try {
            var name = getComponentNameFromType(type);
            return name ? "<" + name + ">" : "<...>";
        } catch (x) {
            return "<...>";
        }
    }
    function getOwner() {
        var dispatcher = ReactSharedInternals.A;
        return null === dispatcher ? null : dispatcher.getOwner();
    }
    function UnknownOwner() {
        return Error("react-stack-top-frame");
    }
    function hasValidKey(config) {
        if (hasOwnProperty.call(config, "key")) {
            var getter = Object.getOwnPropertyDescriptor(config, "key").get;
            if (getter && getter.isReactWarning) return !1;
        }
        return void 0 !== config.key;
    }
    function defineKeyPropWarningGetter(props, displayName) {
        function warnAboutAccessingKey() {
            specialPropKeyWarningShown || (specialPropKeyWarningShown = !0, console.error("%s: `key` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://react.dev/link/special-props)", displayName));
        }
        warnAboutAccessingKey.isReactWarning = !0;
        Object.defineProperty(props, "key", {
            get: warnAboutAccessingKey,
            configurable: !0
        });
    }
    function elementRefGetterWithDeprecationWarning() {
        var componentName = getComponentNameFromType(this.type);
        didWarnAboutElementRef[componentName] || (didWarnAboutElementRef[componentName] = !0, console.error("Accessing element.ref was removed in React 19. ref is now a regular prop. It will be removed from the JSX Element type in a future release."));
        componentName = this.props.ref;
        return void 0 !== componentName ? componentName : null;
    }
    function ReactElement(type, key, props, owner, debugStack, debugTask) {
        var refProp = props.ref;
        type = {
            $$typeof: REACT_ELEMENT_TYPE,
            type: type,
            key: key,
            props: props,
            _owner: owner
        };
        null !== (void 0 !== refProp ? refProp : null) ? Object.defineProperty(type, "ref", {
            enumerable: !1,
            get: elementRefGetterWithDeprecationWarning
        }) : Object.defineProperty(type, "ref", {
            enumerable: !1,
            value: null
        });
        type._store = {};
        Object.defineProperty(type._store, "validated", {
            configurable: !1,
            enumerable: !1,
            writable: !0,
            value: 0
        });
        Object.defineProperty(type, "_debugInfo", {
            configurable: !1,
            enumerable: !1,
            writable: !0,
            value: null
        });
        Object.defineProperty(type, "_debugStack", {
            configurable: !1,
            enumerable: !1,
            writable: !0,
            value: debugStack
        });
        Object.defineProperty(type, "_debugTask", {
            configurable: !1,
            enumerable: !1,
            writable: !0,
            value: debugTask
        });
        Object.freeze && (Object.freeze(type.props), Object.freeze(type));
        return type;
    }
    function jsxDEVImpl(type, config, maybeKey, isStaticChildren, debugStack, debugTask) {
        var children = config.children;
        if (void 0 !== children) if (isStaticChildren) if (isArrayImpl(children)) {
            for(isStaticChildren = 0; isStaticChildren < children.length; isStaticChildren++)validateChildKeys(children[isStaticChildren]);
            Object.freeze && Object.freeze(children);
        } else console.error("React.jsx: Static children should always be an array. You are likely explicitly calling React.jsxs or React.jsxDEV. Use the Babel transform instead.");
        else validateChildKeys(children);
        if (hasOwnProperty.call(config, "key")) {
            children = getComponentNameFromType(type);
            var keys = Object.keys(config).filter(function(k) {
                return "key" !== k;
            });
            isStaticChildren = 0 < keys.length ? "{key: someKey, " + keys.join(": ..., ") + ": ...}" : "{key: someKey}";
            didWarnAboutKeySpread[children + isStaticChildren] || (keys = 0 < keys.length ? "{" + keys.join(": ..., ") + ": ...}" : "{}", console.error('A props object containing a "key" prop is being spread into JSX:\n  let props = %s;\n  <%s {...props} />\nReact keys must be passed directly to JSX without using spread:\n  let props = %s;\n  <%s key={someKey} {...props} />', isStaticChildren, children, keys, children), didWarnAboutKeySpread[children + isStaticChildren] = !0);
        }
        children = null;
        void 0 !== maybeKey && (checkKeyStringCoercion(maybeKey), children = "" + maybeKey);
        hasValidKey(config) && (checkKeyStringCoercion(config.key), children = "" + config.key);
        if ("key" in config) {
            maybeKey = {};
            for(var propName in config)"key" !== propName && (maybeKey[propName] = config[propName]);
        } else maybeKey = config;
        children && defineKeyPropWarningGetter(maybeKey, "function" === typeof type ? type.displayName || type.name || "Unknown" : type);
        return ReactElement(type, children, maybeKey, getOwner(), debugStack, debugTask);
    }
    function validateChildKeys(node) {
        isValidElement(node) ? node._store && (node._store.validated = 1) : "object" === typeof node && null !== node && node.$$typeof === REACT_LAZY_TYPE && ("fulfilled" === node._payload.status ? isValidElement(node._payload.value) && node._payload.value._store && (node._payload.value._store.validated = 1) : node._store && (node._store.validated = 1));
    }
    function isValidElement(object) {
        return "object" === typeof object && null !== object && object.$$typeof === REACT_ELEMENT_TYPE;
    }
    var React = __turbopack_context__.r("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)"), REACT_ELEMENT_TYPE = Symbol.for("react.transitional.element"), REACT_PORTAL_TYPE = Symbol.for("react.portal"), REACT_FRAGMENT_TYPE = Symbol.for("react.fragment"), REACT_STRICT_MODE_TYPE = Symbol.for("react.strict_mode"), REACT_PROFILER_TYPE = Symbol.for("react.profiler"), REACT_CONSUMER_TYPE = Symbol.for("react.consumer"), REACT_CONTEXT_TYPE = Symbol.for("react.context"), REACT_FORWARD_REF_TYPE = Symbol.for("react.forward_ref"), REACT_SUSPENSE_TYPE = Symbol.for("react.suspense"), REACT_SUSPENSE_LIST_TYPE = Symbol.for("react.suspense_list"), REACT_MEMO_TYPE = Symbol.for("react.memo"), REACT_LAZY_TYPE = Symbol.for("react.lazy"), REACT_ACTIVITY_TYPE = Symbol.for("react.activity"), REACT_VIEW_TRANSITION_TYPE = Symbol.for("react.view_transition"), REACT_CLIENT_REFERENCE = Symbol.for("react.client.reference"), ReactSharedInternals = React.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE, hasOwnProperty = Object.prototype.hasOwnProperty, isArrayImpl = Array.isArray, createTask = console.createTask ? console.createTask : function() {
        return null;
    };
    React = {
        react_stack_bottom_frame: function(callStackForError) {
            return callStackForError();
        }
    };
    var specialPropKeyWarningShown;
    var didWarnAboutElementRef = {};
    var unknownOwnerDebugStack = React.react_stack_bottom_frame.bind(React, UnknownOwner)();
    var unknownOwnerDebugTask = createTask(getTaskName(UnknownOwner));
    var didWarnAboutKeySpread = {};
    exports.Fragment = REACT_FRAGMENT_TYPE;
    exports.jsxDEV = function(type, config, maybeKey, isStaticChildren) {
        var trackActualOwner = 1e4 > ReactSharedInternals.recentlyCreatedOwnerStacks++;
        if (trackActualOwner) {
            var previousStackTraceLimit = Error.stackTraceLimit;
            Error.stackTraceLimit = 10;
            var debugStackDEV = Error("react-stack-top-frame");
            Error.stackTraceLimit = previousStackTraceLimit;
        } else debugStackDEV = unknownOwnerDebugStack;
        return jsxDEVImpl(type, config, maybeKey, isStaticChildren, debugStackDEV, trackActualOwner ? createTask(getTaskName(type)) : unknownOwnerDebugTask);
    };
}();
}),
"[project]/node_modules/next/dist/compiled/react/compiler-runtime.js [app-client] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ 'use strict';
if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
;
else {
    module.exports = __turbopack_context__.r("[project]/node_modules/next/dist/compiled/react/cjs/react-compiler-runtime.development.js [app-client] (ecmascript)");
}
}),
"[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
'use strict';
if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
;
else {
    module.exports = __turbopack_context__.r("[project]/node_modules/next/dist/compiled/react/cjs/react-jsx-dev-runtime.development.js [app-client] (ecmascript)");
}
}),
"[project]/src/app/stationpage/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>StationPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/compiler-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
const teams = [
    {
        id: 1,
        name: "Hold 1",
        time: "01:35"
    },
    {
        id: 2,
        name: "Hold 2",
        time: "01:22"
    },
    {
        id: 3,
        name: "Hold 3",
        time: ""
    },
    {
        id: 4,
        name: "Hold 4",
        time: "01:48"
    }
];
const normalizeTime = (value)=>{
    const trimmed = value.trim();
    if (!trimmed) {
        return "";
    }
    const hasColon = trimmed.includes(":");
    const numericValue = trimmed.replace(/[^\d:]/g, "");
    if (!numericValue) {
        return "";
    }
    let minutes = "0";
    let seconds = "0";
    if (hasColon) {
        const [left, right = "0"] = trimmed.split(":");
        minutes = left || "0";
        seconds = right || "0";
    } else {
        const digits = trimmed.replace(/\D/g, "");
        if (digits.length <= 2) {
            minutes = digits || "0";
        } else {
            minutes = digits.slice(0, 2);
            seconds = digits.slice(2, 4);
        }
    }
    const minuteValue = Number(minutes);
    const secondValue = Number(seconds);
    if (minuteValue > 59 || secondValue > 59) {
        return "";
    }
    return `${String(minuteValue).padStart(2, "0")}:${String(secondValue).padStart(2, "0")}`;
};
function StationPage() {
    _s();
    const $ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["c"])(45);
    if ($[0] !== "180e344da5637f87c9d20cfc13a29a0c5849aa216d1c103406c17f40fb36697a") {
        for(let $i = 0; $i < 45; $i += 1){
            $[$i] = Symbol.for("react.memo_cache_sentinel");
        }
        $[0] = "180e344da5637f87c9d20cfc13a29a0c5849aa216d1c103406c17f40fb36697a";
    }
    const [teamTimes, setTeamTimes] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(teams);
    let t0;
    if ($[1] === Symbol.for("react.memo_cache_sentinel")) {
        t0 = {};
        $[1] = t0;
    } else {
        t0 = $[1];
    }
    const [draftTimes, setDraftTimes] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(t0);
    let t1;
    if ($[2] === Symbol.for("react.memo_cache_sentinel")) {
        t1 = ({
            "StationPage[updateTime]": (id, time)=>{
                setDraftTimes({
                    "StationPage[updateTime > setDraftTimes()]": (current)=>({
                            ...current,
                            [id]: time.slice(0, 5)
                        })
                }["StationPage[updateTime > setDraftTimes()]"]);
            }
        })["StationPage[updateTime]"];
        $[2] = t1;
    } else {
        t1 = $[2];
    }
    const updateTime = t1;
    let t2;
    if ($[3] !== draftTimes) {
        t2 = ({
            "StationPage[saveTime]": (id_0)=>{
                const draft = normalizeTime(draftTimes[id_0] ?? "");
                if (!draft) {
                    return;
                }
                setTeamTimes({
                    "StationPage[saveTime > setTeamTimes()]": (current_0)=>current_0.map({
                            "StationPage[saveTime > setTeamTimes() > current_0.map()]": (team)=>team.id === id_0 ? {
                                    ...team,
                                    time: draft
                                } : team
                        }["StationPage[saveTime > setTeamTimes() > current_0.map()]"])
                }["StationPage[saveTime > setTeamTimes()]"]);
                setDraftTimes({
                    "StationPage[saveTime > setDraftTimes()]": (current_1)=>({
                            ...current_1,
                            [id_0]: ""
                        })
                }["StationPage[saveTime > setDraftTimes()]"]);
            }
        })["StationPage[saveTime]"];
        $[3] = draftTimes;
        $[4] = t2;
    } else {
        t2 = $[4];
    }
    const saveTime = t2;
    let t3;
    if ($[5] === Symbol.for("react.memo_cache_sentinel")) {
        t3 = ({
            "StationPage[deleteTime]": (id_1)=>{
                setTeamTimes({
                    "StationPage[deleteTime > setTeamTimes()]": (current_2)=>current_2.map({
                            "StationPage[deleteTime > setTeamTimes() > current_2.map()]": (team_0)=>team_0.id === id_1 ? {
                                    ...team_0,
                                    time: ""
                                } : team_0
                        }["StationPage[deleteTime > setTeamTimes() > current_2.map()]"])
                }["StationPage[deleteTime > setTeamTimes()]"]);
                setDraftTimes({
                    "StationPage[deleteTime > setDraftTimes()]": (current_3)=>({
                            ...current_3,
                            [id_1]: ""
                        })
                }["StationPage[deleteTime > setDraftTimes()]"]);
            }
        })["StationPage[deleteTime]"];
        $[5] = t3;
    } else {
        t3 = $[5];
    }
    const deleteTime = t3;
    let completed;
    let t4;
    if ($[6] !== teamTimes) {
        completed = teamTimes.filter(_StationPageTeamTimesFilter);
        t4 = completed.length > 0 ? completed.reduce(_StationPageCompletedReduce) : null;
        $[6] = teamTimes;
        $[7] = completed;
        $[8] = t4;
    } else {
        completed = $[7];
        t4 = $[8];
    }
    const bestTime = t4;
    let t5;
    if ($[9] === Symbol.for("react.memo_cache_sentinel")) {
        t5 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("aside", {
            className: "hidden w-62.5 shrink-0 border-r border-border bg-background-secondary p-4 md:flex md:flex-col",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mb-8 flex items-center gap-3 px-3 py-3",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "font-bold tracking-wide",
                        children: "VESTSKOLEN"
                    }, void 0, false, {
                        fileName: "[project]/src/app/stationpage/page.tsx",
                        lineNumber: 168,
                        columnNumber: 184
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/app/stationpage/page.tsx",
                    lineNumber: 168,
                    columnNumber: 179
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/stationpage/page.tsx",
                lineNumber: 168,
                columnNumber: 123
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/app/stationpage/page.tsx",
            lineNumber: 168,
            columnNumber: 10
        }, this);
        $[9] = t5;
    } else {
        t5 = $[9];
    }
    let t6;
    if ($[10] === Symbol.for("react.memo_cache_sentinel")) {
        t6 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex h-10 w-10 items-center justify-center rounded-full bg-green-light font-bold text-green-dark",
            children: "F"
        }, void 0, false, {
            fileName: "[project]/src/app/stationpage/page.tsx",
            lineNumber: 175,
            columnNumber: 10
        }, this);
        $[10] = t6;
    } else {
        t6 = $[10];
    }
    let t7;
    if ($[11] === Symbol.for("react.memo_cache_sentinel")) {
        t7 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
            className: "flex h-18.5 items-center justify-between border-b border-border bg-box-background/80 px-5 md:px-9",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center gap-3",
                children: [
                    t6,
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "hidden text-left sm:block",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "text-sm font-semibold",
                                children: "Værksted"
                            }, void 0, false, {
                                fileName: "[project]/src/app/stationpage/page.tsx",
                                lineNumber: 182,
                                columnNumber: 216
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "text-xs text-secondary",
                                children: "flemming"
                            }, void 0, false, {
                                fileName: "[project]/src/app/stationpage/page.tsx",
                                lineNumber: 182,
                                columnNumber: 269
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/stationpage/page.tsx",
                        lineNumber: 182,
                        columnNumber: 173
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/stationpage/page.tsx",
                lineNumber: 182,
                columnNumber: 128
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/app/stationpage/page.tsx",
            lineNumber: 182,
            columnNumber: 10
        }, this);
        $[11] = t7;
    } else {
        t7 = $[11];
    }
    let t8;
    if ($[12] === Symbol.for("react.memo_cache_sentinel")) {
        t8 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "mb-7 flex flex-col justify-between gap-5 lg:flex-row lg:items-center",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center gap-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-blue-background text-2xl bg-accent-blue-",
                        children: "🔧"
                    }, void 0, false, {
                        fileName: "[project]/src/app/stationpage/page.tsx",
                        lineNumber: 189,
                        columnNumber: 137
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                className: "text-3xl font-bold tracking-tight",
                                children: "Værksted"
                            }, void 0, false, {
                                fileName: "[project]/src/app/stationpage/page.tsx",
                                lineNumber: 189,
                                columnNumber: 273
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "mt-1 text-sm text-secondary",
                                children: "Registrer tider for holdene på denne post"
                            }, void 0, false, {
                                fileName: "[project]/src/app/stationpage/page.tsx",
                                lineNumber: 189,
                                columnNumber: 336
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/stationpage/page.tsx",
                        lineNumber: 189,
                        columnNumber: 268
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/stationpage/page.tsx",
                lineNumber: 189,
                columnNumber: 96
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/app/stationpage/page.tsx",
            lineNumber: 189,
            columnNumber: 10
        }, this);
        $[12] = t8;
    } else {
        t8 = $[12];
    }
    let t10;
    let t9;
    if ($[13] === Symbol.for("react.memo_cache_sentinel")) {
        t9 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(StatCard, {
            title: "Klasse",
            value: "8.A",
            description: "Vestskolen"
        }, void 0, false, {
            fileName: "[project]/src/app/stationpage/page.tsx",
            lineNumber: 197,
            columnNumber: 10
        }, this);
        t10 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(StatCard, {
            title: "Post",
            value: "3",
            description: "V\xE6rksted"
        }, void 0, false, {
            fileName: "[project]/src/app/stationpage/page.tsx",
            lineNumber: 198,
            columnNumber: 11
        }, this);
        $[13] = t10;
        $[14] = t9;
    } else {
        t10 = $[13];
        t9 = $[14];
    }
    const t11 = `${completed.length} / ${teamTimes.length}`;
    let t12;
    if ($[15] !== t11) {
        t12 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3",
            children: [
                t9,
                t10,
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(StatCard, {
                    title: "Hold",
                    value: t11,
                    description: "Tider registreret"
                }, void 0, false, {
                    fileName: "[project]/src/app/stationpage/page.tsx",
                    lineNumber: 208,
                    columnNumber: 83
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/stationpage/page.tsx",
            lineNumber: 208,
            columnNumber: 11
        }, this);
        $[15] = t11;
        $[16] = t12;
    } else {
        t12 = $[16];
    }
    let t13;
    if ($[17] === Symbol.for("react.memo_cache_sentinel")) {
        t13 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex items-center justify-between border-b border-border px-6 py-5",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                            className: "font-bold",
                            children: "Hold & tider"
                        }, void 0, false, {
                            fileName: "[project]/src/app/stationpage/page.tsx",
                            lineNumber: 216,
                            columnNumber: 100
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "mt-1 text-xs text-secondary",
                            children: "Registrer den tid hvert hold bruger på værkstedet"
                        }, void 0, false, {
                            fileName: "[project]/src/app/stationpage/page.tsx",
                            lineNumber: 216,
                            columnNumber: 147
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/stationpage/page.tsx",
                    lineNumber: 216,
                    columnNumber: 95
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "rounded-lg bg-accent-blue-background  px-3 py-2 text-xs bg-accent-blue-",
                    children: "POST 3"
                }, void 0, false, {
                    fileName: "[project]/src/app/stationpage/page.tsx",
                    lineNumber: 216,
                    columnNumber: 249
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/stationpage/page.tsx",
            lineNumber: 216,
            columnNumber: 11
        }, this);
        $[17] = t13;
    } else {
        t13 = $[17];
    }
    let t14;
    if ($[18] !== draftTimes || $[19] !== saveTime || $[20] !== teamTimes) {
        let t15;
        if ($[22] !== draftTimes || $[23] !== saveTime) {
            t15 = ({
                "StationPage[teamTimes.map()]": (team_2)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex flex-col gap-4 px-6 py-5 transition hover:bg-primary/60 sm:flex-row sm:items-center sm:justify-between",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-4",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex h-11 w-11 items-center justify-center rounded-xl bg-id-nr-background text-sm font-bold text-id-nr",
                                        children: team_2.id
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/stationpage/page.tsx",
                                        lineNumber: 226,
                                        columnNumber: 233
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "font-semibold",
                                                children: team_2.name
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/stationpage/page.tsx",
                                                lineNumber: 226,
                                                columnNumber: 375
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "mt-1 text-xs text-secondary",
                                                children: team_2.time ? "Tid registreret" : "Ingen tid registreret"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/stationpage/page.tsx",
                                                lineNumber: 226,
                                                columnNumber: 425
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/stationpage/page.tsx",
                                        lineNumber: 226,
                                        columnNumber: 370
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/stationpage/page.tsx",
                                lineNumber: 226,
                                columnNumber: 192
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-3",
                                children: team_2.time ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "rounded-xl border border-green-dark bg-success-background px-5 py-3 font-mono text-lg font-bold text-success",
                                            children: team_2.time
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/stationpage/page.tsx",
                                            lineNumber: 226,
                                            columnNumber: 605
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: {
                                                "StationPage[teamTimes.map() > <button>.onClick]": ()=>deleteTime(team_2.id)
                                            }["StationPage[teamTimes.map() > <button>.onClick]"],
                                            className: "flex h-10 w-10 items-center justify-center rounded-lg bg-danger-background text-danger transition hover:bg-danger hover:text-primary",
                                            title: "Slet tid",
                                            children: "×"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/stationpage/page.tsx",
                                            lineNumber: 226,
                                            columnNumber: 750
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/stationpage/page.tsx",
                                    lineNumber: 226,
                                    columnNumber: 603
                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center gap-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                            type: "text",
                                            placeholder: "MM:SS",
                                            value: draftTimes[team_2.id] ?? "",
                                            maxLength: 5,
                                            onChange: {
                                                "StationPage[teamTimes.map() > <input>.onChange]": (e)=>updateTime(team_2.id, e.target.value)
                                            }["StationPage[teamTimes.map() > <input>.onChange]"],
                                            onKeyDown: {
                                                "StationPage[teamTimes.map() > <input>.onKeyDown]": (e_0)=>{
                                                    if (e_0.key === "Enter") {
                                                        saveTime(team_2.id);
                                                    }
                                                }
                                            }["StationPage[teamTimes.map() > <input>.onKeyDown]"],
                                            className: "w-28 rounded-xl border border-border bg-background px-4 py-3 text-center font-mono text-lg text-primary outline-none transition placeholder:text-[#525977] focus:border-green"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/stationpage/page.tsx",
                                            lineNumber: 228,
                                            columnNumber: 288
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            type: "button",
                                            onClick: {
                                                "StationPage[teamTimes.map() > <button>.onClick]": ()=>saveTime(team_2.id)
                                            }["StationPage[teamTimes.map() > <button>.onClick]"],
                                            className: "rounded-xl bg-green-light px-4 py-3 font-semibold text-green-dark transition hover:bg-hover-bg",
                                            children: "Gem"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/stationpage/page.tsx",
                                            lineNumber: 236,
                                            columnNumber: 258
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/stationpage/page.tsx",
                                    lineNumber: 228,
                                    columnNumber: 247
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/app/stationpage/page.tsx",
                                lineNumber: 226,
                                columnNumber: 547
                            }, this)
                        ]
                    }, team_2.id, true, {
                        fileName: "[project]/src/app/stationpage/page.tsx",
                        lineNumber: 226,
                        columnNumber: 51
                    }, this)
            })["StationPage[teamTimes.map()]"];
            $[22] = draftTimes;
            $[23] = saveTime;
            $[24] = t15;
        } else {
            t15 = $[24];
        }
        t14 = teamTimes.map(t15);
        $[18] = draftTimes;
        $[19] = saveTime;
        $[20] = teamTimes;
        $[21] = t14;
    } else {
        t14 = $[21];
    }
    let t15;
    if ($[25] !== t14) {
        t15 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
            className: "overflow-hidden rounded-2xl border border-border bg-box-background",
            children: [
                t13,
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "divide-y divide-border",
                    children: t14
                }, void 0, false, {
                    fileName: "[project]/src/app/stationpage/page.tsx",
                    lineNumber: 256,
                    columnNumber: 104
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/stationpage/page.tsx",
            lineNumber: 256,
            columnNumber: 11
        }, this);
        $[25] = t14;
        $[26] = t15;
    } else {
        t15 = $[26];
    }
    let t16;
    if ($[27] === Symbol.for("react.memo_cache_sentinel")) {
        t16 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "mb-5 flex items-center justify-between",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "text-xs font-semibold uppercase tracking-wider text-secondary",
                            children: "klassen Bedste hold resultat"
                        }, void 0, false, {
                            fileName: "[project]/src/app/stationpage/page.tsx",
                            lineNumber: 264,
                            columnNumber: 72
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "mt-1 text-lg font-bold",
                            children: "Post 3"
                        }, void 0, false, {
                            fileName: "[project]/src/app/stationpage/page.tsx",
                            lineNumber: 264,
                            columnNumber: 185
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/stationpage/page.tsx",
                    lineNumber: 264,
                    columnNumber: 67
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex h-11 w-11 items-center justify-center rounded-xl bg-warning-background text-xl",
                    children: "🏆"
                }, void 0, false, {
                    fileName: "[project]/src/app/stationpage/page.tsx",
                    lineNumber: 264,
                    columnNumber: 243
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/stationpage/page.tsx",
            lineNumber: 264,
            columnNumber: 11
        }, this);
        $[27] = t16;
    } else {
        t16 = $[27];
    }
    const t17 = bestTime?.time || "--:--";
    let t18;
    if ($[28] !== t17) {
        t18 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "text-4xl font-black text-warning",
            children: t17
        }, void 0, false, {
            fileName: "[project]/src/app/stationpage/page.tsx",
            lineNumber: 272,
            columnNumber: 11
        }, this);
        $[28] = t17;
        $[29] = t18;
    } else {
        t18 = $[29];
    }
    const t19 = bestTime?.name || "Ingen registreret endnu";
    let t20;
    if ($[30] !== t19) {
        t20 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "mt-2 text-sm text-secondary",
            children: t19
        }, void 0, false, {
            fileName: "[project]/src/app/stationpage/page.tsx",
            lineNumber: 281,
            columnNumber: 11
        }, this);
        $[30] = t19;
        $[31] = t20;
    } else {
        t20 = $[31];
    }
    let t21;
    if ($[32] !== t18 || $[33] !== t20) {
        t21 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "rounded-2xl border border-border bg-box-background p-6",
            children: [
                t16,
                t18,
                t20
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/stationpage/page.tsx",
            lineNumber: 289,
            columnNumber: 11
        }, this);
        $[32] = t18;
        $[33] = t20;
        $[34] = t21;
    } else {
        t21 = $[34];
    }
    let t22;
    if ($[35] === Symbol.for("react.memo_cache_sentinel")) {
        t22 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "rounded-2xl border border-border bg-box-background p-6",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "mb-3 flex items-center gap-3",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                        className: "font-bold",
                        children: "Om posten"
                    }, void 0, false, {
                        fileName: "[project]/src/app/stationpage/page.tsx",
                        lineNumber: 298,
                        columnNumber: 129
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/app/stationpage/page.tsx",
                    lineNumber: 298,
                    columnNumber: 83
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "text-sm leading-6 text-secondary",
                    children: "På værkstedet skal eleverne gennemføre opgaven hurtigst muligt. Registrer tiden efter hvert hold har afsluttet posten."
                }, void 0, false, {
                    fileName: "[project]/src/app/stationpage/page.tsx",
                    lineNumber: 298,
                    columnNumber: 175
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/stationpage/page.tsx",
            lineNumber: 298,
            columnNumber: 11
        }, this);
        $[35] = t22;
    } else {
        t22 = $[35];
    }
    let t23;
    if ($[36] !== t21) {
        t23 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("aside", {
            className: "space-y-5",
            children: [
                t21,
                t22
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/stationpage/page.tsx",
            lineNumber: 305,
            columnNumber: 11
        }, this);
        $[36] = t21;
        $[37] = t23;
    } else {
        t23 = $[37];
    }
    let t24;
    if ($[38] !== t15 || $[39] !== t23) {
        t24 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "grid gap-6 xl:grid-cols-[1fr_320px]",
            children: [
                t15,
                t23
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/stationpage/page.tsx",
            lineNumber: 313,
            columnNumber: 11
        }, this);
        $[38] = t15;
        $[39] = t23;
        $[40] = t24;
    } else {
        t24 = $[40];
    }
    let t25;
    if ($[41] === Symbol.for("react.memo_cache_sentinel")) {
        t25 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "mt-6 flex flex-col justify-between gap-3 sm:flex-row",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    className: "rounded-xl border border-border bg-box-background px-5 py-3 text-sm font-semibold text-secondary transition hover:border-green hover:text-primary",
                    children: "← Forrige klasse"
                }, void 0, false, {
                    fileName: "[project]/src/app/stationpage/page.tsx",
                    lineNumber: 322,
                    columnNumber: 81
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    className: "rounded-xl border border-border bg-box-background px-5 py-3 text-sm font-semibold text-secondary transition hover:border-green hover:text-primary ",
                    children: "Næste klasse →"
                }, void 0, false, {
                    fileName: "[project]/src/app/stationpage/page.tsx",
                    lineNumber: 322,
                    columnNumber: 272
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/stationpage/page.tsx",
            lineNumber: 322,
            columnNumber: 11
        }, this);
        $[41] = t25;
    } else {
        t25 = $[41];
    }
    let t26;
    if ($[42] !== t12 || $[43] !== t24) {
        t26 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "min-h-screen bg-background text-primary",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex min-h-screen",
                children: [
                    t5,
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
                        className: "min-w-0 flex-1",
                        children: [
                            t7,
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "mx-auto max-w-350 p-5 md:p-9",
                                children: [
                                    t8,
                                    t12,
                                    t24,
                                    t25
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/stationpage/page.tsx",
                                lineNumber: 329,
                                columnNumber: 144
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/stationpage/page.tsx",
                        lineNumber: 329,
                        columnNumber: 107
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/stationpage/page.tsx",
                lineNumber: 329,
                columnNumber: 68
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/app/stationpage/page.tsx",
            lineNumber: 329,
            columnNumber: 11
        }, this);
        $[42] = t12;
        $[43] = t24;
        $[44] = t26;
    } else {
        t26 = $[44];
    }
    return t26;
}
_s(StationPage, "1Ec69w1r5eEP9HZzMn0uWhaotGs=");
_c = StationPage;
/* =========================
   COMPONENTS
========================= */ function _StationPageCompletedReduce(best, current_4) {
    return current_4.time < best.time ? current_4 : best;
}
function _StationPageTeamTimesFilter(team_1) {
    return team_1.time !== "";
}
function NavItem(t0) {
    const $ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["c"])(7);
    if ($[0] !== "180e344da5637f87c9d20cfc13a29a0c5849aa216d1c103406c17f40fb36697a") {
        for(let $i = 0; $i < 7; $i += 1){
            $[$i] = Symbol.for("react.memo_cache_sentinel");
        }
        $[0] = "180e344da5637f87c9d20cfc13a29a0c5849aa216d1c103406c17f40fb36697a";
    }
    const { icon, label, active: t1 } = t0;
    const active = t1 === undefined ? false : t1;
    const t2 = `
        flex items-center gap-3 rounded-xl px-3 py-3
        text-sm transition
        ${active ? "bg-green text-white" : "text-secondary hover:bg-primary hover:text-primary"}
      `;
    let t3;
    if ($[1] !== icon) {
        t3 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
            className: "w-6 text-center text-base",
            children: icon
        }, void 0, false, {
            fileName: "[project]/src/app/stationpage/page.tsx",
            lineNumber: 369,
            columnNumber: 10
        }, this);
        $[1] = icon;
        $[2] = t3;
    } else {
        t3 = $[2];
    }
    let t4;
    if ($[3] !== label || $[4] !== t2 || $[5] !== t3) {
        t4 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
            href: "#",
            className: t2,
            children: [
                t3,
                label
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/stationpage/page.tsx",
            lineNumber: 377,
            columnNumber: 10
        }, this);
        $[3] = label;
        $[4] = t2;
        $[5] = t3;
        $[6] = t4;
    } else {
        t4 = $[6];
    }
    return t4;
}
_c1 = NavItem;
function StatCard(t0) {
    const $ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["c"])(13);
    if ($[0] !== "180e344da5637f87c9d20cfc13a29a0c5849aa216d1c103406c17f40fb36697a") {
        for(let $i = 0; $i < 13; $i += 1){
            $[$i] = Symbol.for("react.memo_cache_sentinel");
        }
        $[0] = "180e344da5637f87c9d20cfc13a29a0c5849aa216d1c103406c17f40fb36697a";
    }
    const { title, value, description, highlight: t1 } = t0;
    const highlight = t1 === undefined ? false : t1;
    const t2 = `
        rounded-2xl
        border border-border
        bg-box-background
        p-5
        ${highlight ? "border-warning/30" : ""}
      `;
    let t3;
    if ($[1] !== title) {
        t3 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "text-xs font-semibold uppercase tracking-wider text-secondary",
            children: title
        }, void 0, false, {
            fileName: "[project]/src/app/stationpage/page.tsx",
            lineNumber: 411,
            columnNumber: 10
        }, this);
        $[1] = title;
        $[2] = t3;
    } else {
        t3 = $[2];
    }
    const t4 = `
          mt-2 text-2xl font-black
          ${highlight ? "text-warning" : "text-primary"}
        `;
    let t5;
    if ($[3] !== t4 || $[4] !== value) {
        t5 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: t4,
            children: value
        }, void 0, false, {
            fileName: "[project]/src/app/stationpage/page.tsx",
            lineNumber: 423,
            columnNumber: 10
        }, this);
        $[3] = t4;
        $[4] = value;
        $[5] = t5;
    } else {
        t5 = $[5];
    }
    let t6;
    if ($[6] !== description) {
        t6 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "mt-1 text-xs text-secondary",
            children: description
        }, void 0, false, {
            fileName: "[project]/src/app/stationpage/page.tsx",
            lineNumber: 432,
            columnNumber: 10
        }, this);
        $[6] = description;
        $[7] = t6;
    } else {
        t6 = $[7];
    }
    let t7;
    if ($[8] !== t2 || $[9] !== t3 || $[10] !== t5 || $[11] !== t6) {
        t7 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: t2,
            children: [
                t3,
                t5,
                t6
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/stationpage/page.tsx",
            lineNumber: 440,
            columnNumber: 10
        }, this);
        $[8] = t2;
        $[9] = t3;
        $[10] = t5;
        $[11] = t6;
        $[12] = t7;
    } else {
        t7 = $[12];
    }
    return t7;
}
_c2 = StatCard;
var _c, _c1, _c2;
__turbopack_context__.k.register(_c, "StationPage");
__turbopack_context__.k.register(_c1, "NavItem");
__turbopack_context__.k.register(_c2, "StatCard");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/componnent/Login.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>LoginPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/compiler-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
function LoginPage() {
    _s();
    const $ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["c"])(22);
    if ($[0] !== "1f88a9f3034e242a096522aa6a1b0fabd21c12948b0ee48bcaed9683dc2a7562") {
        for(let $i = 0; $i < 22; $i += 1){
            $[$i] = Symbol.for("react.memo_cache_sentinel");
        }
        $[0] = "1f88a9f3034e242a096522aa6a1b0fabd21c12948b0ee48bcaed9683dc2a7562";
    }
    let t0;
    if ($[1] === Symbol.for("react.memo_cache_sentinel")) {
        t0 = {
            schoolName: "",
            role: "Elev",
            password: ""
        };
        $[1] = t0;
    } else {
        t0 = $[1];
    }
    const [formData, setFormData] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(t0);
    let t1;
    if ($[2] === Symbol.for("react.memo_cache_sentinel")) {
        t1 = [
            "Admin",
            "V\xE6rksted",
            "L\xE6rer",
            "Elev"
        ];
        $[2] = t1;
    } else {
        t1 = $[2];
    }
    const roles = t1;
    let t2;
    if ($[3] === Symbol.for("react.memo_cache_sentinel")) {
        t2 = ({
            "LoginPage[handleChange]": (e)=>{
                const { name, value } = e.target;
                setFormData({
                    "LoginPage[handleChange > setFormData()]": (prev)=>({
                            ...prev,
                            [name]: value
                        })
                }["LoginPage[handleChange > setFormData()]"]);
            }
        })["LoginPage[handleChange]"];
        $[3] = t2;
    } else {
        t2 = $[3];
    }
    const handleChange = t2;
    let t3;
    if ($[4] !== formData) {
        t3 = ({
            "LoginPage[handleSubmit]": (e_0)=>{
                e_0.preventDefault();
                console.log("Login data indsendt:", formData);
            }
        })["LoginPage[handleSubmit]"];
        $[4] = formData;
        $[5] = t3;
    } else {
        t3 = $[5];
    }
    const handleSubmit = t3;
    let t4;
    if ($[6] === Symbol.for("react.memo_cache_sentinel")) {
        t4 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
            className: "text-sm uppercase tracking-[0.35em] text-primary/60",
            children: "login"
        }, void 0, false, {
            fileName: "[project]/src/componnent/Login.tsx",
            lineNumber: 70,
            columnNumber: 10
        }, this);
        $[6] = t4;
    } else {
        t4 = $[6];
    }
    let t5;
    if ($[7] === Symbol.for("react.memo_cache_sentinel")) {
        t5 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
            className: "block text-sm font-medium text-primary mb-2",
            children: "Vælg rolle"
        }, void 0, false, {
            fileName: "[project]/src/componnent/Login.tsx",
            lineNumber: 77,
            columnNumber: 10
        }, this);
        $[7] = t5;
    } else {
        t5 = $[7];
    }
    let t6;
    if ($[8] !== formData.role) {
        t6 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            children: [
                t5,
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "grid grid-cols-2 gap-3 sm:grid-cols-4",
                    children: roles.map({
                        "LoginPage[roles.map()]": (role)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                className: `flex cursor-pointer items-center justify-center rounded-md border p-3 text-sm font-medium transition-all ${formData.role === role ? "border-success bg-box-bg text-success" : "border-primary bg-box-bg text-primary hover:border-secondary hover:text-secondary"}`,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        type: "radio",
                                        name: "role",
                                        value: role,
                                        checked: formData.role === role,
                                        onChange: handleChange,
                                        className: "sr-only"
                                    }, void 0, false, {
                                        fileName: "[project]/src/componnent/Login.tsx",
                                        lineNumber: 85,
                                        columnNumber: 336
                                    }, this),
                                    role
                                ]
                            }, role, true, {
                                fileName: "[project]/src/componnent/Login.tsx",
                                lineNumber: 85,
                                columnNumber: 45
                            }, this)
                    }["LoginPage[roles.map()]"])
                }, void 0, false, {
                    fileName: "[project]/src/componnent/Login.tsx",
                    lineNumber: 84,
                    columnNumber: 19
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/componnent/Login.tsx",
            lineNumber: 84,
            columnNumber: 10
        }, this);
        $[8] = formData.role;
        $[9] = t6;
    } else {
        t6 = $[9];
    }
    let t7;
    if ($[10] === Symbol.for("react.memo_cache_sentinel")) {
        t7 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
            htmlFor: "skolens-navn",
            className: "block text-sm font-medium text-primary",
            children: "Skolens navn"
        }, void 0, false, {
            fileName: "[project]/src/componnent/Login.tsx",
            lineNumber: 94,
            columnNumber: 10
        }, this);
        $[10] = t7;
    } else {
        t7 = $[10];
    }
    let t8;
    if ($[11] !== formData.schoolName) {
        t8 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            children: [
                t7,
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                    type: "text",
                    id: "skolens-navn",
                    name: "schoolName",
                    value: formData.schoolName,
                    onChange: handleChange,
                    className: "mt-2 block h-10 w-full rounded-md shadow-sm sm:text-sm backdrop-blur-sm border border-primary bg-box-bg px-3 text-primary focus:outline-none focus:ring-2 focus:ring-indigo-500",
                    required: true
                }, void 0, false, {
                    fileName: "[project]/src/componnent/Login.tsx",
                    lineNumber: 101,
                    columnNumber: 19
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/componnent/Login.tsx",
            lineNumber: 101,
            columnNumber: 10
        }, this);
        $[11] = formData.schoolName;
        $[12] = t8;
    } else {
        t8 = $[12];
    }
    let t9;
    if ($[13] === Symbol.for("react.memo_cache_sentinel")) {
        t9 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
            htmlFor: "password",
            className: "block text-sm font-medium text-primary",
            children: "Password"
        }, void 0, false, {
            fileName: "[project]/src/componnent/Login.tsx",
            lineNumber: 109,
            columnNumber: 10
        }, this);
        $[13] = t9;
    } else {
        t9 = $[13];
    }
    let t10;
    if ($[14] !== formData.password) {
        t10 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            children: [
                t9,
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                    type: "password",
                    id: "password",
                    name: "password",
                    value: formData.password,
                    onChange: handleChange,
                    className: "mt-2 block h-10 w-full rounded-md shadow-sm sm:text-sm backdrop-blur-sm border border-primary bg-box-bg px-3 text-primary focus:outline-none focus:ring-2 focus:ring-indigo-500",
                    required: true
                }, void 0, false, {
                    fileName: "[project]/src/componnent/Login.tsx",
                    lineNumber: 116,
                    columnNumber: 20
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/componnent/Login.tsx",
            lineNumber: 116,
            columnNumber: 11
        }, this);
        $[14] = formData.password;
        $[15] = t10;
    } else {
        t10 = $[15];
    }
    let t11;
    if ($[16] === Symbol.for("react.memo_cache_sentinel")) {
        t11 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
            type: "submit",
            className: "w-full rounded-md bg-accent-blue-background py-2.5 px-4 text-bg-primary font-medium hover:bg-accent-blue  transition-colors cursor-pointer",
            children: "Log in"
        }, void 0, false, {
            fileName: "[project]/src/componnent/Login.tsx",
            lineNumber: 124,
            columnNumber: 11
        }, this);
        $[16] = t11;
    } else {
        t11 = $[16];
    }
    let t12;
    if ($[17] !== handleSubmit || $[18] !== t10 || $[19] !== t6 || $[20] !== t8) {
        t12 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
            className: "min-h-screen px-6 py-12",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mx-auto max-w-3xl",
                children: [
                    t4,
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                        onSubmit: handleSubmit,
                        className: "mt-6 space-y-6",
                        children: [
                            t6,
                            t8,
                            t10,
                            t11
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/componnent/Login.tsx",
                        lineNumber: 131,
                        columnNumber: 92
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/componnent/Login.tsx",
                lineNumber: 131,
                columnNumber: 53
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/componnent/Login.tsx",
            lineNumber: 131,
            columnNumber: 11
        }, this);
        $[17] = handleSubmit;
        $[18] = t10;
        $[19] = t6;
        $[20] = t8;
        $[21] = t12;
    } else {
        t12 = $[21];
    }
    return t12;
}
_s(LoginPage, "AVhEfndA4vGEUeeFDmvQFHKomrk=");
_c = LoginPage;
var _c;
__turbopack_context__.k.register(_c, "LoginPage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=_00kgga5._.js.map