import { type HttpClient, httpClient } from "@/service";

export interface SysRole {
	roleId?: number;
	roleName: string;
	remark?: string;
	createTime?: string;
	menuIdList?: number[];
}

export interface FetchSysRolePageRequest {
	current: number;
	size: number;
	roleName?: string;
}

export interface FetchSysRolePageResponse {
	current: number;
	pages: number;
	records: SysRole[];
	size: number;
	total: number;
}

const SYS_ROLE_BASE_PATH = "/sys/role";

export function createSysRoleApi(client: HttpClient = httpClient) {
	return {
		// 分页获取角色列表
		fetchPage(
			params: FetchSysRolePageRequest,
		): Promise<FetchSysRolePageResponse> {
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
				? `${SYS_ROLE_BASE_PATH}/page?${urlParams}`
				: `${SYS_ROLE_BASE_PATH}/page`;
			return client.get<FetchSysRolePageResponse, FetchSysRolePageResponse>(
				url,
			);
		},
		// 获取全部角色列表（用于下拉选择）
		listAll(): Promise<SysRole[]> {
			return client.get<SysRole[], SysRole[]>(`${SYS_ROLE_BASE_PATH}/list`);
		},
		// 获取角色详情（含 menuIdList）
		getById(roleId: number): Promise<SysRole> {
			return client.get<SysRole, SysRole>(
				`${SYS_ROLE_BASE_PATH}/info/${roleId}`,
			);
		},
		// 新增角色
		add(data: SysRole): Promise<void> {
			return client.post(SYS_ROLE_BASE_PATH, data);
		},
		// 更新角色
		update(data: SysRole): Promise<void> {
			return client.put(SYS_ROLE_BASE_PATH, data);
		},
		// 删除角色（批量）
		delete(roleIds: number[]): Promise<void> {
			return client.delete(SYS_ROLE_BASE_PATH, { data: roleIds });
		},
	};
}

export const sysRoleApi = createSysRoleApi();
