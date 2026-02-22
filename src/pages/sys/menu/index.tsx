import {
	type SysMenu,
	MENU_TYPE_MAP,
	sysMenuApi,
} from "@/service/api/sys/menu";
import { App, Button, Popconfirm, Space, Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useCallback, useEffect, useState } from "react";
import SysMenuModal, { type SysMenuModalType } from "./SysMenuModal";

// 将扁平列表按 parentId 构建树
function buildTree(list: SysMenu[]): SysMenu[] {
	const map = new Map<number, SysMenu>();
	const roots: SysMenu[] = [];

	for (const item of list) {
		map.set(item.menuId!, { ...item, children: [] });
	}

	for (const item of list) {
		const node = map.get(item.menuId!)!;
		if (item.parentId === 0) {
			roots.push(node);
		} else {
			const parent = map.get(item.parentId);
			if (parent) {
				parent.children!.push(node);
			}
		}
	}

	return roots;
}

const typeColorMap: Record<number, string> = {
	0: "blue",
	1: "green",
	2: "orange",
};

export default function SysMenuPage() {
	const [loading, setLoading] = useState(false);
	const [dataSource, setDataSource] = useState<SysMenu[]>([]);
	const [modalVisible, setModalVisible] = useState(false);
	const [modalType, setModalType] = useState<SysMenuModalType>("add");
	const [editingId, setEditingId] = useState<number | null>(null);

	const { message } = App.useApp();

	const fetchDataSource = useCallback(async () => {
		setLoading(true);
		try {
			const list = await sysMenuApi.fetchTable();
			setDataSource(buildTree(list));
		} catch (error) {
			console.error(error);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchDataSource();
	}, [fetchDataSource]);

	const handleDelete = async (menuId: number) => {
		try {
			await sysMenuApi.delete(menuId);
			message.success("删除成功");
			fetchDataSource();
		} catch (error) {
			console.error(error);
		}
	};

	const openModal = (type: SysMenuModalType, menuId?: number) => {
		setModalType(type);
		setEditingId(menuId ?? null);
		setModalVisible(true);
	};

	const columns: ColumnsType<SysMenu> = [
		{
			title: "名称",
			dataIndex: "name",
			key: "name",
			width: 200,
		},
		{
			title: "图标",
			dataIndex: "icon",
			key: "icon",
			width: 80,
			render: (val) => val || "-",
		},
		{
			title: "类型",
			dataIndex: "type",
			key: "type",
			width: 80,
			align: "center",
			render: (type: number) => (
				<Tag color={typeColorMap[type]}>{MENU_TYPE_MAP[type]}</Tag>
			),
		},
		{
			title: "排序",
			dataIndex: "orderNum",
			key: "orderNum",
			width: 70,
			align: "center",
		},
		{
			title: "菜单URL",
			dataIndex: "url",
			key: "url",
			width: 180,
			render: (val) => val || "-",
		},
		{
			title: "权限标识",
			dataIndex: "perms",
			key: "perms",
			width: 250,
			ellipsis: true,
			render: (val) => val || "-",
		},
		{
			title: "操作",
			key: "action",
			width: 120,
			align: "center",
			fixed: "right",
			render: (_, record) => (
				<Space>
					<Button
						type="link"
						size="small"
						onClick={() => openModal("update", record.menuId)}
					>
						编辑
					</Button>
					<Popconfirm
						title="确定删除该菜单吗？"
						description="如有子菜单需先删除子菜单"
						onConfirm={() => handleDelete(record.menuId!)}
					>
						<Button type="link" danger size="small">
							删除
						</Button>
					</Popconfirm>
				</Space>
			),
		},
	];

	return (
		<div className="rounded-lg bg-white p-4 shadow-sm">
			<div className="mb-4">
				<Button type="primary" onClick={() => openModal("add")}>
					新增
				</Button>
			</div>

			<Table
				rowKey="menuId"
				columns={columns}
				dataSource={dataSource}
				loading={loading}
				pagination={false}
				scroll={{ x: 1000 }}
				defaultExpandAllRows
			/>

			<SysMenuModal
				open={modalVisible}
				type={modalType}
				editingId={editingId}
				onOk={() => {
					setModalVisible(false);
					fetchDataSource();
				}}
				onCancel={() => setModalVisible(false)}
			/>
		</div>
	);
}
