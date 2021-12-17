import { getInstance } from "xpresser";

// Import Xpresser
const $ = getInstance();

// Your Custom Request Engine
class CustomRequestEngine extends $.extendedRequestEngine() {
    /**
     * Check if param has been loaded.
     * @param param - Param to check
     */
    hasLoadedParam(param: string) {
        return this.loadedParams().hasOwnProperty(param);
    }

    /**
     * Check if state has multiple loaded params.
     * @param params - Params to check
     *
     * @deprecated This function may not be used.
     */
    // hasLoadedParams(params: string[]) {
    //     const loadedParams = this.loadedParams();
    //     return params.every((param) => loadedParams.hasOwnProperty(param));
    // }

    /**
     * Add loaded param to state
     * @param param - Param to add
     * @param value - Value of param
     * @protected
     */
    addLoadedParam(param: any, value: string) {
        // Add loaded params to the request
        this.state.path("loadedParams", {}).set(param, value);
        return this;
    }

    /**
     * Get all or pick loaded params from state.
     * @param pick - Optional list of params to pick
     */
    loadedParams<T extends Record<string, any>>(pick?: keyof T | Array<keyof T>): T {
        // if no pick, return all loaded params
        if (!pick) return this.state.get("loadedParams", {});

        // if pick is string convert to array
        if (typeof pick === "string") pick = [pick];

        // return picked params
        return this.state.path("loadedParams", {}).pick(pick as string[]) as T;
    }

    /**
     * Get single loaded param from state.
     * @param param - Param to get
     */
    loadedParam<T>(param: string): T {
        return this.state.path("loadedParams", {}).get(param) as T;
    }
}

// Export extended class.
export = CustomRequestEngine;

// Add type support.
declare module "xpresser/types/http" {
    interface Http extends CustomRequestEngine {}
}
