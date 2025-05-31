"use client";

import { useState, useEffect, useCallback } from "react";
import "../shared/dark-table.css";
import { Table, Button, Input, Modal, Form, message, Popconfirm, Checkbox, Upload, UploadProps, Tag, Tooltip } from "antd";
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  ExclamationCircleOutlined, 
  SearchOutlined,
  UploadOutlined,
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  HomeOutlined,
  IdcardOutlined
} from "@ant-design/icons";
import { getClientesPaginados, createCliente, updateCliente, deleteCliente } from "@/lib/api/usuarioService";

interface Customer {
  id: string;
  nombre_completo: string;
  email: string;
  telefono?: string;
  dni?: string;
  direccion?: string;
  foto_perfil?: string;
  activo: boolean;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [searchText, setSearchText] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  const [form] = Form.useForm();

  // Eliminar usuario (soft delete)
  const handleDelete = async (id: string) => {
    setLoading(true);
    try {
      await deleteCliente(id);
      message.success("Usuario eliminado correctamente");
      fetchBranches();
    } catch (error) {
      message.error("Error al eliminar el usuario");
    } finally {
      setLoading(false);
    }
  };

  const fetchBranches = useCallback(async () => {
      setLoading(true);
      try {
        const response = await getClientesPaginados(page, pageSize, searchText);
        if (response.data) {
          setCustomers((response.data?.items || []).map((user) => ({
            id: user.id,
            nombre_completo: user.nombre_completo,
            email: user.email,
            telefono: user.telefono,
            dni: user.dni,
            direccion: user.direccion,
            foto_perfil: user.foto_perfil,
            activo: user.activo,
          })));
          setTotal(response.data?.total || 0);
        }
      } catch (error) {
        console.error("Error al cargar usuarios:", error);
        message.error("Error al cargar los usuarios");
      } finally {
        setLoading(false);
      }
    }, [page, pageSize, searchText]);

  useEffect(() => {
    fetchBranches();
  }, [page, pageSize, searchText, fetchBranches]);

  // Esta función ya no es necesaria ya que la búsqueda se maneja directamente en el input

  const openModal = (customer?: Customer) => {
    setEditingCustomer(customer || null);
    if (customer) {
      form.setFieldsValue({
        ...customer,
        nombre_completo: customer.nombre_completo,
        email: customer.email,
        telefono: customer.telefono,
        dni: customer.dni,
        direccion: customer.direccion,
        foto_perfil: customer.foto_perfil,
        activo: customer.activo,
      });
    } else {
      form.resetFields();
      form.setFieldsValue({ active: true });
    }
    setModalVisible(true);
  };

