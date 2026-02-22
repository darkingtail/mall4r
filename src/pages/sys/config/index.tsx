import { type SysConfig, sysConfigApi } from "@/service/api/sys/config";
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
import SysConfigModal, { type SysConfigModalType } from "./SysConfigModal";

export default function SysConfigPage() {
	const [loading, setLoading] = useState(false);
	const [dataSource, setDataSource] = useState<SysConfig[]>([]);
	const [pagination, setPagination] = useState<TablePaginationConfig>({
		current: 1,
		pageSize: 10,
		total: 0,
	});
	const [searchForm] = Form.useForm();
	const [modalVisible, setModalVisible] = useState(false);
	const [modalType, setModalType] = useState<SysConfigModalType>("add");
	const [editingId, setEditingId] = useState<number | null>(null);

	const { message } = App.useApp();

	const fetchDataSource = useCallback(
		async (page = 1, size = 10, paramKey?: string) => {
			setLoading(true);
			try {
				const res = await sysConfigApi.fetchPage({
					current: page,
					size,
					paramKey,
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

	const handleSearch = (values: { paramKey?: string }) => {
		fetchDataSource(1, pagination.pageSize, values.paramKey);
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
			values.paramKey,
		);
	};

	const handleDelete = async (id: number) => {
		try {
			await sysConfigApi.delete([id]);
			message.success("删除成功");
			fetchDataSource(pagination.current, pagination.pageSize);
		} catch (error) {
			console.error(error);
		}
	};

	const openModal = (type: SysConfigModalType, id?: number) => {
		setModalType(type);
		setEditingId(id ?? null);
		setModalVisible(true);
	};

	const columns: ColumnsType<SysConfig> = [
		{
			title: "参数名",
			dataIndex: "paramKey",
			key: "paramKey",
			width: 200,
		},
		{
			title: "参数值",
			dataIndex: "paramValue",
			key: "paramValue",
			width: 300,
			ellipsis: true,
		},
		{
			title: "备注",
			dataIndex: "remark",
			key: "remark",
			width: 250,
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
						onClick={() => openModal("update", record.id)}
					>
						编辑
					</Button>
					<Popconfirm
						title="确定删除该参数吗？"
						onConfirm={() => handleDelete(record.id!)}
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
				<Form.Item name="paramKey" label="参数名">
					<Input placeholder="请输入参数名" allowClear style={{ width: 180 }} />
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
				rowKey="id"
				columns={columns}
				dataSource={dataSource}
				loading={loading}
				pagination={pagination}
				onChange={handleTableChange}
				scroll={{ x: 900 }}
			/>

			<SysConfigModal
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
