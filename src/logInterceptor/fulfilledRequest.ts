import { InternalAxiosRequestConfig } from '../httpClient';

const buildFullPath = require('axios/lib/core/buildFullPath');
const buildURL = require('axios/lib/helpers/buildURL');

/*
* TODO: to remove
* This function is temporary, since the fix for instance.getUri is not tagged on axios repository:
* https://github.com/axios/axios/pull/3737
*/
const getUri = (config: InternalAxiosRequestConfig): string => {
    const fullPath: string = buildFullPath(config.baseURL, config.url);
    return buildURL(fullPath, config.params, config.paramsSerializer);
};

interface LogContext {
    event: string,
    url: string,
    method: string,
    body?: string,
    headers?: string
}

export default (requestConfig: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    if (typeof requestConfig.logger === 'undefined') {
        return requestConfig;
    }

    const context: LogContext = {
        event: 'http:request',
        url: getUri(requestConfig),
        method: requestConfig.method || 'GET',
    };

    if (typeof requestConfig.data !== 'undefined') {
        context.body = JSON.stringify(requestConfig.data);
    }

    if (typeof requestConfig.headers !== 'undefined') {
        context.headers = JSON.stringify(requestConfig.headers);
    }

    requestConfig.logger.info(context, 'axios http request fulfilled');

    return requestConfig;
};
