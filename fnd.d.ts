declare var fnd: fnd.FndStatic;
export = fnd;
export as namespace fnd;
declare module fnd {
    interface IMatcher {
        (element: Node): boolean;
    }

    export function is(selector: string): IMatcher;

    interface FndStatic {
        (selector: string, parent: Node = document): [Node] | null;
    }
}

declare var evt: evt.EvtStatic;
export as namespace evt;
declare module evt {
    interface IEventHandler {
        (event: Event): any;
    }

    interface IEventMap {
        [event: string]: IEventHandler | string;
    }

    interface IHandlersContext {
        [handler: string]: IEventHandler;
    }

    interface EvtStatic {
        (element: Node, events: IEventMap, context?: IHandlersContext): Function;
    }

    interface on {
        (element: Node, eventName: string, handler: Function, selector?: string): Function;
    }
}