import { type SysLog, sysLogApi } from "@/service/api/sys/log";
import { Button, Form, Input, Space, Table } from "antd";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import { useCallback, useEffect, useState } from "react";

export default function SysLogPage() {
	const [loading, setLoading] = useState(false);
	const [dataSource, setDataSource] = useState<SysLog[]>([]);
	const [pagination, setPagination] = useState<TablePaginationConfig>({
		current: 1,
		pageSize: 10,
		total: 0,
	});
	const [searchForm] = Form.useForm();

	const fetchDataSource = useCallback(
		async (
			page = 1,
			size = 10,
			username?: string,
			operation?: string,
		) => {
			setLoading(true);
			try {
				const res = await sysLogApi.fetchPage({
					current: page,
					size,
					username,
					operation,
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

	const handleSearch = (values: {
		username?: string;
		operation?: string;
	}) => {
		fetchDataSource(
			1,
			pagination.pageSize,
			values.username,
			values.operation,
		);
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
			values.username,
			values.operation,
		);
	};

	const columns: ColumnsType<SysLog> = [
		{
			title: "用户名",
			dataIndex: "username",
			key: "username",
			width: 100,
		},
		{
			title: "用户操作",
			dataIndex: "operation",
			key: "operation",
			width: 120,
		},
		{
			title: "请求方法",
			dataIndex: "method",
			key: "method",
			width: 250,
			ellipsis: true,
		},
		{
			title: "请求参数",
			dataIndex: "params",
			key: "params",
			width: 300,
			ellipsis: true,
			render: (val) => val || "-",
		},
		{
			title: "耗时(ms)",
			dataIndex: "time",
			key: "time",
			width: 90,
			align: "center",
		},
		{
			title: "IP地址",
			dataIndex: "ip",
			key: "ip",
			width: 130,
		},
		{
			title: "创建时间",
			dataIndex: "createDate",
			key: "createDate",
			width: 160,
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
				<Form.Item name="username" label="用户名">
					<Input placeholder="请输入用户名" allowClear style={{ width: 130 }} />
				</Form.Item>
				<Form.Item name="operation" label="用户操作">
					<Input placeholder="请输入操作" allowClear style={{ width: 130 }} />
				</Form.Item>
				<Form.Item>
					<Space>
						<Button type="primary" htmlType="submit">
							搜索
						</Button>
						<Button onClick={handleReset}>重置</Button>
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
				scroll={{ x: 1200 }}
			/>
		</div>
	);
}
