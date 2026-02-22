import { type HttpClient, httpClient } from "@/service";

export interface SysLog {
	id: number;
	username?: string;
	operation?: string;
	method?: string;
	params?: string;
	time: number; // 执行时长(毫秒)
	ip?: string;
	createDate?: string;
}

export interface FetchSysLogPageRequest {
	current: number;
	size: number;
	username?: string;
	operation?: string;
}

export interface FetchSysLogPageResponse {
	current: number;
	pages: number;
	records: SysLog[];
	size: number;
	total: number;
}

const SYS_LOG_BASE_PATH = "/sys/log";

export function createSysLogApi(client: HttpClient = httpClient) {
	return {
		// 分页获取日志列表
		fetchPage(
			params: FetchSysLogPageRequest,
		): Promise<FetchSysLogPageResponse> {
			const urlParams = Object.entries(params)
				.map(([key, value]) => {
					if (value === undefined || value === null || value === "") {
						return "";
					}
					return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
				})
				.filter(Boolean)
				.join("&");

			const url = urlParams
				? `${SYS_LOG_BASE_PATH}/page?${urlParams}`
				: `${SYS_LOG_BASE_PATH}/page`;
			return client.get<FetchSysLogPageResponse, FetchSysLogPageResponse>(
				url,
			);
		},
	};
}

export const sysLogApi = createSysLogApi();
