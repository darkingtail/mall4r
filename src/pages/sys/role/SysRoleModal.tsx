import { sysRoleApi } from "@/service/api/sys/role";
import { type SysMenu, sysMenuApi } from "@/service/api/sys/menu";
import { App, Form, Input, Modal, Tree } from "antd";
import type { TreeDataNode } from "antd";
import { useEffect, useState } from "react";

export type SysRoleModalType = "add" | "update";

interface SysRoleModalProps {
	open: boolean;
	type: SysRoleModalType;
	editingId?: number | null;
	onOk: () => void;
	onCancel: () => void;
}

function buildTreeData(menus: SysMenu[]): TreeDataNode[] {
	return menus.map((menu) => ({
		key: menu.menuId,
		title: menu.name,
		children: menu.list?.length ? buildTreeData(menu.list) : undefined,
	}));
}

function collectAllKeys(menus: SysMenu[]): number[] {
	const keys: number[] = [];
	for (const menu of menus) {
		keys.push(menu.menuId);
		if (menu.list?.length) {
			keys.push(...collectAllKeys(menu.list));
		}
	}
	return keys;
}

// 收集所有叶子节点的 key
function collectLeafKeys(treeData: TreeDataNode[]): Set<number> {
	const leafKeys = new Set<number>();
	const traverse = (nodes: TreeDataNode[]) => {
		for (const node of nodes) {
			if (!node.children?.length) {
				leafKeys.add(node.key as number);
			} else {
				traverse(node.children);
			}
		}
	};
	traverse(treeData);
	return leafKeys;
}

export default function SysRoleModal({
	open,
	type,
	editingId,
	onOk,
	onCancel,
}: SysRoleModalProps) {
	const [form] = Form.useForm();
	const [loading, setLoading] = useState(false);
	const [fetching, setFetching] = useState(false);
	const [treeData, setTreeData] = useState<TreeDataNode[]>([]);
	const [checkedKeys, setCheckedKeys] = useState<number[]>([]);
	const [expandedKeys, setExpandedKeys] = useState<number[]>([]);
	const { message } = App.useApp();

	// 加载菜单树
	useEffect(() => {
		if (open) {
			sysMenuApi
				.listMenuTree()
				.then((menus) => {
					const tree = buildTreeData(menus);
					setTreeData(tree);
					setExpandedKeys(collectAllKeys(menus));
				})
				.catch(console.error);
		}
	}, [open]);

	// 加载表单数据
	useEffect(() => {
		if (open) {
			if (type === "update" && editingId) {
				setFetching(true);
				sysRoleApi
					.getById(editingId)
					.then((data) => {
						form.setFieldsValue(data);
						// 后端返回所有选中的 menuId（包含父节点）
						// Tree 组件的 checkedKeys 只需设置叶子节点，父节点会自动计算
						if (data.menuIdList) {
							const leafKeys = collectLeafKeys(treeData);
							const leafChecked = data.menuIdList.filter((id) =>
								leafKeys.has(id),
							);
							setCheckedKeys(
								leafKeys.size > 0 ? leafChecked : data.menuIdList,
							);
						} else {
							setCheckedKeys([]);
						}
					})
					.catch(console.error)
					.finally(() => setFetching(false));
			} else {
				form.resetFields();
				setCheckedKeys([]);
			}
		}
	}, [open, type, editingId, form, treeData]);

	const handleOk = async () => {
		try {
			const values = await form.validateFields();
			setLoading(true);

			// 收集 checkedKeys + halfCheckedKeys 作为完整的 menuIdList
			const menuIdList = [...checkedKeys];

			if (type === "add") {
				await sysRoleApi.add({ ...values, menuIdList });
				message.success("新增成功");
			} else {
				await sysRoleApi.update({
					...values,
					roleId: editingId,
					menuIdList,
				});
				message.success("更新成功");
			}

			onOk();
		} catch (error) {
			console.error(error);
		} finally {
			setLoading(false);
		}
	};

	const handleCheck = (
		checked: number[] | { checked: number[]; halfChecked: number[] },
	) => {
		if (Array.isArray(checked)) {
			setCheckedKeys(checked);
		} else {
			// 包含半选节点，一起提交给后端
			setCheckedKeys([...checked.checked, ...checked.halfChecked]);
		}
	};

	return (
		<Modal
			title={type === "add" ? "新增角色" : "编辑角色"}
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
					name="roleName"
					label="角色名称"
					rules={[{ required: true, message: "请输入角色名称" }]}
				>
					<Input placeholder="请输入角色名称" maxLength={100} />
				</Form.Item>

				<Form.Item name="remark" label="备注">
					<Input.TextArea rows={2} placeholder="请输入备注" maxLength={100} />
				</Form.Item>

				<Form.Item label="菜单权限">
					<div
						style={{
							maxHeight: 300,
							overflow: "auto",
							border: "1px solid #d9d9d9",
							borderRadius: 6,
							padding: 8,
						}}
					>
						<Tree
							checkable
							checkStrictly
							treeData={treeData}
							checkedKeys={checkedKeys}
							expandedKeys={expandedKeys}
							onExpand={(keys) => setExpandedKeys(keys as number[])}
							onCheck={handleCheck}
						/>
					</div>
				</Form.Item>
			</Form>
		</Modal>
	);
}
