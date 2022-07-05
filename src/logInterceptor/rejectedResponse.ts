import { err } from 'pino-std-serializers';
import { AxiosError } from 'axios';
import { InternalAxiosRequestConfig } from '../httpClient';

export default (error: AxiosError | any): Promise<AxiosError | any> => {
    if (!error.isAxiosError) {
        return Promise.reject(error);
    }

    const config: InternalAxiosRequestConfig = error.config;

    if (typeof config.logger === 'undefined') {
        return Promise.reject(error);
    }

    const serializedError = err(error);
    delete serializedError.config;

    const logContext = {
        event: 'http:response:error',
        error: JSON.stringify(serializedError),
        http_code: error.response?.status || -1,
        body: JSON.stringify(error.response?.data),
        headers: JSON.stringify(error.response?.headers),
    };

    config.logger.error(logContext, 'axios http response rejected');

    return Promise.reject(error);
};
