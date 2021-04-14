import { g2 } from 'g2-module';

export const mec: IMec;
export interface IModel {
    id: string
    nodes: INodes[],
    views: IView[],
    constraints: IConstraints[]
}

export interface IViewExtended extends IView, IMecElement, IMecG2Drawable {
    asJSON: string,
}

export interface IView {
    id: string,
    as: string,
}

export interface IViewPointExtended extends IViewExtended {
    post(): void,
    readonly r: number,
    readonly isSolid: boolean,
    readonly sh: boolean,
    hitInner({ x, y, eps }: { x: number, y: number, eps: number }): boolean
}

export interface IViewVectorExtended extends IViewExtended {
    update(): void,
    post(): void,
    readonly isSolid: boolean,
    readonly sh: boolean,
    hitContour({ x, y, eps }: { x: number, y: number, eps: number }): boolean
}

export interface IViewTraceExtended extends IViewExtended {
    addPoint(): void,
    preview(): void,
    reset(preview?: boolean): void,
    post(dt: number): void,
    readonly isSolid: boolean,
    readonly sh: boolean,
    hitContour({ x, y, eps }: { x: number, y: number, eps: number }): boolean
}

export interface IViewInfoExtended extends IViewExtended {
    assignRefs(): void,
    readonly hasInfo: boolean,
    infoString(): string,
}

export interface IViewChartExtended extends IViewExtended {
    elem(a: IMecElement | number): IMecElement | undefined,
    aly(val: IMecElement): keyof IAnalyze,
    getAxis({ show, of }: { show: string, of: string }): {
        title: { text: string, style: { font: string, fs: Color } },
        labels: { style: { fs: Color } },
        origin: boolean,
        grid: boolean,
    },
    readonly local_t: number | undefined,
    readonly curretnY: number,
    readonly currentX: number,
    readonly previewNod: { x: number, y: number, scl: number },
    addPoint(): void,
    preview(): void,
    reset(preview: boolean): void,
    post(): void,
}

export interface IConstraint {
    id: string,
    p1: string,
    p2: string,
    ori: MecConstraintType,
}

export interface IConstraintExtended extends IConstraint, IMecElement, IMecG2Drawable {
    ori: {
        inputCallbk(number): () => void,
    },
    assignRefs(): void,
    initVector(): void,
    angle(w: number): number,
    readonly type: string,
    readonly initialized: boolean,
    readonly dof: number,
    readonly lenTol: number,
    readonly force: number,
    readonly forceAbs: number,
    readonly moment: number,
    readonly pole: { x: number, y: number },
    readonly velPole: { x: number, y: number },
    readonly inflPole: { x: number, y: number },
    readonly accPole: { x: number, y: number },
    activeDriveCount(t: number): number,
    readonly ax: number,
    readonly ay: number,
    readonly axt: number,
    readonly ayt: number,
    readonly axtt: number,
    readonly aytt: number,
    readonly ori_C: number,
    readonly ori_Ct: number,
    readonly ori_mc: number,
    readonly len_C: number,
    readonly len_Ct: number,
    readonly len_mt: number,
    pre(dt: number): void,
    post(dt: number): void,
    posStep(): boolean,
    velStep(dt: number): boolean,
    ori_pos(): boolean,
    ori_vel(dt: number): boolean,
    ori_impulse_pos(impulse: number): number,
    ori_impulse_vel(impulse: number): number,
    ori_apply_Q(lambda: number): number,
    len_pos(): boolean,
    len_vel(dt: number): boolean,
    len_impulse_vel(impulse: number): void,
    len_apply_Q(lambda: number): void,
    init_ori_free(ori: MecConstraintType): void,
    init_ori_const(ori: MecConstraintType): void,
    init_ori_drive(ori: MecConstraintType): void,
    init_len_free(len: MecConstraintType): void,
    init_len_const(len: MecConstraintType): void,
    init_len_drive(len: MecConstraintType): void,
    asJson: string,
    showInfo: boolean,
    infos: {
        id: () => string,
        pos: () => string,
        vel: () => string,
        load: () => string,
    },
    info(q: string): string,
    readonly isSolid: boolean,
    readonly sh: Color | boolean,
    hitContour({ x, y, eps }: { x: number, y: number, eps: number }): boolean,
    readonly color: Color,
}

export interface INode {
    id: string,
    base: boolean,
    x: number,
    y: number,
}

