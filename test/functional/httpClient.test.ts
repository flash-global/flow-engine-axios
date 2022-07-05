import MockAdapter from 'axios-mock-adapter';
import pino from 'pino';
import { httpClient } from '../../src';
import { AxiosRequestConfig } from 'axios';

describe('Test httpClient flow', () => {
    test('HTTP request fail - route not found', async () => {
        const flow = httpClient<{}, { value: number }>({});
        const axiosMock = new MockAdapter(flow.instance);

        axiosMock.onGet('/api/test/1').reply(200, { value: 1 });

        await expect(flow({ axiosConfig: { url: '/api/not-found' } })).rejects.toMatchObject({
            isAxiosError: true,
            response: expect.objectContaining({ status: 404 }),
        });
    });

    test('GET success', async () => {
        const flow = httpClient<{}, { value: number }>({});
        const axiosMock = new MockAdapter(flow.instance);

        axiosMock.onGet('/api/test/1').reply(200, { value: 1 });

        const { response } = await flow({ axiosConfig: { url: '/api/test/1', method: 'GET' } });

        expect(response.status).toStrictEqual(200);
        expect(response.data).toStrictEqual({ value: 1 });
    });

    test('POST success', async () => {
        const flow = httpClient<{}, { value: number }>({});
        const axiosMock = new MockAdapter(flow.instance);

        axiosMock.onPost('/api/test', { value: 2 }).reply(201, { value: 2 });

        const { response } = await flow({ axiosConfig: { url: '/api/test', method: 'POST', data: {
            value: 2,
        } } });

        expect(response.status).toStrictEqual(201);
        expect(response.data).toStrictEqual({ value: 2 });
    });

    test('PUT success', async () => {
        const flow = httpClient<{}, { value: number }>({});
        const axiosMock = new MockAdapter(flow.instance);

        axiosMock.onPut('/api/test', { value: 3 }).reply(200, { value: 3 });

        const { response } = await flow({ axiosConfig: { url: '/api/test', method: 'PUT', data: {
            value: 3,
        } } });

        expect(response.status).toStrictEqual(200);
        expect(response.data).toStrictEqual({ value: 3 });
    });

    test('PATCH success', async () => {
        const flow = httpClient<{}, { value: number }>({});
        const axiosMock = new MockAdapter(flow.instance);

        axiosMock.onPatch('/api/test', { value: 4 }).reply(200, { value: 4 });

        const { response } = await flow({ axiosConfig: { url: '/api/test', method: 'PATCH', data: {
            value: 4,
        } } });

        expect(response.status).toStrictEqual(200);
        expect(response.data).toStrictEqual({ value: 4 });
    });

    test('DELETE success', async () => {
        const flow = httpClient<{}, { value: number }>({});
        const axiosMock = new MockAdapter(flow.instance);

        axiosMock.onDelete('/api/test/5').reply(200, { value: 5 });

        const { response } = await flow({ axiosConfig: { url: '/api/test/5', method: 'DELETE' } });

        expect(response.status).toStrictEqual(200);
        expect(response.data).toStrictEqual({ value: 5 });
    });

    test('GET success with global logger', async () => {
        const logger = pino();
        logger.info = jest.fn();

        const flow = httpClient<{}, { value: number }>({}, logger);
        const axiosMock = new MockAdapter(flow.instance);

        axiosMock.onGet('/api/test/1').reply(200, { value: 1 });

        const { response } = await flow({ axiosConfig: { url: '/api/test/1', method: 'GET' } });

        expect(response.status).toStrictEqual(200);
        expect(response.data).toStrictEqual({ value: 1 });

        const infoLogMock = logger.info as jest.Mock;
        expect(infoLogMock.mock.calls.length).toStrictEqual(2);

        expect(infoLogMock.mock.calls[0].length).toStrictEqual(2);
        expect(infoLogMock.mock.calls[0][1]).toStrictEqual('axios http request fulfilled');
        expect(infoLogMock.mock.calls[0][0]).toStrictEqual({
            event: 'http:request',
            method: 'get',
            url: '/api/test/1',
        });

        expect(infoLogMock.mock.calls[1].length).toStrictEqual(2);
        expect(infoLogMock.mock.calls[1][1]).toStrictEqual('axios http response fulfilled');
        expect(infoLogMock.mock.calls[1][0]).toStrictEqual({
            event: 'http:response',
            body: '{"value":1}',
            headers: undefined,
            http_code: 200,
        });
    });

    test('GET network error with global logger', async () => {
        const logger = pino();
        logger.info = jest.fn();
        logger.error = jest.fn();

        const flow = httpClient<{}, { value: number }>({}, logger);
        const axiosMock = new MockAdapter(flow.instance);

        axiosMock.onGet('/api/test/1').networkErrorOnce();

        await expect(flow({ axiosConfig: { url: '/api/test/1', method: 'GET' } })).rejects.toMatchObject({
            isAxiosError: true,
        });

        const infoLogMock = logger.info as jest.Mock;
        expect(infoLogMock.mock.calls.length).toStrictEqual(1);
        expect(infoLogMock.mock.calls[0].length).toStrictEqual(2);
        expect(infoLogMock.mock.calls[0][1]).toStrictEqual('axios http request fulfilled');
        expect(infoLogMock.mock.calls[0][0]).toStrictEqual({
            event: 'http:request',
            method: 'get',
            url: '/api/test/1',
        });

        const errorLogMock = logger.error as jest.Mock;
        expect(errorLogMock.mock.calls.length).toStrictEqual(1);
        expect(errorLogMock.mock.calls[0].length).toStrictEqual(2);
        expect(errorLogMock.mock.calls[0][1]).toStrictEqual('axios http response rejected');
        expect(errorLogMock.mock.calls[0][0]).toMatchObject({
            event: 'http:response:error',
            body: undefined,
            headers: undefined,
            http_code: -1,
            error: expect.stringMatching('Network Error'),
        });
    });

    test('GET request interceptor throw not AxiosError with global logger - impossible to log', async () => {
        const logger = pino();
        logger.info = jest.fn();
        logger.error = jest.fn();

        const flow = httpClient<{}, { value: number }>({}, logger);
        flow.instance.interceptors.request.use(() => {
            throw new Error('toto');
        });

        const axiosMock = new MockAdapter(flow.instance);

        axiosMock.onGet('/api/test/1').networkErrorOnce();

        await expect(flow({ axiosConfig: { url: '/api/test/1', method: 'GET' } })).rejects.toMatchObject({
            message: 'toto',
        });

        const infoLogMock = logger.info as jest.Mock;
        expect(infoLogMock.mock.calls.length).toStrictEqual(0);

        const errorLogMock = logger.error as jest.Mock;
        expect(errorLogMock.mock.calls.length).toStrictEqual(0);
    });

    test('GET request interceptor throw AxiosError with global logger', async () => {
        const logger = pino();
        logger.info = jest.fn();
        logger.error = jest.fn();

        const flow = httpClient<{}, { value: number }>({}, logger);
        flow.instance.interceptors.request.use((config: AxiosRequestConfig) => {
            const error: any = new Error('toto');

            Object.defineProperties(error, {
                isAxiosError: { value: true },
                config: { value: config },
            });

            throw error;
        });

        const axiosMock = new MockAdapter(flow.instance);

        axiosMock.onGet('/api/test/1').networkErrorOnce();

        await expect(flow({ axiosConfig: { url: '/api/test/1', method: 'GET' } })).rejects.toMatchObject({
            message: 'toto',
        });

        const infoLogMock = logger.info as jest.Mock;
        expect(infoLogMock.mock.calls.length).toStrictEqual(0);

        const errorLogMock = logger.error as jest.Mock;
        expect(errorLogMock.mock.calls.length).toStrictEqual(2);

        expect(errorLogMock.mock.calls[0].length).toStrictEqual(2);
        expect(errorLogMock.mock.calls[0][1]).toStrictEqual('axios http request rejected');
        expect(errorLogMock.mock.calls[0][0]).toMatchObject({
            event: 'http:request:error',
            error: expect.stringContaining('toto'),
        });

        expect(errorLogMock.mock.calls[1].length).toStrictEqual(2);
        expect(errorLogMock.mock.calls[1][1]).toStrictEqual('axios http response rejected');
        expect(errorLogMock.mock.calls[1][0]).toMatchObject({
            event: 'http:response:error',
            body: undefined,
            headers: undefined,
            http_code: -1,
            error: expect.stringContaining('toto'),
        });
    });

    test('POST success with global logger', async () => {
        const logger = pino();
        logger.info = jest.fn();

        const flow = httpClient<{}, { value: number }>({}, logger);
        const axiosMock = new MockAdapter(flow.instance);

        axiosMock.onPost('/api/test', { value: 2 }).reply(201, { value: 2 });

        const { response } = await flow({ axiosConfig: { url: '/api/test', method: 'POST', data: { value: 2 } } });

        expect(response.status).toStrictEqual(201);
        expect(response.data).toStrictEqual({ value: 2 });

        const infoLogMock = logger.info as jest.Mock;
        expect(infoLogMock.mock.calls.length).toStrictEqual(2);

        expect(infoLogMock.mock.calls[0].length).toStrictEqual(2);
        expect(infoLogMock.mock.calls[0][1]).toStrictEqual('axios http request fulfilled');
        expect(infoLogMock.mock.calls[0][0]).toStrictEqual({
            event: 'http:request',
            method: 'post',
            url: '/api/test',
            body: '{"value":2}',
        });

        expect(infoLogMock.mock.calls[1].length).toStrictEqual(2);
        expect(infoLogMock.mock.calls[1][1]).toStrictEqual('axios http response fulfilled');
        expect(infoLogMock.mock.calls[1][0]).toStrictEqual({
            event: 'http:response',
            body: '{"value":2}',
            headers: undefined,
            http_code: 201,
        });
    });

    test('HTTP request fail - route not found with logger 2 ways', async () => {
        {
            const logger = pino();
            logger.info = jest.fn();
            logger.error = jest.fn();

            const flow = httpClient<{}, { value: number }>({}, logger);
            const axiosMock = new MockAdapter(flow.instance);

            axiosMock.onGet('/api/test/1').reply(200, { value: 1 });

            await expect(flow({ axiosConfig: { url: '/api/not-found' } })).rejects.toMatchObject({
                isAxiosError: true,
                response: expect.objectContaining({ status: 404 }),
            });

            const infoLogMock = logger.info as jest.Mock;
            expect(infoLogMock.mock.calls.length).toStrictEqual(1);
            expect(infoLogMock.mock.calls[0].length).toStrictEqual(2);
            expect(infoLogMock.mock.calls[0][1]).toStrictEqual('axios http request fulfilled');
            expect(infoLogMock.mock.calls[0][0]).toStrictEqual({
                event: 'http:request',
                method: 'get',
                url: '/api/not-found',
            });

            const errorLogMock = logger.error as jest.Mock;
            expect(errorLogMock.mock.calls.length).toStrictEqual(1);
            expect(errorLogMock.mock.calls[0].length).toStrictEqual(2);
            expect(errorLogMock.mock.calls[0][1]).toStrictEqual('axios http response rejected');
            expect(errorLogMock.mock.calls[0][0]).toMatchObject({
                event: 'http:response:error',
                body: undefined,
                headers: undefined,
                http_code: 404,
                error: expect.stringContaining('Request failed with status code 404'),
            });
        }

        {
            const logger = pino();
            const logger2 = logger.child({ value2: 'test' });
            logger.info = jest.fn();
            logger.error = jest.fn();
            logger2.info = jest.fn();
            logger2.error = jest.fn();

            const flow = httpClient<{}, { value: number }>({}, logger);
            const axiosMock = new MockAdapter(flow.instance);

            axiosMock.onGet('/api/test/1').reply(200, { value: 1 });

            await expect(flow({ axiosConfig: { url: '/api/not-found' }, logger: logger2 })).rejects.toMatchObject({
                isAxiosError: true,
                response: expect.objectContaining({ status: 404 }),
            });

            const infoLogMock = logger.info as jest.Mock;
            const errorLogMock = logger.error as jest.Mock;

            expect(infoLogMock.mock.calls.length).toStrictEqual(0);
            expect(errorLogMock.mock.calls.length).toStrictEqual(0);

            const infoLogMock2 = logger2.info as jest.Mock;
            const errorLogMock2 = logger2.error as jest.Mock;

            expect(infoLogMock2.mock.calls.length).toStrictEqual(1);
            expect(infoLogMock2.mock.calls[0].length).toStrictEqual(2);
            expect(infoLogMock2.mock.calls[0][1]).toStrictEqual('axios http request fulfilled');
            expect(infoLogMock2.mock.calls[0][0]).toStrictEqual({
                event: 'http:request',
                method: 'get',
                url: '/api/not-found',
            });

            expect(errorLogMock2.mock.calls.length).toStrictEqual(1);
            expect(errorLogMock2.mock.calls[0].length).toStrictEqual(2);
            expect(errorLogMock2.mock.calls[0][1]).toStrictEqual('axios http response rejected');
            expect(errorLogMock2.mock.calls[0][0]).toMatchObject({
                event: 'http:response:error',
                body: undefined,
                headers: undefined,
                http_code: 404,
                error: expect.stringContaining('Request failed with status code 404'),
            });
        }
    });
});
