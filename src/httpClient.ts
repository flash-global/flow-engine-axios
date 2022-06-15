import { Flow, FlowInput } from '@flow-engine/core';
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

type HTTPFlowInput<Input = FlowInput, Body = any> = Input & { axiosConfig?: AxiosRequestConfig<Body> };
type HTTPFlowOutput<Input = FlowInput, Body = any> = Input & { response: AxiosResponse<Body> };
type HTTPFlow<
    Input = FlowInput,
    BodyInput = any,
    BodyOutput = any,
> = Flow<HTTPFlowInput<Input, BodyInput>, HTTPFlowOutput<Input, BodyOutput>>;

const httpClient = <
    Input extends FlowInput = FlowInput,
    BodyInput extends any = any,
    BodyOutput extends any = any,
    Config extends AxiosRequestConfig = AxiosRequestConfig,
>(config: Config): HTTPFlow<Input, BodyInput, BodyOutput> & { instance: AxiosInstance } => {
    const instance = axios.create(config);

    const httpClientFlow: HTTPFlow<Input, BodyInput, BodyOutput> & { instance?: AxiosInstance } = (input: HTTPFlowInput<Input, BodyInput>): Promise<HTTPFlowOutput<Input, BodyOutput>> => {
        return instance.request<BodyOutput>(input.axiosConfig || config).then((response: AxiosResponse<BodyOutput>) => {
            const output = { ...input, response };
            delete output.axiosConfig;

            return output;
        });
    };

    httpClientFlow.id = 'httpClientFlow';
    httpClientFlow.instance = instance;

    return httpClientFlow as HTTPFlow<Input, BodyInput, BodyOutput> & { instance: AxiosInstance };
};

export { HTTPFlowInput, HTTPFlowOutput, HTTPFlow };
export default httpClient;