export interface INodeExtended extends INode, IMecElement, IMecG2Drawable {
    readonly isSleeping: boolean,
    readonly energy: number,
    pre_0(): void,
    pre(dt: number): void,
    post(dt: number): void,
    asJSON(): string,
    readonly force: coord,
    readonly pos: coord,
    readonly vel: coord,
    readonly acc: coord,
    readonly forceAbs: coord,
    readonly velAbs: coord,
    readonly accAbs: coord,
    readonly showInfo: number,
    readonly infos: {
        id: () => string,
        pos: () => string,
        vel: () => string,
        m: () => string,
    },
    info(q: string): string,
    hitInner({ x, y, eps }: { x: number, y: number, eps: number }): bool,
    selectBeg({ x, y, eps }: { x: number, y: number, eps: number }): void,
    selectEnd({ x, y, eps }: { x: number, y: number, eps: number }): void,
    drag({ x, y, mode } = { x: number, y: number, mode: 'string' }): void,
    readonly isSolid: boolean,
    readonly sh: Color | boolean,
    readonly r: number
}

export interface IMecNode extends IMecPlugin {
    extend(arg: Object): INodeExtended
    prototype: INodeExtended,
    radius: number,
    locdir: {
        e: coord, ne: coord, n: coord, nw: coord,
        w: coord, sw: coord, s: coord, se: coord
    },
    g2BaseNode: g2,
    g2Node: g2,
}
export interface IMecConstraint extends IMecPlugin {
    extend(arg: Object): IConstraintExtended
    prototype: IConstraintExtended,
    arrow: {
        ctrl: SVGPath,
        rot: SVGPath,
        tran: SVGPath,
        free: SVGPath,
    }
}
export interface IMecDrive {
    create({ func, z0, Dz, t0, Dt, t, bounce, repeat, args }: any): {
        f(): number,
        ft(): number,
        ftt(): number,
    },
    "const": driveObject
    linear: driveObject,
    quadratic: driveObject,
    harmonic: driveObject,
    sinoid: driveObject,
    poly5: driveObject,
    static: driveObject,
    seq(segments: { dz?: number, dt: number, func: 'string' | Function }[]): driveObject,
    bounce(drv: driveObject): driveObject,
    repeat(drv: driveObject, n: number): driveObject,
    pot: driveObject[],
    inPot(n: number): driveObject,
    outPot(n: number): driveObject,
    inOutPot(n: number): driveObject,
    readonly inQuad(): driveObject,
    readonly outQuad(): driveObject,
    readonly inOutQuad(): driveObject,
    readonly inCubic(): driveObject,
    readonly outCubic(): driveObject,
    readonly inOutCubic(): driveObject,
    readonly inQuart(): driveObject,
    readonly outQuart(): driveObject,
    readonly inOutQuart(): driveObject,
    readonly inQuint(): driveObject,
    readonly outQuint(): driveObject,
    readonly inOutQuint(): driveObject,
}
export interface IMecView {
    extend(arg: Object): IMecView,
    prototype: IViewExtended,
    point: IViewPointExtended,
    vector: IViewVectorExtended,
    trace: IViewTraceExtended,
    info: IViewInfoExtended,
    chart: IViewChartExtended,
}
export interface IMecPlugin {
    extend(arg: Object): IMecElement,
    prototype: IMecElement,
}

export interface IMecPlugIns {
    "nodes": INodeExtended[],
    "views": IViewExtended[],
    "constraints": IConstraintExtended[]
}

export interface IMecModel {
    extend<T>(model: Object, env: IMec | T): IMec | T,
    prototype: {
        constructor<T>(env: IMec | T): void,
        init(): IMecModel,
        plugIns: Partial<IMecPlugIns>,
        addPlugIn(name: string, plugIn: IMecPlugin): void,
        forAllPlugins(fn: (elm: Object, plugIn: IMecPlugin, key: string) => T): void | T,
        notifyValid(msg: string): boolean,
        reset(): IMecModel,
        previos(): IMecModel,
        asm(): IMecModel,
        pose(): IMecModel,
        tick(dt?: number): IMecModel,
        stop(): IMecModel,
        readonly dof: number,
        readonly hasGravity: boolean,
        valid: boolean, // getter and setter
        msg(): string,
        readonly info(): void,
        itrpos: number, // getter and setter
        itrvel: number, // getter and setter
        sleepMinDelta: number, // setter
        readonly isSleeping: boolean,
        readonly activeDriveCount: number,
        readonly hasActiveDrives: boolean,
        readonly inputControlledDrives: { constraint: IConstraintExtended, sub: 'ori' | 'len' }[],
        readonly isActive: boolean,
        readonly energy: number,
        readonly cog: { x: number, y: number },
        hasDependents(elem: IMecElement): boolean,
        dependentsOf(elem: IMecElement, deps: Object): Object,
        purgeElements(elems: { [string]: IMecElement }): void,
        elementById(id: string): IMecElement,
        add(plugIn: string, element: IMecElement): void,
        asJSON(): string,
        applyLoads(): IMecModel,
        asmPos(): boolean,
        posStep(): boolean,
        asmVel(): boolean,
        velStep(): boolean,
        pre(): IMecModel,
        itr(): IMecModel,
        post(): IMecModel,
        draw(g: g2): IMecModel,
    }
}

