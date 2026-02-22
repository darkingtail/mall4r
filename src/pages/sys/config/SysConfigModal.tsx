import { sysConfigApi } from "@/service/api/sys/config";
import { App, Form, Input, Modal } from "antd";
import { useEffect, useState } from "react";

export type SysConfigModalType = "add" | "update";

interface SysConfigModalProps {
	open: boolean;
	type: SysConfigModalType;
	editingId?: number | null;
	onOk: () => void;
	onCancel: () => void;
}

export default function SysConfigModal({
	open,
	type,
	editingId,
	onOk,
	onCancel,
}: SysConfigModalProps) {
	const [form] = Form.useForm();
	const [loading, setLoading] = useState(false);
	const [fetching, setFetching] = useState(false);
	const { message } = App.useApp();

	useEffect(() => {
		if (open) {
			if (type === "update" && editingId) {
				setFetching(true);
				sysConfigApi
					.getById(editingId)
					.then((data) => {
						form.setFieldsValue(data);
					})
					.catch(console.error)
					.finally(() => setFetching(false));
			} else {
				form.resetFields();
			}
		}
	}, [open, type, editingId, form]);

	const handleOk = async () => {
		try {
			const values = await form.validateFields();
			setLoading(true);

			if (type === "add") {
				await sysConfigApi.add(values);
				message.success("新增成功");
			} else {
				await sysConfigApi.update({ ...values, id: editingId });
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
			title={type === "add" ? "新增参数" : "编辑参数"}
			open={open}
			onOk={handleOk}
			onCancel={onCancel}
			confirmLoading={loading}
			destroyOnHidden
			width={550}
		>
			<Form
				form={form}
				layout="horizontal"
				labelCol={{ span: 5 }}
				wrapperCol={{ span: 18 }}
				disabled={fetching}
			>
				<Form.Item
					name="paramKey"
					label="参数名"
					rules={[{ required: true, message: "请输入参数名" }]}
				>
					<Input placeholder="请输入参数名" maxLength={50} />
				</Form.Item>

				<Form.Item
					name="paramValue"
					label="参数值"
					rules={[{ required: true, message: "请输入参数值" }]}
				>
					<Input.TextArea
						rows={3}
						placeholder="请输入参数值"
						maxLength={2000}
					/>
				</Form.Item>

				<Form.Item name="remark" label="备注">
					<Input.TextArea rows={2} placeholder="请输入备注" maxLength={500} />
				</Form.Item>
			</Form>
		</Modal>
	);
}
