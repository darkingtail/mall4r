import { type HttpClient, httpClient } from "@/service";

export interface SysMenu {
	menuId?: number;
	parentId: number;
	name: string;
	url?: string;
	perms?: string;
	type?: number; // 0:目录 1:菜单 2:按钮
	icon?: string;
	orderNum?: number;
	list?: SysMenu[];
	children?: SysMenu[];
}

const SYS_MENU_BASE_PATH = "/sys/menu";

export function createSysMenuApi(client: HttpClient = httpClient) {
	return {
		// 获取菜单树（不含按钮，用于角色权限分配）
		listMenuTree(): Promise<SysMenu[]> {
			return client.get<SysMenu[], SysMenu[]>(`${SYS_MENU_BASE_PATH}/list`);
		},
		// 获取所有菜单（含按钮，扁平列表，用于菜单管理表格）
		fetchTable(): Promise<SysMenu[]> {
			return client.get<SysMenu[], SysMenu[]>(`${SYS_MENU_BASE_PATH}/table`);
		},
		// 获取菜单详情
		getById(menuId: number): Promise<SysMenu> {
			return client.get<SysMenu, SysMenu>(
				`${SYS_MENU_BASE_PATH}/info/${menuId}`,
			);
		},
		// 获取一级目录列表
		listRootMenu(): Promise<SysMenu[]> {
			return client.get<SysMenu[], SysMenu[]>(
				`${SYS_MENU_BASE_PATH}/listRootMenu`,
			);
		},
		// 获取子菜单列表
		listChildrenMenu(parentId: number): Promise<SysMenu[]> {
			return client.get<SysMenu[], SysMenu[]>(
				`${SYS_MENU_BASE_PATH}/listChildrenMenu?parentId=${parentId}`,
			);
		},
		// 新增菜单
		add(data: SysMenu): Promise<void> {
			return client.post(SYS_MENU_BASE_PATH, data);
		},
		// 更新菜单
		update(data: SysMenu): Promise<void> {
			return client.put(SYS_MENU_BASE_PATH, data);
		},
		// 删除菜单
		delete(menuId: number): Promise<void> {
			return client.delete(`${SYS_MENU_BASE_PATH}/${menuId}`);
		},
	};
}

export const sysMenuApi = createSysMenuApi();

// 菜单类型映射
export const MENU_TYPE_MAP: Record<number, string> = {
	0: "目录",
	1: "菜单",
	2: "按钮",
};
