"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.patchV5R1ActionsSendMode = exports.toSafeV5R1SendMode = exports.loadOutListExtendedV5R1 = exports.storeOutListExtendedV5R1 = exports.loadOutActionExtendedV5R1 = exports.storeOutActionExtendedV5R1 = void 0;
const core_1 = require("@ton/core");
const WalletV5OutActions_1 = require("../v5beta/WalletV5OutActions");
const outActionSetIsPublicKeyEnabledTag = 0x04;
function storeOutActionSetIsPublicKeyEnabled(action) {
    return (builder) => {
        builder.storeUint(outActionSetIsPublicKeyEnabledTag, 8).storeUint(action.isEnabled ? 1 : 0, 1);
    };
}
const outActionAddExtensionTag = 0x02;
function storeOutActionAddExtension(action) {
    return (builder) => {
        builder.storeUint(outActionAddExtensionTag, 8).storeAddress(action.address);
    };
}
const outActionRemoveExtensionTag = 0x03;
function storeOutActionRemoveExtension(action) {
    return (builder) => {
        builder.storeUint(outActionRemoveExtensionTag, 8).storeAddress(action.address);
    };
}
function storeOutActionExtendedV5R1(action) {
    switch (action.type) {
        case 'setIsPublicKeyEnabled':
            return storeOutActionSetIsPublicKeyEnabled(action);
        case 'addExtension':
            return storeOutActionAddExtension(action);
        case 'removeExtension':
            return storeOutActionRemoveExtension(action);
        default:
            throw new Error('Unknown action type' + action?.type);
    }
}
exports.storeOutActionExtendedV5R1 = storeOutActionExtendedV5R1;
function loadOutActionExtendedV5R1(slice) {
    const tag = slice.loadUint(8);
    switch (tag) {
        case outActionSetIsPublicKeyEnabledTag:
            return {
                type: 'setIsPublicKeyEnabled',
                isEnabled: !!slice.loadUint(1)
            };
        case outActionAddExtensionTag:
            return {
                type: 'addExtension',
                address: slice.loadAddress()
            };
        case outActionRemoveExtensionTag:
            return {
                type: 'removeExtension',
                address: slice.loadAddress()
            };
        default:
            throw new Error(`Unknown extended out action tag 0x${tag.toString(16)}`);
    }
}
exports.loadOutActionExtendedV5R1 = loadOutActionExtendedV5R1;
function storeOutListExtendedV5R1(actions) {
    const extendedActions = actions.filter(WalletV5OutActions_1.isOutActionExtended);
    const basicActions = actions.filter(WalletV5OutActions_1.isOutActionBasic);
    return (builder) => {
        const outListPacked = basicActions.length ? (0, core_1.beginCell)().store((0, core_1.storeOutList)(basicActions.slice().reverse())) : null;
        builder.storeMaybeRef(outListPacked);
        if (extendedActions.length === 0) {
            builder.storeUint(0, 1);
        }
        else {
            const [first, ...rest] = extendedActions;
            builder
                .storeUint(1, 1)
                .store(storeOutActionExtendedV5R1(first));
            if (rest.length > 0) {
                builder.storeRef(packExtendedActionsRec(rest));
            }
        }
    };
}
exports.storeOutListExtendedV5R1 = storeOutListExtendedV5R1;
function packExtendedActionsRec(extendedActions) {
    const [first, ...rest] = extendedActions;
    let builder = (0, core_1.beginCell)()
        .store(storeOutActionExtendedV5R1(first));
    if (rest.length > 0) {
        builder = builder.storeRef(packExtendedActionsRec(rest));
    }
    return builder.endCell();
}
function loadOutListExtendedV5R1(slice) {
    const actions = [];
    const outListPacked = slice.loadMaybeRef();
    if (outListPacked) {
        const loadedActions = (0, core_1.loadOutList)(outListPacked.beginParse());
        if (loadedActions.some(a => a.type !== 'sendMsg')) {
            throw new Error("Can't deserialize actions list: only sendMsg actions are allowed for wallet v5r1");
        }
        actions.push(...loadedActions);
    }
    if (slice.loadBoolean()) {
        const action = loadOutActionExtendedV5R1(slice);
        actions.push(action);
    }
    while (slice.remainingRefs > 0) {
        slice = slice.loadRef().beginParse();
        const action = loadOutActionExtendedV5R1(slice);
        actions.push(action);
    }
    return actions;
}
exports.loadOutListExtendedV5R1 = loadOutListExtendedV5R1;
/**
 * Safety rules -- actions of external messages must have +2 in the SendMode. Internal messages actions may have arbitrary SendMode.
 */
function toSafeV5R1SendMode(sendMode, authType) {
    if (authType === 'internal' || authType === 'extension') {
        return sendMode;
    }
    return sendMode | core_1.SendMode.IGNORE_ERRORS;
}
exports.toSafeV5R1SendMode = toSafeV5R1SendMode;
function patchV5R1ActionsSendMode(actions, authType) {
    return actions.map(action => action.type === 'sendMsg' ? ({
        ...action,
        mode: toSafeV5R1SendMode(action.mode, authType)
    }) : action);
}
exports.patchV5R1ActionsSendMode = patchV5R1ActionsSendMode;
