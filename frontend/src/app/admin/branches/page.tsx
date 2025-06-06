"use client";

import React, { useState, useEffect, useCallback, useMemo, Suspense } from "react";
import dynamic from "next/dynamic";
import ResponsiveTable from "@/components/ui/ResponsiveTable"; // Importar ResponsiveTable

// Importaciones selectivas de Ant Design para reducir el tamaño del bundle
// Table ya no se importa directamente, CustomTable lo maneja
import Button from "antd/lib/button";
import Input from "antd/lib/input";
import Form from "antd/lib/form";
import message from "antd/lib/message";
import Popconfirm from "antd/lib/popconfirm";
import Tag from "antd/lib/tag";
import Tooltip from "antd/lib/tooltip";
import InputNumber from "antd/lib/input-number";
import Switch from "antd/lib/switch";
import type { ColumnType } from "antd/lib/table";

// Modal importado dinámicamente para reducir el bundle inicial
const Modal = dynamic(() => import("antd/lib/modal"), {
  ssr: false,
  loading: () => <div className="bg-gray-800 p-6 rounded-lg animate-pulse">Cargando...</div>
});

// Importación selectiva de iconos
import PlusOutlined from "@ant-design/icons/PlusOutlined";
import EditOutlined from "@ant-design/icons/EditOutlined";
import DeleteOutlined from "@ant-design/icons/DeleteOutlined";
import ExclamationCircleOutlined from "@ant-design/icons/ExclamationCircleOutlined";
import SearchOutlined from "@ant-design/icons/SearchOutlined";
import EnvironmentOutlined from "@ant-design/icons/EnvironmentOutlined";
import PhoneOutlined from "@ant-design/icons/PhoneOutlined";
import MailOutlined from "@ant-design/icons/MailOutlined";
import CheckOutlined from "@ant-design/icons/CheckOutlined";
import CloseOutlined from "@ant-design/icons/CloseOutlined";
import { getSucursalesPaginadas, createSucursal, updateSucursal, deleteSucursal } from "@/lib/api/sucursalService";
import { Sucursal } from "@/types";
import { debounce } from "@/utils/debounce";

