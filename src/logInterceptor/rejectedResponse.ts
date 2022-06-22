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

    config.logger.error(
        {
            error: JSON.stringify(serializedError),
            http_code: error.response?.status || -1,
            body: JSON.stringify(error.response?.data),
            headers: JSON.stringify(error.response?.headers),
        },
        'http:response:error',
    );

    return Promise.reject(error);
};
