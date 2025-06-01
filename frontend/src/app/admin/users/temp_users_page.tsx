"use client";

import { useState, useEffect, useCallback } from "react";
import "../shared/dark-table.css";
import { Table, Button, Input, Modal, Form, message, Popconfirm, Upload, UploadProps, Tag, Tooltip, Select } from "antd";
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
  IdcardOutlined,
  CloseOutlined
} from "@ant-design/icons";
import { getClientesPaginados, createCliente, updateCliente, deleteCliente, getRoles, getClienteById } from "@/lib/api/usuarioService";

interface Customer {
  id: string;
  nombre_completo: string;
  email: string;
  telefono?: string;
  dni?: string;
  direccion?: string;
  foto_perfil?: string;
  activo: boolean;
  roles?: { id: string; nombre: string }[];
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
  const [availableRoles, setAvailableRoles] = useState<{ id: string; nombre: string }[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<{ id: string; nombre: string }[]>([]);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  const [form] = Form.useForm();

  const fetchBranches = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getClientesPaginados(page, pageSize, searchText);
      if (response.data) {
        setCustomers((response.data?.items || []).map((user: any) => ({
          id: user.id,
          nombre_completo: user.nombre_completo,
          email: user.email,
          telefono: user.telefono,
          dni: user.dni,
          direccion: user.direccion,
          foto_perfil: user.foto_perfil,
          activo: user.activo,
          roles: user.roles || []
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
  
  // Cargar roles disponibles
  const fetchRoles = async () => {
    try {
      const response = await getRoles();
      if (response.ok && response.data) {
        setAvailableRoles(response.data);
      }
    } catch (error) {
      console.error("Error al cargar roles:", error);
      message.error("No se pudieron cargar los roles disponibles");
    }
  };

  useEffect(() => {
    fetchBranches();
    fetchRoles();
  }, [fetchBranches]);

  const handleDelete = async (id: string) => {
    try {
      setLoading(true);
      await deleteCliente(id);
      message.success("Usuario eliminado correctamente");
      fetchBranches();
    } catch (error) {
      console.error("Error al eliminar usuario:", error);
      message.error("Error al eliminar usuario");
    } finally {
      setLoading(false);
    }
  };
  
  // Manejar la adición de un rol
  const handleAddRole = () => {
    if (!selectedRole) return;
    
    // Verificar si el rol ya está seleccionado
    const roleExists = selectedRoles.some((role) => role.id === selectedRole);
    if (roleExists) {
      message.warning("Este rol ya ha sido asignado");
      return;
    }
    
    // Buscar el rol seleccionado en los disponibles
    const roleToAdd = availableRoles.find((role) => role.id === selectedRole);
    if (roleToAdd) {
      setSelectedRoles([...selectedRoles, roleToAdd]);
      setSelectedRole(null);
    }
  };
  
  // Manejar la eliminación de un rol
  const handleRemoveRole = (roleId: string) => {
    setSelectedRoles(selectedRoles.filter((role) => role.id !== roleId));
  };
  
  const openModal = async (customer?: Customer) => {
    setEditingCustomer(customer || null);
    setSelectedRoles([]);
    
    if (customer) {
      // Para editar, cargamos el usuario completo para obtener sus roles
      try {
        setLoading(true);
        const response = await getClienteById(customer.id);
        if (response.ok && response.data) {
          const userDetail = response.data;
          form.setFieldsValue({
            nombre_completo: userDetail.nombre_completo,
            email: userDetail.email,
            telefono: userDetail.telefono,
            dni: userDetail.dni,
            direccion: userDetail.direccion,
            foto_perfil: userDetail.foto_perfil,
          });
          
          // Cargar roles del usuario si existen
          if (userDetail.roles && Array.isArray(userDetail.roles)) {
            setSelectedRoles(userDetail.roles);
          }
        }
      } catch (error) {
        console.error("Error al cargar los detalles del usuario:", error);
        message.error("Error al cargar detalles del usuario");
      } finally {
        setLoading(false);
      }
    } else {
      // Para crear nuevo usuario
      form.resetFields();
    }
    
    setModalVisible(true);
  };

  const handleCancel = () => {
    setModalVisible(false);
    setEditingCustomer(null);
    setSelectedRoles([]);
    form.resetFields();
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      
      // Preparar datos de usuario incluyendo roles y estableciendo siempre activo=true
      const userData = {
        ...values,
        roles: selectedRoles.map(role => role.id),
        activo: true // Asegurar que siempre se crea como activo
      };
      
      if (editingCustomer) {
        await updateCliente(editingCustomer.id, userData);
        message.success("Usuario actualizado correctamente");
      } else {
        // Si es un nuevo usuario, incluimos password basado en DNI o uno por defecto
        await createCliente({
          ...userData, 
          password: values.dni || "12345678"
        });
        message.success("Usuario creado correctamente");
      }
      
      setModalVisible(false);
      setEditingCustomer(null);
      setSelectedRoles([]);
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
      title: "Roles",
      dataIndex: "roles",
      key: "roles",
      render: (roles: { id: string; nombre: string }[]) => (
        <div className="flex flex-wrap gap-1">
          {Array.isArray(roles) && roles.length > 0 ? (
            roles.map(role => (
              <Tag key={role.id} color="blue">{role.nombre}</Tag>
            ))
          ) : (
            <span className="text-gray-400">--</span>
          )}
        </div>
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
        destroyOnClose
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
      >
        <Form
          form={form}
          layout="vertical"
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
          </div>
          
          <Form.Item
            name="direccion"
            label="Dirección"
            rules={[{ max: 255, message: "Máximo 255 caracteres" }]}
          >
            <Input prefix={<HomeOutlined />} placeholder="Ej: Av. de los Shyris N24-120" />
          </Form.Item>
          
          <Form.Item
            name="foto_perfil"
            label="Foto de perfil"
          >
            <Upload {...uploadProps}>
              <Button icon={<UploadOutlined />}>Subir Foto</Button>
            </Upload>
          </Form.Item>
          
          {/* Sección de asignación de roles */}
          <div className="mt-4 mb-2">
            <label className="block mb-2 font-medium">Roles asignados</label>
            <div className="flex flex-wrap gap-2 mb-4">
              {selectedRoles.length === 0 ? (
                <div className="text-gray-500 italic">No hay roles asignados</div>
              ) : (
                selectedRoles.map(role => (
                  <Tag 
                    key={role.id} 
                    closable 
                    onClose={() => handleRemoveRole(role.id)}
                    className="bg-gray-200 text-gray-800 rounded-md py-1"
                  >
                    {role.nombre}
                  </Tag>
                ))
              )}
            </div>
            
            <div className="flex gap-2">
              <Select
                style={{ width: '100%' }}
                placeholder="Seleccionar rol"
                value={selectedRole}
                onChange={setSelectedRole}
                options={availableRoles.map(role => ({ value: role.id, label: role.nombre }))}
              />
              <Button 
                type="primary" 
                icon={<PlusOutlined />} 
                onClick={handleAddRole}
                disabled={!selectedRole}
              >
                Agregar
              </Button>
            </div>
          </div>
        </Form>
      </Modal>
    </div>
  );
}