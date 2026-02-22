import { type SysRole, sysRoleApi } from "@/service/api/sys/role";
import {
	App,
	Button,
	Form,
	Input,
	Popconfirm,
	Space,
	Table,
} from "antd";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import { useCallback, useEffect, useState } from "react";
import SysRoleModal, { type SysRoleModalType } from "./SysRoleModal";

export default function SysRolePage() {
	const [loading, setLoading] = useState(false);
	const [dataSource, setDataSource] = useState<SysRole[]>([]);
	const [pagination, setPagination] = useState<TablePaginationConfig>({
		current: 1,
		pageSize: 10,
		total: 0,
	});
	const [searchForm] = Form.useForm();
	const [modalVisible, setModalVisible] = useState(false);
	const [modalType, setModalType] = useState<SysRoleModalType>("add");
	const [editingId, setEditingId] = useState<number | null>(null);

	const { message } = App.useApp();

	const fetchDataSource = useCallback(
		async (page = 1, size = 10, roleName?: string) => {
			setLoading(true);
			try {
				const res = await sysRoleApi.fetchPage({
					current: page,
					size,
					roleName,
				});
				setDataSource(res.records);
				setPagination((prev) => ({
					...prev,
					current: res.current,
					pageSize: res.size,
					total: res.total,
				}));
			} catch (error) {
				console.error(error);
			} finally {
				setLoading(false);
			}
		},
		[],
	);

	useEffect(() => {
		fetchDataSource();
	}, [fetchDataSource]);

	const handleSearch = (values: { roleName?: string }) => {
		fetchDataSource(1, pagination.pageSize, values.roleName);
	};

	const handleReset = () => {
		searchForm.resetFields();
		fetchDataSource(1, pagination.pageSize);
	};

	const handleTableChange = (newPagination: TablePaginationConfig) => {
		const values = searchForm.getFieldsValue();
		fetchDataSource(
			newPagination.current,
			newPagination.pageSize,
			values.roleName,
		);
	};

	const handleDelete = async (roleId: number) => {
		try {
			await sysRoleApi.delete([roleId]);
			message.success("删除成功");
			fetchDataSource(pagination.current, pagination.pageSize);
		} catch (error) {
			console.error(error);
		}
	};

	const openModal = (type: SysRoleModalType, roleId?: number) => {
		setModalType(type);
		setEditingId(roleId ?? null);
		setModalVisible(true);
	};

	const columns: ColumnsType<SysRole> = [
		{
			title: "角色名称",
			dataIndex: "roleName",
			key: "roleName",
			width: 150,
		},
		{
			title: "备注",
			dataIndex: "remark",
			key: "remark",
			width: 250,
			render: (val) => val || "-",
		},
		{
			title: "创建时间",
			dataIndex: "createTime",
			key: "createTime",
			width: 160,
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
						onClick={() => openModal("update", record.roleId)}
					>
						编辑
					</Button>
					<Popconfirm
						title="确定删除该角色吗？"
						onConfirm={() => handleDelete(record.roleId!)}
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
			<Form
				form={searchForm}
				layout="inline"
				onFinish={handleSearch}
				className="mb-4"
			>
				<Form.Item name="roleName" label="角色名称">
					<Input placeholder="请输入角色名称" allowClear style={{ width: 150 }} />
				</Form.Item>
				<Form.Item>
					<Space>
						<Button type="primary" htmlType="submit">
							搜索
						</Button>
						<Button onClick={handleReset}>重置</Button>
						<Button type="primary" onClick={() => openModal("add")}>
							新增
						</Button>
					</Space>
				</Form.Item>
			</Form>

			<Table
				rowKey="roleId"
				columns={columns}
				dataSource={dataSource}
				loading={loading}
				pagination={pagination}
				onChange={handleTableChange}
				scroll={{ x: 700 }}
			/>

			<SysRoleModal
				open={modalVisible}
				type={modalType}
				editingId={editingId}
				onOk={() => {
					setModalVisible(false);
					fetchDataSource(pagination.current, pagination.pageSize);
				}}
				onCancel={() => setModalVisible(false)}
			/>
		</div>
	);
}
