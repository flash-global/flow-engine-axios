import { Flow, FlowInput } from '@flow-engine/core';
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { Logger } from 'pino';

import fulfilledRequest from './logInterceptor/fulfilledRequest';
import rejectedRequest from './logInterceptor/rejectedRequest';
import fulfilledResponse from './logInterceptor/fulfilledResponse';
import rejectedResponse from './logInterceptor/rejectedResponse';

type HTTPFlowInput<Input = FlowInput, Body = any> = Input & { axiosConfig: InternalAxiosRequestConfig<Body>, logger?: Logger };
type HTTPFlowOutput<Input = FlowInput, Body = any> = Input & { response: AxiosResponse<Body> };
type HTTPFlow<
    Input = FlowInput,
    BodyInput = any,
    BodyOutput = any,
> = Flow<HTTPFlowInput<Input, BodyInput>, HTTPFlowOutput<Input, BodyOutput>> & { instance: AxiosInstance };

export interface InternalAxiosRequestConfig<Body = any> extends AxiosRequestConfig<Body> {
    logger?: Logger,
}

const httpClient = <
    Input extends FlowInput = FlowInput,
    BodyInput extends any = any,
    BodyOutput extends any = any,
    Config extends AxiosRequestConfig = AxiosRequestConfig,
>(config: Config, logger?: Logger): HTTPFlow<Input, BodyInput, BodyOutput> => {
    const instance = axios.create(config);

    instance.interceptors.request.use(fulfilledRequest, rejectedRequest);
    instance.interceptors.response.use(fulfilledResponse, rejectedResponse);

    const httpClientFlow: HTTPFlow<Input, BodyInput, BodyOutput> = (input: HTTPFlowInput<Input, BodyInput>): Promise<HTTPFlowOutput<Input, BodyOutput>> => {
        return instance.request<BodyOutput>({ ...input.axiosConfig, logger: input.logger || logger } as InternalAxiosRequestConfig)
            .then((response: AxiosResponse<BodyOutput>): HTTPFlowOutput<Input, BodyOutput> => {
                const output = { ...input, response } as HTTPFlowOutput<Input, BodyOutput> & { axiosConfig?: AxiosRequestConfig };
                delete output.axiosConfig;
    
                return output;
            });
    };

    httpClientFlow.id = 'httpClientFlow';
    httpClientFlow.instance = instance;

    return httpClientFlow;
};

export { HTTPFlowInput, HTTPFlowOutput, HTTPFlow };
export default httpClient;