export interface IMec {
    lang: string, // language code
    msg: {},
    EPS: number,
    lenTol: number,
    angTol: number,
    velTol: number,
    forceTol: number,
    momentTol: number,
    tol: {
        len: {
            low: number,
            medium: number,
            high: number,
        }
    },
    maxLinCorrect: number,
    asmItrMax: number,
    itrMax: number,
    corrMax: number,
    show: {
        darkmode: boolean,
        nodeLabels: boolean,
        constraintLabels: boolean,
        loadLabels: boolean,
        nodes: boolean,
        constraints: boolean,
        colors: {
            invalidConstraintsColor: Color,
            validConstraintColor: { dark: Color, light: Color },
            forceColor: { dark: Color, light: Color },
            springColor: { dark: Color, light: Color },
            constraintVectorColor: { dark: Color, light: Color },
            hoveredElmColor: { dark: Color, light: Color },
            selectedElmColor: { dark: Color, light: Color },
            txtColor: { dark: Color, light: Color },
            velVecColor: { dark: Color, light: Color },
            accVecColor: { dark: Color, light: Color },
            forceVecColor: { dark: Color, light: Color }
        },
        readonly validConstraintColor: Color,
        readonly forceColor: Color,
        readonly springColor: Color,
        readonly constraintVectorColor: Color,
        readonly hoveredElmColor: Color,
        readonly selectedElmColor: Color,
        readonly txtColor: Color,
        readonly velVecColor: Color,
        readonly accVecColor: Color,
        readonly forceVecColor: Color,
    }
    gravity: {
        x: number,
        y: number,
        active: boolean,
    },
    aly: {
        m: IAnalyzeScl,
        pos: IAnalyzeDrwScl,
        vel: IAnalyzeDrwScl,
        acc: IAnalyzeDrwScl,
        w: IAnalyzeScl,
        wt: IAnalyzeScl,
        wtt: IAnalyzeScl,
        r: IAnalyzeScl,
        rt: IAnalyzeScl,
        rtt: IAnalyzeScl,
        force: IAnalyzeDrwScl,
        velAbs: IAnalyzeScl,
        accAbs: IAnalyzeScl,
        forceAbs: IAnalyzeScl,
        moment: IAnalyzeScl,
        energy: IAnalyzeScl,
        pole: IAnalyze,
        poleAcc: IAnalyzeScl,
        polChgVel: IAnalyzeScl,
        accPole: IAnalyze,
        inflPole: IAnalyze,
        t: IAnalyzeScl,
    },
    m_u: number,
    to_m(x: number): number,
    from_m(x: number): number,
    to_N(x: number): number,
    from_N(x: number): number,
    to_N_m(x: number): number,
    from_N_m(x: number): number,
    to_J(x: number): number,
    from_J(x: number): number,
    to_kgm2(x: number): number,
    from_kgm2(x: number): number,
    isEps(x: number): number,
    toZero(x: number): number,
    clam(val: number, lo: number, hi: number): number,
    asympClamp(val, lo, hi): number,
    toRad(x: number): number,
    toDeg(x: number): number,
    infAngle(winf: number, w: number): number,
    mixin(obj: Object, ...protos: any): any
    assignGetters(obj: Object, getters: any): void,
    messageString(msg: string): string,
    model?: IMecModel
    node?: IMecNode,
    constraint?: IMecConstraint,
    drive?: IMecDrive,
    view?: IMecView,
}
interface IAnalyzeScl extends IAnalyze {
    scl: number
}
interface IAnalyzeDrwScl extends IAnalyzeScl {
    drwscl: number,
}
interface IAnalyze {
    type: string,
    name: string,
    unit: string,
}
interface MecConstraintType {
    ori?: 'const' | 'free' | 'drive',
    len?: 'const' | 'free' | 'drive',
}

interface IMecG2Drawable {
    g2(): g2,
    draw(g: g2): g2,
}

interface driveObject {
    f(q: number): number,
    fd(q: number): number,
    fdd(q: number): number,
}

export interface IMecElement {
    constructor(): void,
    validate(idx: number): boolean,
    init(model: IMecModel, idx: number): void,
    remove(): void,
    purge(): void,
    dependsOn(elem: IMecElement): boolean,
    deepDependsOn?(elem: IMecElement): boolean,
    reset(): void,
}

type SVGPath = string;
type ctx = any;
type Color = string;
type coord = [number, number];
