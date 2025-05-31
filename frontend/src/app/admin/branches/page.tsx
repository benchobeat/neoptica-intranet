"use client";

import { useState, useEffect } from "react";
import "../shared/dark-table.css";
import { Table, Button, Input, Modal, Form, message, Popconfirm, Tag, Tooltip, InputNumber } from "antd";
import type { TableColumnType } from "antd";
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  ExclamationCircleOutlined, 
  SearchOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  MailOutlined
} from "@ant-design/icons";
import { getSucursalesPaginadas, createSucursal, updateSucursal, deleteSucursal } from "@/lib/api/sucursalService";
import { Sucursal } from "@/types";

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
  useEffect(() => {
    fetchBranches();
  }, [page, pageSize, searchText]);

  const fetchBranches = async () => {
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
  };

  // La búsqueda ahora se maneja automáticamente a través del useEffect cuando cambia searchText

  const showModal = (branch?: Sucursal) => {
    setEditingBranch(branch || null);
    form.resetFields();
    if (branch) {
      form.setFieldsValue({
        nombre: branch.nombre,
        direccion: branch.direccion,
        telefono: branch.telefono,
        email: branch.email,
        latitud: branch.latitud,
        longitud: branch.longitud,
      });
    }
    setModalVisible(true);
  };

  const handleCancel = () => {
    setModalVisible(false);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      let response;
      if (editingBranch) {
        response = await updateSucursal(editingBranch.id, values);
      } else {
        response = await createSucursal(values);
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
  };

  const handleDelete = async (id: string) => {
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
  };

  const columns = [
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
      render: (direccion: string) => (
        <Tooltip title={direccion}>
          <div className="flex items-center gap-1">
            <EnvironmentOutlined className="text-red-400" />
            <span>{direccion}</span>
          </div>
        </Tooltip>
      ),
    },
    {
      title: "Contacto",
      key: "contacto",
      render: (_: any, record: Sucursal) => (
        <div className="space-y-1">
          <div className="flex items-center gap-1">
            <PhoneOutlined className="text-green-400" />
            <span>{record.telefono}</span>
          </div>
          <div className="flex items-center gap-1">
            <MailOutlined className="text-blue-400" />
            <span>{record.email}</span>
          </div>
        </div>
      ),
      responsive: ["md" as any],
    },
    {
      title: "Estado",
      dataIndex: "activo",
      key: "activo",
      render: (activo: boolean) =>
        activo ? (
          <Tag color="green">Activo</Tag>
        ) : (
          <Tag color="red">Inactivo</Tag>
        ),
      filters: [
        { text: "Activo", value: true },
        { text: "Inactivo", value: false },
      ],
      onFilter: (value: any, record: Sucursal) => record.activo === value,
    },
    {
      title: "Acciones",
      key: "actions",
      render: (_: any, record: Sucursal) => (
        <div className="flex gap-2">
          <Tooltip title="Editar">
            <Button
              icon={<EditOutlined />}
              type="primary"
              size="small"
              ghost
              onClick={() => showModal(record)}
            />
          </Tooltip>
          <Popconfirm
            title="¿Estás seguro de eliminar esta sucursal?"
            onConfirm={() => handleDelete(record.id)}
            okText="Sí"
            cancelText="No"
            icon={<ExclamationCircleOutlined style={{ color: "red" }} />}
          >
            <Button icon={<DeleteOutlined />} type="primary" size="small" danger />
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Gestión de Sucursales</h1>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={() => showModal()}
          className="bg-indigo-600 hover:bg-indigo-700"
        >
          Nueva Sucursal
        </Button>
      </div>

      <div className="flex items-center justify-between mb-4">
        <Input
          prefix={<SearchOutlined style={{ color: '#aaa' }} />}
          placeholder="Buscar sucursal"
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
          columns={columns}
          dataSource={branches}
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
            showTotal: (total: number, range: number[]) => `${range[0]}-${range[1]} de ${total} sucursales`,
          }}
        />
      </div>

      <Modal
        title={editingBranch ? "Editar Sucursal" : "Nueva Sucursal"}
        open={modalVisible}
        onCancel={handleCancel}
        width={700}
        footer={[
          <Button key="cancel" onClick={handleCancel}>
            Cancelar
          </Button>,
          <Button key="submit" type="primary" onClick={handleSubmit} loading={loading}>
            {editingBranch ? "Actualizar" : "Crear"}
          </Button>,
        ]}
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
                step="0.0001"
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
                step="0.0001"
              />
            </Form.Item>
          </div>
          
          <div className="mt-2 p-3 bg-gray-100 rounded-md">
            <p className="text-sm text-gray-500 mb-1">
              <strong>Nota:</strong> Puedes obtener las coordenadas exactas desde Google Maps:
            </p>
            <ol className="text-xs text-gray-500 list-decimal pl-4">
              <li>Busca la ubicación en Google Maps</li>
              <li>Haz clic derecho en el punto exacto</li>
              <li>Selecciona "¿Qué hay aquí?"</li>
              <li>En la tarjeta que aparece abajo encontrarás las coordenadas</li>
            </ol>
          </div>
        </Form>
      </Modal>

      {/* Estilos personalizados para tablas en modo oscuro */}
      <style jsx global>{`
        .custom-table .ant-table {
          background-color: transparent;
          color: white;
        }
        .custom-table .ant-table-thead > tr > th {
          background-color: rgba(31, 41, 55, 0.7);
          color: white;
          border-bottom: 1px solid rgba(75, 85, 99, 0.5);
        }
        .custom-table .ant-table-tbody > tr > td {
          border-bottom: 1px solid rgba(75, 85, 99, 0.3);
          color: rgba(229, 231, 235, 0.9);
        }
        .custom-table .ant-table-tbody > tr:hover > td {
          background-color: rgba(55, 65, 81, 0.5);
        }
        .custom-table .ant-pagination {
          color: rgba(229, 231, 235, 0.9);
        }
        .custom-table .ant-pagination-item a {
          color: rgba(229, 231, 235, 0.9);
        }
        .custom-table .ant-pagination-item-active {
          background-color: rgba(79, 70, 229, 0.8);
          border-color: rgba(79, 70, 229, 0.8);
        }
        .custom-table .ant-pagination-item-active a {
          color: white;
        }
        .custom-table .ant-pagination-item-link {
          color: rgba(229, 231, 235, 0.9);
        }
        .custom-table .ant-empty-description {
          color: rgba(229, 231, 235, 0.9);
        }
      `}</style>
    </div>
  );
}
