import { Flow, FlowInput, FlowOutput } from '@flow-engine/core';
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

type HTTPFlowInput<Input> = Input & { axiosConfig?: AxiosRequestConfig };
type HTTPFlowOutput<Input, Output> = Input & { response: AxiosResponse<Output> };
type HTTPFlow<Input, Output> = Flow<HTTPFlowInput<Input>, HTTPFlowOutput<Input, Output>>;

const httpClient = <
    Input extends FlowInput = FlowInput,
    BodyOutput extends FlowOutput = FlowOutput,
    Config extends AxiosRequestConfig = AxiosRequestConfig,
>(config: Config): HTTPFlow<Input, BodyOutput> & { instance: AxiosInstance } => {
    const instance = axios.create(config);

    const httpClientFlow: HTTPFlow<Input, BodyOutput> & { instance?: AxiosInstance } = (input: HTTPFlowInput<Input>): Promise<HTTPFlowOutput<Input, BodyOutput>> => {
        return instance.request<BodyOutput>(input.axiosConfig || config).then((response: AxiosResponse<BodyOutput>) => {
            const output = { ...input, response };
            delete output.axiosConfig;

            return output;
        });
    };

    httpClientFlow.id = 'httpClientFlow';
    httpClientFlow.instance = instance;

    return httpClientFlow as HTTPFlow<Input, BodyOutput> & { instance: AxiosInstance };
};

export { HTTPFlowInput, HTTPFlowOutput, HTTPFlow };
export default httpClient;
