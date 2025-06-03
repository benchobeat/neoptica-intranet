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
import LockOutlined from "@ant-design/icons/LockOutlined";
import InfoCircleOutlined from "@ant-design/icons/InfoCircleOutlined";
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

// Función para asignar colores a los roles
const getRoleColor = (roleName: string): string => {
  const roleColors: Record<string, string> = {
    'admin': 'magenta',
    'optometrista': 'blue',
    'vendedor': 'green',
    'cliente': 'cyan',
  };
  
  return roleColors[roleName.toLowerCase()] || 'blue';
};

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

// Componente para mostrar roles en la tabla (memoizado)
const RolesCell: React.FC<{ roles?: { id: string; nombre: string }[] }> = memo(({ roles }) => {
  // Añadir depuración
  console.log('[DEBUG] Renderizando RolesCell con roles:', roles);

  // Validar explícitamente que roles es un array no vacío
  if (!roles || !Array.isArray(roles) || roles.length === 0) {
    return <Tag color="default">Sin rol</Tag>;
  }

  // Filtrar roles vacíos o inválidos
  const validRoles = roles.filter(role => role && typeof role === 'object' && role.nombre);
  
  if (validRoles.length === 0) {
    return <Tag color="default">Sin rol</Tag>;
  }

  return (
    <div className="flex flex-wrap gap-1">
      {validRoles.map((role) => {
        let color;
        const roleName = role.nombre?.toLowerCase() || '';
        
        switch (roleName) {
          case 'admin':
          case 'administrador':
            color = 'red';
            break;
          case 'gerente':
            color = 'blue';
            break;
          case 'vendedor':
            color = 'green';
            break;
          default:
            color = 'default';
        }
        
        return (
          <Tag key={role.id || `role-${roleName}`} color={color}>
            {role.nombre}
          </Tag>
        );
      })}
    </div>
  );
});
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
        setCustomers(usuarios.map((user: any) => {
          // Normalizar roles
          let userRoles = [];
          
          // Si tiene roles como array
          if (Array.isArray(user.roles) && user.roles.length > 0) {
            userRoles = user.roles;
          }
          // Si tiene usuario_rol (formato respuesta directa de Prisma)
          else if (Array.isArray(user.usuario_rol) && user.usuario_rol.length > 0) {
            userRoles = user.usuario_rol.map((ur: any) => ({
              id: ur.rol?.id || ur.rol_id,
              nombre: ur.rol?.nombre || ''
            })).filter((r: any) => r.id && r.nombre);
          }
          // Si tiene rol como string, buscar en availableRoles y convertir
          else if (user.rol && typeof user.rol === 'string') {
            const matchedRole = availableRoles.find(r => 
              r.nombre.toLowerCase() === user.rol.toLowerCase() || r.id === user.rol
            );
            if (matchedRole) {
              userRoles = [matchedRole];
            } else {
              // Si no hay match, crear un objeto simple
              userRoles = [{ id: 'temp-id', nombre: user.rol }];
            }
          }
          
          // Asegurar que userRoles siempre sea un array válido para evitar "Sin rol"
          if (!Array.isArray(userRoles) || userRoles.length === 0) {
            console.log('[DEBUG] Usuario sin roles normalizados:', user);
          }
          
          // Agregar más información de depuración para identificar el problema
          console.log(`[DEBUG] Usuario ${user.nombre_completo} - Roles asignados:`, userRoles);
          
          return {
            id: user.id,
            nombre_completo: user.nombre_completo,
            email: user.email,
            telefono: user.telefono,
            dni: user.dni || '',
            direccion: user.direccion || '',
            foto_perfil: user.foto_perfil,
            activo: user.activo,
            roles: userRoles
          };
        }));
        
        // Establecer el total de registros
        setTotal(totalItems);
      }
    } catch (error) {
      console.error("Error al cargar usuarios:", error);
      message.error("Error al cargar los usuarios");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, searchText, availableRoles]);
  
  // Cargar roles (memoizado)
  const fetchRoles = useCallback(async () => {
    try {
      const response = await getRoles();
      if (response.ok && response.data) {
        console.log('[DEBUG] Roles disponibles cargados:', response.data);
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
    // Resetear formulario y selección
    form.resetFields();
    setEditingCustomer(customer || null);
    setSelectedRoles([]);
    setModalVisible(true); // Asegurar que el modal esté visible
    
    if (customer) {
      try {
        setLoading(true);
        const response = await getClienteById(customer.id);
        
        // Logs detallados para diagnóstico
        console.log("[DEBUG] Respuesta completa del usuario:", response);
        
        // Asegurar que la respuesta tiene el formato esperado
        const responseData = response as any; // Usar aserción de tipo para evitar errores
        if (responseData && responseData.data) {
          const userDetail = responseData.data;
          
          console.log("[DEBUG] Detalle del usuario:", userDetail);
          console.log("[DEBUG] Roles del usuario:", userDetail.roles);
          console.log("[DEBUG] Roles disponibles:", availableRoles);
          
          // Usar setTimeout para asegurar que el formulario esté completamente renderizado
          setTimeout(() => {
            form.setFieldsValue({
              nombre_completo: userDetail.nombre_completo || "",
              email: userDetail.email || "",
              telefono: userDetail.telefono || "",
              dni: userDetail.dni || "",
              direccion: userDetail.direccion || "",
              foto_perfil: userDetail.foto_perfil || "",
            });
            console.log("[DEBUG] Valores establecidos en el formulario:", form.getFieldsValue());
          }, 100);
          
          // Esperar a que availableRoles esté cargado
          if (!availableRoles || availableRoles.length === 0) {
            setSelectedRoles([]);
            message.warning("Roles aún no disponibles. Intenta de nuevo en unos segundos.");
            // Intentar cargar roles de nuevo
            fetchRoles();
          } else {
            // Manejar múltiples formatos posibles de roles
            let userRoles: any[] = [];
            
            // 1. Si userDetail.roles existe y es un array
            if (userDetail.roles && Array.isArray(userDetail.roles)) {
              userRoles = userDetail.roles;
            } 
            // 2. Si tiene usuario_rol (formato respuesta directa de Prisma)
            else if (userDetail.usuario_rol && Array.isArray(userDetail.usuario_rol) && userDetail.usuario_rol.length > 0) {
              console.log("[DEBUG] Encontrado formato usuario_rol en la respuesta", userDetail.usuario_rol);
              userRoles = userDetail.usuario_rol.map((ur: any) => {
                console.log("[DEBUG] Procesando usuario_rol:", ur);
                return {
                  id: ur.rol?.id || ur.rol_id,
                  nombre: ur.rol?.nombre || ''
                };
              }).filter((r: any) => r.id && r.nombre);
            }
            // 3. Si hay un solo rol como objeto
            else if (userDetail.rol && typeof userDetail.rol === 'object') {
              userRoles = [userDetail.rol];
            } 
            // 4. Si hay un solo rol como string o id
            else if (userDetail.rol) {
              userRoles = [{ id: userDetail.rol, nombre: userDetail.rol }];
            }
            
            console.log("[DEBUG] Roles normalizados para mapeo:", userRoles);
            
            if (userRoles.length > 0) {
              // Mapeo mejorado: intenta coincidir por id, nombre, o incluso valor string directo
              // Tipado explícito para el resultado del mapeo
              const rolesMatched = userRoles
                .map((ur: any) => {
                  // Si es un objeto con id
                  if (ur && ur.id) {
                    const match = availableRoles.find(ar => ar.id === ur.id);
                    if (match) return match;
                  }
                  
                  // Si es un objeto con nombre
                  if (ur && ur.nombre) {
                    const match = availableRoles.find(
                      ar => ar.nombre.toLowerCase() === ur.nombre.toLowerCase()
                    );
                    if (match) return match;
                  }
                  
                  // Si es un string (podría ser id o nombre)
                  if (typeof ur === 'string') {
                    // Intentar por id primero
                    let match = availableRoles.find(ar => ar.id === ur);
                    if (match) return match;
                    
                    // Luego por nombre
                    match = availableRoles.find(
                      ar => ar.nombre.toLowerCase() === ur.toLowerCase()
                    );
                    if (match) return match;
                  }
                  
                  return undefined;
                })
                // Filtro explícito para garantizar que no hay undefined
                .filter((role): role is {id: string; nombre: string} => role !== undefined);
              
              console.log("[DEBUG] Roles mapeados final:", rolesMatched);
              setSelectedRoles(rolesMatched);
              
              // Si no se encontró ninguna coincidencia pero había roles, mostrar advertencia
              if (rolesMatched.length === 0 && userRoles.length > 0) {
                message.warning(
                  "No se pudieron mapear los roles del usuario. Asigne los roles manualmente."
                );
              }
            } else {
              setSelectedRoles([]);
            }
          }
        }
      } catch (error) {
        console.error("Error al cargar los detalles del usuario:", error);
        message.error("Error al cargar detalles del usuario");
      } finally {
        setLoading(false);
      }
    }
    
    setModalVisible(true);
  }, [availableRoles, form, fetchRoles]);

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
      
      // Validar que se haya seleccionado al menos un rol
      if (selectedRoles.length === 0) {
        message.error("Debe seleccionar al menos un rol");
        return;
      }
      
      setLoading(true);
      
      // Preparar datos de usuario
      const userData = {
        ...values,
        // Asegurar que DNI y dirección no sean undefined
        dni: values.dni || '',
        direccion: values.direccion || '',
        // Ahora enviamos todos los roles como array de nombres, ya que el backend lo soporta
        roles: selectedRoles.map(role => role.nombre),
        activo: true
      };
      
      console.log("[DEBUG] Datos a enviar al backend:", userData);
      
      if (editingCustomer) {
        await updateCliente(editingCustomer.id, userData);
        message.success("Usuario actualizado correctamente");
      } else {
        // Para nuevos usuarios
        try {
          const createResponse = await createCliente({
            ...userData, 
            password: values.password // Tomar la contraseña ingresada por el usuario
          });
          
          // Usar aserción de tipo para evitar errores
          const createResponseData = createResponse as any;
          if (createResponseData.ok) {
            message.success("Usuario creado correctamente");
          } else {
            // Mensaje de error más detallado
            const errorMsg = createResponseData.error || "Error al crear el usuario";
            message.error(errorMsg);
            console.error("Error al crear usuario:", createResponseData);
          }
        } catch (error) {
          console.error("Excepción al crear usuario:", error);
          message.error("Error al crear el usuario: " + (error instanceof Error ? error.message : String(error)));
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

  // Configuración de columnas para el formulario (estructura más limpia)
  const formColumns = useMemo(() => {
    // Columnas para el formulario de edición (2 columnas)
    return {
      left: [
        { name: 'nombre_completo', label: 'Nombre completo' },
        { name: 'email', label: 'Email' },
        { name: 'telefono', label: 'Teléfono' },
      ],
      right: [
        { name: 'dni', label: 'Documento de identidad' },
        { name: 'direccion', label: 'Dirección' },
        // Si es creación, mostrar campo de contraseña
        ...(editingCustomer ? [] : [{ name: 'password', label: 'Contraseña' }]),
      ],
    };
  }, [editingCustomer]);
  
  // Función para manejar cambios en los roles seleccionados
  const handleRoleChange = useCallback((selectedRoleIds: string[]) => {
    // Mapear los IDs a objetos de rol completos
    const matchedRoles = selectedRoleIds
      .map(id => availableRoles.find(role => role.id === id))
      .filter((role): role is { id: string; nombre: string } => role !== undefined);
    
    setSelectedRoles(matchedRoles);
  }, [availableRoles]);

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
        destroyOnHidden
        width={700}
        footer={[
          <Button key="cancel" onClick={handleCancel}>
            Cancelar
          </Button>,
          <Button key="submit" type="primary" onClick={() => handleSubmit()} loading={loading}>
            {editingCustomer ? "Actualizar" : "Crear"}
          </Button>,
        ]}
      >
        <Form
          form={form}
          layout="vertical"
          preserve={false}
          name="userForm"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Columna izquierda */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold mb-3 text-gray-200">Información personal</h3>
              
              {formColumns.left.map(field => (
                <Form.Item
                  key={field.name}
                  name={field.name}
                  label={field.label}
                  rules={(() => {
                    const rules: any[] = [];
                    if (field.name === 'nombre_completo') {
                      rules.push({ required: true, message: "Ingrese el nombre completo" });
                    }
                    if (field.name === 'email') {
                      rules.push({ required: true, message: "Ingrese el email" });
                      rules.push({ type: "email", message: "Ingrese un email válido" });
                    }
                    if (field.name === 'telefono') {
                      rules.push({ pattern: /^\d{10}$/, message: "Ingrese un número de 10 dígitos" });
                    }
                    return rules;
                  })()}
                >
                  <Input 
                    prefix={
                      field.name === 'nombre_completo' ? <UserOutlined /> :
                      field.name === 'email' ? <MailOutlined /> :
                      field.name === 'telefono' ? <PhoneOutlined /> :
                      <UserOutlined />
                    } 
                    placeholder={field.label} 
                  />
                </Form.Item>
              ))}
            </div>
            
            {/* Columna derecha */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold mb-3 text-gray-200">Datos adicionales</h3>
              
              {formColumns.right.map(field => (
                <Form.Item
                  key={field.name}
                  name={field.name}
                  label={field.label}
                  rules={(() => {
                    const rules: any[] = [];
                    if (field.name === 'password') {
                      rules.push({ required: true, message: "Ingrese una contraseña" });
                      rules.push({ min: 8, message: "Mínimo 8 caracteres" });
                      rules.push({ 
                        pattern: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/,
                        message: "Debe contener letras y números"
                      });
                    }
                    return rules;
                  })()}
                >
                  {field.name === 'password' ? (
                    <Input.Password 
                      prefix={<LockOutlined />} 
                      placeholder="Contraseña"
                      autoComplete="new-password"
                    />
                  ) : (
                    <Input 
                      prefix={
                        field.name === 'dni' ? <IdcardOutlined /> :
                        field.name === 'direccion' ? <HomeOutlined /> :
                        <UserOutlined />
                      } 
                      placeholder={field.label} 
                    />
                  )}
                </Form.Item>
              ))}
            </div>
          </div>
          
          <div className="mt-4">
            <h3 className="text-lg font-semibold mb-3 text-gray-200">Roles de usuario</h3>
            
            <Form.Item
              label="Roles"
              rules={[{ required: true, message: "Seleccione al menos un rol" }]}
            >
              <Select
                mode="multiple"
                placeholder="Seleccionar roles"
                value={selectedRoles.map(role => role.id)}
                onChange={handleRoleChange}
                loading={!availableRoles || availableRoles.length === 0}
                optionFilterProp="label"
                className="w-full"
                options={availableRoles.map(role => ({
                  value: role.id,
                  label: role.nombre,
                }))}
              />
              {/* Ya se pueden asignar múltiples roles */}
            </Form.Item>
            
            <div className="mt-4 bg-gray-800/70 p-3 rounded-md">
              <h4 className="text-sm font-semibold text-gray-300 mb-1">Información sobre roles:</h4>
              <ul className="text-xs text-gray-400 list-disc pl-4">
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