  const handleCancel = () => {
    setModalVisible(false);
    setEditingCustomer(null);
    form.resetFields();
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      if (editingCustomer) {
        await updateCliente(editingCustomer.id, values);
        message.success("Usuario actualizado correctamente");
      } else {
        await createCliente({ ...values, role: "cliente" });
        message.success("Usuario creado correctamente");
      }
      setModalVisible(false);
      setEditingCustomer(null);
      form.resetFields();
      fetchBranches();
    } catch (error: any) {
      message.error(error?.message || "Error al guardar usuario");
    }
    setLoading(false);
  };

  const columns = [
  {
    title: "Nombre",
    dataIndex: "nombre_completo",
    key: "nombre_completo",
    sorter: (a: Customer, b: Customer) => a.nombre_completo.localeCompare(b.nombre_completo),
    render: (nombre: string) => (
      <div className="flex items-center gap-2">
        <UserOutlined className="text-indigo-400" />
        <span>{nombre}</span>
      </div>
    ),
  },
  {
    title: "Email",
    dataIndex: "email",
    key: "email",
    render: (email: string) => (
      <Tooltip title={email}>
        <div className="flex items-center gap-2">
          <MailOutlined className="text-blue-400" />
          <span>{email}</span>
        </div>
      </Tooltip>
    ),
  },
  {
    title: "Teléfono",
    dataIndex: "telefono",
    key: "telefono",
    render: (telefono: string) => (
      <div className="flex items-center gap-2">
        <PhoneOutlined className="text-green-400" />
        <span>{telefono || "--"}</span>
      </div>
    ),
  },
  {
    title: "Dirección",
    dataIndex: "direccion",
    key: "direccion",
    ellipsis: true,
    render: (direccion: string) => (
      <Tooltip title={direccion}>
        <div className="flex items-center gap-2">
          <HomeOutlined className="text-amber-400" />
          <span>{direccion || "--"}</span>
        </div>
      </Tooltip>
    ),
  },
  {
    title: "Estado",
    dataIndex: "activo",
    key: "activo",
    render: (activo: boolean) => (
      activo ? <Tag color="green">Activo</Tag> : <Tag color="red">Inactivo</Tag>
    ),
    filters: [
      { text: "Activo", value: true },
      { text: "Inactivo", value: false },
    ],
    onFilter: (value: any, record: Customer) => record.activo === value,
  },
  {
    title: "Acciones",
    key: "actions",
    render: (_: any, record: Customer) => (
      <div className="flex gap-2">
        <Tooltip title="Editar">
          <Button icon={<EditOutlined />} type="primary" size="small" ghost onClick={() => openModal(record)} />
        </Tooltip>
        <Popconfirm
          title="¿Estás seguro de eliminar este usuario?"
          onConfirm={() => handleDelete(record.id)}
          okText="Sí"
          cancelText="No"
          icon={<ExclamationCircleOutlined style={{ color: 'red' }} />}
        >
          <Tooltip title="Eliminar">
            <Button icon={<DeleteOutlined />} type="primary" size="small" danger ghost />
          </Tooltip>
        </Popconfirm>
      </div>
    ),
  },
];

  const uploadProps: UploadProps = {
    beforeUpload: (file) => {
      const isImage = file.type.startsWith("image/");
      if (!isImage) {
        message.error("Solo se permiten imágenes");
      }
      return isImage || Upload.LIST_IGNORE;
    },
    maxCount: 1,
    // TODO: Integrar subida real y guardar la URL de la foto en el backend
    customRequest: async ({ file, onSuccess }) => {
      setTimeout(() => {
        onSuccess && onSuccess("ok");
      }, 1000);
    },
    showUploadList: false,
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Gestión de Usuarios</h1>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={() => openModal()} 
          className="bg-indigo-600 hover:bg-indigo-700"
        >
          Nuevo Usuario
        </Button>
      </div>
      
      <div className="flex items-center justify-between mb-4">
        <Input
          prefix={<SearchOutlined style={{ color: '#aaa' }} />}
          placeholder="Buscar usuario"
          value={searchText}
          onChange={(e) => {
            setSearchText(e.target.value);
            setPage(1); // Reiniciar paginación al buscar
          }}
          allowClear
          style={{ 
            width: 250, 
            background: '#23263a', 
            color: '#fff', 
            border: '1px solid #444',
            fontWeight: 500
          }}
        />
      </div>
      
      <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6">
        <Table
          className="custom-dark-table"
          dataSource={customers}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{
            current: page,
            pageSize: pageSize,
            total: total,
            onChange: (page: number, pageSize: number | undefined) => {
              setPage(page);
              if (pageSize) setPageSize(pageSize);
            },
            showSizeChanger: true,
            showTotal: (total: number, range: number[]) => `${range[0]}-${range[1]} de ${total} usuarios`,
          }}
        />
      </div>

      <Modal
        title={editingCustomer ? "Editar Usuario" : "Nuevo Usuario"}
        open={modalVisible}
        onCancel={handleCancel}
        destroyOnHidden
        width={700}
        className="dark-modal"
        footer={[
          <Button key="cancel" onClick={handleCancel}>
            Cancelar
          </Button>,
          <Button key="submit" type="primary" onClick={handleSubmit} loading={loading}>
            {editingCustomer ? "Actualizar" : "Crear"}
          </Button>,
        ]}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{ activo: true }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              name="nombre_completo"
              label="Nombre completo"
              rules={[
                { required: true, message: "Campo obligatorio" },
                { min: 3, message: "Debe tener al menos 3 caracteres" },
                { max: 255, message: "Máximo 255 caracteres" },
              ]}
            >
              <Input prefix={<UserOutlined />} placeholder="Ej: Juan Pérez" />
            </Form.Item>
            <Form.Item
              name="email"
              label="Correo electrónico"
              rules={[
                { required: true, message: "Campo obligatorio" },
                { type: "email", message: "Correo inválido" },
              ]}
            >
              <Input prefix={<MailOutlined />} placeholder="Ej: cliente@email.com" disabled={!!editingCustomer} />
            </Form.Item>
            <Form.Item
              name="telefono"
              label="Teléfono"
              rules={[
                { pattern: /^\d{10}$/, message: "Debe tener 10 dígitos numéricos" },
              ]}
            >
              <Input prefix={<PhoneOutlined />} placeholder="Ej: 0987654321" maxLength={10} />
            </Form.Item>
            <Form.Item
              name="dni"
              label="Cédula / RUC"
              rules={[
                { pattern: /^\d{10}$/, message: "Debe tener 10 dígitos numéricos" },
              ]}
            >
              <Input prefix={<IdcardOutlined />} placeholder="Ej: 1712345678" maxLength={10} />
            </Form.Item>
            <Form.Item
              name="direccion"
              label="Dirección"
              rules={[{ max: 255, message: "Máximo 255 caracteres" }]}
            >
              <Input prefix={<HomeOutlined />} placeholder="Ej: Av. de los Shyris N24-120" />
            </Form.Item>
            <Form.Item
              name="activo"
              label="Activo"
              valuePropName="checked"
            >
              <Checkbox>Usuario activo</Checkbox>
            </Form.Item>
            <Form.Item
              name="foto_perfil"
              label="Foto de perfil"
            >
              <Upload {...uploadProps}>
                <Button icon={<UploadOutlined />}>Subir Foto</Button>
              </Upload>
            </Form.Item>
          </div>
        </Form>
      </Modal>
    </div>
  );
};


