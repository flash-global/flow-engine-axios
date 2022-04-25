import MockAdapter from 'axios-mock-adapter';
import { httpClient } from '../../src';

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

    test('GET success - without axiosConfig attribute', async () => {
        const flow = httpClient<{}, { value: number }>({ url: '/api/test/1', method: 'GET' });
        const axiosMock = new MockAdapter(flow.instance);

        axiosMock.onGet('/api/test/1').reply(200, { value: 1 });

        const { response } = await flow({});

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
});
