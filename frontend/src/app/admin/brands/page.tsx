"use client";

import { useState, useEffect } from "react";
import "../shared/dark-table.css";
import { Table, Button, Input, Modal, Form, message, Popconfirm, Tag, Tooltip } from "antd";
import type { TableColumnType } from "antd";
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  ExclamationCircleOutlined, 
  SearchOutlined,
  LinkOutlined
} from "@ant-design/icons";
import { getMarcasPaginadas, createMarca, updateMarca, deleteMarca } from "@/lib/api/marcaService";
import { Marca } from "@/types";

export default function BrandsPage() {
  const [brands, setBrands] = useState<Marca[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Marca | null>(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState("");

  // Cargar marcas al montar el componente o cambiar la paginación o búsqueda
  useEffect(() => {
    fetchBrands();
  }, [page, pageSize, searchText]);

  const fetchBrands = async () => {
    setLoading(true);
    try {
      const response = await getMarcasPaginadas(page, pageSize, searchText);
      if (response.ok && response.data) {
        setBrands(response.data.items);
        setTotal(response.data.total);
      } else {
        message.error(response.error || "Error al cargar las marcas");
      }
    } catch (error) {
      console.error("Error al cargar marcas:", error);
      message.error("Error al cargar las marcas");
    } finally {
      setLoading(false);
    }
  };

  // La búsqueda ahora se maneja automáticamente a través del useEffect cuando cambia searchText

  const showModal = (brand?: Marca) => {
    setEditingBrand(brand || null);
    form.resetFields();
    if (brand) {
      form.setFieldsValue({
        nombre: brand.nombre,
        descripcion: brand.descripcion || "",
        website: brand.website || "",
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

      // Ya no manejamos logos en esta versión

      let response;
      if (editingBrand) {
        response = await updateMarca(editingBrand.id, values);
      } else {
        response = await createMarca(values);
      }

      if (response.ok) {
        message.success(
          editingBrand
            ? "Marca actualizada correctamente"
            : "Marca creada correctamente"
        );
        setModalVisible(false);
        fetchBrands();
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
      const response = await deleteMarca(id);
      if (response.ok) {
        message.success("Marca eliminada correctamente");
        fetchBrands();
      } else {
        message.error(response.error || "Error al eliminar la marca");
      }
    } catch (error) {
      console.error("Error al eliminar marca:", error);
      message.error("Error al eliminar la marca");
    } finally {
      setLoading(false);
    }
  };

  // Configuración para carga de logo eliminada (planeada para versión futura)

  const columns = [
    // Columna de logo eliminada para la versión actual
    {
      title: "Nombre",
      dataIndex: "nombre",
      key: "nombre",
      sorter: (a: Marca, b: Marca) => a.nombre.localeCompare(b.nombre),
    },
    {
      title: "Descripción",
      dataIndex: "descripcion",
      key: "descripcion",
      ellipsis: true,
      render: (descripcion: string | null) => descripcion || "N/A",
    },
    {
      title: "Sitio Web",
      dataIndex: "website",
      key: "website",
      render: (website: string | null) =>
        website ? (
          <a 
            href={website} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 flex items-center gap-1"
          >
            <LinkOutlined /> Visitar
          </a>
        ) : (
          "N/A"
        ),
      responsive: ["lg" as any],
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
      onFilter: (value: any, record: Marca) => record.activo === value,
    },
    {
      title: "Acciones",
      key: "actions",
      render: (_: any, record: Marca) => (
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
            title="¿Estás seguro de eliminar esta marca?"
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
        <h1 className="text-2xl font-bold text-white">Gestión de Marcas</h1>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={() => showModal()}
          className="bg-indigo-600 hover:bg-indigo-700"
        >
          Nueva Marca
        </Button>
      </div>

      <div className="flex items-center justify-between mb-4">
        <Input
          prefix={<SearchOutlined style={{ color: '#aaa' }} />}
          placeholder="Buscar marca"
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
          dataSource={brands}
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
            showTotal: (total: number, range: number[]) => `${range[0]}-${range[1]} de ${total} marcas`,
          }}
        />
      </div>

      <Modal
        title={editingBrand ? "Editar Marca" : "Nueva Marca"}
        open={modalVisible}
        onCancel={handleCancel}
        footer={[
          <Button key="cancel" onClick={handleCancel}>
            Cancelar
          </Button>,
          <Button key="submit" type="primary" onClick={handleSubmit} loading={loading}>
            {editingBrand ? "Actualizar" : "Crear"}
          </Button>,
        ]}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="nombre"
            label="Nombre"
            rules={[
              { required: true, message: "Por favor ingresa el nombre de la marca" },
              { min: 2, message: "El nombre debe tener al menos 2 caracteres" },
            ]}
          >
            <Input placeholder="Ej: Ray-Ban" />
          </Form.Item>
          
          <Form.Item
            name="descripcion"
            label="Descripción"
          >
            <Input.TextArea 
              placeholder="Descripción de la marca" 
              rows={3}
              maxLength={500}
              showCount
            />
          </Form.Item>
          
          <Form.Item
            name="website"
            label="Sitio Web"
            rules={[
              { 
                pattern: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/, 
                message: "Por favor ingresa una URL válida" 
              },
            ]}
          >
            <Input placeholder="https://ejemplo.com" />
          </Form.Item>
          
          {/* Campo de logo eliminado para la versión actual */}
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
