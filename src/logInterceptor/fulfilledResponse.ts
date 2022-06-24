import { AxiosResponse } from 'axios';
import { InternalAxiosRequestConfig } from '../httpClient';

export default (response: AxiosResponse): AxiosResponse => {
    const requestConfig: InternalAxiosRequestConfig = response.config;

    if (typeof requestConfig.logger === 'undefined') {
        return response;
    }

    const context = {
        headers: JSON.stringify(response.headers),
        body: JSON.stringify(response.data),
        http_code: response.status,
    };

    requestConfig.logger.info(context, 'http:response');

    return response;
};