export default function BranchesPage() {
  const [branches, setBranches] = useState<Sucursal[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Sucursal | null>(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState("");

  // Cargar sucursales al montar el componente o cambiar la paginación o búsqueda
  // 1. Memoiza la función, usando useCallback y pasando como dependencias los estados que usa
  const fetchBranches = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getSucursalesPaginadas(page, pageSize, searchText);
      if (response.ok && response.data) {
        setBranches(response.data.items);
        setTotal(response.data.total);
      } else {
        message.error(response.error || "Error al cargar las sucursales");
      }
    } catch (error) {
      console.error("Error al cargar sucursales:", error);
      message.error("Error al cargar las sucursales");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, searchText]);
  // ^^^^ ¡Esta es la parte importante!

  // 2. El useEffect solo depende de fetchBranches (la función memoizada)
  useEffect(() => {
    fetchBranches();
  }, [fetchBranches]);

  // La búsqueda se conectará a CustomTable y fetchBranches se activará cuando searchText cambie.
  const handleSearch = (value: string) => {
    setSearchText(value);
    setPage(1); // Reset page to 1 when searching
  };

  // Memoiza la función showModal para evitar recrearla en cada render
  const openModal = useCallback((branch?: Sucursal) => {
    form.resetFields();
    
    if (branch) {
      setEditingBranch(branch);
      form.setFieldsValue({
        nombre: branch.nombre,
        direccion: branch.direccion,
        telefono: branch.telefono,
        email: branch.email,
        latitud: branch.latitud,
        longitud: branch.longitud,
        activo: branch.activo !== undefined ? branch.activo : true,
      });
    } else {
      setEditingBranch(null);
      // Por defecto, las nuevas sucursales están activas
      form.setFieldsValue({ activo: true });
    }
    
    setModalVisible(true);
  }, [form]);

  // Memoiza handleCancel para evitar recreaciones innecesarias
  const handleCancel = useCallback(() => {
    setModalVisible(false);
  }, []);

  // Memoiza handleSubmit para mejorar rendimiento
  const handleSubmit = useCallback(async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      // Asegurar que el estado siempre sea true
      const formData = { ...values, activo: true };

      let response;
      if (editingBranch) {
        response = await updateSucursal(editingBranch.id, formData);
      } else {
        response = await createSucursal(formData);
      }

      if (response.ok) {
        message.success(
          editingBranch
            ? "Sucursal actualizada correctamente"
            : "Sucursal creada correctamente"
        );
        setModalVisible(false);
        fetchBranches();
      } else {
        message.error(response.error || "Error al procesar la solicitud");
      }
    } catch (error) {
      console.error("Error en el formulario:", error);
    } finally {
      setLoading(false);
    }
  }, [editingBranch, fetchBranches, form]);

  // Memoiza handleDelete para evitar recrearla en cada render
  const handleDelete = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const response = await deleteSucursal(id);
      if (response.ok) {
        message.success("Sucursal eliminada correctamente");
        fetchBranches();
      } else {
        message.error(response.error || "Error al eliminar la sucursal");
      }
    } catch (error) {
      console.error("Error al eliminar sucursal:", error);
      message.error("Error al eliminar la sucursal");
    } finally {
      setLoading(false);
    }
  }, [fetchBranches]);

  // Componentes memoizados para mejorar el rendimiento
  
  // Celda memoizada para dirección
  const AddressCell = React.memo(({ direccion }: { direccion: string }) => {
    return (
      <Tooltip title={direccion}>
        <div className="flex items-center gap-1">
          <EnvironmentOutlined className="text-red-400" />
          <span>{direccion}</span>
        </div>
      </Tooltip>
    );
  });
  AddressCell.displayName = "AddressCell";
  
  // Celda memoizada para contacto
  const ContactCell = React.memo(({ telefono, email }: { telefono: string; email: string }) => {
    return (
      <div className="space-y-1">
        <div className="flex items-center gap-1">
          <PhoneOutlined className="text-green-400" />
          <span>{telefono}</span>
        </div>
        <div className="flex items-center gap-1">
          <MailOutlined className="text-blue-400" />
          <span>{email}</span>
        </div>
      </div>
    );
  });
  ContactCell.displayName = "ContactCell";
  

  // Celda memoizada para acciones
  const ActionsCell = React.memo(({ record }: { record: Sucursal }) => {
    // En lugar de useCallback anidado, usamos funciones simples ya que el componente está memoizado
    const handleEdit = () => openModal(record);
    const handleDeleteConfirm = () => handleDelete(record.id);
    
    return (
      <div className="flex gap-2">
        <Tooltip title="Editar">
          <Button
            icon={<EditOutlined />}
            type="primary"
            size="small"
            ghost
            onClick={handleEdit}
          />
        </Tooltip>
        <Popconfirm
          title="¿Estás seguro de eliminar esta sucursal?"
          onConfirm={handleDeleteConfirm}
          okText="Sí"
          cancelText="No"
          icon={<ExclamationCircleOutlined style={{ color: "red" }} />}
        >
          <Button icon={<DeleteOutlined />} type="primary" size="small" danger />
        </Popconfirm>
      </div>
    );
  });
  ActionsCell.displayName = "ActionsCell";
  
  // Usamos useMemo para las columnas para evitar recalcularlas en cada render
  const columns = useMemo(() => [
    {
      title: "Nombre",
      dataIndex: "nombre",
      key: "nombre",
      sorter: (a: Sucursal, b: Sucursal) => a.nombre.localeCompare(b.nombre),
    },
    {
      title: "Dirección",
      dataIndex: "direccion",
      key: "direccion",
      ellipsis: true,
      render: (direccion: string) => <AddressCell direccion={direccion} />,
    },
    {
      title: "Contacto",
      key: "contacto",
      render: (_: any, record: Sucursal) => <ContactCell telefono={record.telefono} email={record.email} />,
      responsive: ["md" as any],
    },
    {
      title: "Acciones",
      key: "actions",
      render: (_: any, record: Sucursal) => <ActionsCell record={record} />,
    },
  ], [AddressCell, ContactCell, ActionsCell]);

  // Renderizado personalizado para móviles
  const mobileCardRender = useCallback((item: Sucursal) => {
    return (
      <div className="mobile-card bg-gray-800 rounded-lg p-4 mb-3 border border-gray-700">
        <div className="mobile-card-content">
          <div className="mobile-card-row">
            <span className="mobile-card-label">Nombre:</span>
            <span className="mobile-card-value font-medium">{item.nombre}</span>
          </div>
          <div className="mobile-card-row">
            <span className="mobile-card-label">Dirección:</span>
            <span className="mobile-card-value">{item.direccion}</span>
          </div>
          <div className="mobile-card-row">
            <span className="mobile-card-label">Teléfono:</span>
            <span className="mobile-card-value">{item.telefono}</span>
          </div>
          <div className="mobile-card-row">
            <span className="mobile-card-label">Email:</span>
            <span className="mobile-card-value">{item.email || 'N/A'}</span>
          </div>
          <div className="mobile-card-actions">
            <Tooltip title="Editar">
              <Button
                icon={<EditOutlined />}
                type="primary"
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  openModal(item);
                }}
                className="mr-2"
              />
            </Tooltip>
            <Popconfirm
              title="¿Estás seguro de eliminar esta sucursal?"
              onConfirm={(e) => {
                e?.stopPropagation();
                handleDelete(item.id);
              }}
              onCancel={(e) => e?.stopPropagation()}
              okText="Sí"
              cancelText="No"
              icon={<ExclamationCircleOutlined style={{ color: "red" }} />}
            >
              <Button 
                icon={<DeleteOutlined />} 
                type="primary" 
                size="small" 
                danger 
                onClick={(e) => e.stopPropagation()}
              />
            </Popconfirm>
          </div>
        </div>
      </div>
    );
  }, [openModal, handleDelete]);

  // Memoizamos los botones del footer del modal fuera del renderizado condicional
  const modalFooter = useMemo(() => [
    <Button key="cancel" onClick={handleCancel}>
      Cancelar
    </Button>,
    <Button key="submit" type="primary" onClick={handleSubmit} loading={loading}>
      {editingBranch ? "Actualizar" : "Crear"}
    </Button>,
  ], [handleCancel, handleSubmit, editingBranch, loading]);

  return (
    <div className="p-4 md:p-6 bg-gray-900 min-h-screen text-white">
<div className="responsive-table-container">
        <ResponsiveTable<Sucursal>
          columns={columns}
          dataSource={branches}
          loading={loading}
          rowKey="id"
          headerTitle="Gestión de Sucursales"
          showAddButton={true}
          onAddButtonClick={() => openModal()} 
          showSearch={true}
          onSearch={handleSearch} 
          searchPlaceholder="Buscar sucursal..."
          pagination={{
            current: page,
            pageSize: pageSize,
            total: total,
            onChange: (newPage, newPageSize) => {
              setPage(newPage);
              if (newPageSize) setPageSize(newPageSize);
            },
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} sucursales`,
            pageSizeOptions: ['5', '10', '20', '50'],
          }}
          className="responsive-table"
          mobileCardRender={mobileCardRender}
        />
      </div>

      {modalVisible && (
        <Modal
          title={editingBranch ? "Editar Sucursal" : "Nueva Sucursal"}
          open={modalVisible}
          onCancel={handleCancel}
          width={700}
          footer={modalFooter}
        >
          <Form form={form} layout="vertical">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Form.Item
                name="nombre"
                label="Nombre"
                rules={[
                  { required: true, message: "Por favor ingresa el nombre de la sucursal" },
                  { min: 3, message: "El nombre debe tener al menos 3 caracteres" },
                ]}
              >
                <Input placeholder="Ej: Sucursal Central" />
              </Form.Item>
              
              <Form.Item
                name="telefono"
                label="Teléfono"
                rules={[
                  { required: true, message: "Por favor ingresa el teléfono de la sucursal" },
                  { 
                    pattern: /^\d{10}$/, 
                    message: "El teléfono debe tener 10 dígitos" 
                  },
                ]}
              >
                <Input placeholder="Ej: 1234567890" />
              </Form.Item>
            </div>
            
            <Form.Item
              name="direccion"
              label="Dirección"
              rules={[
                { required: true, message: "Por favor ingresa la dirección de la sucursal" },
                { min: 5, message: "La dirección debe tener al menos 5 caracteres" },
              ]}
            >
              <Input.TextArea 
                placeholder="Dirección completa de la sucursal" 
                rows={2}
              />
            </Form.Item>
            
            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: "Por favor ingresa el email de la sucursal" },
                { 
                  type: 'email', 
                  message: "Por favor ingresa un email válido" 
                },
              ]}
            >
              <Input placeholder="Ej: sucursal@ejemplo.com" />
            </Form.Item>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Form.Item
                name="latitud"
                label="Latitud"
                rules={[
                  { required: true, message: "Por favor ingresa la latitud" },
                  { 
                    type: 'number', 
                    min: -90, 
                    max: 90, 
                    message: "La latitud debe estar entre -90 y 90" 
                  },
                ]}
              >
                <InputNumber 
                  placeholder="Ej: 19.4326" 
                  style={{ width: '100%' }}
                  step={0.0001}
                />
              </Form.Item>
              
              <Form.Item
                name="longitud"
                label="Longitud"
                rules={[
                  { required: true, message: "Por favor ingresa la longitud" },
                  { 
                    type: 'number', 
                    min: -180, 
                    max: 180, 
                    message: "La longitud debe estar entre -180 y 180" 
                  },
                ]}
              >
                <InputNumber 
                  placeholder="Ej: -99.1332" 
                  style={{ width: '100%' }}
                  step={0.0001}
                />
              </Form.Item>
            </div>
            
            {/* El campo activo ahora siempre será true y está oculto del formulario */}
            <Form.Item name="activo" hidden initialValue={true}>
              <Input type="hidden" />
            </Form.Item>
            
            <div className="mt-2 p-3 bg-gray-100 rounded-md">
              <p className="text-sm text-gray-500 mb-1">
                <strong>Nota:</strong> Puedes obtener las coordenadas exactas desde Google Maps:
              </p>
              <ol className="text-xs text-gray-500 list-decimal pl-4">
                <li>Busca la ubicación en Google Maps</li>
                <li>Haz clic derecho en el punto exacto</li>
                <li>Selecciona &quot;¿Qué hay aquí?&quot;</li>
                <li>En la tarjeta que aparece abajo encontrarás las coordenadas</li>
              </ol>
            </div>
          </Form>
        </Modal>
      )}
    </div>
  );
}

