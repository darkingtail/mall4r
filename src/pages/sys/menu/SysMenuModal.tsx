import { sysMenuApi } from "@/service/api/sys/menu";
import type { SysMenu } from "@/service/api/sys/menu";
import { App, Form, Input, InputNumber, Modal, Radio, Select } from "antd";
import { useEffect, useState } from "react";

export type SysMenuModalType = "add" | "update";

interface SysMenuModalProps {
	open: boolean;
	type: SysMenuModalType;
	editingId?: number | null;
	onOk: () => void;
	onCancel: () => void;
}

export default function SysMenuModal({
	open,
	type,
	editingId,
	onOk,
	onCancel,
}: SysMenuModalProps) {
	const [form] = Form.useForm();
	const [loading, setLoading] = useState(false);
	const [fetching, setFetching] = useState(false);
	const [menuType, setMenuType] = useState<number>(0);
	const [rootMenus, setRootMenus] = useState<SysMenu[]>([]);
	const [childMenus, setChildMenus] = useState<SysMenu[]>([]);
	const { message } = App.useApp();

	// 加载一级目录
	useEffect(() => {
		if (open) {
			sysMenuApi.listRootMenu().then(setRootMenus).catch(console.error);
		}
	}, [open]);

	// 加载表单数据
	useEffect(() => {
		if (open) {
			if (type === "update" && editingId) {
				setFetching(true);
				sysMenuApi
					.getById(editingId)
					.then((data) => {
						setMenuType(data.type ?? 0);
						// 如果父菜单不是根(0)，需要先找到祖父菜单来加载子菜单列表
						if (data.parentId && data.parentId !== 0) {
							// 先找父菜单属于哪个一级目录
							sysMenuApi
								.fetchTable()
								.then((allMenus) => {
									const parent = allMenus.find(
										(m) => m.menuId === data.parentId,
									);
									if (parent && parent.parentId !== 0) {
										// 按钮：父菜单是二级菜单，需要加载二级菜单列表
										sysMenuApi
											.listChildrenMenu(parent.parentId)
											.then(setChildMenus)
											.catch(console.error);
										form.setFieldsValue({
											...data,
											rootParentId: parent.parentId,
										});
									} else if (parent && parent.parentId === 0) {
										// 菜单：父菜单是一级目录
										form.setFieldsValue({
											...data,
											rootParentId: data.parentId,
											parentId: undefined,
										});
									} else {
										form.setFieldsValue(data);
									}
								})
								.catch(console.error);
						} else {
							form.setFieldsValue(data);
						}
					})
					.catch(console.error)
					.finally(() => setFetching(false));
			} else {
				form.resetFields();
				setMenuType(0);
				setChildMenus([]);
				form.setFieldsValue({ type: 0, orderNum: 0 });
			}
		}
	}, [open, type, editingId, form]);

	const handleRootMenuChange = (rootParentId: number) => {
		form.setFieldValue("parentId", undefined);
		setChildMenus([]);
		sysMenuApi
			.listChildrenMenu(rootParentId)
			.then(setChildMenus)
			.catch(console.error);
	};

	const handleTypeChange = (newType: number) => {
		setMenuType(newType);
		if (newType === 0) {
			form.setFieldsValue({ parentId: 0, rootParentId: undefined });
			setChildMenus([]);
		}
	};

	const handleOk = async () => {
		try {
			const values = await form.validateFields();
			setLoading(true);

			let parentId: number;
			if (values.type === 0) {
				// 目录：parentId = 0
				parentId = 0;
			} else if (values.type === 1) {
				// 菜单：parentId = 选择的一级目录
				parentId = values.rootParentId;
			} else {
				// 按钮：parentId = 选择的二级菜单
				parentId = values.parentId;
			}

			const submitData: SysMenu = {
				name: values.name,
				parentId,
				type: values.type,
				url: values.url,
				perms: values.perms,
				icon: values.icon,
				orderNum: values.orderNum,
			};

			if (type === "add") {
				await sysMenuApi.add(submitData);
				message.success("新增成功");
			} else {
				await sysMenuApi.update({ ...submitData, menuId: editingId! });
				message.success("更新成功");
			}

			onOk();
		} catch (error) {
			console.error(error);
		} finally {
			setLoading(false);
		}
	};

	return (
		<Modal
			title={type === "add" ? "新增菜单" : "编辑菜单"}
			open={open}
			onOk={handleOk}
			onCancel={onCancel}
			confirmLoading={loading}
			destroyOnHidden
			width={600}
		>
			<Form
				form={form}
				layout="horizontal"
				labelCol={{ span: 5 }}
				wrapperCol={{ span: 18 }}
				disabled={fetching}
			>
				<Form.Item
					name="type"
					label="类型"
					rules={[{ required: true, message: "请选择类型" }]}
				>
					<Radio.Group onChange={(e) => handleTypeChange(e.target.value)}>
						<Radio value={0}>目录</Radio>
						<Radio value={1}>菜单</Radio>
						<Radio value={2}>按钮</Radio>
					</Radio.Group>
				</Form.Item>

				{menuType !== 0 && (
					<Form.Item
						name="rootParentId"
						label="上级目录"
						rules={[{ required: true, message: "请选择上级目录" }]}
					>
						<Select
							placeholder="请选择上级目录"
							options={rootMenus.map((m) => ({
								label: m.name,
								value: m.menuId,
							}))}
							onChange={handleRootMenuChange}
						/>
					</Form.Item>
				)}

				{menuType === 2 && (
					<Form.Item
						name="parentId"
						label="上级菜单"
						rules={[{ required: true, message: "请选择上级菜单" }]}
					>
						<Select
							placeholder="请先选择上级目录"
							options={childMenus.map((m) => ({
								label: m.name,
								value: m.menuId,
							}))}
						/>
					</Form.Item>
				)}

				<Form.Item
					name="name"
					label="名称"
					rules={[{ required: true, message: "请输入菜单名称" }]}
				>
					<Input placeholder="请输入菜单名称" maxLength={50} />
				</Form.Item>

				{menuType === 1 && (
					<Form.Item
						name="url"
						label="菜单URL"
						rules={[{ required: true, message: "请输入菜单URL" }]}
					>
						<Input placeholder="请输入菜单URL" maxLength={200} />
					</Form.Item>
				)}

				{menuType !== 0 && (
					<Form.Item name="perms" label="权限标识">
						<Input
							placeholder="多个用逗号分隔，如：sys:user:list,sys:user:save"
							maxLength={500}
						/>
					</Form.Item>
				)}

				{menuType !== 2 && (
					<Form.Item name="icon" label="图标">
						<Input placeholder="请输入图标名称" maxLength={50} />
					</Form.Item>
				)}

				<Form.Item name="orderNum" label="排序">
					<InputNumber min={0} style={{ width: 120 }} />
				</Form.Item>
			</Form>
		</Modal>
	);
}
