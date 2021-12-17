/**
 * Load Param Middleware Generator.
 * @param param
 */
import { Http, Controller } from "xpresser/types/http";
import MethodWithHttp = Controller.MethodWithHttp;

/**
 * Param type definition.
 */
type Param = {
    notFound?: (http: Http, value: any) => any;
    load?: (value: any, http: Http) => any;
    as?: string;
    addToBoot?: boolean;
    loadError?: (http: Http, error: Error) => any;
};

/**
 * Params type definition.
 */
type Params = Record<string, Param>;

/**
 * Params Loader function.
 * @param params
 */
function generateParamLoader<T extends Params>(params: T) {
    type ParamKeys = keyof T;

    /**
     * Load Param Middleware Generator.
     * @param param
     */
    return function ParamLoader(param: ParamKeys): MethodWithHttp {
        // If param has no definition, throw error.
        if (!params[param]) throw new Error(`Definition for param: '${param}' not found!`);

        // Get params definition as `helper`
        const helper = params[param];

        // Convert to express
        return async (http) => {
            // Get value of param from http
            const value = http.params[param as string];

            // run not found if param is missing
            if (helper.notFound && !value) return helper.notFound(http, value);

            // Get loadedValue of param from loader
            let loadedValue = undefined;

            try {
                // if loaded exists, run loader else use value
                if (helper.load) {
                    loadedValue = await helper.load(value, http);
                } else {
                    loadedValue = value;
                }

                // Stop if headers are already sent
                if (http.res.headersSent) return;
            } catch (e: any) {
                if (helper.loadError) return helper.loadError(http, e as Error);
                // log errors
                http.$("logError")(e);
            }

            // if not loadedValue run notFound
            if (helper.notFound && !loadedValue) return helper.notFound(http, value);

            // add to boot if addToBoot is true
            if (helper.addToBoot) http.addToBoot(helper.as || (param as string), loadedValue);

            // Add to loadedParams state
            http.addLoadedParam(helper.as || (param as string), loadedValue);

            // return next
            return http.next();
        };
    };
}

/**
 * Generate Middleware from defined params.
 * @param params
 */
export function GenerateParamsMiddleware<T extends Params>(params: T) {
    // Generate param loader.
    const loadParam = generateParamLoader(params);

    // Holds all middlewares.
    const middleware: Record<keyof T, MethodWithHttp> = {} as any;

    // Populate middleware.
    for (const param in params) {
        middleware[param] = loadParam(param);
    }

    return middleware;
}
