import axios from "axios";
/**
 * Wrapping the actual HTTP request client (Axios)
 */
export class HttpRequestClient {
    static get instance() {
        return HttpRequestClient._instance;
    }
    request(requestOptions) {
        return HttpRequestClient._instance(requestOptions);
    }
}
HttpRequestClient._instance = axios.create({
    validateStatus: (status) => status < 300,
});
//# sourceMappingURL=HttpRequestClient.js.map