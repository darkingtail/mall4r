import { type HttpClient, httpClient } from "@/service";

export interface SysMenu {
	menuId: number;
	parentId: number;
	name: string;
	url?: string;
	perms?: string;
	type?: number; // 0:目录 1:菜单 2:按钮
	icon?: string;
	orderNum?: number;
	list?: SysMenu[];
}

const SYS_MENU_BASE_PATH = "/sys/menu";

export function createSysMenuApi(client: HttpClient = httpClient) {
	return {
		// 获取菜单树（不含按钮，用于角色权限分配）
		listMenuTree(): Promise<SysMenu[]> {
			return client.get<SysMenu[], SysMenu[]>(`${SYS_MENU_BASE_PATH}/list`);
		},
	};
}

export const sysMenuApi = createSysMenuApi();
