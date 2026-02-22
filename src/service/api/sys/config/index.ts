import { type HttpClient, httpClient } from "@/service";

export interface SysConfig {
	id?: number;
	paramKey: string;
	paramValue: string;
	remark?: string;
}

export interface FetchSysConfigPageRequest {
	current: number;
	size: number;
	paramKey?: string;
}

export interface FetchSysConfigPageResponse {
	current: number;
	pages: number;
	records: SysConfig[];
	size: number;
	total: number;
}

const SYS_CONFIG_BASE_PATH = "/sys/config";

export function createSysConfigApi(client: HttpClient = httpClient) {
	return {
		// 分页获取参数列表
		fetchPage(
			params: FetchSysConfigPageRequest,
		): Promise<FetchSysConfigPageResponse> {
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
				? `${SYS_CONFIG_BASE_PATH}/page?${urlParams}`
				: `${SYS_CONFIG_BASE_PATH}/page`;
			return client.get<
				FetchSysConfigPageResponse,
				FetchSysConfigPageResponse
			>(url);
		},
		// 获取参数详情
		getById(id: number): Promise<SysConfig> {
			return client.get<SysConfig, SysConfig>(
				`${SYS_CONFIG_BASE_PATH}/info/${id}`,
			);
		},
		// 新增参数
		add(data: SysConfig): Promise<void> {
			return client.post(SYS_CONFIG_BASE_PATH, data);
		},
		// 更新参数
		update(data: SysConfig): Promise<void> {
			return client.put(SYS_CONFIG_BASE_PATH, data);
		},
		// 删除参数（批量）
		delete(ids: number[]): Promise<void> {
			return client.delete(SYS_CONFIG_BASE_PATH, { data: ids });
		},
	};
}

export const sysConfigApi = createSysConfigApi();
