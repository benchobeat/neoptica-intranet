"use client";

import { useState, useEffect, useCallback, memo, useMemo } from "react";
// Importaciones optimizadas de Ant Design para reducir el tamaño del bundle
import Table from "antd/lib/table";
import Button from "antd/lib/button";
import Input from "antd/lib/input";
import Modal from "antd/lib/modal";
import Form from "antd/lib/form";
import message from "antd/lib/message";
import Popconfirm from "antd/lib/popconfirm";
import Upload from "antd/lib/upload";
import type { UploadProps } from "antd";
import Tag from "antd/lib/tag";
import Tooltip from "antd/lib/tooltip";
import Select from "antd/lib/select";
// Importaciones optimizadas de iconos
import PlusOutlined from "@ant-design/icons/PlusOutlined";
import EditOutlined from "@ant-design/icons/EditOutlined";
import DeleteOutlined from "@ant-design/icons/DeleteOutlined";
import ExclamationCircleOutlined from "@ant-design/icons/ExclamationCircleOutlined";
import SearchOutlined from "@ant-design/icons/SearchOutlined";
import UploadOutlined from "@ant-design/icons/UploadOutlined";
import UserOutlined from "@ant-design/icons/UserOutlined";
import PhoneOutlined from "@ant-design/icons/PhoneOutlined";
import MailOutlined from "@ant-design/icons/MailOutlined";
import HomeOutlined from "@ant-design/icons/HomeOutlined";
import IdcardOutlined from "@ant-design/icons/IdcardOutlined";
import { getClientesPaginados, createCliente, updateCliente, deleteCliente, getRoles, getClienteById } from "@/lib/api/usuarioService";

// Interfaz para datos de cliente/usuario
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

// Componentes memoizados para mejorar rendimiento
const MemoizedTag = memo(Tag);
MemoizedTag.displayName = "MemoizedTag";

const MemoizedTooltip = memo(Tooltip);
MemoizedTooltip.displayName = "MemoizedTooltip";

// Componentes de celdas memoizados
const UserNameCell = memo(({ nombre }: { nombre: string }) => (
  <div className="flex items-center gap-2">
    <UserOutlined className="text-indigo-400" />
    <span>{nombre}</span>
  </div>
));
UserNameCell.displayName = "UserNameCell";

const EmailCell = memo(({ email }: { email: string }) => (
  <MemoizedTooltip title={email}>
    <div className="flex items-center gap-2">
      <MailOutlined className="text-blue-400" />
      <span>{email}</span>
    </div>
  </MemoizedTooltip>
));
EmailCell.displayName = "EmailCell";

const PhoneCell = memo(({ telefono }: { telefono?: string }) => (
  <div className="flex items-center gap-2">
    <PhoneOutlined className="text-green-400" />
    <span>{telefono || "--"}</span>
  </div>
));
PhoneCell.displayName = "PhoneCell";

const AddressCell = memo(({ direccion }: { direccion?: string }) => (
  <MemoizedTooltip title={direccion}>
    <div className="flex items-center gap-2">
      <HomeOutlined className="text-amber-400" />
      <span>{direccion || "--"}</span>
    </div>
  </MemoizedTooltip>
));
AddressCell.displayName = "AddressCell";

const RolesCell = memo(({ roles }: { roles?: { id: string; nombre: string }[] }) => (
  <div className="flex flex-wrap gap-1">
    {Array.isArray(roles) && roles.length > 0 ? (
      roles.map(role => (
        <MemoizedTag key={role.id} color="blue">{role.nombre}</MemoizedTag>
      ))
    ) : (
      <MemoizedTag color="default">Sin rol</MemoizedTag>
    )}
  </div>
));
RolesCell.displayName = "RolesCell";

const StatusCell = memo(({ activo }: { activo: boolean }) => (
  activo ? <MemoizedTag color="green">Activo</MemoizedTag> : <MemoizedTag color="red">Inactivo</MemoizedTag>
));
StatusCell.displayName = "StatusCell";

