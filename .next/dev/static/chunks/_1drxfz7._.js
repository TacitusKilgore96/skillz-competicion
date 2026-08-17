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
"[project]/src/app/teampage/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
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
        name: "Madlavning",
        visited: true,
        duration: "01:35"
    },
    {
        id: 2,
        name: "Medie",
        visited: true,
        duration: "01:22"
    },
    {
        id: 3,
        name: "Træværksted",
        visited: false,
        duration: "--:--"
    },
    {
        id: 4,
        name: "Teknik",
        visited: true,
        duration: "01:48"
    },
    {
        id: 5,
        name: "Førstehjælp",
        visited: false,
        duration: "--:--"
    }
];
const teamBadgeIcons = {
    1: "/images/mortar-pestle-solid-full.svg",
    2: "/images/camera-regular-full.svg",
    3: "/images/hammer-solid-full.svg",
    4: "/images/gear-solid-full.svg",
    5: "/images/briefcase-medical-solid-full.svg"
};
function StationPage() {
    _s();
    const $ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["c"])(64);
    if ($[0] !== "cca64e3e2228d5c80fc8c757e90df322927dd7552dde74f8efbc21b5ca4bd353") {
        for(let $i = 0; $i < 64; $i += 1){
            $[$i] = Symbol.for("react.memo_cache_sentinel");
        }
        $[0] = "cca64e3e2228d5c80fc8c757e90df322927dd7552dde74f8efbc21b5ca4bd353";
    }
    const [teamStatuses, setTeamStatuses] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(teams);
    let t0;
    if ($[1] === Symbol.for("react.memo_cache_sentinel")) {
        t0 = ({
            "StationPage[toggleVisit]": (id)=>{
                setTeamStatuses({
                    "StationPage[toggleVisit > setTeamStatuses()]": (current)=>current.map({
                            "StationPage[toggleVisit > setTeamStatuses() > current.map()]": (team)=>team.id === id ? {
                                    ...team,
                                    visited: !team.visited
                                } : team
                        }["StationPage[toggleVisit > setTeamStatuses() > current.map()]"])
                }["StationPage[toggleVisit > setTeamStatuses()]"]);
            }
        })["StationPage[toggleVisit]"];
        $[1] = t0;
    } else {
        t0 = $[1];
    }
    const toggleVisit = t0;
    let t1;
    if ($[2] !== teamStatuses) {
        t1 = teamStatuses.filter(_StationPageTeamStatusesFilter);
        $[2] = teamStatuses;
        $[3] = t1;
    } else {
        t1 = $[3];
    }
    const visitedCount = t1.length;
    let T0;
    let t10;
    let t11;
    let t2;
    let t3;
    let t4;
    let t5;
    let t6;
    let t7;
    let t8;
    let t9;
    if ($[4] !== teamStatuses) {
        const validDurations = teamStatuses.filter(_StationPageTeamStatusesFilter2).map(_StationPageAnonymous);
        const averageDurationSeconds = validDurations.length > 0 ? Math.round(validDurations.reduce(_StationPageValidDurationsReduce, 0) / validDurations.length) : 0;
        const formatDuration = _StationPageFormatDuration;
        t11 = "min-h-screen bg-background text-primary";
        t10 = "flex min-h-screen";
        t8 = "min-w-0 flex-1";
        let t12;
        if ($[16] === Symbol.for("react.memo_cache_sentinel")) {
            t12 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex h-10 w-10 items-center justify-center rounded-full bg-green-light font-bold text-green-dark",
                children: "F"
            }, void 0, false, {
                fileName: "[project]/src/app/teampage/page.tsx",
                lineNumber: 106,
                columnNumber: 13
            }, this);
            $[16] = t12;
        } else {
            t12 = $[16];
        }
        if ($[17] === Symbol.for("react.memo_cache_sentinel")) {
            t9 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
                className: "flex h-18.5 items-center justify-between border-b border-border bg-box-background/80 px-5 md:px-9",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-center gap-3",
                    children: [
                        t12,
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "hidden text-left sm:block",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "text-sm font-semibold",
                                    children: "Hold"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/teampage/page.tsx",
                                    lineNumber: 112,
                                    columnNumber: 219
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "text-xs text-secondary",
                                    children: "Flemming"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/teampage/page.tsx",
                                    lineNumber: 112,
                                    columnNumber: 268
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/teampage/page.tsx",
                            lineNumber: 112,
                            columnNumber: 176
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/teampage/page.tsx",
                    lineNumber: 112,
                    columnNumber: 130
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/teampage/page.tsx",
                lineNumber: 112,
                columnNumber: 12
            }, this);
            $[17] = t9;
        } else {
            t9 = $[17];
        }
        t6 = "mx-auto max-w-350 p-5 md:p-9";
        if ($[18] === Symbol.for("react.memo_cache_sentinel")) {
            t7 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "mb-7 flex flex-col justify-between gap-5 lg:flex-row lg:items-center",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-center gap-4",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-blue-background text-2xl bg-accent-blue-",
                            children: "📈"
                        }, void 0, false, {
                            fileName: "[project]/src/app/teampage/page.tsx",
                            lineNumber: 119,
                            columnNumber: 139
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                    className: "text-3xl font-bold tracking-tight",
                                    children: "Hold"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/teampage/page.tsx",
                                    lineNumber: 119,
                                    columnNumber: 275
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "mt-1 text-sm text-secondary",
                                    children: "Overblik over resultater"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/teampage/page.tsx",
                                    lineNumber: 119,
                                    columnNumber: 334
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/teampage/page.tsx",
                            lineNumber: 119,
                            columnNumber: 270
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/teampage/page.tsx",
                    lineNumber: 119,
                    columnNumber: 98
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/teampage/page.tsx",
                lineNumber: 119,
                columnNumber: 12
            }, this);
            $[18] = t7;
        } else {
            t7 = $[18];
        }
        t4 = "mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-2";
        if ($[19] === Symbol.for("react.memo_cache_sentinel")) {
            t5 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(StatCard, {
                title: "Jeres Samlede Tid",
                value: "5:20",
                description: "mm:ss"
            }, void 0, false, {
                fileName: "[project]/src/app/teampage/page.tsx",
                lineNumber: 126,
                columnNumber: 12
            }, this);
            $[19] = t5;
        } else {
            t5 = $[19];
        }
        T0 = StatCard;
        t2 = "Gennemsnit Pr. Post";
        t3 = formatDuration(averageDurationSeconds);
        $[4] = teamStatuses;
        $[5] = T0;
        $[6] = t10;
        $[7] = t11;
        $[8] = t2;
        $[9] = t3;
        $[10] = t4;
        $[11] = t5;
        $[12] = t6;
        $[13] = t7;
        $[14] = t8;
        $[15] = t9;
    } else {
        T0 = $[5];
        t10 = $[6];
        t11 = $[7];
        t2 = $[8];
        t3 = $[9];
        t4 = $[10];
        t5 = $[11];
        t6 = $[12];
        t7 = $[13];
        t8 = $[14];
        t9 = $[15];
    }
    let t12;
    if ($[20] !== T0 || $[21] !== t2 || $[22] !== t3) {
        t12 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(T0, {
            title: t2,
            value: t3,
            description: "mm:ss"
        }, void 0, false, {
            fileName: "[project]/src/app/teampage/page.tsx",
            lineNumber: 161,
            columnNumber: 11
        }, this);
        $[20] = T0;
        $[21] = t2;
        $[22] = t3;
        $[23] = t12;
    } else {
        t12 = $[23];
    }
    let t13;
    if ($[24] !== t12 || $[25] !== t4 || $[26] !== t5) {
        t13 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: t4,
            children: [
                t5,
                t12
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/teampage/page.tsx",
            lineNumber: 171,
            columnNumber: 11
        }, this);
        $[24] = t12;
        $[25] = t4;
        $[26] = t5;
        $[27] = t13;
    } else {
        t13 = $[27];
    }
    let t14;
    if ($[28] === Symbol.for("react.memo_cache_sentinel")) {
        t14 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex items-center justify-between border-b border-border px-6 py-5",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        className: "font-bold",
                        children: "Jeres resultater"
                    }, void 0, false, {
                        fileName: "[project]/src/app/teampage/page.tsx",
                        lineNumber: 181,
                        columnNumber: 100
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "mt-1 text-xs text-secondary",
                        children: "Her kan I se jeres tider på alle poster"
                    }, void 0, false, {
                        fileName: "[project]/src/app/teampage/page.tsx",
                        lineNumber: 181,
                        columnNumber: 147
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/teampage/page.tsx",
                lineNumber: 181,
                columnNumber: 95
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/app/teampage/page.tsx",
            lineNumber: 181,
            columnNumber: 11
        }, this);
        $[28] = t14;
    } else {
        t14 = $[28];
    }
    let t15;
    if ($[29] !== teamStatuses) {
        let t16;
        if ($[31] === Symbol.for("react.memo_cache_sentinel")) {
            t16 = ({
                "StationPage[teamStatuses.map()]": (team_3)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex flex-col gap-4 px-6 py-5 transition hover:bg-primary/60 sm:flex-row sm:items-center sm:justify-between",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-4",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "min-w-8 text-left text-xl font-bold text-primary",
                                        children: team_3.id
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/teampage/page.tsx",
                                        lineNumber: 191,
                                        columnNumber: 236
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex h-11 w-11 items-center justify-center rounded-xl bg-id-nr-background text-sm font-bold text-id-nr",
                                        children: teamBadgeIcons[team_3.id] ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                            src: teamBadgeIcons[team_3.id],
                                            alt: `Hold ${team_3.id}`,
                                            className: "h-7 w-7 object-contain"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/teampage/page.tsx",
                                            lineNumber: 191,
                                            columnNumber: 468
                                        }, this) : team_3.id
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/teampage/page.tsx",
                                        lineNumber: 191,
                                        columnNumber: 319
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "font-semibold",
                                                children: team_3.name
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/teampage/page.tsx",
                                                lineNumber: 191,
                                                columnNumber: 592
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "mt-1 text-xs text-secondary",
                                                children: team_3.visited ? "Bes\xF8gt stationen" : "Har ikke bes\xF8gt stationen"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/teampage/page.tsx",
                                                lineNumber: 191,
                                                columnNumber: 642
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/teampage/page.tsx",
                                        lineNumber: 191,
                                        columnNumber: 587
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/teampage/page.tsx",
                                lineNumber: 191,
                                columnNumber: 195
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-3",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "min-w-[72px] text-left font-mono text-base font-bold text-primary",
                                        children: team_3.visited ? team_3.duration : "--:--"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/teampage/page.tsx",
                                        lineNumber: 191,
                                        columnNumber: 819
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "button",
                                        onClick: {
                                            "StationPage[teamStatuses.map() > <button>.onClick]": ()=>toggleVisit(team_3.id)
                                        }["StationPage[teamStatuses.map() > <button>.onClick]"],
                                        className: team_3.visited ? "rounded-xl border border-green-dark bg-success-background px-4 py-2.5 text-sm font-semibold text-success transition hover:opacity-90" : "rounded-xl border border-red-500 bg-danger-background px-4 py-2.5 text-sm font-semibold text-danger transition hover:opacity-90",
                                        children: team_3.visited ? "Bes\xF8gt" : "Ikke bes\xF8gt"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/teampage/page.tsx",
                                        lineNumber: 191,
                                        columnNumber: 952
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/teampage/page.tsx",
                                lineNumber: 191,
                                columnNumber: 778
                            }, this)
                        ]
                    }, team_3.id, true, {
                        fileName: "[project]/src/app/teampage/page.tsx",
                        lineNumber: 191,
                        columnNumber: 54
                    }, this)
            })["StationPage[teamStatuses.map()]"];
            $[31] = t16;
        } else {
            t16 = $[31];
        }
        t15 = teamStatuses.map(t16);
        $[29] = teamStatuses;
        $[30] = t15;
    } else {
        t15 = $[30];
    }
    let t16;
    if ($[32] !== t15) {
        t16 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
            className: "overflow-hidden rounded-2xl border border-border bg-box-background",
            children: [
                t14,
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "divide-y divide-border",
                    children: t15
                }, void 0, false, {
                    fileName: "[project]/src/app/teampage/page.tsx",
                    lineNumber: 207,
                    columnNumber: 104
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/teampage/page.tsx",
            lineNumber: 207,
            columnNumber: 11
        }, this);
        $[32] = t15;
        $[33] = t16;
    } else {
        t16 = $[33];
    }
    let t17;
    if ($[34] === Symbol.for("react.memo_cache_sentinel")) {
        t17 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "mb-5 flex items-center justify-between",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "text-xs font-semibold uppercase tracking-wider text-secondary",
                            children: "Besøgstatus"
                        }, void 0, false, {
                            fileName: "[project]/src/app/teampage/page.tsx",
                            lineNumber: 215,
                            columnNumber: 72
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "mt-1 text-lg font-bold",
                            children: "Poster"
                        }, void 0, false, {
                            fileName: "[project]/src/app/teampage/page.tsx",
                            lineNumber: 215,
                            columnNumber: 168
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/teampage/page.tsx",
                    lineNumber: 215,
                    columnNumber: 67
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex h-11 w-11 items-center justify-center rounded-xl bg-warning-background text-xl",
                    children: "✅"
                }, void 0, false, {
                    fileName: "[project]/src/app/teampage/page.tsx",
                    lineNumber: 215,
                    columnNumber: 226
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/teampage/page.tsx",
            lineNumber: 215,
            columnNumber: 11
        }, this);
        $[34] = t17;
    } else {
        t17 = $[34];
    }
    let t18;
    if ($[35] !== visitedCount) {
        t18 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "text-4xl font-black text-warning",
            children: visitedCount
        }, void 0, false, {
            fileName: "[project]/src/app/teampage/page.tsx",
            lineNumber: 222,
            columnNumber: 11
        }, this);
        $[35] = visitedCount;
        $[36] = t18;
    } else {
        t18 = $[36];
    }
    let t19;
    if ($[37] !== teamStatuses.length || $[38] !== visitedCount) {
        t19 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "mt-2 text-s text-secondary",
            children: [
                visitedCount,
                " / ",
                teamStatuses.length,
                " Poster er besøgt"
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/teampage/page.tsx",
            lineNumber: 230,
            columnNumber: 11
        }, this);
        $[37] = teamStatuses.length;
        $[38] = visitedCount;
        $[39] = t19;
    } else {
        t19 = $[39];
    }
    let t20;
    if ($[40] !== t18 || $[41] !== t19) {
        t20 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "rounded-2xl border border-border bg-box-background p-6",
            children: [
                t17,
                t18,
                t19
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/teampage/page.tsx",
            lineNumber: 239,
            columnNumber: 11
        }, this);
        $[40] = t18;
        $[41] = t19;
        $[42] = t20;
    } else {
        t20 = $[42];
    }
    let t21;
    if ($[43] === Symbol.for("react.memo_cache_sentinel")) {
        t21 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "rounded-2xl border border-border bg-box-background p-6",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "mb-3 flex items-center gap-3",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                        className: "font-bold",
                        children: "Om posten"
                    }, void 0, false, {
                        fileName: "[project]/src/app/teampage/page.tsx",
                        lineNumber: 248,
                        columnNumber: 129
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/app/teampage/page.tsx",
                    lineNumber: 248,
                    columnNumber: 83
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "text-s leading-6 text-secondary",
                    children: "Her markerer holdet, om de har besøgt posten eller ej. Statusen bruges til at holde styr på, hvilke grupper der er nået frem til stationen."
                }, void 0, false, {
                    fileName: "[project]/src/app/teampage/page.tsx",
                    lineNumber: 248,
                    columnNumber: 175
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/teampage/page.tsx",
            lineNumber: 248,
            columnNumber: 11
        }, this);
        $[43] = t21;
    } else {
        t21 = $[43];
    }
    let t22;
    if ($[44] !== t20) {
        t22 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("aside", {
            className: "space-y-5",
            children: [
                t20,
                t21
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/teampage/page.tsx",
            lineNumber: 255,
            columnNumber: 11
        }, this);
        $[44] = t20;
        $[45] = t22;
    } else {
        t22 = $[45];
    }
    let t23;
    if ($[46] !== t16 || $[47] !== t22) {
        t23 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "grid gap-6 xl:grid-cols-[1fr_320px]",
            children: [
                t16,
                t22
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/teampage/page.tsx",
            lineNumber: 263,
            columnNumber: 11
        }, this);
        $[46] = t16;
        $[47] = t22;
        $[48] = t23;
    } else {
        t23 = $[48];
    }
    let t24;
    if ($[49] !== t13 || $[50] !== t23 || $[51] !== t6 || $[52] !== t7) {
        t24 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: t6,
            children: [
                t7,
                t13,
                t23
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/teampage/page.tsx",
            lineNumber: 272,
            columnNumber: 11
        }, this);
        $[49] = t13;
        $[50] = t23;
        $[51] = t6;
        $[52] = t7;
        $[53] = t24;
    } else {
        t24 = $[53];
    }
    let t25;
    if ($[54] !== t24 || $[55] !== t8 || $[56] !== t9) {
        t25 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
            className: t8,
            children: [
                t9,
                t24
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/teampage/page.tsx",
            lineNumber: 283,
            columnNumber: 11
        }, this);
        $[54] = t24;
        $[55] = t8;
        $[56] = t9;
        $[57] = t25;
    } else {
        t25 = $[57];
    }
    let t26;
    if ($[58] !== t10 || $[59] !== t25) {
        t26 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: t10,
            children: t25
        }, void 0, false, {
            fileName: "[project]/src/app/teampage/page.tsx",
            lineNumber: 293,
            columnNumber: 11
        }, this);
        $[58] = t10;
        $[59] = t25;
        $[60] = t26;
    } else {
        t26 = $[60];
    }
    let t27;
    if ($[61] !== t11 || $[62] !== t26) {
        t27 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: t11,
            children: t26
        }, void 0, false, {
            fileName: "[project]/src/app/teampage/page.tsx",
            lineNumber: 302,
            columnNumber: 11
        }, this);
        $[61] = t11;
        $[62] = t26;
        $[63] = t27;
    } else {
        t27 = $[63];
    }
    return t27;
}
_s(StationPage, "imZnQg5kDTKnPj2BANiT4tBqndM=");
_c = StationPage;
/* =========================
   COMPONENTS
========================= */ function _StationPageFormatDuration(totalSeconds) {
    const minutes_0 = Math.floor(totalSeconds / 60);
    const seconds_0 = totalSeconds % 60;
    return `${String(minutes_0).padStart(2, "0")}:${String(seconds_0).padStart(2, "0")}`;
}
function _StationPageValidDurationsReduce(sum, value) {
    return sum + value;
}
function _StationPageAnonymous(team_2) {
    const [minutes, seconds] = team_2.duration.split(":").map(Number);
    return minutes * 60 + seconds;
}
function _StationPageTeamStatusesFilter2(team_1) {
    return team_1.visited && team_1.duration && team_1.duration !== "--:--";
}
function _StationPageTeamStatusesFilter(team_0) {
    return team_0.visited;
}
function NavItem(t0) {
    const $ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["c"])(7);
    if ($[0] !== "cca64e3e2228d5c80fc8c757e90df322927dd7552dde74f8efbc21b5ca4bd353") {
        for(let $i = 0; $i < 7; $i += 1){
            $[$i] = Symbol.for("react.memo_cache_sentinel");
        }
        $[0] = "cca64e3e2228d5c80fc8c757e90df322927dd7552dde74f8efbc21b5ca4bd353";
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
            fileName: "[project]/src/app/teampage/page.tsx",
            lineNumber: 354,
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
            fileName: "[project]/src/app/teampage/page.tsx",
            lineNumber: 362,
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
    if ($[0] !== "cca64e3e2228d5c80fc8c757e90df322927dd7552dde74f8efbc21b5ca4bd353") {
        for(let $i = 0; $i < 13; $i += 1){
            $[$i] = Symbol.for("react.memo_cache_sentinel");
        }
        $[0] = "cca64e3e2228d5c80fc8c757e90df322927dd7552dde74f8efbc21b5ca4bd353";
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
            fileName: "[project]/src/app/teampage/page.tsx",
            lineNumber: 396,
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
            fileName: "[project]/src/app/teampage/page.tsx",
            lineNumber: 408,
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
            fileName: "[project]/src/app/teampage/page.tsx",
            lineNumber: 417,
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
            fileName: "[project]/src/app/teampage/page.tsx",
            lineNumber: 425,
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
]);

//# sourceMappingURL=_1drxfz7._.js.map