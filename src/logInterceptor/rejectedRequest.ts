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
        event: 'http:request:error',
        error: JSON.stringify(serializedError),
    };

    config.logger.error(logContext, 'axios http request rejected');

    return Promise.reject(error);
};