const ActionCell = memo(({ record, onEdit, onDelete }: { 
  record: Customer, 
  onEdit: (record: Customer) => void, 
  onDelete: (id: string) => void 
}) => (
  <div className="flex gap-2">
    <MemoizedTooltip title="Editar">
      <Button icon={<EditOutlined />} type="primary" size="small" ghost onClick={() => onEdit(record)} />
    </MemoizedTooltip>
    <Popconfirm
      title="¿Estás seguro de eliminar este usuario?"
      onConfirm={() => onDelete(record.id)}
      okText="Sí"
      cancelText="No"
      icon={<ExclamationCircleOutlined style={{ color: 'red' }} />}
    >
      <MemoizedTooltip title="Eliminar">
        <Button icon={<DeleteOutlined />} type="primary" size="small" danger ghost />
      </MemoizedTooltip>
    </Popconfirm>
  </div>
));
ActionCell.displayName = "ActionCell";

// Componente de tabla memoizado para evitar re-renders innecesarios
const UserTable = memo(({ customers, loading, columns, pagination }: any) => (
  <Table
    className="custom-table"
    dataSource={customers}
    columns={columns}
    rowKey="id"
    loading={loading}
    pagination={pagination}
  />
));
UserTable.displayName = "UserTable";

const CustomersPage = () => {
  // Estados
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [availableRoles, setAvailableRoles] = useState<{ id: string; nombre: string }[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<{ id: string; nombre: string }[]>([]);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  const [form] = Form.useForm();

  // Obtener lista de clientes (memoizado)
  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getClientesPaginados(page, pageSize, searchText);
      if (response.data) {
        // Determinar la estructura de la respuesta y procesarla adecuadamente
        let usuarios = [];
        let totalItems = 0;
        
        // Usar aserciones de tipo para evitar errores de TypeScript
        if (Array.isArray(response.data)) {
          // Si es un array directo de usuarios
          usuarios = response.data;
          totalItems = response.data.length;
        } else if (typeof response.data === 'object' && response.data !== null) {
          // Si es un objeto paginado con propiedades items y total
          const responseObj = response.data as any; // Aserción de tipo para evitar errores
          
          if (Array.isArray(responseObj.items)) {
            usuarios = responseObj.items;
          }
          
          totalItems = typeof responseObj.total === 'number' ? responseObj.total : usuarios.length;
        }
        
        // Transformar usuarios a formato Customer
        setCustomers(usuarios.map((user: any) => ({
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
        
        // Establecer el total de registros
        setTotal(totalItems);
      }
    } catch (error) {
      console.error("Error al cargar usuarios:", error);
      message.error("Error al cargar los usuarios");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, searchText]);
  
  // Cargar roles (memoizado)
  const fetchRoles = useCallback(async () => {
    try {
      const response = await getRoles();
      if (response.ok && response.data) {
        setAvailableRoles(response.data);
      }
    } catch (error) {
      console.error("Error al cargar roles:", error);
      message.error("Error al cargar roles disponibles");
    }
  }, []);

  // Aplicar debounce para búsquedas
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCustomers();
    }, 300);
    
    return () => clearTimeout(timer);
  }, [fetchCustomers]);
  
  // Cargar roles al iniciar
  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  // Eliminar cliente
  const handleDelete = useCallback(async (id: string) => {
    try {
      setLoading(true);
      await deleteCliente(id);
      message.success("Usuario eliminado correctamente");
      fetchCustomers();
    } catch (error) {
      console.error("Error al eliminar usuario:", error);
      message.error("Error al eliminar usuario");
    } finally {
      setLoading(false);
    }
  }, [fetchCustomers]);
  
  // Añadir rol
  const handleAddRole = useCallback(() => {
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
      setSelectedRoles((prev) => [...prev, roleToAdd]);
      setSelectedRole(null);
    }
  }, [selectedRole, selectedRoles, availableRoles]);
  
  // Eliminar rol
  const handleRemoveRole = useCallback((roleId: string) => {
    setSelectedRoles((prev) => prev.filter((role) => role.id !== roleId));
  }, []);
  
  // Abrir modal (crear/editar)
  const openModal = useCallback(async (customer?: Customer) => {
    setEditingCustomer(customer || null);
    setSelectedRoles([]);
    
    if (customer) {
      try {
        setLoading(true);
        const response = await getClienteById(customer.id);
        // Asegurar que la respuesta tiene el formato esperado
        const responseData = response as any; // Usar aserción de tipo para evitar errores
        if (responseData && responseData.data) {
          const userDetail = responseData.data;
          
          form.setFieldsValue({
            nombre_completo: userDetail.nombre_completo,
            email: userDetail.email,
            telefono: userDetail.telefono,
            dni: userDetail.dni,
            direccion: userDetail.direccion,
            foto_perfil: userDetail.foto_perfil,
          });
          
          // Cargar roles del usuario
          if (userDetail.roles && Array.isArray(userDetail.roles)) {
            setSelectedRoles(userDetail.roles);
          } else if (userDetail.rol) {
            const adminRole = availableRoles.find(r => r.nombre.toLowerCase() === 'admin' || r.nombre.toLowerCase() === 'administrador');
            if (adminRole) {
              setSelectedRoles([adminRole]);
            }
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
  }, [availableRoles, form]);

  // Cerrar modal
  const handleCancel = useCallback(() => {
    setModalVisible(false);
    setEditingCustomer(null);
    setSelectedRoles([]);
    form.resetFields();
  }, [form]);

  // Guardar usuario (crear/editar)
  const handleSubmit = useCallback(async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      
      // Preparar datos de usuario
      const userData = {
        ...values,
        roles: selectedRoles.map(role => role.id),
        activo: true
      };
      
      if (editingCustomer) {
        await updateCliente(editingCustomer.id, userData);
        message.success("Usuario actualizado correctamente");
      } else {
        // Para nuevos usuarios
        const createResponse = await createCliente({
          ...userData, 
          password: values.dni || "12345678"
        });
        
        // Usar aserción de tipo para evitar errores
        const responseData = createResponse as any;
        if (responseData && responseData.ok) {
          message.success("Usuario creado correctamente");
        } else {
          message.error(responseData?.error || "No se pudo crear el usuario");
          setLoading(false);
          return;
        }
      }
      
      setModalVisible(false);
      setEditingCustomer(null);
      setSelectedRoles([]);
      form.resetFields();
      fetchCustomers();
    } catch (error: any) {
      message.error(error?.message || "Error al guardar usuario");
    } finally {
      setLoading(false);
    }
  }, [editingCustomer, fetchCustomers, form, selectedRoles]);

  // Definición de columnas (memoizada)
  const columns = useMemo(() => [
    {
      title: "Nombre",
      dataIndex: "nombre_completo",
      key: "nombre_completo",
      sorter: (a: Customer, b: Customer) => a.nombre_completo.localeCompare(b.nombre_completo),
      render: (nombre: string) => <UserNameCell nombre={nombre} />,
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      render: (email: string) => <EmailCell email={email} />,
    },
    {
      title: "Teléfono",
      dataIndex: "telefono",
      key: "telefono",
      render: (telefono: string) => <PhoneCell telefono={telefono} />,
    },
    {
      title: "Dirección",
      dataIndex: "direccion",
      key: "direccion",
      ellipsis: true,
      render: (direccion: string) => <AddressCell direccion={direccion} />,
    },
    {
      title: "Roles",
      dataIndex: "roles",
      key: "roles",
      render: (roles: { id: string; nombre: string }[]) => <RolesCell roles={roles} />,
    },
    {
      title: "Estado",
      dataIndex: "activo",
      key: "activo",
      render: (activo: boolean) => <StatusCell activo={activo} />,
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
        <ActionCell record={record} onEdit={openModal} onDelete={handleDelete} />
      ),
    },
  ], [handleDelete, openModal]);

  // Propiedades para el componente Upload
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

  // Propiedades para la paginación (memoizado)
  const paginationConfig = useMemo(() => ({
    current: page,
    pageSize: pageSize,
    total: total,
    onChange: (newPage: number, newPageSize?: number) => {
      setPage(newPage);
      if (newPageSize) setPageSize(newPageSize);
    },
    showSizeChanger: true,
    showTotal: (total: number, range: number[]) => `${range[0]}-${range[1]} de ${total} usuarios`,
  }), [page, pageSize, total]);

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
          onChange={(e) => setSearchText(e.target.value)}
          allowClear
          style={{ 
            width: 250, 
            background: '#1f2937', 
            color: '#fff',
            border: '1px solid #374151',
            fontWeight: 500
          }}
        />
      </div>
      
      <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6">
        <UserTable 
          customers={customers}
          columns={columns}
          loading={loading}
          pagination={paginationConfig}
        />
      </div>

      <Modal
        title={editingCustomer ? "Editar Usuario" : "Nuevo Usuario"}
        open={modalVisible}
        onCancel={handleCancel}
        destroyOnClose
        width={700}
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
              label={<span className="font-medium">Nombre completo</span>}
              rules={[
                { required: true, message: "Campo obligatorio" },
                { min: 3, message: "Debe tener al menos 3 caracteres" },
                { max: 255, message: "Máximo 255 caracteres" },
              ]}
            >
              <Input 
                prefix={<UserOutlined />} 
                placeholder="Ej: Juan Pérez" 
                style={{ width: '100%' }}
              />
            </Form.Item>
            
            <Form.Item
              name="email"
              label={<span className="font-medium">Correo electrónico</span>}
              rules={[
                { required: true, message: "Campo obligatorio" },
                { type: "email", message: "Correo inválido" },
              ]}
            >
              <Input 
                prefix={<MailOutlined />} 
                placeholder="Ej: cliente@email.com" 
                disabled={!!editingCustomer}
                style={{ width: '100%' }}
              />
            </Form.Item>
            
            <Form.Item
              name="telefono"
              label={<span className="font-medium">Teléfono</span>}
              rules={[
                { pattern: /^\d{10}$/, message: "Debe tener 10 dígitos numéricos" },
              ]}
            >
              <Input 
                prefix={<PhoneOutlined />} 
                placeholder="Ej: 0987654321" 
                maxLength={10}
                style={{ width: '100%' }}
              />
            </Form.Item>
            
            <Form.Item
              name="dni"
              label={<span className="font-medium">Cédula / RUC</span>}
              rules={[
                { pattern: /^\d{10}$/, message: "Debe tener 10 dígitos numéricos" },
              ]}
            >
              <Input 
                prefix={<IdcardOutlined />} 
                placeholder="Ej: 1712345678" 
                maxLength={10}
                style={{ width: '100%' }}
              />
            </Form.Item>
          </div>
          
          <Form.Item
            name="direccion"
            label={<span className="font-medium">Dirección</span>}
            rules={[{ max: 255, message: "Máximo 255 caracteres" }]}
          >
            <Input 
              prefix={<HomeOutlined />} 
              placeholder="Ej: Av. de los Shyris N24-120"
              style={{ width: '100%' }}
            />
          </Form.Item>
          
          <Form.Item
            name="foto_perfil"
            label={<span className="font-medium">Foto de perfil</span>}
          >
            <Upload {...uploadProps}>
              <Button icon={<UploadOutlined />}>Subir Foto</Button>
            </Upload>
          </Form.Item>
          
          {/* Sección de asignación de roles */}
          <div className="mt-4">
            <label className="block mb-2 font-medium">Roles asignados</label>
            <div className="flex flex-wrap gap-2 mb-4 p-3 border border-gray-200 rounded-md bg-white">
              {selectedRoles.length === 0 ? (
                <span className="text-gray-500">No hay roles asignados</span>
              ) : (
                selectedRoles.map(role => (
                  <MemoizedTag
                    key={role.id}
                    closable
                    onClose={() => handleRemoveRole(role.id)}
                    color="blue"
                    className="m-1"
                  >
                    {role.nombre}
                  </MemoizedTag>
                ))
              )}
            </div>
            
            <div className="flex gap-2 mt-3 mb-3">
              <Select
                placeholder="Seleccionar rol"
                value={selectedRole}
                onChange={setSelectedRole}
                style={{ width: '100%', maxWidth: '400px' }}
                allowClear
                dropdownStyle={{ minWidth: '200px' }}
              >
                {availableRoles.map(role => (
                  <Select.Option key={role.id} value={role.id}>
                    {role.nombre}
                  </Select.Option>
                ))}
              </Select>
              <Button 
                onClick={handleAddRole} 
                type="primary" 
                icon={<PlusOutlined />}
                className="ml-2"
              >
                Agregar
              </Button>
            </div>
            
            <div className="mt-2 p-3 bg-gray-100 rounded-md">
              <p className="text-sm text-gray-500 mb-1">
                <strong>Nota:</strong> Los usuarios pueden tener múltiples roles que definen sus permisos en el sistema.
              </p>
              <ul className="text-xs text-gray-500 list-disc pl-4">
                <li>Cada usuario debe tener al menos un rol asignado</li>
                <li>Los roles determinan qué acciones puede realizar un usuario</li>
                <li>Puede agregar o quitar roles según sea necesario</li>
              </ul>
            </div>
          </div>
        </Form>
      </Modal>

      {/* Estilos personalizados para tablas en modo oscuro */}
      <style jsx global>{`
        /* Estilos base de la tabla */
        .custom-table .ant-table {
          background-color: transparent !important;
          color: white !important;
        }
        
        /* Estilos del encabezado */
        .custom-table .ant-table-thead > tr > th {
          background-color: rgba(31, 41, 55, 0.7) !important;
          color: white !important;
          border-bottom: 1px solid rgba(75, 85, 99, 0.5) !important;
        }
        
        /* Estilos de las celdas */
        .custom-table .ant-table-tbody > tr > td {
          background-color: transparent !important;
          border-bottom: 1px solid rgba(75, 85, 99, 0.3) !important;
          color: rgba(229, 231, 235, 0.9) !important;
        }
        
        /* Estilos al pasar el cursor */
        .custom-table .ant-table-tbody > tr:hover > td {
          background-color: rgba(55, 65, 81, 0.5) !important;
          color: white !important;
        }
        
        /* Estilos para filas con cursor encima */
        .custom-table .ant-table-row:hover {
          background-color: rgba(55, 65, 81, 0.5) !important;
        }
        
        /* Estilos de paginación */
        .custom-table .ant-pagination {
          color: rgba(229, 231, 235, 0.9) !important;
        }
        
        .custom-table .ant-pagination-item a {
          color: rgba(229, 231, 235, 0.9) !important;
        }
        
        .custom-table .ant-pagination-item-active {
          background-color: rgba(79, 70, 229, 0.8) !important;
          border-color: rgba(79, 70, 229, 0.8) !important;
        }
        
        .custom-table .ant-pagination-item-active a {
          color: white !important;
        }
        
        .custom-table .ant-pagination-item-link {
          color: rgba(229, 231, 235, 0.9) !important;
        }
        
        .custom-table .ant-empty-description {
          color: rgba(229, 231, 235, 0.9) !important;
        }
        
        /* Prevenir comportamiento inconsistente */
        .custom-table .ant-table-tbody > tr.ant-table-row-selected > td {
          background-color: rgba(79, 70, 229, 0.3) !important;
        }
        
        /* Botones y acciones */
        .custom-table .ant-btn {
          background-color: transparent !important;
        }
        
        /* Asegurar que las filas impares/pares tengan el mismo fondo */
        .custom-table .ant-table-tbody > tr:nth-child(odd) > td,
        .custom-table .ant-table-tbody > tr:nth-child(even) > td {
          background-color: transparent !important;
        }
      `}</style>
    </div>
  );
};

const MemoizedCustomersPage = memo(CustomersPage);
MemoizedCustomersPage.displayName = "CustomersPage";
export default MemoizedCustomersPage;
